@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.lawntracker.state

import com.github.michaelbull.result.Err
import com.github.michaelbull.result.Ok
import com.github.michaelbull.result.Result
import com.github.michaelbull.result.map
import com.lawntracker.MAX_HISTORY_DAYS
import com.lawntracker.addDaysUnixMs
import com.lawntracker.differenceInCalendarDays
import com.lawntracker.formatFixed
import com.lawntracker.formatLocaleDateString
import com.lawntracker.knowledge.calcGddTotal
import com.lawntracker.startOfDayUnixMs
import kotlinx.datetime.Clock
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator
import kotlin.uuid.Uuid

const val MAX_DESC_LENGTH = 40
const val MAX_NAME_LENGTH = 20

@Serializable
enum class TrackerStatus {
    Stopped,
    Running,
}

@Serializable
enum class TrackerKind {
    @SerialName("gdd")
    Gdd,

    @SerialName("timed")
    Timed,

    @SerialName("calendar")
    Calendar,
}

@Serializable
enum class NotificationActiveStatus {
    Active,
    Cleared,
}

@Serializable
data class NotificationStatus(
    val lastCheckedUnixMs: Long? = null,
    val lastNotificationId: Int? = null,
    val lastNotificationStatus: NotificationActiveStatus? = null,
)

fun newNotificationStatus(): NotificationStatus =
    NotificationStatus(
        lastCheckedUnixMs = null,
        lastNotificationId = null,
        lastNotificationStatus = null,
    )

@OptIn(ExperimentalSerializationApi::class)
@Serializable
@JsonClassDiscriminator("kind")
sealed interface Tracker {
    val name: String
    val description: String
    val uuid: String
    val trackerStatus: TrackerStatus
    val lastSnoozedUnixMs: Long?
    val notificationStatus: NotificationStatus
    val kind: TrackerKind
}

@Serializable
@SerialName("gdd")
data class GddTracker(
    override val name: String,
    override val description: String,
    override val uuid: String,
    override val trackerStatus: TrackerStatus,
    override val lastSnoozedUnixMs: Long? = null,
    override val notificationStatus: NotificationStatus,
    val target_gdd: Double,
    val base_temp: Double,
    val start_date_unix_ms: Long,
    val locationId: Int,
) : Tracker {
    override val kind: TrackerKind get() = TrackerKind.Gdd
}

@Serializable
@SerialName("calendar")
data class CalendarTracker(
    override val name: String,
    override val description: String,
    override val uuid: String,
    override val trackerStatus: TrackerStatus,
    override val lastSnoozedUnixMs: Long? = null,
    override val notificationStatus: NotificationStatus,
    val target_date_unix_ms: Long,
) : Tracker {
    override val kind: TrackerKind get() = TrackerKind.Calendar
}

@Serializable
@SerialName("timed")
data class TimedTracker(
    override val name: String,
    override val description: String,
    override val uuid: String,
    override val trackerStatus: TrackerStatus,
    override val lastSnoozedUnixMs: Long? = null,
    override val notificationStatus: NotificationStatus,
    val start_date_unix_ms: Long,
    val duration_days: Int,
) : Tracker {
    override val kind: TrackerKind get() = TrackerKind.Timed
}

@Serializable
data class Trackers(
    val apiVersion: SchemaVersion = SchemaVersion.V0_1,
    val trackers: List<Tracker>,
)

@Serializable
sealed interface AddTrackerInput {
    val kind: TrackerKind
    val name: String
    val description: String
}

@Serializable
data class AddGddTrackerInput(
    override val name: String,
    override val description: String,
    val target_gdd: String,
    val base_temp: String,
    val start_date_unix_ms: Long?,
    val locationId: Int,
) : AddTrackerInput {
    override val kind: TrackerKind get() = TrackerKind.Gdd
}

@Serializable
data class AddCalendarTrackerInput(
    override val name: String,
    override val description: String,
    val target_date_unix_ms: Long?,
) : AddTrackerInput {
    override val kind: TrackerKind get() = TrackerKind.Calendar
}

@Serializable
data class AddTimedTrackerInput(
    override val name: String,
    override val description: String,
    val start_date_unix_ms: Long?,
    val duration_days: String,
) : AddTrackerInput {
    override val kind: TrackerKind get() = TrackerKind.Timed
}

sealed interface AddTracker {
    val kind: TrackerKind
    val name: String
    val description: String
}

data class ValidAddGddTracker(
    override val name: String,
    override val description: String,
    val target_gdd: Double,
    val base_temp: Double,
    val start_date_unix_ms: Long,
    val locationId: Int,
) : AddTracker {
    override val kind: TrackerKind get() = TrackerKind.Gdd
}

data class ValidAddCalendarTracker(
    override val name: String,
    override val description: String,
    val target_date_unix_ms: Long,
) : AddTracker {
    override val kind: TrackerKind get() = TrackerKind.Calendar
}

data class ValidAddTimedTracker(
    override val name: String,
    override val description: String,
    val start_date_unix_ms: Long,
    val duration_days: Int,
) : AddTracker {
    override val kind: TrackerKind get() = TrackerKind.Timed
}

fun validateTrackerName(name: String): Result<String, List<String>> {
    val issues = mutableListOf<String>()
    if (name.isEmpty()) issues.add("Name is mandatory")
    if (name.length > MAX_NAME_LENGTH) issues.add("Name must be less than $MAX_NAME_LENGTH characters")
    return if (issues.isEmpty()) Ok(name) else Err(issues)
}

fun validateTrackerDesc(desc: String): Result<String, List<String>> =
    if (desc.length > MAX_DESC_LENGTH) {
        Err(listOf("Description must be less than $MAX_DESC_LENGTH characters"))
    } else {
        Ok(desc)
    }

fun validateAddGddTrackerStartDate(
    dateUnixMs: Long?,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Result<Long, List<String>> {
    val resolved = dateUnixMs ?: nowUnixMs
    val minAllowed = addDaysUnixMs(startOfDayUnixMs(nowUnixMs), -MAX_HISTORY_DAYS)
    return if (resolved < minAllowed) {
        Err(listOf("Start date cannot be more than $MAX_HISTORY_DAYS days in the past"))
    } else {
        Ok(resolved)
    }
}

fun validateAddCalendarTrackerStartDate(
    dateUnixMs: Long?,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Result<Long, List<String>> {
    val resolved = dateUnixMs ?: nowUnixMs
    val minAllowed = startOfDayUnixMs(nowUnixMs)
    return if (resolved < minAllowed) {
        Err(listOf("Calendar tracker date must be in the future"))
    } else {
        Ok(resolved)
    }
}

fun validateAddTimedTrackerStartDate(
    dateUnixMs: Long?,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Result<Long, List<String>> = Ok(dateUnixMs ?: nowUnixMs)

fun validatePositiveIntegerString(
    raw: String,
    mandatoryMsg: String,
    notNumberMsg: String = "Not a number",
): Result<Int, List<String>> {
    if (raw.isEmpty()) return Err(listOf(mandatoryMsg))
    val asDouble = raw.toDoubleOrNull()?.takeIf { it.isFinite() } ?: return Err(listOf(notNumberMsg))
    val asInt = raw.toIntOrNull() ?: return Err(listOf("Whole numbers only"))
    if (asDouble != asInt.toDouble()) return Err(listOf("Whole numbers only"))
    if (asInt < 0) return Err(listOf("Number too low"))
    return Ok(asInt)
}

fun validateAddGddTrackerTarget(raw: String): Result<Double, List<String>> =
    validatePositiveIntegerString(raw, mandatoryMsg = "Target is mandatory").map { it.toDouble() }

fun validateAddTimedTrackerDurationDays(raw: String): Result<Int, List<String>> =
    validatePositiveIntegerString(raw, mandatoryMsg = "Duration is mandatory")

fun validateAddTrackerInput(
    input: AddTrackerInput,
    locations: List<Location>? = null,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Result<AddTracker, List<String>> {
    val issues = mutableListOf<String>()
    val nameRes = validateTrackerName(input.name)
    if (nameRes.isErr) issues.addAll(nameRes.error)
    val descRes = validateTrackerDesc(input.description)
    if (descRes.isErr) issues.addAll(descRes.error)

    when (input) {
        is AddGddTrackerInput -> {
            val targetRes = validateAddGddTrackerTarget(input.target_gdd)
            val dateRes = validateAddGddTrackerStartDate(input.start_date_unix_ms, nowUnixMs)
            val baseTemp = input.base_temp.toDoubleOrNull()?.takeIf { it.isFinite() }
            if (targetRes.isErr) issues.addAll(targetRes.error)
            if (dateRes.isErr) issues.addAll(dateRes.error)
            if (baseTemp == null) issues.add("Base temp must be a number")
            if (input.locationId < 0 || (locations != null && locations.none { it.apiId == input.locationId })) {
                issues.add("Location is mandatory")
            }
            if (issues.isNotEmpty() || baseTemp == null) return Err(issues)
            return Ok(
                ValidAddGddTracker(
                    name = nameRes.value,
                    description = descRes.value,
                    target_gdd = targetRes.value,
                    base_temp = baseTemp,
                    start_date_unix_ms = dateRes.value,
                    locationId = input.locationId,
                ),
            )
        }
        is AddCalendarTrackerInput -> {
            val dateRes = validateAddCalendarTrackerStartDate(input.target_date_unix_ms, nowUnixMs)
            if (dateRes.isErr) issues.addAll(dateRes.error)
            if (issues.isNotEmpty()) return Err(issues)
            return Ok(
                ValidAddCalendarTracker(
                    name = nameRes.value,
                    description = descRes.value,
                    target_date_unix_ms = dateRes.value,
                ),
            )
        }
        is AddTimedTrackerInput -> {
            val dateRes = validateAddTimedTrackerStartDate(input.start_date_unix_ms, nowUnixMs)
            val durRes = validateAddTimedTrackerDurationDays(input.duration_days)
            if (dateRes.isErr) issues.addAll(dateRes.error)
            if (durRes.isErr) issues.addAll(durRes.error)
            if (issues.isNotEmpty()) return Err(issues)
            return Ok(
                ValidAddTimedTracker(
                    name = nameRes.value,
                    description = descRes.value,
                    start_date_unix_ms = dateRes.value,
                    duration_days = durRes.value,
                ),
            )
        }
    }
}

sealed interface TrackerStatusCheck {
    val trackerKind: TrackerKind
    val trackerName: String
    val trackerId: String

    data class Stopped(
        override val trackerKind: TrackerKind,
        override val trackerName: String,
        override val trackerId: String,
    ) : TrackerStatusCheck

    data class Snoozed(
        override val trackerKind: TrackerKind,
        override val trackerName: String,
        override val trackerId: String,
    ) : TrackerStatusCheck

    data class ErrorCalculatingGdd(
        override val trackerKind: TrackerKind,
        override val trackerName: String,
        override val trackerId: String,
    ) : TrackerStatusCheck

    data class Running(
        override val trackerKind: TrackerKind,
        override val trackerName: String,
        override val trackerId: String,
        val stringTarget: String,
        val stringActual: String,
    ) : TrackerStatusCheck

    data class TargetReached(
        override val trackerKind: TrackerKind,
        override val trackerName: String,
        override val trackerId: String,
        val stringTarget: String,
        val stringActual: String,
    ) : TrackerStatusCheck
}

data class DefaultAddTrackerInputProps(
    val kind: TrackerKind,
    val locationId: Int,
    val baseTemp: Int,
)

fun getEditTrackerInput(tracker: Tracker): AddTrackerInput =
    when (tracker) {
        is GddTracker -> AddGddTrackerInput(
            name = tracker.name,
            description = tracker.description,
            start_date_unix_ms = tracker.start_date_unix_ms,
            locationId = tracker.locationId,
            base_temp = formatFixed(tracker.base_temp, 0),
            target_gdd = formatFixed(tracker.target_gdd, 0),
        )
        is TimedTracker -> AddTimedTrackerInput(
            name = tracker.name,
            description = tracker.description,
            start_date_unix_ms = tracker.start_date_unix_ms,
            duration_days = tracker.duration_days.toString(),
        )
        is CalendarTracker -> AddCalendarTrackerInput(
            name = tracker.name,
            description = tracker.description,
            target_date_unix_ms = tracker.target_date_unix_ms,
        )
    }

fun defaultAddTrackerInput(
    props: DefaultAddTrackerInputProps,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): AddTrackerInput =
    when (props.kind) {
        TrackerKind.Gdd -> AddGddTrackerInput(
            name = "",
            description = "",
            start_date_unix_ms = nowUnixMs,
            locationId = props.locationId,
            base_temp = props.baseTemp.toString(),
            target_gdd = "",
        )
        TrackerKind.Timed -> AddTimedTrackerInput(
            name = "",
            description = "",
            start_date_unix_ms = nowUnixMs,
            duration_days = "",
        )
        TrackerKind.Calendar -> AddCalendarTrackerInput(
            name = "",
            description = "",
            target_date_unix_ms = nowUnixMs,
        )
    }

fun editTracker(
    tracker: Tracker,
    editTracker: AddTracker,
): Tracker =
    when (tracker) {
        is GddTracker -> if (editTracker is ValidAddGddTracker) {
            tracker.copy(
                start_date_unix_ms = editTracker.start_date_unix_ms,
                name = editTracker.name,
                description = editTracker.description,
                locationId = editTracker.locationId,
                target_gdd = editTracker.target_gdd,
                base_temp = editTracker.base_temp,
            )
        } else {
            tracker
        }
        is TimedTracker -> if (editTracker is ValidAddTimedTracker) {
            tracker.copy(
                start_date_unix_ms = editTracker.start_date_unix_ms,
                name = editTracker.name,
                description = editTracker.description,
                duration_days = editTracker.duration_days,
            )
        } else {
            tracker
        }
        is CalendarTracker -> if (editTracker is ValidAddCalendarTracker) {
            tracker.copy(
                target_date_unix_ms = editTracker.target_date_unix_ms,
                name = editTracker.name,
                description = editTracker.description,
            )
        } else {
            tracker
        }
    }

fun newTracker(addTracker: AddTracker): Tracker =
    when (addTracker) {
        is ValidAddGddTracker -> newGddTracker(
            name = addTracker.name,
            description = addTracker.description,
            locationId = addTracker.locationId,
            target_gdd = addTracker.target_gdd,
            base_temp = addTracker.base_temp,
            start_date_unix_ms = addTracker.start_date_unix_ms,
        )
        is ValidAddTimedTracker -> newTimedTracker(
            name = addTracker.name,
            description = addTracker.description,
            start_date_unix_ms = addTracker.start_date_unix_ms,
            duration_days = addTracker.duration_days,
        )
        is ValidAddCalendarTracker -> newCalendarTracker(
            name = addTracker.name,
            description = addTracker.description,
            target_date_unix_ms = addTracker.target_date_unix_ms,
        )
    }

fun newGddTracker(
    name: String,
    description: String,
    locationId: Int,
    target_gdd: Double,
    base_temp: Double,
    start_date_unix_ms: Long,
): GddTracker =
    GddTracker(
        locationId = locationId,
        description = description,
        name = name,
        uuid = Uuid.random().toString(),
        target_gdd = target_gdd,
        base_temp = base_temp,
        start_date_unix_ms = start_date_unix_ms,
        trackerStatus = TrackerStatus.Running,
        notificationStatus = newNotificationStatus(),
    )

fun newCalendarTracker(
    name: String,
    description: String,
    target_date_unix_ms: Long,
): CalendarTracker =
    CalendarTracker(
        description = description,
        name = name,
        uuid = Uuid.random().toString(),
        target_date_unix_ms = target_date_unix_ms,
        trackerStatus = TrackerStatus.Running,
        notificationStatus = newNotificationStatus(),
    )

fun newTimedTracker(
    name: String,
    description: String,
    start_date_unix_ms: Long,
    duration_days: Int,
): TimedTracker =
    TimedTracker(
        description = description,
        name = name,
        uuid = Uuid.random().toString(),
        start_date_unix_ms = start_date_unix_ms,
        duration_days = duration_days,
        trackerStatus = TrackerStatus.Running,
        notificationStatus = newNotificationStatus(),
    )

fun getTrackerType(tracker: Tracker): String =
    when (tracker) {
        is CalendarTracker -> "Calendar"
        is TimedTracker -> "Timed"
        is GddTracker -> "Gdd"
    }

fun resetTracker(
    tracker: Tracker,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Tracker =
    when (tracker) {
        is CalendarTracker -> tracker
        is GddTracker -> tracker.copy(start_date_unix_ms = nowUnixMs)
        is TimedTracker -> tracker.copy(start_date_unix_ms = nowUnixMs)
    }

fun stopTracker(tracker: Tracker): Tracker =
    when (tracker) {
        is CalendarTracker -> tracker.copy(trackerStatus = TrackerStatus.Stopped)
        is GddTracker -> tracker.copy(trackerStatus = TrackerStatus.Stopped)
        is TimedTracker -> tracker.copy(trackerStatus = TrackerStatus.Stopped)
    }

fun snoozeTracker(
    tracker: Tracker,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Tracker =
    when (tracker) {
        is CalendarTracker -> tracker.copy(lastSnoozedUnixMs = nowUnixMs)
        is GddTracker -> tracker.copy(lastSnoozedUnixMs = nowUnixMs)
        is TimedTracker -> tracker.copy(lastSnoozedUnixMs = nowUnixMs)
    }

fun cancelSnoozeTracker(tracker: Tracker): Tracker =
    when (tracker) {
        is CalendarTracker -> tracker.copy(lastSnoozedUnixMs = null)
        is GddTracker -> tracker.copy(lastSnoozedUnixMs = null)
        is TimedTracker -> tracker.copy(lastSnoozedUnixMs = null)
    }

fun resumeTracker(
    tracker: Tracker,
    nowUnixMs: Long = Clock.System.now().toEpochMilliseconds(),
): Tracker =
    when (val reset = resetTracker(tracker, nowUnixMs)) {
        is CalendarTracker -> reset.copy(trackerStatus = TrackerStatus.Running)
        is GddTracker -> reset.copy(trackerStatus = TrackerStatus.Running)
        is TimedTracker -> reset.copy(trackerStatus = TrackerStatus.Running)
    }

fun trackerStatus(
    tracker: Tracker,
    curDateUnixMs: Long,
    locations: List<Location>,
    algorithm: GddAlgorithm,
): TrackerStatusCheck {
    if (tracker.trackerStatus == TrackerStatus.Stopped) {
        return TrackerStatusCheck.Stopped(
            trackerKind = tracker.kind,
            trackerName = tracker.name,
            trackerId = tracker.uuid,
        )
    }
    val snoozedMs = tracker.lastSnoozedUnixMs
    if (snoozedMs != null && differenceInCalendarDays(curDateUnixMs, snoozedMs) <= 0) {
        return TrackerStatusCheck.Snoozed(
            trackerKind = tracker.kind,
            trackerName = tracker.name,
            trackerId = tracker.uuid,
        )
    }
    return when (tracker) {
        is CalendarTracker -> {
            val target = tracker.target_date_unix_ms
            val stringTarget = formatLocaleDateString(target)
            val stringActual = formatLocaleDateString(curDateUnixMs)
            if (target <= curDateUnixMs) {
                TrackerStatusCheck.TargetReached(
                    trackerKind = tracker.kind,
                    trackerName = tracker.name,
                    trackerId = tracker.uuid,
                    stringTarget = stringTarget,
                    stringActual = stringActual,
                )
            } else {
                TrackerStatusCheck.Running(
                    trackerKind = tracker.kind,
                    trackerName = tracker.name,
                    trackerId = tracker.uuid,
                    stringTarget = stringTarget,
                    stringActual = stringActual,
                )
            }
        }
        is GddTracker -> {
            val actualGdd = calcGddTotal(tracker, locations, algorithm)
            if (actualGdd.isErr) {
                TrackerStatusCheck.ErrorCalculatingGdd(
                    trackerKind = tracker.kind,
                    trackerName = tracker.name,
                    trackerId = tracker.uuid,
                )
            } else {
                val total = actualGdd.value
                val target = tracker.target_gdd
                val stringActual = total.toString()
                val stringTarget = formatFixed(target, 0)
                if (target <= total) {
                    TrackerStatusCheck.TargetReached(
                        trackerKind = tracker.kind,
                        trackerName = tracker.name,
                        trackerId = tracker.uuid,
                        stringActual = stringActual,
                        stringTarget = stringTarget,
                    )
                } else {
                    TrackerStatusCheck.Running(
                        trackerKind = tracker.kind,
                        trackerName = tracker.name,
                        trackerId = tracker.uuid,
                        stringActual = stringActual,
                        stringTarget = stringTarget,
                    )
                }
            }
        }
        is TimedTracker -> {
            val target = addDaysUnixMs(tracker.start_date_unix_ms, tracker.duration_days)
            val stringTarget = formatLocaleDateString(target)
            val stringActual = formatLocaleDateString(curDateUnixMs)
            if (target <= curDateUnixMs) {
                TrackerStatusCheck.TargetReached(
                    trackerKind = tracker.kind,
                    trackerName = tracker.name,
                    trackerId = tracker.uuid,
                    stringTarget = stringTarget,
                    stringActual = stringActual,
                )
            } else {
                TrackerStatusCheck.Running(
                    trackerKind = tracker.kind,
                    trackerName = tracker.name,
                    trackerId = tracker.uuid,
                    stringTarget = stringTarget,
                    stringActual = stringActual,
                )
            }
        }
    }
}

package com.lawntracker

import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.daysUntil
import kotlinx.datetime.plus
import kotlinx.datetime.toLocalDateTime
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.pow

fun replaceUndefinedString(s: String?): String = s ?: ""

fun logErrorCallbackNotSet(callbackName: String) {
    println("Error - $callbackName not set")
}

fun prettyPrintBytes(bytes: Long, decimals: Int = 2): String {
    if (bytes <= 0L) return "0 Bytes"
    val k = 1024.0
    val dm = if (decimals < 0) 0 else decimals
    val sizes = listOf(
        "Bytes",
        "KiB",
        "MiB",
        "GiB",
        "TiB",
        "PiB",
        "EiB",
        "ZiB",
        "YiB",
    )
    val i = floor(ln(bytes.toDouble()) / ln(k)).toInt().coerceIn(0, sizes.lastIndex)
    val scaled = bytes.toDouble() / k.pow(i)
    val rounded = BigDecimal.valueOf(scaled).setScale(dm, RoundingMode.HALF_UP).stripTrailingZeros()
    return "${rounded.toPlainString()} ${sizes[i]}"
}

fun startOfDayUnixMs(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): Long =
    Instant.fromEpochMilliseconds(epochMs)
        .toLocalDateTime(timeZone)
        .date
        .atStartOfDayIn(timeZone)
        .toEpochMilliseconds()

fun localMsToUtcDateMillis(
    localUnixMs: Long,
    timeZone: TimeZone = TimeZone.currentSystemDefault(),
): Long =
    Instant.fromEpochMilliseconds(localUnixMs)
        .toLocalDateTime(timeZone)
        .date
        .atStartOfDayIn(TimeZone.UTC)
        .toEpochMilliseconds()

fun utcDateMillisToLocalStartOfDayMs(
    utcUnixMs: Long,
    timeZone: TimeZone = TimeZone.currentSystemDefault(),
): Long =
    Instant.fromEpochMilliseconds(utcUnixMs)
        .toLocalDateTime(TimeZone.UTC)
        .date
        .atStartOfDayIn(timeZone)
        .toEpochMilliseconds()

fun addDaysUnixMs(
    epochMs: Long,
    days: Int,
    timeZone: TimeZone = TimeZone.currentSystemDefault(),
): Long {
    val instant = Instant.fromEpochMilliseconds(epochMs)
    return instant.plus(days, DateTimeUnit.DAY, timeZone).toEpochMilliseconds()
}

fun differenceInCalendarDays(
    laterEpochMs: Long,
    earlierEpochMs: Long,
    timeZone: TimeZone = TimeZone.currentSystemDefault(),
): Int {
    val earlierDate: LocalDate = Instant.fromEpochMilliseconds(earlierEpochMs).toLocalDateTime(timeZone).date
    val laterDate: LocalDate = Instant.fromEpochMilliseconds(laterEpochMs).toLocalDateTime(timeZone).date
    return earlierDate.daysUntil(laterDate)
}

fun getHoursOfDay(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): Int =
    Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone).hour

fun getMinutesOfHour(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): Int =
    Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone).minute

fun formatDateString(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): String {
    val dt = Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone)
    val dayOfWeek = dt.dayOfWeek.name.take(3).lowercase().replaceFirstChar { it.uppercase() }
    val month = dt.month.name.take(3).lowercase().replaceFirstChar { it.uppercase() }
    val day = dt.dayOfMonth.toString().padStart(2, '0')
    return "$dayOfWeek $month $day ${dt.year}"
}

fun formatLocaleDateString(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): String {
    val dt = Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone)
    val day = dt.dayOfMonth.toString().padStart(2, '0')
    val month = dt.monthNumber.toString().padStart(2, '0')
    return "$day/$month/${dt.year}"
}

fun formatLocaleDateTimeString(epochMs: Long, timeZone: TimeZone = TimeZone.currentSystemDefault()): String {
    val dt = Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone)
    val day = dt.dayOfMonth.toString().padStart(2, '0')
    val month = dt.monthNumber.toString().padStart(2, '0')
    val hour = dt.hour.toString().padStart(2, '0')
    val minute = dt.minute.toString().padStart(2, '0')
    val second = dt.second.toString().padStart(2, '0')
    return "$day/$month/${dt.year}, $hour:$minute:$second"
}

fun formatShortDayMonth(
    epochMs: Long,
    padDay: Boolean,
    timeZone: TimeZone = TimeZone.currentSystemDefault(),
): String {
    val dt = Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(timeZone)
    val dayOfWeek = dt.dayOfWeek.name.take(3).lowercase().replaceFirstChar { it.uppercase() }
    val day = if (padDay) dt.dayOfMonth.toString().padStart(2, '0') else dt.dayOfMonth.toString()
    val month = dt.monthNumber.toString().padStart(2, '0')
    return "$dayOfWeek $day/$month"
}

fun formatFixed(value: Double, decimals: Int): String {
    if (!value.isFinite()) return value.toString()
    val scale = decimals.coerceAtLeast(0)
    return BigDecimal.valueOf(value).setScale(scale, RoundingMode.HALF_UP).toPlainString()
}

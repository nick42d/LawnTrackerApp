package com.lawntracker.state

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

@Serializable
enum class SchemaVersion {
    @SerialName("0.1")
    V0_1,
}

@Serializable
enum class ContextStatus {
    Initialised,
    Loading,
    Loaded,
    Transitioning,
}

@Serializable
enum class GddAlgorithm(val label: String) {
    @SerialName("Variant A")
    VariantA("Variant A"),

    @SerialName("Variant B")
    VariantB("Variant B"),
}

val GDD_ALGORITHMS = listOf(GddAlgorithm.VariantA, GddAlgorithm.VariantB)

@Serializable(with = GddBaseTempSerializer::class)
enum class GddBaseTemp(val value: Int) {
    Zero(0),
    Ten(10),
}

object GddBaseTempSerializer : KSerializer<GddBaseTemp> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("GddBaseTemp", PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder): GddBaseTemp =
        if (decoder.decodeInt() == 0) GddBaseTemp.Zero else GddBaseTemp.Ten

    override fun serialize(encoder: Encoder, value: GddBaseTemp) {
        encoder.encodeInt(value.value)
    }
}

val GDD_BASE_TEMPS = listOf(GddBaseTemp.Zero, GddBaseTemp.Ten)

fun gddBaseTempToString(g: GddBaseTemp): String =
    when (g) {
        GddBaseTemp.Zero -> "Zero"
        GddBaseTemp.Ten -> "Ten"
    }

@Serializable
enum class UnitOfMeasure {
    Imperial,
    Metric,
}

val UNITS_OF_MEASURE = listOf(UnitOfMeasure.Imperial, UnitOfMeasure.Metric)

fun unitOfMeasureAbbreviate(u: UnitOfMeasure): String =
    when (u) {
        UnitOfMeasure.Imperial -> "F"
        UnitOfMeasure.Metric -> "C"
    }

@Serializable
data class Settings(
    val apiVersion: SchemaVersion = SchemaVersion.V0_1,
    val algorithm: GddAlgorithm,
    val warning_threshold_perc: Double,
    val warning_threshold_days: Int,
    val unit_of_measure: UnitOfMeasure,
    val auto_dark_mode: Boolean,
    val dark_mode_enabled: Boolean,
    val default_base_temp: GddBaseTemp,
    val earliestNotificationTimeHrs: Int,
    val backgroundTaskIntervalHrs: Double,
)

fun defaultSettings(): Settings =
    Settings(
        apiVersion = SchemaVersion.V0_1,
        algorithm = GddAlgorithm.VariantA,
        warning_threshold_perc = 0.8,
        warning_threshold_days = 7,
        unit_of_measure = UnitOfMeasure.Metric,
        auto_dark_mode = true,
        dark_mode_enabled = false,
        default_base_temp = GddBaseTemp.Ten,
        earliestNotificationTimeHrs = 6,
        backgroundTaskIntervalHrs = 1.0,
    )

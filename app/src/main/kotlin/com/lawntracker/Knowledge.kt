package com.lawntracker

import com.lawntracker.state.GddAlgorithm
import kotlin.math.max

fun calcGdd(
    tMin: Double,
    tMax: Double,
    tBase: Double,
    algorithm: GddAlgorithm,
): Double =
    when (algorithm) {
        GddAlgorithm.VariantA -> max((tMax + tMin) / 2.0 - tBase, 0.0)
        GddAlgorithm.VariantB -> {
            val clampedMin = max(tMin, tBase)
            (tMax + clampedMin) / 2.0 - tBase
        }
    }

fun celsiusToFahrenheit(c: Double): Double = (c * 9.0) / 5.0 + 32.0

fun fahrenheitToCelsius(f: Double): Double = ((f - 32.0) * 5.0) / 9.0

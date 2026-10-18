package com.lawntracker.ui.components.gddplot

import com.lawntracker.EXTRA_ESTIMATE_DAYS
import com.lawntracker.MAX_GRAPH_ESTIMATE_DAYS
import com.lawntracker.addDaysUnixMs
import com.lawntracker.calcGdd
import com.lawntracker.formatFixed
import com.lawntracker.formatShortDayMonth
import com.lawntracker.state.GddAlgorithm
import com.lawntracker.state.GddTracker
import com.lawntracker.state.Location
import com.lawntracker.state.WeatherAppDay
import com.lawntracker.state.WeatherDayType
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

enum class PlotWeatherType {
    Historical,
    Forecasted,
    Estimated,
}

data class GddEstimate(
    val estimateType: PlotWeatherType,
    val estimateDateUnixMs: Long,
)

data class GraphPlotItem(
    val value: Double,
    val label: String? = null,
    val dataPointText: String,
    val line1: String,
    val line2: String,
)

data class DailyGdd(
    val gdd: Double,
    val dateUnixMs: Long,
    val weatherType: PlotWeatherType,
)

data class DailyGddAcc(
    val gdd: Double,
    val dateUnixMs: Long,
    val weatherType: PlotWeatherType,
    val gddAcc: Double,
)

data class GddGraphPlot(
    val items: List<GraphPlotItem>,
    val forecastStartIndex: Int,
    val estimateStartIndex: Int,
)

private fun <T> listAverage(list: List<T>, cb: (T) -> Double): Double {
    if (list.isEmpty()) return 0.0
    return list.sumOf(cb) / list.size.toDouble()
}

private fun weatherDaysToGddArr(
    forecasts: List<WeatherAppDay>,
    startDateUnixMs: Long,
    tBase: Double,
    algorithm: GddAlgorithm,
): List<DailyGdd> =
    forecasts
        .filter { x -> x.dateUnixMs >= startDateUnixMs }
        .map { x ->
            DailyGdd(
                gdd = calcGdd(x.minTemp, x.maxTemp, tBase, algorithm),
                dateUnixMs = x.dateUnixMs,
                weatherType = when (x.weatherType) {
                    WeatherDayType.Historical -> PlotWeatherType.Historical
                    WeatherDayType.Forecasted -> PlotWeatherType.Forecasted
                },
            )
        }

private fun estimateToGddArr(
    estimate: Double,
    startDateUnixMs: Long,
    numberDays: Int,
): List<DailyGdd> {
    if (numberDays <= 0) return emptyList()
    return List(numberDays) { i ->
        DailyGdd(
            gdd = estimate,
            dateUnixMs = addDaysUnixMs(startDateUnixMs, i),
            weatherType = PlotWeatherType.Estimated,
        )
    }
}

fun getTrackerGddArray(
    item: GddTracker,
    locations: List<Location>,
    algorithm: GddAlgorithm,
): List<DailyGddAcc>? {
    val tBase = item.base_temp
    val itemLocation = locations.find { loc -> loc.apiId == item.locationId } ?: return null
    val weather = itemLocation.weather ?: return null
    val historyAndForecastGddArray = weatherDaysToGddArr(
        weather.weatherArray,
        item.start_date_unix_ms,
        tBase,
        algorithm,
    )
    val averageGdd = listAverage(historyAndForecastGddArray) { x -> x.gdd }
    val totalNonEstimateGdd = averageGdd * historyAndForecastGddArray.size
    val rawEstimateDays = if (averageGdd > 0.0) {
        ceil(max(item.target_gdd - totalNonEstimateGdd, 0.0) / averageGdd + EXTRA_ESTIMATE_DAYS).toInt()
    } else {
        MAX_GRAPH_ESTIMATE_DAYS
    }
    val estimateNumberDays = min(rawEstimateDays, MAX_GRAPH_ESTIMATE_DAYS)

    val maybeLastNonEstimateDayUnixMs = historyAndForecastGddArray.lastOrNull()?.dateUnixMs
    val firstEstimateDayUnixMs = if (maybeLastNonEstimateDayUnixMs != null) {
        addDaysUnixMs(maybeLastNonEstimateDayUnixMs, 1)
    } else {
        item.start_date_unix_ms
    }
    val estimateGddArray = estimateToGddArr(
        averageGdd,
        firstEstimateDayUnixMs,
        estimateNumberDays,
    )
    var sum = 0.0
    return (historyAndForecastGddArray + estimateGddArray).map { x ->
        sum += x.gdd
        DailyGddAcc(
            gdd = x.gdd,
            dateUnixMs = x.dateUnixMs,
            weatherType = x.weatherType,
            gddAcc = sum,
        )
    }
}

fun getGraphPlot(trackerGddArray: List<DailyGddAcc>): GddGraphPlot {
    val forecastStartIndex = trackerGddArray.indexOfFirst { x -> x.weatherType == PlotWeatherType.Forecasted }
    val estimateStartIndex = trackerGddArray.indexOfFirst { x -> x.weatherType == PlotWeatherType.Estimated }
    val items = trackerGddArray.mapIndexed { idx, x ->
        val dateString = formatShortDayMonth(x.dateUnixMs, padDay = false)
        val value = x.gddAcc
        GraphPlotItem(
            value = value,
            label = if (idx % 7 == 0) dateString else null,
            dataPointText = dateString,
            line1 = dateString,
            line2 = formatFixed(value, 1),
        )
    }
    return GddGraphPlot(
        items = items,
        forecastStartIndex = forecastStartIndex,
        estimateStartIndex = estimateStartIndex,
    )
}

fun getGddEstimate(
    gddArray: List<DailyGddAcc>,
    targetGdd: Double,
): GddEstimate? {
    val estimatedDayItem = gddArray.find { x -> x.gddAcc >= targetGdd }
    if (estimatedDayItem == null) {
        val lastDayItem = gddArray.lastOrNull()
        if (lastDayItem?.weatherType == PlotWeatherType.Estimated && lastDayItem.gdd > 0.0) {
            val extraDays = ceil((targetGdd - lastDayItem.gddAcc) / lastDayItem.gdd).toInt()
            return GddEstimate(
                estimateType = PlotWeatherType.Estimated,
                estimateDateUnixMs = addDaysUnixMs(lastDayItem.dateUnixMs, extraDays),
            )
        }
        return null
    }
    return GddEstimate(
        estimateDateUnixMs = estimatedDayItem.dateUnixMs,
        estimateType = estimatedDayItem.weatherType,
    )
}

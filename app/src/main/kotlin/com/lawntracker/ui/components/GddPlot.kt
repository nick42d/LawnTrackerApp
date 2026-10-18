package com.lawntracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lawntracker.ui.components.gddplot.GddGraphPlot
import com.patrykandpatrick.vico.compose.cartesian.CartesianChartHost
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberBottom
import com.patrykandpatrick.vico.compose.cartesian.axis.rememberStart
import com.patrykandpatrick.vico.compose.cartesian.layer.continuous
import com.patrykandpatrick.vico.compose.cartesian.layer.dashed
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLine
import com.patrykandpatrick.vico.compose.cartesian.layer.rememberLineCartesianLayer
import com.patrykandpatrick.vico.compose.cartesian.marker.rememberDefaultCartesianMarker
import com.patrykandpatrick.vico.compose.cartesian.rememberCartesianChart
import com.patrykandpatrick.vico.compose.cartesian.rememberVicoScrollState
import com.patrykandpatrick.vico.compose.common.component.rememberLineComponent
import com.patrykandpatrick.vico.compose.common.component.rememberShapeComponent
import com.patrykandpatrick.vico.compose.common.component.rememberTextComponent
import com.patrykandpatrick.vico.compose.common.fill
import com.patrykandpatrick.vico.compose.common.insets
import com.patrykandpatrick.vico.compose.common.shape.dashedShape
import com.patrykandpatrick.vico.compose.common.shape.rounded
import com.patrykandpatrick.vico.core.cartesian.axis.HorizontalAxis
import com.patrykandpatrick.vico.core.cartesian.axis.VerticalAxis
import com.patrykandpatrick.vico.core.cartesian.data.CartesianChartModel
import com.patrykandpatrick.vico.core.cartesian.data.CartesianLayerRangeProvider
import com.patrykandpatrick.vico.core.cartesian.data.CartesianValueFormatter
import com.patrykandpatrick.vico.core.cartesian.data.LineCartesianLayerModel
import com.patrykandpatrick.vico.core.cartesian.decoration.HorizontalLine
import com.patrykandpatrick.vico.core.cartesian.layer.LineCartesianLayer
import com.patrykandpatrick.vico.core.cartesian.marker.DefaultCartesianMarker
import com.patrykandpatrick.vico.core.common.shape.CorneredShape
import kotlin.math.max
import kotlin.math.roundToInt

private val HISTORICAL_COLOR = Color(0xFF008000)
private val FORECASTED_COLOR = Color(0xFF9ACD32)
private val ESTIMATED_COLOR = Color(0xFF87CEEB)
private val TARGET_COLOR = Color(0xFFFF4500)
private const val GRAPH_X_SPACING_DP = 25f
private const val CHART_HEIGHT_DP = 240f

data class PlotLegendItem(
    val color: Color,
    val name: String,
)

@Composable
fun PlotLegend(points: List<PlotLegendItem>) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 10.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        points.forEach { p ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(p.color, CircleShape),
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = p.name, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
fun DatapointLabel(
    line1: String,
    line2: String,
    bgColor: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(4.dp))
            .padding(horizontal = 8.dp, vertical = 5.dp),
    ) {
        Text(text = line1, style = MaterialTheme.typography.bodySmall)
        Text(text = line2, style = MaterialTheme.typography.bodySmall)
    }
}

private data class GddSeriesEntry(
    val xValues: List<Int>,
    val yValues: List<Double>,
    val color: Color,
    val isDashed: Boolean,
)

@Composable
fun GddPlot(
    data: GddGraphPlot,
    targetGdd: Double,
) {
    val onSurface = MaterialTheme.colorScheme.onSurface
    val primaryContainer = MaterialTheme.colorScheme.primaryContainer
    val items = data.items
    if (items.isEmpty()) return

    val maxDataVal = max(items.maxOfOrNull { it.value } ?: 0.0, targetGdd).coerceAtLeast(1.0)

    val seriesEntries = remember(data) {
        val result = mutableListOf<GddSeriesEntry>()
        val forecastStart = data.forecastStartIndex
        val estimateStart = data.estimateStartIndex

        val histEndExclusive = when {
            forecastStart >= 0 -> forecastStart
            estimateStart >= 0 -> estimateStart
            else -> items.size
        }
        if (histEndExclusive > 0) {
            val indices = (0 until histEndExclusive).toList()
            result.add(
                GddSeriesEntry(
                    xValues = indices,
                    yValues = indices.map { items[it].value },
                    color = HISTORICAL_COLOR,
                    isDashed = false,
                ),
            )
        }

        if (forecastStart >= 0) {
            val forecastFrom = max(0, forecastStart - 1)
            val forecastEndExclusive = if (estimateStart >= 0) estimateStart else items.size
            if (forecastEndExclusive > forecastFrom) {
                val indices = (forecastFrom until forecastEndExclusive).toList()
                result.add(
                    GddSeriesEntry(
                        xValues = indices,
                        yValues = indices.map { items[it].value },
                        color = FORECASTED_COLOR,
                        isDashed = true,
                    ),
                )
            }
        }

        if (estimateStart >= 0 && estimateStart < items.size) {
            val estimateFrom = max(0, estimateStart - 1)
            val indices = (estimateFrom until items.size).toList()
            result.add(
                GddSeriesEntry(
                    xValues = indices,
                    yValues = indices.map { items[it].value },
                    color = ESTIMATED_COLOR,
                    isDashed = true,
                ),
            )
        }

        result
    }

    val lines = seriesEntries.map { entry ->
        LineCartesianLayer.rememberLine(
            fill = LineCartesianLayer.LineFill.single(fill(entry.color)),
            stroke = if (entry.isDashed) {
                LineCartesianLayer.LineStroke.dashed(
                    thickness = 3.dp,
                    dashLength = 8.dp,
                    gapLength = 5.dp,
                )
            } else {
                LineCartesianLayer.LineStroke.continuous(thickness = 3.dp)
            },
        )
    }

    val model = remember(seriesEntries) {
        CartesianChartModel(
            LineCartesianLayerModel.build {
                seriesEntries.forEach { entry ->
                    series(entry.xValues, entry.yValues)
                }
            },
        )
    }

    val rangeProvider = remember(maxDataVal, items.size) {
        CartesianLayerRangeProvider.fixed(
            minX = 0.0,
            maxX = (items.size - 1).coerceAtLeast(1).toDouble(),
            minY = 0.0,
            maxY = maxDataVal,
        )
    }

    val lineLayer = rememberLineCartesianLayer(
        lineProvider = LineCartesianLayer.LineProvider.series(lines),
        pointSpacing = GRAPH_X_SPACING_DP.dp,
        rangeProvider = rangeProvider,
    )

    val targetLineComponent = rememberLineComponent(
        fill = fill(TARGET_COLOR),
        thickness = 2.dp,
        shape = dashedShape(dashLength = 8.dp, gapLength = 8.dp),
    )

    val targetDecoration = remember(targetGdd, targetLineComponent) {
        HorizontalLine(
            y = { targetGdd },
            line = targetLineComponent,
        )
    }

    val markerLabelBackground = rememberShapeComponent(
        fill = fill(primaryContainer),
        shape = CorneredShape.rounded(4.dp),
    )

    val markerLabel = rememberTextComponent(
        color = onSurface,
        textSize = 12.sp,
        lineCount = 2,
        padding = insets(horizontal = 8.dp, vertical = 5.dp),
        background = markerLabelBackground,
    )

    val markerGuideline = rememberLineComponent(
        fill = fill(primaryContainer),
        thickness = 4.dp,
    )

    val markerValueFormatter = remember(items) {
        DefaultCartesianMarker.ValueFormatter { _, targets ->
            val idx = targets.firstOrNull()?.x?.roundToInt()
            val item = idx?.let { items.getOrNull(it) }
            if (item != null) "${item.line1}\n${item.line2}" else ""
        }
    }

    val marker = rememberDefaultCartesianMarker(
        label = markerLabel,
        valueFormatter = markerValueFormatter,
        labelPosition = DefaultCartesianMarker.LabelPosition.Top,
        guideline = markerGuideline,
    )

    val bottomAxisValueFormatter = remember(items) {
        CartesianValueFormatter { _, value, _ ->
            items.getOrNull(value.roundToInt())?.dataPointText ?: " "
        }
    }

    val chart = rememberCartesianChart(
        lineLayer,
        startAxis = VerticalAxis.rememberStart(),
        bottomAxis = HorizontalAxis.rememberBottom(
            valueFormatter = bottomAxisValueFormatter,
            itemPlacer = remember { HorizontalAxis.ItemPlacer.aligned(spacing = { 7 }) },
        ),
        marker = marker,
        decorations = listOf(targetDecoration),
    )

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "GDD Total by Date",
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        PlotLegend(
            points = listOf(
                PlotLegendItem(name = "Historical", color = HISTORICAL_COLOR),
                PlotLegendItem(name = "Forecasted", color = FORECASTED_COLOR),
                PlotLegendItem(name = "Estimated", color = ESTIMATED_COLOR),
                PlotLegendItem(name = "Target", color = TARGET_COLOR),
            ),
        )
        Spacer(modifier = Modifier.height(12.dp))
        CartesianChartHost(
            chart = chart,
            model = model,
            scrollState = rememberVicoScrollState(),
            modifier = Modifier
                .fillMaxWidth()
                .height(CHART_HEIGHT_DP.dp)
                .padding(horizontal = 8.dp),
        )
    }
}

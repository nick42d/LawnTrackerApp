package com.lawntracker.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import io.github.dellisd.spatialk.geojson.Point
import io.github.dellisd.spatialk.geojson.Position
import org.maplibre.compose.camera.CameraPosition
import org.maplibre.compose.camera.rememberCameraState
import org.maplibre.compose.expressions.dsl.const
import org.maplibre.compose.expressions.dsl.image
import org.maplibre.compose.expressions.value.SymbolAnchor
import org.maplibre.compose.layers.SymbolLayer
import org.maplibre.compose.map.GestureOptions
import org.maplibre.compose.map.MapOptions
import org.maplibre.compose.map.MaplibreMap
import org.maplibre.compose.map.OrnamentOptions
import org.maplibre.compose.sources.GeoJsonData
import org.maplibre.compose.sources.rememberGeoJsonSource
import org.maplibre.compose.style.BaseStyle

private const val DEMO_STYLE_URL = "https://demotiles.maplibre.org/style.json"

@Composable
fun MapLibrePinMap(
    longitude: Double,
    latitude: Double,
    zoomLevel: Double,
    showPin: Boolean,
    modifier: Modifier = Modifier,
    showScaleBar: Boolean = true,
) {
    val cameraState = rememberCameraState(
        firstPosition = CameraPosition(
            target = Position(longitude = longitude, latitude = latitude),
            zoom = zoomLevel,
        ),
    )

    LaunchedEffect(longitude, latitude, zoomLevel) {
        cameraState.position = CameraPosition(
            target = Position(longitude = longitude, latitude = latitude),
            zoom = zoomLevel,
        )
    }

    val pinPainter = rememberVectorPainter(Icons.Default.LocationOn)

    MaplibreMap(
        modifier = modifier,
        baseStyle = BaseStyle.Uri(DEMO_STYLE_URL),
        cameraState = cameraState,
        options = MapOptions(
            gestureOptions = GestureOptions.AllDisabled,
            ornamentOptions = OrnamentOptions(
                isScaleBarEnabled = showScaleBar,
            ),
        ),
    ) {
        if (showPin) {
            val pinSource = rememberGeoJsonSource(
                data = GeoJsonData.Features(
                    Point(Position(longitude = longitude, latitude = latitude)),
                ),
            )
            SymbolLayer(
                id = "pt-ann",
                source = pinSource,
                iconImage = image(
                    value = pinPainter,
                    size = DpSize(36.dp, 36.dp),
                    drawAsSdf = true,
                ),
                iconColor = const(Color(0xFFD32F2F)),
                iconHaloColor = const(Color.White),
                iconHaloWidth = const(1.5.dp),
                iconAnchor = const(SymbolAnchor.Bottom),
                iconAllowOverlap = const(true),
                iconIgnorePlacement = const(true),
            )
        }
    }
}

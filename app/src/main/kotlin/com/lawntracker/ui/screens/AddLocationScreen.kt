package com.lawntracker.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.ListItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.lawntracker.api.WeatherApiLocation
import com.lawntracker.api.fetchLocations
import com.lawntracker.api.prettyPrintLocationDescription
import com.lawntracker.formatFixed
import com.lawntracker.ui.components.MapLibrePinMap

private const val NUMBER_SEARCH_RESULTS = 5

data class SearchState(
    val query: String = "",
    val loading: Boolean = false,
    val showSuggestions: Boolean = false,
)

@Composable
fun AddLocationScreen(
    currentLocation: WeatherApiLocation?,
    onCurrentLocationChanged: (WeatherApiLocation?) -> Unit,
) {
    var searchState by remember { mutableStateOf(SearchState()) }
    var searchResults by remember { mutableStateOf<List<WeatherApiLocation>>(emptyList()) }
    val focusManager = LocalFocusManager.current

    LaunchedEffect(searchState.query) {
        if (searchState.query.isNotEmpty()) {
            println("Requesting search results")
            searchState = searchState.copy(loading = true)
            val result = fetchLocations(searchState.query, NUMBER_SEARCH_RESULTS)
            searchResults = result?.results ?: emptyList()
            searchState = searchState.copy(loading = false)
        } else {
            searchState = searchState.copy(loading = false, showSuggestions = false)
        }
    }

    val prettyLocTooltip = if (currentLocation == null) {
        ""
    } else {
        "${currentLocation.name} ${formatFixed(currentLocation.latitude, 4)}, ${formatFixed(currentLocation.longitude, 4)}"
    }

    val longitude = currentLocation?.longitude ?: 0.0
    val latitude = currentLocation?.latitude ?: 0.0
    val zoomLevel = if (currentLocation != null) 2.0 else 1.0

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5FCFF)),
    ) {
        MapLibrePinMap(
            longitude = longitude,
            latitude = latitude,
            zoomLevel = zoomLevel,
            showPin = currentLocation != null,
            showScaleBar = false,
            modifier = Modifier.fillMaxSize(),
        )

        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 10.dp)
                .width(380.dp),
        ) {
            OutlinedTextField(
                value = searchState.query,
                onValueChange = { t ->
                    searchState = searchState.copy(showSuggestions = true, query = t)
                },
                placeholder = { Text("Search") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        searchState = searchState.copy(showSuggestions = true)
                    },
                    onDone = {
                        searchState = searchState.copy(showSuggestions = true)
                    },
                ),
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Search, contentDescription = "Search")
                },
                trailingIcon = {
                    if (searchState.loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp,
                        )
                    } else if (searchState.query.isNotEmpty()) {
                        IconButton(
                            onClick = {
                                searchState = searchState.copy(query = "", showSuggestions = false)
                            },
                        ) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Clear search")
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                ),
                shape = RoundedCornerShape(28.dp),
                modifier = Modifier.fillMaxWidth(),
            )

            if (searchState.showSuggestions && searchResults.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp)
                        .background(
                            color = MaterialTheme.colorScheme.background.copy(alpha = 0.85f),
                            shape = RoundedCornerShape(10.dp),
                        ),
                ) {
                    searchResults.forEach { s ->
                        ListItem(
                            headlineContent = { Text(s.name) },
                            supportingContent = { Text(prettyPrintLocationDescription(s)) },
                            trailingContent = {
                                Icon(imageVector = Icons.Default.Search, contentDescription = null)
                            },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier.clickable {
                                focusManager.clearFocus()
                                onCurrentLocationChanged(s)
                                searchState = searchState.copy(
                                    query = "",
                                    showSuggestions = false,
                                )
                            },
                        )
                    }
                }
            }
        }

        if (prettyLocTooltip.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 8.dp),
            ) {
                Text(
                    text = prettyLocTooltip,
                    color = Color.Black,
                    style = MaterialTheme.typography.titleLarge,
                )
            }
        }
    }
}

package com.lawntracker.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.lawntracker.state.AddTrackerInput
import com.lawntracker.state.Location
import com.lawntracker.ui.components.AddTrackerList
import com.lawntracker.ui.components.getAddTrackerProps

@Composable
fun AddTrackerScreen(
    locations: List<Location>,
    state: AddTrackerInput,
    showLocationsDialog: Boolean,
    setState: (AddTrackerInput) -> Unit,
    setShowLocationsDialog: (Boolean) -> Unit,
    onNavigateToAddLocation: () -> Unit,
) {
    val addTrackerProps = getAddTrackerProps(
        locations = locations,
        state = state,
        showLocationsDialog = showLocationsDialog,
        setState = setState,
        setShowLocationsDialog = setShowLocationsDialog,
        navigateToAddLocation = onNavigateToAddLocation,
    )
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        AddTrackerList(list = addTrackerProps)
    }
}

@Composable
fun EditTrackerScreen(
    locations: List<Location>,
    state: AddTrackerInput?,
    showLocationsDialog: Boolean,
    setState: (AddTrackerInput) -> Unit,
    setShowLocationsDialog: (Boolean) -> Unit,
    onNavigateToAddLocation: () -> Unit,
) {
    val addTrackerProps = state?.let {
        getAddTrackerProps(
            locations = locations,
            state = it,
            showLocationsDialog = showLocationsDialog,
            setState = setState,
            setShowLocationsDialog = setShowLocationsDialog,
            navigateToAddLocation = onNavigateToAddLocation,
        )
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        if (addTrackerProps != null) {
            AddTrackerList(list = addTrackerProps)
        } else {
            Text("Error editing tracker")
        }
    }
}

package com.lawntracker.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.github.michaelbull.result.Result
import com.github.michaelbull.result.getError
import com.lawntracker.formatLocaleDateString
import com.lawntracker.localMsToUtcDateMillis
import com.lawntracker.state.AddCalendarTrackerInput
import com.lawntracker.state.AddGddTrackerInput
import com.lawntracker.state.AddTimedTrackerInput
import com.lawntracker.state.AddTrackerInput
import com.lawntracker.state.Location
import com.lawntracker.state.prettyPrintLocation
import com.lawntracker.state.validateAddCalendarTrackerStartDate
import com.lawntracker.state.validateAddGddTrackerStartDate
import com.lawntracker.state.validateAddGddTrackerTarget
import com.lawntracker.state.validateAddTimedTrackerDurationDays
import com.lawntracker.state.validateAddTimedTrackerStartDate
import com.lawntracker.state.validateTrackerDesc
import com.lawntracker.state.validateTrackerName
import com.lawntracker.ui.components.trackercard.AppIcon
import com.lawntracker.utcDateMillisToLocalStartOfDayMs
import kotlinx.datetime.Clock

sealed interface AddTrackerListProps {
    val key: String
    val label: String
    val disabled: Boolean
}

data class AddTrackerListCalendarItemProps(
    override val key: String,
    override val label: String,
    override val disabled: Boolean = false,
    val value: Long?,
    val validation: ((Long?) -> Result<*, List<String>>)? = null,
    val onChange: (Long) -> Unit,
) : AddTrackerListProps

data class AddTrackerListLocationsItemProps(
    override val key: String,
    override val label: String,
    val icon: AppIcon? = null,
    override val disabled: Boolean = false,
    val selectedLocationId: Int,
    val locations: List<Location>,
    val showLocationsDialog: Boolean,
    val setShowLocationsDialog: (Boolean) -> Unit,
    val onChangeLocationId: (Int) -> Unit,
    val navigateToAddLocation: () -> Unit,
) : AddTrackerListProps

data class AddTrackerListTextInputItemProps(
    override val key: String,
    override val label: String,
    val icon: AppIcon? = null,
    override val disabled: Boolean = false,
    val value: String,
    val numericKeyboard: Boolean = false,
    val validation: ((String) -> Result<*, List<String>>)? = null,
    val onChange: (String) -> Unit,
) : AddTrackerListProps

data class AddTrackerListSelectionItemProps(
    override val key: String,
    override val label: String,
    val icon: AppIcon? = null,
    override val disabled: Boolean = false,
    val value: String,
    val values: List<String>,
    val onChange: (String) -> Unit,
) : AddTrackerListProps

fun getAddTrackerProps(
    locations: List<Location>,
    state: AddTrackerInput,
    showLocationsDialog: Boolean,
    setState: (AddTrackerInput) -> Unit,
    setShowLocationsDialog: (Boolean) -> Unit,
    navigateToAddLocation: () -> Unit,
): List<AddTrackerListProps> =
    when (state) {
        is AddGddTrackerInput -> getAddGddTrackerProps(
            locations = locations,
            state = state,
            showLocationsDialog = showLocationsDialog,
            setState = setState,
            setShowLocationsDialog = setShowLocationsDialog,
            navigateToAddLocation = navigateToAddLocation,
        )
        is AddCalendarTrackerInput -> getAddCalendarTrackerProps(state, setState)
        is AddTimedTrackerInput -> getAddTimedTrackerProps(state, setState)
    }

private fun getAddTimedTrackerProps(
    state: AddTimedTrackerInput,
    setState: (AddTrackerInput) -> Unit,
): List<AddTrackerListProps> =
    listOf(
        AddTrackerListTextInputItemProps(
            key = "name",
            label = "Name",
            value = state.name,
            validation = ::validateTrackerName,
            onChange = { v -> setState(state.copy(name = v)) },
        ),
        AddTrackerListTextInputItemProps(
            key = "desc",
            label = "Description",
            value = state.description,
            validation = ::validateTrackerDesc,
            onChange = { v -> setState(state.copy(description = v)) },
        ),
        AddTrackerListCalendarItemProps(
            key = "start",
            label = "Start date",
            value = state.start_date_unix_ms,
            validation = { d -> validateAddTimedTrackerStartDate(d) },
            onChange = { v -> setState(state.copy(start_date_unix_ms = v)) },
        ),
        AddTrackerListTextInputItemProps(
            key = "dur",
            label = "Duration(days)",
            value = state.duration_days,
            numericKeyboard = true,
            validation = ::validateAddTimedTrackerDurationDays,
            onChange = { v -> setState(state.copy(duration_days = v)) },
        ),
    )

private fun getAddCalendarTrackerProps(
    state: AddCalendarTrackerInput,
    setState: (AddTrackerInput) -> Unit,
): List<AddTrackerListProps> =
    listOf(
        AddTrackerListTextInputItemProps(
            key = "name",
            label = "Name",
            value = state.name,
            validation = ::validateTrackerName,
            onChange = { v -> setState(state.copy(name = v)) },
        ),
        AddTrackerListTextInputItemProps(
            key = "desc",
            label = "Description",
            value = state.description,
            validation = ::validateTrackerDesc,
            onChange = { v -> setState(state.copy(description = v)) },
        ),
        AddTrackerListCalendarItemProps(
            key = "date",
            label = "Date",
            value = state.target_date_unix_ms,
            validation = { d -> validateAddCalendarTrackerStartDate(d) },
            onChange = { v -> setState(state.copy(target_date_unix_ms = v)) },
        ),
    )

private fun getAddGddTrackerProps(
    locations: List<Location>,
    state: AddGddTrackerInput,
    showLocationsDialog: Boolean,
    setState: (AddTrackerInput) -> Unit,
    setShowLocationsDialog: (Boolean) -> Unit,
    navigateToAddLocation: () -> Unit,
): List<AddTrackerListProps> =
    listOf(
        AddTrackerListTextInputItemProps(
            key = "name",
            label = "Name",
            value = state.name,
            validation = ::validateTrackerName,
            onChange = { v -> setState(state.copy(name = v)) },
        ),
        AddTrackerListTextInputItemProps(
            key = "desc",
            label = "Description",
            value = state.description,
            validation = ::validateTrackerDesc,
            onChange = { v -> setState(state.copy(description = v)) },
        ),
        AddTrackerListCalendarItemProps(
            key = "start",
            label = "Start date",
            value = state.start_date_unix_ms,
            validation = { d -> validateAddGddTrackerStartDate(d) },
            onChange = { v -> setState(state.copy(start_date_unix_ms = v)) },
        ),
        AddTrackerListLocationsItemProps(
            key = "loc",
            label = "Select locations",
            selectedLocationId = state.locationId,
            locations = locations,
            showLocationsDialog = showLocationsDialog,
            setShowLocationsDialog = setShowLocationsDialog,
            onChangeLocationId = { v -> setState(state.copy(locationId = v)) },
            navigateToAddLocation = navigateToAddLocation,
        ),
        AddTrackerListTextInputItemProps(
            key = "target",
            label = "Target",
            numericKeyboard = true,
            value = state.target_gdd,
            validation = ::validateAddGddTrackerTarget,
            onChange = { v -> setState(state.copy(target_gdd = v)) },
        ),
        AddTrackerListSelectionItemProps(
            key = "baset",
            label = "Base temp",
            icon = AppIcon.Target,
            value = state.base_temp,
            values = listOf("0", "10"),
            onChange = { v -> setState(state.copy(base_temp = v)) },
        ),
    )

@Composable
fun AddTrackerList(list: List<AddTrackerListProps>) {
    val firstLocation = list.filterIsInstance<AddTrackerListLocationsItemProps>().firstOrNull()
    val firstLocationDialogShown = firstLocation?.showLocationsDialog ?: false

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        list.forEach { item ->
            AddTrackerListItem(item = item)
        }
    }

    if (firstLocation != null) {
        AddLocationsDialog(
            visible = firstLocationDialogShown,
            locations = firstLocation.locations,
            selectedLocationId = firstLocation.selectedLocationId,
            navigateToLocations = firstLocation.navigateToAddLocation,
            hideDialog = { firstLocation.setShowLocationsDialog(false) },
            onChange = firstLocation.onChangeLocationId,
        )
    }
}

@Composable
fun AddTrackerListItem(item: AddTrackerListProps) {
    when (item) {
        is AddTrackerListLocationsItemProps -> AddTrackerListLocationsItem(item)
        is AddTrackerListTextInputItemProps -> AddTrackerListTextInputItem(item)
        is AddTrackerListCalendarItemProps -> AddTrackerListCalendarItem(item)
        is AddTrackerListSelectionItemProps -> AddTrackerListSelectionItem(item)
    }
}

@Composable
private fun AddTrackerListTextInputItem(item: AddTrackerListTextInputItemProps) {
    val validationResult = item.validation?.invoke(item.value)
    val errorMsg = validationResult?.getError()?.firstOrNull()
    val leadingIconVec = item.icon?.let { mapIconToVector(it) }

    Column(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = item.value,
            onValueChange = item.onChange,
            label = { Text(item.label) },
            enabled = !item.disabled,
            isError = errorMsg != null,
            leadingIcon = if (leadingIconVec != null) {
                { Icon(imageVector = leadingIconVec, contentDescription = item.label) }
            } else {
                null
            },
            keyboardOptions = if (item.numericKeyboard) {
                KeyboardOptions(keyboardType = KeyboardType.Number)
            } else {
                KeyboardOptions.Default
            },
            supportingText = if (errorMsg != null) {
                { Text(text = errorMsg, color = MaterialTheme.colorScheme.error) }
            } else {
                null
            },
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTrackerListSelectionItem(item: AddTrackerListSelectionItemProps) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(modifier = Modifier.weight(1.5f)) {
            ListItem(headlineContent = { Text(item.label) })
        }
        Box(
            modifier = Modifier
                .weight(1f)
                .padding(end = 10.dp),
            contentAlignment = Alignment.Center,
        ) {
            SingleChoiceSegmentedButtonRow {
                item.values.forEachIndexed { idx, v ->
                    SegmentedButton(
                        selected = item.value == v,
                        onClick = { item.onChange(v) },
                        shape = SegmentedButtonDefaults.itemShape(index = idx, count = item.values.size),
                    ) {
                        Text(v)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTrackerListCalendarItem(item: AddTrackerListCalendarItemProps) {
    var showDatePicker by remember { mutableStateOf(false) }
    val validationResult = item.validation?.invoke(item.value)
    val errorMsg = validationResult?.getError()?.joinToString(", ")
    val displayText = item.value?.let { formatLocaleDateString(it) } ?: ""

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = displayText,
                onValueChange = {},
                readOnly = true,
                enabled = !item.disabled,
                isError = errorMsg != null,
                label = { Text(item.label) },
                trailingIcon = {
                    IconButton(onClick = { if (!item.disabled) showDatePicker = true }) {
                        Icon(imageVector = Icons.Default.DateRange, contentDescription = "Select date")
                    }
                },
                supportingText = if (errorMsg != null) {
                    { Text(text = errorMsg, color = MaterialTheme.colorScheme.error) }
                } else {
                    null
                },
                modifier = Modifier.fillMaxWidth(),
            )
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .clickable(enabled = !item.disabled) { showDatePicker = true },
            )
        }
    }

    if (showDatePicker) {
        val nowLocalMs = Clock.System.now().toEpochMilliseconds()
        val initialUtcMillis = localMsToUtcDateMillis(item.value ?: nowLocalMs)
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = initialUtcMillis,
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        val selectedUtc = datePickerState.selectedDateMillis ?: initialUtcMillis
                        val selectedLocalStartOfDay = utcDateMillisToLocalStartOfDayMs(selectedUtc)
                        item.onChange(selectedLocalStartOfDay)
                        showDatePicker = false
                    },
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

@Composable
private fun AddTrackerListLocationsItem(item: AddTrackerListLocationsItemProps) {
    val selectedLocation = item.locations.find { l -> l.apiId == item.selectedLocationId }
    val selectedLocationPrettyName = selectedLocation?.let { prettyPrintLocation(it) } ?: ""
    val trailingIconVec = item.icon?.let { mapIconToVector(it) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = selectedLocationPrettyName,
                onValueChange = {},
                readOnly = true,
                enabled = !item.disabled,
                isError = selectedLocation == null,
                label = { Text("Select Location") },
                trailingIcon = if (trailingIconVec != null) {
                    {
                        IconButton(onClick = { if (!item.disabled) item.setShowLocationsDialog(true) }) {
                            Icon(imageVector = trailingIconVec, contentDescription = item.label)
                        }
                    }
                } else {
                    null
                },
                supportingText = if (selectedLocation == null) {
                    { Text(text = "Location is mandatory", color = MaterialTheme.colorScheme.error) }
                } else {
                    null
                },
                modifier = Modifier.fillMaxWidth(),
            )
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .clickable(enabled = !item.disabled) {
                        item.setShowLocationsDialog(true)
                    },
            )
        }
    }
}

@Composable
fun AddLocationsDialog(
    visible: Boolean,
    locations: List<Location>,
    selectedLocationId: Int,
    navigateToLocations: () -> Unit,
    hideDialog: () -> Unit,
    onChange: (Int) -> Unit,
) {
    if (!visible) return
    val selectedLocation = locations.find { l -> l.apiId == selectedLocationId }

    AlertDialog(
        onDismissRequest = hideDialog,
        title = { Text("Select Location") },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (selectedLocation != null) {
                    locations.forEach { l ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onChange(l.apiId) }
                                .padding(vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            RadioButton(
                                selected = l.apiId == selectedLocationId,
                                onClick = { onChange(l.apiId) },
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(prettyPrintLocation(l))
                        }
                    }
                }
                TextButton(
                    onClick = {
                        hideDialog()
                        navigateToLocations()
                    },
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = "Add location")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add location")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = hideDialog) {
                Text("Done")
            }
        },
    )
}

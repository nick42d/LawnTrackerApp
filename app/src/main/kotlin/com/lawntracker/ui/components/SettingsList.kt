package com.lawntracker.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp

data class WarningDialogProps(
    val title: String,
    val message: String,
)

sealed interface SettingsListProps {
    val key: String
}

data class SettingsListSubheaderProps(
    override val key: String,
    val subheaderTitle: String,
) : SettingsListProps

data class SettingsListToggleProps(
    override val key: String,
    val title: String,
    val description: String,
    val value: Boolean,
    val onChange: (Boolean) -> Unit,
) : SettingsListProps

data class SettingsListPressProps(
    override val key: String,
    val title: String,
    val description: String,
    val onPress: () -> Unit,
    val warningDialog: WarningDialogProps? = null,
) : SettingsListProps

data class SettingsListSliderProps(
    override val key: String,
    val title: String,
    val description: String,
    val value: Double,
    val minValue: Double,
    val maxValue: Double,
    val step: Double,
    val onChange: (Double) -> Unit,
    val stringConverter: (Double) -> String,
) : SettingsListProps

data class SettingsListListProps<T>(
    override val key: String,
    val title: String,
    val description: String,
    val value: T,
    val list: List<T>,
    val onChange: (T) -> Unit,
    val stringConverter: (T) -> String,
) : SettingsListProps

@Composable
fun SettingsList(list: List<SettingsListProps>) {
    var dialogShownIndex by remember { mutableStateOf<Int?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        list.forEachIndexed { idx, item ->
            SettingsListItem(
                item = item,
                showDialog = { dialogShownIndex = idx },
            )
        }
    }

    val activeIdx = dialogShownIndex
    if (activeIdx != null && activeIdx in list.indices) {
        SettingsListDialog(
            item = list[activeIdx],
            visible = true,
            hideDialog = { dialogShownIndex = null },
        )
    }
}

@Composable
fun SettingsListItem(
    item: SettingsListProps,
    showDialog: () -> Unit,
) {
    when (item) {
        is SettingsListSubheaderProps -> Text(
            text = item.subheaderTitle,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
        is SettingsListListProps<*> -> {
            @Suppress("UNCHECKED_CAST")
            val typed = item as SettingsListListProps<Any?>
            ListItem(
                headlineContent = { Text(typed.title) },
                supportingContent = {
                    Text(
                        text = typed.description,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                    )
                },
                trailingContent = { Text(typed.stringConverter(typed.value)) },
                modifier = Modifier.clickable { showDialog() },
            )
        }
        is SettingsListToggleProps -> ListItem(
            headlineContent = { Text(item.title) },
            supportingContent = {
                Text(
                    text = item.description,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
            },
            trailingContent = {
                Switch(
                    checked = item.value,
                    onCheckedChange = item.onChange,
                )
            },
        )
        is SettingsListSliderProps -> ListItem(
            headlineContent = { Text(item.title) },
            supportingContent = {
                Text(
                    text = item.description,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
            },
            trailingContent = { Text(item.stringConverter(item.value)) },
            modifier = Modifier.clickable { showDialog() },
        )
        is SettingsListPressProps -> ListItem(
            headlineContent = { Text(item.title) },
            supportingContent = {
                Text(
                    text = item.description,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
            },
            modifier = Modifier.clickable {
                if (item.warningDialog != null) {
                    showDialog()
                } else {
                    item.onPress()
                }
            },
        )
    }
}

@Composable
fun SettingsListDialog(
    item: SettingsListProps,
    visible: Boolean,
    hideDialog: () -> Unit,
) {
    when (item) {
        is SettingsListListProps<*> -> {
            @Suppress("UNCHECKED_CAST")
            val typed = item as SettingsListListProps<Any?>
            GenericSelectionDialog(
                title = typed.title,
                visible = visible,
                hideDialog = hideDialog,
                values = typed.list,
                curValue = typed.value,
                onChange = typed.onChange,
                stringConverter = typed.stringConverter,
            )
        }
        is SettingsListSliderProps -> SliderSelectionDialog(
            title = item.title,
            visible = visible,
            hideDialog = hideDialog,
            curValue = item.value,
            onChange = item.onChange,
            minValue = item.minValue,
            maxValue = item.maxValue,
            step = item.step,
            stringConverter = item.stringConverter,
        )
        is SettingsListPressProps -> {
            val dialog = item.warningDialog ?: return
            ConfirmationDialog(
                title = dialog.title,
                message = dialog.message,
                visible = visible,
                hideDialog = hideDialog,
                onOk = item.onPress,
            )
        }
        else -> {}
    }
}

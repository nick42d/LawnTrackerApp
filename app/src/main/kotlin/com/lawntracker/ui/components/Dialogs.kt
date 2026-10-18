package com.lawntracker.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlin.math.roundToInt

@Composable
fun ConfirmationDialog(
    title: String,
    message: String,
    visible: Boolean,
    hideDialog: () -> Unit,
    onOk: () -> Unit,
) {
    if (!visible) return
    AlertDialog(
        onDismissRequest = hideDialog,
        title = { Text(title) },
        text = { Text(message) },
        dismissButton = {
            TextButton(onClick = hideDialog) {
                Text("Cancel")
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    hideDialog()
                    onOk()
                },
            ) {
                Text("Ok")
            }
        },
    )
}

@Composable
fun <T> GenericSelectionDialog(
    title: String,
    visible: Boolean,
    hideDialog: () -> Unit,
    values: List<T>,
    curValue: T,
    stringConverter: (T) -> String,
    onChange: (T) -> Unit,
) {
    if (!visible) return
    AlertDialog(
        onDismissRequest = hideDialog,
        title = { Text(title) },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                values.forEach { value ->
                    val label = stringConverter(value)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onChange(value) }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        RadioButton(
                            selected = value == curValue,
                            onClick = { onChange(value) },
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(label)
                    }
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

@Composable
fun SliderSelectionDialog(
    title: String,
    visible: Boolean,
    hideDialog: () -> Unit,
    curValue: Double,
    onChange: (Double) -> Unit,
    minValue: Double,
    maxValue: Double,
    step: Double,
    stringConverter: (Double) -> String,
) {
    if (!visible) return
    val stepsCount = if (step > 0.0 && maxValue > minValue) {
        (((maxValue - minValue) / step).roundToInt() - 1).coerceAtLeast(0)
    } else {
        0
    }
    AlertDialog(
        onDismissRequest = hideDialog,
        title = { Text(title) },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(stringConverter(curValue))
                Slider(
                    value = curValue.toFloat(),
                    onValueChange = { raw ->
                        val snapped = if (step > 0.0) {
                            val increments = ((raw.toDouble() - minValue) / step).roundToInt()
                            (minValue + increments * step).coerceIn(minValue, maxValue)
                        } else {
                            raw.toDouble()
                        }
                        onChange(snapped)
                    },
                    valueRange = minValue.toFloat()..maxValue.toFloat(),
                    steps = stepsCount,
                )
            }
        },
        confirmButton = {
            TextButton(onClick = hideDialog) {
                Text("Done")
            }
        },
    )
}

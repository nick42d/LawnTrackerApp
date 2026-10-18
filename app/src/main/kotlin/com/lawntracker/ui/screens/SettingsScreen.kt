package com.lawntracker.ui.screens

import androidx.compose.runtime.Composable
import com.lawntracker.formatFixed
import com.lawntracker.state.GDD_ALGORITHMS
import com.lawntracker.state.GDD_BASE_TEMPS
import com.lawntracker.state.GddAlgorithm
import com.lawntracker.state.GddBaseTemp
import com.lawntracker.state.Settings
import com.lawntracker.state.UNITS_OF_MEASURE
import com.lawntracker.state.UnitOfMeasure
import com.lawntracker.state.defaultSettings
import com.lawntracker.state.gddBaseTempToString
import com.lawntracker.ui.components.SettingsList
import com.lawntracker.ui.components.SettingsListListProps
import com.lawntracker.ui.components.SettingsListPressProps
import com.lawntracker.ui.components.SettingsListProps
import com.lawntracker.ui.components.SettingsListSliderProps
import com.lawntracker.ui.components.SettingsListSubheaderProps
import com.lawntracker.ui.components.SettingsListToggleProps
import com.lawntracker.ui.components.WarningDialogProps
import kotlin.math.roundToInt

@Composable
fun SettingsScreen(
    settings: Settings,
    setSettings: (Settings) -> Unit,
    clearAll: () -> Unit,
) {
    fun resetSettings() {
        setSettings(defaultSettings())
    }
    fun setDarkMode(value: Boolean) {
        setSettings(settings.copy(dark_mode_enabled = value))
    }
    fun setAutoDarkMode(value: Boolean) {
        setSettings(settings.copy(auto_dark_mode = value))
    }
    fun setAlgorithm(value: GddAlgorithm) {
        setSettings(settings.copy(algorithm = value))
    }
    fun setWarningThresholdPercentage(value: Double) {
        setSettings(settings.copy(warning_threshold_perc = value))
    }
    fun setWarningThresholdDays(value: Double) {
        setSettings(settings.copy(warning_threshold_days = value.roundToInt()))
    }
    fun setEarliestNotificationTime(value: Double) {
        setSettings(settings.copy(earliestNotificationTimeHrs = value.roundToInt()))
    }
    fun setBackgroundTaskInterval(value: Double) {
        setSettings(settings.copy(backgroundTaskIntervalHrs = value))
    }
    fun setDefaultBaseTemp(value: GddBaseTemp) {
        setSettings(settings.copy(default_base_temp = value))
    }
    fun setUnitOfMeasure(value: UnitOfMeasure) {
        setSettings(settings.copy(unit_of_measure = value))
    }

    val settingsListState: List<SettingsListProps> = listOf(
        SettingsListSliderProps(
            key = "0",
            title = "Warning threshold percentage",
            description = "Percentage completion to trigger amber status",
            value = settings.warning_threshold_perc,
            onChange = ::setWarningThresholdPercentage,
            minValue = 0.0,
            maxValue = 1.0,
            step = 0.05,
            stringConverter = { v -> "${formatFixed(v * 100.0, 0)}%" },
        ),
        SettingsListSliderProps(
            key = "0.5",
            title = "Calendar warning threshold (days)",
            description = "Calender trackers only - minimum days remaining to trigger amber status",
            value = settings.warning_threshold_days.toDouble(),
            onChange = ::setWarningThresholdDays,
            minValue = 0.0,
            maxValue = 30.0,
            step = 1.0,
            stringConverter = { v -> formatFixed(v, 0) },
        ),
        SettingsListListProps(
            key = "1",
            title = "Unit of measure - weather",
            description = "Unit of measure for Locations page. Note, will not affect Growing Degree Days (Metric only).",
            value = settings.unit_of_measure,
            list = UNITS_OF_MEASURE,
            onChange = ::setUnitOfMeasure,
            stringConverter = { v -> v.name },
        ),
        SettingsListToggleProps(
            key = "2",
            title = "Dark mode",
            description = "Will not turn off automatically",
            value = settings.dark_mode_enabled,
            onChange = ::setDarkMode,
        ),
        SettingsListToggleProps(
            key = "3",
            title = "Auto dark mode",
            description = "Whether system settings will automatically put app into dark mode",
            value = settings.auto_dark_mode,
            onChange = ::setAutoDarkMode,
        ),
        SettingsListSubheaderProps(
            key = "4.6",
            subheaderTitle = "Notification Settings",
        ),
        SettingsListSliderProps(
            key = "4.7",
            title = "Background task interval (hrs)",
            description = "How often to run the background task that checks if trackers are due. Lower times will mean notifications arrive closer to earliest notification time",
            value = settings.backgroundTaskIntervalHrs,
            onChange = ::setBackgroundTaskInterval,
            minValue = 0.5,
            maxValue = 24.0,
            step = 0.5,
            stringConverter = { v -> formatFixed(v, 1) },
        ),
        SettingsListSliderProps(
            key = "4.8",
            title = "Earliest notification time (24h)",
            description = "Earliest time you'll receive a notification. Setting this to too late in the day increases risk you'll not receive a notification",
            value = settings.earliestNotificationTimeHrs.toDouble(),
            onChange = ::setEarliestNotificationTime,
            minValue = 0.0,
            maxValue = 23.0,
            step = 1.0,
            stringConverter = { v -> "${formatFixed(v, 0)}:00" },
        ),
        SettingsListSubheaderProps(
            key = "5",
            subheaderTitle = "Growing Degree Days Settings",
        ),
        SettingsListListProps(
            key = "6",
            title = "GDD algorithm",
            description = "Unit of measure used to calculate GDD. See help page for more details.",
            value = settings.algorithm,
            list = GDD_ALGORITHMS,
            onChange = ::setAlgorithm,
            stringConverter = { v -> v.label },
        ),
        SettingsListListProps(
            key = "7",
            title = "Default base temp",
            description = "Default base temp to use when adding GDD trackers",
            value = settings.default_base_temp,
            list = GDD_BASE_TEMPS,
            onChange = ::setDefaultBaseTemp,
            stringConverter = ::gddBaseTempToString,
        ),
        SettingsListSubheaderProps(
            key = "7.5",
            subheaderTitle = "Reset App Settings",
        ),
        SettingsListPressProps(
            key = "8",
            title = "Clear all",
            description = "Clear all trackers and locations.",
            warningDialog = WarningDialogProps(
                title = "Confirm clear all",
                message = "Are you sure you want to clear all? All trackers and locations will be cleared.",
            ),
            onPress = clearAll,
        ),
        SettingsListPressProps(
            key = "9",
            title = "Reset settings",
            description = "Reset to default settings",
            warningDialog = WarningDialogProps(
                title = "Confirm reset",
                message = "Are you sure you want to reset?",
            ),
            onPress = ::resetSettings,
        ),
    )

    SettingsList(list = settingsListState)
}

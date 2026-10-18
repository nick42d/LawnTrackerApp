package com.lawntracker

import com.lawntracker.state.UnitOfMeasure

const val MAX_HISTORY_DAYS = 30
const val MAX_FORECAST_DAYS = 7
const val EXTRA_ESTIMATE_DAYS = 3
const val MAX_GRAPH_ESTIMATE_DAYS = 30

val API_WEATHER_CURRENT_PARAMS = listOf(
    "is_day",
    "weather_code",
    "temperature_2m",
)

val API_WEATHER_DAILY_PARAMS = listOf(
    "temperature_2m_max",
    "temperature_2m_min",
)

const val API_TIMEZONE = "auto"
const val API_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
const val API_LOCATIONS_URL = "https://geocoding-api.open-meteo.com/v1/search"
const val API_LOCATIONS_LANGUAGE = "en"
val API_UNIT_OF_MEASURE = UnitOfMeasure.Metric
const val DATE_PICKER_LOCALE = "en-GB"
const val MAX_TOTAL_ASYNC_STORAGE_BYTES = 6L * 1024L * 1024L

const val LOCATIONS_STORAGE_KEY = "LOCATIONS_STATE"
const val GDD_TRACKERS_STORAGE_KEY = "GDD_TRACKERS_STATE"
const val SETTINGS_STORAGE_KEY = "SETTINGS"
const val BACKGROUND_TASK_MANAGER_STORAGE_KEY = "BGTASK"

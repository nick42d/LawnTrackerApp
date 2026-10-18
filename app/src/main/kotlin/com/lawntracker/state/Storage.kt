package com.lawntracker.state

import android.content.Context
import com.github.michaelbull.result.get
import com.github.michaelbull.result.onFailure
import com.github.michaelbull.result.onSuccess
import com.github.michaelbull.result.runCatching
import com.lawntracker.BACKGROUND_TASK_MANAGER_STORAGE_KEY
import com.lawntracker.GDD_TRACKERS_STORAGE_KEY
import com.lawntracker.LOCATIONS_STORAGE_KEY
import com.lawntracker.SETTINGS_STORAGE_KEY
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json

enum class StorageKey(val rawKey: String) {
    Locations(LOCATIONS_STORAGE_KEY),
    Trackers(GDD_TRACKERS_STORAGE_KEY),
    Settings(SETTINGS_STORAGE_KEY),
    BackgroundTaskManager(BACKGROUND_TASK_MANAGER_STORAGE_KEY),
}

val storageJson = Json {
    ignoreUnknownKeys = false
    encodeDefaults = true
}

private val storageMutex = Mutex()
private const val STORAGE_PREFS_NAME = "lawntracker_storage"

suspend fun getStoredItem(context: Context, key: StorageKey): String? =
    withContext(Dispatchers.IO) {
        storageMutex.withLock {
            val prefs = context.applicationContext.getSharedPreferences(STORAGE_PREFS_NAME, Context.MODE_PRIVATE)
            prefs.getString(key.rawKey, null)
        }
    }

suspend fun setStoredItem(context: Context, key: StorageKey, value: String) =
    withContext(Dispatchers.IO) {
        storageMutex.withLock {
            val prefs = context.applicationContext.getSharedPreferences(STORAGE_PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(key.rawKey, value).commit()
        }
    }

suspend fun getAllStoredKeysAndBytes(context: Context): Pair<Int, Long> =
    withContext(Dispatchers.IO) {
        storageMutex.withLock {
            val prefs = context.applicationContext.getSharedPreferences(STORAGE_PREFS_NAME, Context.MODE_PRIVATE)
            val all = prefs.all
            val totalKeys = all.keys.size
            val totalBytes = all.values.sumOf { v ->
                (v as? String)?.encodeToByteArray()?.size?.toLong() ?: 0L
            }
            Pair(totalKeys, totalBytes)
        }
    }

suspend fun getStoredState(context: Context): StoredState? {
    val containsLoc = getStoredItem(context, StorageKey.Locations)
    val containsTrackers = getStoredItem(context, StorageKey.Trackers)
    if (containsLoc == null && containsTrackers == null) {
        println("Missing some App state on device - using defaults")
        return null
    }
    println("Loading app state from device")
    return runCatching {
        val locations = if (containsLoc != null) {
            storageJson.decodeFromString<Locations>(containsLoc).locations
        } else {
            emptyList()
        }
        val trackers = if (containsTrackers != null) {
            storageJson.decodeFromString<Trackers>(containsTrackers).trackers
        } else {
            emptyList()
        }
        StoredState(
            trackers = trackers,
            locations = locations,
        )
    }.onFailure { e ->
        println("Error parsing stored state: ${e.message}")
    }.get()
}

suspend fun writeTrackers(context: Context, trackers: List<Tracker>) {
    val output = Trackers(
        apiVersion = SchemaVersion.V0_1,
        trackers = trackers,
    )
    println("Writing app state - trackers")
    runCatching {
        storageJson.encodeToString(output)
    }.onSuccess { encoded ->
        setStoredItem(context, StorageKey.Trackers, encoded)
        println("Wrote trackers")
    }.onFailure { e ->
        println("Error writing trackers: ${e.message}")
    }
}

suspend fun writeLocations(context: Context, locations: List<Location>) {
    val output = Locations(
        apiVersion = SchemaVersion.V0_1,
        locations = locations,
    )
    println("Writing app state - locations")
    runCatching {
        storageJson.encodeToString(output)
    }.onSuccess { encoded ->
        setStoredItem(context, StorageKey.Locations, encoded)
        println("Wrote locations")
    }.onFailure { e ->
        println("Error writing locations: ${e.message}")
    }
}

suspend fun getStoredSettings(context: Context): Settings? {
    println("Attempting to get Settings from device")
    val maybeSettings = getStoredItem(context, StorageKey.Settings)
    if (maybeSettings != null) {
        return runCatching {
            storageJson.decodeFromString<Settings>(maybeSettings)
        }.onFailure { e ->
            println("Error parsing stored settings: ${e.message}")
        }.get()
    }
    println("Settings were not found on device")
    return null
}

suspend fun writeSettings(context: Context, settings: Settings) {
    println("Setting settings")
    runCatching {
        storageJson.encodeToString(settings)
    }.onSuccess { encoded ->
        setStoredItem(context, StorageKey.Settings, encoded)
        println("Settings set")
    }.onFailure { e ->
        println("Error setting settings: ${e.message}")
    }
}

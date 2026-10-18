# About

LawnTracker is an open source Android app designed to keep track of lawn maintenance tasks and notify you when they are due. The app can deal with duration based, calendar based, and growing degree day based tasks.

Weather data by [Open-Meteo.com](https://www.open-meteo.com)

# Features
- Keep track of tasks that are weather dependent (based on growing degree days) and non-weather dependent.
- Estimate when growing degree day targets will be met based on weather forecast (or linear projection when forecast isn't available)
- Notifications when tasks are due
- No login required - the app all runs locally from your phone
- Light/dark mode

# Screenshots
<img src="https://github.com/nick42d/LawnTrackerApp/assets/133559267/e6affabe-eddf-41b0-92e7-23e95d1af909" width=30% height=30%/>
<img src="https://github.com/nick42d/LawnTrackerApp/assets/133559267/de74dc6b-c261-4676-9527-b686a69aa8c0" width=30% height=30%/>
<img width="1280" height="2856" alt="Screenshot_1792327142_dual" src="https://github.com/user-attachments/assets/bfaf266a-70c6-4051-9e85-47636e2843ca" />
<img width="1280" height="2856" alt="screenshot" src="https://github.com/user-attachments/assets/57e418cc-e5f1-4e6c-bda5-a90e48c884e8" />

# Installation / Setup

The app is intended to be made available on F-Droid and the Google Play Store.

No setup is required. To add a new tracker, press the plus button on the home screen and enter the tracker details.

# Development

## Design notes

- This is a jetpack compose, kotlin app.
- The app has been designed to be serverless.
  Instead of running on the server, the app periodically spins up background tasks library to see if tasks are overdue, then generates notifications.

## How to build and run

### Prerequisites & Required Tools

- **JDK**
- **Android Studio** (or the **Android SDK Command-Line Tools**)
- **Android SDK** with the following packages installed via SDK Manager:
  - **Android SDK Platform**
  - **Android SDK Build-Tools**
  - **Android SDK Platform-Tools** (for `adb`)
- An **Android Emulator** or physical Android device.

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nick42d/LawnTrackerApp.git
   cd LawnTrackerApp
   ```
2. **Configure the Android SDK location:**
   - **If using Android Studio:** Open the project directory in Android Studio; it will automatically detect your SDK and generate `local.properties`.
   - **If building from the command line:** Ensure the `ANDROID_HOME` environment variable is set, or create a `local.properties` file in the root of the project pointing to your Android SDK installation:
     ```properties
     sdk.dir=/path/to/your/android/sdk
     ```
### Build and Run

#### Option 1: Using Android Studio
1. Open the root project folder in **Android Studio**.
2. Allow Gradle to sync and download all required dependencies.
3. Start an Android Emulator or connect a physical device with USB debugging enabled.
4. Select the `app` run configuration and click **Run** (`Shift + F10` on Linux/Windows, `Ctrl + R` on macOS).

#### Option 2: Using the Command Line (Gradle Wrapper)

Build the debug APK from the root of the project:

```bash
./gradlew assembleDebug
```
The compiled APK will be output to `app/build/outputs/apk/debug/app-debug.apk`.

To build, install, and launch the app directly on a running emulator or connected device:

```bash
# Install the debug build onto the connected device/emulator
./gradlew installDebug

# Launch the main activity
adb shell am start -n com.lawntracker/.MainActivity
```

To run the unit test suite:

```bash
./gradlew testDebugUnitTest
```

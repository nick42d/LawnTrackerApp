<a href="https://www.flaticon.com/free-icons/mowing" title="mowing icons">Mowing icons created by Freepik - Flaticon</a>

# About

LawnTracker is an open source React Native (Android) app designed to keep track of lawn maintenance tasks and notify you when they are due. The app can deal with duration based, calendar based, and growing degree day based tasks.

# Installation

The app is intended to be made available on F-Droid and the Google Play Store.

# Setup

No setup is required. To add a new tracker, press the plus button on the home screen and enter the tracker details.

# Development

## Design notes

- Whilst React Native is cross-platform, I haven't tested the app on iOS as I don't own an Apple device or XCode.
- The app has been designed to be serverless.
  Instead of running on the server, the app periodically spins up background tasks using the react-native-background-task see if tasks are overdue.
- Due to iOS restrictions - if the app was ported to iOS, notifications won't be possible once the app is terminated under the current serverless architecture.
- Notifications are generated using the notifee library.

## How to build and run

### Set up your React Native environment

Complete the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step.

### Start the Metro Server

To start Metro, run the following command from the _root_ of the project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Start the Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of the project. Run the following command:

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

If everything is set up _correctly_, you should see your new app running in your _Emulator_

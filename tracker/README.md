# Prerequisites (cross-platform)

- **Java**: Java 17 (JDK 17). Ensure `java -version` reports 17.
- **Android**:
  - Android Studio with SDK Platform 34 and Build Tools 35.0.0 installed
  - NDK r26 (26.1.10909125) installed
  - ANDROID_HOME/ANDROID_SDK_ROOT configured; `platform-tools` on PATH
- **Node**: Node 20+ and npm 9+ (or yarn 1.x)
- **CMake/Ninja**: Installed via Android SDK (CMake 3.22.1+)
- **iOS (macOS only)**:
  - Xcode 15+
  - CocoaPods (via Bundler: `bundle install`)

Project defaults (Android): compileSdk 34, targetSdk 34, minSdk 24. These are enforced at the project level; no edits in node_modules are required. A patch is applied automatically for `react-native-ble-advertiser` via patch-package on install.

## Quick Start

```bash
# From tracker/
npm ci
npm start

# Android debug build
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk

cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

If you see Gradle warnings about buildTools, they are informational (AGP selects a compatible version at build time).

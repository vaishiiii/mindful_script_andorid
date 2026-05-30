# MindScript Android Studio Package

This folder is Android Studio-ready.

## Open and Run

1. Open Android Studio.
2. Click **Open**.
3. Select this folder:
  c:\Users\vaish\Downloads\mindscript\android-studio-ready
4. Wait for Gradle sync to finish.
5. Run on emulator/device using the **Run** button.

## Notes

- This package includes:
  - Native Android project files
  - Synced web assets (`app/src/main/assets/public`)
  - Required Capacitor Android plugin sources under `node_modules`
- `capacitor.settings.gradle` is already adjusted for this standalone folder layout.

## If Sync Fails

1. Ensure JDK is installed and `JAVA_HOME` is set.
2. Ensure Android SDK is installed (Android Studio SDK Manager).
3. If needed, update `local.properties` with your SDK path:

```properties
sdk.dir=C:\\Users\\<your-user>\\AppData\\Local\\Android\\Sdk
```

4. Then in Android Studio: **File -> Sync Project with Gradle Files**.

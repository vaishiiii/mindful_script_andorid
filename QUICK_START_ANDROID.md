# 🚀 Quick Start - Build Your Android App

## Super Fast Method (5 Minutes)

### 1️⃣ Build and Sync
Run the automated script:
```powershell
.\build-android.ps1
```

Or manually:
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run android:run
```

### 2️⃣ Install Android Studio
If not installed: https://developer.android.com/studio

### 3️⃣ Open Project
When Android Studio opens:
- Wait for Gradle sync (5-10 min first time)
- Click green ▶️ Run button
- Choose device or create emulator

### 4️⃣ Test on Your Phone
1. Enable Developer Mode on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging
2. Connect phone via USB
3. Click ▶️ in Android Studio
4. Select your device

**That's it! Your app will install and run!** 🎉

---

## Making Updates

After changing your web code:

```bash
# Quick update
npm run android:sync

# Or use the script
.\build-android.ps1
```

---

## Building APK for Friends/Testing

In Android Studio:
1. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. APK saved to: `android\app\build\outputs\apk\debug\app-debug.apk`
3. Share this file - anyone can install it!

---

## For Play Store (Release Build)

See full guide: [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)

Quick steps:
1. Generate signing key (one time)
2. Configure signing in `build.gradle`
3. Build AAB: `Build` → `Generate Signed Bundle`
4. Upload to Google Play Console

---

## Useful Commands

```bash
# Build & sync & open
npm run android:run

# Just sync changes
npm run android:sync

# Just open Android Studio
npm run android:open

# Manual build
npm run build
npx cap sync android
npx cap open android
```

---

## Need Help?

- Check [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) for detailed instructions
- Android Studio issues? → Clean Project, Rebuild
- App crashes? → Check logcat in Android Studio
- Gradle errors? → `cd android && .\gradlew clean`

---

**Your Android project is ready to go! 🚀**

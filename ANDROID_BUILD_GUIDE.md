# 📱 MindScript Android App - Build Guide

Your web app has been successfully configured for Android! Follow these steps to build an APK and publish to Google Play Store.

## ✅ What's Already Done

- ✅ Capacitor installed and configured
- ✅ Android platform added to your project
- ✅ Web assets built and synced to Android project
- ✅ Bundle ID: `com.mindscript.app`

---

## 🛠️ Prerequisites

### 1. Install Android Studio
Download and install: https://developer.android.com/studio

### 2. Install Java Development Kit (JDK)
- Android Studio usually includes JDK 17
- Or download separately: https://adoptium.net/

### 3. Set Environment Variables (Windows)
Add these to your System Environment Variables:
- `ANDROID_HOME`: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- `JAVA_HOME`: Path to your JDK installation

---

## 📦 Build APK (Debug - For Testing)

### Method 1: Using Android Studio (Recommended)

1. **Open Project in Android Studio:**
   ```bash
   cd c:\Users\vaish\Downloads\mindscript
   npx cap open android
   ```

2. **Wait for Gradle Sync** (first time takes 5-10 minutes)

3. **Build APK:**
   - Click `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - APK will be created in: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **Install on Device:**
   - Connect your Android phone via USB (enable Developer Mode)
   - Click the green ▶️ Run button in Android Studio

### Method 2: Using Command Line

```bash
cd c:\Users\vaish\Downloads\mindscript\android
.\gradlew assembleDebug
```

APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🚀 Build AAB (Release - For Play Store)

Google Play Store requires **AAB (Android App Bundle)** format, not APK.

### Step 1: Generate Signing Key

```bash
cd c:\Users\vaish\Downloads\mindscript\android\app
keytool -genkey -v -keystore mindscript-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mindscript
```

**Important:** Save your keystore password and alias password securely!

### Step 2: Configure Signing

Create file: `android/key.properties`

```properties
storePassword=YourKeystorePassword
keyPassword=YourKeyPassword
keyAlias=mindscript
storeFile=mindscript-release-key.jks
```

⚠️ **Add to .gitignore:**
```
android/key.properties
android/app/*.jks
```

### Step 3: Update build.gradle

Edit `android/app/build.gradle`:

Add before `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { ... }`, add:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Step 4: Build Release AAB

Using Android Studio:
1. `Build` → `Generate Signed Bundle / APK`
2. Select `Android App Bundle`
3. Choose your keystore
4. Build

Using Command Line:
```bash
cd android
.\gradlew bundleRelease
```

AAB location: `android\app\build\outputs\bundle\release\app-release.aab`

---

## 🎨 Customize Your App

### App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">MindScript</string>
```

### App Icon
Replace icons in:
- `android/app/src/main/res/mipmap-*` folders
- Use Android Studio's Image Asset Studio: Right-click `res` → `New` → `Image Asset`

### Splash Screen
Edit colors in `android/app/src/main/res/values/styles.xml`

### Minimum Android Version
Edit `android/app/build.gradle`:
```gradle
minSdkVersion 22  // Android 5.1 and above
targetSdkVersion 34
```

---

## 🔄 Update Your App After Changes

When you update your web app:

```bash
# 1. Build web app
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

---

## 📱 Google Play Store Submission

### Requirements

1. **Google Play Console Account**
   - Cost: $25 one-time fee
   - Create at: https://play.google.com/console

2. **App Information**
   - App name: MindScript
   - Short description (80 chars)
   - Full description (4000 chars)
   - Category: Health & Fitness / Lifestyle
   - Screenshots (at least 2, up to 8)
   - Feature graphic (1024 x 500)
   - App icon (512 x 512)

3. **Privacy Policy**
   - Required! Host on your website

4. **Content Rating**
   - Fill out IARC questionnaire

5. **App Bundle**
   - Upload your `app-release.aab`

### Submission Steps

1. Go to Google Play Console
2. Create New App
3. Fill in all required information
4. Upload AAB to Production track (or Internal Testing first)
5. Complete content rating questionnaire
6. Add privacy policy URL
7. Add store listing (screenshots, description, etc.)
8. Submit for review (typically 1-7 days)

---

## 🐛 Common Issues

### Gradle Build Failed
```bash
cd android
.\gradlew clean
.\gradlew build
```

### Web Assets Not Updated
```bash
npm run build
npx cap sync android
```

### Keystore Lost?
⚠️ If you lose your keystore, you cannot update your app on Play Store!
Always backup: `android/app/mindscript-release-key.jks`

### App Crashes on Startup
- Check permissions in `AndroidManifest.xml`
- Check for CORS issues if making API calls
- View logs: `adb logcat`

---

## 📋 Quick Reference Commands

```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build debug APK (command line)
cd android && .\gradlew assembleDebug

# Build release AAB (command line)
cd android && .\gradlew bundleRelease

# Install on connected device
cd android && .\gradlew installDebug
```

---

## 🎯 Next Steps

1. ✅ **Test the App:**
   - Open in Android Studio
   - Run on emulator or real device
   - Test all features thoroughly

2. ✅ **Customize Branding:**
   - Add custom app icon
   - Configure splash screen
   - Update app name if needed

3. ✅ **Prepare Store Listing:**
   - Take screenshots
   - Write compelling description
   - Create feature graphic

4. ✅ **Build Release AAB:**
   - Generate signing key
   - Build signed bundle
   - Test on real devices

5. ✅ **Submit to Play Store:**
   - Create Play Console account
   - Upload AAB
   - Complete all required fields
   - Submit for review

---

## 📞 Support Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Developers:** https://developer.android.com
- **Play Console Help:** https://support.google.com/googleplay/android-developer

---

## ⚠️ Important Notes

- **Bundle ID** (`com.mindscript.app`) cannot be changed after Play Store submission
- **Keystore** must be kept secure - losing it means you can't update your app
- **Version codes** must increment with each release
- First Play Store review can take up to 7 days
- Test thoroughly before submitting!

---

**Your Android project is ready! 🎉**

Start by opening it in Android Studio:
```bash
npx cap open android
```

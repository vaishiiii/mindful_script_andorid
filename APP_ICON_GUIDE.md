# 🎨 App Icon & Visual Assets Guide

## Required Images for Play Store

### 📱 App Icon
**Specs:**
- Size: 512 x 512 px
- Format: PNG (32-bit)
- No transparency
- Square, no rounded corners (Android adds them)

**Where to Create:**
- Canva: https://www.canva.com (512x512 design)
- Figma: https://www.figma.com
- Adobe Express: https://www.adobe.com/express

**Free Icon Tools:**
- Material Icons: https://fonts.google.com/icons
- Flaticon: https://www.flaticon.com
- IconScout: https://iconscout.com

### 🖼️ Feature Graphic
**Specs:**
- Size: 1024 x 500 px
- Format: PNG or JPG
- Used at top of Play Store listing

**Tips:**
- Show app screenshot with branding
- Include text describing key feature
- Use your brand colors
- Keep important content in center

### 📸 Screenshots
**Specs:**
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Format: PNG or JPG
- Dimensions: 
  - Phone: 1080 x 1920 px (16:9 ratio) or actual device resolution
  - Tablet (optional): 1920 x 1080 px

**How to Capture:**
- Use Android Studio emulator
- Use real device (Power + Volume Down)
- Edit with screenshot tools

**What to Show:**
1. Main screen/home
2. Key features in action
3. Before/after results
4. User benefits
5. Premium features

---

## 🛠️ Add Icon to Your Android App

### Method 1: Android Studio Image Asset Studio (Easiest)

1. Open project in Android Studio
2. Right-click `android/app/src/main/res`
3. `New` → `Image Asset`
4. Choose:
   - **Asset Type:** Image
   - **Path:** Browse to your 512x512 PNG icon
   - **Name:** ic_launcher
5. Click "Next" → "Finish"

This automatically generates all required sizes!

### Method 2: Manual Icon Replacement

Replace icons in these folders:
```
android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png (48x48)
  ├── mipmap-hdpi/ic_launcher.png (72x72)
  ├── mipmap-xhdpi/ic_launcher.png (96x96)
  ├── mipmap-xxhdpi/ic_launcher.png (144x144)
  └── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

**Generate All Sizes:**
- AppIcon: https://www.appicon.co
- MakeAppIcon: https://makeappicon.com
- Icon Kitchen: https://icon.kitchen

### Method 3: Adaptive Icons (Recommended for Modern Android)

Create adaptive icon with foreground + background:

1. In Image Asset Studio, select:
   - **Asset Type:** Image
   - **Foreground Layer:** Your logo/icon (transparent PNG)
   - **Background Layer:** Solid color or gradient
2. Preview different shapes (circle, square, rounded)
3. Generate

---

## 🎨 Design Tips for MindScript Icon

### Option 1: Mind/Brain Theme
- Abstract brain outline
- Neural network pattern
- Head silhouette with mindfulness symbol

### Option 2: Meditation/Calm Theme
- Lotus flower
- Zen circle (Enso)
- Person in meditation pose
- Ripple effect in water

### Option 3: Text-Based
- "MS" monogram
- Stylized "mind" typography
- Mix of icon + text

### Color Suggestions
Based on your app's design system:
- Primary: Sage green (#A8B89E, #9BB5B8)
- Accent: Soft purple (#B89EC4)
- Background: Cream/white (#F5F0E8)
- Contrast: Dark sage (#7A8EA0)

**Icon Color Rules:**
- Use 2-3 colors maximum
- High contrast for visibility
- Avoid gradients on small sizes
- Test on white & dark backgrounds

---

## 📐 Icon Size Reference

### Android Icon Sizes (All Required)
```
ldpi:    36 x 36 px   (rarely needed)
mdpi:    48 x 48 px   ✓
hdpi:    72 x 72 px   ✓
xhdpi:   96 x 96 px   ✓
xxhdpi:  144 x 144 px ✓
xxxhdpi: 192 x 192 px ✓
```

### Play Store
```
High-res icon: 512 x 512 px
Feature graphic: 1024 x 500 px
Promo graphic (opt): 180 x 120 px
```

---

## 📱 Configure Splash Screen

### Edit Android Splash Screen Colors

File: `android/app/src/main/res/values/styles.xml`

```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@color/splash_background</item>
</style>
```

File: `android/app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#9BB5B8</color>
    <color name="colorPrimaryDark">#7A8EA0</color>
    <color name="colorAccent">#B89EC4</color>
    <color name="splash_background">#F5F0E8</color>
</resources>
```

### Add Custom Splash Screen

1. Create splash screen image: 2048 x 2048 px PNG
2. Use Image Asset Studio to import
3. Or use Capacitor Splash Screen plugin:

```bash
npm install @capacitor/splash-screen
```

---

## 🎯 Play Store Listing Assets Checklist

### Required ✓
- [ ] App icon: 512 x 512 PNG
- [ ] Feature graphic: 1024 x 500 PNG/JPG
- [ ] At least 2 screenshots (phone)

### Recommended ✓
- [ ] 4-8 screenshots showing key features
- [ ] Tablet screenshots (if supporting tablets)
- [ ] Promo video (YouTube link)
- [ ] Promo graphic: 180 x 120 px

### Store Listing Text ✓
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars max)
- [ ] App title (30 chars max)

---

## 📝 Example MindScript Descriptions

### Short Description (80 chars)
```
Daily mindfulness & breath work for calm, focus, confidence, and healing.
```

### Full Description (Sample)
```
Transform your mind, one breath at a time.

MindScript is your personal mindfulness companion, offering guided programs 
for nervous system regulation, sustained focus, and mental clarity.

🧘 7 CORE DOMAINS:
• Calm - Reset your stress baseline
• Focus - Build sustained attention
• Confidence - Develop self-trust
• Healing - Process emotions safely
• Discipline - Close the action gap
• Purpose - Align with your values
• Habit Building - Install durable behaviors

✨ FEATURES:
• Structured 5, 7, and 21-day programs
• Morning, midday, and evening practices
• Evidence-based breath protocols
• Progress tracking
• Personalized recommendations

Whether you're managing stress, building discipline, or seeking clarity, 
MindScript meets you where you are and guides you forward.

Start your transformation today.
```

---

## 🛠️ Helpful Tools

### Icon Generators
- **App Icon Generator**: https://www.appicon.co
- **Icon Kitchen**: https://icon.kitchen
- **Make App Icon**: https://makeappicon.com

### Design Tools
- **Canva**: https://www.canva.com (free templates)
- **Figma**: https://www.figma.com (free)
- **Photopea**: https://www.photopea.com (free Photoshop alternative)

### Screenshot Tools
- **Figma**: Create mockups with device frames
- **MockUPhone**: https://mockuphone.com
- **Previewed**: https://previewed.app

### Color Palette
- **Coolors**: https://coolors.co
- **Adobe Color**: https://color.adobe.com

---

## 🎨 Quick Reference: Your Brand Colors

From your design system (`src/styles/designSystem.js`):

```
Sage Green:  #9BB5B8 (Calm)
Focus Blue:  #8E9EC4 (Focus)
Warm Tan:    #C4A882 (Confidence)
Soft Green:  #A8B89E (Healing)
Steel Blue:  #7A8EA0 (Discipline)
Soft Purple: #B89EC4 (Purpose)
Habit Green: #9EB8A0 (Habit Building)

Background:  #F5F0E8 (Cream)
Text:        #2C3530 (Dark)
```

---

**Next Steps:**
1. Create your 512x512 app icon
2. Use Android Studio Image Asset to add it
3. Prepare feature graphic (1024x500)
4. Take 4-6 screenshots
5. Write compelling store description

Ready to stand out on the Play Store! 🚀

# Development Build Guide

**Last Updated:** October 21, 2025

---

## Overview

This guide covers creating development builds for the Pitch Height Tracker Pro app, which is necessary to test native modules like VisionCamera.

---

## Why Development Build?

**Standard Expo Go Limitations:**

- ❌ Cannot use VisionCamera (custom native module)
- ❌ Cannot test actual camera functionality
- ❌ Cannot test real-time frame processing

**Development Build Benefits:**

- ✅ Full VisionCamera support
- ✅ Real camera preview and capture
- ✅ Test all Phase 2 features
- ✅ Faster iteration than production builds

---

## Prerequisites

### For iOS Development:

- ✅ macOS with Xcode 14+ installed
- ✅ CocoaPods (`sudo gem install cocoapods`)
- ✅ iOS Simulator or physical iPhone
- ✅ Active Apple Developer account (for device testing)

### For Android Development:

- ✅ Android Studio installed
- ✅ Android SDK (API 21+)
- ✅ Android Emulator or physical Android device
- ✅ Java JDK 11+

---

## Build Methods

### Method 1: Local Build (Recommended for Development)

**Pros:**

- Fastest build times
- No cloud dependency
- Free (no EAS account needed)
- Full control over build process

**Cons:**

- Requires local Xcode/Android Studio setup
- More initial configuration

**Commands:**

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Specific simulator
npx expo run:ios --simulator="iPhone 15 Pro"

# Physical device
npx expo run:ios --device
```

---

### Method 2: EAS Build (Cloud-based)

**Pros:**

- No local Xcode/Android Studio needed
- Consistent build environment
- Easy team sharing

**Cons:**

- Slower (cloud queue)
- Requires EAS account
- May have usage limits on free tier

**Setup:**

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure

# Build for development
eas build --profile development --platform ios
eas build --profile development --platform android

# Build for simulator (faster, no signing needed)
eas build --profile development --platform ios --local
```

---

## First-Time Build Steps

### iOS Local Build:

1. **Verify Prerequisites**

   ```bash
   xcodebuild -version  # Should show Xcode version
   pod --version         # Should show CocoaPods version
   ```

2. **Clean Previous Builds** (if any)

   ```bash
   rm -rf ios android
   npx expo prebuild --clean
   ```

3. **Build and Run**

   ```bash
   npx expo run:ios
   ```

4. **Wait for Build** (5-10 minutes first time)
   - Expo generates iOS project
   - CocoaPods installs dependencies
   - Xcode builds the app
   - Simulator launches automatically
   - App installs and opens

5. **Development Server**
   - Keep Expo dev server running
   - Hot reload works for JS changes
   - Native changes require rebuild

---

### Android Local Build:

1. **Start Android Emulator**
   - Open Android Studio
   - AVD Manager → Start emulator
   - Or connect physical device with USB debugging

2. **Verify ADB**

   ```bash
   adb devices  # Should list your emulator/device
   ```

3. **Build and Run**

   ```bash
   npx expo run:android
   ```

4. **Wait for Build** (10-15 minutes first time)
   - Expo generates Android project
   - Gradle downloads dependencies
   - App builds and installs
   - Launches automatically

---

## Configuration Files

### eas.json (EAS Build Configuration)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

### app.json (App Configuration)

Key settings for development builds:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.slowpitched.pitchtracker",
      "infoPlist": {
        "NSCameraUsageDescription": "We need camera access to track pitch heights"
      }
    },
    "android": {
      "package": "com.slowpitched.pitchtracker",
      "permissions": ["android.permission.CAMERA"]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow app to access your camera"
        }
      ]
    ]
  }
}
```

---

## Troubleshooting

### iOS Build Errors

**Error: "No podspec found for..."**

```bash
cd ios
pod install --repo-update
cd ..
```

**Error: "Code signing required"**

- Open `ios/slowpitched.xcworkspace` in Xcode
- Select project → Signing & Capabilities
- Choose your team/development certificate

**Error: "Simulator not found"**

```bash
xcrun simctl list  # List available simulators
npx expo run:ios --simulator="iPhone 15 Pro"
```

**Build succeeds but app crashes on launch:**

- Check Metro bundler is running
- Verify no conflicting ports (8081, 19000, 19001)
- Check console logs in Xcode

---

### Android Build Errors

**Error: "SDK location not found"**

```bash
# Create/edit android/local.properties
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > android/local.properties
```

**Error: "Execution failed for task ':app:installDebug'"**

```bash
adb kill-server
adb start-server
adb devices
```

**Error: "Could not resolve all dependencies"**

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

### General Issues

**Metro bundler not starting:**

```bash
# Kill any running Metro instances
lsof -ti:8081 | xargs kill -9

# Start fresh
npx expo start --clear
```

**Native module not found:**

```bash
# Rebuild native project
rm -rf ios android
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

**Changes not reflecting:**

- JS changes: Shake device → Reload (or press 'r' in terminal)
- Native changes: Full rebuild required
- Config changes: Rebuild required

---

## Testing Camera Functionality

Once the development build is running:

### 1. Grant Camera Permission

- App will request camera permission on first launch
- Tap "Allow" in system dialog
- If denied, go to Settings → Privacy → Camera

### 2. Test Tracking Screen

- Navigate to "Track" tab
- Verify camera preview appears
- Test ROI dragging
- Enter reference height and calibrate

### 3. Verify Features

- ✓ Camera preview live
- ✓ ROI overlay draggable
- ✓ Calibration meter updates
- ✓ Coach overlay appears
- ✓ Detection indicator shows status

### 4. Check Performance

- FPS should be 30+ (check Metro logs)
- ROI dragging smooth
- No lag in UI updates

---

## Next Steps After Successful Build

1. **Test All Phase 2 Features**
   - See TESTING_GUIDE.md for checklist

2. **Report Issues**
   - Camera not working
   - Performance problems
   - UI glitches

3. **Prepare for Phase 3**
   - Data layer implementation
   - SQLite integration
   - Zustand state management

---

## Build Scripts Reference

```bash
# Development
npx expo run:ios                    # Build & run on simulator
npx expo run:ios --device           # Build & run on device
npx expo run:ios --configuration Release  # Release build

# Clean builds
rm -rf ios android                  # Remove native folders
npx expo prebuild --clean           # Regenerate native projects

# Production builds (EAS)
eas build --platform ios           # Production iOS
eas build --platform android       # Production Android
eas build --platform all           # Both platforms
```

---

## Resources

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [VisionCamera Documentation](https://react-native-vision-camera.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Troubleshooting Guide](https://docs.expo.dev/troubleshooting/overview/)

---

**Happy Building! 🚀**

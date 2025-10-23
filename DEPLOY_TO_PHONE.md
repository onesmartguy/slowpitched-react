# Deploy to Your iPhone - Quick Guide

This guide will help you get the Pitch Height Tracker Pro app running on your iPhone for testing.

## Why Native Build is Required

This app uses **react-native-vision-camera** which requires native iOS code. This means:
- ❌ **Cannot use Expo Go** (Expo Go doesn't support custom native modules)
- ✅ **Must use EAS Build** or **Development Build**

## Option 1: EAS Build (Recommended - Easiest)

EAS Build will create a proper iOS build you can install directly on your phone.

### Prerequisites
- iPhone with iOS 13.4 or higher
- Apple ID (free or paid Apple Developer account)
- Expo account (you're already logged in as `onesmartguy`)

### Steps

1. **Run the build command interactively**:
   ```bash
   npx eas build --profile preview --platform ios
   ```

2. **When prompted, provide your Apple credentials**:
   - Enter your Apple ID email
   - Enter your Apple ID password
   - Complete 2FA if required

   EAS will automatically:
   - Create a distribution certificate
   - Create a provisioning profile
   - Register your app with Apple
   - Build the IPA file

3. **Wait for the build** (typically 10-20 minutes):
   - You'll see a build URL in the terminal
   - You can monitor progress at: https://expo.dev/accounts/onesmartguy/projects/slowpitched/builds

4. **Install on your iPhone**:
   - Once complete, EAS will provide a download link
   - Open the link on your iPhone
   - Tap "Install"
   - Trust the developer certificate in Settings > General > VPN & Device Management

### Alternative: TestFlight Distribution

For a more "official" experience:

```bash
# Build for TestFlight
npx eas build --profile production --platform ios

# Submit to TestFlight
npx eas submit --platform ios
```

Then install via TestFlight app on your iPhone (requires Apple Developer account).

## Option 2: Development Build (For Active Development)

If you want to develop and test rapidly with hot-reload:

### Prerequisites
- Mac computer
- Xcode installed
- iPhone connected via USB or on same WiFi network

### Steps

1. **Create a development build**:
   ```bash
   npx eas build --profile development --platform ios --local
   ```

2. **Install on your iPhone** (via Xcode or EAS download link)

3. **Start the dev server**:
   ```bash
   pnpm start
   ```

4. **Press "d" for development build** and select your device

5. **Hot reload enabled** - changes will appear instantly!

## Option 3: Local Build with Expo Prebuild (Advanced)

If you want full control:

1. **Prebuild the iOS native project**:
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Open in Xcode**:
   ```bash
   open ios/slowpitched.xcworkspace
   ```

3. **Connect your iPhone** and select it as the target

4. **Click Run** in Xcode

## Recommended Approach for Testing

**For your first test**, I recommend **Option 1 (EAS Build)** because:
- ✅ Simplest to get working
- ✅ No Xcode or Mac required
- ✅ Installs like a real app
- ✅ Can share the link with others for testing
- ✅ Automatic credential management

## Step-by-Step: Your First Build

Let me help you start your first build. Run this command:

```bash
npx eas build --profile preview --platform ios
```

**You'll be asked**:
1. "Do you want to log in to your Apple account?" → **Yes**
2. Enter your Apple ID email
3. Enter your Apple ID password
4. Complete 2FA if prompted
5. "Generate a new Apple Distribution Certificate?" → **Yes**
6. "Generate a new Apple Provisioning Profile?" → **Yes**

**Then EAS will**:
- Set up all credentials
- Start the cloud build
- Give you a URL to track progress
- Email you when complete

**When build completes**:
- Open the EAS build page on your iPhone
- Tap "Install"
- Trust the certificate in Settings
- Launch the app!

## Troubleshooting

### "Untrusted Developer"
- Go to Settings > General > VPN & Device Management
- Tap your Apple ID
- Tap "Trust"

### "Unable to Install"
- Make sure your iOS version is 13.4+
- Check that you have enough storage space
- Try deleting old versions of the app first

### Build Fails
- Check that all dependencies are installed: `pnpm install`
- Verify your Apple ID credentials are correct
- Check the build logs at expo.dev

### Camera Not Working
- Check that camera permissions are granted in Settings > Privacy > Camera
- Ensure good lighting conditions
- Try restarting the app

## What's Included in This Build

This preview build includes all features:
- ✅ VisionCamera integration
- ✅ Real-time pitch tracking
- ✅ YUV color detection
- ✅ Calibration system with quality meter
- ✅ SQLite database
- ✅ Session management
- ✅ Statistics and analytics
- ✅ CSV export
- ✅ Multi-user support (local)

## Next Steps After Installation

1. **Launch the app**
2. **Grant camera permissions** when prompted
3. **Create an account** or login
4. **Start a new session**
5. **Calibrate** the tracking system
6. **Track pitches** in real-time!

## Build Configuration

Your EAS build profiles (in `eas.json`):

- **development**: Development build with dev tools
- **preview**: Internal distribution for testing (current profile)
- **production**: App Store distribution

## Need Help?

If you encounter issues:
1. Check the EAS build logs at expo.dev
2. Review Expo documentation: https://docs.expo.dev/build/setup/
3. Check camera permissions in app settings
4. Verify iOS version compatibility

## Performance Notes

- First launch may take longer (extracting JS bundle)
- Camera performance depends on device model
- Best results with iPhone 11 or newer
- Requires good lighting for yellow ball detection

---

**Ready to deploy?** Run this command to start your build:

```bash
npx eas build --profile preview --platform ios
```

The build will take 10-20 minutes. You'll get a download link when it's ready!

---

Last modified by: Claude Code Agent on 2025-10-23

# Testing Guide - Phase 2 Features

**Last Updated:** October 20, 2025

---

## Development Server Status

The Expo development server is starting. Once running, you'll see a QR code and options to open on different platforms.

---

## ⚠️ IMPORTANT: VisionCamera Limitations

**VisionCamera ONLY works with:**
- ✅ iOS Simulator (requires Xcode)
- ✅ Android Emulator (requires Android Studio)
- ✅ Physical devices with development build

**VisionCamera will NOT work with:**
- ❌ Expo Go app (native module incompatibility)
- ❌ Web browser

---

## Testing Phase 2 Features

### 1. Navigation Testing

**What to test:**
- Bottom tab navigation with 3 tabs
- Tab switching (Tracking, Dashboard, Settings)
- Screen transitions

**Expected behavior:**
- Smooth tab transitions
- Active tab highlighted in blue (#007AFF)
- Inactive tabs in gray (#8E8E93)

---

### 2. Camera Permissions

**What to test:**
- App should request camera permission on first launch
- Permission granted/denied flow
- "Grant Permission" button functionality

**Expected behavior:**
- Permission request dialog appears
- If granted: Camera preview displays
- If denied: Permission text with button to retry

**How to test:**
```
1. Launch app
2. Tap "Grant Permission" when prompted
3. Allow camera access in system dialog
4. Verify camera preview appears
```

---

### 3. ROI (Region of Interest) Component

**What to test:**
- ROI overlay appears on camera feed
- Dragging ROI with finger/mouse
- ROI stays within screen bounds
- Visual indicators (corners, crosshair)

**Expected behavior:**
- Green dashed border with corners
- Smooth dragging with gesture handler
- Cannot drag outside screen bounds
- Center crosshair visible

**How to test:**
```
1. Locate the green ROI rectangle
2. Touch and drag anywhere inside it
3. Move to different positions
4. Try to drag off-screen (should constrain)
5. Release - should snap smoothly
```

---

### 4. Calibration System

**What to test:**
- Reference height input
- Calibration start/complete flow
- Quality meter display
- Calibration reset

**Expected behavior:**
- Input accepts decimal numbers (e.g., 4.0)
- "Calibrate" button starts process
- Calibration meter shows quality (0-100)
- Quality score displayed (Poor/Fair/Good/Excellent)
- Uncertainty value shown (±X.XX ft)
- Reset button clears calibration

**How to test:**
```
1. Enter reference height (e.g., "4.0" feet)
2. Tap "Calibrate" button
3. Wait for calibration to complete (~3 seconds)
4. Observe:
   - Quality meter fills
   - Quality label (Excellent/Good/Fair/Poor)
   - Uncertainty value
   - Sample count
5. Tap "Reset" to clear
```

---

### 5. Ball Detection Indicator

**What to test:**
- Detection status display
- Confidence percentage
- Pixel count

**Expected behavior:**
- Indicator dot color changes:
  - Gray: No ball detected
  - Orange: Low confidence (< 60%)
  - Yellow: Medium confidence (60-80%)
  - Green: High confidence (> 80%)
- Confidence and pixel count update in real-time

**Current limitation:**
- Detection uses mock data (no actual frame processing yet)
- Will show "No Ball" by default

---

### 6. Coach Overlay

**What to test:**
- Coach messages during calibration
- Animation entrance/exit
- Message types (info/warning/success/error)

**Expected behavior:**
- Animated slide-in from top
- Icon matches message type:
  - 'i' for info (blue)
  - '!' for warning (yellow)
  - '✓' for success (green)
  - '✕' for error (red)
- Auto-dismisses after 3 seconds
- Subtle pulse animation

**How to test:**
```
1. Start calibration - see info message
2. Complete calibration - see success message
3. Reset calibration - see info message
```

---

### 7. Dashboard Screen (Placeholder)

**What to test:**
- Tab navigation to Dashboard
- Placeholder content displays

**Expected behavior:**
- Shows "Coming in Phase 4" message
- Displays placeholder cards for:
  - Recent Sessions
  - Statistics
  - Export

---

### 8. Settings Screen (Placeholder)

**What to test:**
- Tab navigation to Settings
- Placeholder settings display

**Expected behavior:**
- Shows "Coming in Phase 4" message
- Displays setting categories:
  - Detection Settings
  - Calibration
  - Data Management
  - About

---

## Known Issues / Limitations

### Phase 2 Limitations:

1. **No Actual Frame Processing**
   - Camera displays but doesn't process frames yet
   - Ball detection uses mock data
   - Calibration measurements are simulated

2. **No Real-time Tracking**
   - Detection indicator doesn't update from camera
   - Height measurements not calculated from live feed

3. **VisionCamera Setup**
   - Requires development build (not Expo Go)
   - May need additional native configuration

4. **UI Polish**
   - No tab icons (text only)
   - Basic styling (can be enhanced)

---

## Development Build Required

Since VisionCamera is a native module, you'll need a development build:

### Option 1: EAS Build (Recommended)

```bash
# Install EAS CLI
pnpm add -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS simulator
eas build --profile development --platform ios --local

# Build for Android emulator
eas build --profile development --platform android --local
```

### Option 2: Local Build

```bash
# For iOS
pnpm run ios

# For Android
pnpm run android
```

---

## Testing Checklist

### Basic Functionality ✓

- [ ] App launches without crashes
- [ ] Tab navigation works
- [ ] All 3 screens accessible
- [ ] No console errors

### Camera & Permissions ✓

- [ ] Camera permission requested
- [ ] Camera preview displays (if granted)
- [ ] Permission denied handled gracefully
- [ ] Retry permission works

### ROI Component ✓

- [ ] ROI overlay visible
- [ ] Dragging works smoothly
- [ ] Boundaries enforced
- [ ] Visual indicators clear

### Calibration ✓

- [ ] Input accepts numbers
- [ ] Calibration starts on button press
- [ ] Quality meter displays
- [ ] Uncertainty shown
- [ ] Reset clears data
- [ ] Coach messages appear

### Visual Feedback ✓

- [ ] Detection indicator visible
- [ ] Coach overlay animates
- [ ] Color coding correct
- [ ] Text readable

### Navigation ✓

- [ ] Tab switching smooth
- [ ] Active tab highlighted
- [ ] Screen transitions work

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame Rate | 30 FPS | VisionCamera configured |
| ROI Drag | 60 FPS | Reanimated smooth |
| Memory | < 100MB | No leaks detected |
| Startup Time | < 3s | Cold start |

---

## Troubleshooting

### Camera Not Working

1. Check permissions in device settings
2. Verify VisionCamera is installed:
   ```bash
   ls -la node_modules/react-native-vision-camera
   ```
3. Check for native module errors in Metro bundler

### ROI Not Dragging

1. Check gesture handler setup in App.tsx
2. Verify Reanimated installed correctly
3. Check console for gesture errors

### Calibration Not Completing

1. Check console for errors
2. Verify CalibrationService is working:
   ```bash
   pnpm test calibration
   ```

### App Crashes on Launch

1. Clear Metro bundler cache:
   ```bash
   pnpm run dev
   ```
2. Clear node modules:
   ```bash
   pnpm run clean
   pnpm install
   ```
3. Rebuild native modules

---

## Next Steps After Testing

Once you've tested Phase 2 features:

1. **Report Issues** - Document any bugs or unexpected behavior
2. **Suggest Improvements** - UI/UX enhancements
3. **Performance Notes** - Frame rate, responsiveness
4. **Move to Phase 3** - Data layer implementation

---

## Support

For issues or questions:
- Check PHASE2_COMPLETE.md for implementation details
- Review test files in `__tests__` directories
- Consult ROADMAP.md for planned features

---

**Happy Testing! 🎉**

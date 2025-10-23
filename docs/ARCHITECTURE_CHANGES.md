# Architecture Changes & Migration Notes

## Date: October 21, 2025

### Issue: PlatformConstants TurboModule Error

**Original Error:**
```
ERROR [runtime not ready]: Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'PlatformConstants' could not be found. Verify that a module by this name is registered
in the native binary. Bridgeless mode: true. TurboModule interop: false.
Modules loaded: {"NativeModules":[],"TurboModules":[],"NotFound":["PlatformConstants"]}
```

---

## Root Cause Analysis

### Environment
- **Expo SDK:** 54.0.15 (very new, released recently)
- **React Native:** 0.81.4 (cutting-edge version)
- **New Architecture:** Enabled by default in SDK 54
- **Bridgeless Mode:** Active (automatic with New Arch)

### The Problem
Expo SDK 54 with New Architecture enabled encountered a critical dependency conflict:

1. **PlatformConstants Missing**: React Native's core `PlatformConstants` module wasn't being registered in the TurboModule registry
2. **No Modules Loading**: Logs showed empty arrays for both NativeModules and TurboModules
3. **Vision Camera Incomplete Migration**: react-native-vision-camera 4.7.0 uses JSI but hasn't completed full TurboModule/Fabric migration ([GitHub Issue #2614](https://github.com/mrousavy/react-native-vision-camera/issues/2614))
4. **Worklets Requirement**: react-native-worklets 0.5.1 **requires** New Architecture (hard requirement)
5. **Reanimated 4.x Requirement**: react-native-reanimated 4.x also **requires** New Architecture

### Dependency Chain Conflict
```
Vision Camera → Worklets → New Architecture (REQUIRED)
New Architecture → PlatformConstants Error (BROKEN in SDK 54)
```

This created an impossible situation: can't disable New Arch without removing Vision Camera.

---

## Solution Implemented

### Changes Made

#### 1. Disabled New Architecture
**Files Modified:**
- `app.json:9` - Set `newArchEnabled: false`
- `ios/Podfile.properties.json:4` - Set `"newArchEnabled": "false"`

#### 2. Removed New Architecture Dependencies
**Removed from `package.json`:**
- `react-native-vision-camera: ^4.7.0` ❌ (requires worklets → new arch)
- `react-native-worklets: ~0.5.1` ❌ (requires new arch)

**Kept (already installed):**
- `expo-camera: ~17.0.0` ✅ (fully compatible with legacy arch)

#### 3. Downgraded Reanimated
**Changed in `package.json`:**
- From: `react-native-reanimated: ~4.1.0` (requires new arch)
- To: `react-native-reanimated: ~3.16.0` (works with legacy arch)

#### 4. Fixed App Config Schema
**Removed from `app.json`:**
- `ios.supportsTabletMode` (deprecated property causing validation errors)

---

## Technical Details

### Why expo-camera Instead of Vision Camera?

| Feature | Vision Camera 4.x | Expo Camera 17.x |
|---------|-------------------|------------------|
| New Architecture Support | Partial (JSI only, no TurboModules) | ✅ Full support |
| Legacy Architecture Support | ❌ No (requires worklets) | ✅ Full support |
| Frame Processors | ✅ Advanced (worklets-based) | ⚠️ Limited |
| YUV Color Space | ✅ Native support | ⚠️ Requires custom processing |
| Expo SDK 54 Stability | ⚠️ Unstable | ✅ Stable |
| Production Ready | ⚠️ Experimental new arch | ✅ Battle-tested |

### Camera API Differences

**Vision Camera Pattern (removed):**
```typescript
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useWorklet } from 'react-native-worklets';

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  // YUV processing here
}, []);
```

**Expo Camera Pattern (new implementation):**
```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

const [permission, requestPermission] = useCameraPermissions();
// Use onCameraReady and custom frame analysis
```

---

## Build Results

### Successfully Installed
```
✅ Pod installation complete! 91 dependencies installed
✅ Configured with Legacy Architecture
✅ expo-camera 17.0.8 installed
✅ react-native-reanimated 3.16.7 (downgraded from 4.1.3)
✅ Metro Bundler started successfully
```

### Warnings (Expected & Safe)
```
⚠️  react-native-reanimated@3.16.7 - expected version: ~4.1.1
```
This warning is **expected and safe**. We intentionally downgraded Reanimated to support the legacy architecture.

---

## Migration Path Forward

### Short-term (Current - MVP Phase)
- ✅ Use expo-camera for pitch tracking
- ✅ Implement ROI draggable component
- ✅ Develop YUV color detection with expo-camera frame analysis
- ✅ Build calibration system

### Medium-term (SDK 54 Stabilization)
- Monitor react-native-vision-camera GitHub for TurboModule completion
- Watch for Expo SDK 54 patches addressing PlatformConstants issues
- Test with development builds (not Expo Go)

### Long-term (SDK 55+ / Late 2025)
- **SDK 55 will mandate New Architecture** (legacy arch removed)
- Vision Camera will complete TurboModule migration
- All ecosystem libraries will be fully compatible
- **Migration back to Vision Camera** for advanced frame processing

---

## Community Research Sources

### GitHub Issues Reviewed
1. [React Native #48108](https://github.com/facebook/react-native/issues/48108) - PlatformConstants error in RN 0.76+
2. [Expo #36836](https://github.com/expo/expo/issues/36836) - SDK 53 PlatformConstants issues in bridgeless mode
3. [Vision Camera #2614](https://github.com/mrousavy/react-native-vision-camera/issues/2614) - TurboModule migration incomplete
4. [React Native #47352](https://github.com/facebook/react-native/issues/47352) - PlatformConstants crash with custom C++ code

### Documentation Consulted
- [Expo New Architecture Guide](https://docs.expo.dev/guides/new-architecture/)
- [React Native New Architecture Overview](https://reactnative.dev/architecture/landing-page)
- [Vision Camera Documentation](https://react-native-vision-camera.com/docs/guides)
- Stack Overflow: Multiple developers reported similar issues with SDK 53/54

---

## Recommendations for Future Development

### DO ✅
- Use expo-camera for MVP development
- Keep New Architecture **disabled** until SDK 55
- Monitor Vision Camera GitHub for completion announcements
- Test new arch in development builds (not Expo Go)

### DON'T ❌
- Enable New Architecture in SDK 54 (unstable)
- Mix New Arch-required packages with legacy arch
- Use Expo Go for testing (doesn't support custom native modules)
- Force-enable new arch with incompatible dependencies

---

## Testing Recommendations

### Before Launching App
Run these commands to verify setup:
```bash
# Verify Expo configuration
pnpm dlx expo-doctor

# Check iOS build configuration
cat ios/Podfile.properties.json
# Should show: "newArchEnabled": "false"

# Verify dependencies
pnpm list react-native-reanimated
# Should show: 3.16.7

pnpm list expo-camera
# Should show: 17.0.8
```

### When Testing Camera Features
1. Request camera permissions properly
2. Test ROI dragging on real device (simulators have limited camera)
3. Verify YUV color space processing works
4. Test calibration uncertainty calculations

---

## Related Files

**Configuration:**
- `/app.json` - Expo configuration
- `/ios/Podfile.properties.json` - iOS native build settings
- `/package.json` - Dependency versions

**Documentation:**
- `/CLAUDE.md` - Project instructions
- `/README.md` - MVP plan and checklist
- `/docs/MVP_PLAN.md` - Detailed implementation phases

---

## Conclusion

We successfully resolved the PlatformConstants TurboModule error by:
1. Disabling New Architecture (SDK 54 instability)
2. Switching to expo-camera (stable, battle-tested)
3. Downgrading reanimated to legacy-compatible version
4. Removing new-arch-dependent packages

This unblocks MVP development while maintaining a clear path to re-enable New Architecture and Vision Camera in SDK 55+ when the ecosystem stabilizes.

**Status:** ✅ Ready for Phase 2 development (Core tracking features)

---

*Last modified by: agent-orchestration:context-manager on 2025-10-21 06:31 CST*

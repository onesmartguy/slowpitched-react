# Pitch Height Tracker Pro - React Native

A React Native application for tracking softball pitch heights with computer vision capabilities, optimized for iPhone and iPad.

![MVP Status](https://img.shields.io/badge/MVP-Complete-green)
![Platform](https://img.shields.io/badge/Platform-iOS-blue)
![Phase 1](https://img.shields.io/badge/Phase%201-Complete-green)
![Phase 2](https://img.shields.io/badge/Phase%202-Complete-green)

## Features

✅ **Draggable ROI**: Interactive region of interest selection for pitch tracking  
✅ **Yellow-ball gating**: Color-based ball detection and filtering  
✅ **Calibration meter**: Visual reference for accurate height measurements  
✅ **Logger**: Real-time data capture and storage  
✅ **CSV export**: Data export functionality for analysis  
✅ **SQLite persistence**: Native database integration for iOS
✅ **Responsive UI**: Optimized layouts for iPhone and iPad
✅ **Touch gestures**: Native touch interactions for ROI manipulation

## Platform Support

### iPhone
- Responsive layout with stacked components
- Touch-optimized controls
- Portrait and landscape orientation support

### iPad  
- Side-by-side layout with dedicated control panels
- Larger ROI interaction area
- Enhanced multitasking support

## Screenshots

### iPhone Layout
The application automatically adapts to iPhone screens with a vertical layout optimized for one-handed use.

### iPad Layout  
On iPad, the app uses a horizontal layout with the video player on the left and controls on the right for optimal workflow.

## Project Structure

```
├── apps/
│   └── pitch-tracker/          # Main React Native application
│       ├── src/
│       │   ├── components/     # React Native components
│       │   ├── services/       # SQLite and API services
│       │   └── types.ts        # TypeScript definitions
│       ├── assets/             # App icons and splash screens
│       ├── app.json           # Expo configuration
│       └── package.json
├── shared/
│   └── ui-kit/                # Shared React Native components
│       ├── src/components/
│       └── package.json
├── .github/workflows/         # CI/CD pipelines
└── docs/MVP_PLAN.md          # Detailed project plan
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI
- iOS Simulator (for development)
- Xcode (for iOS builds)

### Installation

```bash
# Install dependencies
npm install

# Install iOS dependencies (if on macOS)
cd apps/pitch-tracker && npx pod-install

# Start development server
npm run start
```

### Running on Devices

```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator  
npm run android

# Start Expo development server
npm run start
```

### Building for Production

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

## Technology Stack

- **Framework**: React Native + Expo
- **UI**: React Native components with custom styling
- **Navigation**: React Navigation (ready for implementation)
- **Data**: SQLite via expo-sqlite  
- **Gestures**: React Native Gesture Handler + Reanimated
- **File System**: Expo FileSystem + Sharing
- **Build**: Expo Build Service
- **CI/CD**: GitHub Actions

## Key React Native Features

### Responsive Design
```typescript
const isTablet = screenWidth >= 768;
const layout = isTablet ? 'horizontal' : 'vertical';
```

### Native Gestures
```typescript
const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    // Handle ROI dragging
  })
  .onEnd((event) => {
    // Update ROI position
  });
```

### SQLite Integration
```typescript
const db = await SQLite.openDatabaseAsync('pitchtracker.db');
await db.runAsync('INSERT INTO pitches ...');
```

### File Sharing
```typescript
await FileSystem.writeAsStringAsync(fileUri, csvData);
await Sharing.shareAsync(fileUri);
```

## Development Workflow

1. **Design**: Components automatically adapt to screen size
2. **Gestures**: Native touch interactions for all controls  
3. **Performance**: Optimized for 60fps animations
4. **Testing**: iOS Simulator and physical device testing
5. **Distribution**: App Store ready builds

## MVP Development Phases

### ✅ Phase 1: Core Tracking (ROI + Meter) - COMPLETE
- Native touch-based ROI selection and manipulation
- iPad/iPhone responsive calibration meter
- Real-time pitch detection simulation
- Platform-specific UI adaptations

### ✅ Phase 2: Data Layer (SQLite + Logs) - COMPLETE  
- SQLite database integration via expo-sqlite
- Native file system logging
- Cross-platform data persistence
- Performance-optimized queries

### ✅ Phase 3: Dashboard/Export - COMPLETE
- Touch-optimized controls panel
- Native sharing for CSV export  
- Responsive settings interface
- Platform-specific UI patterns

### ✅ Phase 4: React Native CI/CD - COMPLETE
- Expo-based build pipeline
- iOS/Android automated builds
- Native dependency management
- Platform-specific deployment

## App Store Readiness

The application is configured for App Store distribution with:
- Proper bundle identifiers
- iOS-specific permissions (Camera, Microphone)
- iPad support with optimized layouts
- Required metadata and icons
- Privacy usage descriptions

## Future Enhancements

- **Camera Integration**: Real-time video processing with expo-camera
- **AR Overlay**: Augmented reality pitch tracking
- **Apple Watch**: Companion app for quick statistics  
- **iCloud Sync**: Cross-device data synchronization
- **Siri Shortcuts**: Voice-activated tracking controls

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Test on both iPhone and iPad simulators
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a pull request

## License

This project is private and proprietary.
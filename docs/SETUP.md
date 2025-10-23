# Development Setup Guide

## Pitch Height Tracker Pro - Local Development Setup

### Prerequisites

- **Node.js:** v18.x or v20.x LTS
- **pnpm:** v8.0.0 or higher
- **Git:** Version control
- **Expo CLI:** For React Native development
- **iOS Simulator** (macOS) or **Android Emulator** (all platforms)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/slowpitched-react.git
cd slowpitched-react
```

#### 2. Install Dependencies

```bash
pnpm install
```

This will install all root-level dependencies and workspaces due to pnpm workspaces configuration.

#### 3. Verify Installation

```bash
pnpm run type-check
```

Should complete with no TypeScript errors.

#### 4. Start Development Server

```bash
pnpm run dev
```

Or start with specific platform:

```bash
pnpm run ios      # Start iOS simulator
pnpm run android  # Start Android emulator
pnpm run web      # Start web dev server (limited functionality)
```

### Project Structure

```
slowpitched-react/
├── apps/
│   └── mobile/                 # React Native Expo app
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── screens/        # Screen components
│       │   ├── utils/          # App-specific utilities
│       │   ├── types/          # TypeScript type definitions
│       │   ├── hooks/          # Custom React hooks
│       │   ├── store/          # State management (Zustand)
│       │   └── App.tsx         # Root app component
│       └── package.json
├── shared/
│   └── utils/                  # Shared utilities package
│       ├── src/
│       │   ├── constants.ts    # Shared constants
│       │   ├── calculation.ts  # Math utilities
│       │   ├── validation.ts   # Data validation
│       │   └── index.ts
│       └── package.json
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── build.yml
│       ├── test.yml
│       └── release.yml
├── docs/
│   ├── MVP_PLAN.md            # Phase breakdown
│   ├── SETUP.md               # This file
│   └── ARCHITECTURE.md        # System design
└── package.json               # Root configuration
```

### Available Commands

#### Development

```bash
pnpm run dev              # Start development server
pnpm run ios             # Start iOS simulator
pnpm run android         # Start Android emulator
pnpm run web             # Start web dev (limited)
```

#### Code Quality

```bash
pnpm run lint            # Run ESLint
pnpm run lint:fix        # Fix linting issues
pnpm run format          # Format code with Prettier
pnpm run format:check    # Check formatting
pnpm run type-check      # TypeScript type checking
pnpm run type-check:watch # Watch mode type checking
```

#### Testing

```bash
pnpm test                # Run tests once
pnpm run test:watch      # Run tests in watch mode
pnpm run test:coverage   # Generate coverage report
```

#### Building

```bash
pnpm run build           # Build for production
pnpm run setup           # Clean install and build
pnpm run clean           # Remove build artifacts
```

### Workspace Structure

This project uses pnpm workspaces for monorepo management:

- **@slowpitched/mobile** - Main React Native app
- **@slowpitched/utils** - Shared utilities library

To reference workspace packages:

```typescript
// In mobile app
import { YELLOW_DETECTION, calculateStatistics } from '@slowpitched/utils';

// From shared utils
import { CALIBRATION, isValidHeight } from '@slowpitched/utils';
```

### TypeScript Path Aliases

Available path aliases for cleaner imports:

```typescript
// In mobile app
import MyComponent from '@/components/MyComponent';
import { useTracker } from '@/hooks/useTracker';
import { CALIBRATION } from '@shared/utils';

// In shared utils
import { helper } from '@/utils/helper';
```

See `tsconfig.json` for all configured paths.

### Environment Variables

Create `.env` file in root directory (not committed to git):

```bash
# Development
NODE_ENV=development
EXPO_PROJECT_ID=your_project_id

# Optional analytics
SENTRY_DSN=https://...
FIREBASE_CONFIG=...
```

Environment variables in `apps/mobile/.env`:

```bash
# App-specific settings
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Git Workflow

#### Branch Naming

```bash
feature/description      # New features
fix/bug-description     # Bug fixes
docs/description        # Documentation
refactor/description    # Code refactoring
test/description        # Test additions
```

#### Commit Messages

Follow conventional commits:

```
feat: Add pitch detection algorithm
fix: Resolve camera permission issue
docs: Update setup guide
refactor: Improve uncertainty calculation
test: Add tests for validation utils
```

#### Pull Requests

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create PR against `develop`
5. Ensure CI/CD passes
6. Request review from team
7. Merge after approval

### Debugging

#### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Start development server: `npm run dev`
3. Press `d` to open developer menu
4. Select "Open JS Debugger"

#### Logs

```bash
# iOS
pnpm run ios -- --clear  # Clear cache and restart

# Android
pnpm run android -- --clear

# View logs
expo logs
```

#### TypeScript Debugging

Enable source maps in TypeScript configuration for better debugging.

### Testing Your Changes

#### Before Committing

```bash
pnpm run type-check      # Type safety
pnpm run lint            # Code quality
pnpm run format:check    # Code formatting
pnpm run test            # Unit tests
```

#### Pre-commit Hook

Consider using husky to run checks before commits:

```bash
pnpm add husky --save-dev
pnpm dlx husky install
```

### Troubleshooting

#### Node Modules Issues

```bash
# Clear node_modules and reinstall
pnpm run clean
pnpm install
```

#### Expo Cache Issues

```bash
# Clear Expo cache
expo start --clear

# Or from pnpm
pnpm run dev
```

#### TypeScript Errors

```bash
# Regenerate types
pnpm run type-check
```

#### Port Already in Use

Expo uses port 19000 by default. If in use:

```bash
# Use different port
expo start --port 19001
```

### Performance Optimization

#### Development Build

Use development build for better performance:

```bash
npx eas build --platform ios --profile development
npx eas build --platform android --profile development
```

#### Production Build

For release builds:

```bash
pnpm run build
```

### IDE Setup

#### VS Code

Recommended extensions:

- **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
- **ESLint** - dbaeumer.vscode-eslint
- **Prettier** - esbenp.prettier-vscode
- **React Native Tools** - msjsdiag.vscode-react-native

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.expo": true,
    "**/node_modules": true
  }
}
```

### Next Steps

1. Review [MVP_PLAN.md](./MVP_PLAN.md) for implementation roadmap
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Read Phase 2 tasks for upcoming camera integration
4. Run `pnpm install` to set up your local environment

### Support & Issues

For issues or questions:

1. Check existing GitHub issues
2. Create new issue with:
   - Description of problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

### Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Vision Camera](https://react-native-vision-camera.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing](https://jestjs.io/)

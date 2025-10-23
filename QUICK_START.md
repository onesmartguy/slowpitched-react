# Quick Start Guide - Pitch Height Tracker Pro

**Get up and running in 5 minutes!**

## Prerequisites

- Node.js v18+ or v20+
- Git
- iOS Simulator (macOS) or Android Emulator

## 1. Clone & Install (2 minutes)

```bash
cd slowpitched-react
pnpm install
```

## 2. Verify Setup (1 minute)

```bash
# Check TypeScript
pnpm run type-check

# Check linting
pnpm run lint

# Run tests
pnpm run test
```

All should pass with no errors.

## 3. Start Development (1 minute)

```bash
# Start dev server and choose platform
pnpm run dev

# Or pick a platform directly
pnpm run ios      # iOS simulator
pnpm run android  # Android emulator
pnpm run web      # Web (limited functionality)
```

## 4. Code & Commit (1 minute)

```bash
# Make changes to code
# Editor: VS Code recommended

# Format and lint
pnpm run format
pnpm run lint:fix

# Commit (use conventional commits)
git add .
git commit -m "feat: add amazing feature"

# Verify everything still works
pnpm run type-check && pnpm run test
```

## Common Commands

```bash
# Development
pnpm run dev                 # Start dev server
pnpm run ios                 # iOS simulator
pnpm run android             # Android emulator

# Code Quality
pnpm run lint               # Check linting
pnpm run lint:fix           # Fix issues
pnpm run format             # Format code
pnpm run type-check         # TypeScript check

# Testing
pnpm run test               # Run tests
pnpm run test:coverage      # Coverage report

# Building
pnpm run build              # Production build
```

## Key Files to Know

| File | Purpose | Location |
|------|---------|----------|
| `app.json` | Expo configuration | Root |
| `tsconfig.json` | TypeScript setup | Root |
| `package.json` | Dependencies & scripts | Root |
| `SETUP.md` | Full setup guide | /docs |
| `ARCHITECTURE.md` | System design | /docs |
| `MVP_PLAN.md` | Implementation roadmap | /docs |
| `types/index.ts` | Type definitions | /apps/mobile/src |
| `constants.ts` | Shared constants | /shared/utils/src |

## Project Structure

```
slowpitched-react/
├── apps/mobile/           # Main React Native app
├── shared/utils/          # Shared utilities
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation
└── [Config files]
```

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   ```
   ext install dsznajder.es7-react-js-snippets
   ```

2. **ESLint**
   ```
   ext install dbaeumer.vscode-eslint
   ```

3. **Prettier**
   ```
   ext install esbenp.prettier-vscode
   ```

4. **React Native Tools**
   ```
   ext install msjsdiag.vscode-react-native
   ```

### Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Troubleshooting

### Port Already in Use
```bash
pnpm run dev -- --port 19001
```

### Clear Cache
```bash
pnpm run clean
pnpm install
pnpm run dev
```

### Node Modules Issues
```bash
rm -rf node_modules
pnpm install
```

### TypeScript Errors
```bash
pnpm run type-check
```

## Next Steps

1. **Read Full Setup Guide:** `docs/SETUP.md`
2. **Understand Architecture:** `docs/ARCHITECTURE.md`
3. **Check Implementation Plan:** `docs/MVP_PLAN.md`
4. **Review Phase 2 Tasks:** See MVP_PLAN.md Phase 2 section

## Documentation Map

```
Need to...                          See...
Setup development environment       → SETUP.md
Understand the system design        → ARCHITECTURE.md
See implementation roadmap          → MVP_PLAN.md
Track project progress              → PROJECT_STATUS.md
Read this detailed report           → IMPLEMENTATION_REPORT.md
```

## Current Phase

**Phase 1: Repository Structure & Setup** - COMPLETE

**Next Phase:** Phase 2 - Core Tracking Features (4-5 days)

- Camera integration with VisionCamera
- Draggable ROI component
- Yellow ball detection using YUV
- Calibration quality meter
- Animated coach overlay

## Getting Help

1. Check documentation in `/docs`
2. Review comments in type definitions
3. Look at configuration examples
4. Check GitHub for issues

## Success Metrics

After setup is complete, you should be able to:

- ✓ Run `pnpm install` without errors
- ✓ Run `pnpm run type-check` successfully
- ✓ Run `pnpm run lint` with no errors
- ✓ Run `pnpm run dev` and see dev server start
- ✓ Access simulator with app interface

---

**Happy coding! 🚀**

For detailed information, see the documentation in the `/docs` directory.

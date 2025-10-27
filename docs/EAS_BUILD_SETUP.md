# EAS Build Automation Setup Guide

## Overview

This guide shows how to set up automated EAS builds that trigger on every pull request or merge to main.

## Prerequisites

1. **Expo Account**: You already have one (`onesmartguy`)
2. **EAS CLI**: Already installed
3. **GitHub Repository**: Your slowpitched-react repo
4. **Expo Project ID**: `88f418c9-e0b7-4e55-90d7-6ff45f0e5edd`

## Setup Steps

### Step 1: Generate Expo Access Token

1. Go to https://expo.dev/accounts/onesmartguy/settings/access-tokens
2. Click "Create Token"
3. Name it: `GitHub Actions - SlowPitched`
4. Copy the token (you'll only see it once!)

### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repo: https://github.com/onesmartguy/slowpitched-react
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste the token from Step 1
6. Click **Add secret**

### Step 3: Verify Workflow File

The workflow file has been created at `.github/workflows/eas-build.yml`

It will trigger on:
- ✅ Pull requests to `main` branch
- ✅ Pushes to `main` branch (after PR merge)
- ✅ Manual workflow dispatch
- ✅ Only when mobile code changes

### Step 4: Test the Workflow

#### Option A: Create a Test PR

```bash
# Create a feature branch
git checkout -b test/eas-build

# Make a small change
echo "# Test build" >> apps/mobile/README.md

# Commit and push
git add .
git commit -m "test: trigger EAS build"
git push origin test/eas-build

# Create PR on GitHub
```

#### Option B: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **EAS Build** workflow
3. Click **Run workflow**
4. Choose platform and profile
5. Click **Run workflow**

## Build Profiles

### Preview Profile (Default for PRs)
- **Purpose**: Internal testing
- **Distribution**: Ad Hoc (for registered devices)
- **When**: Automatically on every PR
- **Install**: Direct download/TestFlight

### Production Profile (Default for main)
- **Purpose**: App Store submission
- **Distribution**: App Store
- **When**: On merge to main
- **Install**: App Store only

## Workflow Features

### ✅ Automated Quality Checks

Before building, the workflow runs:
1. **Tests**: Full test suite (`pnpm test`)
2. **Type Checking**: TypeScript validation
3. **Linting**: Code quality checks (if configured)

### ✅ Parallel Builds

Builds iOS and Android simultaneously using matrix strategy for faster results.

### ✅ PR Comments

Automatically comments on PRs with:
- Build status
- Platform and profile
- Links to EAS dashboard
- Download instructions

### ✅ Smart Triggering

Only builds when relevant files change:
- `apps/mobile/**`
- `shared/**`
- `app.json`
- `package.json`

## Build Status Monitoring

### View Build Progress

1. **GitHub Actions Tab**: See workflow status
2. **EAS Dashboard**: https://expo.dev/accounts/onesmartguy/projects/slowpitched/builds
3. **PR Comments**: Direct links in each PR

### Build Notifications

You'll receive notifications:
- ✅ In GitHub (if enabled in settings)
- ✅ Via email from Expo
- ✅ In PR comments

## Troubleshooting

### Build Fails Immediately

**Issue**: No EXPO_TOKEN secret
**Fix**: Complete Step 2 above

### Build Fails During Bundle

**Issue**: JavaScript errors or missing dependencies
**Fix**:
1. Check build logs in EAS dashboard
2. Ensure all dependencies in package.json
3. Run `pnpm install` locally and test

### Credentials Not Found

**Issue**: Missing iOS/Android credentials
**Fix**:
1. Run `eas credentials` locally
2. Follow prompts to set up credentials
3. Re-run the workflow

### Bundle JavaScript Build Phase Error

**Issue**: Metro bundler errors (like current build)
**Fix**:
1. Check for TypeScript errors: `pnpm run type-check`
2. Verify all imports are correct
3. Clear metro cache: `rm -rf node_modules/.cache`
4. Rebuild locally: `npx expo start --clear`

## Current Build Issue

The most recent build failed with:
```
Unknown error. See logs of the Bundle JavaScript build phase for more information.
```

This is likely due to:
1. TypeScript compilation error
2. Missing dependency
3. Import path issue

**To fix:**

```bash
# Check for TypeScript errors
cd apps/mobile
pnpm run type-check

# Check for missing dependencies
pnpm install

# Test local build
npx expo start --clear
```

## Cost Considerations

### Free Tier Limits (Expo)
- 30 builds/month for free
- Additional builds: $29/month for unlimited

### Optimization Tips
1. Only build changed platforms
2. Use `--no-wait` flag to queue builds
3. Skip builds for documentation-only changes
4. Use draft PRs to prevent auto-builds

## Advanced Configuration

### Custom Build Profiles

Edit `eas.json` to add more profiles:

```json
{
  "build": {
    "staging": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "staging"
      }
    }
  }
}
```

### Environment Variables

Add secrets in GitHub and reference in workflow:

```yaml
- name: Build with secrets
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: eas build --profile preview
```

### Conditional Builds

Modify the workflow to skip builds:

```yaml
on:
  pull_request:
    types: [opened, synchronize]
    branches-ignore:
      - 'docs/**'  # Skip docs-only changes
```

## Next Steps

1. ✅ Add EXPO_TOKEN secret to GitHub
2. ✅ Fix current build error (TypeScript check)
3. ✅ Create test PR to verify workflow
4. ✅ Configure Android credentials (if needed)
5. ✅ Set up TestFlight distribution

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions for Expo](https://docs.expo.dev/build/building-on-ci/)
- [EAS Build Configuration](https://docs.expo.dev/build-reference/eas-json/)
- [Credentials Management](https://docs.expo.dev/app-signing/managed-credentials/)

---

**Last Updated**: October 27, 2025
**Status**: Workflow created, awaiting EXPO_TOKEN setup

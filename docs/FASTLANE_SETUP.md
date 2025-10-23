# Fastlane Setup Guide

Complete guide for setting up Fastlane with Expo/EAS to automate TestFlight uploads for the Pitch Height Tracker Pro app.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [App Store Connect API Key](#app-store-connect-api-key)
4. [Local Configuration](#local-configuration)
5. [Available Lanes](#available-lanes)
6. [CI/CD with GitHub Actions](#cicd-with-github-actions)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- ✅ macOS with Xcode installed
- ✅ Ruby 3.0+ (`ruby --version`)
- ✅ Fastlane installed (`gem install fastlane`)
- ✅ Expo CLI installed (`pnpm install -g expo-cli`)
- ✅ EAS CLI installed (`pnpm install -g eas-cli`)
- ✅ An Apple Developer account
- ✅ App Store Connect access
- ✅ Your app registered in App Store Connect

## Initial Setup

### 1. Install Fastlane

```bash
gem install fastlane
```

### 2. Verify Installation

```bash
fastlane --version
# Should show version 2.x or higher
```

### 3. Project Files

The following files have been set up in your project:

- `fastlane/Fastfile` - Main Fastlane configuration with lanes
- `fastlane/Appfile` - App configuration (bundle ID, team ID, etc.)
- `fastlane/setup_api_key.sh` - Interactive setup script for API key
- `.env.example` - Template for environment variables
- `.github/workflows/testflight.yml` - GitHub Actions workflow

## App Store Connect API Key

App Store Connect API keys allow Fastlane to authenticate without requiring your Apple ID password or 2FA codes.

### Creating an API Key

1. Go to [App Store Connect API Keys](https://appstoreconnect.apple.com/access/api)
2. Click the **"+"** button to generate a new key
3. Configure the key:
   - **Name**: `Fastlane CI` (or any descriptive name)
   - **Access**: Select **"App Manager"** or higher
4. Click **"Generate"**
5. **Download the .p8 file** (you can only download it once!)
6. Note the **Key ID** and **Issuer ID** shown on the page

### Storing the API Key Securely

**Option 1: Interactive Setup (Recommended for Local)**

```bash
cd fastlane
./setup_api_key.sh
```

This script will:
- Prompt you for Key ID, Issuer ID, and path to .p8 file
- Convert the key to base64
- Create a `.env` file with all credentials
- Show security reminders

**Option 2: Manual Setup**

1. Convert your .p8 key to base64:

```bash
cat AuthKey_XXXXXXXXXX.p8 | base64
```

2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit `.env` and add your values:

```bash
ASC_KEY_ID=ABC123DEFG
ASC_ISSUER_ID=12345678-1234-1234-1234-123456789012
ASC_KEY_CONTENT=<base64-encoded-key-content>
```

### Security Best Practices

- ✅ **Never commit** `.env` to version control (already in `.gitignore`)
- ✅ **Never share** your .p8 file or base64 key
- ✅ **Store securely** - consider using a password manager
- ✅ **Rotate keys** periodically (keys expire after ~1 year)
- ✅ **Use GitHub Secrets** for CI/CD (see below)

## Local Configuration

### Environment Variables

Edit your `.env` file to customize:

```bash
# Required: App Store Connect API
ASC_KEY_ID=YOUR_KEY_ID
ASC_ISSUER_ID=YOUR_ISSUER_ID
ASC_KEY_CONTENT=YOUR_BASE64_KEY

# Optional: TestFlight Groups
TESTFLIGHT_GROUPS=Internal Testers,Beta Testers

# Optional: Build info
CHANGELOG=Bug fixes and performance improvements
SKIP_WAITING=true  # Don't wait for Apple processing

# Optional: Beta Review Info
CONTACT_EMAIL=support@slowpitched.com
CONTACT_FIRST_NAME=Eddie
CONTACT_LAST_NAME=Flores
REVIEW_NOTES=This build includes camera tracking improvements
```

### Testing Your Setup

Upload a previously built IPA:

```bash
# Build with EAS first
eas build --platform ios --profile production

# Download the build
eas build:download --platform ios --latest --output=build.ipa

# Upload to TestFlight
fastlane upload_only ipa:build.ipa
```

## Available Lanes

### `fastlane beta`

Build with EAS and upload to TestFlight in one command.

```bash
fastlane beta
```

**What it does:**
1. Triggers EAS production build
2. Waits for build to complete
3. Downloads IPA
4. Uploads to TestFlight
5. Cleans up build artifacts

### `fastlane deploy`

Complete deployment flow with download.

```bash
fastlane deploy
```

**What it does:**
1. Builds with EAS (waits for completion)
2. Downloads IPA from EAS
3. Uploads to TestFlight
4. Removes local IPA file

### `fastlane upload_only`

Upload an existing IPA without building.

```bash
# Use default path (build.ipa)
fastlane upload_only

# Specify custom path
fastlane upload_only ipa:path/to/app.ipa
```

### `fastlane build_with_eas`

Just build with EAS (no upload).

```bash
fastlane build_with_eas
```

### `fastlane download_build`

Download the latest EAS build.

```bash
fastlane download_build
```

### `fastlane bump_build`

Increment build number in app.json and commit.

```bash
fastlane bump_build
```

## CI/CD with GitHub Actions

### Setting Up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Add the following secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EXPO_TOKEN` | Expo access token | Get from `npx expo login` |
| `ASC_KEY_ID` | App Store Connect Key ID | `ABC123DEFG` |
| `ASC_ISSUER_ID` | App Store Connect Issuer ID | `12345678-1234-...` |
| `ASC_KEY_CONTENT` | Base64 encoded .p8 key | `LS0tLS1CRUdJTi...` |
| `CONTACT_EMAIL` | Support email (optional) | `support@slowpitched.com` |

### Getting Expo Token

```bash
npx expo login
npx eas login
npx expo whoami --token
```

Copy the token and add it to GitHub Secrets.

### Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Deploy to TestFlight"**
3. Click **"Run workflow"**
4. (Optional) Provide changelog and TestFlight groups
5. Click **"Run workflow"** button

### Automatic Deployment on Tags

The workflow automatically triggers when you push a version tag:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Workflow Features

- ✅ Builds iOS app with EAS
- ✅ Downloads build artifact
- ✅ Uploads to TestFlight
- ✅ Supports external tester groups
- ✅ Customizable changelog
- ✅ Uploads logs on failure
- ✅ Cleans up artifacts

## Troubleshooting

### Issue: "No API token found"

**Solution**: Ensure your `.env` file exists and contains valid credentials.

```bash
# Verify .env exists
ls -la .env

# Run setup script again
cd fastlane && ./setup_api_key.sh
```

### Issue: "Could not find an IPA file"

**Solution**: Make sure you've built and downloaded the app first:

```bash
# Build with EAS
eas build --platform ios --profile production

# Download latest build
eas build:download --platform ios --latest --output=build.ipa

# Verify file exists
ls -lh build.ipa
```

### Issue: "TestFlight group not found"

**Solution**: Create the group in App Store Connect first:

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **TestFlight** tab
4. Click **"Create Group"** under **External Testing**
5. Add the group name to your `TESTFLIGHT_GROUPS` environment variable

### Issue: "Build processing failed"

**Solution**: Check the build in App Store Connect:

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **TestFlight** tab
4. Check for warnings or errors
5. Common issues:
   - Missing export compliance info (should be fixed in `app.json`)
   - Invalid entitlements
   - Provisioning profile issues

### Issue: "Authentication failed"

**Solution**: Verify your API key is still valid:

1. Check if the key is still active in [App Store Connect](https://appstoreconnect.apple.com/access/api)
2. Keys expire after about 1 year
3. Regenerate if needed and update your `.env`

### Debugging Fastlane

Enable verbose logging:

```bash
fastlane upload_only --verbose
```

Check Fastlane logs:

```bash
# On macOS
open ~/Library/Logs/fastlane/

# Or use cat
cat ~/Library/Logs/fastlane/fastlane.log
```

### Getting Help

- **Fastlane Docs**: https://docs.fastlane.tools/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **App Store Connect API**: https://developer.apple.com/app-store-connect/api/

## Best Practices

### 1. Version Management

Use semantic versioning and increment build numbers automatically:

```bash
# Update version in app.json
# Increment build number
fastlane bump_build

# Commit changes
git add app.json
git commit -m "Bump version to 1.2.3"
git tag v1.2.3
git push origin main --tags
```

### 2. Testing Groups

Organize your testers into groups:

- **Internal Testers**: Your team (automatic access)
- **Beta Testers**: Close partners/friends
- **Public Beta**: Wider audience

Configure in `.env`:

```bash
TESTFLIGHT_GROUPS=Internal Testers,Beta Testers
```

### 3. Changelog Best Practices

Provide meaningful changelogs:

```bash
# Good
CHANGELOG="Fixed camera calibration bug and improved tracking accuracy"

# Bad
CHANGELOG="Bug fixes"
```

### 4. Build Numbering

- **Version** (e.g., 1.2.3): User-facing, semantic versioning
- **Build Number**: Auto-increment for each build
- Let EAS handle build numbers with `autoIncrement: true` in `eas.json`

### 5. Pre-flight Checklist

Before deploying to TestFlight:

- [ ] All tests passing (`pnpm test`)
- [ ] No console errors or warnings
- [ ] Test on real device
- [ ] Update changelog
- [ ] Verify version/build number
- [ ] Check App Store Connect for any warnings

## Workflow Examples

### Example 1: Quick Upload

```bash
# You already have an IPA file
fastlane upload_only ipa:my-app.ipa
```

### Example 2: Full Deployment

```bash
# Build and deploy in one command
fastlane deploy
```

### Example 3: Staged Release

```bash
# 1. Build
fastlane build_with_eas

# 2. Test locally (optional)
# ... manual testing ...

# 3. Deploy
eas build:download --platform ios --latest --output=build.ipa
fastlane upload_only

# 4. Notify testers manually in App Store Connect
```

### Example 4: Automated CI/CD

```bash
# Push a tag to trigger automatic deployment
git tag -a v1.0.1 -m "Hotfix: Camera crash on iOS 17"
git push origin v1.0.1

# GitHub Actions will:
# 1. Build with EAS
# 2. Upload to TestFlight
# 3. Notify configured groups
```

## Next Steps

After setting up Fastlane:

1. **Test locally** with `fastlane upload_only`
2. **Configure GitHub Secrets** for CI/CD
3. **Create TestFlight groups** in App Store Connect
4. **Invite testers** to your beta
5. **Set up automatic deployments** via tags or manual triggers

---

**Last modified by: Claude (AI Agent) on 2025-10-21 10:45 CST**

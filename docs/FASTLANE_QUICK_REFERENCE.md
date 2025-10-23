# Fastlane Quick Reference

Quick command reference for deploying to TestFlight.

## Setup (One-Time)

```bash
# 1. Install Fastlane
gem install fastlane

# 2. Configure API key
cd fastlane
./setup_api_key.sh

# 3. Verify setup
fastlane upload_only --help
```

## Common Commands

### Deploy to TestFlight

```bash
# Build with EAS and upload (complete flow)
fastlane deploy

# Just build with EAS (no upload)
fastlane build_with_eas

# Upload existing IPA
fastlane upload_only ipa:build.ipa

# Quick beta (build + upload)
fastlane beta
```

### Build Management

```bash
# Download latest EAS build
eas build:download --platform ios --latest --output=build.ipa

# Increment build number
fastlane bump_build

# List recent builds
eas build:list --platform ios --limit 5
```

### EAS Commands

```bash
# Build for production
eas build --platform ios --profile production

# Build and wait
eas build --platform ios --profile production --wait

# Build non-interactively (for CI/CD)
eas build --platform ios --profile production --non-interactive

# Check build status
eas build:view

# List builds
eas build:list --platform ios
```

## Environment Variables

Create `.env` file with:

```bash
# Required
ASC_KEY_ID=your_key_id
ASC_ISSUER_ID=your_issuer_id
ASC_KEY_CONTENT=base64_encoded_key

# Optional
TESTFLIGHT_GROUPS=Internal Testers,Beta Testers
CHANGELOG=What's new in this build
SKIP_WAITING=true
```

## GitHub Actions

### Secrets to Configure

| Secret            | Description                    |
| ----------------- | ------------------------------ |
| `EXPO_TOKEN`      | From `npx expo whoami --token` |
| `ASC_KEY_ID`      | App Store Connect Key ID       |
| `ASC_ISSUER_ID`   | App Store Connect Issuer ID    |
| `ASC_KEY_CONTENT` | Base64 .p8 key                 |

### Trigger Deployment

```bash
# Manual trigger: Go to GitHub Actions → Deploy to TestFlight → Run workflow

# Or push a tag
git tag v1.0.0
git push origin v1.0.0
```

## Typical Workflow

```bash
# 1. Make changes to your app
# ... code ...

# 2. Test locally
pnpm test
expo start

# 3. Increment build number (optional)
fastlane bump_build

# 4. Deploy to TestFlight
fastlane deploy

# 5. Check TestFlight
# Go to App Store Connect → TestFlight
```

## Troubleshooting

```bash
# Verbose output
fastlane deploy --verbose

# Check logs
cat ~/Library/Logs/fastlane/fastlane.log

# Verify .env
cat .env

# Test API key
fastlane upload_only ipa:test.ipa --verbose
```

## File Locations

```
project/
├── fastlane/
│   ├── Fastfile          # Main configuration
│   ├── Appfile           # App identifiers
│   └── setup_api_key.sh  # Setup script
├── .env                  # Local secrets (not committed)
├── .env.example          # Template
└── .github/workflows/
    └── testflight.yml    # CI/CD workflow
```

## API Key Setup

```bash
# 1. Go to: https://appstoreconnect.apple.com/access/api
# 2. Create new key with "App Manager" role
# 3. Download .p8 file
# 4. Run setup script:
cd fastlane && ./setup_api_key.sh
```

## Links

- **Fastlane Docs**: https://docs.fastlane.tools/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com/

---

**Last modified by: Claude (AI Agent) on 2025-10-21 10:45 CST**

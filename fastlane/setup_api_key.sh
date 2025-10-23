#!/bin/bash

# Fastlane App Store Connect API Key Setup Script
# This script helps you configure your App Store Connect API key for Fastlane

set -e

echo "🔑 App Store Connect API Key Setup"
echo "===================================="
echo ""
echo "This script will help you set up your App Store Connect API key."
echo "You need to have already created an API key in App Store Connect."
echo ""
echo "To create an API key:"
echo "1. Go to https://appstoreconnect.apple.com/access/api"
echo "2. Click the '+' button to generate a new key"
echo "3. Give it a name (e.g., 'Fastlane CI')"
echo "4. Set role to 'App Manager' or higher"
echo "5. Download the .p8 file"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Please provide the following information:"
echo ""

# Get Key ID
read -p "Enter your Key ID (e.g., ABC123DEFG): " KEY_ID

# Get Issuer ID
read -p "Enter your Issuer ID (e.g., 12345678-1234-1234-1234-123456789012): " ISSUER_ID

# Get path to .p8 file
read -p "Enter the path to your .p8 key file: " P8_FILE_PATH

# Expand path
P8_FILE_PATH="${P8_FILE_PATH/#\~/$HOME}"

# Check if file exists
if [ ! -f "$P8_FILE_PATH" ]; then
    echo "❌ Error: File not found at $P8_FILE_PATH"
    exit 1
fi

# Convert to base64
echo ""
echo "Converting key to base64..."
KEY_CONTENT=$(cat "$P8_FILE_PATH" | base64)

# Create .env file
ENV_FILE="../.env"
echo ""
echo "Creating/updating .env file..."

# Backup existing .env if it exists
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup"
    echo "📦 Backed up existing .env to .env.backup"
fi

# Write to .env
cat > "$ENV_FILE" << EOF
# App Store Connect API Key Configuration
ASC_KEY_ID=$KEY_ID
ASC_ISSUER_ID=$ISSUER_ID
ASC_KEY_CONTENT=$KEY_CONTENT

# Optional: TestFlight Configuration
TESTFLIGHT_GROUPS=
CHANGELOG=Bug fixes and improvements
SKIP_WAITING=true

# Optional: Beta App Review Info
CONTACT_EMAIL=support@slowpitched.com
CONTACT_FIRST_NAME=Support
CONTACT_LAST_NAME=Team
CONTACT_PHONE=+1-555-0100
DEMO_ACCOUNT_NAME=
DEMO_ACCOUNT_PASSWORD=
REVIEW_NOTES=This is a beta release for internal testing

# Optional: Apple Developer Account
APPLE_ID=your-appleid@domain.com
TEAM_ID=JL693396NK
EOF

echo ""
echo "✅ Success! Your API key has been configured."
echo ""
echo "📝 Configuration saved to: $ENV_FILE"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   1. The .env file contains sensitive credentials"
echo "   2. Make sure .env is in your .gitignore"
echo "   3. Never commit .env to version control"
echo "   4. For CI/CD, set these as GitHub Secrets"
echo ""
echo "🧪 Test your configuration with:"
echo "   fastlane upload_only ipa:path/to/your.ipa"
echo ""
echo "📚 For more info, see docs/FASTLANE_SETUP.md"

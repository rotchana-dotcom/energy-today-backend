#!/bin/bash

# Energy Today - Google Play Store Build Script
# This script guides you through building the production AAB file

set -e

echo "🚀 Energy Today - Google Play Store Build"
echo "=========================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI found"
fi

echo ""
echo "📋 Pre-Build Checklist:"
echo ""
echo "Before building, ensure you have:"
echo "  [ ] Expo account created (https://expo.dev)"
echo "  [ ] Privacy policy URL ready"
echo "  [ ] App description reviewed"
echo "  [ ] Feature graphic and screenshots prepared"
echo ""

read -p "Have you completed the checklist above? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the checklist first"
    echo ""
    echo "📚 Resources:"
    echo "  - GOOGLE_PLAY_SUBMISSION.md - Full submission guide"
    echo "  - PLAY_STORE_LISTING.md - Store listing content"
    echo "  - SCREENSHOT_GUIDE.md - How to capture screenshots"
    exit 1
fi

echo ""
echo "🔐 Logging in to Expo..."
eas login

echo ""
echo "🔧 Configuring EAS Build..."
if [ ! -f "eas.json" ]; then
    eas build:configure
else
    echo "✅ eas.json already exists"
fi

echo ""
echo "📦 Building production AAB for Google Play Store..."
echo ""
echo "This will:"
echo "  1. Generate Android keystore (if first build)"
echo "  2. Build optimized production app bundle"
echo "  3. Upload to Expo servers"
echo "  4. Provide download link"
echo ""
echo "⏱️  Build time: ~10-15 minutes"
echo ""

read -p "Start build now? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Build cancelled"
    exit 1
fi

echo ""
echo "🏗️  Starting build..."
eas build --platform android --profile production

echo ""
echo "✅ Build submitted!"
echo ""
echo "📥 Next steps:"
echo ""
echo "1. Wait for build to complete (~10-15 minutes)"
echo "2. Check build status: https://expo.dev"
echo "3. Download AAB file when ready"
echo "4. Upload to Google Play Console"
echo ""
echo "📚 See GOOGLE_PLAY_SUBMISSION.md for detailed upload instructions"
echo ""

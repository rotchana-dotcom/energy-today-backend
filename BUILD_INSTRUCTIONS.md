# Build Instructions for Google Play (AAB File)

## Overview

This guide explains how to build your Energy Today app into an **Android App Bundle (AAB)** file that you'll upload to Google Play Console for Internal Testing and Production release.

---

## Prerequisites

### 1. Install EAS CLI

If you haven't already installed Expo Application Services (EAS) CLI:

```bash
npm install -g eas-cli
```

### 2. Create Expo Account

If you don't have an Expo account:

```bash
eas login
```

Or create one at: https://expo.dev/signup

### 3. Configure Project

Link your project to Expo (if not already done):

```bash
cd /home/ubuntu/energy_today
eas build:configure
```

This will:
- Create or update `eas.json` (already exists)
- Link your project to your Expo account
- Set up build profiles

---

## Build Process

### Option 1: Build on Expo Servers (Recommended)

This is the **easiest method** - Expo builds your app on their servers.

#### Step 1: Start the Build

```bash
cd /home/ubuntu/energy_today
eas build --platform android --profile production
```

#### Step 2: Follow Prompts

The CLI will ask:
- **Generate a new Android Keystore?** → Yes (first time only)
- **Set up automatic keystore management?** → Yes (recommended)

#### Step 3: Wait for Build

- Build typically takes **10-20 minutes**
- You'll see progress in the terminal
- You can close terminal and check status at: https://expo.dev/accounts/[your-account]/projects/energy_today/builds

#### Step 4: Download AAB

Once complete:
- CLI will show download link
- Or go to: https://expo.dev → Your Projects → Energy Today → Builds
- Click on the latest build
- Click **Download** button
- Save as `energy-today.aab`

---

### Option 2: Build Locally (Advanced)

If you prefer to build on your own machine:

#### Requirements:
- Android Studio installed
- Java JDK 17+ installed
- Android SDK configured

#### Build Command:

```bash
cd /home/ubuntu/energy_today
eas build --platform android --profile production --local
```

This will build the AAB file in your project directory.

---

## Verify Your Build

After downloading the AAB file, verify it:

### Check File Size
```bash
ls -lh energy-today.aab
```
Expected size: **30-80 MB** (typical for React Native apps)

### Check File Type
```bash
file energy-today.aab
```
Should show: `Zip archive data`

### Extract and Inspect (Optional)
```bash
unzip -l energy-today.aab | head -20
```
Should show Android manifest and resources

---

## Build Configuration Details

Your `eas.json` is configured with:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

This means:
- **buildType: "app-bundle"** → Generates AAB (required for Play Store)
- **gradleCommand** → Uses release configuration (optimized, signed)

---

## Version Management

### Current Version

Check your current version in `app.config.ts`:

```typescript
version: "1.0.0"
```

### Increment Version for Updates

When you need to upload a new version:

1. **Update version in app.config.ts**:
   ```typescript
   version: "1.0.1"  // or 1.1.0, 2.0.0, etc.
   ```

2. **Rebuild**:
   ```bash
   eas build --platform android --profile production
   ```

Google Play requires each new upload to have a **higher version code** than the previous one.

---

## Keystore Management

### What is a Keystore?

A keystore is a cryptographic key used to sign your app. **You must use the same keystore for all updates** to your app.

### Automatic Management (Recommended)

When you chose "Yes" to automatic keystore management, Expo:
- Generates a keystore for you
- Stores it securely on their servers
- Uses it automatically for all future builds
- **You don't need to manage it manually**

### Manual Management (Advanced)

If you want to manage your own keystore:

1. **Generate keystore**:
   ```bash
   keytool -genkeypair -v -keystore energy-today.keystore \
     -alias energy-today -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update eas.json**:
   ```json
   {
     "build": {
       "production": {
         "android": {
           "credentialsSource": "local"
         }
       }
     }
   }
   ```

3. **Build with local keystore**:
   ```bash
   eas build --platform android --profile production
   ```

**⚠️ Important**: If you lose your keystore, you can **never update your app** - you'll have to publish a new app with a different package name.

---

## Troubleshooting

### Build Failed: "Gradle build failed"

**Cause**: Dependency or configuration issue

**Solution**:
1. Check build logs on Expo dashboard
2. Look for specific error messages
3. Common fixes:
   - Update dependencies: `pnpm update`
   - Clear cache: `eas build --platform android --profile production --clear-cache`

### Build Failed: "Out of memory"

**Cause**: Not enough memory during build

**Solution**:
- Use Expo servers (not local build)
- Expo servers have more resources

### Build Succeeded but AAB is Huge (>100MB)

**Cause**: Unnecessary assets or dependencies

**Solution**:
1. Check for large files in `assets/`
2. Optimize images (compress, resize)
3. Remove unused dependencies

### "Version code already exists" on Upload

**Cause**: You're uploading the same version again

**Solution**:
1. Increment version in `app.config.ts`
2. Rebuild with new version

### Can't Download AAB from Expo

**Cause**: Build might have failed or still in progress

**Solution**:
1. Check build status: https://expo.dev
2. Look for error messages in build logs
3. Try building again if failed

---

## Build Checklist

Before building, make sure:

- [ ] All code changes committed and tested
- [ ] `app.config.ts` has correct app name and version
- [ ] Privacy policy URL is set correctly
- [ ] App icon and splash screen are finalized
- [ ] No console errors or warnings
- [ ] Tested on web preview (basic functionality)

---

## Quick Reference Commands

```bash
# Login to Expo
eas login

# Check build status
eas build:list

# Build for Android (Production)
eas build --platform android --profile production

# Build for Android (with cache clear)
eas build --platform android --profile production --clear-cache

# Check project configuration
eas build:configure

# View build logs
eas build:view [build-id]
```

---

## After Building

Once you have your `energy-today.aab` file:

1. ✅ Follow **INTERNAL_TESTING_GUIDE.md** to upload to Google Play Console
2. ✅ Set up Internal Testing track
3. ✅ Add testers
4. ✅ Test thoroughly
5. ✅ Promote to Production
6. ✅ Submit for Google review

---

## Cost

- **Expo builds**: Free tier includes limited builds per month
- **Paid plan**: $29/month for unlimited builds (optional)
- **Google Play**: $25 one-time developer fee (already paid)

---

## Support

If you encounter build issues:
- Expo documentation: https://docs.expo.dev/build/introduction/
- Expo forums: https://forums.expo.dev/
- Build logs: https://expo.dev → Your Projects → Energy Today → Builds

Good luck with your build! 🚀

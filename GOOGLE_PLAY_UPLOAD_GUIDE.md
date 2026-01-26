# Google Play Upload Guide - Energy Today v1.0.4

**Version:** 1.0.4  
**Build Date:** January 15, 2026  
**Target:** Internal Testing → Production

---

## Prerequisites

### 1. Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### 2. Login to Expo Account

```bash
eas login
```

Enter your Expo credentials when prompted.

### 3. Verify Project Configuration

Check that `app.config.ts` has the correct version:

```typescript
version: "1.0.4"
```

---

## Step 1: Build the AAB File

### Option A: Build on EAS Servers (Recommended)

```bash
cd /path/to/energy_today
eas build --platform android --profile production
```

**What happens:**
1. EAS uploads your code to Expo servers
2. Build process takes 15-20 minutes
3. You'll receive a download link when complete
4. Download the `.aab` file to your computer

**Expected output:**
```
✔ Build finished
Download URL: https://expo.dev/accounts/[your-account]/projects/energy_today/builds/[build-id]
```

### Option B: Build Locally (Faster, requires Android Studio)

```bash
cd /path/to/energy_today
eas build --platform android --profile production --local
```

**Requirements:**
- Android Studio installed
- Android SDK configured
- Java JDK 17+

---

## Step 2: Download the AAB File

1. Click the download link from EAS build output
2. Save the file as `energy_today_v1.0.4.aab`
3. Verify file size (should be 30-50 MB)

---

## Step 3: Upload to Google Play Console

### 3.1 Access Google Play Console

1. Go to https://play.google.com/console
2. Login with your Google account
3. Select **Energy Today** app

### 3.2 Navigate to Internal Testing

1. Click **Testing** in left sidebar
2. Click **Internal testing**
3. Click **Create new release**

### 3.3 Upload the AAB File

1. Click **Upload** button
2. Select `energy_today_v1.0.4.aab`
3. Wait for upload to complete (1-2 minutes)
4. Google Play will automatically process the file

### 3.4 Add Release Notes

Copy and paste the release notes from `RELEASE_NOTES_v1.0.4.txt` (see below).

**English (en-US):**
```
Bug fixes and improvements:
- Fixed moon phase calculation accuracy (now matches NASA data)
- Improved energy type calculations
- Enhanced performance and reliability
- Updated lunar cycle calculations

This update ensures all moon phases display correctly and energy readings are more accurate.
```

### 3.5 Review and Publish

1. Review the release details
2. Click **Save**
3. Click **Review release**
4. Click **Start rollout to Internal testing**

---

## Step 4: Share with Internal Testers

### 4.1 Add Testers (if not already added)

1. Go to **Testing** → **Internal testing**
2. Click **Testers** tab
3. Click **Create email list**
4. Add tester emails (up to 100 for internal testing)
5. Click **Save changes**

### 4.2 Share Testing Link

1. Copy the **Opt-in URL** from the Testers tab
2. Send to your 5 internal testers
3. Testers click the link → Accept invitation → Install app

**Example opt-in URL:**
```
https://play.google.com/apps/internaltest/[your-app-id]
```

---

## Step 5: Monitor Feedback (2-3 Days)

### What to Monitor

1. **Crash Reports**
   - Go to **Quality** → **Android vitals** → **Crashes**
   - Check for any new crashes

2. **ANR (App Not Responding)**
   - Go to **Quality** → **Android vitals** → **ANRs**
   - Check for any freezing issues

3. **Tester Feedback**
   - Ask testers to verify:
     - Moon phases are correct
     - Energy calculations feel accurate
     - No undefined errors
     - Navigation works smoothly

### Expected Testing Period

- **Day 1:** Testers install and test basic functionality
- **Day 2:** Testers use daily and report any issues
- **Day 3:** Final review and decision to promote

---

## Step 6: Promote to Production (After Testing)

### If No Issues Found

1. Go to **Testing** → **Internal testing**
2. Click **Promote release**
3. Select **Production**
4. Review release notes
5. Click **Start rollout to Production**
6. Choose rollout percentage:
   - **20%** for cautious rollout (recommended)
   - **50%** for moderate rollout
   - **100%** for full rollout

### If Issues Found

1. Fix the issues in the code
2. Increment version to 1.0.5
3. Rebuild and upload new AAB
4. Repeat testing process

---

## Troubleshooting

### Build Fails

**Error: "Build failed with error"**

**Solution:**
```bash
# Clear cache and retry
eas build:clear
eas build --platform android --profile production
```

### Upload Rejected

**Error: "Version code must be higher than previous"**

**Solution:**
- Increment `versionCode` in `app.config.ts`
- Rebuild the AAB

**Error: "APK signature verification failed"**

**Solution:**
- Ensure you're using the same keystore
- Check EAS credentials: `eas credentials`

### Testers Can't Install

**Error: "App not available in your country"**

**Solution:**
1. Go to **Production** → **Countries/regions**
2. Add the tester's country
3. Save changes

---

## Build Configuration Reference

### app.config.ts Settings

```typescript
{
  name: "Energy Today",
  slug: "energy_today",
  version: "1.0.4",  // ← Must match release version
  android: {
    package: "space.manus.energy_today.t20251227002435",
    versionCode: 4,  // ← Auto-incremented by EAS
  }
}
```

### EAS Build Profile (eas.json)

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

---

## Timeline Summary

| Step | Duration | When |
|------|----------|------|
| Build AAB | 15-20 min | Tomorrow morning |
| Upload to Google Play | 5 min | Tomorrow morning |
| Internal testing | 2-3 days | Tomorrow - Weekend |
| Review feedback | 1 day | Monday |
| Promote to production | 5 min | Monday/Tuesday |
| Production rollout | 1-7 days | Next week |

---

## Important Notes

### Version Numbers

- **Version Name:** 1.0.4 (user-facing)
- **Version Code:** 4 (internal, auto-incremented)

### Release Track Flow

```
Internal Testing (5 testers)
    ↓
Closed Testing (optional, up to 100 testers)
    ↓
Open Testing (optional, public beta)
    ↓
Production (all users)
```

For this release, we're going:
**Internal Testing → Production** (skipping closed/open testing)

### Rollback Plan

If critical issues are found in production:

1. **Immediate:** Stop rollout at current percentage
2. **Short-term:** Halt new installs
3. **Fix:** Release v1.0.5 with hotfix
4. **Resume:** Gradual rollout of fixed version

---

## Checklist Before Upload

- [ ] Version number updated to 1.0.4
- [ ] All tests passed (30/30)
- [ ] Moon phase bug fixed and verified
- [ ] App icon and branding correct
- [ ] Privacy policy URL set
- [ ] Release notes prepared
- [ ] EAS CLI installed and logged in
- [ ] Build profile configured
- [ ] Testers list ready (5 emails)

---

## Contact & Support

**Expo EAS Support:** https://expo.dev/support  
**Google Play Support:** https://support.google.com/googleplay/android-developer

---

**Good luck with the upload tomorrow!** 🚀

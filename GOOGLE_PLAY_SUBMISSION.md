# Google Play Store Submission Guide

Complete step-by-step guide to publish Energy Today on Google Play Store.

---

## Prerequisites

1. **Google Play Console Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console
   - Complete account verification
   - Accept Developer Distribution Agreement

2. **Expo Account** (Free)
   - Sign up at: https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

---

## Step 1: Configure App for Production

### Update app.config.ts

Ensure these fields are set correctly:

```typescript
{
  name: "Energy Today",
  slug: "energy_today",
  version: "1.0.0",
  android: {
    package: "space.manus.energy.today.t...",  // Your unique bundle ID
    versionCode: 1,  // Increment for each release
    permissions: ["POST_NOTIFICATIONS"],
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png"
    }
  }
}
```

### Privacy Policy (Required)

Google Play requires a privacy policy URL. Create one at:
- https://www.privacypolicygenerator.info/
- Or use: https://www.freeprivacypolicy.com/

Add to `app.config.ts`:
```typescript
{
  android: {
    ...
    privacyPolicy: "https://yourwebsite.com/privacy-policy"
  }
}
```

---

## Step 2: Build Production AAB

### Install EAS CLI

```bash
cd /home/ubuntu/energy_today
npm install -g eas-cli
eas login
```

### Configure EAS Project

```bash
# Link to Expo project
eas build:configure

# This creates eas.json (already done)
```

### Build for Android

```bash
# Production build (creates AAB file for Play Store)
eas build --platform android --profile production

# This will:
# 1. Ask if you want EAS to manage credentials (say YES)
# 2. Generate Android keystore automatically
# 3. Build the app bundle (.aab file)
# 4. Provide download link when complete (~10-15 minutes)
```

### Download the AAB

```bash
# After build completes, download the .aab file
# The build URL will look like:
# https://expo.dev/accounts/[username]/projects/energy_today/builds/[build-id]

# Download via CLI:
eas build:download --platform android --profile production
```

---

## Step 3: Prepare Store Assets

### Required Graphics

1. **App Icon** (512x512 PNG)
   - Already have: `assets/images/icon.png`
   - Ensure it's exactly 512x512 pixels
   - No transparency, no rounded corners

2. **Feature Graphic** (1024x500 PNG)
   - Create a banner showcasing the app
   - Use app colors and branding
   - Include app name and tagline

3. **Screenshots** (Required: minimum 2, maximum 8)
   - Phone: 1080x1920 or 1080x2340 pixels
   - Tablet (optional): 1920x1080 or 2560x1440 pixels
   - Show key features: Today screen, Calendar, Journal, Settings

### Screenshot Tips

Use Expo's web preview to capture screenshots:
```bash
# Open web preview
npm run dev

# Use browser dev tools to set mobile viewport
# Take screenshots of:
# 1. Onboarding/Welcome screen
# 2. Today screen with energy score
# 3. Calendar view
# 4. Journal/Log screen
# 5. Settings screen
```

---

## Step 4: Create Play Store Listing

### Login to Google Play Console

1. Go to: https://play.google.com/console
2. Click "Create app"
3. Fill in basic details:
   - App name: **Energy Today**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free** (with in-app purchases)
   - Declarations: Check all required boxes

### Store Listing

**App name:** Energy Today

**Short description** (80 characters max):
```
Optimize your timing for meetings, launches, and decisions with energy insights
```

**Full description** (4000 characters max):
```
Understand Your Energy, Optimize Your Timing

Make better decisions by understanding the energy of each day and how it aligns with your personal flow.

Energy Today helps you identify the best times for important meetings, product launches, creative work, and major decisions. By analyzing daily energy patterns and your personal timing, the app provides practical recommendations for optimal scheduling.

KEY FEATURES

✓ Daily Energy Score
See today's energy level and how it aligns with your personal timing patterns.

✓ Smart Calendar
View energy scores for any date to plan important events strategically.

✓ Activity Recommendations
Get specific suggestions for what to focus on each day based on energy alignment.

✓ Journal & Reflection
Track your experiences and mood to discover personal patterns over time.

✓ Future Forecasts
Preview energy trends for the next 7-30 days to plan ahead.

✓ Personal Energy Profile
Understand your unique timing patterns, strengths, and optimal days.

✓ Smart Notifications
Receive alerts during high-energy windows for important activities.

✓ ADHD-Friendly Mode
High-contrast colors and simplified layouts for better focus.

✓ Privacy First
All your data stays private on your device. No cloud sync required.

PRO FEATURES

• Deep energy calculations and pattern insights
• Journal templates for meetings, decisions, and creative work
• CSV data export for custom analysis
• Advanced recommendations

PERFECT FOR

• Business professionals scheduling important meetings
• Entrepreneurs planning product launches
• Creatives optimizing work sessions
• Anyone making major life decisions

Energy Today presents timing optimization in everyday business language that everyone can understand and use, regardless of background or beliefs.

Download now and start making better-timed decisions today.
```

**App category:** Productivity

**Tags:** productivity, planning, calendar, journal, wellness

**Email:** your-support-email@example.com

**Privacy policy URL:** https://yourwebsite.com/privacy-policy

---

## Step 5: Upload AAB and Complete Setup

### Main Store Listing

1. **Upload screenshots** (2-8 images)
2. **Upload feature graphic** (1024x500 PNG)
3. **Upload app icon** (512x512 PNG) - if not auto-detected from AAB

### App Content

1. **Privacy Policy** - Add URL
2. **Ads** - Select "No, my app does not contain ads"
3. **Content Rating**
   - Complete questionnaire
   - Select "Productivity" category
   - Answer questions honestly (likely PEGI 3 / Everyone)
4. **Target Audience**
   - Age group: 18-65+
   - Appeals to children: No
5. **News App** - No
6. **COVID-19 Contact Tracing** - No
7. **Data Safety**
   - Collects data: Yes (date of birth, journal entries)
   - Shares data: No
   - Data encrypted: Yes
   - User can request deletion: Yes
   - All data stored locally on device

### Production Release

1. Go to **Production** → **Create new release**
2. Upload the `.aab` file you downloaded from EAS
3. **Release name:** 1.0.0 (matches app version)
4. **Release notes:**
```
Initial release of Energy Today

Features:
• Daily energy scores and alignment tracking
• Smart calendar with energy forecasts
• Journal with voice notes and templates
• Personal energy profile analysis
• Smart notifications for optimal timing
• ADHD-friendly high-contrast mode
• Multi-language support (English/Thai)
• Privacy-first: all data stored locally
```

5. Click **Save** → **Review release**
6. Click **Start rollout to Production**

---

## Step 6: Review Process

### Timeline
- **Review time:** 1-7 days (usually 2-3 days)
- **First review:** May take longer
- **Status:** Check in Play Console dashboard

### Common Rejection Reasons
1. **Missing privacy policy** - Ensure URL is accessible
2. **Permissions not explained** - Add to description why notifications are needed
3. **Icon issues** - Ensure 512x512 PNG, no transparency
4. **Crashes** - Test thoroughly before submission

### After Approval
- App goes live on Google Play Store
- Users can search and download
- You'll receive email confirmation
- Monitor reviews and ratings

---

## Step 7: Post-Launch

### Monitor Performance
- Check crash reports in Play Console
- Respond to user reviews
- Track downloads and ratings

### Updates
To release an update:
```bash
# 1. Update version in app.config.ts
{
  version: "1.0.1",
  android: {
    versionCode: 2  // Increment by 1
  }
}

# 2. Build new AAB
eas build --platform android --profile production

# 3. Upload to Play Console → Create new release
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and retry
eas build:clear-cache --platform android
eas build --platform android --profile production
```

### AAB Too Large (>150MB)
- Expo builds are usually 30-50MB, should be fine
- If needed, enable app bundles to reduce size

### Keystore Issues
- EAS manages keystores automatically
- Don't lose access to your Expo account (keystore is stored there)
- Download keystore backup: `eas credentials`

---

## Quick Reference Commands

```bash
# Login to EAS
eas login

# Build production AAB
eas build --platform android --profile production

# Check build status
eas build:list

# Download AAB
eas build:download --platform android

# View credentials
eas credentials

# Submit to Play Store (after configuring service account)
eas submit --platform android
```

---

## Support

- **Expo Documentation:** https://docs.expo.dev/build/introduction/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Status:** https://expo.dev/accounts/[your-username]/projects/energy_today/builds

---

## Checklist Before Submission

- [ ] Privacy policy URL added to app.config.ts
- [ ] App icon is 512x512 PNG
- [ ] Feature graphic is 1024x500 PNG
- [ ] At least 2 screenshots prepared
- [ ] App description written
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] AAB file built and downloaded
- [ ] Tested AAB on physical Android device
- [ ] Release notes written
- [ ] All Play Console sections marked as "Complete"

---

Good luck with your submission! 🚀

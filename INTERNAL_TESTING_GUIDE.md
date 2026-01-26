# Google Play Internal Testing Setup Guide

## Overview

Internal Testing is the **fastest way** to get your app published on Google Play. Unlike Closed Testing (which requires 20+ testers and 14 days), Internal Testing allows you to:

- Add just 1-100 testers (can be yourself + friends/family)
- No mandatory waiting period
- Promote to Production immediately after testing
- Quick approval process (usually 1-3 days)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ Google Play Console developer account ($25 one-time fee, approved)
- ✅ App icon (512x512 PNG) - **Ready**
- ✅ Feature graphic (1024x500 PNG) - **Ready**
- ✅ Screenshots (2-8 phone screenshots) - **Capture from app**
- ✅ Privacy Policy URL - **Ready** (https://rotchana-dotcom.github.io/smart-gate-check/)
- ✅ AAB build file - **Need to generate** (see BUILD_INSTRUCTIONS.md)

---

## Step-by-Step Guide

### Part 1: Create Internal Testing Track

1. **Go to Google Play Console**
   - Navigate to: https://play.google.com/console
   - Select your app (Energy Today)

2. **Open Testing Section**
   - In left sidebar, click **Testing** → **Internal testing**
   - Click **Create new release**

3. **Upload AAB File**
   - Click **Upload** button
   - Select your `energy-today.aab` file (generated from build)
   - Wait for upload to complete (may take 2-5 minutes)
   - Google will process the file and show app details

4. **Fill Release Details**
   - **Release name**: `1.0.0 - Initial Release`
   - **Release notes**: 
     ```
     Initial release of Energy Today
     
     Features:
     • Daily energy and timing insights
     • Calendar view with optimal day indicators
     • Personal journal with pattern tracking
     • 7-day energy forecast
     • Pro features: Advanced insights, goal tracking, team sync
     ```

5. **Review and Save**
   - Click **Save**
   - Click **Review release**
   - If everything looks good, click **Start rollout to Internal testing**

---

### Part 2: Add Testers

1. **Create Tester List**
   - Go to **Testing** → **Internal testing**
   - Scroll to **Testers** section
   - Click **Create email list**

2. **Add Email Addresses**
   - **List name**: `Internal Testers`
   - Add email addresses (one per line):
     ```
     your.email@gmail.com
     friend1@gmail.com
     friend2@gmail.com
     ```
   - You need at least **1 tester** (can be yourself)
   - Click **Save changes**

3. **Copy Testing Link**
   - After adding testers, you'll see a **Copy link** button
   - Copy this link - you'll send it to testers
   - Example: `https://play.google.com/apps/internaltest/4701234567890123456`

---

### Part 3: Send to Testers

1. **Email Your Testers**
   - Send them the testing link
   - Example email:
     ```
     Subject: Test Energy Today App (Internal Testing)
     
     Hi!
     
     I'm launching Energy Today on Google Play and need your help testing it.
     
     Steps:
     1. Click this link: [Your Testing Link]
     2. Click "Become a tester"
     3. Wait 5-10 minutes for access
     4. Install the app from Google Play Store
     5. Test the app and let me know if you find any issues
     
     Thanks!
     ```

2. **Testers Accept Invite**
   - Testers click the link
   - Click **Become a tester**
   - Wait 5-10 minutes for Google to process
   - Search "Energy Today" in Play Store
   - Install and test

---

### Part 4: Complete Store Listing (Required Before Production)

Even for Internal Testing, you need to complete these sections:

#### 1. Main Store Listing
- **App name**: Energy Today
- **Short description**: Daily energy insights for better timing and decision-making
- **Full description**: (See PLAY_STORE_LISTING.md)
- **App icon**: Upload 512x512 PNG
- **Feature graphic**: Upload 1024x500 PNG
- **Screenshots**: Upload 2-8 phone screenshots

#### 2. Content Rating
- Click **Start questionnaire**
- Select **Utility, Productivity, Communication, or Other**
- Answer questions honestly (No violence, No social features, etc.)
- Submit and receive rating (usually E for Everyone)

#### 3. Target Audience
- **Target age group**: 18+
- **Appeals to children**: No
- Click **Save**

#### 4. News App
- **Is this a news app?**: No
- Click **Save**

#### 5. COVID-19 Contact Tracing
- **Is this a contact tracing app?**: No
- Click **Save**

#### 6. Data Safety
- **Does your app collect data?**: Yes (birth date, journal entries - stored locally)
- **Is data shared with third parties?**: No
- **Is data encrypted?**: Yes (device storage encryption)
- **Can users request data deletion?**: Yes (uninstall app)
- Click **Save**

#### 7. Government Apps
- **Is this a government app?**: No
- Click **Save**

#### 8. Financial Features
- **Does your app have financial features?**: No
- Click **Save**

#### 9. Ads
- **Does your app contain ads?**: No
- Click **Save**

#### 10. App Category
- **Category**: Lifestyle (or Productivity)
- **Tags**: energy, timing, planning, productivity, journal
- Click **Save**

#### 11. Contact Details
- **Email**: your.email@example.com
- **Phone**: (Optional)
- **Website**: https://kea.today (or your website)
- Click **Save**

---

### Part 5: Monitor Testing

1. **Check Dashboard**
   - Go to **Testing** → **Internal testing**
   - View **Statistics** tab to see:
     - Number of testers who accepted
     - Number of installs
     - Crash reports (if any)

2. **Wait for Feedback**
   - Test the app yourself thoroughly
   - Ask testers to report any bugs or issues
   - Fix critical issues and upload new version if needed

3. **Testing Duration**
   - Internal Testing has **no minimum duration**
   - You can promote to Production as soon as you're confident
   - Recommended: Test for at least 2-3 days

---

### Part 6: Promote to Production

Once testing is complete and you're satisfied:

1. **Go to Internal Testing**
   - Click **Testing** → **Internal testing**
   - Find your release

2. **Promote Release**
   - Click **Promote release**
   - Select **Production**
   - Click **Promote**

3. **Review Production Release**
   - Add production release notes (can be same as testing)
   - Click **Save**
   - Click **Review release**
   - Click **Start rollout to Production**

4. **Submit for Review**
   - Google will review your app (1-3 days typically)
   - You'll receive email updates on review status
   - If approved, your app goes live!
   - If rejected, fix issues and resubmit

---

## Troubleshooting

### "Send for review" button is greyed out
- **Cause**: Not all required sections completed
- **Solution**: Check **Publishing overview** → Complete all sections marked incomplete

### Upload failed / Invalid AAB
- **Cause**: Build configuration issue
- **Solution**: Make sure you built with `eas build --platform android --profile production`

### Testers can't find the app
- **Cause**: They haven't waited long enough after accepting invite
- **Solution**: Wait 10-15 minutes, then search Play Store again

### App crashes on tester devices
- **Cause**: Device compatibility or code bug
- **Solution**: Check crash reports in Play Console → Fix → Upload new version

### Store listing won't save
- **Cause**: Browser compatibility (Chromebook issue)
- **Solution**: Use Chrome browser on desktop, clear cache, try incognito mode

---

## Timeline Estimate

| Step | Duration |
|------|----------|
| Build AAB file | 10-20 minutes |
| Upload to Internal Testing | 5-10 minutes |
| Add testers | 5 minutes |
| Testers accept & install | 10-30 minutes |
| Testing period | 2-3 days (recommended) |
| Promote to Production | 5 minutes |
| Google review | 1-3 days |
| **Total to live** | **3-5 days** |

---

## Important Notes

- **Internal Testing does NOT appear in public Play Store** - only testers with the link can access
- **You can have multiple testing tracks** - Internal, Closed, Open all at once
- **Version codes must increase** - Each new upload needs a higher version code (1, 2, 3, etc.)
- **You can't skip Internal Testing** - Google requires at least one testing track before Production
- **Testers need Google accounts** - They must be signed into a Google account to test

---

## Next Steps After This Guide

1. ✅ Read BUILD_INSTRUCTIONS.md to generate your AAB file
2. ✅ Capture 2-8 screenshots from the app (see SCREENSHOT_GUIDE.md)
3. ✅ Follow this guide to set up Internal Testing
4. ✅ Test thoroughly for 2-3 days
5. ✅ Promote to Production and submit for review
6. ✅ Wait for Google approval (1-3 days)
7. ✅ Celebrate your app launch! 🎉

---

## Support

If you encounter issues:
- Check Google Play Console Help: https://support.google.com/googleplay/android-developer
- Review common rejection reasons: https://support.google.com/googleplay/android-developer/answer/9899234
- Contact Google Play Developer Support (in Console → Help)

Good luck with your launch! 🚀

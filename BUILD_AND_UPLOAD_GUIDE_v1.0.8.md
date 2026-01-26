# Energy Today v1.0.8 - Build and Upload Guide

**Complete step-by-step instructions for building the .aab file and uploading to Google Play**

---

## Prerequisites

Before you start, make sure you have:

- [ ] Expo account (https://expo.dev)
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Google Play Console access
- [ ] Project files downloaded to your computer

---

## Step 1: Prepare Your Computer

### 1.1 Install EAS CLI (if not already installed)

Open CMD (Windows) or Terminal (Mac):

```bash
npm install -g eas-cli
```

### 1.2 Login to Expo

```bash
eas login
```

Enter your Expo account credentials when prompted.

### 1.3 Navigate to Project Folder

```bash
cd C:\path\to\energy_today
```

Replace `C:\path\to\energy_today` with the actual path where you downloaded the project.

---

## Step 2: Build the .aab File

### 2.1 Start the Build

Run this command:

```bash
eas build --platform android --profile production
```

### 2.2 What Happens Next

The command will:
1. Upload your code to Expo's build servers
2. Start building the .aab file
3. Show you a build URL (e.g., `https://expo.dev/accounts/yourname/projects/energy_today/builds/...`)

### 2.3 Wait for Build to Complete

- **Time**: 15-20 minutes
- **Status**: You can check the build URL in your browser
- **When complete**: You'll see "Build finished" and a download link

### 2.4 Download the .aab File

Click the download link or run:

```bash
eas build:download --platform android
```

The file will be named something like: `energy-today-1.0.8-build-123.aab`

---

## Step 3: Upload to Google Play Console

### 3.1 Open Google Play Console

1. Go to https://play.google.com/console
2. Login with your Google account
3. Select "Energy Today" app

### 3.2 Navigate to Internal Testing

1. Click **"Testing"** in the left sidebar
2. Click **"Internal testing"**
3. Click **"Create new release"** button

### 3.3 Upload the .aab File

1. Click **"Upload"** button
2. Select the `energy-today-1.0.8-build-123.aab` file you downloaded
3. Wait for upload to complete (1-2 minutes)

### 3.4 Add Release Notes

Copy and paste these release notes:

```
Version 1.0.8 - Payment Integration & Pro Features

What's New:
• Real Stripe payment processing for Pro subscriptions
• 7 exclusive Pro features (Coaching, Habits, Business, Trends, Weekly Plan, Team Sync, Insights)
• Fixed profile persistence issue in production builds
• Fixed moon phase calculation accuracy (verified against NASA data)
• Enhanced Pro tier value - free users now see clear upgrade benefits

Bug Fixes:
• Profile data now persists correctly between app sessions
• Moon phases now match astronomical data exactly
• Energy type calculations corrected

Pro Subscription: $9.99/month
• Energy Coaching with weekly recommendations
• Habit-Energy correlation tracking
• Business metrics dashboard with ROI
• Historical energy trends and charts
• Weekly planning with energy optimization
• Team energy synchronization
• Pattern insights from journal entries
```

### 3.5 Review and Publish

1. Click **"Review release"**
2. Check that everything looks correct
3. Click **"Start rollout to Internal testing"**
4. Click **"Rollout"** to confirm

---

## Step 4: Share with Internal Testers

### 4.1 Get the Opt-In URL

1. Stay on the Internal testing page
2. Scroll down to **"Testers"** section
3. Copy the **"Copy link"** URL (looks like: `https://play.google.com/apps/internaltest/...`)

### 4.2 Send to Your 5 Testers

Send them this message:

```
Hi! I've released Energy Today v1.0.8 for internal testing.

To install:
1. Click this link: [paste opt-in URL]
2. Accept the invitation
3. Download the app from Google Play
4. Test the Pro subscription upgrade (it will charge real money - I'll refund you)

Please test:
- Profile creation and persistence (close app, reopen - does it remember you?)
- Upgrade to Pro ($9.99/month via Stripe)
- Access to Pro features (Coaching, Habits, Business, Trends, Weekly Plan, Team Sync, Insights)
- Moon phase accuracy

Report any issues to me within 2-3 days. Thanks!
```

---

## Step 5: Test the Payment Flow Yourself

### 5.1 Install the App

1. Open the opt-in URL on your Android phone
2. Accept the invitation
3. Download "Energy Today" from Google Play
4. Open the app

### 5.2 Complete Onboarding

1. Enter your name
2. Enter your birthday
3. Complete the profile setup

### 5.3 Test Stripe Payment

1. Tap any Pro feature (e.g., "Coaching")
2. Tap **"Upgrade to Pro"**
3. Tap **"Pay with Stripe"**
4. You'll be redirected to Stripe checkout
5. Enter a test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete the payment

### 5.4 Verify Pro Access

1. Go back to the app
2. Try accessing Pro features:
   - ✅ Coaching
   - ✅ Habits (correlation analysis)
   - ✅ Business metrics
   - ✅ Trends
   - ✅ Weekly Plan
   - ✅ Team Sync
   - ✅ Insights

All should now be accessible without "Upgrade" prompts.

### 5.5 Test Persistence

1. Close the app completely (swipe away from recent apps)
2. Reopen the app
3. Verify:
   - ✅ Profile is still there (no need to re-enter birthday)
   - ✅ Pro features are still accessible
   - ✅ Moon phase is still showing correctly

---

## Step 6: Monitor for Issues

### 6.1 Check Crashes

1. In Google Play Console, go to **"Quality" → "Android vitals" → "Crashes & ANRs"**
2. Check if any crashes are reported
3. If crashes found, note the error message and report to me

### 6.2 Collect Tester Feedback

Wait 2-3 days for testers to report issues. Common things to watch for:
- Payment not working
- Pro features not unlocking
- Profile data lost after app restart
- Moon phase inaccurate

---

## Step 7: Promote to Production (After Testing)

**ONLY do this after 2-3 days of successful internal testing with no major issues**

1. Go to **"Testing" → "Internal testing"**
2. Click **"Promote release"**
3. Select **"Production"**
4. Click **"Start rollout to Production"**
5. Choose rollout percentage (start with 20%, then increase to 50%, then 100%)

---

## Troubleshooting

### Build Fails

**Error**: "Invalid credentials"
- **Solution**: Run `eas login` again

**Error**: "Build failed"
- **Solution**: Check the build logs at the build URL
- Common fix: Run `npm install` in the project folder first

### Upload Fails

**Error**: "Version code already exists"
- **Solution**: The version was already uploaded. Increment version in `app.config.ts` and rebuild.

### Payment Not Working

**Error**: "Stripe checkout not loading"
- **Solution**: Check that Stripe keys are correctly set in Settings → Secrets
- Verify keys start with `pk_live_` and `sk_live_` (not `pk_test_`)

**Error**: "Payment succeeds but Pro features don't unlock"
- **Solution**: This is a webhook issue. Check server logs for errors.

### Profile Not Persisting

**Error**: "App asks for birthday again after closing"
- **Solution**: This should be fixed in v1.0.8. If still happening, check Android settings → Apps → Energy Today → Storage → Clear cache (NOT clear data)

---

## Summary Checklist

Before uploading to Google Play:
- [ ] Built .aab file successfully
- [ ] Downloaded .aab file to computer
- [ ] Logged into Google Play Console
- [ ] Uploaded .aab to Internal Testing
- [ ] Added release notes
- [ ] Published to Internal Testing
- [ ] Shared opt-in URL with 5 testers
- [ ] Tested payment flow yourself
- [ ] Verified Pro features unlock
- [ ] Verified profile persists after app restart
- [ ] Waiting 2-3 days for tester feedback

After successful testing:
- [ ] No crashes reported
- [ ] No major bugs reported
- [ ] Promote to Production
- [ ] Start with 20% rollout
- [ ] Monitor for 1-2 days
- [ ] Increase to 50% rollout
- [ ] Monitor for 1-2 days
- [ ] Increase to 100% rollout

---

## Need Help?

If you encounter any issues during this process, note:
1. The exact error message
2. Which step you were on
3. Screenshot if possible

And reach out for assistance!

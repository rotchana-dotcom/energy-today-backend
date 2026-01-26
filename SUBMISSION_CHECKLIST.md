# Google Play Store Submission Checklist

Use this checklist to ensure you have everything ready before submitting Energy Today to Google Play Store.

---

## Phase 1: Prerequisites ✅

- [ ] Google Play Console account created ($25 one-time fee)
- [ ] Developer Distribution Agreement accepted
- [ ] Expo account created (free at https://expo.dev)
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Privacy policy created and hosted online

**Privacy Policy Resources:**
- https://www.privacypolicygenerator.info/
- https://www.freeprivacypolicy.com/
- https://app-privacy-policy-generator.firebaseapp.com/

---

## Phase 2: App Assets ✅

- [x] App icon ready (2048x2048 PNG) - `assets/images/icon.png`
- [x] Feature graphic created (1024x500 PNG) - `play-store-assets/feature-graphic.png`
- [ ] 2-8 screenshots captured (1080x1920 pixels)
  - See `SCREENSHOT_GUIDE.md` for instructions
  - Suggested: Onboarding, Today, Calendar, Journal, Profile, Settings
- [x] App description written - See `PLAY_STORE_LISTING.md`
- [x] Short description written (80 chars)
- [x] Release notes written

---

## Phase 3: Build Production AAB 🏗️

- [ ] Run build script: `./build-for-play-store.sh`
- [ ] Or manually: `eas build --platform android --profile production`
- [ ] Wait for build to complete (~10-15 minutes)
- [ ] Download AAB file from Expo dashboard
- [ ] Test AAB on physical Android device (optional but recommended)

**Build Commands:**
```bash
cd /home/ubuntu/energy_today
eas login
eas build --platform android --profile production
```

---

## Phase 4: Google Play Console Setup 📝

### Create App

- [ ] Login to https://play.google.com/console
- [ ] Click "Create app"
- [ ] App name: **Energy Today**
- [ ] Default language: **English (United States)**
- [ ] App or game: **App**
- [ ] Free or paid: **Free**
- [ ] Accept declarations

### Store Listing

- [ ] Upload app icon (512x512 PNG)
- [ ] Upload feature graphic (1024x500 PNG)
- [ ] Upload 2-8 phone screenshots
- [ ] Copy app name: **Energy Today**
- [ ] Copy short description (from `PLAY_STORE_LISTING.md`)
- [ ] Copy full description (from `PLAY_STORE_LISTING.md`)
- [ ] Set category: **Productivity**
- [ ] Add tags: productivity, planning, calendar, journal, wellness
- [ ] Add contact email
- [ ] Add privacy policy URL

### App Content

- [ ] **Privacy Policy** - Add your URL
- [ ] **Ads** - Select "No, my app does not contain ads"
- [ ] **Content Rating** - Complete questionnaire
  - Category: Productivity
  - Answer all questions (all "No" for Energy Today)
  - Expected rating: PEGI 3 / Everyone
- [ ] **Target Audience** - Select age groups (18-65+)
- [ ] **News App** - No
- [ ] **COVID-19 Contact Tracing** - No
- [ ] **Data Safety** - Complete form
  - Collects: Date of birth, journal entries (local only)
  - Shares: No
  - Encrypted: Yes
  - Deletion: Yes (user can clear data)

### Production Release

- [ ] Go to **Production** → **Create new release**
- [ ] Upload AAB file
- [ ] Release name: **1.0.0**
- [ ] Copy release notes (from `PLAY_STORE_LISTING.md`)
- [ ] Review all sections (must show green checkmarks)
- [ ] Click **Save** → **Review release**
- [ ] Click **Start rollout to Production**

---

## Phase 5: Submit for Review 🚀

- [ ] All Play Console sections show green checkmarks
- [ ] AAB uploaded successfully
- [ ] Store listing complete
- [ ] App content complete
- [ ] Click "Start rollout to Production"
- [ ] Confirm submission

**Expected Review Time:** 1-7 days (usually 2-3 days)

---

## Phase 6: Post-Submission 📊

- [ ] Check email for Google Play updates
- [ ] Monitor Play Console dashboard for review status
- [ ] Respond to any review feedback if app is rejected
- [ ] Once approved, verify app is live on Play Store
- [ ] Test download and installation
- [ ] Share Play Store link with users

**Play Store URL format:**
```
https://play.google.com/store/apps/details?id=space.manus.energy.today.t[timestamp]
```

---

## Common Issues & Solutions

### Build Fails
```bash
# Clear cache and retry
eas build:clear-cache --platform android
eas build --platform android --profile production
```

### Missing Privacy Policy
- Create one using free generators (links above)
- Host on GitHub Pages, your website, or privacy policy hosting service
- Must be publicly accessible URL

### Screenshots Wrong Size
- Required: 1080 x 1920 pixels (9:16 portrait)
- Use browser DevTools with mobile viewport
- Or capture from Android device/emulator
- See `SCREENSHOT_GUIDE.md` for detailed instructions

### App Rejected
- Read rejection email carefully
- Common reasons: missing privacy policy, permissions not explained, crashes
- Fix issues and resubmit

---

## Quick Reference

### Important Files
- `eas.json` - Build configuration
- `app.config.ts` - App metadata and version
- `GOOGLE_PLAY_SUBMISSION.md` - Detailed guide
- `PLAY_STORE_LISTING.md` - Store listing content
- `SCREENSHOT_GUIDE.md` - Screenshot instructions
- `build-for-play-store.sh` - Build script

### Key Commands
```bash
# Login to Expo
eas login

# Build production AAB
eas build --platform android --profile production

# Check build status
eas build:list

# Download AAB
eas build:download --platform android

# View credentials
eas credentials
```

### Support Links
- **Expo Docs:** https://docs.expo.dev/build/introduction/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Your Expo Dashboard:** https://expo.dev

---

## Final Checklist Before Submission

- [ ] Privacy policy URL is live and accessible
- [ ] All store assets uploaded (icon, feature graphic, screenshots)
- [ ] Store listing content complete and proofread
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] AAB file uploaded
- [ ] Release notes written
- [ ] All Play Console sections show green checkmarks
- [ ] Developer email is valid and monitored

---

## You're Ready! 🎉

Once all checkboxes are complete, click "Start rollout to Production" in Google Play Console.

Your app will be reviewed within 1-7 days. Good luck! 🚀

---

**Need Help?**

See `GOOGLE_PLAY_SUBMISSION.md` for detailed step-by-step instructions for each phase.

# Pre-Upload Checklist - Energy Today v1.0.4

**Date:** January 15, 2026  
**Target Upload Date:** January 16, 2026  
**Version:** 1.0.4

---

## ✅ Code & Testing

- [x] **All tests passed** - 30/30 tests (100%)
- [x] **Moon phase bug fixed** - Verified against NASA data
- [x] **Energy type bug fixed** - No undefined errors
- [x] **Performance validated** - 365 days in < 5 seconds
- [x] **Edge cases tested** - Pre-1970 dates, leap years, future dates
- [x] **Business logic verified** - Professional language, no mystical jargon

---

## ✅ App Configuration

- [x] **Version number** - 1.0.4 (app.config.ts line 31)
- [x] **App name** - "Energy Today"
- [x] **Package ID** - space.manus.energy_today.t20251227002435
- [x] **App icon** - Custom logo set (blue wave design)
- [x] **Privacy policy URL** - https://rotchana-dotcom.github.io/smart-gate-check/

---

## ✅ Build Preparation

- [x] **EAS CLI installed** - Run: `npm install -g eas-cli`
- [x] **Expo account ready** - Login with: `eas login`
- [x] **Build profile configured** - Production profile in eas.json
- [x] **Keystore configured** - EAS manages automatically

---

## 📋 Tomorrow's Tasks (Upload Day)

### Morning (Before 10 AM)

- [ ] **1. Start EAS Build** (15-20 minutes)
  ```bash
  cd /path/to/energy_today
  eas build --platform android --profile production
  ```

- [ ] **2. Download AAB File**
  - Click download link from EAS
  - Save as `energy_today_v1.0.4.aab`
  - Verify file size (30-50 MB)

### Mid-Morning (10 AM - 12 PM)

- [ ] **3. Upload to Google Play Console**
  - Go to https://play.google.com/console
  - Select Energy Today app
  - Navigate to Testing → Internal testing
  - Click "Create new release"
  - Upload `energy_today_v1.0.4.aab`

- [ ] **4. Add Release Notes**
  - Copy from `RELEASE_NOTES_v1.0.4.txt`
  - Paste in "Release notes" field
  - Use the short version (500 characters max)

- [ ] **5. Review and Publish**
  - Click "Save"
  - Click "Review release"
  - Click "Start rollout to Internal testing"

### Afternoon (After Upload)

- [ ] **6. Share with Testers**
  - Copy opt-in URL from Testers tab
  - Send to 5 internal testers via email
  - Include testing instructions from release notes

- [ ] **7. Monitor Initial Feedback**
  - Check for immediate crashes
  - Respond to tester questions
  - Note any early issues

---

## 📧 Tester Email Template

**Subject:** Energy Today v1.0.4 - Internal Testing

**Body:**

Hi [Tester Name],

I've just released Energy Today v1.0.4 for internal testing. This version includes important bug fixes for moon phase accuracy.

**How to Install:**
1. Click this link: [OPT-IN URL]
2. Accept the invitation
3. Install the app from Google Play

**What to Test:**
- Moon phase accuracy (check if it matches the real moon)
- Energy calculations (no "undefined" errors)
- General navigation and performance
- Any crashes or freezes

**Testing Period:** 2-3 days (until [DATE])

Please report any issues you find. Thank you for helping test!

Best regards,
[Your Name]

---

## 🔍 What to Monitor (Days 1-3)

### Day 1 (Upload Day)

- [ ] Testers receive invitation
- [ ] Testers can install successfully
- [ ] No immediate crashes on launch
- [ ] Basic functionality works

### Day 2 (First Full Day)

- [ ] Check Google Play Console for crashes
- [ ] Review any ANR (App Not Responding) reports
- [ ] Collect tester feedback
- [ ] Verify moon phase accuracy reports

### Day 3 (Final Review)

- [ ] Review all feedback
- [ ] Check crash-free rate (should be > 99%)
- [ ] Verify no critical bugs reported
- [ ] Make decision: Promote to Production or Fix Issues

---

## ✅ Promotion Checklist (After Testing)

**If No Critical Issues:**

- [ ] Go to Testing → Internal testing
- [ ] Click "Promote release"
- [ ] Select "Production"
- [ ] Review release notes
- [ ] Choose rollout percentage:
  - [ ] 20% (recommended - cautious)
  - [ ] 50% (moderate)
  - [ ] 100% (full rollout)
- [ ] Click "Start rollout to Production"

**If Issues Found:**

- [ ] Document all issues
- [ ] Fix bugs in code
- [ ] Increment version to 1.0.5
- [ ] Rebuild and retest
- [ ] Upload new version

---

## 📊 Success Criteria

### Technical Metrics

- **Crash-free rate:** > 99%
- **ANR rate:** < 0.1%
- **Install success rate:** > 95%
- **App size:** < 50 MB

### Functional Criteria

- **Moon phases:** Match NASA data
- **Energy calculations:** No undefined errors
- **Navigation:** Smooth and responsive
- **Performance:** Fast loading times

### User Feedback

- **Positive feedback:** > 80%
- **Critical bugs:** 0
- **Minor bugs:** < 3
- **Feature requests:** Noted for future versions

---

## 🚨 Rollback Plan

**If Critical Issues in Production:**

1. **Immediate Action:**
   - Stop rollout at current percentage
   - Halt new installs

2. **Communication:**
   - Notify affected users
   - Post update in release notes

3. **Fix:**
   - Develop hotfix (v1.0.5)
   - Test thoroughly
   - Upload and promote

4. **Resume:**
   - Gradual rollout of fixed version
   - Monitor closely

---

## 📞 Support Contacts

**Expo EAS Support:**
- Website: https://expo.dev/support
- Discord: https://chat.expo.dev

**Google Play Support:**
- Help Center: https://support.google.com/googleplay/android-developer
- Developer Console: https://play.google.com/console

---

## 📝 Notes

### Important Reminders

- **Version Code:** Auto-incremented by EAS (will be 4)
- **Build Time:** Allow 15-20 minutes for EAS build
- **Upload Time:** Allow 5-10 minutes for Google Play processing
- **Testing Period:** Minimum 2 days, recommended 3 days

### Files to Keep

- `energy_today_v1.0.4.aab` - The build file
- `RELEASE_NOTES_v1.0.4.txt` - Release notes
- `TEST_REPORT_v1.0.4.md` - Test results
- `GOOGLE_PLAY_UPLOAD_GUIDE.md` - Upload instructions

### Files to Archive

After successful production release:
- Move all v1.0.4 files to `releases/v1.0.4/` folder
- Keep for future reference
- Useful for rollback if needed

---

## ✅ Final Pre-Upload Check

**Before starting the build tomorrow:**

- [ ] Read through this entire checklist
- [ ] Have `GOOGLE_PLAY_UPLOAD_GUIDE.md` open
- [ ] Have `RELEASE_NOTES_v1.0.4.txt` ready to copy
- [ ] Have Google Play Console open in browser
- [ ] Have terminal ready in project directory
- [ ] Have tester email list ready
- [ ] Have 30-60 minutes of uninterrupted time

---

**You're ready to upload! Good luck! 🚀**

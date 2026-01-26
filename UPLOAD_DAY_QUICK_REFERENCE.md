# Upload Day Quick Reference Card

**Version:** 1.0.4  
**Date:** January 16, 2026

---

## 🚀 Quick Commands

### 1. Start Build (15-20 min)
```bash
cd /path/to/energy_today
eas build --platform android --profile production
```

### 2. Check Build Status
```bash
eas build:list
```

---

## 📋 Upload Steps (5 min)

1. **Download AAB** from EAS link
2. **Go to:** https://play.google.com/console
3. **Navigate:** Testing → Internal testing → Create new release
4. **Upload:** energy_today_v1.0.4.aab
5. **Add notes:** Copy from RELEASE_NOTES_v1.0.4.txt (short version)
6. **Publish:** Save → Review → Start rollout

---

## 📝 Release Notes (Copy-Paste)

```
Bug fixes and improvements:
- Fixed moon phase calculation accuracy (now matches NASA data)
- Improved energy type calculations
- Enhanced performance and reliability
- Updated lunar cycle calculations

This update ensures all moon phases display correctly and energy readings are more accurate.
```

---

## ✅ Pre-Flight Check

- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged in: `eas login`
- [ ] In project directory: `cd /path/to/energy_today`
- [ ] Version confirmed: 1.0.4 in app.config.ts
- [ ] 30-60 minutes available

---

## 📧 Tester Email (Quick Template)

**Subject:** Energy Today v1.0.4 - Internal Testing

Hi [Name],

New version ready for testing! 

**Install:** [OPT-IN URL]

**Test:** Moon phases, energy calculations, general navigation

**Report by:** [DATE in 2-3 days]

Thanks!

---

## 🔍 Monitor (Next 3 Days)

- **Day 1:** Installation success
- **Day 2:** Crash reports in Console
- **Day 3:** Decide: Promote or Fix

---

## 📞 Help

**EAS:** https://expo.dev/support  
**Google Play:** https://support.google.com/googleplay/android-developer

---

## 🎯 Success = No Critical Bugs + Crash Rate > 99%

**Good luck! 🚀**

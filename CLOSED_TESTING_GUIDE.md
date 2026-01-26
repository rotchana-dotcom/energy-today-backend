# Energy Today - Closed Testing Setup Guide

## Overview

Closed Testing allows you to test with up to 100,000 real users in specific countries before full production launch. This guide covers setup for:
- 🇳🇿 New Zealand
- 🇹🇭 Thailand  
- 🇦🇺 Australia
- 🇺🇸 USA

---

## Step 1: Create Closed Testing Track in Google Play Console

### Navigate to Closed Testing
1. Go to: [Google Play Console](https://play.google.com/console)
2. Select **Energy Today** app
3. Click **Release** → **Testing** → **Closed testing**
4. Click **Create new release**

### Upload Build
1. Upload the AAB file (version 1.0.31) - **Already done ✓**
2. Add release notes:

```
Version 1.0.31 - Production Ready

✨ New Features:
- Google Play billing integration with RevenueCat
- Monthly ($9.99) and Yearly ($79.99) subscriptions
- Pro features unlock system

🐛 Bug Fixes:
- Fixed notification deep linking
- Improved purchase flow
- Enhanced UI/UX

🧪 Testing Focus:
- Test subscription purchase flow
- Verify Pro features unlock correctly
- Report any bugs or issues

Thank you for helping us test Energy Today!
```

---

## Step 2: Set Up Country-Specific Testing

### Create Testing Lists

**Option A: Single List (All Countries)**
- Name: "Closed Beta Testers"
- Add testers from all 4 countries
- Simpler management

**Option B: Country-Specific Lists (Recommended)**
- List 1: "New Zealand Testers"
- List 2: "Thailand Testers"  
- List 3: "Australia Testers"
- List 4: "USA Testers"
- Better tracking per country

### Add Testers

**Method 1: Email List**
1. Click **Create email list**
2. Name the list (e.g., "NZ Beta Testers")
3. Add tester emails (comma-separated or one per line)
4. Click **Save**

**Method 2: Google Group**
1. Create a Google Group for each country
2. Add the group email to the testing list
3. Testers join the group to get access

---

## Step 3: Configure Country Availability

### Set Countries and Regions
1. In Closed Testing settings, click **Countries/regions**
2. Select:
   - ✅ New Zealand
   - ✅ Thailand
   - ✅ Australia
   - ✅ United States
3. Click **Save**

### Important Notes
- Testers must have Google accounts in these countries
- VPN users may have issues (Google detects account country, not IP)
- Testers need to opt-in via the testing link

---

## Step 4: Generate Testing Links

### Get Opt-In URL
1. After creating the release, Google generates a unique URL
2. Format: `https://play.google.com/apps/testing/space.manus.energy_today.t20251227002435`
3. Share this link with your testers

### Testing Link Distribution

**For New Zealand:**
```
🇳🇿 Energy Today - Closed Beta (New Zealand)

You're invited to test Energy Today before the official launch!

What is Energy Today?
A professional timing optimizer that helps you schedule important meetings and decisions at optimal times based on your personal energy patterns.

How to join:
1. Click this link: [Testing URL]
2. Tap "Become a tester"
3. Download from Google Play Store
4. Use promo code: NZ-BETA-2026 for 30 days free Pro access

We need your feedback on:
✓ Subscription purchase flow
✓ Pro features functionality
✓ Overall user experience
✓ Any bugs or issues

Testing period: 2-4 weeks
Feedback: [Your email or form link]

Thank you for helping us launch in New Zealand! 🚀
```

**For Thailand:**
```
🇹🇭 Energy Today - Closed Beta (ประเทศไทย)

คุณได้รับเชิญให้ทดสอบ Energy Today ก่อนเปิดตัวอย่างเป็นทางการ!

Energy Today คืออะไร?
แอปพลิเคชันที่ช่วยคุณวางแผนการประชุมและการตัดสินใจสำคัญในช่วงเวลาที่เหมาะสมที่สุด

วิธีเข้าร่วม:
1. คลิกลิงก์นี้: [Testing URL]
2. แตะ "Become a tester"
3. ดาวน์โหลดจาก Google Play Store
4. ใช้โค้ด: TH-BETA-2026 สำหรับ Pro ฟรี 30 วัน

เราต้องการความคิดเห็นของคุณเกี่ยวกับ:
✓ ระบบการซื้อแพ็คเกจ
✓ ฟีเจอร์ Pro
✓ ประสบการณ์การใช้งาน
✓ บั๊กหรือปัญหาต่างๆ

ระยะเวลาทดสอบ: 2-4 สัปดาห์
ติดต่อเรา: [Your email or form link]

ขอบคุณที่ช่วยเราเปิดตัวในประเทศไทย! 🚀
```

**For Australia:**
```
🇦🇺 Energy Today - Closed Beta (Australia)

G'day! You're invited to test Energy Today before launch.

What is Energy Today?
A professional timing optimizer for scheduling meetings and decisions at your peak performance times.

How to join:
1. Click: [Testing URL]
2. Tap "Become a tester"
3. Download from Google Play Store
4. Use code: AU-BETA-2026 for 30 days free Pro

What we need feedback on:
✓ Subscription purchase flow
✓ Pro features
✓ User experience
✓ Bugs or issues

Testing period: 2-4 weeks
Feedback: [Your email or form link]

Cheers for helping us launch in Australia! 🚀
```

**For USA:**
```
🇺🇸 Energy Today - Closed Beta (United States)

You're invited to beta test Energy Today!

What is Energy Today?
A professional timing optimizer that helps you schedule important meetings and decisions when you'll perform best.

How to join:
1. Click: [Testing URL]
2. Tap "Become a tester"
3. Download from Google Play Store
4. Use code: US-BETA-2026 for 30 days free Pro access

We need your feedback on:
✓ Subscription purchase flow ($9.99/month, $79.99/year)
✓ Pro features functionality
✓ Overall user experience
✓ Any bugs or issues

Testing period: 2-4 weeks
Feedback: [Your email or form link]

Thank you for helping us launch in the USA! 🚀
```

---

## Step 5: Promo Codes for Testers

### Current Admin Code (Keep Private)
- **Code:** `ENERGY2026PRO`
- **Access:** Your personal testing code only
- **Never share publicly**

### Recommended Tester Codes

**Option 1: Simple Hardcoded Codes (Quick)**
I can add these codes to the app in 5 minutes:
- `NZ-BETA-2026` - For New Zealand testers (30-day Pro)
- `TH-BETA-2026` - For Thailand testers (30-day Pro)
- `AU-BETA-2026` - For Australia testers (30-day Pro)
- `US-BETA-2026` - For USA testers (30-day Pro)

**Option 2: Database-Backed System (Better)**
Build a full promo code system with:
- Unlimited unique codes
- Expiration dates
- Usage tracking
- Admin dashboard to create/disable codes

**Recommendation:** Start with Option 1 for quick testing, then upgrade to Option 2 for production launch.

---

## Step 6: Feedback Collection

### Set Up Feedback Channels

**Method 1: Google Form**
Create a form with:
- Name (optional)
- Country
- Device model
- Android version
- What did you test? (Subscription, Pro features, etc.)
- Did the purchase flow work? (Yes/No/Issues)
- What bugs did you find?
- Overall experience (1-5 stars)
- Additional comments

**Method 2: Email**
- Create dedicated email: beta@kea.today
- Testers send feedback directly

**Method 3: In-App Feedback (Best)**
- I can add a "Beta Feedback" button in Settings
- Opens email or form directly from app
- Includes device info automatically

---

## Step 7: Testing Timeline

### Week 1-2: Initial Testing
- Focus on critical bugs
- Test subscription purchase flow
- Verify Pro features unlock
- Check performance across devices

### Week 3-4: Refinement
- Fix reported bugs
- Improve UX based on feedback
- Test new fixes with same testers

### Week 5: Final Review
- Ensure all critical issues resolved
- Prepare for production launch
- Thank testers and offer lifetime Pro discount

---

## Step 8: Promote to Production

### When Ready
1. Go to Google Play Console
2. **Release** → **Production**
3. **Create new release**
4. **Promote release** from Closed Testing
5. Select version 1.0.31 (or newer if you fixed bugs)
6. Add production release notes
7. **Review and roll out**

### Production Release Notes Template
```
🎉 Energy Today is now live!

Energy Today helps professionals schedule important meetings and decisions at optimal times based on your personal energy patterns.

✨ Key Features:
• Daily energy score and timing recommendations
• Calendar integration with optimal scheduling
• Track outcomes to prove the system works
• AI-powered insights from your patterns
• Pro features: Advanced analytics, unlimited history, team collaboration

💰 Subscription Plans:
• Monthly: $9.99/month
• Yearly: $79.99/year (Save 33%)
• 7-day free trial included

📱 Perfect for:
• Business professionals
• Entrepreneurs
• Team leaders
• Anyone making important decisions

Download now and optimize your timing! 🚀
```

---

## Step 9: Marketing Preparation

### App Store Optimization (ASO)

**Title (30 characters max):**
`Energy Today - Timing Optimizer`

**Short Description (80 characters max):**
`Schedule meetings & decisions at your peak performance times. Proven results.`

**Full Description (4000 characters max):**
See `MARKETING_STRATEGY.md` for complete copy

**Keywords:**
- productivity app
- meeting scheduler
- decision timing
- energy management
- business planner
- optimal timing
- performance optimizer
- professional organizer

### Screenshots Needed
1. **Today Screen** - Energy score and quick actions
2. **Calendar View** - Color-coded optimal days
3. **Analytics Dashboard** - Success patterns
4. **Task Scheduler** - AI-powered recommendations
5. **Insights** - Pattern analysis
6. **Pro Features** - Subscription benefits

---

## Step 10: Launch Checklist

### Before Production Launch

**Technical:**
- [ ] All critical bugs fixed
- [ ] Subscription flow tested and working
- [ ] Pro features unlock correctly
- [ ] Merchant account verified (bank deposit confirmed)
- [ ] Privacy policy live and accessible
- [ ] Terms of service ready

**Marketing:**
- [ ] App store listing complete (title, description, screenshots)
- [ ] Feature graphic uploaded
- [ ] Promo video created (optional but recommended)
- [ ] Social media accounts ready
- [ ] Landing page live (kea.today)
- [ ] Launch announcement prepared

**Legal:**
- [ ] Privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] Refund policy clear
- [ ] GDPR compliance (if targeting EU later)

**Support:**
- [ ] Support email set up (support@kea.today)
- [ ] FAQ page created
- [ ] Help documentation ready
- [ ] Response templates prepared

---

## Troubleshooting

### Testers Can't Find the App
- Ensure they clicked the opt-in link first
- Check if their Google account country matches target countries
- Verify the release is published in Closed Testing

### Subscription Purchase Fails
- Check RevenueCat dashboard for errors
- Verify merchant account is verified
- Ensure subscription products are active in Google Play Console

### Promo Codes Don't Work
- Verify code is spelled correctly (case-sensitive)
- Check if admin unlock code is still hardcoded
- Test with fresh app install

---

## Next Steps

1. **Add country-specific promo codes** (5 minutes)
2. **Create feedback form** (10 minutes)
3. **Prepare marketing materials** (30 minutes)
4. **Set up support channels** (15 minutes)

Would you like me to proceed with any of these?

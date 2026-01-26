# Energy Today - Feature Tiers

## Free Plan Features

### Core Energy Tracking
- ✅ Log energy levels (unlimited)
- ✅ View today's energy
- ✅ Basic energy chart (7 days)
- ✅ Energy insights (basic)

### Sleep & Habits
- ✅ Log sleep (unlimited)
- ✅ Track up to 5 habits
- ✅ Basic habit streaks
- ✅ Sleep quality tracking

### Basic Features
- ✅ Daily tips
- ✅ Basic journal entries
- ✅ Profile management
- ✅ Light/dark mode
- ✅ Basic notifications

### Limitations
- ❌ Only 7 days of history
- ❌ Maximum 5 habits
- ❌ No AI coaching
- ❌ No advanced analytics
- ❌ No export data
- ❌ No social features

---

## Pro Plan Features

### Everything in Free, Plus:

### Advanced Energy Tracking
- ✅ Unlimited history (all time)
- ✅ Energy forecasting (AI predictions)
- ✅ Pattern detection
- ✅ Correlation analysis
- ✅ Custom energy factors

### AI & Insights
- ✅ AI Coaching chatbot
- ✅ Personalized recommendations
- ✅ Smart scheduling
- ✅ Auto-journaling
- ✅ Predictive analytics
- ✅ AI Personal Assistant
- ✅ Adaptive coaching (learns from feedback)

### Advanced Analytics
- ✅ Detailed reports (weekly, monthly, yearly)
- ✅ Export data (CSV, PDF)
- ✅ Advanced charts & visualizations
- ✅ Trend analysis
- ✅ Goal tracking with predictions

### Unlimited Features
- ✅ Unlimited habits
- ✅ Unlimited journal entries
- ✅ Unlimited sleep logs
- ✅ Unlimited nutrition logs

### Wellness Features
- ✅ Meditation & Mindfulness (guided sessions)
- ✅ Stress Management (breathing exercises)
- ✅ Mood Tracking (detailed)
- ✅ Relationship Tracking
- ✅ Financial Wellness
- ✅ Career Energy tracking

### Social & Community
- ✅ Energy Circles (groups)
- ✅ Challenges & competitions
- ✅ Leaderboards
- ✅ Share progress
- ✅ User-generated content (create tips/recipes)

### Integrations
- ✅ Voice Assistant (Siri/Google)
- ✅ Email Integration (digests)
- ✅ Calendar sync
- ✅ Wearable devices (future)

### Premium Support
- ✅ Priority support
- ✅ Early access to new features
- ✅ Ad-free experience

---

## Family Plan Features

### Everything in Pro, Plus:

- ✅ Up to 6 family members
- ✅ Family dashboard
- ✅ Shared challenges
- ✅ Family insights
- ✅ Individual privacy controls

---

## Feature Implementation Status

### ✅ Properly Gated (Pro-only)
- AI Coaching chatbot
- Advanced analytics & reports
- Export functionality
- Social features (circles, challenges)
- Unlimited habits (>5)

### ⚠️ Needs Gating Review
- Meditation sessions (should be Pro?)
- Stress management tools (should be Pro?)
- Mood tracking (basic free, detailed Pro?)
- User-generated content (view free, create Pro?)
- Voice assistant (should be Pro?)
- Email integration (should be Pro?)

### 🔧 Recommended Changes

**Keep Free (Good for conversion):**
- 3 meditation sessions (5-min only)
- Basic mood tracking (5 moods, no emotions)
- View user-generated content
- Basic stress level logging

**Move to Pro:**
- All meditation sessions (10+ min)
- Detailed mood tracking (emotions, triggers)
- Create user-generated content
- Breathing exercises
- Voice assistant commands
- Email digests
- Relationship tracking
- Financial wellness
- Career energy
- Smart scheduling
- Auto-journaling
- AI Personal Assistant

---

## Pricing

### Monthly
- Free: $0
- Pro: $9.99/month
- Family: $19.99/month (up to 6 members)

### Annual (Save 20%)
- Free: $0
- Pro: $95.88/year ($7.99/month)
- Family: $191.88/year ($15.99/month)

### Trial
- 7-day free trial for Pro
- No credit card required
- Full Pro access during trial

---

## Implementation Checklist

- [ ] Add `isProUser()` checks to all Pro features
- [ ] Show upgrade prompts for locked features
- [ ] Add "Pro" badges to premium features
- [ ] Implement feature limits (5 habits for free)
- [ ] Add paywall screens
- [ ] Test free → Pro upgrade flow
- [ ] Test Pro → Free downgrade flow
- [ ] Add "Upgrade to Pro" CTAs throughout app

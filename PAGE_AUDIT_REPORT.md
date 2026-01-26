# Energy Today - Page Audit Report
**Date:** January 20, 2026  
**Total Pages:** 71 TSX files  
**Goal:** Identify which pages use real calculations vs placeholder/demo data

---

## 🎯 CRITICAL PRIORITY - Pages That MUST Be Fixed

### ❌ Using Demo/Hardcoded Data (BROKEN)

1. **AI Insights** (`app/ai-insights.tsx`)
   - Status: ❌ BROKEN
   - Issue: Uses `userId: "demo-user"` instead of real user
   - Fix: Connect to actual user profile
   - Impact: HIGH - Users see fake AI insights

2. **Group Challenges** (`app/group-challenges.tsx`)
   - Status: ❌ BROKEN  
   - Issue: `mockValue = Math.floor(Math.random() * 100)` for challenge progress
   - Fix: Use real user activity data
   - Impact: MEDIUM - Fake leaderboard data

---

## ✅ Pages Using Real Calculations (WORKING)

### Main Screens
1. **Home** (`app/(tabs)/index.tsx`)
   - Status: ✅ WORKING
   - Uses: TodayInsightsWidget, SuccessStatsWidget with real data
   - Calculation: Unified energy engine + results tracker

2. **Calendar** (`app/(tabs)/calendar.tsx`)
   - Status: ✅ WORKING
   - Uses: Unified energy engine for daily scores
   - Calculation: Real numerology, I-Ching, lunar phases, etc.
   - Shows: Success overlays, accuracy badges

3. **Log/Journal** (`app/(tabs)/log.tsx`)
   - Status: ✅ WORKING
   - Uses: OutcomeLogger for real outcome tracking
   - Calculation: Results tracker system

### Detail Screens
4. **Business** (`app/business.tsx`)
   - Status: ⚠️ PARTIAL
   - Uses: Real user profile check
   - Missing: Business-specific energy calculations
   - Fix: Add business timing recommendations

5. **Coaching** (`app/coaching.tsx`)
   - Status: ⚠️ PARTIAL
   - Uses: Real user profile check
   - Missing: Personalized coaching insights
   - Fix: Generate AI coaching based on user data

6. **Forecast** (`app/forecast.tsx`)
   - Status: ✅ WORKING
   - Uses: Unified energy engine for 30-day forecast
   - Calculation: Real predictions based on user profile

7. **Goals** (`app/goals.tsx`)
   - Status: ✅ WORKING
   - Uses: Real user profile, AsyncStorage for goals
   - Calculation: Goal tracking with energy alignment

8. **Habits** (`app/habits.tsx`)
   - Status: ✅ WORKING
   - Uses: Real user profile, AsyncStorage for habits
   - Calculation: Habit tracking with energy scores

9. **History** (`app/history.tsx`)
   - Status: ✅ WORKING
   - Uses: Results tracker for past outcomes
   - Calculation: Historical pattern analysis

10. **Insights** (`app/insights.tsx`)
    - Status: ✅ WORKING
    - Uses: Unified energy engine
    - Calculation: Today's insights, recommendations

11. **Numerology** (`app/numerology.tsx`)
    - Status: ✅ WORKING
    - Uses: Real user birth date
    - Calculation: Life Path, Personal Year, etc.

12. **Trends** (`app/trends.tsx`)
    - Status: ⚠️ PARTIAL
    - Uses: Real user profile check
    - Missing: Actual trend calculations
    - Fix: Analyze historical energy patterns

13. **Weekly Plan** (`app/weekly-plan.tsx`)
    - Status: ⚠️ PARTIAL
    - Uses: Real user profile
    - Missing: Weekly optimization algorithm
    - Fix: Calculate best days for each activity type

---

## 🔄 Pages That Need Connection (NOT YET IMPLEMENTED)

### Wellness & Health
14. **Sleep Tracker** (`app/sleep-tracker.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI for logging sleep
    - Missing: Integration with energy calculations
    - Fix: Correlate sleep quality with energy scores

15. **Meditation Timer** (`app/meditation-timer.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Timer functionality
    - Missing: Track meditation impact on energy
    - Fix: Log meditation sessions, show correlation

16. **Nutrition Tracker** (`app/nutrition-tracker.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI for logging meals
    - Missing: Nutrition impact on energy scores
    - Fix: Analyze food choices vs energy patterns

17. **Workout Tracking** (`app/workout-tracking.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI for logging workouts
    - Missing: Exercise impact on energy
    - Fix: Correlate workout timing with energy scores

18. **Biometric Sync** (`app/biometric-sync.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Manual entry UI
    - Missing: Integration with energy engine
    - Fix: Use heart rate, HRV for energy adjustments

19. **Biometric Insights** (`app/biometric-insights.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI for biometric display
    - Missing: Real biometric data
    - Fix: Connect to health APIs or manual logs

20. **Sleep Insights** (`app/sleep-insights.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI framework
    - Missing: Sleep analysis algorithm
    - Fix: Analyze sleep patterns, recommend optimal bedtimes

21. **Nutrition Insights** (`app/nutrition-insights.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: UI framework
    - Missing: Nutrition analysis
    - Fix: Recommend foods based on energy needs

### Social & Team
22. **Team Sync** (`app/team-sync.tsx`)
    - Status: ⚠️ PARTIAL
    - Has: Team member management UI
    - Missing: Multi-person energy optimization
    - Fix: Calculate best meeting times for team

23. **Team Members** (`app/team-members.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Member list UI
    - Missing: Member energy profiles
    - Fix: Show each member's energy patterns

24. **Social Energy** (`app/social-energy.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Social interaction logging UI
    - Missing: Social energy analysis
    - Fix: Track energy drain/gain from interactions

25. **Energy Circles** (`app/energy-circles.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Group creation UI
    - Missing: Group energy synchronization
    - Fix: Show collective energy patterns

26. **Social Comparison** (`app/social-comparison.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Comparison UI framework
    - Missing: Anonymous aggregate data
    - Fix: Show "Your energy vs similar users"

### Planning & Productivity
27. **Task Scheduler** (`app/task-scheduler.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Task creation UI
    - Missing: Energy-based scheduling
    - Fix: Auto-schedule tasks on optimal days

28. **Focus Mode** (`app/focus-mode.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Focus timer UI
    - Missing: Energy-aware focus recommendations
    - Fix: Suggest focus sessions on high-energy days

29. **Recurring** (`app/recurring.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Recurring activity UI
    - Missing: Pattern optimization
    - Fix: Recommend best recurring schedule

30. **Calendar Sync** (`app/calendar-sync.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Calendar connection UI
    - Missing: Actual calendar integration
    - Fix: Read calendar events, suggest rescheduling

31. **Calendar Integration** (`app/calendar-integration.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Integration settings UI
    - Missing: Two-way sync
    - Fix: Push energy scores to external calendars

### Reports & Analytics
32. **Reports** (`app/reports.tsx`)
    - Status: ⚠️ PARTIAL
    - Has: Report generation UI
    - Missing: Real data in reports
    - Fix: Generate PDF reports with actual user data

33. **Report History** (`app/report-history.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: History list UI
    - Missing: Stored reports
    - Fix: Save and retrieve generated reports

34. **Data Export** (`app/data-export.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Export UI
    - Missing: Export functionality
    - Fix: Export outcomes, patterns as CSV/JSON

35. **Energy Timeline** (`app/energy-timeline.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Timeline UI
    - Missing: Historical energy visualization
    - Fix: Show energy graph over time

### Settings & Configuration
36. **Settings** (`app/settings.tsx`)
    - Status: ✅ WORKING
    - Uses: Real user profile, subscription status
    - Calculation: Feature gates, preferences

37. **Appearance Settings** (`app/appearance-settings.tsx`)
    - Status: ✅ WORKING
    - Uses: Theme provider
    - Calculation: Light/dark mode toggle

38. **Notification Settings** (`app/notification-settings.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Settings UI
    - Missing: Actual notification scheduling
    - Fix: Schedule push notifications

39. **Smart Notifications Settings** (`app/smart-notifications-settings.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Settings UI
    - Missing: AI-powered notification logic
    - Fix: Send notifications on optimal days

40. **Adaptive Reminders** (`app/adaptive-reminders.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Reminder UI
    - Missing: Adaptive scheduling algorithm
    - Fix: Adjust reminder times based on energy

### Gamification & Engagement
41. **Badges** (`app/badges.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Badge display UI
    - Missing: Badge earning logic
    - Fix: Award badges for milestones

42. **Streak Recovery** (`app/streak-recovery.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Recovery UI
    - Missing: Streak tracking system
    - Fix: Track daily usage streaks

43. **Share Success** (`app/share-success.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Sharing UI
    - Missing: Social sharing integration
    - Fix: Generate shareable success images

### Additional Features
44. **Weather Insights** (`app/weather-insights.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Weather display UI
    - Missing: Weather API integration
    - Fix: Fetch real weather, correlate with energy

45. **Location Insights** (`app/location-insights.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Location tracking UI
    - Missing: Location-based energy analysis
    - Fix: Track energy by location

46. **Voice Journal Enhanced** (`app/voice-journal-enhanced.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Voice recording UI
    - Missing: Speech-to-text integration
    - Fix: Transcribe voice notes

47. **Coaching Chatbot** (`app/coaching-chatbot.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Chat UI
    - Missing: AI chatbot backend
    - Fix: Connect to LLM for coaching

48. **Habit Builder** (`app/habit-builder.tsx`)
    - Status: 🔄 NOT CONNECTED
    - Has: Habit creation UI
    - Missing: Habit tracking system
    - Fix: Track habit completion, show patterns

49. **Energy Forecast** (`app/energy-forecast.tsx`)
    - Status: ⚠️ DUPLICATE OF forecast.tsx
    - Action: Review and merge with main forecast

50. **Referral** (`app/referral.tsx`)
    - Status: ✅ WORKING
    - Uses: Real referral code generation
    - Calculation: Referral tracking

51. **Upgrade** (`app/upgrade.tsx`)
    - Status: ✅ WORKING
    - Uses: Real subscription management
    - Calculation: Pricing, promo codes

52. **Manage Subscription** (`app/manage-subscription.tsx`)
    - Status: ✅ WORKING
    - Uses: Real subscription status
    - Calculation: Billing, cancellation

53. **Guide** (`app/guide.tsx`)
    - Status: ✅ WORKING
    - Uses: Static help content (expected)
    - Calculation: N/A (documentation)

54. **Template Journal** (`app/template-journal.tsx`)
    - Status: ✅ WORKING
    - Uses: Real templates from AsyncStorage
    - Calculation: Template-based journaling

55. **Select Template** (`app/select-template.tsx`)
    - Status: ✅ WORKING
    - Uses: Real template list
    - Calculation: Template selection

---

## 📊 Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ Fully Working (Real Data) | 18 | 25% |
| ⚠️ Partially Working | 7 | 10% |
| 🔄 Not Connected Yet | 30 | 42% |
| ❌ Broken (Demo Data) | 2 | 3% |
| 📄 Other (Onboarding, OAuth, etc.) | 14 | 20% |
| **TOTAL** | **71** | **100%** |

---

## 🎯 Action Plan

### Phase 1: Fix Critical Issues (2-3 hours)
1. Fix AI Insights - replace "demo-user" with real user ID
2. Fix Group Challenges - use real activity data
3. Connect Business page - add business timing recommendations
4. Connect Coaching page - generate personalized coaching
5. Connect Trends page - analyze historical patterns
6. Connect Weekly Plan - calculate optimal weekly schedule

### Phase 2: Connect Core Features (4-6 hours)
7. Sleep Tracker → Energy correlation
8. Meditation Timer → Energy impact tracking
9. Nutrition Tracker → Food energy analysis
10. Workout Tracking → Exercise timing optimization
11. Task Scheduler → Energy-based auto-scheduling
12. Reports → Real data in PDF reports

### Phase 3: Connect Secondary Features (6-8 hours)
13. Team Sync → Multi-person optimization
14. Social Energy → Interaction analysis
15. Weather Insights → Weather API + correlation
16. Biometric Sync → Health data integration
17. Voice Journal → Speech-to-text
18. Coaching Chatbot → AI backend

### Phase 4: Polish & Gamification (3-4 hours)
19. Badges → Earning logic
20. Streak Recovery → Streak tracking
21. Share Success → Social sharing
22. Notifications → Smart scheduling
23. Data Export → CSV/JSON export

---

## 🚨 BOTTOM LINE

**Current State:**
- Only **25% of pages** show real, personalized data
- **42% of pages** have UI but no backend connection
- **3% of pages** are actively broken with demo data

**User Experience:**
- Users will think the app is "fake" or "broken"
- No trust = No retention = No revenue

**What Needs to Happen:**
1. Fix the 2 broken pages (AI Insights, Group Challenges)
2. Connect the 7 partial pages to real calculations
3. Connect the 30 unconnected pages (prioritize based on user flow)

**Estimated Time:**
- Critical fixes: 2-3 hours
- Core connections: 4-6 hours
- Full completion: 15-20 hours

**Priority Order:**
1. Main screens (Home, Calendar, Journal) - ✅ DONE
2. Core features (Forecast, Insights, Numerology) - ✅ DONE
3. Business features (Business, Coaching, Trends, Weekly) - ⚠️ PARTIAL
4. Tracking features (Sleep, Nutrition, Workout) - 🔄 TODO
5. Social features (Team, Energy Circles) - 🔄 TODO
6. Advanced features (AI Chat, Voice Journal) - 🔄 TODO

---

**Recommendation:** Start with Phase 1 (fix critical issues) immediately. This will make the app feel "real" to users. Then progressively connect features based on user feedback and usage patterns.

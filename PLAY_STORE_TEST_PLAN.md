# Play Store Deployment - Deep Test Plan

**Date:** January 23, 2026  
**Version:** 88638321  
**Purpose:** Comprehensive testing before Play Store deployment

---

## Test Categories

### 1. Bug Fixes Verification (Phase 69 & 70)

#### 1.1 Navigation Routes
- [ ] Tap "Results Tracking" in More tab → Should redirect to Analytics Dashboard
- [ ] Tap "Business Timing" in More tab → Should redirect to Business tab
- [ ] Tap "Pattern Analysis" in More tab → Should redirect to AI Insights Dashboard
- [ ] No "Unmatched Route" errors should appear

#### 1.2 Notification Deep Links
- [ ] Tap daily energy notification → Should navigate to Today tab
- [ ] Tap badge unlocked notification → Should navigate to Badges screen
- [ ] Tap smart timing notification → Should navigate to Today tab
- [ ] No "Unmatched Route manus20251227002435:///" errors

#### 1.3 AI Insights Forecast Dates
- [ ] Open AI Insights tab → Tap "Forecast"
- [ ] Verify dates show January 23-29, 2026 (real future dates)
- [ ] No June/July placeholder dates should appear

#### 1.4 Weather Insights Spinner
- [ ] Open More tab → Tap "Weather Insights"
- [ ] Should load properly OR show "No Weather Data Yet" message
- [ ] No infinite "Analyzing weather patterns..." spinner

#### 1.5 Interactive Watch Out & Key Opportunity
- [ ] Open Today tab → Scroll to "Key Opportunity" card
- [ ] Tap card → Modal should slide up with full details
- [ ] Verify "Why This Matters" and "Action Steps" sections appear
- [ ] Tap X button → Modal should close
- [ ] Repeat for "Watch Out" card

#### 1.6 Analytics Dashboard Pro Paywall
- [ ] Open Analytics Dashboard
- [ ] Verify 7D button is unlocked (free users)
- [ ] Verify 30D, 90D, All Time buttons show 🔒 lock badge
- [ ] Tap locked button → Should redirect to Upgrade screen
- [ ] Tap 7D button → Should work normally

---

### 2. Critical User Flows

#### 2.1 Onboarding Flow
- [ ] Fresh install → Complete profile setup
- [ ] Enter name, birthdate, birthplace
- [ ] Complete all onboarding steps
- [ ] Land on Today screen with energy reading

#### 2.2 Today Screen (Core Feature)
- [ ] Today screen loads with current date
- [ ] Energy score displays (0-100)
- [ ] Business insights show specific time windows
- [ ] Weather widget displays current weather
- [ ] Key Opportunity and Watch Out cards appear
- [ ] All interactive elements respond to taps

#### 2.3 AI Insights (Pro Feature)
- [ ] Open AI Insights tab
- [ ] Verify 3 tabs: Forecast, Coaching, Patterns
- [ ] Forecast: Shows 7 days of predictions with real dates
- [ ] Coaching: Shows personalized advice
- [ ] Patterns: Shows pattern analysis

#### 2.4 Business Tab
- [ ] Open Business tab
- [ ] Verify business timing recommendations
- [ ] Verify meeting timing suggestions
- [ ] Verify decision-making guidance
- [ ] All navigation buttons work

#### 2.5 Track Tab
- [ ] Open Track tab
- [ ] Verify quick entry buttons work
- [ ] Test logging an energy entry
- [ ] Verify entry saves successfully

#### 2.6 More Tab
- [ ] Open More tab
- [ ] Verify all menu items are visible
- [ ] Tap 5 random menu items → All should navigate correctly
- [ ] No crashes or errors

---

### 3. Pro Subscription Features

#### 3.1 Free User Experience
- [ ] Verify AI Insights shows upgrade prompt
- [ ] Verify Analytics 30D/90D/All Time are locked
- [ ] Verify Today screen shows basic insights (not AI)
- [ ] Upgrade button appears in appropriate places

#### 3.2 Pro User Experience
- [ ] Activate Pro subscription (test mode)
- [ ] Verify AI Insights fully accessible
- [ ] Verify Analytics all time ranges unlocked
- [ ] Verify Today screen shows AI-powered insights
- [ ] Verify specific time windows (e.g., "2:30-3:45 PM")

---

### 4. Performance & Stability

#### 4.1 App Launch
- [ ] Cold start: App launches within 3 seconds
- [ ] Warm start: App resumes within 1 second
- [ ] No white screen or crash on launch

#### 4.2 Navigation Performance
- [ ] Tab switching is smooth (no lag)
- [ ] Screen transitions are smooth
- [ ] No memory leaks after 10+ screen changes

#### 4.3 Data Loading
- [ ] Today screen loads within 2 seconds
- [ ] AI Insights loads within 3 seconds
- [ ] Analytics Dashboard loads within 2 seconds
- [ ] Weather data loads within 2 seconds

---

### 5. Edge Cases & Error Handling

#### 5.1 No Internet Connection
- [ ] Turn off WiFi/mobile data
- [ ] App should show cached data
- [ ] No crashes when offline
- [ ] Graceful error messages

#### 5.2 Invalid Data
- [ ] Enter invalid birthdate (future date)
- [ ] Should show validation error
- [ ] Enter invalid location
- [ ] Should show helpful error message

#### 5.3 Empty States
- [ ] New user with no entries → Should show empty state messages
- [ ] No weather data → Should show "No Weather Data Yet"
- [ ] No analytics data → Should show appropriate message

---

### 6. UI/UX Quality

#### 6.1 Visual Consistency
- [ ] All colors match theme (primary, background, foreground)
- [ ] All icons are visible and properly sized
- [ ] All text is readable (no clipping, proper line height)
- [ ] Dark mode works correctly (if enabled)

#### 6.2 Touch Targets
- [ ] All buttons are easily tappable (minimum 44x44 dp)
- [ ] Haptic feedback works on button taps
- [ ] Active states show visual feedback (opacity change)

#### 6.3 Accessibility
- [ ] Text is readable at default system font size
- [ ] Sufficient color contrast for text
- [ ] No critical information conveyed by color alone

---

### 7. Backend Integration

#### 7.1 AI API Calls
- [ ] AI Insights generates successfully
- [ ] Weather API returns data
- [ ] Geocoding works for location search
- [ ] No API timeout errors

#### 7.2 Data Persistence
- [ ] Profile data persists after app restart
- [ ] Energy entries persist after app restart
- [ ] Settings persist after app restart
- [ ] Subscription status persists

---

## Test Execution

**Tester:** AI Agent  
**Environment:** Development build (version 88638321)  
**Device:** Expo Go on iOS/Android  

**Test Status:** 🟡 In Progress

---

## Critical Blockers (Must Fix Before Release)

- [ ] None identified yet

## Non-Critical Issues (Can Fix Post-Release)

- [ ] None identified yet

---

## Sign-Off

- [ ] All critical tests passed
- [ ] No critical blockers
- [ ] Ready for Play Store deployment

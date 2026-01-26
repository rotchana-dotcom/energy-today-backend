# Onboarding Loop Bug - Root Cause Analysis

## The Problem
After user completes onboarding (enters name, birthday, location), the app loops back to the onboarding screen within ~1 second instead of showing the Today screen.

## Failed Approaches (Phases 38-53)
1. **Delays (100ms → 500ms → 1000ms → 3000ms)** - Failed because AsyncStorage timing is unpredictable on physical devices
2. **Verification steps** - Failed because verification itself uses AsyncStorage
3. **Navigation guards** - Failed because component state resets on unmount
4. **Global flags** - Failed because global objects don't persist across navigation
5. **AsyncStorage flags** - Failed because reading the flag has the same timing issue
6. **ProfileContext** - Failed because context initialization is also async
7. **Navigation params** - Failed because navigation itself is async

## Root Cause
The issue is a **race condition in React Native navigation**:

```
User completes onboarding
  ↓
saveUserProfile() called (async write to AsyncStorage)
  ↓
router.replace("/(tabs)") called immediately
  ↓
Today screen mounts
  ↓
Today screen calls getUserProfile() (async read from AsyncStorage)
  ↓
AsyncStorage hasn't finished writing yet → returns null
  ↓
Today screen redirects to /onboarding/welcome
  ↓
INFINITE LOOP!
```

## Why All Fixes Failed

### AsyncStorage Timing
- AsyncStorage writes are NOT guaranteed to complete before navigation
- Even with delays, physical devices can be slower than expected
- No way to reliably "wait" for AsyncStorage to finish

### Navigation Timing
- React Native navigation is asynchronous
- The new screen mounts before receiving navigation params
- The new screen's useEffect runs immediately on mount
- No way to "block" navigation until data is ready

### Context Timing
- Context providers also need to load data asynchronously
- Context initialization happens after component mount
- Same race condition as AsyncStorage

## The Real Solution

We need to **prevent the Today screen from redirecting while it's still loading data**. The key insight:

**The Today screen should NEVER redirect to onboarding - only app/index.tsx should make that decision.**

### New Architecture

1. **app/index.tsx** (Entry Point)
   - Only place that checks if onboarding is needed
   - Waits for AsyncStorage to load before routing
   - Routes to onboarding OR main app (never both)

2. **Onboarding Flow**
   - Saves profile to AsyncStorage
   - Navigates to app/index.tsx (NOT directly to tabs)
   - Let app/index.tsx re-check and route correctly

3. **Today Screen**
   - Assumes profile exists (because app/index.tsx already checked)
   - Shows loading state while fetching data
   - NEVER redirects to onboarding
   - If profile is missing, shows error (not redirect)

### Key Changes

1. Remove all redirect logic from Today screen
2. Make app/index.tsx the single source of truth for routing
3. After onboarding, navigate back to app/index.tsx to re-check
4. Add proper loading states everywhere
5. Use ProfileContext for in-memory caching (but don't rely on it for initial load)

## Implementation Plan

1. Rewrite app/index.tsx with robust loading and error handling
2. Update onboarding to navigate to "/" instead of "/(tabs)"
3. Rewrite Today screen to remove all redirect logic
4. Add proper loading states and error messages
5. Test all scenarios thoroughly

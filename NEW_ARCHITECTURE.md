# New Onboarding Architecture - Design Document

## Core Principle
**Single Source of Truth**: Only `app/index.tsx` decides whether to show onboarding or main app. No other screen should redirect to onboarding.

## Component Responsibilities

### 1. app/index.tsx (Router/Entry Point)
**Responsibility**: Determine initial route based on profile existence

**Logic**:
```
1. Show loading spinner
2. Load profile from AsyncStorage (with timeout)
3. If profile exists → Navigate to /(tabs)
4. If no profile → Navigate to /onboarding/welcome
5. Never render anything except loading spinner
```

**Key Features**:
- Waits for AsyncStorage with 5-second timeout
- Only navigates once (uses `hasNavigated` flag)
- Handles errors gracefully
- Logs everything for debugging

### 2. app/onboarding/profile.tsx (Onboarding Form)
**Responsibility**: Collect user data and save it

**Logic**:
```
1. User fills form
2. Validate inputs
3. Save to AsyncStorage
4. Save to ProfileContext (in-memory cache)
5. Wait 500ms for AsyncStorage to persist
6. Navigate to "/" (back to entry point)
7. Let app/index.tsx re-check and route to /(tabs)
```

**Key Features**:
- Saves to both AsyncStorage AND ProfileContext
- Waits 500ms before navigation (safety buffer)
- Navigates to "/" not "/(tabs)" (let entry point decide)
- Shows loading state during save
- Handles errors with user-friendly messages

### 3. app/(tabs)/index.tsx (Today Screen)
**Responsibility**: Display energy readings (assumes profile exists)

**Logic**:
```
1. Try to load profile from ProfileContext (instant)
2. If no profile in context, load from AsyncStorage
3. If still no profile, show error message (NOT redirect)
4. Load subscription status
5. Calculate energy readings
6. Load AI insights if Pro
7. Display everything
```

**Key Features**:
- NEVER redirects to onboarding
- Uses ProfileContext for instant access
- Falls back to AsyncStorage if context is empty
- Shows error message if profile truly missing
- Proper loading states for each data fetch
- Handles errors gracefully

### 4. lib/profile-context.tsx (In-Memory Cache)
**Responsibility**: Cache profile in memory for fast access

**Logic**:
```
1. On mount, load profile from AsyncStorage
2. Store in React state (in-memory)
3. Provide saveProfile() that saves to BOTH:
   - AsyncStorage (persistence)
   - React state (instant access)
4. Provide profile and isLoading to consumers
```

**Key Features**:
- Loads once on app start
- Caches in memory for instant access
- saveProfile() updates both storage and memory
- isLoading flag prevents premature access

## Flow Diagrams

### First-Time User Flow
```
App Launch
  ↓
app/index.tsx mounts
  ↓
Load profile from AsyncStorage
  ↓
Profile = null
  ↓
Navigate to /onboarding/welcome
  ↓
User clicks "Get Started"
  ↓
Navigate to /onboarding/profile
  ↓
User fills form and clicks "Calculate My Energy"
  ↓
Save profile to AsyncStorage + ProfileContext
  ↓
Wait 500ms
  ↓
Navigate to "/" (back to entry point)
  ↓
app/index.tsx re-checks
  ↓
Load profile from AsyncStorage
  ↓
Profile exists!
  ↓
Navigate to /(tabs)
  ↓
Today screen loads
  ↓
Load profile from ProfileContext (instant!)
  ↓
Show Today screen ✅
```

### Returning User Flow
```
App Launch
  ↓
app/index.tsx mounts
  ↓
Load profile from AsyncStorage
  ↓
Profile exists!
  ↓
Navigate to /(tabs)
  ↓
Today screen loads
  ↓
Load profile from ProfileContext (loads from AsyncStorage on first mount)
  ↓
Show Today screen ✅
```

### Error Handling
```
If AsyncStorage fails:
  ↓
app/index.tsx shows error message
  ↓
User can retry or continue to onboarding

If profile load fails in Today screen:
  ↓
Show error message with "Go to Settings" button
  ↓
User can re-enter profile in settings
  ↓
NO INFINITE LOOP!
```

## Key Differences from Previous Approaches

| Previous | New |
|----------|-----|
| Today screen redirects to onboarding | Today screen NEVER redirects |
| Multiple screens check for profile | Only app/index.tsx checks |
| Navigate directly to /(tabs) after onboarding | Navigate to "/" and let entry point decide |
| Rely on timing/delays | Use proper loading states |
| Fight AsyncStorage timing | Accept it and design around it |

## Implementation Checklist

- [ ] Rewrite app/index.tsx with robust loading and single navigation
- [ ] Update onboarding to navigate to "/" instead of "/(tabs)"
- [ ] Rewrite Today screen to remove ALL redirect logic
- [ ] Add error messages instead of redirects
- [ ] Test first-time user flow
- [ ] Test returning user flow
- [ ] Test error scenarios
- [ ] Create checkpoint

## Success Criteria

1. ✅ First-time user completes onboarding and sees Today screen
2. ✅ Returning user goes directly to Today screen
3. ✅ No infinite loops under any circumstances
4. ✅ Clear error messages if something goes wrong
5. ✅ Works reliably on physical Android devices
6. ✅ Free and Pro tier logic works correctly

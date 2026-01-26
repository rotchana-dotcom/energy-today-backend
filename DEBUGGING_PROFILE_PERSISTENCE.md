# Debugging Profile Persistence Issue

**Issue:** App asks for birthday again after closing and reopening

**Changes Made:** Added logging to track profile save/load operations

---

## How to Debug

### 1. Check Console Logs

When you run the app, watch for these console messages:

**On App Startup:**
```
[App] Checking onboarding status...
[Storage] Profile loaded successfully: [Your Name]
[App] Profile found, navigating to main app
```

**OR if profile is missing:**
```
[App] Checking onboarding status...
[Storage] No profile found in storage
[App] No profile found, navigating to onboarding
```

**When Saving Profile (after onboarding):**
```
[Storage] Profile saved successfully: [Your Name]
```

### 2. Test Scenarios

**Scenario A: Fresh Install**
1. Install app
2. Complete onboarding
3. Check console for: `[Storage] Profile saved successfully`
4. Close app completely
5. Reopen app
6. Check console for: `[Storage] Profile loaded successfully`

**Expected Result:** App should go directly to Today screen

**Scenario B: After App Update**
1. Update app to v1.0.5
2. Open app
3. Check console logs

**Expected Result:** Existing profile should load

---

## Possible Causes

### 1. Expo Go Issue (Most Likely)

**Problem:** Expo Go sometimes clears AsyncStorage between sessions

**Solution:** Build a standalone app (.apk or .aab)

**Test:**
```bash
# Build development APK
eas build --platform android --profile development

# Or build production AAB
eas build --platform android --profile production
```

### 2. App Data Cleared

**Problem:** Android system or user cleared app data

**Check:** Settings → Apps → Energy Today → Storage → Clear Data

**Solution:** This is expected behavior - user intentionally cleared data

### 3. Storage Permission Issue

**Problem:** App doesn't have permission to write to storage

**Check Console for:**
```
[Storage] Error saving profile: [permission error]
```

**Solution:** Already handled with try/catch blocks

---

## What I've Fixed

### 1. Added Error Handling

**Before:**
```typescript
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}
```

**After:**
```typescript
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const jsonString = JSON.stringify(profile);
    await AsyncStorage.setItem(KEYS.USER_PROFILE, jsonString);
    console.log('[Storage] Profile saved successfully:', profile.name);
    
    // Verify save by reading back immediately
    const verification = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (!verification) {
      console.error('[Storage] WARNING: Profile save verification failed!');
      throw new Error('Profile save verification failed');
    }
  } catch (error) {
    console.error('[Storage] Error saving profile:', error);
    throw error;
  }
}
```

### 2. Added Verification

After saving, the app now immediately reads back the profile to verify it was saved correctly.

### 3. Added Logging

All storage operations now log to console for debugging.

---

## Next Steps

### For Testing on Expo Go

If you're using Expo Go, this is a known limitation. The fix is to build a standalone app:

```bash
# Development build (for testing)
eas build --platform android --profile development

# Production build (for Google Play)
eas build --platform android --profile production
```

### For Testing on Standalone App

If you're already using a standalone app (.apk or .aab), check the console logs to see what's happening:

1. Connect your phone via USB
2. Enable USB debugging
3. Run: `adb logcat | grep -E "\[App\]|\[Storage\]"`
4. Open the app and watch the logs

---

## Expected Console Output (Normal Flow)

### First Time (Onboarding)
```
[App] Checking onboarding status...
[Storage] No profile found in storage
[App] No profile found, navigating to onboarding
[User completes onboarding]
[Storage] Profile saved successfully: John Doe
```

### Second Time (Returning User)
```
[App] Checking onboarding status...
[Storage] Profile loaded successfully: John Doe
[App] Profile found, navigating to main app
```

---

## If Problem Persists

If you still see the onboarding screen after closing and reopening:

1. **Check logs** - Look for error messages
2. **Try standalone build** - Expo Go has limitations
3. **Check Android version** - Some old Android versions have AsyncStorage issues
4. **Check app permissions** - Ensure storage permission is granted

---

## Version

This debugging guide is for **v1.0.5** with enhanced logging.

---

**Let me know what you see in the console logs!**

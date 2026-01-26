# Payment Configuration Fix - Version 1.0.11

## Problem

Versions 1.0.9 and 1.0.10 had payment configuration errors:
- "Stripe publishable key not configured"
- "PayPal client ID not configured"

The payment keys were stored in Manus secrets but were not accessible in the production mobile app build.

## Root Cause

**Expo/React Native environment variable rules:**
1. Only variables prefixed with `EXPO_PUBLIC_` are exposed to client-side code via `process.env`
2. Our variables were named `ENERGY_TODAY_STRIPE_PUBLISHABLE_KEY` and `ENERGY_TODAY_PAYPAL_CLIENT_ID`
3. These variables exist in the build environment but are NOT accessible in the bundled app code

## Solution

Use **expo-constants** to properly expose environment variables:

### 1. Add keys to `app.config.ts` under `extra` section:

```typescript
extra: {
  eas: {
    projectId: "467fef76-47b6-4f96-b8d1-b0addedbd6a0",
  },
  // Payment configuration - loaded from environment variables at build time
  stripePublishableKey: process.env.ENERGY_TODAY_STRIPE_PUBLISHABLE_KEY || "",
  paypalClientId: process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID || "",
},
```

**How this works:**
- `app.config.ts` runs at BUILD TIME in Node.js environment
- It CAN access `process.env.ENERGY_TODAY_*` from Manus secrets
- Values are bundled into the app under `extra` section
- Client code can access them via `Constants.expoConfig.extra`

### 2. Update payment code to use `Constants.expoConfig.extra`:

**Before (v1.0.9, v1.0.10):**
```typescript
const publishableKey = process.env.ENERGY_TODAY_STRIPE_PUBLISHABLE_KEY;
```

**After (v1.0.11):**
```typescript
import Constants from "expo-constants";

const publishableKey = Constants.expoConfig?.extra?.stripePublishableKey;
```

## Why This Works

1. **Build time**: EAS Build loads environment variables from Manus secrets
2. **Config time**: `app.config.ts` reads them via `process.env` and adds to `extra`
3. **Runtime**: Mobile app accesses them via `Constants.expoConfig.extra`

This is the standard Expo method for exposing environment variables to client code without using the `EXPO_PUBLIC_` prefix.

## Files Changed

- `app.config.ts`: Added `stripePublishableKey` and `paypalClientId` to `extra` section
- `lib/stripe-payment.ts`: Changed to use `Constants.expoConfig.extra.stripePublishableKey`
- `lib/paypal-payment.ts`: Changed to use `Constants.expoConfig.extra.paypalClientId`

## Testing

After building version 1.0.11:
1. Install on device
2. Navigate to subscription screen
3. Try to purchase Pro subscription
4. Verify NO "not configured" errors appear
5. Verify payment buttons work correctly

## References

- [Expo Constants Documentation](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

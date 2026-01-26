# Google Play In-App Purchases Setup Guide

This document explains how to complete the Google Play billing setup for Energy Today.

## Overview

Google Play billing is now integrated into the app. Android users will see a "Google Play" payment button on the Upgrade screen, while iOS/web users will see Stripe and PayPal options.

---

## Step 1: Create Subscription Products in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app: **Energy Today**
3. Navigate to: **Monetize → Products → Subscriptions**
4. Click **Create subscription**

### Monthly Subscription

- **Product ID**: `energy_today_pro_monthly`
- **Name**: Energy Today Pro - Monthly
- **Description**: Full access to all Pro features with monthly billing
- **Price**: $9.99 USD/month
- **Billing period**: 1 month
- **Free trial**: 7 days (optional, we already have app-level trial)
- **Grace period**: 3 days (recommended)

### Annual Subscription

- **Product ID**: `energy_today_pro_yearly`
- **Name**: Energy Today Pro - Annual
- **Description**: Full access to all Pro features with annual billing (save 33%)
- **Price**: $79.99 USD/year
- **Billing period**: 1 year
- **Free trial**: 7 days (optional)
- **Grace period**: 3 days (recommended)

**Important**: The Product IDs MUST match exactly as shown above, or update `lib/google-play-billing.ts` with your chosen IDs.

---

## Step 2: Create Service Account for API Access

Google Play requires a service account to verify purchases server-side.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Navigate to: **IAM & Admin → Service Accounts**
4. Click **Create Service Account**
   - Name: `energy-today-billing`
   - Description: `Service account for Google Play billing verification`
5. Click **Create and Continue**
6. Grant role: **Service Account User**
7. Click **Done**

### Generate Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key → Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will download

### Link Service Account to Google Play

1. Go back to [Google Play Console](https://play.google.com/console)
2. Navigate to: **Settings → API access**
3. Click **Link** next to your service account
4. Grant permissions:
   - ✅ View financial data
   - ✅ Manage orders and subscriptions
5. Click **Invite user**

---

## Step 3: Configure Environment Variables

Add the service account JSON to your environment variables.

### For Development (Local)

Add to `.env` file:

```env
ENERGY_TODAY_GOOGLE_PLAY_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
ENERGY_TODAY_GOOGLE_PLAY_PACKAGE_NAME=space.manus.energy.today
```

**Important**: The entire JSON must be on one line, wrapped in single quotes.

### For Production (Deployment)

Add the same environment variables to your production environment (Vercel, Railway, etc.).

---

## Step 4: Test Purchase Flow

### Internal Testing Track

1. Go to Google Play Console → **Testing → Internal testing**
2. Create a new release with the latest AAB
3. Add test users (email addresses)
4. Share the internal testing link with testers

### Test Purchases

1. Install app from internal testing link
2. Go to **Settings → Upgrade to Pro**
3. Select a plan (Monthly or Annual)
4. Tap **Google Play** button
5. Complete purchase flow (test accounts are NOT charged)
6. Verify Pro features unlock

### Test Restore Purchases

1. Uninstall and reinstall the app
2. Go to **Settings → Upgrade to Pro**
3. Tap **Restore Purchases**
4. Verify Pro features unlock

---

## Step 5: Handle Subscription Lifecycle

The server automatically handles:

- ✅ Purchase verification
- ✅ Subscription activation
- ✅ Subscription renewal
- ✅ Subscription cancellation
- ✅ Subscription expiration
- ✅ Refunds

### Webhook Setup (Optional but Recommended)

Set up Real-time Developer Notifications (RTDN) to receive instant updates:

1. Go to Google Play Console → **Monetize → Monetization setup**
2. Scroll to **Real-time developer notifications**
3. Enter your webhook URL: `https://your-api.com/api/webhooks/google-play`
4. Click **Send test notification** to verify

---

## Troubleshooting

### "Product not found" error

- Verify Product IDs match exactly in Google Play Console
- Ensure subscriptions are **Active** (not Draft)
- Wait 24 hours after creating products for them to propagate

### "Service account not configured" error

- Verify `ENERGY_TODAY_GOOGLE_PLAY_SERVICE_ACCOUNT` env var is set
- Ensure JSON is valid and on one line
- Check service account has correct permissions in Google Play Console

### "Purchase verification failed" error

- Check server logs for detailed error message
- Verify service account is linked to Google Play Console
- Ensure API access is enabled in Google Play Console

### Test purchases not working

- Verify tester email is added to internal testing track
- Ensure tester is signed in with correct Google account
- Check app is installed from internal testing link (not sideloaded)

---

## Production Checklist

Before launching to production:

- [ ] Subscription products created in Google Play Console
- [ ] Product IDs match code (`energy_today_pro_monthly`, `energy_today_pro_yearly`)
- [ ] Service account created and linked to Google Play
- [ ] Environment variables configured
- [ ] Purchase flow tested with internal testing track
- [ ] Restore purchases tested
- [ ] Server-side verification working
- [ ] Subscription lifecycle handling verified
- [ ] Webhook (RTDN) configured (optional but recommended)

---

## Support

For issues or questions:
- Google Play billing docs: https://developer.android.com/google/play/billing
- Expo in-app purchases docs: https://docs.expo.dev/versions/latest/sdk/in-app-purchases/

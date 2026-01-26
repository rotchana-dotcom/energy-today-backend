/**
 * Expiration Warning System
 * 
 * Warns Pro users 5-7 days before their access expires
 * Includes upgrade prompts for gift code recipients
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getActivePromoCodeAccess } from "./secure-promo-codes";
import { getSubscriptionStatus } from "./subscription-status";

const WARNINGS_SHOWN_KEY = "@energy_today_warnings_shown";

export interface ExpirationWarning {
  type: "trial" | "promo_code" | "subscription";
  daysRemaining: number;
  expiresAt: string;
  source: string; // e.g., "GIFT-MENTOR-2026", "7-day trial", "Monthly subscription"
  isGiftCode: boolean;
}

/**
 * Check if user should see an expiration warning
 * Returns warning details if within 5-7 days of expiration
 */
export async function checkExpirationWarning(): Promise<ExpirationWarning | null> {
  try {
    const subscriptionStatus = await getSubscriptionStatus();
    
    if (!subscriptionStatus.isPro) {
      return null; // Not a Pro user, no warning needed
    }

    // Check promo code access
    const promoAccess = await getActivePromoCodeAccess();
    if (promoAccess && promoAccess.expiresAt) {
      const expiresAt = new Date(promoAccess.expiresAt);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Show warning if 5-7 days remaining
      if (daysRemaining > 0 && daysRemaining <= 7) {
        const isGiftCode = promoAccess.code.startsWith("GIFT-") || promoAccess.code.startsWith("VIP-");
        
        return {
          type: "promo_code",
          daysRemaining,
          expiresAt: promoAccess.expiresAt,
          source: promoAccess.code,
          isGiftCode,
        };
      }
    }

    // Check trial expiration
    if (subscriptionStatus.source === "trial" && subscriptionStatus.trialEndsAt) {
      const expiresAt = new Date(subscriptionStatus.trialEndsAt);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining > 0 && daysRemaining <= 7) {
        return {
          type: "trial",
          daysRemaining,
          expiresAt: subscriptionStatus.trialEndsAt,
          source: "7-day trial",
          isGiftCode: false,
        };
      }
    }

    // Check subscription expiration (for future subscription system)
    // TODO: Add subscription expiration check when RevenueCat integration is complete

    return null;
  } catch (error) {
    console.error("Failed to check expiration warning:", error);
    return null;
  }
}

/**
 * Get warning message based on warning type
 */
export function getWarningMessage(warning: ExpirationWarning): {
  title: string;
  message: string;
  actionText: string;
} {
  const daysText = warning.daysRemaining === 1 ? "1 day" : `${warning.daysRemaining} days`;

  if (warning.isGiftCode) {
    return {
      title: "Gift Access Expiring Soon",
      message: `Your gift Pro access expires in ${daysText}. Upgrade now to keep all Pro features and protect your data.`,
      actionText: "Upgrade to Pro",
    };
  }

  if (warning.type === "trial") {
    return {
      title: "Trial Ending Soon",
      message: `Your 7-day trial expires in ${daysText}. Subscribe now to keep Pro features and save your progress.`,
      actionText: "Subscribe Now",
    };
  }

  if (warning.type === "promo_code") {
    return {
      title: "Pro Access Expiring Soon",
      message: `Your Pro access (${warning.source}) expires in ${daysText}. Subscribe to continue enjoying Pro features.`,
      actionText: "Subscribe Now",
    };
  }

  return {
    title: "Subscription Expiring Soon",
    message: `Your subscription expires in ${daysText}. Renew now to avoid losing Pro features.`,
    actionText: "Renew Subscription",
  };
}

/**
 * Check if warning has been shown today
 */
async function hasShownWarningToday(warningKey: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(WARNINGS_SHOWN_KEY);
    if (!stored) return false;

    const warnings: Record<string, string> = JSON.parse(stored);
    const lastShown = warnings[warningKey];
    
    if (!lastShown) return false;

    const lastShownDate = new Date(lastShown);
    const today = new Date();
    
    // Check if same day
    return (
      lastShownDate.getFullYear() === today.getFullYear() &&
      lastShownDate.getMonth() === today.getMonth() &&
      lastShownDate.getDate() === today.getDate()
    );
  } catch (error) {
    console.error("Failed to check warning history:", error);
    return false;
  }
}

/**
 * Mark warning as shown today
 */
async function markWarningShown(warningKey: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(WARNINGS_SHOWN_KEY);
    const warnings: Record<string, string> = stored ? JSON.parse(stored) : {};
    
    warnings[warningKey] = new Date().toISOString();
    
    await AsyncStorage.setItem(WARNINGS_SHOWN_KEY, JSON.stringify(warnings));
  } catch (error) {
    console.error("Failed to mark warning as shown:", error);
  }
}

/**
 * Check if warning should be displayed
 * Returns warning if it should be shown, null otherwise
 */
export async function shouldShowExpirationWarning(): Promise<ExpirationWarning | null> {
  const warning = await checkExpirationWarning();
  
  if (!warning) {
    return null;
  }

  // Create unique key for this warning
  const warningKey = `${warning.type}_${warning.source}_${warning.daysRemaining}`;
  
  // Check if already shown today
  const shownToday = await hasShownWarningToday(warningKey);
  
  if (shownToday) {
    return null; // Don't show again today
  }

  // Mark as shown
  await markWarningShown(warningKey);
  
  return warning;
}

/**
 * Get expiration status for display in UI
 */
export async function getExpirationStatus(): Promise<{
  hasWarning: boolean;
  daysRemaining: number | null;
  message: string | null;
} | null> {
  const warning = await checkExpirationWarning();
  
  if (!warning) {
    return null;
  }

  const { message } = getWarningMessage(warning);
  
  return {
    hasWarning: true,
    daysRemaining: warning.daysRemaining,
    message,
  };
}

/**
 * Subscription Status Helper
 * Checks if user has Pro access from multiple sources
 * Priority: Admin Code > Database (with 7-day trial) > AsyncStorage
 */

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseUrl } from "@/constants/oauth";
import { getActivePromoCodeAccess } from "./secure-promo-codes";
import { trackTrialStart, trackTrialExpiration } from "./analytics";
import { getBonusDays } from "./referral-system";

export interface SubscriptionStatus {
  isPro: boolean;
  provider: "stripe" | "paypal" | "trial" | "admin" | "local" | null;
  plan: "monthly" | "annual" | null;
  status: "active" | "trial" | "cancelled" | "expired" | null;
  source: "database" | "local" | "admin";
  trialDaysRemaining?: number;
  isTrialActive?: boolean;
  nextBillingDate?: Date | null;
}

const INSTALL_DATE_KEY = "app_install_date";

/**
 * Get or create install date
 * This is used to calculate the 7-day trial period
 */
async function getInstallDate(): Promise<string> {
  try {
    let installDate = await AsyncStorage.getItem(INSTALL_DATE_KEY);
    
    if (!installDate) {
      // First time - save current date as install date
      installDate = new Date().toISOString();
      await AsyncStorage.setItem(INSTALL_DATE_KEY, installDate);
    }
    
    return installDate;
  } catch (error) {
    console.error("Failed to get install date:", error);
    // Fallback to current date
    return new Date().toISOString();
  }
}

/**
 * Check subscription status from all sources
 * 
 * Checks in this order:
 * 1. Admin unlock code (for testing)
 * 2. Database (from webhook after payment OR 7-day trial)
 * 3. AsyncStorage (legacy/fallback)
 */
export async function getSubscriptionStatus(userId?: string): Promise<SubscriptionStatus> {
  // 1. Check promo code access first (admin code or testing codes)
  const promoAccess = await getActivePromoCodeAccess();
  if (promoAccess && promoAccess.isActive) {
    return {
      isPro: true,
      provider: promoAccess.type === "admin" ? "admin" : "trial",
      plan: null,
      status: promoAccess.type === "admin" ? "active" : "trial",
      source: "admin",
      trialDaysRemaining: promoAccess.daysRemaining || 0,
      isTrialActive: promoAccess.daysRemaining !== null,
    };
  }

  // 2. Check database (requires backend and userId)
  if (userId) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      if (apiBaseUrl) {
        // Get install date for trial calculation
        const installDate = await getInstallDate();
        
        const response = await fetch(
          `${apiBaseUrl}/api/trpc/subscription.checkStatus?input=${encodeURIComponent(
            JSON.stringify({ userId, installDate })
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          const data = result.result?.data;

          if (data) {
            return {
              isPro: data.isPro,
              provider: data.provider,
              plan: data.plan,
              status: data.status,
              source: "database",
              trialDaysRemaining: data.trialDaysRemaining,
              isTrialActive: data.isTrialActive,
              nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : null,
            };
          }
        }
      }
    } catch (error) {
      console.warn("Failed to check subscription from database:", error);
      // Fall through to AsyncStorage check
    }
  }

  // 3. AsyncStorage bypass removed for security
  // Users must use promo codes, database subscriptions, or 7-day trial

  // No Pro subscription found - check if trial is still valid locally
  // Include bonus days from referrals
  try {
    const installDate = await getInstallDate();
    const install = new Date(installDate);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get bonus days from referrals
    const bonusDays = await getBonusDays();
    const totalTrialDays = 7 + bonusDays; // Base 7 days + referral bonuses
    
    const trialDaysRemaining = Math.max(0, totalTrialDays - daysSinceInstall);
    const isTrialActive = trialDaysRemaining > 0;

    if (isTrialActive) {
      // Track trial start (only on first day)
      if (daysSinceInstall === 0) {
        await trackTrialStart(totalTrialDays);
      }
      
      return {
        isPro: true,
        provider: "trial",
        plan: null,
        status: "trial",
        source: "local",
        trialDaysRemaining,
        isTrialActive: true,
      };
    } else if (daysSinceInstall === totalTrialDays) {
      // Track trial expiration (only on expiration day)
      await trackTrialExpiration(totalTrialDays);
    }
  } catch (error) {
    console.warn("Failed to check trial status:", error);
  }

  // No Pro subscription and trial expired
  return {
    isPro: false,
    provider: null,
    plan: null,
    status: null,
    source: "local",
    trialDaysRemaining: 0,
    isTrialActive: false,
  };
}

/**
 * Save subscription status to AsyncStorage (legacy support)
 */
export async function saveSubscriptionStatus(status: {
  isPro: boolean;
  provider?: string;
  plan?: string;
}) {
  try {
    await AsyncStorage.setItem("subscription_status", JSON.stringify(status));
  } catch (error) {
    console.error("Failed to save subscription status:", error);
  }
}

/**
 * Reset install date - REMOVED FOR SECURITY
 * This function allowed users to bypass the 7-day trial limit
 * Use promo codes for testing instead
 */
// export async function resetInstallDate() {
//   // Disabled for security
// }

/**
 * React hook to get subscription status
 */
export function useSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPro: false,
    provider: null,
    plan: null,
    status: null,
    source: "local",
    trialDaysRemaining: 0,
    isTrialActive: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      try {
        const subscriptionStatus = await getSubscriptionStatus();
        if (mounted) {
          setStatus(subscriptionStatus);
        }
      } catch (error) {
        console.error("Failed to load subscription status:", error);
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return status;
}

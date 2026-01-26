/**
 * Referral Program
 * 
 * Handles referral code generation, tracking, and rewards
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSubscriptionStatus, saveSubscriptionStatus } from "./storage";

export interface Referral {
  code: string;
  referredBy?: string; // Code of person who referred this user
  referrals: string[]; // Codes of people this user referred
  rewardsEarned: number; // Number of free months earned
  createdAt: string;
}

const KEYS = {
  REFERRAL: "@energy_today:referral",
};

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get user's referral data
 */
export async function getReferralData(): Promise<Referral> {
  const data = await AsyncStorage.getItem(KEYS.REFERRAL);
  
  if (data) {
    return JSON.parse(data);
  }

  // Create new referral data
  const newReferral: Referral = {
    code: generateReferralCode(),
    referrals: [],
    rewardsEarned: 0,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(KEYS.REFERRAL, JSON.stringify(newReferral));
  return newReferral;
}

/**
 * Apply referral code (when signing up)
 */
export async function applyReferralCode(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const referralData = await getReferralData();

    if (referralData.referredBy) {
      return {
        success: false,
        error: "You've already used a referral code",
      };
    }

    // In production, verify code with backend
    // For now, just store it locally
    referralData.referredBy = code;
    await AsyncStorage.setItem(KEYS.REFERRAL, JSON.stringify(referralData));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Track successful referral (called when referred user subscribes)
 */
export async function trackReferral(referredUserCode: string): Promise<{ success: boolean; error?: string }> {
  try {
    const referralData = await getReferralData();

    // Add to referrals list
    if (!referralData.referrals.includes(referredUserCode)) {
      referralData.referrals.push(referredUserCode);
      referralData.rewardsEarned += 1; // 1 month free per referral

      await AsyncStorage.setItem(KEYS.REFERRAL, JSON.stringify(referralData));

      // Extend subscription by 1 month
      await extendSubscription(30);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extend subscription by days
 */
async function extendSubscription(days: number): Promise<void> {
  const subscription = await getSubscriptionStatus();
  
  const currentExpiry = subscription.expiresAt 
    ? new Date(subscription.expiresAt)
    : new Date();

  const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

  await saveSubscriptionStatus({
    ...subscription,
    isPro: true,
    expiresAt: newExpiry.toISOString(),
  });
}

/**
 * Get referral stats
 */
export async function getReferralStats(): Promise<{
  code: string;
  totalReferrals: number;
  rewardsEarned: number;
  freeMonthsRemaining: number;
}> {
  const referralData = await getReferralData();
  const subscription = await getSubscriptionStatus();

  // Calculate free months remaining
  let freeMonthsRemaining = 0;
  if (subscription.expiresAt) {
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    freeMonthsRemaining = Math.max(0, Math.floor(diff / (30 * 24 * 60 * 60 * 1000)));
  }

  return {
    code: referralData.code,
    totalReferrals: referralData.referrals.length,
    rewardsEarned: referralData.rewardsEarned,
    freeMonthsRemaining,
  };
}

/**
 * Share referral code
 */
export function getReferralMessage(code: string): string {
  return `Try Energy Today Pro and get insights into your daily energy patterns! Use my referral code ${code} to get started. Download: https://energytoday.app`;
}

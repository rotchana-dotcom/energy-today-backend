/**
 * Subscription Management
 * 
 * Handles Pro subscription management, payment history, and cancellation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SubscriptionStatus } from "@/types";
import { getSubscriptionStatus, saveSubscriptionStatus } from "./storage";

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: "stripe" | "paypal";
  status: "succeeded" | "failed" | "pending";
  description: string;
}

export interface BillingInfo {
  cardLast4?: string;
  cardBrand?: string;
  email?: string;
  nextBillingDate?: string;
}

const KEYS = {
  PAYMENT_HISTORY: "@energy_today:payment_history",
  BILLING_INFO: "@energy_today:billing_info",
  TRIAL_START: "@energy_today:trial_start",
};

/**
 * Get payment history
 */
export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  const data = await AsyncStorage.getItem(KEYS.PAYMENT_HISTORY);
  return data ? JSON.parse(data) : [];
}

/**
 * Add payment to history
 */
export async function addPaymentToHistory(payment: PaymentHistory): Promise<void> {
  const history = await getPaymentHistory();
  history.unshift(payment);
  await AsyncStorage.setItem(KEYS.PAYMENT_HISTORY, JSON.stringify(history));
}

/**
 * Get billing information
 */
export async function getBillingInfo(): Promise<BillingInfo> {
  const data = await AsyncStorage.getItem(KEYS.BILLING_INFO);
  return data ? JSON.parse(data) : {};
}

/**
 * Update billing information
 */
export async function updateBillingInfo(info: BillingInfo): Promise<void> {
  await AsyncStorage.setItem(KEYS.BILLING_INFO, JSON.stringify(info));
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await getSubscriptionStatus();
    
    if (!subscription.isPro) {
      return {
        success: false,
        error: "No active subscription to cancel",
      };
    }

    // In production, call backend API to cancel with payment provider
    // For now, just update local status
    await saveSubscriptionStatus({
      isPro: false,
      expiresAt: undefined,
      canceledAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Start free trial
 */
export async function startFreeTrial(): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await getSubscriptionStatus();
    
    if (subscription.isPro) {
      return {
        success: false,
        error: "Already a Pro user",
      };
    }

    const trialStart = await AsyncStorage.getItem(KEYS.TRIAL_START);
    if (trialStart) {
      return {
        success: false,
        error: "Trial already used",
      };
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await AsyncStorage.setItem(KEYS.TRIAL_START, now.toISOString());
    await saveSubscriptionStatus({
      isPro: true,
      isTrial: true,
      expiresAt: trialEnd.toISOString(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if trial is active
 */
export async function isTrialActive(): Promise<boolean> {
  const subscription = await getSubscriptionStatus();
  
  if (!subscription.isTrial || !subscription.expiresAt) {
    return false;
  }

  const expiresAt = new Date(subscription.expiresAt);
  return expiresAt > new Date();
}

/**
 * Get trial days remaining
 */
export async function getTrialDaysRemaining(): Promise<number> {
  const subscription = await getSubscriptionStatus();
  
  if (!subscription.isTrial || !subscription.expiresAt) {
    return 0;
  }

  const expiresAt = new Date(subscription.expiresAt);
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  
  return Math.max(0, days);
}

/**
 * End trial and downgrade to free
 */
export async function endTrial(): Promise<void> {
  await saveSubscriptionStatus({
    isPro: false,
    isTrial: false,
    expiresAt: undefined,
  });
}

/**
 * Check if user has used trial
 */
export async function hasUsedTrial(): Promise<boolean> {
  const trialStart = await AsyncStorage.getItem(KEYS.TRIAL_START);
  return Boolean(trialStart);
}

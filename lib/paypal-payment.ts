/**
 * PayPal Payment Integration - Backend API
 * 
 * Uses backend API to create PayPal subscriptions with real Plan IDs
 */

import { Platform, Linking } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

export interface PayPalPaymentResult {
  success: boolean;
  error?: string;
}

/**
 * Process PayPal payment for Pro subscription
 * 
 * Calls backend API to create subscription
 * Opens PayPal approval page in browser
 * User completes payment on PayPal's secure page
 * After payment, PayPal redirects back to app
 * 
 * @param userId - User ID
 * @param plan - 'monthly' ($9.99/month) or 'annual' ($99.99/year)
 */
export async function processPayPalPayment(userId: string, plan: 'monthly' | 'annual' = 'monthly'): Promise<PayPalPaymentResult> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    if (!apiBaseUrl) {
      return {
        success: false,
        error: "API base URL not configured",
      };
    }

    // Create subscription via backend API
    const response = await fetch(`${apiBaseUrl}/api/trpc/payment.createPayPalSubscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        plan,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to create PayPal subscription",
      };
    }

    const result = await response.json();

    if (!result.result?.data?.approveUrl) {
      return {
        success: false,
        error: "No approval URL returned",
      };
    }

    const approveUrl = result.result.data.approveUrl;

    // Open PayPal approval page in browser
    const canOpen = await Linking.canOpenURL(approveUrl);
    
    if (!canOpen) {
      return {
        success: false,
        error: "Cannot open PayPal approval page",
      };
    }

    await Linking.openURL(approveUrl);

    return { success: true };
  } catch (error) {
    console.error("PayPal payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get subscription pricing
 */
export function getPayPalPricing() {
  return {
    monthly: {
      amount: 9.99,
      currency: "USD",
      interval: "month",
      description: "Pro subscription - Monthly billing",
      total: 119.88, // 12 months
    },
    annual: {
      amount: 99.99,
      currency: "USD",
      interval: "year",
      description: "Pro subscription - Annual billing",
      savings: 19.89, // Save $19.89 vs monthly
      discount: 17, // 17% discount
    },
  };
}

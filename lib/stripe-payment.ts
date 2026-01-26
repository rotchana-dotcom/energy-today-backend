/**
 * Stripe Payment Integration - Backend API
 * 
 * Uses backend API to create Stripe checkout sessions with real Price IDs
 */

import { Platform, Linking } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

export interface StripePaymentResult {
  success: boolean;
  error?: string;
}

/**
 * Process Stripe payment for Pro subscription
 * 
 * Calls backend API to create checkout session
 * Opens Stripe checkout page in browser
 * User completes payment on Stripe's secure checkout page
 * After payment, Stripe redirects back to app
 * 
 * @param userId - User ID
 * @param plan - 'monthly' ($9.99/month) or 'annual' ($99.99/year)
 */
export async function processStripePayment(userId: string, plan: 'monthly' | 'annual' = 'monthly'): Promise<StripePaymentResult> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    if (!apiBaseUrl) {
      return {
        success: false,
        error: "API base URL not configured",
      };
    }

    // Create checkout session via backend API
    const response = await fetch(`${apiBaseUrl}/api/trpc/payment.createStripeCheckout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        plan,
        successUrl: `energytoday://payment-success?provider=stripe&plan=${plan}`,
        cancelUrl: "energytoday://upgrade",
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to create checkout session",
      };
    }

    const result = await response.json();

    if (!result.result?.data?.url) {
      return {
        success: false,
        error: "No checkout URL returned",
      };
    }

    const checkoutUrl = result.result.data.url;

    // Open Stripe checkout page in browser
    const canOpen = await Linking.canOpenURL(checkoutUrl);
    
    if (!canOpen) {
      return {
        success: false,
        error: "Cannot open Stripe checkout page",
      };
    }

    await Linking.openURL(checkoutUrl);

    return { success: true };
  } catch (error) {
    console.error("Stripe payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get subscription pricing
 */
export function getStripePricing() {
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

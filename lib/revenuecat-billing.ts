/**
 * RevenueCat Billing Integration
 * 
 * Handles in-app purchases for Android and iOS using RevenueCat
 * 
 * Product IDs (must match Google Play Console):
 * - monthly: Monthly subscription
 * - yearly: Yearly subscription
 */

import Purchases, { LOG_LEVEL, PurchasesOffering, PurchasesPackage, CustomerInfo } from "react-native-purchases";
import { Platform } from "react-native";

// RevenueCat API Keys
const REVENUECAT_API_KEY_ANDROID = "goog_iOwMmlBttgbYUaklCFhazVSVUsP";
const REVENUECAT_API_KEY_IOS = "goog_iOwMmlBttgbYUaklCFhazVSVUsP"; // Production key

export interface SubscriptionProduct {
  identifier: string;
  title: string;
  description: string;
  price: string;
  priceString: string;
  currencyCode: string;
  introPrice?: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  productId?: string;
  isActive?: boolean;
}

/**
 * Initialize RevenueCat SDK
 * Call this once when app starts
 */
export async function initializeRevenueCat(): Promise<boolean> {
  try {
    // Set log level for debugging
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    // Configure SDK with API key
    if (Platform.OS === "ios") {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
    } else if (Platform.OS === "android") {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
    } else {
      console.log("[RevenueCat] Skipping initialization - not iOS/Android");
      return false;
    }

    console.log("[RevenueCat] SDK initialized successfully");
    return true;
  } catch (error) {
    console.error("[RevenueCat] Failed to initialize SDK:", error);
    return false;
  }
}

/**
 * Get available subscription offerings
 * Returns products from RevenueCat
 */
export async function getSubscriptionOfferings(): Promise<SubscriptionProduct[]> {
  if (Platform.OS === "web") {
    console.log("[RevenueCat] Not supported on web");
    return [];
  }

  try {
    const offerings = await Purchases.getOfferings();
    
    if (!offerings.current) {
      console.log("[RevenueCat] No current offering available");
      return [];
    }

    const products: SubscriptionProduct[] = [];
    const packages = offerings.current.availablePackages;

    for (const pkg of packages) {
      products.push({
        identifier: pkg.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
        introPrice: pkg.product.introPrice?.priceString,
      });
    }

    console.log("[RevenueCat] Found", products.length, "products");
    return products;
  } catch (error) {
    console.error("[RevenueCat] Error fetching offerings:", error);
    return [];
  }
}

/**
 * Purchase a subscription package
 */
export async function purchaseSubscription(
  packageToPurchase: PurchasesPackage
): Promise<PurchaseResult> {
  if (Platform.OS === "web") {
    return {
      success: false,
      error: "In-app purchases not available on web",
    };
  }

  try {
    console.log("[RevenueCat] Initiating purchase for:", packageToPurchase.identifier);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    // Check if user now has active entitlement
    const isActive = typeof customerInfo.entitlements.active["pro"] !== "undefined";

    if (isActive) {
      console.log("[RevenueCat] Purchase successful, user is now Pro");
      return {
        success: true,
        productId: packageToPurchase.identifier,
        isActive: true,
      };
    } else {
      console.log("[RevenueCat] Purchase completed but entitlement not active");
      return {
        success: false,
        error: "Purchase completed but subscription not activated",
      };
    }
  } catch (error: any) {
    console.error("[RevenueCat] Purchase error:", error);

    // Handle user cancellation
    if (error.userCancelled) {
      return {
        success: false,
        error: "Purchase cancelled",
      };
    }

    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (Platform.OS === "web") {
    return {
      success: false,
      error: "Restore not available on web",
    };
  }

  try {
    console.log("[RevenueCat] Restoring purchases...");

    const customerInfo = await Purchases.restorePurchases();

    // Check if user has active entitlement
    const isActive = typeof customerInfo.entitlements.active["pro"] !== "undefined";

    if (isActive) {
      console.log("[RevenueCat] Restore successful, user has active subscription");
      return {
        success: true,
        isActive: true,
      };
    } else {
      console.log("[RevenueCat] No active subscription found");
      return {
        success: false,
        error: "No active subscription found",
      };
    }
  } catch (error: any) {
    console.error("[RevenueCat] Restore error:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Check current subscription status
 */
export async function getSubscriptionStatus(): Promise<{
  isActive: boolean;
  expirationDate?: string;
  productId?: string;
}> {
  if (Platform.OS === "web") {
    return { isActive: false };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    const proEntitlement = customerInfo.entitlements.active["pro"];
    
    if (proEntitlement) {
      return {
        isActive: true,
        expirationDate: proEntitlement.expirationDate || undefined,
        productId: proEntitlement.productIdentifier,
      };
    }

    return { isActive: false };
  } catch (error) {
    console.error("[RevenueCat] Error checking subscription status:", error);
    return { isActive: false };
  }
}

/**
 * Get customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error("[RevenueCat] Error getting customer info:", error);
    return null;
  }
}

/**
 * Check if billing is available
 */
export function isBillingAvailable(): boolean {
  return Platform.OS === "android" || Platform.OS === "ios";
}

/**
 * Get pricing for display (fallback if API fails)
 */
export function getDefaultPricing() {
  return {
    monthly: {
      price: "$9.99",
      interval: "month",
      description: "Pro subscription - Monthly billing",
    },
    yearly: {
      price: "$79.99",
      interval: "year",
      description: "Pro subscription - Annual billing",
      savings: "Save 33%",
    },
  };
}

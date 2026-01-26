/**
 * Secure Promo Code System
 * 
 * Features:
 * - Device-locked codes (one code per device, can't be shared)
 * - Expiry dates
 * - Admin code (ENERGY2026PRO) - permanent, no expiry
 * - Testing codes - temporary, with expiry dates
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackPromoCodeRedemption } from "./analytics";
import * as Application from "expo-application";
import { Platform } from "react-native";

const REDEEMED_CODES_KEY = "@energy_today_redeemed_codes";
const ADMIN_CODE = "ENERGY2026PRO";

export interface PromoCode {
  code: string;
  type: "admin" | "testing" | "marketing" | "gift";
  expiryDate: string | null; // ISO date string, null = no expiry
  durationDays: number | null; // null = permanent
  description: string;
  message?: string; // Custom message for the recipient
}

/**
 * Available promo codes
 * Admin code is permanent, testing codes expire
 */
const PROMO_CODES: Record<string, PromoCode> = {
  // Admin code - permanent, no expiry (for you only)
  [ADMIN_CODE]: {
    code: ADMIN_CODE,
    type: "admin",
    expiryDate: null,
    durationDays: null, // Permanent
    description: "Admin access - permanent Pro features",
  },
  
  // Closed Testing Codes - expire after testing period
  // New Zealand testers
  "NZ-BETA-2026": {
    code: "NZ-BETA-2026",
    type: "testing",
    expiryDate: "2026-03-31T23:59:59Z", // 2 months from now
    durationDays: 60, // 60 days of Pro access
    description: "New Zealand closed testing - 60 days Pro access",
  },
  
  // Thailand testers
  "TH-BETA-2026": {
    code: "TH-BETA-2026",
    type: "testing",
    expiryDate: "2026-03-31T23:59:59Z",
    durationDays: 60,
    description: "Thailand closed testing - 60 days Pro access",
  },
  
  // Australia testers
  "AU-BETA-2026": {
    code: "AU-BETA-2026",
    type: "testing",
    expiryDate: "2026-03-31T23:59:59Z",
    durationDays: 60,
    description: "Australia closed testing - 60 days Pro access",
  },
  
  // USA testers
  "US-BETA-2026": {
    code: "US-BETA-2026",
    type: "testing",
    expiryDate: "2026-03-31T23:59:59Z",
    durationDays: 60,
    description: "USA closed testing - 60 days Pro access",
  },
  
  // Gift Memberships - one-time use, 30 days Pro access
  "GIFT-MENTOR-2026": {
    code: "GIFT-MENTOR-2026",
    type: "gift",
    expiryDate: null, // No expiry on redemption
    durationDays: 30, // 30 days of Pro access
    description: "Gift membership for mentor - 30 days Pro access",
    message: "Thank you for your guidance and support in my business journey! Enjoy 30 days of Pro access to Energy Today.",
  },
  
  "GIFT-FRIEND-2026": {
    code: "GIFT-FRIEND-2026",
    type: "gift",
    expiryDate: null, // No expiry on redemption
    durationDays: 30, // 30 days of Pro access
    description: "Gift membership for best friend - 30 days Pro access",
    message: "Thanks for being an amazing friend! Enjoy 30 days of Pro access to Energy Today.",
  },
};

interface RedeemedCode {
  code: string;
  deviceId: string;
  userId?: string; // For gift codes - ties to user account, not device
  redeemedAt: string; // ISO date
  expiresAt: string | null; // ISO date or null for permanent
}

/**
 * Get unique device identifier
 */
async function getDeviceId(): Promise<string> {
  try {
    // Use installation ID as device identifier
    // This is unique per app installation
    let deviceId = await Application.getInstallationIdAsync();
    
    if (!deviceId) {
      // Fallback: generate and store a UUID
      deviceId = await AsyncStorage.getItem("@energy_today_device_id");
      if (!deviceId) {
        deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem("@energy_today_device_id", deviceId);
      }
    }
    
    return deviceId;
  } catch (error) {
    console.error("Failed to get device ID:", error);
    // Fallback to timestamp-based ID
    return `fallback-${Date.now()}`;
  }
}

/**
 * Get all redeemed codes for this device
 */
async function getRedeemedCodes(): Promise<RedeemedCode[]> {
  try {
    const stored = await AsyncStorage.getItem(REDEEMED_CODES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get redeemed codes:", error);
    return [];
  }
}

/**
 * Save redeemed code
 */
async function saveRedeemedCode(redemption: RedeemedCode): Promise<void> {
  try {
    const codes = await getRedeemedCodes();
    codes.push(redemption);
    await AsyncStorage.setItem(REDEEMED_CODES_KEY, JSON.stringify(codes));
  } catch (error) {
    console.error("Failed to save redeemed code:", error);
  }
}

/**
 * Check if a code is valid
 */
export function isValidPromoCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return normalized in PROMO_CODES;
}

/**
 * Check if a code has expired (the code itself, not the redemption)
 */
function isCodeExpired(promoCode: PromoCode): boolean {
  if (!promoCode.expiryDate) {
    return false; // No expiry date = never expires
  }
  
  const now = new Date();
  const expiry = new Date(promoCode.expiryDate);
  return now > expiry;
}

/**
 * Check if this device has already redeemed this code
 * For gift codes, checks if ANY user has redeemed it (one-time use)
 * For other codes, checks if THIS device has redeemed it
 */
async function hasDeviceRedeemedCode(code: string): Promise<boolean> {
  const deviceId = await getDeviceId();
  const redeemedCodes = await getRedeemedCodes();
  const promoCode = PROMO_CODES[code];
  
  // For gift codes: check if ANYONE has redeemed it (one-time use globally)
  if (promoCode && promoCode.type === "gift") {
    return redeemedCodes.some((redemption) => redemption.code === code);
  }
  
  // For other codes: check if THIS device has redeemed it
  return redeemedCodes.some(
    (redemption) => 
      redemption.code === code && 
      redemption.deviceId === deviceId
  );
}

/**
 * Get active Pro access from redeemed codes
 * Returns the redemption with the longest remaining time
 */
export async function getActivePromoCodeAccess(): Promise<{
  isActive: boolean;
  code: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  type: "admin" | "testing" | "marketing" | null;
} | null> {
  try {
    const deviceId = await getDeviceId();
    const redeemedCodes = await getRedeemedCodes();
    const now = new Date();
    
    // Filter to codes redeemed by this device that haven't expired
    const activeCodes = redeemedCodes.filter((redemption) => {
      // Must be from this device
      if (redemption.deviceId !== deviceId) {
        return false;
      }
      
      // If no expiry, it's permanent (admin code)
      if (!redemption.expiresAt) {
        return true;
      }
      
      // Check if not expired
      const expiry = new Date(redemption.expiresAt);
      return now < expiry;
    });
    
    if (activeCodes.length === 0) {
      return null;
    }
    
    // Find the code with the longest remaining time
    // Permanent codes (null expiresAt) take priority
    const bestCode = activeCodes.reduce((best, current) => {
      if (!current.expiresAt) return current; // Permanent wins
      if (!best.expiresAt) return best; // Permanent wins
      
      const currentExpiry = new Date(current.expiresAt);
      const bestExpiry = new Date(best.expiresAt);
      
      return currentExpiry > bestExpiry ? current : best;
    });
    
    const promoCode = PROMO_CODES[bestCode.code];
    
    let daysRemaining: number | null = null;
    if (bestCode.expiresAt) {
      const expiry = new Date(bestCode.expiresAt);
      const diffTime = expiry.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      isActive: true,
      code: bestCode.code,
      expiresAt: bestCode.expiresAt,
      daysRemaining,
      type: promoCode?.type || null,
    };
  } catch (error) {
    console.error("Failed to get active promo code access:", error);
    return null;
  }
}

/**
 * Redeem a promo code
 * Returns success status and error message if failed
 */
export async function redeemPromoCode(code: string): Promise<{
  success: boolean;
  message: string;
  promoCode?: PromoCode;
}> {
  try {
    const normalized = code.trim().toUpperCase();
    
    // Check if code exists
    if (!isValidPromoCode(normalized)) {
      return {
        success: false,
        message: "Invalid promo code. Please check and try again.",
      };
    }
    
    const promoCode = PROMO_CODES[normalized];
    
    // Check if code has expired (the code itself, not the redemption)
    if (isCodeExpired(promoCode)) {
      return {
        success: false,
        message: "This promo code has expired and is no longer valid.",
      };
    }
    
    // Check if code has already been redeemed
    const alreadyRedeemed = await hasDeviceRedeemedCode(normalized);
    if (alreadyRedeemed) {
      return {
        success: false,
        message: promoCode.type === "gift"
          ? "This gift code has already been redeemed."
          : "You have already redeemed this code on this device.",
      };
    }
    
    // Calculate expiry date for this redemption
    let expiresAt: string | null = null;
    if (promoCode.durationDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + promoCode.durationDays);
      expiresAt = expiry.toISOString();
    }
    
    // Save redemption
    const deviceId = await getDeviceId();
    await saveRedeemedCode({
      code: normalized,
      deviceId,
      redeemedAt: new Date().toISOString(),
      expiresAt,
    });
    
    // Track analytics
    await trackPromoCodeRedemption(normalized, true, promoCode.durationDays || undefined);
    
    return {
      success: true,
      message: promoCode.message || (promoCode.durationDays
        ? `Success! You now have ${promoCode.durationDays} days of Pro access.`
        : "Success! You now have permanent Pro access."),
      promoCode,
    };
  } catch (error) {
    console.error("Failed to redeem promo code:", error);
    return {
      success: false,
      message: "An error occurred while redeeming the code. Please try again.",
    };
  }
}

/**
 * Get promo code info (for display purposes)
 */
export function getPromoCodeInfo(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES[normalized] || null;
}

/**
 * List all available promo codes (for admin/testing purposes only)
 * DO NOT expose this in production UI
 */
export function getAllPromoCodes(): PromoCode[] {
  return Object.values(PROMO_CODES);
}

/**
 * Clear all redeemed codes (for testing only)
 * DO NOT expose this in production
 */
export async function clearRedeemedCodes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REDEEMED_CODES_KEY);
  } catch (error) {
    console.error("Failed to clear redeemed codes:", error);
  }
}

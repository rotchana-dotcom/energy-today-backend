/**
 * Referral System
 * Users get +7 days Pro trial for each friend they refer
 * Referrer and referee both get bonus days
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const REFERRAL_CODE_KEY = "user_referral_code";
const REFERRALS_KEY = "user_referrals";
const REFERRER_CODE_KEY = "referred_by_code";
const BONUS_DAYS_KEY = "referral_bonus_days";

export interface Referral {
  code: string; // The referral code used
  referredAt: string; // ISO date when referral was made
  status: "active" | "expired"; // Whether the referred user is still active
}

export interface ReferralStats {
  myReferralCode: string;
  totalReferrals: number;
  bonusDaysEarned: number;
  referrals: Referral[];
  referredBy?: string; // Code of person who referred this user
}

/**
 * Generate a unique referral code for a user
 * Format: FIRSTNAME + YEAR (e.g., "SARAH2026")
 */
export function generateReferralCode(name: string): string {
  const firstName = name.split(" ")[0].toUpperCase();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  
  // Use first name + year + random 3 digits for uniqueness
  return `${firstName}${year}${randomSuffix}`;
}

/**
 * Get or create user's referral code
 */
export async function getUserReferralCode(userName: string): Promise<string> {
  try {
    let code = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
    
    if (!code) {
      // Generate new code
      code = generateReferralCode(userName);
      await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
    }
    
    return code;
  } catch (error) {
    console.error("Failed to get referral code:", error);
    return generateReferralCode(userName);
  }
}

/**
 * Get all referrals made by this user
 */
export async function getUserReferrals(): Promise<Referral[]> {
  try {
    const stored = await AsyncStorage.getItem(REFERRALS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get referrals:", error);
    return [];
  }
}

/**
 * Get total bonus days earned from referrals
 */
export async function getBonusDays(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(BONUS_DAYS_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
    return 0;
  } catch (error) {
    console.error("Failed to get bonus days:", error);
    return 0;
  }
}

/**
 * Get who referred this user (if anyone)
 */
export async function getReferredByCode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFERRER_CODE_KEY);
  } catch (error) {
    console.error("Failed to get referrer code:", error);
    return null;
  }
}

/**
 * Get complete referral stats
 */
export async function getReferralStats(userName: string): Promise<ReferralStats> {
  const myReferralCode = await getUserReferralCode(userName);
  const referrals = await getUserReferrals();
  const bonusDaysEarned = await getBonusDays();
  const referredBy = await getReferredByCode();
  
  return {
    myReferralCode,
    totalReferrals: referrals.length,
    bonusDaysEarned,
    referrals,
    referredBy: referredBy || undefined,
  };
}

/**
 * Validate a referral code
 * Returns true if code is valid and can be used
 */
export async function validateReferralCode(
  code: string,
  userName: string
): Promise<{ valid: boolean; error?: string }> {
  // Check if code is empty
  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Please enter a referral code" };
  }
  
  // Normalize code (uppercase, trim)
  const normalizedCode = code.trim().toUpperCase();
  
  // Check if user is trying to use their own code
  const myCode = await getUserReferralCode(userName);
  if (normalizedCode === myCode) {
    return { valid: false, error: "You cannot use your own referral code" };
  }
  
  // Check if user has already used a referral code
  const existingReferrer = await getReferredByCode();
  if (existingReferrer) {
    return { valid: false, error: "You have already used a referral code" };
  }
  
  // Code is valid
  return { valid: true };
}

/**
 * Apply a referral code (called when new user enters code during onboarding)
 * Awards +7 days to both referrer and referee
 */
export async function applyReferralCode(
  code: string,
  userName: string
): Promise<{ success: boolean; error?: string; bonusDays?: number }> {
  // Validate code
  const validation = await validateReferralCode(code, userName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const normalizedCode = code.trim().toUpperCase();
  
  try {
    // Save who referred this user
    await AsyncStorage.setItem(REFERRER_CODE_KEY, normalizedCode);
    
    // Award +7 days to referee (this user)
    const currentBonusDays = await getBonusDays();
    const newBonusDays = currentBonusDays + 7;
    await AsyncStorage.setItem(BONUS_DAYS_KEY, newBonusDays.toString());
    
    // Note: In a real app with backend, we would also award +7 days to the referrer
    // For now, we just track it locally
    
    return { success: true, bonusDays: 7 };
  } catch (error) {
    console.error("Failed to apply referral code:", error);
    return { success: false, error: "Failed to apply referral code" };
  }
}

/**
 * Record a successful referral (called when someone uses your code)
 * Awards +7 days to the referrer
 */
export async function recordReferral(referredUserCode: string): Promise<void> {
  try {
    // Add to referrals list
    const referrals = await getUserReferrals();
    referrals.push({
      code: referredUserCode,
      referredAt: new Date().toISOString(),
      status: "active",
    });
    await AsyncStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
    
    // Award +7 days bonus
    const currentBonusDays = await getBonusDays();
    const newBonusDays = currentBonusDays + 7;
    await AsyncStorage.setItem(BONUS_DAYS_KEY, newBonusDays.toString());
  } catch (error) {
    console.error("Failed to record referral:", error);
  }
}

/**
 * Get share message with referral code
 */
export function getShareMessage(referralCode: string): string {
  return `🌟 Join me on Energy Today and get 1 week of Pro features FREE!\n\nUse my referral code: ${referralCode}\n\nEnergy Today helps you understand your daily energy and optimize your timing for better decisions.\n\nDownload now: [App Store Link]`;
}

/**
 * Reset referral data (for testing)
 */
export async function resetReferralData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
    await AsyncStorage.removeItem(REFERRALS_KEY);
    await AsyncStorage.removeItem(REFERRER_CODE_KEY);
    await AsyncStorage.removeItem(BONUS_DAYS_KEY);
  } catch (error) {
    console.error("Failed to reset referral data:", error);
  }
}

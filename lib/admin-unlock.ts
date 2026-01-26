/**
 * Admin Unlock System
 * 
 * Allows testing Pro features without payment
 * For development and testing only
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_UNLOCK_CODE = "ENERGY2026PRO";
const ADMIN_UNLOCK_KEY = "admin_pro_unlocked";

/**
 * Check if admin unlock code is correct
 */
export function validateAdminCode(code: string): boolean {
  return code.trim().toUpperCase() === ADMIN_UNLOCK_CODE;
}

/**
 * Unlock Pro features with admin code
 */
export async function unlockProWithAdminCode(code: string): Promise<boolean> {
  if (validateAdminCode(code)) {
    await AsyncStorage.setItem(ADMIN_UNLOCK_KEY, "true");
    return true;
  }
  return false;
}

/**
 * Check if Pro is unlocked via admin code
 */
export async function isProUnlockedByAdmin(): Promise<boolean> {
  const unlocked = await AsyncStorage.getItem(ADMIN_UNLOCK_KEY);
  return unlocked === "true";
}

/**
 * Remove admin unlock (for testing)
 */
export async function removeAdminUnlock(): Promise<void> {
  await AsyncStorage.removeItem(ADMIN_UNLOCK_KEY);
}

/**
 * Get admin unlock code (for display in UI)
 */
export function getAdminUnlockCode(): string {
  return ADMIN_UNLOCK_CODE;
}

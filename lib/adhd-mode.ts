/**
 * ADHD Mode Storage and Management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const ADHD_MODE_KEY = "@energy_today_adhd_mode";

/**
 * Check if ADHD-friendly mode is enabled
 */
export async function isADHDModeEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ADHD_MODE_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error reading ADHD mode:", error);
    return false;
  }
}

/**
 * Enable or disable ADHD-friendly mode
 */
export async function setADHDMode(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ADHD_MODE_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.error("Error setting ADHD mode:", error);
  }
}

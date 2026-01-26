/**
 * Streak Recovery System
 * 
 * Allow users to freeze their streak once per month
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@energy_today:streak_recovery";

export interface StreakRecovery {
  freezesUsed: number;
  lastFreezeDate: string | null;
  freezeHistory: Array<{
    date: string;
    reason?: string;
  }>;
  currentMonthStart: string;
}

/**
 * Get streak recovery data
 */
export async function getStreakRecovery(): Promise<StreakRecovery> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get streak recovery:", error);
  }

  // Return default
  return {
    freezesUsed: 0,
    lastFreezeDate: null,
    freezeHistory: [],
    currentMonthStart: getMonthStart(),
  };
}

/**
 * Save streak recovery data
 */
export async function saveStreakRecovery(data: StreakRecovery): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save streak recovery:", error);
    throw error;
  }
}

/**
 * Check if user can freeze streak
 */
export async function canFreezeStreak(): Promise<{
  canFreeze: boolean;
  reason?: string;
  freezesRemaining: number;
}> {
  const data = await getStreakRecovery();
  const currentMonth = getMonthStart();

  // Reset if new month
  if (data.currentMonthStart !== currentMonth) {
    data.freezesUsed = 0;
    data.currentMonthStart = currentMonth;
    await saveStreakRecovery(data);
  }

  const maxFreezesPerMonth = 1;
  const freezesRemaining = maxFreezesPerMonth - data.freezesUsed;

  if (data.freezesUsed >= maxFreezesPerMonth) {
    return {
      canFreeze: false,
      reason: "You've used your freeze for this month",
      freezesRemaining: 0,
    };
  }

  // Check if already frozen today
  if (data.lastFreezeDate === getTodayDate()) {
    return {
      canFreeze: false,
      reason: "Streak already frozen for today",
      freezesRemaining,
    };
  }

  return {
    canFreeze: true,
    freezesRemaining,
  };
}

/**
 * Freeze streak for today
 */
export async function freezeStreak(reason?: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { canFreeze, reason: cantReason } = await canFreezeStreak();

  if (!canFreeze) {
    return {
      success: false,
      message: cantReason || "Cannot freeze streak",
    };
  }

  try {
    const data = await getStreakRecovery();
    const today = getTodayDate();

    data.freezesUsed += 1;
    data.lastFreezeDate = today;
    data.freezeHistory.push({
      date: today,
      reason,
    });

    await saveStreakRecovery(data);

    return {
      success: true,
      message: "Streak frozen successfully! Your streak is protected for today.",
    };
  } catch (error) {
    console.error("Failed to freeze streak:", error);
    return {
      success: false,
      message: "Failed to freeze streak. Please try again.",
    };
  }
}

/**
 * Check if streak is frozen for a specific date
 */
export async function isStreakFrozen(date: string): Promise<boolean> {
  const data = await getStreakRecovery();
  return data.freezeHistory.some((freeze) => freeze.date === date);
}

/**
 * Get freeze history
 */
export async function getFreezeHistory(): Promise<
  Array<{
    date: string;
    reason?: string;
  }>
> {
  const data = await getStreakRecovery();
  return data.freezeHistory.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Get freeze statistics
 */
export async function getFreezeStats(): Promise<{
  totalFreezesUsed: number;
  freezesThisMonth: number;
  freezesRemaining: number;
  lastFreezeDate: string | null;
  nextResetDate: string;
}> {
  const data = await getStreakRecovery();
  const { freezesRemaining } = await canFreezeStreak();

  return {
    totalFreezesUsed: data.freezeHistory.length,
    freezesThisMonth: data.freezesUsed,
    freezesRemaining,
    lastFreezeDate: data.lastFreezeDate,
    nextResetDate: getNextMonthStart(),
  };
}

/**
 * Helper: Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Helper: Get start of current month in YYYY-MM format
 */
function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Helper: Get start of next month
 */
function getNextMonthStart(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split("T")[0];
}

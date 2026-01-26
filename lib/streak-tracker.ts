import AsyncStorage from "@react-native-async-storage/async-storage";

export type StreakType = 
  | "sleep"
  | "meditation"
  | "nutrition"
  | "workout"
  | "journal"
  | "tasks";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string; // ISO date string
  totalLogs: number;
}

const STREAK_STORAGE_KEY = "@energy_today_streaks";

/**
 * Get streak data for a specific type
 */
export async function getStreak(type: StreakType): Promise<StreakData> {
  try {
    const allStreaks = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    const streaks = allStreaks ? JSON.parse(allStreaks) : {};
    
    return streaks[type] || {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: "",
      totalLogs: 0,
    };
  } catch (error) {
    console.error("Error getting streak:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: "",
      totalLogs: 0,
    };
  }
}

/**
 * Update streak when user logs an activity
 */
export async function updateStreak(type: StreakType): Promise<StreakData> {
  try {
    const allStreaks = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    const streaks = allStreaks ? JSON.parse(allStreaks) : {};
    
    const currentData: StreakData = streaks[type] || {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: "",
      totalLogs: 0,
    };
    
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastLog = currentData.lastLogDate;
    
    // Check if already logged today
    if (lastLog === today) {
      return currentData; // No change
    }
    
    // Check if logged yesterday (streak continues)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    let newStreak: number;
    if (lastLog === yesterdayStr) {
      // Streak continues
      newStreak = currentData.currentStreak + 1;
    } else if (lastLog === "") {
      // First log
      newStreak = 1;
    } else {
      // Streak broken, start over
      newStreak = 1;
    }
    
    const newData: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentData.longestStreak),
      lastLogDate: today,
      totalLogs: currentData.totalLogs + 1,
    };
    
    streaks[type] = newData;
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streaks));
    
    return newData;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

/**
 * Get all streaks
 */
export async function getAllStreaks(): Promise<Record<StreakType, StreakData>> {
  try {
    const allStreaks = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    return allStreaks ? JSON.parse(allStreaks) : {};
  } catch (error) {
    console.error("Error getting all streaks:", error);
    return {} as Record<StreakType, StreakData>;
  }
}

/**
 * Check if streak milestone reached (7, 14, 30, 60, 90, 365 days)
 */
export function isStreakMilestone(streak: number): boolean {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  return milestones.includes(streak);
}

/**
 * Get next milestone for a streak
 */
export function getNextMilestone(streak: number): number {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  return milestones.find((m) => m > streak) || 365;
}

/**
 * Get streak emoji based on count
 */
export function getStreakEmoji(streak: number): string {
  if (streak === 0) return "⚪";
  if (streak < 7) return "🔥";
  if (streak < 30) return "🔥🔥";
  if (streak < 90) return "🔥🔥🔥";
  return "🔥🔥🔥🔥";
}

/**
 * Get streak message
 */
export function getStreakMessage(streak: number, type: StreakType): string {
  if (streak === 0) {
    return `Start your ${type} streak today!`;
  }
  
  const typeNames: Record<StreakType, string> = {
    sleep: "sleep tracking",
    meditation: "meditation",
    nutrition: "meal logging",
    workout: "workout",
    journal: "journaling",
    tasks: "task completion",
  };
  
  if (streak === 1) {
    return `Great start! Keep going with ${typeNames[type]}`;
  }
  
  if (streak < 7) {
    return `${streak} days of ${typeNames[type]}! Keep it up!`;
  }
  
  if (streak === 7) {
    return `🎉 One week streak! You're building a habit!`;
  }
  
  if (streak < 30) {
    return `${streak} days strong! Don't break the chain!`;
  }
  
  if (streak === 30) {
    return `🎉 30-day streak! This is a real habit now!`;
  }
  
  if (streak < 90) {
    return `${streak} days! You're unstoppable!`;
  }
  
  if (streak === 90) {
    return `🎉 90 days! You're a ${typeNames[type]} master!`;
  }
  
  return `${streak} days! Legendary streak! 🏆`;
}

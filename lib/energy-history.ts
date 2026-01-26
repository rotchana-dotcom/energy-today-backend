import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export interface EnergyHistoryEntry {
  date: string; // ISO date
  userEnergyScore: number;
  environmentalEnergyScore: number;
  alignment: "strong" | "moderate" | "challenging";
}

const STORAGE_KEY = "@energy_today_energy_history";

/**
 * Save energy history to storage
 */
async function saveHistory(history: EnergyHistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Load energy history from storage
 */
export async function getEnergyHistory(): Promise<EnergyHistoryEntry[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Record today's energy score
 */
export async function recordTodayEnergy(profile: UserProfile): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().split("T")[0];
  
  const history = await getEnergyHistory();
  
  // Check if today is already recorded
  const existingIndex = history.findIndex(entry => entry.date.startsWith(todayISO));
  
  const energy = calculateDailyEnergy(profile, today);
  
  const entry: EnergyHistoryEntry = {
    date: today.toISOString(),
    userEnergyScore: energy.userEnergy.intensity,
    environmentalEnergyScore: energy.environmentalEnergy.intensity,
    alignment: energy.connection.alignment,
  };
  
  if (existingIndex >= 0) {
    // Update existing entry
    history[existingIndex] = entry;
  } else {
    // Add new entry
    history.push(entry);
  }
  
  // Keep only last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const filtered = history.filter(entry => new Date(entry.date) >= ninetyDaysAgo);
  
  // Sort by date
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  await saveHistory(filtered);
}

/**
 * Get energy history for the last N days
 */
export async function getRecentEnergyHistory(days: number = 30): Promise<EnergyHistoryEntry[]> {
  const history = await getEnergyHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return history.filter(entry => new Date(entry.date) >= cutoffDate);
}

/**
 * Get energy trend analysis
 */
export async function getEnergyTrend(days: number = 30): Promise<{
  averageUserEnergy: number;
  averageEnvironmentalEnergy: number;
  trend: "improving" | "stable" | "declining";
  strongDays: number;
  moderateDays: number;
  challengingDays: number;
}> {
  const history = await getRecentEnergyHistory(days);
  
  if (history.length === 0) {
    return {
      averageUserEnergy: 0,
      averageEnvironmentalEnergy: 0,
      trend: "stable",
      strongDays: 0,
      moderateDays: 0,
      challengingDays: 0,
    };
  }
  
  const avgUser =
    history.reduce((sum, entry) => sum + entry.userEnergyScore, 0) / history.length;
  const avgEnv =
    history.reduce((sum, entry) => sum + entry.environmentalEnergyScore, 0) / history.length;
  
  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(history.length / 2);
  const firstHalfAvg =
    history
      .slice(0, midpoint)
      .reduce((sum, entry) => sum + entry.userEnergyScore, 0) / midpoint;
  const secondHalfAvg =
    history
      .slice(midpoint)
      .reduce((sum, entry) => sum + entry.userEnergyScore, 0) /
    (history.length - midpoint);
  
  let trend: "improving" | "stable" | "declining" = "stable";
  const diff = secondHalfAvg - firstHalfAvg;
  if (diff > 5) {
    trend = "improving";
  } else if (diff < -5) {
    trend = "declining";
  }
  
  // Count alignment days
  const strongDays = history.filter(e => e.alignment === "strong").length;
  const moderateDays = history.filter(e => e.alignment === "moderate").length;
  const challengingDays = history.filter(e => e.alignment === "challenging").length;
  
  return {
    averageUserEnergy: avgUser,
    averageEnvironmentalEnergy: avgEnv,
    trend,
    strongDays,
    moderateDays,
    challengingDays,
  };
}

/**
 * Fill missing days with calculated energy (for chart display)
 */
export async function getCompleteEnergyHistory(
  profile: UserProfile,
  days: number = 30
): Promise<EnergyHistoryEntry[]> {
  const history = await getRecentEnergyHistory(days);
  const complete: EnergyHistoryEntry[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateISO = date.toISOString().split("T")[0];
    
    // Check if we have a recorded entry for this date
    const existing = history.find(entry => entry.date.startsWith(dateISO));
    
    if (existing) {
      complete.push(existing);
    } else {
      // Calculate energy for this date
      const energy = calculateDailyEnergy(profile, date);
      complete.push({
        date: date.toISOString(),
        userEnergyScore: energy.userEnergy.intensity,
        environmentalEnergyScore: energy.environmentalEnergy.intensity,
        alignment: energy.connection.alignment,
      });
    }
  }
  
  return complete;
}

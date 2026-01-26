/**
 * Apple Watch Data Sync
 * 
 * Sync today's energy data to Apple Watch for complications and glances
 * Note: Requires expo-watch-connectivity or similar package for actual Watch communication
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./storage";
import { calculateDailyEnergy } from "./energy-engine";
import { DailyEnergy } from "@/types";

const WATCH_DATA_KEY = "@energy_today:watch_data";

export interface WatchData {
  date: string;
  energyScore: number;
  energyType: string;
  alignment: "strong" | "moderate" | "challenging";
  alignmentColor: string;
  bestActivity: string;
  lastUpdated: string;
}

/**
 * Get simplified energy data for Watch display
 */
export async function getWatchData(): Promise<WatchData | null> {
  try {
    const data = await AsyncStorage.getItem(WATCH_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting watch data:", error);
    return null;
  }
}

/**
 * Update Watch data with today's energy
 */
export async function updateWatchData(): Promise<WatchData | null> {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return null;
    }

    const today = new Date();
    const energy = calculateDailyEnergy(profile, today);

    // Determine best activity based on energy type and alignment
    const bestActivity = getBestActivityRecommendation(energy);

    const watchData: WatchData = {
      date: today.toISOString().split("T")[0],
      energyScore: energy.userEnergy.intensity,
      energyType: energy.userEnergy.type,
      alignment: energy.connection.alignment,
      alignmentColor: energy.connection.color,
      bestActivity,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem(WATCH_DATA_KEY, JSON.stringify(watchData));
    
    // TODO: Send to Apple Watch via watch connectivity
    // await sendToWatch(watchData);

    return watchData;
  } catch (error) {
    console.error("Error updating watch data:", error);
    return null;
  }
}

/**
 * Get best activity recommendation based on energy
 */
function getBestActivityRecommendation(energy: DailyEnergy): string {
  const { userEnergy, connection } = energy;
  const score = userEnergy.intensity;
  const alignment = connection.alignment;

  if (score >= 80 && alignment === "strong") {
    return "Important meetings, launches, big decisions";
  } else if (score >= 60 && alignment === "strong") {
    return "Creative work, presentations, negotiations";
  } else if (score >= 60 && alignment === "moderate") {
    return "Routine tasks, planning, team collaboration";
  } else if (score >= 40) {
    return "Learning, research, light planning";
  } else {
    return "Rest, reflection, self-care";
  }
}

/**
 * Format energy score for Watch complication
 */
export function formatScoreForWatch(score: number): string {
  if (score >= 80) return "⚡⚡⚡";
  if (score >= 60) return "⚡⚡";
  if (score >= 40) return "⚡";
  return "💤";
}

/**
 * Get alignment emoji for Watch display
 */
export function getAlignmentEmoji(alignment: "strong" | "moderate" | "challenging"): string {
  switch (alignment) {
    case "strong":
      return "🟢";
    case "moderate":
      return "🟡";
    case "challenging":
      return "🔴";
  }
}

/**
 * Schedule automatic Watch data updates
 * Call this on app launch and when energy data changes
 */
export async function scheduleWatchDataUpdates(): Promise<void> {
  // Update immediately
  await updateWatchData();

  // TODO: Set up background task to update Watch data every hour
  // This requires expo-background-fetch or similar
}

/**
 * Sleep Tracking Integration
 * 
 * Import and analyze sleep data correlation with energy
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "@energy_today:sleep_data";

export interface SleepData {
  date: string; // YYYY-MM-DD
  bedTime: string; // ISO timestamp
  wakeTime: string; // ISO timestamp
  duration: number; // minutes
  quality: "poor" | "fair" | "good" | "excellent";
  deepSleep: number; // minutes
  remSleep: number; // minutes
  lightSleep: number; // minutes
  awakeTime: number; // minutes
  source: "manual" | "apple_health" | "google_fit" | "device";
}

export interface SleepCorrelation {
  averageSleepDuration: number;
  averageEnergyLevel: number;
  correlation: number; // -1 to 1
  strength: "weak" | "moderate" | "strong";
  insights: string[];
  recommendations: string[];
  optimalSleepDuration: number;
}

/**
 * Get all sleep data
 */
export async function getSleepData(): Promise<SleepData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get sleep data:", error);
  }
  return [];
}

/**
 * Add sleep data entry
 */
export async function addSleepData(entry: SleepData): Promise<void> {
  try {
    const data = await getSleepData();
    // Replace if entry for same date exists
    const filtered = data.filter((d) => d.date !== entry.date);
    filtered.push(entry);
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to add sleep data:", error);
    throw error;
  }
}

/**
 * Get sleep data for date range
 */
export async function getSleepDataRange(
  startDate: string,
  endDate: string
): Promise<SleepData[]> {
  const data = await getSleepData();
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

/**
 * Calculate sleep quality score (0-100)
 */
export function calculateSleepScore(sleep: SleepData): number {
  let score = 0;

  // Duration score (40 points)
  const idealDuration = 480; // 8 hours
  const durationDiff = Math.abs(sleep.duration - idealDuration);
  const durationScore = Math.max(0, 40 - (durationDiff / 60) * 5);
  score += durationScore;

  // Quality score (30 points)
  const qualityScores = { poor: 5, fair: 15, good: 25, excellent: 30 };
  score += qualityScores[sleep.quality];

  // Deep sleep score (20 points)
  const deepSleepPercent = (sleep.deepSleep / sleep.duration) * 100;
  const deepSleepScore = Math.min(20, (deepSleepPercent / 25) * 20);
  score += deepSleepScore;

  // Awake time score (10 points)
  const awakePercent = (sleep.awakeTime / sleep.duration) * 100;
  const awakeScore = Math.max(0, 10 - awakePercent);
  score += awakeScore;

  return Math.round(score);
}

/**
 * Analyze sleep-energy correlation
 */
export async function analyzeSleepCorrelation(
  energyData: { date: string; energy: number }[]
): Promise<SleepCorrelation> {
  const sleepData = await getSleepData();

  // Match sleep data with energy data
  const matched: { sleep: SleepData; energy: number }[] = [];
  for (const energy of energyData) {
    const sleep = sleepData.find((s) => s.date === energy.date);
    if (sleep) {
      matched.push({ sleep, energy: energy.energy });
    }
  }

  if (matched.length === 0) {
    return {
      averageSleepDuration: 0,
      averageEnergyLevel: 0,
      correlation: 0,
      strength: "weak",
      insights: ["Not enough data to analyze sleep-energy correlation"],
      recommendations: ["Track your sleep for at least 7 days to see insights"],
      optimalSleepDuration: 480,
    };
  }

  // Calculate averages
  const avgSleep = matched.reduce((sum, m) => sum + m.sleep.duration, 0) / matched.length;
  const avgEnergy = matched.reduce((sum, m) => sum + m.energy, 0) / matched.length;

  // Calculate correlation coefficient
  const sleepMean = avgSleep;
  const energyMean = avgEnergy;

  let numerator = 0;
  let sleepVariance = 0;
  let energyVariance = 0;

  for (const m of matched) {
    const sleepDiff = m.sleep.duration - sleepMean;
    const energyDiff = m.energy - energyMean;
    numerator += sleepDiff * energyDiff;
    sleepVariance += sleepDiff * sleepDiff;
    energyVariance += energyDiff * energyDiff;
  }

  const correlation =
    sleepVariance === 0 || energyVariance === 0
      ? 0
      : numerator / Math.sqrt(sleepVariance * energyVariance);

  // Determine strength
  const absCorr = Math.abs(correlation);
  const strength = absCorr > 0.5 ? "strong" : absCorr > 0.3 ? "moderate" : "weak";

  // Find optimal sleep duration
  const grouped: { [duration: number]: number[] } = {};
  for (const m of matched) {
    const bucket = Math.floor(m.sleep.duration / 30) * 30;
    if (!grouped[bucket]) grouped[bucket] = [];
    grouped[bucket].push(m.energy);
  }

  let optimalDuration = 480;
  let maxAvgEnergy = 0;
  for (const [duration, energies] of Object.entries(grouped)) {
    const avg = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    if (avg > maxAvgEnergy) {
      maxAvgEnergy = avg;
      optimalDuration = parseInt(duration);
    }
  }

  // Generate insights
  const insights: string[] = [];
  if (correlation > 0.3) {
    insights.push("Better sleep quality correlates with higher energy levels");
  }
  if (avgSleep < 420) {
    insights.push("You're averaging less than 7 hours of sleep per night");
  } else if (avgSleep > 540) {
    insights.push("You're averaging more than 9 hours of sleep per night");
  }

  const avgQuality = matched.reduce((sum, m) => {
    const scores = { poor: 1, fair: 2, good: 3, excellent: 4 };
    return sum + scores[m.sleep.quality];
  }, 0) / matched.length;

  if (avgQuality < 2.5) {
    insights.push("Your sleep quality could be improved");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (optimalDuration > avgSleep + 30) {
    recommendations.push(
      `Try sleeping ${Math.round((optimalDuration - avgSleep) / 60)} more hours per night`
    );
  } else if (optimalDuration < avgSleep - 30) {
    recommendations.push(
      `You might benefit from ${Math.round((avgSleep - optimalDuration) / 60)} fewer hours of sleep`
    );
  }

  if (avgQuality < 2.5) {
    recommendations.push("Focus on improving sleep quality with a consistent bedtime routine");
  }

  if (correlation > 0.3) {
    recommendations.push("Maintain your current sleep schedule for consistent energy levels");
  }

  return {
    averageSleepDuration: Math.round(avgSleep),
    averageEnergyLevel: Math.round(avgEnergy),
    correlation: Math.round(correlation * 100) / 100,
    strength,
    insights,
    recommendations,
    optimalSleepDuration: optimalDuration,
  };
}

/**
 * Import sleep data from health platform (simulated)
 */
export async function importSleepFromHealth(days: number = 7): Promise<number> {
  // In production, this would use expo-health or similar
  // For now, generate realistic synthetic data

  const data: SleepData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate realistic sleep data
    const bedHour = 22 + Math.floor(Math.random() * 3);
    const wakeHour = 6 + Math.floor(Math.random() * 3);
    const duration = (wakeHour + 24 - bedHour) * 60 + Math.floor(Math.random() * 30);

    const bedTime = new Date(date);
    bedTime.setHours(bedHour, Math.floor(Math.random() * 60), 0, 0);

    const wakeTime = new Date(date);
    wakeTime.setDate(wakeTime.getDate() + 1);
    wakeTime.setHours(wakeHour, Math.floor(Math.random() * 60), 0, 0);

    const qualities: Array<"poor" | "fair" | "good" | "excellent"> = [
      "poor",
      "fair",
      "good",
      "excellent",
    ];
    const quality = qualities[Math.floor(Math.random() * qualities.length)];

    const deepSleep = Math.floor(duration * (0.15 + Math.random() * 0.1));
    const remSleep = Math.floor(duration * (0.2 + Math.random() * 0.1));
    const awakeTime = Math.floor(duration * (0.05 + Math.random() * 0.05));
    const lightSleep = duration - deepSleep - remSleep - awakeTime;

    data.push({
      date: dateStr,
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      duration,
      quality,
      deepSleep,
      remSleep,
      lightSleep,
      awakeTime,
      source: Platform.OS === "ios" ? "apple_health" : "google_fit",
    });
  }

  // Save imported data
  for (const entry of data) {
    await addSleepData(entry);
  }

  return data.length;
}

/**
 * Get sleep statistics
 */
export async function getSleepStats(days: number = 30): Promise<{
  totalNights: number;
  averageDuration: number;
  averageQuality: number;
  bestNight: SleepData | null;
  worstNight: SleepData | null;
}> {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const data = await getSleepDataRange(startDateStr, endDate);

  if (data.length === 0) {
    return {
      totalNights: 0,
      averageDuration: 0,
      averageQuality: 0,
      bestNight: null,
      worstNight: null,
    };
  }

  const avgDuration = data.reduce((sum, d) => sum + d.duration, 0) / data.length;

  const qualityScores = { poor: 1, fair: 2, good: 3, excellent: 4 };
  const avgQuality =
    data.reduce((sum, d) => sum + qualityScores[d.quality], 0) / data.length;

  const scored = data.map((d) => ({ data: d, score: calculateSleepScore(d) }));
  scored.sort((a, b) => b.score - a.score);

  return {
    totalNights: data.length,
    averageDuration: Math.round(avgDuration),
    averageQuality: Math.round(avgQuality * 100) / 100,
    bestNight: scored[0]?.data || null,
    worstNight: scored[scored.length - 1]?.data || null,
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveSleepData, type SleepData } from "@/app/services/correlation-engine";

export interface SleepSession {
  id: string;
  sleepTime: string; // ISO date string
  wakeTime: string; // ISO date string
  duration: number; // in hours
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  dream?: string;
  dreamMood?: "positive" | "neutral" | "negative" | "nightmare";
  notes?: string;
  nextDayEnergy?: number; // 0-100
  createdAt: string;
}

export interface SleepStats {
  totalSessions: number;
  averageDuration: number;
  averageQuality: number;
  optimalDuration: number;
  bestBedtime: string;
  energyCorrelation: {
    sleepDuration: number;
    energyLevel: number;
  }[];
}

const STORAGE_KEY = "sleep_sessions";

/**
 * Save a sleep session
 */
export async function saveSleepSession(session: SleepSession): Promise<void> {
  try {
    const sessions = await getSleepSessions();
    sessions.push(session);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    
    // Also save to correlation engine
    const sleepDate = new Date(session.sleepTime);
    const dateStr = sleepDate.toISOString().split('T')[0];
    const qualityMap = { 1: "poor", 2: "fair", 3: "fair", 4: "good", 5: "excellent" } as const;
    
    const correlationData: SleepData = {
      date: dateStr,
      hours: session.duration,
      quality: qualityMap[session.quality],
      dreams: session.dream,
      notes: session.notes,
    };
    
    await saveSleepData(correlationData);
  } catch (error) {
    console.error("Failed to save sleep session:", error);
    throw error;
  }
}

/**
 * Get all sleep sessions
 */
export async function getSleepSessions(): Promise<SleepSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get sleep sessions:", error);
    return [];
  }
}

/**
 * Get sleep sessions for a date range
 */
export async function getSleepSessionsForRange(
  startDate: Date,
  endDate: Date
): Promise<SleepSession[]> {
  const sessions = await getSleepSessions();
  return sessions.filter((session) => {
    const sessionDate = new Date(session.sleepTime);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

/**
 * Update a sleep session with next-day energy
 */
export async function updateSleepSessionEnergy(
  sessionId: string,
  energyLevel: number
): Promise<void> {
  try {
    const sessions = await getSleepSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index].nextDayEnergy = energyLevel;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error("Failed to update sleep session energy:", error);
    throw error;
  }
}

/**
 * Delete a sleep session
 */
export async function deleteSleepSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getSleepSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete sleep session:", error);
    throw error;
  }
}

/**
 * Calculate sleep statistics
 */
export async function getSleepStats(): Promise<SleepStats> {
  const sessions = await getSleepSessions();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageDuration: 0,
      averageQuality: 0,
      optimalDuration: 8,
      bestBedtime: "22:00",
      energyCorrelation: [],
    };
  }

  // Calculate averages
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageDuration = totalDuration / sessions.length;

  const totalQuality = sessions.reduce((sum, s) => sum + s.quality, 0);
  const averageQuality = totalQuality / sessions.length;

  // Find optimal duration (duration with highest average next-day energy)
  const durationGroups: { [key: number]: { totalEnergy: number; count: number } } = {};
  sessions.forEach((session) => {
    if (session.nextDayEnergy !== undefined) {
      const roundedDuration = Math.round(session.duration);
      if (!durationGroups[roundedDuration]) {
        durationGroups[roundedDuration] = { totalEnergy: 0, count: 0 };
      }
      durationGroups[roundedDuration].totalEnergy += session.nextDayEnergy;
      durationGroups[roundedDuration].count += 1;
    }
  });

  let optimalDuration = 8;
  let highestAvgEnergy = 0;
  Object.entries(durationGroups).forEach(([duration, data]) => {
    const avgEnergy = data.totalEnergy / data.count;
    if (avgEnergy > highestAvgEnergy) {
      highestAvgEnergy = avgEnergy;
      optimalDuration = parseInt(duration);
    }
  });

  // Find best bedtime (bedtime with highest average next-day energy)
  const bedtimeGroups: { [key: string]: { totalEnergy: number; count: number } } = {};
  sessions.forEach((session) => {
    if (session.nextDayEnergy !== undefined) {
      const bedtime = new Date(session.sleepTime);
      const hour = bedtime.getHours();
      const hourKey = `${hour.toString().padStart(2, "0")}:00`;
      if (!bedtimeGroups[hourKey]) {
        bedtimeGroups[hourKey] = { totalEnergy: 0, count: 0 };
      }
      bedtimeGroups[hourKey].totalEnergy += session.nextDayEnergy;
      bedtimeGroups[hourKey].count += 1;
    }
  });

  let bestBedtime = "22:00";
  let highestBedtimeEnergy = 0;
  Object.entries(bedtimeGroups).forEach(([time, data]) => {
    const avgEnergy = data.totalEnergy / data.count;
    if (avgEnergy > highestBedtimeEnergy) {
      highestBedtimeEnergy = avgEnergy;
      bestBedtime = time;
    }
  });

  // Energy correlation data
  const energyCorrelation = sessions
    .filter((s) => s.nextDayEnergy !== undefined)
    .map((s) => ({
      sleepDuration: s.duration,
      energyLevel: s.nextDayEnergy!,
    }));

  return {
    totalSessions: sessions.length,
    averageDuration: Math.round(averageDuration * 10) / 10,
    averageQuality: Math.round(averageQuality * 10) / 10,
    optimalDuration,
    bestBedtime,
    energyCorrelation,
  };
}

/**
 * Get sleep insights
 */
export async function getSleepInsights(): Promise<string[]> {
  const stats = await getSleepStats();
  const insights: string[] = [];

  if (stats.totalSessions === 0) {
    insights.push("Start tracking your sleep to discover personalized insights");
    return insights;
  }

  // Duration insights
  if (stats.averageDuration < 6) {
    insights.push(
      `You're averaging ${stats.averageDuration}h of sleep - aim for ${stats.optimalDuration}h for optimal energy`
    );
  } else if (stats.averageDuration < 7) {
    insights.push(
      `Your average ${stats.averageDuration}h is below recommended - try adding 1 more hour`
    );
  } else if (stats.averageDuration > 9) {
    insights.push(
      `You're sleeping ${stats.averageDuration}h on average - consider if oversleeping affects your energy`
    );
  } else {
    insights.push(`Your ${stats.averageDuration}h average sleep duration is healthy`);
  }

  // Quality insights
  if (stats.averageQuality < 3) {
    insights.push(
      `Sleep quality is ${stats.averageQuality}/5 - consider improving sleep environment or routine`
    );
  } else if (stats.averageQuality >= 4) {
    insights.push(`Excellent sleep quality at ${stats.averageQuality}/5 - keep it up!`);
  }

  // Optimal duration insight
  if (stats.optimalDuration !== Math.round(stats.averageDuration)) {
    insights.push(
      `Your data shows ${stats.optimalDuration}h gives you the best next-day energy`
    );
  }

  // Bedtime insight
  const bedtimeHour = parseInt(stats.bestBedtime.split(":")[0]);
  if (bedtimeHour >= 23 || bedtimeHour <= 3) {
    insights.push(
      `Your best energy comes from sleeping at ${stats.bestBedtime} - but earlier might be healthier`
    );
  } else {
    insights.push(`Sleeping at ${stats.bestBedtime} gives you the best next-day energy`);
  }

  // Energy correlation insight
  if (stats.energyCorrelation.length >= 5) {
    const correlation = calculateCorrelation(
      stats.energyCorrelation.map((c) => c.sleepDuration),
      stats.energyCorrelation.map((c) => c.energyLevel)
    );

    if (correlation > 0.5) {
      insights.push("Strong positive correlation: more sleep = more energy for you");
    } else if (correlation < -0.3) {
      insights.push("Your energy might be affected by sleep quality more than duration");
    }
  }

  return insights;
}

/**
 * Calculate correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Get recent sleep sessions (last N days)
 */
export async function getRecentSleepSessions(days: number = 7): Promise<SleepSession[]> {
  const sessions = await getSleepSessions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return sessions
    .filter((session) => new Date(session.sleepTime) >= cutoffDate)
    .sort((a, b) => new Date(b.sleepTime).getTime() - new Date(a.sleepTime).getTime());
}

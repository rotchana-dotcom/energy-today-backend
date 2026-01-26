import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export type RecurrencePattern = "weekly" | "monthly";

export interface RecurringActivity {
  id: string;
  name: string;
  pattern: RecurrencePattern;
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  createdAt: string;
  history: ActivityOccurrence[];
}

export interface ActivityOccurrence {
  date: string; // ISO date
  energyAlignment: "strong" | "moderate" | "challenging";
  energyScore: number;
  actualOutcome?: "great" | "good" | "okay" | "poor";
  notes?: string;
}

export interface RecurringActivityInsight {
  activity: RecurringActivity;
  averageEnergyScore: number;
  bestAlignment: "strong" | "moderate" | "challenging";
  successRate: number; // % of occurrences with great/good outcomes
  recommendation: string;
}

const STORAGE_KEY = "@energy_today_recurring_activities";

/**
 * Save recurring activities to storage
 */
async function saveActivities(activities: RecurringActivity[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

/**
 * Load recurring activities from storage
 */
export async function getRecurringActivities(): Promise<RecurringActivity[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Create a new recurring activity
 */
export async function createRecurringActivity(
  name: string,
  pattern: RecurrencePattern,
  dayOfWeek?: number,
  dayOfMonth?: number
): Promise<RecurringActivity> {
  const activities = await getRecurringActivities();
  
  const newActivity: RecurringActivity = {
    id: Date.now().toString(),
    name,
    pattern,
    dayOfWeek,
    dayOfMonth,
    createdAt: new Date().toISOString(),
    history: [],
  };
  
  activities.push(newActivity);
  await saveActivities(activities);
  
  return newActivity;
}

/**
 * Record an occurrence of a recurring activity
 */
export async function recordActivityOccurrence(
  activityId: string,
  profile: UserProfile,
  date: Date,
  actualOutcome?: "great" | "good" | "okay" | "poor",
  notes?: string
): Promise<void> {
  const activities = await getRecurringActivities();
  const activity = activities.find(a => a.id === activityId);
  
  if (!activity) return;
  
  const energy = calculateDailyEnergy(profile, date);
  
  const occurrence: ActivityOccurrence = {
    date: date.toISOString(),
    energyAlignment: energy.connection.alignment,
    energyScore: energy.userEnergy.intensity,
    actualOutcome,
    notes,
  };
  
  activity.history.push(occurrence);
  await saveActivities(activities);
}

/**
 * Get upcoming occurrences for a recurring activity
 */
export function getUpcomingOccurrences(
  activity: RecurringActivity,
  daysAhead: number = 30
): Date[] {
  const occurrences: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    if (activity.pattern === "weekly" && activity.dayOfWeek !== undefined) {
      if (date.getDay() === activity.dayOfWeek) {
        occurrences.push(date);
      }
    } else if (activity.pattern === "monthly" && activity.dayOfMonth !== undefined) {
      if (date.getDate() === activity.dayOfMonth) {
        occurrences.push(date);
      }
    }
  }
  
  return occurrences;
}

/**
 * Analyze recurring activity patterns and generate insights
 */
export async function analyzeRecurringActivity(
  activity: RecurringActivity
): Promise<RecurringActivityInsight> {
  if (activity.history.length === 0) {
    return {
      activity,
      averageEnergyScore: 0,
      bestAlignment: "moderate",
      successRate: 0,
      recommendation: "No data yet. Complete this activity a few times to see patterns.",
    };
  }
  
  const avgScore =
    activity.history.reduce((sum, occ) => sum + occ.energyScore, 0) /
    activity.history.length;
  
  // Count alignment occurrences
  const alignmentCounts = {
    strong: activity.history.filter(o => o.energyAlignment === "strong").length,
    moderate: activity.history.filter(o => o.energyAlignment === "moderate").length,
    challenging: activity.history.filter(o => o.energyAlignment === "challenging").length,
  };
  
  const bestAlignment =
    alignmentCounts.strong >= alignmentCounts.moderate &&
    alignmentCounts.strong >= alignmentCounts.challenging
      ? "strong"
      : alignmentCounts.moderate >= alignmentCounts.challenging
      ? "moderate"
      : "challenging";
  
  // Calculate success rate
  const withOutcomes = activity.history.filter(o => o.actualOutcome);
  const successCount = withOutcomes.filter(
    o => o.actualOutcome === "great" || o.actualOutcome === "good"
  ).length;
  const successRate =
    withOutcomes.length > 0 ? (successCount / withOutcomes.length) * 100 : 0;
  
  // Generate recommendation
  let recommendation = "";
  if (bestAlignment === "strong") {
    recommendation = `This activity consistently occurs on strong energy days (${alignmentCounts.strong}/${activity.history.length}). Keep the current schedule!`;
  } else if (bestAlignment === "moderate") {
    recommendation = `This activity usually falls on moderate energy days. Consider shifting to a day with stronger alignment for better results.`;
  } else {
    recommendation = `This activity often occurs on challenging energy days (${alignmentCounts.challenging}/${activity.history.length}). Strongly recommend rescheduling to improve outcomes.`;
  }
  
  if (successRate > 0) {
    recommendation += ` Success rate: ${successRate.toFixed(0)}%.`;
  }
  
  return {
    activity,
    averageEnergyScore: avgScore,
    bestAlignment,
    successRate,
    recommendation,
  };
}

/**
 * Get all recurring activity insights
 */
export async function getAllRecurringInsights(): Promise<RecurringActivityInsight[]> {
  const activities = await getRecurringActivities();
  const insights = await Promise.all(
    activities.map(activity => analyzeRecurringActivity(activity))
  );
  return insights;
}

/**
 * Delete a recurring activity
 */
export async function deleteRecurringActivity(activityId: string): Promise<void> {
  const activities = await getRecurringActivities();
  const filtered = activities.filter(a => a.id !== activityId);
  await saveActivities(filtered);
}

import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVITY_HISTORY_KEY = "@energy_today:activity_history";

export interface ActivityHistoryEntry {
  id: string;
  activity: string;
  scheduledDate: string; // ISO date string
  predictedAlignment: "strong" | "moderate" | "challenging";
  predictedBestTime: "morning" | "afternoon" | "evening";
  actualOutcome?: "great" | "good" | "okay" | "difficult";
  actualNotes?: string;
  completedAt?: string; // ISO date string
  createdAt: string;
}

/**
 * Save a scheduled activity to history
 */
export async function saveActivityToHistory(
  activity: string,
  scheduledDate: Date,
  predictedAlignment: "strong" | "moderate" | "challenging",
  predictedBestTime: "morning" | "afternoon" | "evening"
): Promise<void> {
  const entry: ActivityHistoryEntry = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    activity,
    scheduledDate: scheduledDate.toISOString(),
    predictedAlignment,
    predictedBestTime,
    createdAt: new Date().toISOString(),
  };

  const history = await getActivityHistory();
  history.unshift(entry); // Add to beginning
  await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Update activity with actual outcome
 */
export async function updateActivityOutcome(
  id: string,
  outcome: "great" | "good" | "okay" | "difficult",
  notes?: string
): Promise<void> {
  const history = await getActivityHistory();
  const index = history.findIndex((entry) => entry.id === id);

  if (index !== -1) {
    history[index].actualOutcome = outcome;
    history[index].actualNotes = notes;
    history[index].completedAt = new Date().toISOString();
    await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
  }
}

/**
 * Get all activity history
 */
export async function getActivityHistory(): Promise<ActivityHistoryEntry[]> {
  const data = await AsyncStorage.getItem(ACTIVITY_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get activity history for a specific date range
 */
export async function getActivityHistoryByDateRange(
  startDate: Date,
  endDate: Date
): Promise<ActivityHistoryEntry[]> {
  const history = await getActivityHistory();
  return history.filter((entry) => {
    const entryDate = new Date(entry.scheduledDate);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Get upcoming scheduled activities (not yet completed)
 */
export async function getUpcomingActivities(): Promise<ActivityHistoryEntry[]> {
  const history = await getActivityHistory();
  const now = new Date();
  
  return history.filter((entry) => {
    const scheduledDate = new Date(entry.scheduledDate);
    return scheduledDate >= now && !entry.completedAt;
  });
}

/**
 * Get past completed activities
 */
export async function getCompletedActivities(): Promise<ActivityHistoryEntry[]> {
  const history = await getActivityHistory();
  return history.filter((entry) => entry.completedAt);
}

/**
 * Calculate prediction accuracy
 */
export async function calculatePredictionAccuracy(): Promise<{
  totalCompleted: number;
  accurate: number;
  accuracyRate: number;
}> {
  const completed = await getCompletedActivities();
  
  if (completed.length === 0) {
    return { totalCompleted: 0, accurate: 0, accuracyRate: 0 };
  }

  // Count accurate predictions
  const accurate = completed.filter((entry) => {
    if (!entry.actualOutcome) return false;

    // Strong alignment should result in "great" or "good"
    if (entry.predictedAlignment === "strong") {
      return entry.actualOutcome === "great" || entry.actualOutcome === "good";
    }
    
    // Moderate alignment should result in "good" or "okay"
    if (entry.predictedAlignment === "moderate") {
      return entry.actualOutcome === "good" || entry.actualOutcome === "okay";
    }
    
    // Challenging alignment might still be "okay" or better
    if (entry.predictedAlignment === "challenging") {
      return entry.actualOutcome !== "difficult";
    }

    return false;
  }).length;

  return {
    totalCompleted: completed.length,
    accurate,
    accuracyRate: Math.round((accurate / completed.length) * 100),
  };
}

/**
 * Get activity suggestions based on historical success
 */
export async function getActivitySuggestions(
  currentAlignment: "strong" | "moderate" | "challenging"
): Promise<string[]> {
  const completed = await getCompletedActivities();
  
  // Find activities that went well on similar alignment days
  const successfulActivities = completed
    .filter((entry) => {
      return (
        entry.predictedAlignment === currentAlignment &&
        (entry.actualOutcome === "great" || entry.actualOutcome === "good")
      );
    })
    .map((entry) => entry.activity);

  // Remove duplicates and return top 3
  const unique = Array.from(new Set(successfulActivities));
  return unique.slice(0, 3);
}

/**
 * Delete old activity history (older than 90 days)
 */
export async function cleanupOldActivityHistory(): Promise<void> {
  const history = await getActivityHistory();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentHistory = history.filter((entry) => {
    const entryDate = new Date(entry.scheduledDate);
    return entryDate >= ninetyDaysAgo;
  });

  await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(recentHistory));
}

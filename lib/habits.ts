import AsyncStorage from "@react-native-async-storage/async-storage";
import { isProUser } from "./storage";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

const HABITS_KEY = "@energy_today_habits";
const HABIT_LOGS_KEY = "@energy_today_habit_logs";

export interface Habit {
  id: string;
  name: string;
  category: "health" | "productivity" | "mindfulness" | "social" | "other";
  icon: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

export interface HabitCorrelation {
  habitId: string;
  habitName: string;
  totalLogs: number;
  averageEnergyWhenDone: number;
  averageEnergyWhenSkipped: number;
  impact: "positive" | "negative" | "neutral";
  impactScore: number; // Difference in energy
  recommendation: string;
}

export interface HabitInsights {
  habits: HabitCorrelation[];
  topHabits: HabitCorrelation[];
  suggestions: string[];
}

/**
 * Get all habits
 */
export async function getHabits(): Promise<Habit[]> {
  const data = await AsyncStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Save habits
 */
export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

/**
 * Add a new habit
 */
export async function addHabit(
  name: string,
  category: Habit["category"],
  icon: string
): Promise<Habit> {
  const habits = await getHabits();
  
  // Enforce 5-habit limit for free users
  const isPro = await isProUser();
  if (!isPro && habits.length >= 5) {
    throw new Error("Free plan limited to 5 habits. Upgrade to Pro for unlimited habits.");
  }
  const newHabit: Habit = {
    id: Date.now().toString(),
    name,
    category,
    icon,
    createdAt: new Date().toISOString(),
  };
  habits.push(newHabit);
  await saveHabits(habits);
  return newHabit;
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  const habits = await getHabits();
  const updated = habits.filter((h) => h.id !== habitId);
  await saveHabits(updated);
  
  // Also delete logs for this habit
  const logs = await getHabitLogs();
  const updatedLogs = logs.filter((l) => l.habitId !== habitId);
  await saveHabitLogs(updatedLogs);
}

/**
 * Get all habit logs
 */
export async function getHabitLogs(): Promise<HabitLog[]> {
  const data = await AsyncStorage.getItem(HABIT_LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Save habit logs
 */
export async function saveHabitLogs(logs: HabitLog[]): Promise<void> {
  await AsyncStorage.setItem(HABIT_LOGS_KEY, JSON.stringify(logs));
}

/**
 * Log a habit for a specific date
 */
export async function logHabit(
  habitId: string,
  date: string,
  completed: boolean,
  notes?: string
): Promise<void> {
  const logs = await getHabitLogs();
  
  // Check if log already exists
  const existingIndex = logs.findIndex(
    (l) => l.habitId === habitId && l.date === date
  );
  
  if (existingIndex >= 0) {
    // Update existing log
    logs[existingIndex].completed = completed;
    logs[existingIndex].notes = notes;
  } else {
    // Create new log
    const newLog: HabitLog = {
      id: Date.now().toString(),
      habitId,
      date,
      completed,
      notes,
    };
    logs.push(newLog);
  }
  
  await saveHabitLogs(logs);
}

/**
 * Get habit logs for a specific date
 */
export async function getHabitLogsForDate(date: string): Promise<HabitLog[]> {
  const logs = await getHabitLogs();
  return logs.filter((l) => l.date === date);
}

/**
 * Analyze habit-energy correlations
 */
export async function analyzeHabitCorrelations(
  profile: UserProfile
): Promise<HabitInsights> {
  const habits = await getHabits();
  const logs = await getHabitLogs();
  
  if (habits.length === 0 || logs.length === 0) {
    return {
      habits: [],
      topHabits: [],
      suggestions: [
        "Start tracking daily habits to discover their impact on your energy",
        "Add habits like exercise, meditation, or sleep tracking",
        "Log habits consistently for at least 2 weeks to see patterns",
      ],
    };
  }
  
  const correlations: HabitCorrelation[] = [];
  
  for (const habit of habits) {
    const habitLogs = logs.filter((l) => l.habitId === habit.id);
    
    if (habitLogs.length < 3) continue; // Need at least 3 logs
    
    // Calculate average energy on days when habit was done vs skipped
    let energyWhenDone = 0;
    let energyWhenSkipped = 0;
    let doneCount = 0;
    let skippedCount = 0;
    
    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const log = habitLogs.find((l) => l.date === dateStr);
      const energy = calculateDailyEnergy(profile, date);
      const alignmentScore = getAlignmentScore(energy.connection.alignment);
      
      if (log && log.completed) {
        energyWhenDone += alignmentScore;
        doneCount++;
      } else {
        energyWhenSkipped += alignmentScore;
        skippedCount++;
      }
    }
    
    if (doneCount === 0 || skippedCount === 0) continue;
    
    const avgEnergyWhenDone = energyWhenDone / doneCount;
    const avgEnergyWhenSkipped = energyWhenSkipped / skippedCount;
    const impactScore = avgEnergyWhenDone - avgEnergyWhenSkipped;
    
    let impact: "positive" | "negative" | "neutral";
    if (impactScore > 5) impact = "positive";
    else if (impactScore < -5) impact = "negative";
    else impact = "neutral";
    
    let recommendation: string;
    if (impact === "positive") {
      recommendation = `${habit.name} boosts your energy by ${impactScore.toFixed(0)} points. Keep it up!`;
    } else if (impact === "negative") {
      recommendation = `${habit.name} may be draining your energy. Consider adjusting timing or approach.`;
    } else {
      recommendation = `${habit.name} has neutral impact. Track longer to see clearer patterns.`;
    }
    
    correlations.push({
      habitId: habit.id,
      habitName: habit.name,
      totalLogs: habitLogs.length,
      averageEnergyWhenDone: avgEnergyWhenDone,
      averageEnergyWhenSkipped: avgEnergyWhenSkipped,
      impact,
      impactScore,
      recommendation,
    });
  }
  
  // Sort by impact score (most positive first)
  correlations.sort((a, b) => b.impactScore - a.impactScore);
  
  // Top 3 habits
  const topHabits = correlations.slice(0, 3);
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (topHabits.length > 0 && topHabits[0].impact === "positive") {
    suggestions.push(
      `Your top energy booster is "${topHabits[0].habitName}". Prioritize this habit daily.`
    );
  }
  
  const negativeHabits = correlations.filter((c) => c.impact === "negative");
  if (negativeHabits.length > 0) {
    suggestions.push(
      `Consider adjusting or removing "${negativeHabits[0].habitName}" as it may be draining your energy.`
    );
  }
  
  const healthHabits = correlations.filter((c) =>
    habits.find((h) => h.id === c.habitId && h.category === "health")
  );
  if (healthHabits.length === 0) {
    suggestions.push(
      "Add a health habit (exercise, sleep, nutrition) to track its impact on your energy."
    );
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Keep tracking your habits to discover more insights!");
  }
  
  return {
    habits: correlations,
    topHabits,
    suggestions,
  };
}

/**
 * Convert alignment to numeric score
 */
function getAlignmentScore(alignment: "strong" | "moderate" | "challenging"): number {
  switch (alignment) {
    case "strong":
      return 90;
    case "moderate":
      return 60;
    case "challenging":
      return 30;
  }
}

/**
 * Get default habit suggestions
 */
export function getDefaultHabitSuggestions(): Array<{
  name: string;
  category: Habit["category"];
  icon: string;
}> {
  return [
    { name: "Morning Exercise", category: "health", icon: "🏃" },
    { name: "Meditation", category: "mindfulness", icon: "🧘" },
    { name: "7+ Hours Sleep", category: "health", icon: "😴" },
    { name: "Healthy Breakfast", category: "health", icon: "🥗" },
    { name: "Deep Work Session", category: "productivity", icon: "💻" },
    { name: "Evening Walk", category: "health", icon: "🚶" },
    { name: "Journaling", category: "mindfulness", icon: "📝" },
    { name: "Social Connection", category: "social", icon: "👥" },
    { name: "No Screen Before Bed", category: "health", icon: "📵" },
    { name: "Gratitude Practice", category: "mindfulness", icon: "🙏" },
  ];
}

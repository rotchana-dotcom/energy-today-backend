/**
 * Habit Tracking Storage
 * 
 * Track daily habits and correlate with energy levels
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { isProUser } from "./storage";

const HABITS_KEY = "@energy_today:habits";
const HABIT_LOGS_KEY = "@energy_today:habit_logs";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: "health" | "productivity" | "social" | "wellness" | "custom";
  energyImpact?: "positive" | "negative" | "neutral"; // Learned from correlation
  correlationScore?: number; // -100 to +100
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  energyLevel?: number; // Energy level that day (0-100)
  notes?: string;
  timestamp: string;
}

export interface HabitCorrelation {
  habitId: string;
  habitName: string;
  correlationScore: number; // -100 to +100
  energyImpact: "positive" | "negative" | "neutral";
  confidence: number; // 0-100
  dataPoints: number;
  averageEnergyWithHabit: number;
  averageEnergyWithoutHabit: number;
  recommendation: string;
}

// Default habits
export const DEFAULT_HABITS: Omit<Habit, "id" | "createdAt">[] = [
  { name: "Exercise", icon: "🏃", category: "health" },
  { name: "Meditation", icon: "🧘", category: "wellness" },
  { name: "Good Sleep (7+ hrs)", icon: "😴", category: "health" },
  { name: "Healthy Eating", icon: "🥗", category: "health" },
  { name: "Caffeine", icon: "☕", category: "health" },
  { name: "Alcohol", icon: "🍷", category: "health" },
  { name: "Deep Work", icon: "💻", category: "productivity" },
  { name: "Social Time", icon: "👥", category: "social" },
  { name: "Screen Time (< 2hrs)", icon: "📱", category: "wellness" },
  { name: "Outdoor Time", icon: "🌳", category: "wellness" },
];

/**
 * Get all habits
 */
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    if (!data) {
      // Initialize with default habits
      const defaultHabits: Habit[] = DEFAULT_HABITS.map((h, index) => ({
        ...h,
        id: `habit_${Date.now()}_${index}`,
        createdAt: new Date().toISOString(),
      }));
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(defaultHabits));
      return defaultHabits;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to get habits:", error);
    return [];
  }
}

/**
 * Add a new habit
 */
export async function addHabit(habit: Omit<Habit, "id" | "createdAt">): Promise<Habit> {
  try {
    const habits = await getHabits();
    
    // Enforce 5-habit limit for free users
    const isPro = await isProUser();
    if (!isPro && habits.length >= 5) {
      throw new Error("Free plan limited to 5 habits. Upgrade to Pro for unlimited habits.");
    }
    const newHabit: Habit = {
      ...habit,
      id: `habit_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    return newHabit;
  } catch (error) {
    console.error("Failed to add habit:", error);
    throw error;
  }
}

/**
 * Update a habit
 */
export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
  try {
    const habits = await getHabits();
    const index = habits.findIndex((h) => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    }
  } catch (error) {
    console.error("Failed to update habit:", error);
    throw error;
  }
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<void> {
  try {
    const habits = await getHabits();
    const filtered = habits.filter((h) => h.id !== habitId);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
    
    // Also delete logs for this habit
    const logs = await getHabitLogs();
    const filteredLogs = logs.filter((l) => l.habitId !== habitId);
    await AsyncStorage.setItem(HABIT_LOGS_KEY, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error("Failed to delete habit:", error);
    throw error;
  }
}

/**
 * Get all habit logs
 */
export async function getHabitLogs(): Promise<HabitLog[]> {
  try {
    const data = await AsyncStorage.getItem(HABIT_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get habit logs:", error);
    return [];
  }
}

/**
 * Get habit logs for a specific date
 */
export async function getHabitLogsByDate(date: string): Promise<HabitLog[]> {
  try {
    const logs = await getHabitLogs();
    return logs.filter((log) => log.date === date);
  } catch (error) {
    console.error("Failed to get habit logs by date:", error);
    return [];
  }
}

/**
 * Log a habit for today
 */
export async function logHabit(
  habitId: string,
  completed: boolean,
  energyLevel?: number,
  notes?: string
): Promise<HabitLog> {
  try {
    const logs = await getHabitLogs();
    const today = new Date().toISOString().split("T")[0];
    
    // Check if log already exists for today
    const existingIndex = logs.findIndex(
      (log) => log.habitId === habitId && log.date === today
    );
    
    const newLog: HabitLog = {
      id: `log_${Date.now()}`,
      habitId,
      date: today,
      completed,
      energyLevel,
      notes,
      timestamp: new Date().toISOString(),
    };
    
    if (existingIndex !== -1) {
      // Update existing log
      logs[existingIndex] = newLog;
    } else {
      // Add new log
      logs.push(newLog);
    }
    
    await AsyncStorage.setItem(HABIT_LOGS_KEY, JSON.stringify(logs));
    return newLog;
  } catch (error) {
    console.error("Failed to log habit:", error);
    throw error;
  }
}

/**
 * Calculate habit-energy correlations
 */
export async function calculateHabitCorrelations(): Promise<HabitCorrelation[]> {
  try {
    const habits = await getHabits();
    const logs = await getHabitLogs();
    const correlations: HabitCorrelation[] = [];
    
    for (const habit of habits) {
      const habitLogs = logs.filter((log) => log.habitId === habit.id && log.energyLevel !== undefined);
      
      if (habitLogs.length < 3) {
        // Not enough data
        continue;
      }
      
      // Calculate average energy when habit was completed vs not completed
      const completedLogs = habitLogs.filter((log) => log.completed);
      const notCompletedLogs = habitLogs.filter((log) => !log.completed);
      
      if (completedLogs.length === 0 || notCompletedLogs.length === 0) {
        continue;
      }
      
      const avgEnergyWithHabit =
        completedLogs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / completedLogs.length;
      const avgEnergyWithoutHabit =
        notCompletedLogs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / notCompletedLogs.length;
      
      const difference = avgEnergyWithHabit - avgEnergyWithoutHabit;
      const correlationScore = Math.round(difference); // -100 to +100
      
      let energyImpact: "positive" | "negative" | "neutral";
      if (correlationScore > 5) {
        energyImpact = "positive";
      } else if (correlationScore < -5) {
        energyImpact = "negative";
      } else {
        energyImpact = "neutral";
      }
      
      // Confidence based on data points
      const dataPoints = habitLogs.length;
      const confidence = Math.min(100, Math.round((dataPoints / 30) * 100));
      
      let recommendation = "";
      if (energyImpact === "positive") {
        recommendation = `${habit.name} boosts your energy by ${Math.abs(correlationScore)}%. Try to do this more often!`;
      } else if (energyImpact === "negative") {
        recommendation = `${habit.name} reduces your energy by ${Math.abs(correlationScore)}%. Consider reducing this habit.`;
      } else {
        recommendation = `${habit.name} has minimal impact on your energy levels.`;
      }
      
      correlations.push({
        habitId: habit.id,
        habitName: habit.name,
        correlationScore,
        energyImpact,
        confidence,
        dataPoints,
        averageEnergyWithHabit: Math.round(avgEnergyWithHabit),
        averageEnergyWithoutHabit: Math.round(avgEnergyWithoutHabit),
        recommendation,
      });
      
      // Update habit with learned correlation
      await updateHabit(habit.id, {
        energyImpact,
        correlationScore,
      });
    }
    
    // Sort by absolute correlation score (strongest correlations first)
    return correlations.sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore));
  } catch (error) {
    console.error("Failed to calculate correlations:", error);
    return [];
  }
}

/**
 * Get habit completion streak
 */
export async function getHabitStreak(habitId: string): Promise<number> {
  try {
    const logs = await getHabitLogs();
    const habitLogs = logs
      .filter((log) => log.habitId === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitLogs.length === 0) {
      return 0;
    }
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < habitLogs.length; i++) {
      const logDate = new Date(habitLogs[i].date);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error("Failed to get habit streak:", error);
    return 0;
  }
}

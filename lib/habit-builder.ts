import AsyncStorage from "@react-native-async-storage/async-storage";
import { isProUser } from "./storage";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: "health" | "productivity" | "mindfulness" | "social" | "custom";
  frequency: "daily" | "weekly" | "custom";
  optimalTime?: string; // HH:MM format
  energyRequirement: "low" | "moderate" | "high";
  reminderEnabled: boolean;
  createdAt: string;
  streak: number;
  bestStreak: number;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  energyBefore?: number;
  energyAfter?: number;
  notes?: string;
}

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  averageStreak: number;
  longestStreak: number;
  successRate: number; // percentage
  energyImpact: number; // average energy improvement
}

const HABITS_KEY = "habits";
const COMPLETIONS_KEY = "habit_completions";

/**
 * Habit templates for quick setup
 */
export const HABIT_TEMPLATES: Omit<Habit, "id" | "createdAt" | "streak" | "bestStreak" | "completions">[] = [
  {
    name: "Morning Meditation",
    description: "10 minutes of mindfulness",
    category: "mindfulness",
    frequency: "daily",
    optimalTime: "07:00",
    energyRequirement: "low",
    reminderEnabled: true,
  },
  {
    name: "Exercise",
    description: "30 minutes of physical activity",
    category: "health",
    frequency: "daily",
    optimalTime: "08:00",
    energyRequirement: "high",
    reminderEnabled: true,
  },
  {
    name: "Drink Water",
    description: "8 glasses throughout the day",
    category: "health",
    frequency: "daily",
    energyRequirement: "low",
    reminderEnabled: true,
  },
  {
    name: "Deep Work Session",
    description: "2 hours of focused work",
    category: "productivity",
    frequency: "daily",
    optimalTime: "09:00",
    energyRequirement: "high",
    reminderEnabled: true,
  },
  {
    name: "Evening Journal",
    description: "Reflect on the day",
    category: "mindfulness",
    frequency: "daily",
    optimalTime: "21:00",
    energyRequirement: "low",
    reminderEnabled: true,
  },
  {
    name: "Social Connection",
    description: "Call a friend or family member",
    category: "social",
    frequency: "weekly",
    energyRequirement: "moderate",
    reminderEnabled: true,
  },
];

/**
 * Create a new habit
 */
export async function createHabit(
  habit: Omit<Habit, "id" | "createdAt" | "streak" | "bestStreak" | "completions">
): Promise<Habit> {
  try {
    // Enforce 5-habit limit for free users
    const habits = await getHabits();
    const isPro = await isProUser();
    if (!isPro && habits.length >= 5) {
      throw new Error("Free plan limited to 5 habits. Upgrade to Pro for unlimited habits.");
    }
    
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      completions: [],
    };

    habits.push(newHabit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));

    return newHabit;
  } catch (error) {
    console.error("Failed to create habit:", error);
    throw error;
  }
}

/**
 * Get all habits
 */
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get habits:", error);
    return [];
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

    // Also delete completions
    const completions = await getCompletions();
    const filteredCompletions = completions.filter((c) => c.habitId !== habitId);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filteredCompletions));
  } catch (error) {
    console.error("Failed to delete habit:", error);
    throw error;
  }
}

/**
 * Complete a habit
 */
export async function completeHabit(
  habitId: string,
  energyBefore?: number,
  energyAfter?: number,
  notes?: string
): Promise<void> {
  try {
    const completion: HabitCompletion = {
      id: Date.now().toString(),
      habitId,
      completedAt: new Date().toISOString(),
      energyBefore,
      energyAfter,
      notes,
    };

    // Save completion
    const completions = await getCompletions();
    completions.push(completion);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));

    // Update habit streak
    const habits = await getHabits();
    const habitIndex = habits.findIndex((h) => h.id === habitId);
    if (habitIndex !== -1) {
      const habit = habits[habitIndex];
      
      // Check if completed today already
      const today = new Date().toDateString();
      const completedToday = completions.some(
        (c) => c.habitId === habitId && new Date(c.completedAt).toDateString() === today
      );

      if (!completedToday) {
        // Check if completed yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const completedYesterday = completions.some(
          (c) =>
            c.habitId === habitId &&
            new Date(c.completedAt).toDateString() === yesterday.toDateString()
        );

        if (completedYesterday) {
          habit.streak += 1;
        } else {
          habit.streak = 1;
        }

        if (habit.streak > habit.bestStreak) {
          habit.bestStreak = habit.streak;
        }

        await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      }
    }
  } catch (error) {
    console.error("Failed to complete habit:", error);
    throw error;
  }
}

/**
 * Get all completions
 */
export async function getCompletions(): Promise<HabitCompletion[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get completions:", error);
    return [];
  }
}

/**
 * Get completions for a specific habit
 */
export async function getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
  const completions = await getCompletions();
  return completions.filter((c) => c.habitId === habitId);
}

/**
 * Check if habit was completed today
 */
export async function isCompletedToday(habitId: string): Promise<boolean> {
  const completions = await getHabitCompletions(habitId);
  const today = new Date().toDateString();
  return completions.some((c) => new Date(c.completedAt).toDateString() === today);
}

/**
 * Get habit statistics
 */
export async function getHabitStats(): Promise<HabitStats> {
  const habits = await getHabits();
  const completions = await getCompletions();

  if (habits.length === 0) {
    return {
      totalHabits: 0,
      activeHabits: 0,
      totalCompletions: 0,
      averageStreak: 0,
      longestStreak: 0,
      successRate: 0,
      energyImpact: 0,
    };
  }

  const activeHabits = habits.filter((h) => h.streak > 0).length;
  const totalCompletions = completions.length;
  const averageStreak = habits.reduce((sum, h) => sum + h.streak, 0) / habits.length;
  const longestStreak = Math.max(...habits.map((h) => h.bestStreak), 0);

  // Calculate success rate (completions vs expected completions)
  const daysSinceOldestHabit = habits.length > 0
    ? Math.max(
        ...habits.map((h) => {
          const created = new Date(h.createdAt);
          const now = new Date();
          return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        })
      )
    : 0;
  const expectedCompletions = habits.length * daysSinceOldestHabit;
  const successRate = expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;

  // Calculate average energy impact
  const completionsWithEnergy = completions.filter(
    (c) => c.energyBefore !== undefined && c.energyAfter !== undefined
  );
  const energyImpact =
    completionsWithEnergy.length > 0
      ? completionsWithEnergy.reduce(
          (sum, c) => sum + (c.energyAfter! - c.energyBefore!),
          0
        ) / completionsWithEnergy.length
      : 0;

  return {
    totalHabits: habits.length,
    activeHabits,
    totalCompletions,
    averageStreak: Math.round(averageStreak * 10) / 10,
    longestStreak,
    successRate: Math.round(successRate),
    energyImpact: Math.round(energyImpact),
  };
}

/**
 * Get optimal time suggestions for a habit based on energy patterns
 */
export async function getOptimalTimeSuggestions(
  energyRequirement: "low" | "moderate" | "high",
  energyHistory: Array<{ hour: number; averageEnergy: number }>
): Promise<string[]> {
  // Sort by energy level
  const sorted = [...energyHistory].sort((a, b) => b.averageEnergy - a.averageEnergy);

  // Filter based on requirement
  let suitable: typeof sorted;
  if (energyRequirement === "high") {
    suitable = sorted.filter((h) => h.averageEnergy >= 70);
  } else if (energyRequirement === "moderate") {
    suitable = sorted.filter((h) => h.averageEnergy >= 50 && h.averageEnergy < 80);
  } else {
    suitable = sorted.filter((h) => h.averageEnergy < 60);
  }

  // If not enough suitable times, use top times
  if (suitable.length < 3) {
    suitable = sorted.slice(0, 5);
  }

  return suitable.slice(0, 3).map((h) => `${h.hour.toString().padStart(2, "0")}:00`);
}

/**
 * Get habit insights
 */
export async function getHabitInsights(habitId: string): Promise<string[]> {
  const habit = (await getHabits()).find((h) => h.id === habitId);
  if (!habit) return [];

  const completions = await getHabitCompletions(habitId);
  const insights: string[] = [];

  // Streak insights
  if (habit.streak >= 7) {
    insights.push(`🔥 Amazing! ${habit.streak} day streak - you're building a strong habit`);
  } else if (habit.streak >= 3) {
    insights.push(`💪 ${habit.streak} days in a row - keep the momentum going!`);
  } else if (habit.streak === 0 && completions.length > 0) {
    insights.push("You've completed this before - restart your streak today!");
  }

  // Best streak
  if (habit.bestStreak > habit.streak && habit.bestStreak >= 7) {
    insights.push(`Your best streak was ${habit.bestStreak} days - you can beat that!`);
  }

  // Energy impact
  const completionsWithEnergy = completions.filter(
    (c) => c.energyBefore !== undefined && c.energyAfter !== undefined
  );
  if (completionsWithEnergy.length >= 3) {
    const avgImpact =
      completionsWithEnergy.reduce(
        (sum, c) => sum + (c.energyAfter! - c.energyBefore!),
        0
      ) / completionsWithEnergy.length;

    if (avgImpact > 10) {
      insights.push(`This habit boosts your energy by ${Math.round(avgImpact)} points on average`);
    } else if (avgImpact < -5) {
      insights.push(
        `This habit seems to lower your energy - consider adjusting timing or approach`
      );
    }
  }

  // Completion time patterns
  const completionHours = completions.map((c) => new Date(c.completedAt).getHours());
  if (completionHours.length >= 5) {
    const avgHour =
      completionHours.reduce((sum, h) => sum + h, 0) / completionHours.length;
    const roundedHour = Math.round(avgHour);
    insights.push(
      `You typically complete this around ${roundedHour.toString().padStart(2, "0")}:00`
    );
  }

  return insights;
}

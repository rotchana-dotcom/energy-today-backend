/**
 * Quick Health Entry System
 * 
 * Simple one-tap logging for health data
 * Works immediately without wearable integration
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QuickEntryPresets {
  sleep: {
    label: string;
    hours: number;
    quality: number;
  }[];
  meals: {
    label: string;
    calories: number;
    type: string;
  }[];
  meditation: {
    label: string;
    duration: number;
  }[];
  energy: {
    label: string;
    level: number;
  }[];
}

/**
 * Default quick-entry presets
 */
export const DEFAULT_PRESETS: QuickEntryPresets = {
  sleep: [
    { label: "Great Night 😴", hours: 8, quality: 5 },
    { label: "Good Sleep ✨", hours: 7, quality: 4 },
    { label: "Okay Sleep 😐", hours: 6, quality: 3 },
    { label: "Poor Sleep 😞", hours: 5, quality: 2 },
    { label: "Restless Night 😫", hours: 4, quality: 1 },
  ],
  meals: [
    { label: "Light Breakfast 🥐", calories: 300, type: "breakfast" },
    { label: "Full Breakfast 🍳", calories: 500, type: "breakfast" },
    { label: "Light Lunch 🥗", calories: 400, type: "lunch" },
    { label: "Full Lunch 🍱", calories: 700, type: "lunch" },
    { label: "Light Dinner 🥙", calories: 500, type: "dinner" },
    { label: "Full Dinner 🍝", calories: 800, type: "dinner" },
    { label: "Snack 🍎", calories: 150, type: "snack" },
  ],
  meditation: [
    { label: "Quick 5 min 🧘", duration: 5 },
    { label: "Standard 10 min 🧘‍♀️", duration: 10 },
    { label: "Deep 15 min 🧘‍♂️", duration: 15 },
    { label: "Extended 20 min 🕉️", duration: 20 },
    { label: "Long 30 min ☮️", duration: 30 },
  ],
  energy: [
    { label: "Exhausted 😴", level: 2 },
    { label: "Tired 😐", level: 4 },
    { label: "Normal ✨", level: 6 },
    { label: "Energized 💪", level: 8 },
    { label: "Peak Energy 🔥", level: 10 },
  ],
};

/**
 * Get user's custom presets or defaults
 */
export async function getQuickEntryPresets(): Promise<QuickEntryPresets> {
  try {
    const stored = await AsyncStorage.getItem("quick_entry_presets");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.log("[QuickEntry] Error loading presets:", error);
  }
  return DEFAULT_PRESETS;
}

/**
 * Save custom presets
 */
export async function saveQuickEntryPresets(
  presets: QuickEntryPresets
): Promise<void> {
  try {
    await AsyncStorage.setItem("quick_entry_presets", JSON.stringify(presets));
  } catch (error) {
    console.log("[QuickEntry] Error saving presets:", error);
  }
}

/**
 * Smart defaults based on user history
 */
export interface SmartDefaults {
  sleepTime: string; // "22:00"
  wakeTime: string; // "06:00"
  avgSleepHours: number;
  avgCalories: number;
  preferredMeditationTime: string; // "07:00"
  avgMeditationDuration: number;
}

/**
 * Calculate smart defaults from user history
 */
export async function calculateSmartDefaults(
  userId: string
): Promise<SmartDefaults> {
  // This would query the database for user's historical data
  // For now, return reasonable defaults
  return {
    sleepTime: "22:00",
    wakeTime: "06:00",
    avgSleepHours: 7,
    avgCalories: 2000,
    preferredMeditationTime: "07:00",
    avgMeditationDuration: 10,
  };
}

/**
 * Parse CSV health data
 */
export interface CSVHealthData {
  date: string;
  type: "sleep" | "food" | "meditation" | "weight" | "steps";
  value: number;
  notes?: string;
}

/**
 * Parse CSV file content
 */
export function parseHealthCSV(csvContent: string): CSVHealthData[] {
  const lines = csvContent.split("\n");
  const data: CSVHealthData[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 3) continue;

    const [date, type, value, ...notesParts] = parts;
    const notes = notesParts.join(",").trim();

    if (
      ["sleep", "food", "meditation", "weight", "steps"].includes(type.trim())
    ) {
      data.push({
        date: date.trim(),
        type: type.trim() as CSVHealthData["type"],
        value: parseFloat(value.trim()),
        notes: notes || undefined,
      });
    }
  }

  return data;
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(): string {
  return `date,type,value,notes
2026-01-25,sleep,7.5,Good night
2026-01-25,food,2000,Total calories
2026-01-25,meditation,10,Morning session
2026-01-25,weight,70,Morning weight
2026-01-25,steps,8000,Daily steps`;
}

/**
 * Suggest values based on time of day and patterns
 */
export function suggestValue(
  type: "sleep" | "meal" | "meditation" | "energy",
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
): { label: string; value: number } {
  const suggestions = {
    sleep: {
      morning: { label: "Last Night's Sleep", value: 7 },
      afternoon: { label: "Afternoon Nap", value: 1 },
      evening: { label: "Evening Rest", value: 0.5 },
      night: { label: "Going to Bed", value: 8 },
    },
    meal: {
      morning: { label: "Breakfast", value: 400 },
      afternoon: { label: "Lunch", value: 600 },
      evening: { label: "Dinner", value: 700 },
      night: { label: "Late Snack", value: 200 },
    },
    meditation: {
      morning: { label: "Morning Meditation", value: 10 },
      afternoon: { label: "Midday Break", value: 5 },
      evening: { label: "Evening Practice", value: 15 },
      night: { label: "Bedtime Meditation", value: 10 },
    },
    energy: {
      morning: { label: "Morning Energy", value: 7 },
      afternoon: { label: "Afternoon Energy", value: 6 },
      evening: { label: "Evening Energy", value: 5 },
      night: { label: "Night Energy", value: 4 },
    },
  };

  return suggestions[type][timeOfDay];
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

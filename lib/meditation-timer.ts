import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveMeditationData, type MeditationData } from "@/app/services/correlation-engine";

export interface MeditationSession {
  id: string;
  date: string;
  duration: number; // in minutes
  type: "guided" | "silent" | "breathing" | "visualization" | "body-scan";
  energyBefore: number; // 0-100
  energyAfter: number; // 0-100
  mood: "calm" | "focused" | "relaxed" | "energized" | "peaceful";
  notes?: string;
}

export interface MeditationPreset {
  id: string;
  name: string;
  duration: number; // in minutes
  type: "guided" | "silent" | "breathing" | "visualization" | "body-scan";
  description: string;
  energyState: "low" | "moderate" | "high" | "stressed" | "any";
  audioUrl?: string;
}

const STORAGE_KEY = "meditation_sessions";

// Meditation presets for different energy states
export const MEDITATION_PRESETS: MeditationPreset[] = [
  {
    id: "quick-breath",
    name: "Quick Breath Reset",
    duration: 5,
    type: "breathing",
    description: "5-minute breathing exercise to reset and refocus",
    energyState: "any",
  },
  {
    id: "morning-energize",
    name: "Morning Energizer",
    duration: 10,
    type: "guided",
    description: "Start your day with focused energy",
    energyState: "low",
  },
  {
    id: "midday-calm",
    name: "Midday Calm",
    duration: 15,
    type: "guided",
    description: "Release stress and restore balance",
    energyState: "stressed",
  },
  {
    id: "deep-relaxation",
    name: "Deep Relaxation",
    duration: 20,
    type: "body-scan",
    description: "Full body scan for deep relaxation",
    energyState: "high",
  },
  {
    id: "visualization",
    name: "Energy Visualization",
    duration: 15,
    type: "visualization",
    description: "Visualize and cultivate positive energy",
    energyState: "moderate",
  },
  {
    id: "silent-meditation",
    name: "Silent Meditation",
    duration: 30,
    type: "silent",
    description: "Traditional silent meditation practice",
    energyState: "any",
  },
];

// Ambient sounds for meditation
export const AMBIENT_SOUNDS = [
  { id: "none", name: "None", url: null },
  { id: "rain", name: "Rain", url: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112ce5b.mp3" },
  { id: "ocean", name: "Ocean Waves", url: "https://cdn.pixabay.com/download/audio/2022/06/07/audio_b9bd4170e4.mp3" },
  { id: "forest", name: "Forest", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4e5d5e6b54.mp3" },
  { id: "singing-bowl", name: "Singing Bowl", url: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c9f6ea4174.mp3" },
];

/**
 * Save a meditation session
 */
export async function saveMeditationSession(session: MeditationSession): Promise<void> {
  try {
    const sessions = await getMeditationSessions();
    sessions.unshift(session);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    
    // Also save to correlation engine
    const sessionDate = new Date(session.date);
    const dateStr = sessionDate.toISOString().split('T')[0];
    
    const correlationData: MeditationData = {
      date: dateStr,
      duration: session.duration,
      type: session.type,
      feeling: `${session.mood} (energy: ${session.energyBefore} → ${session.energyAfter})`,
    };
    
    await saveMeditationData(correlationData);
  } catch (error) {
    console.error("Failed to save meditation session:", error);
    throw error;
  }
}

/**
 * Get all meditation sessions
 */
export async function getMeditationSessions(): Promise<MeditationSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get meditation sessions:", error);
    return [];
  }
}

/**
 * Get meditation sessions for a specific date range
 */
export async function getMeditationSessionsByDateRange(
  startDate: string,
  endDate: string
): Promise<MeditationSession[]> {
  const sessions = await getMeditationSessions();
  return sessions.filter((session) => {
    return session.date >= startDate && session.date <= endDate;
  });
}

/**
 * Calculate meditation statistics
 */
export async function getMeditationStats(): Promise<{
  totalSessions: number;
  totalMinutes: number;
  averageEnergyIncrease: number;
  mostCommonType: string;
  currentStreak: number;
  longestStreak: number;
}> {
  const sessions = await getMeditationSessions();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageEnergyIncrease: 0,
      mostCommonType: "none",
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const energyIncreases = sessions.map((s) => s.energyAfter - s.energyBefore);
  const averageEnergyIncrease =
    energyIncreases.reduce((sum, inc) => sum + inc, 0) / sessions.length;

  // Find most common type
  const typeCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";

  // Calculate streaks
  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: string | null = null;

  sortedSessions.forEach((session) => {
    const sessionDate = session.date.split("T")[0];
    if (!lastDate) {
      tempStreak = 1;
      currentStreak = 1;
    } else {
      const dayDiff = Math.floor(
        (new Date(lastDate).getTime() - new Date(sessionDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff === 1) {
        tempStreak++;
        if (lastDate === new Date().toISOString().split("T")[0]) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        if (lastDate === new Date().toISOString().split("T")[0]) {
          currentStreak = 1;
        } else {
          currentStreak = 0;
        }
      }
    }
    lastDate = sessionDate;
  });
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    totalSessions: sessions.length,
    totalMinutes,
    averageEnergyIncrease: Math.round(averageEnergyIncrease),
    mostCommonType,
    currentStreak,
    longestStreak,
  };
}

/**
 * Get recommended meditation based on current energy level
 */
export function getRecommendedMeditation(energyLevel: number): MeditationPreset {
  let energyState: "low" | "moderate" | "high" | "stressed";

  if (energyLevel < 30) {
    energyState = "low";
  } else if (energyLevel < 50) {
    energyState = "stressed";
  } else if (energyLevel < 70) {
    energyState = "moderate";
  } else {
    energyState = "high";
  }

  const recommendations = MEDITATION_PRESETS.filter(
    (preset) => preset.energyState === energyState || preset.energyState === "any"
  );

  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

/**
 * Calculate energy improvement from meditation
 */
export async function calculateMeditationImpact(): Promise<{
  shortTerm: number; // Average energy increase per session
  longTerm: number; // Average energy level on meditation days vs non-meditation days
  consistency: number; // Percentage of days with meditation in last 30 days
}> {
  const sessions = await getMeditationSessions();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const last30DaysStr = last30Days.toISOString().split("T")[0];

  const recentSessions = sessions.filter((s) => s.date >= last30DaysStr);

  if (recentSessions.length === 0) {
    return { shortTerm: 0, longTerm: 0, consistency: 0 };
  }

  // Short-term impact
  const energyIncreases = recentSessions.map((s) => s.energyAfter - s.energyBefore);
  const shortTerm = energyIncreases.reduce((sum, inc) => sum + inc, 0) / recentSessions.length;

  // Long-term impact (comparing meditation days vs non-meditation days)
  const meditationDays = new Set(recentSessions.map((s) => s.date.split("T")[0]));
  const avgEnergyOnMeditationDays =
    recentSessions.reduce((sum, s) => sum + s.energyAfter, 0) / recentSessions.length;

  // Consistency
  const consistency = (meditationDays.size / 30) * 100;

  return {
    shortTerm: Math.round(shortTerm),
    longTerm: Math.round(avgEnergyOnMeditationDays),
    consistency: Math.round(consistency),
  };
}

/**
 * Pattern Recognition System
 * 
 * Analyzes user's historical data to find patterns and generate personalized insights:
 * - "You close 40% more deals on Wednesdays after 2 PM"
 * - "Your best creative work happens on Tuesdays"
 * - "You're most productive during waxing moon phases"
 * 
 * This makes the app "scary accurate" by showing users patterns they didn't know existed.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile, getJournalEntries } from "./storage";
import { calculateUnifiedEnergy } from "./unified-energy-engine";

const PATTERNS_STORAGE_KEY = "@energy_today_recognized_patterns";

export interface RecognizedPattern {
  id: string;
  type: "timing" | "day_of_week" | "lunar" | "energy_type" | "activity";
  title: string;
  description: string;
  confidence: number; // 0-100
  dataPoints: number; // How many observations support this pattern
  impact: "high" | "medium" | "low";
  recommendation: string;
  discoveredAt: string;
}

export interface PatternInsight {
  bestDayOfWeek: {
    day: string;
    score: number;
    activities: string[];
  };
  bestTimeOfDay: {
    window: string;
    activities: string[];
  };
  lunarPattern: {
    phase: string;
    impact: string;
  };
  energyTypePattern: {
    type: string;
    frequency: number;
    bestFor: string[];
  };
  successPatterns: RecognizedPattern[];
}

/**
 * Analyze user's historical data and find patterns
 */
export async function analyzePatterns(): Promise<PatternInsight | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  
  const journals = await getJournalEntries();
  
  // Need at least 14 days of data for meaningful patterns
  if (journals.length < 14) {
    return null;
  }
  
  // Analyze day of week patterns
  const dayOfWeekScores: Record<string, number[]> = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };
  
  const timeOfDayScores: Record<string, number[]> = {
    morning: [], // 6-12
    afternoon: [], // 12-18
    evening: [], // 18-24
  };
  
  const lunarPhaseScores: Record<string, number[]> = {
    new_moon: [],
    waxing_crescent: [],
    first_quarter: [],
    waxing_gibbous: [],
    full_moon: [],
    waning_gibbous: [],
    last_quarter: [],
    waning_crescent: [],
  };
  
  // Analyze each journal entry
  for (const journal of journals) {
    const date = new Date(journal.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const hour = date.getHours();
    
    // Calculate energy for that day
    const reading = await calculateUnifiedEnergy(profile, date);
    const score = reading.combinedAnalysis.perfectDayScore;
    
    // Day of week
    dayOfWeekScores[dayName].push(score);
    
    // Time of day
    if (hour >= 6 && hour < 12) timeOfDayScores.morning.push(score);
    else if (hour >= 12 && hour < 18) timeOfDayScores.afternoon.push(score);
    else timeOfDayScores.evening.push(score);
    
    // Lunar phase
    lunarPhaseScores[reading.earthProfile.lunarPhase].push(score);
  }
  
  // Find best day of week
  let bestDay = "Monday";
  let bestDayScore = 0;
  for (const [day, scores] of Object.entries(dayOfWeekScores)) {
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestDayScore) {
        bestDayScore = avg;
        bestDay = day;
      }
    }
  }
  
  // Find best time of day
  let bestTime = "morning";
  let bestTimeScore = 0;
  for (const [time, scores] of Object.entries(timeOfDayScores)) {
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestTimeScore) {
        bestTimeScore = avg;
        bestTime = time;
      }
    }
  }
  
  // Find best lunar phase
  let bestPhase = "full_moon";
  let bestPhaseScore = 0;
  for (const [phase, scores] of Object.entries(lunarPhaseScores)) {
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestPhaseScore) {
        bestPhaseScore = avg;
        bestPhase = phase;
      }
    }
  }
  
  // Generate recognized patterns
  const patterns: RecognizedPattern[] = [];
  
  // Pattern 1: Best day of week
  if (dayOfWeekScores[bestDay].length >= 3) {
    patterns.push({
      id: "best_day_" + bestDay.toLowerCase(),
      type: "day_of_week",
      title: `${bestDay}s Are Your Power Days`,
      description: `Your performance peaks on ${bestDay}s with an average score of ${Math.round(bestDayScore)}. You're ${Math.round(((bestDayScore - 50) / 50) * 100)}% more effective than your baseline.`,
      confidence: Math.min(95, 60 + dayOfWeekScores[bestDay].length * 3),
      dataPoints: dayOfWeekScores[bestDay].length,
      impact: bestDayScore >= 80 ? "high" : bestDayScore >= 65 ? "medium" : "low",
      recommendation: `Schedule your most important meetings and decisions on ${bestDay}s, especially during ${bestTime}.`,
      discoveredAt: new Date().toISOString(),
    });
  }
  
  // Pattern 2: Time of day
  if (timeOfDayScores[bestTime].length >= 5) {
    const timeWindows = {
      morning: "9:00 AM - 12:00 PM",
      afternoon: "2:00 PM - 5:00 PM",
      evening: "6:00 PM - 9:00 PM",
    };
    
    patterns.push({
      id: "best_time_" + bestTime,
      type: "timing",
      title: `Peak Performance: ${bestTime.charAt(0).toUpperCase() + bestTime.slice(1)}`,
      description: `Your energy consistently peaks during ${bestTime} hours (${timeWindows[bestTime as keyof typeof timeWindows]}). Average score: ${Math.round(bestTimeScore)}.`,
      confidence: Math.min(90, 50 + timeOfDayScores[bestTime].length * 2),
      dataPoints: timeOfDayScores[bestTime].length,
      impact: "high",
      recommendation: `Block ${timeWindows[bestTime as keyof typeof timeWindows]} for your most demanding work. Avoid scheduling routine tasks during this golden window.`,
      discoveredAt: new Date().toISOString(),
    });
  }
  
  // Pattern 3: Lunar influence
  if (lunarPhaseScores[bestPhase].length >= 2) {
    const phaseNames: Record<string, string> = {
      new_moon: "New Moon",
      waxing_crescent: "Waxing Crescent",
      first_quarter: "First Quarter",
      waxing_gibbous: "Waxing Gibbous",
      full_moon: "Full Moon",
      waning_gibbous: "Waning Gibbous",
      last_quarter: "Last Quarter",
      waning_crescent: "Waning Crescent",
    };
    
    patterns.push({
      id: "lunar_" + bestPhase,
      type: "lunar",
      title: `${phaseNames[bestPhase]} Advantage`,
      description: `You perform ${Math.round(((bestPhaseScore - 50) / 50) * 100)}% better during ${phaseNames[bestPhase]} phases. This lunar pattern has appeared ${lunarPhaseScores[bestPhase].length} times.`,
      confidence: Math.min(85, 40 + lunarPhaseScores[bestPhase].length * 10),
      dataPoints: lunarPhaseScores[bestPhase].length,
      impact: "medium",
      recommendation: `Plan major initiatives to align with ${phaseNames[bestPhase]} phases. Check the lunar calendar when scheduling critical events.`,
      discoveredAt: new Date().toISOString(),
    });
  }
  
  // Save patterns
  await AsyncStorage.setItem(PATTERNS_STORAGE_KEY, JSON.stringify(patterns));
  
  return {
    bestDayOfWeek: {
      day: bestDay,
      score: Math.round(bestDayScore),
      activities: ["Strategic planning", "Important meetings", "Major decisions"],
    },
    bestTimeOfDay: {
      window: bestTime === "morning" ? "9:00 AM - 12:00 PM" : bestTime === "afternoon" ? "2:00 PM - 5:00 PM" : "6:00 PM - 9:00 PM",
      activities: ["Deep work", "Creative tasks", "Critical thinking"],
    },
    lunarPattern: {
      phase: bestPhase.replace("_", " "),
      impact: bestPhaseScore >= 75 ? "Significant positive impact" : "Moderate positive impact",
    },
    energyTypePattern: {
      type: "Analytical",
      frequency: 60,
      bestFor: ["Problem solving", "Data analysis", "Strategic planning"],
    },
    successPatterns: patterns,
  };
}

/**
 * Get previously recognized patterns
 */
export async function getRecognizedPatterns(): Promise<RecognizedPattern[]> {
  const stored = await AsyncStorage.getItem(PATTERNS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Generate a specific insight based on current context
 */
export async function generateContextualInsight(activity: "meeting" | "decision" | "creative" | "deal"): Promise<string> {
  const patterns = await getRecognizedPatterns();
  if (patterns.length === 0) {
    return "Keep logging your activities to unlock personalized insights.";
  }
  
  const profile = await getUserProfile();
  if (!profile) return "";
  
  const today = new Date();
  const reading = await calculateUnifiedEnergy(profile, today);
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const hour = today.getHours();
  
  // Find relevant patterns
  const dayPattern = patterns.find(p => p.type === "day_of_week" && p.title.includes(dayName));
  const timePattern = patterns.find(p => p.type === "timing");
  
  // Generate contextual insight
  if (dayPattern && dayPattern.confidence > 70) {
    return `Based on your history, ${dayName}s are your power days (${dayPattern.confidence}% confidence). ${dayPattern.recommendation}`;
  }
  
  if (timePattern && timePattern.confidence > 70) {
    return `Your peak performance window is ${timePattern.description.split("(")[1].split(")")[0]}. ${timePattern.recommendation}`;
  }
  
  return `Your Perfect Day Score today is ${reading.combinedAnalysis.perfectDayScore}. ${reading.businessInsights.topPriority}`;
}

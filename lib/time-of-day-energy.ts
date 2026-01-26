import { UserProfile, DailyEnergy } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface TimeRecommendation {
  time: TimeOfDay;
  score: number; // 0-100
  description: string;
  emoji: string;
}

export interface ActivityTimeRecommendations {
  date: string;
  activity: string;
  recommendations: TimeRecommendation[];
  bestTime: TimeOfDay;
}

/**
 * Calculate energy scores for different times of day based on:
 * - User's personal energy rhythm
 * - Daily environmental energy
 * - Lunar phase influence
 * - Activity type requirements
 */
export function calculateTimeOfDayRecommendations(
  profile: UserProfile,
  date: Date,
  activity: string
): ActivityTimeRecommendations {
  const dailyEnergy = calculateDailyEnergy(profile, date);
  
  // Base scores from daily energy alignment
  const baseScore = dailyEnergy.connection.alignment === "strong" ? 80 : 
                    dailyEnergy.connection.alignment === "moderate" ? 60 : 40;

  // Activity-specific time preferences
  const activityPreferences = getActivityTimePreferences(activity);
  
  // Calculate scores for each time of day
  const recommendations: TimeRecommendation[] = [
    {
      time: "morning",
      score: calculateMorningScore(dailyEnergy, baseScore, activityPreferences),
      description: getMorningDescription(dailyEnergy, activity),
      emoji: "🌅",
    },
    {
      time: "afternoon",
      score: calculateAfternoonScore(dailyEnergy, baseScore, activityPreferences),
      description: getAfternoonDescription(dailyEnergy, activity),
      emoji: "☀️",
    },
    {
      time: "evening",
      score: calculateEveningScore(dailyEnergy, baseScore, activityPreferences),
      description: getEveningDescription(dailyEnergy, activity),
      emoji: "🌙",
    },
  ];

  // Sort by score to find best time
  const sorted = [...recommendations].sort((a, b) => b.score - a.score);
  const bestTime = sorted[0].time;

  return {
    date: date.toISOString(),
    activity,
    recommendations,
    bestTime,
  };
}

interface ActivityTimePreferences {
  morning: number;
  afternoon: number;
  evening: number;
}

function getActivityTimePreferences(activity: string): ActivityTimePreferences {
  const lowerActivity = activity.toLowerCase();

  // Creative and strategic work
  if (lowerActivity.includes("creative") || lowerActivity.includes("brainstorm") || 
      lowerActivity.includes("project") || lowerActivity.includes("launch")) {
    return { morning: 1.2, afternoon: 1.0, evening: 0.8 };
  }

  // Meetings and negotiations
  if (lowerActivity.includes("meeting") || lowerActivity.includes("negotiation") || 
      lowerActivity.includes("presentation")) {
    return { morning: 1.0, afternoon: 1.3, evening: 0.7 };
  }

  // Contracts and financial decisions
  if (lowerActivity.includes("contract") || lowerActivity.includes("financial") || 
      lowerActivity.includes("sign")) {
    return { morning: 1.3, afternoon: 1.1, evening: 0.6 };
  }

  // Social and team events
  if (lowerActivity.includes("team") || lowerActivity.includes("social") || 
      lowerActivity.includes("event")) {
    return { morning: 0.8, afternoon: 1.1, evening: 1.2 };
  }

  // Shopping and personal activities
  if (lowerActivity.includes("shopping") || lowerActivity.includes("personal")) {
    return { morning: 0.9, afternoon: 1.2, evening: 1.0 };
  }

  // Default: balanced
  return { morning: 1.0, afternoon: 1.0, evening: 1.0 };
}

function calculateMorningScore(
  dailyEnergy: DailyEnergy,
  baseScore: number,
  preferences: ActivityTimePreferences
): number {
  let score = baseScore * preferences.morning;

  // Morning is best for focused, high-energy activities
  if (dailyEnergy.userEnergy.type.includes("Focused") || 
      dailyEnergy.userEnergy.type.includes("Creative")) {
    score += 15;
  }

  // Lunar phase influence: New moon and waxing phases favor morning
  if (dailyEnergy.lunarPhase === "new_moon" || 
      dailyEnergy.lunarPhase === "waxing_crescent" || 
      dailyEnergy.lunarPhase === "first_quarter") {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

function calculateAfternoonScore(
  dailyEnergy: DailyEnergy,
  baseScore: number,
  preferences: ActivityTimePreferences
): number {
  let score = baseScore * preferences.afternoon;

  // Afternoon is best for communication and collaboration
  if (dailyEnergy.userEnergy.type.includes("Communicative") || 
      dailyEnergy.environmentalEnergy.type.includes("Harmonious")) {
    score += 15;
  }

  // Waxing gibbous and full moon favor afternoon activities
  if (dailyEnergy.lunarPhase === "waxing_gibbous" || 
      dailyEnergy.lunarPhase === "full_moon") {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

function calculateEveningScore(
  dailyEnergy: DailyEnergy,
  baseScore: number,
  preferences: ActivityTimePreferences
): number {
  let score = baseScore * preferences.evening;

  // Evening is best for reflection and social activities
  if (dailyEnergy.userEnergy.type.includes("Reflective") || 
      dailyEnergy.environmentalEnergy.type.includes("Harmonious")) {
    score += 15;
  }

  // Waning phases favor evening reflection
  if (dailyEnergy.lunarPhase === "waning_gibbous" || 
      dailyEnergy.lunarPhase === "last_quarter" || 
      dailyEnergy.lunarPhase === "waning_crescent") {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

function getMorningDescription(dailyEnergy: DailyEnergy, activity: string): string {
  const alignment = dailyEnergy.connection.alignment;
  
  if (alignment === "strong") {
    return "Peak energy and clarity. Ideal for important decisions and focused work.";
  } else if (alignment === "moderate") {
    return "Steady morning energy. Good for routine tasks and planning.";
  } else {
    return "Start slow. Use morning for preparation rather than major initiatives.";
  }
}

function getAfternoonDescription(dailyEnergy: DailyEnergy, activity: string): string {
  const alignment = dailyEnergy.connection.alignment;
  
  if (alignment === "strong") {
    return "Sustained momentum. Excellent for collaboration and execution.";
  } else if (alignment === "moderate") {
    return "Balanced afternoon energy. Suitable for meetings and communication.";
  } else {
    return "Energy may dip. Keep activities light and flexible.";
  }
}

function getEveningDescription(dailyEnergy: DailyEnergy, activity: string): string {
  const alignment = dailyEnergy.connection.alignment;
  
  if (alignment === "strong") {
    return "Strong evening flow. Great for social events and creative pursuits.";
  } else if (alignment === "moderate") {
    return "Calm evening energy. Good for reflection and lighter activities.";
  } else {
    return "Wind down gently. Focus on rest and personal time.";
  }
}

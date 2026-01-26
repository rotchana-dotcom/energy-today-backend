import { JournalEntry, UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export interface PatternInsight {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-100
  category: "mood" | "energy" | "timing" | "cycle";
  actionable: string; // Actionable advice
}

export interface PatternAnalysis {
  insights: PatternInsight[];
  totalEntries: number;
  analysisDate: string;
}

/**
 * Analyzes journal entries against energy readings to identify patterns
 * This is a Pro feature that helps users understand their personal rhythms
 */
export function analyzePatterns(
  entries: JournalEntry[],
  profile: UserProfile
): PatternAnalysis {
  const insights: PatternInsight[] = [];

  if (entries.length < 5) {
    return {
      insights: [{
        id: "insufficient_data",
        title: "Keep Logging",
        description: "We need at least 5 journal entries to identify meaningful patterns. Keep tracking your daily experiences!",
        confidence: 100,
        category: "timing",
        actionable: "Continue logging your moods and observations for deeper insights.",
      }],
      totalEntries: entries.length,
      analysisDate: new Date().toISOString(),
    };
  }

  // Analyze mood patterns against energy alignment
  const moodEnergyInsight = analyzeMoodEnergyCorrelation(entries, profile);
  if (moodEnergyInsight) insights.push(moodEnergyInsight);

  // Analyze challenging days
  const challengingDaysInsight = analyzeChallengingDays(entries, profile);
  if (challengingDaysInsight) insights.push(challengingDaysInsight);

  // Analyze strong alignment days
  const strongDaysInsight = analyzeStrongAlignmentDays(entries, profile);
  if (strongDaysInsight) insights.push(strongDaysInsight);

  // Analyze menstrual cycle patterns (if applicable)
  const cycleInsight = analyzeMenstrualCyclePatterns(entries, profile);
  if (cycleInsight) insights.push(cycleInsight);

  // Analyze weekly patterns
  const weeklyInsight = analyzeWeeklyPatterns(entries, profile);
  if (weeklyInsight) insights.push(weeklyInsight);

  return {
    insights,
    totalEntries: entries.length,
    analysisDate: new Date().toISOString(),
  };
}

function analyzeMoodEnergyCorrelation(
  entries: JournalEntry[],
  profile: UserProfile
): PatternInsight | null {
  const entriesWithMood = entries.filter((e) => e.mood);
  if (entriesWithMood.length < 3) return null;

  let happyOnStrong = 0;
  let sadOnChallenging = 0;
  let totalStrong = 0;
  let totalChallenging = 0;

  entriesWithMood.forEach((entry) => {
    const date = new Date(entry.date);
    const energy = calculateDailyEnergy(profile, date);

    if (energy.connection.alignment === "strong") {
      totalStrong++;
      if (entry.mood === "happy") happyOnStrong++;
    } else if (energy.connection.alignment === "challenging") {
      totalChallenging++;
      if (entry.mood === "sad") sadOnChallenging++;
    }
  });

  const strongCorrelation = totalStrong > 0 ? (happyOnStrong / totalStrong) * 100 : 0;
  const challengingCorrelation = totalChallenging > 0 ? (sadOnChallenging / totalChallenging) * 100 : 0;

  if (strongCorrelation > 60 || challengingCorrelation > 60) {
    return {
      id: "mood_energy_correlation",
      title: "Mood-Energy Connection",
      description: `Your mood closely tracks your energy alignment. You tend to feel ${strongCorrelation > 60 ? "happier on days with strong alignment" : "lower on challenging alignment days"}.`,
      confidence: Math.round(Math.max(strongCorrelation, challengingCorrelation)),
      category: "mood",
      actionable: "Use the calendar to plan important activities on strong alignment days when your mood is likely to be more positive.",
    };
  }

  return null;
}

function analyzeChallengingDays(
  entries: JournalEntry[],
  profile: UserProfile
): PatternInsight | null {
  let challengingDaysWithStress = 0;
  let totalChallengingDays = 0;

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const energy = calculateDailyEnergy(profile, date);

    if (energy.connection.alignment === "challenging") {
      totalChallengingDays++;
      const notesLower = entry.notes.toLowerCase();
      if (notesLower.includes("stress") || notesLower.includes("difficult") || 
          notesLower.includes("hard") || notesLower.includes("challenging") ||
          notesLower.includes("tired") || notesLower.includes("overwhelm")) {
        challengingDaysWithStress++;
      }
    }
  });

  if (totalChallengingDays >= 3 && (challengingDaysWithStress / totalChallengingDays) > 0.5) {
    return {
      id: "challenging_day_stress",
      title: "Challenging Energy Impact",
      description: `You've logged stress or difficulty on ${Math.round((challengingDaysWithStress / totalChallengingDays) * 100)}% of challenging alignment days. This suggests your energy sensitivity is high.`,
      confidence: 75,
      category: "energy",
      actionable: "On challenging days, reduce your schedule, practice self-care, and avoid major decisions. Your body is telling you to slow down.",
    };
  }

  return null;
}

function analyzeStrongAlignmentDays(
  entries: JournalEntry[],
  profile: UserProfile
): PatternInsight | null {
  let strongDaysWithPositive = 0;
  let totalStrongDays = 0;

  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const energy = calculateDailyEnergy(profile, date);

    if (energy.connection.alignment === "strong") {
      totalStrongDays++;
      const notesLower = entry.notes.toLowerCase();
      if (notesLower.includes("great") || notesLower.includes("good") || 
          notesLower.includes("productive") || notesLower.includes("accomplished") ||
          notesLower.includes("energy") || notesLower.includes("flow")) {
        strongDaysWithPositive++;
      }
    }
  });

  if (totalStrongDays >= 3 && (strongDaysWithPositive / totalStrongDays) > 0.6) {
    return {
      id: "strong_alignment_productivity",
      title: "Peak Performance Pattern",
      description: `You consistently report feeling productive and energized on strong alignment days. You've logged positive experiences on ${Math.round((strongDaysWithPositive / totalStrongDays) * 100)}% of these days.`,
      confidence: 80,
      category: "energy",
      actionable: "Schedule your most important work, launches, and decisions on strong alignment days to maximize your natural peak performance.",
    };
  }

  return null;
}

function analyzeMenstrualCyclePatterns(
  entries: JournalEntry[],
  profile: UserProfile
): PatternInsight | null {
  const cycleEntries = entries.filter((e) => e.menstrualCycle);
  if (cycleEntries.length < 2) return null;

  let cycleDaysWithLowMood = 0;

  cycleEntries.forEach((entry) => {
    if (entry.mood === "sad" || entry.mood === "neutral") {
      cycleDaysWithLowMood++;
    }
  });

  if ((cycleDaysWithLowMood / cycleEntries.length) > 0.5) {
    return {
      id: "menstrual_cycle_mood",
      title: "Cycle-Mood Connection",
      description: `Your mood tends to be lower during your menstrual cycle. This is a natural hormonal pattern that affects energy levels.`,
      confidence: 70,
      category: "cycle",
      actionable: "Plan lighter schedules during your cycle. Prioritize rest, gentle movement, and self-compassion during this time.",
    };
  }

  return null;
}

function analyzeWeeklyPatterns(
  entries: JournalEntry[],
  profile: UserProfile
): PatternInsight | null {
  const dayOfWeekMoods: Record<number, { happy: number; sad: number; neutral: number; total: number }> = {
    0: { happy: 0, sad: 0, neutral: 0, total: 0 },
    1: { happy: 0, sad: 0, neutral: 0, total: 0 },
    2: { happy: 0, sad: 0, neutral: 0, total: 0 },
    3: { happy: 0, sad: 0, neutral: 0, total: 0 },
    4: { happy: 0, sad: 0, neutral: 0, total: 0 },
    5: { happy: 0, sad: 0, neutral: 0, total: 0 },
    6: { happy: 0, sad: 0, neutral: 0, total: 0 },
  };

  entries.filter((e) => e.mood).forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    dayOfWeekMoods[dayOfWeek].total++;
    if (entry.mood === "happy") dayOfWeekMoods[dayOfWeek].happy++;
    if (entry.mood === "sad") dayOfWeekMoods[dayOfWeek].sad++;
    if (entry.mood === "neutral") dayOfWeekMoods[dayOfWeek].neutral++;
  });

  // Find the best and worst days
  let bestDay = 0;
  let worstDay = 0;
  let bestScore = 0;
  let worstScore = 100;

  Object.entries(dayOfWeekMoods).forEach(([day, moods]) => {
    if (moods.total >= 2) {
      const happyPercent = (moods.happy / moods.total) * 100;
      if (happyPercent > bestScore) {
        bestScore = happyPercent;
        bestDay = parseInt(day);
      }
      if (happyPercent < worstScore) {
        worstScore = happyPercent;
        worstDay = parseInt(day);
      }
    }
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (bestScore > 60 && worstScore < 40 && bestDay !== worstDay) {
    return {
      id: "weekly_pattern",
      title: "Weekly Rhythm",
      description: `You tend to feel best on ${dayNames[bestDay]}s and lowest on ${dayNames[worstDay]}s. This weekly pattern is consistent across your entries.`,
      confidence: 65,
      category: "timing",
      actionable: `Schedule important activities and social events on ${dayNames[bestDay]}s. Use ${dayNames[worstDay]}s for lighter tasks and self-care.`,
    };
  }

  return null;
}

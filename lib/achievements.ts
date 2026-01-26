/**
 * Achievement Badge System
 * 
 * Gamification with milestone rewards
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ACHIEVEMENTS_KEY = "@energy_today:achievements";
const EARNED_BADGES_KEY = "@energy_today:earned_badges";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "energy" | "journal" | "habits" | "social" | "special";
  requirement: number;
  earned: boolean;
  earnedAt?: string;
  progress: number; // 0-100
}

export interface BadgeCategory {
  name: string;
  badges: Badge[];
}

/**
 * Badge definitions
 */
const BADGE_DEFINITIONS: Omit<Badge, "earned" | "earnedAt" | "progress">[] = [
  // Streak Badges
  {
    id: "streak_3",
    name: "Getting Started",
    description: "Log energy for 3 days in a row",
    icon: "🔥",
    category: "streak",
    requirement: 3,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Log energy for 7 days in a row",
    icon: "⚡",
    category: "streak",
    requirement: 7,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "Log energy for 30 days in a row",
    icon: "🏆",
    category: "streak",
    requirement: 30,
  },
  {
    id: "streak_100",
    name: "Century Club",
    description: "Log energy for 100 days in a row",
    icon: "💯",
    category: "streak",
    requirement: 100,
  },

  // Energy Badges
  {
    id: "energy_high_10",
    name: "Energy Surge",
    description: "Achieve 80%+ energy 10 times",
    icon: "⚡",
    category: "energy",
    requirement: 10,
  },
  {
    id: "energy_consistent",
    name: "Steady State",
    description: "Maintain 60-80% energy for 14 days",
    icon: "📊",
    category: "energy",
    requirement: 14,
  },
  {
    id: "energy_top_percentile",
    name: "Top 10%",
    description: "Rank in top 10% of your profile type",
    icon: "🌟",
    category: "energy",
    requirement: 90, // percentile
  },

  // Journal Badges
  {
    id: "journal_10",
    name: "Journaling Novice",
    description: "Complete 10 journal entries",
    icon: "📝",
    category: "journal",
    requirement: 10,
  },
  {
    id: "journal_50",
    name: "Reflective Mind",
    description: "Complete 50 journal entries",
    icon: "📖",
    category: "journal",
    requirement: 50,
  },
  {
    id: "journal_100",
    name: "Master Chronicler",
    description: "Complete 100 journal entries",
    icon: "📚",
    category: "journal",
    requirement: 100,
  },
  {
    id: "voice_journal_10",
    name: "Voice of Wisdom",
    description: "Record 10 voice journal entries",
    icon: "🎙️",
    category: "journal",
    requirement: 10,
  },

  // Habit Badges
  {
    id: "habits_tracked_5",
    name: "Habit Builder",
    description: "Track 5 different habits",
    icon: "✅",
    category: "habits",
    requirement: 5,
  },
  {
    id: "habit_streak_30",
    name: "Habit Hero",
    description: "Complete a habit for 30 days straight",
    icon: "🦸",
    category: "habits",
    requirement: 30,
  },
  {
    id: "positive_habit_impact",
    name: "Energy Optimizer",
    description: "Have a habit with +15% energy impact",
    icon: "🎯",
    category: "habits",
    requirement: 15,
  },

  // Social Badges
  {
    id: "team_sync_5",
    name: "Team Player",
    description: "Complete 5 team syncs",
    icon: "🤝",
    category: "social",
    requirement: 5,
  },
  {
    id: "meeting_optimizer",
    name: "Meeting Master",
    description: "Find optimal meeting times 10 times",
    icon: "📅",
    category: "social",
    requirement: 10,
  },
  {
    id: "community_contributor",
    name: "Community Star",
    description: "Check community comparison 20 times",
    icon: "⭐",
    category: "social",
    requirement: 20,
  },

  // Special Badges
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Join Energy Today in its first year",
    icon: "🚀",
    category: "special",
    requirement: 1,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Achieve 100% energy 5 times",
    icon: "💎",
    category: "special",
    requirement: 5,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Log high energy after 10 PM 10 times",
    icon: "🦉",
    category: "special",
    requirement: 10,
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Log high energy before 7 AM 10 times",
    icon: "🐦",
    category: "special",
    requirement: 10,
  },
];

/**
 * Get all badges with earned status
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const earnedData = await AsyncStorage.getItem(EARNED_BADGES_KEY);
    const earnedBadges: Record<string, { earnedAt: string }> = earnedData
      ? JSON.parse(earnedData)
      : {};

    const badges: Badge[] = BADGE_DEFINITIONS.map((def) => ({
      ...def,
      earned: !!earnedBadges[def.id],
      earnedAt: earnedBadges[def.id]?.earnedAt,
      progress: 0, // Will be calculated separately
    }));

    return badges;
  } catch (error) {
    console.error("Failed to get badges:", error);
    return [];
  }
}

/**
 * Get badges grouped by category
 */
export async function getBadgesByCategory(): Promise<BadgeCategory[]> {
  const badges = await getAllBadges();

  const categories: BadgeCategory[] = [
    { name: "Streak", badges: badges.filter((b) => b.category === "streak") },
    { name: "Energy", badges: badges.filter((b) => b.category === "energy") },
    { name: "Journal", badges: badges.filter((b) => b.category === "journal") },
    { name: "Habits", badges: badges.filter((b) => b.category === "habits") },
    { name: "Social", badges: badges.filter((b) => b.category === "social") },
    { name: "Special", badges: badges.filter((b) => b.category === "special") },
  ];

  return categories.filter((cat) => cat.badges.length > 0);
}

/**
 * Get earned badges
 */
export async function getEarnedBadges(): Promise<Badge[]> {
  const badges = await getAllBadges();
  return badges.filter((b) => b.earned);
}

/**
 * Check and unlock badge
 */
export async function unlockBadge(badgeId: string): Promise<boolean> {
  try {
    const earnedData = await AsyncStorage.getItem(EARNED_BADGES_KEY);
    const earnedBadges: Record<string, { earnedAt: string }> = earnedData
      ? JSON.parse(earnedData)
      : {};

    // Check if already earned
    if (earnedBadges[badgeId]) {
      return false;
    }

    // Earn badge
    earnedBadges[badgeId] = {
      earnedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(earnedBadges));

    // Send notification
    const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    if (badge && Platform.OS !== "web") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 Badge Unlocked: ${badge.name}`,
          body: badge.description,
          data: { type: "badge_unlocked", badgeId },
        },
        trigger: null, // Send immediately
      });
    }

    return true;
  } catch (error) {
    console.error("Failed to unlock badge:", error);
    return false;
  }
}

/**
 * Check achievements based on user stats
 */
export async function checkAchievements(stats: {
  currentStreak?: number;
  totalEntries?: number;
  highEnergyCount?: number;
  voiceJournalCount?: number;
  habitsTracked?: number;
  teamSyncCount?: number;
  percentile?: number;
}): Promise<string[]> {
  const unlockedBadges: string[] = [];

  // Check streak badges
  if (stats.currentStreak) {
    if (stats.currentStreak >= 3 && (await unlockBadge("streak_3"))) {
      unlockedBadges.push("streak_3");
    }
    if (stats.currentStreak >= 7 && (await unlockBadge("streak_7"))) {
      unlockedBadges.push("streak_7");
    }
    if (stats.currentStreak >= 30 && (await unlockBadge("streak_30"))) {
      unlockedBadges.push("streak_30");
    }
    if (stats.currentStreak >= 100 && (await unlockBadge("streak_100"))) {
      unlockedBadges.push("streak_100");
    }
  }

  // Check journal badges
  if (stats.totalEntries) {
    if (stats.totalEntries >= 10 && (await unlockBadge("journal_10"))) {
      unlockedBadges.push("journal_10");
    }
    if (stats.totalEntries >= 50 && (await unlockBadge("journal_50"))) {
      unlockedBadges.push("journal_50");
    }
    if (stats.totalEntries >= 100 && (await unlockBadge("journal_100"))) {
      unlockedBadges.push("journal_100");
    }
  }

  // Check energy badges
  if (stats.highEnergyCount) {
    if (stats.highEnergyCount >= 10 && (await unlockBadge("energy_high_10"))) {
      unlockedBadges.push("energy_high_10");
    }
  }

  if (stats.percentile && stats.percentile >= 90) {
    if (await unlockBadge("energy_top_percentile")) {
      unlockedBadges.push("energy_top_percentile");
    }
  }

  // Check voice journal badges
  if (stats.voiceJournalCount && stats.voiceJournalCount >= 10) {
    if (await unlockBadge("voice_journal_10")) {
      unlockedBadges.push("voice_journal_10");
    }
  }

  // Check habit badges
  if (stats.habitsTracked && stats.habitsTracked >= 5) {
    if (await unlockBadge("habits_tracked_5")) {
      unlockedBadges.push("habits_tracked_5");
    }
  }

  // Check social badges
  if (stats.teamSyncCount) {
    if (stats.teamSyncCount >= 5 && (await unlockBadge("team_sync_5"))) {
      unlockedBadges.push("team_sync_5");
    }
  }

  return unlockedBadges;
}

/**
 * Get badge progress for a specific badge
 */
export async function getBadgeProgress(badgeId: string, currentValue: number): Promise<number> {
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!badge) return 0;

  const progress = Math.min(100, (currentValue / badge.requirement) * 100);
  return Math.round(progress);
}

/**
 * Get total badge stats
 */
export async function getBadgeStats(): Promise<{
  totalBadges: number;
  earnedBadges: number;
  percentage: number;
}> {
  const badges = await getAllBadges();
  const earned = badges.filter((b) => b.earned).length;

  return {
    totalBadges: badges.length,
    earnedBadges: earned,
    percentage: Math.round((earned / badges.length) * 100),
  };
}

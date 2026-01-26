import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// TYPES
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  criteria: {
    type: "count" | "streak" | "score";
    target: number;
    metric: string; // e.g., "meditation_sessions", "sleep_logs", "tasks_completed"
  };
  unlocked: boolean;
  unlockedAt?: string; // ISO date
  progress: number; // Current progress towards target
}

export interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GAMIFICATION_STORAGE_KEY = "@energy_today_gamification";
const XP_PER_LEVEL = 500;

// XP rewards for different actions
export const XP_REWARDS = {
  sleep_log: 10,
  meditation_session: 15,
  meal_log: 5,
  task_complete: 8,
  journal_entry: 12,
  workout_log: 10,
  ai_insight_read: 5,
  streak_milestone: 50,
  badge_unlock: 100,
};

// Badge definitions
export const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "progress" | "unlockedAt">[] = [
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Log sleep 7 days in a row",
    icon: "🌅",
    criteria: {
      type: "streak",
      target: 7,
      metric: "sleep",
    },
  },
  {
    id: "zen_master",
    name: "Zen Master",
    description: "Complete 50 meditation sessions",
    icon: "🧘",
    criteria: {
      type: "count",
      target: 50,
      metric: "meditation_sessions",
    },
  },
  {
    id: "nutrition_champion",
    name: "Nutrition Champion",
    description: "Log meals for 30 days straight",
    icon: "🍎",
    criteria: {
      type: "streak",
      target: 30,
      metric: "nutrition",
    },
  },
  {
    id: "task_crusher",
    name: "Task Crusher",
    description: "Complete 100 tasks",
    icon: "✅",
    criteria: {
      type: "count",
      target: 100,
      metric: "tasks_completed",
    },
  },
  {
    id: "energy_warrior",
    name: "Energy Warrior",
    description: "Maintain 80%+ energy score for 7 days",
    icon: "⚡",
    criteria: {
      type: "streak",
      target: 7,
      metric: "high_energy",
    },
  },
  {
    id: "fitness_pro",
    name: "Fitness Pro",
    description: "Log 30 workouts",
    icon: "💪",
    criteria: {
      type: "count",
      target: 30,
      metric: "workouts",
    },
  },
  {
    id: "insight_seeker",
    name: "Insight Seeker",
    description: "Read 20 AI predictions",
    icon: "🤖",
    criteria: {
      type: "count",
      target: 20,
      metric: "ai_insights_read",
    },
  },
  {
    id: "journal_keeper",
    name: "Journal Keeper",
    description: "Write 30 journal entries",
    icon: "📔",
    criteria: {
      type: "count",
      target: 30,
      metric: "journal_entries",
    },
  },
  {
    id: "consistency_king",
    name: "Consistency King",
    description: "Log activity for 90 days straight",
    icon: "👑",
    criteria: {
      type: "streak",
      target: 90,
      metric: "any",
    },
  },
  {
    id: "legendary",
    name: "Legendary",
    description: "Reach Level 20",
    icon: "🏆",
    criteria: {
      type: "count",
      target: 20,
      metric: "level",
    },
  },
];

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

interface GamificationData {
  xp: number;
  level: number;
  badges: Badge[];
  metrics: Record<string, number>; // Track counts for badge progress
}

async function getGamificationData(): Promise<GamificationData> {
  try {
    const data = await AsyncStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting gamification data:", error);
  }
  
  // Initialize with default data
  return {
    xp: 0,
    level: 1,
    badges: BADGE_DEFINITIONS.map((def) => ({
      ...def,
      unlocked: false,
      progress: 0,
    })),
    metrics: {},
  };
}

async function saveGamificationData(data: GamificationData): Promise<void> {
  try {
    await AsyncStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving gamification data:", error);
  }
}

// ============================================================================
// XP & LEVEL FUNCTIONS
// ============================================================================

/**
 * Add XP and check for level up
 */
export async function addXP(amount: number): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
  const data = await getGamificationData();
  
  const oldLevel = data.level;
  data.xp += amount;
  
  // Check for level up
  while (data.xp >= data.level * XP_PER_LEVEL) {
    data.xp -= data.level * XP_PER_LEVEL;
    data.level += 1;
  }
  
  await saveGamificationData(data);
  
  return {
    leveledUp: data.level > oldLevel,
    newLevel: data.level,
    newXP: data.xp,
  };
}

/**
 * Get current level and XP
 */
export async function getUserLevel(): Promise<UserLevel> {
  const data = await getGamificationData();
  
  return {
    level: data.level,
    xp: data.xp,
    xpToNextLevel: data.level * XP_PER_LEVEL,
    title: getLevelTitle(data.level),
  };
}

/**
 * Get level title based on level number
 */
function getLevelTitle(level: number): string {
  if (level < 5) return "Energy Novice";
  if (level < 10) return "Energy Apprentice";
  if (level < 15) return "Energy Adept";
  if (level < 20) return "Energy Master";
  if (level < 30) return "Energy Sage";
  return "Energy Legend";
}

// ============================================================================
// BADGE FUNCTIONS
// ============================================================================

/**
 * Update metric and check for badge unlocks
 */
export async function updateMetric(metric: string, value: number): Promise<Badge[]> {
  const data = await getGamificationData();
  
  // Update metric
  data.metrics[metric] = value;
  
  // Check all badges for unlocks
  const newlyUnlocked: Badge[] = [];
  
  for (const badge of data.badges) {
    if (badge.unlocked) continue;
    
    // Check if badge criteria met
    let progress = 0;
    if (badge.criteria.metric === metric || badge.criteria.metric === "any") {
      progress = value;
    } else if (data.metrics[badge.criteria.metric]) {
      progress = data.metrics[badge.criteria.metric];
    }
    
    badge.progress = progress;
    
    if (progress >= badge.criteria.target) {
      badge.unlocked = true;
      badge.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(badge);
      
      // Award XP for unlocking badge
      await addXP(XP_REWARDS.badge_unlock);
    }
  }
  
  await saveGamificationData(data);
  
  return newlyUnlocked;
}

/**
 * Get all badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  const data = await getGamificationData();
  return data.badges;
}

/**
 * Get unlocked badges count
 */
export async function getUnlockedBadgesCount(): Promise<number> {
  const badges = await getAllBadges();
  return badges.filter((b) => b.unlocked).length;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Award XP for an action
 */
export async function awardXPForAction(action: keyof typeof XP_REWARDS): Promise<void> {
  const xpAmount = XP_REWARDS[action];
  if (xpAmount) {
    await addXP(xpAmount);
  }
}

/**
 * Get progress towards next badge
 */
export async function getNextBadgeProgress(): Promise<{ badge: Badge; percentage: number } | null> {
  const badges = await getAllBadges();
  const lockedBadges = badges.filter((b) => !b.unlocked);
  
  if (lockedBadges.length === 0) return null;
  
  // Find badge with highest progress
  const nextBadge = lockedBadges.reduce((prev, current) => {
    const prevPercentage = (prev.progress / prev.criteria.target) * 100;
    const currentPercentage = (current.progress / current.criteria.target) * 100;
    return currentPercentage > prevPercentage ? current : prev;
  });
  
  const percentage = (nextBadge.progress / nextBadge.criteria.target) * 100;
  
  return {
    badge: nextBadge,
    percentage: Math.min(100, percentage),
  };
}

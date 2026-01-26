import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_LEVEL_KEY = "user_level";
const USER_XP_KEY = "user_xp";
const ACHIEVEMENTS_KEY = "user_achievements";
const DAILY_CHALLENGES_KEY = "daily_challenges";
const WEEKLY_CHALLENGES_KEY = "weekly_challenges";
const LEADERBOARD_KEY = "leaderboard_data";
const REWARDS_KEY = "user_rewards";

export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "energy" | "habits" | "social" | "wellness" | "special";
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  progressMax?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  xpReward: number;
  status: "active" | "completed" | "expired";
  progress: number;
  progressMax: number;
  expiresAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  totalXP: number;
  rank: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number; // XP cost
  type: "theme" | "badge" | "feature" | "boost";
  unlocked: boolean;
}

/**
 * XP requirements for each level
 */
function getXPForLevel(level: number): number {
  // Exponential growth: level^2 * 100
  return Math.floor(Math.pow(level, 2) * 100);
}

/**
 * Get user level
 */
export async function getUserLevel(): Promise<UserLevel> {
  try {
    const levelData = await AsyncStorage.getItem(USER_LEVEL_KEY);
    const xpData = await AsyncStorage.getItem(USER_XP_KEY);
    
    const level = levelData ? parseInt(levelData) : 1;
    const totalXP = xpData ? parseInt(xpData) : 0;
    
    const xpForCurrentLevel = level > 1 ? getXPForLevel(level - 1) : 0;
    const xpForNextLevel = getXPForLevel(level);
    const currentXP = totalXP - xpForCurrentLevel;
    const xpToNextLevel = xpForNextLevel - xpForCurrentLevel;
    
    return {
      level,
      currentXP,
      xpToNextLevel,
      totalXP,
    };
  } catch (error) {
    console.error("Failed to get user level:", error);
    return {
      level: 1,
      currentXP: 0,
      xpToNextLevel: 100,
      totalXP: 0,
    };
  }
}

/**
 * Add XP and check for level up
 */
export async function addXP(amount: number): Promise<{
  leveledUp: boolean;
  newLevel?: number;
  totalXP: number;
}> {
  try {
    const currentLevel = await getUserLevel();
    const newTotalXP = currentLevel.totalXP + amount;
    
    await AsyncStorage.setItem(USER_XP_KEY, newTotalXP.toString());
    
    // Check for level up
    let newLevel = currentLevel.level;
    while (newTotalXP >= getXPForLevel(newLevel)) {
      newLevel++;
    }
    
    const leveledUp = newLevel > currentLevel.level;
    
    if (leveledUp) {
      await AsyncStorage.setItem(USER_LEVEL_KEY, newLevel.toString());
    }
    
    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      totalXP: newTotalXP,
    };
  } catch (error) {
    console.error("Failed to add XP:", error);
    throw error;
  }
}

/**
 * Get all achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize with default achievements
    const achievements = getDefaultAchievements();
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return achievements;
  } catch (error) {
    console.error("Failed to get achievements:", error);
    return [];
  }
}

/**
 * Default achievements
 */
function getDefaultAchievements(): Achievement[] {
  return [
    // Energy achievements
    {
      id: "first_log",
      title: "First Steps",
      description: "Log your first energy reading",
      icon: "⚡",
      category: "energy",
      xpReward: 50,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    {
      id: "week_streak",
      title: "Week Warrior",
      description: "Log energy for 7 days in a row",
      icon: "🔥",
      category: "energy",
      xpReward: 200,
      unlocked: false,
      progress: 0,
      progressMax: 7,
    },
    {
      id: "month_streak",
      title: "Monthly Master",
      description: "Log energy for 30 days in a row",
      icon: "🏆",
      category: "energy",
      xpReward: 500,
      unlocked: false,
      progress: 0,
      progressMax: 30,
    },
    {
      id: "high_energy",
      title: "Peak Performance",
      description: "Reach 90+ energy level",
      icon: "🚀",
      category: "energy",
      xpReward: 100,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    
    // Habit achievements
    {
      id: "first_habit",
      title: "Habit Starter",
      description: "Create your first habit",
      icon: "🌱",
      category: "habits",
      xpReward: 50,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    {
      id: "habit_master",
      title: "Habit Master",
      description: "Complete 100 habit check-ins",
      icon: "💪",
      category: "habits",
      xpReward: 300,
      unlocked: false,
      progress: 0,
      progressMax: 100,
    },
    {
      id: "perfect_day",
      title: "Perfect Day",
      description: "Complete all habits in one day",
      icon: "✨",
      category: "habits",
      xpReward: 150,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    
    // Social achievements
    {
      id: "first_friend",
      title: "Social Butterfly",
      description: "Add your first friend",
      icon: "👥",
      category: "social",
      xpReward: 75,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    {
      id: "team_player",
      title: "Team Player",
      description: "Complete a group challenge",
      icon: "🤝",
      category: "social",
      xpReward: 200,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    
    // Wellness achievements
    {
      id: "sleep_champion",
      title: "Sleep Champion",
      description: "Log 7 nights of 8+ hours sleep",
      icon: "😴",
      category: "wellness",
      xpReward: 250,
      unlocked: false,
      progress: 0,
      progressMax: 7,
    },
    {
      id: "workout_warrior",
      title: "Workout Warrior",
      description: "Complete 20 workouts",
      icon: "🏋️",
      category: "wellness",
      xpReward: 300,
      unlocked: false,
      progress: 0,
      progressMax: 20,
    },
    {
      id: "meditation_master",
      title: "Meditation Master",
      description: "Complete 30 meditation sessions",
      icon: "🧘",
      category: "wellness",
      xpReward: 350,
      unlocked: false,
      progress: 0,
      progressMax: 30,
    },
    
    // Special achievements
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Log energy before 7 AM",
      icon: "🌅",
      category: "special",
      xpReward: 100,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    {
      id: "night_owl",
      title: "Night Owl",
      description: "Log energy after 10 PM",
      icon: "🦉",
      category: "special",
      xpReward: 100,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
    {
      id: "century_club",
      title: "Century Club",
      description: "Reach level 100",
      icon: "💯",
      category: "special",
      xpReward: 1000,
      unlocked: false,
      progress: 0,
      progressMax: 1,
    },
  ];
}

/**
 * Unlock achievement
 */
export async function unlockAchievement(
  achievementId: string
): Promise<{
  success: boolean;
  achievement?: Achievement;
  xpGained: number;
}> {
  try {
    const achievements = await getAchievements();
    const achievement = achievements.find((a) => a.id === achievementId);
    
    if (!achievement) {
      return { success: false, xpGained: 0 };
    }
    
    if (achievement.unlocked) {
      return { success: false, xpGained: 0 };
    }
    
    achievement.unlocked = true;
    achievement.unlockedDate = new Date().toISOString();
    
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    
    // Award XP
    await addXP(achievement.xpReward);
    
    return {
      success: true,
      achievement,
      xpGained: achievement.xpReward,
    };
  } catch (error) {
    console.error("Failed to unlock achievement:", error);
    return { success: false, xpGained: 0 };
  }
}

/**
 * Update achievement progress
 */
export async function updateAchievementProgress(
  achievementId: string,
  progress: number
): Promise<{
  unlocked: boolean;
  achievement?: Achievement;
}> {
  try {
    const achievements = await getAchievements();
    const achievement = achievements.find((a) => a.id === achievementId);
    
    if (!achievement || achievement.unlocked) {
      return { unlocked: false };
    }
    
    achievement.progress = progress;
    
    // Check if achievement is complete
    if (achievement.progressMax && progress >= achievement.progressMax) {
      const result = await unlockAchievement(achievementId);
      return {
        unlocked: result.success,
        achievement: result.achievement,
      };
    }
    
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    
    return { unlocked: false };
  } catch (error) {
    console.error("Failed to update achievement progress:", error);
    return { unlocked: false };
  }
}

/**
 * Get daily challenges
 */
export async function getDailyChallenges(): Promise<Challenge[]> {
  try {
    const data = await AsyncStorage.getItem(DAILY_CHALLENGES_KEY);
    if (data) {
      const challenges: Challenge[] = JSON.parse(data);
      
      // Check if challenges have expired
      const now = new Date();
      const needsRefresh = challenges.some((c) => new Date(c.expiresAt) < now);
      
      if (needsRefresh) {
        return await generateDailyChallenges();
      }
      
      return challenges;
    }
    
    return await generateDailyChallenges();
  } catch (error) {
    console.error("Failed to get daily challenges:", error);
    return [];
  }
}

/**
 * Generate daily challenges
 */
async function generateDailyChallenges(): Promise<Challenge[]> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(23, 59, 59, 999);
  
  const challenges: Challenge[] = [
    {
      id: `daily_energy_${now.toISOString().split("T")[0]}`,
      title: "Energy Check-In",
      description: "Log your energy level 3 times today",
      type: "daily",
      xpReward: 50,
      status: "active",
      progress: 0,
      progressMax: 3,
      expiresAt: expiresAt.toISOString(),
    },
    {
      id: `daily_habit_${now.toISOString().split("T")[0]}`,
      title: "Habit Hero",
      description: "Complete 3 habits today",
      type: "daily",
      xpReward: 75,
      status: "active",
      progress: 0,
      progressMax: 3,
      expiresAt: expiresAt.toISOString(),
    },
    {
      id: `daily_wellness_${now.toISOString().split("T")[0]}`,
      title: "Wellness Warrior",
      description: "Complete a workout or meditation session",
      type: "daily",
      xpReward: 100,
      status: "active",
      progress: 0,
      progressMax: 1,
      expiresAt: expiresAt.toISOString(),
    },
  ];
  
  await AsyncStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(challenges));
  
  return challenges;
}

/**
 * Complete challenge
 */
export async function completeChallenge(
  challengeId: string
): Promise<{
  success: boolean;
  xpGained: number;
}> {
  try {
    const dailyChallenges = await getDailyChallenges();
    const challenge = dailyChallenges.find((c) => c.id === challengeId);
    
    if (!challenge || challenge.status === "completed") {
      return { success: false, xpGained: 0 };
    }
    
    challenge.status = "completed";
    challenge.progress = challenge.progressMax;
    
    await AsyncStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(dailyChallenges));
    
    // Award XP
    await addXP(challenge.xpReward);
    
    return {
      success: true,
      xpGained: challenge.xpReward,
    };
  } catch (error) {
    console.error("Failed to complete challenge:", error);
    return { success: false, xpGained: 0 };
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  type: "global" | "friends" = "global"
): Promise<LeaderboardEntry[]> {
  try {
    // In real implementation, would fetch from server
    // For now, generate sample data
    
    const currentUser = await getUserLevel();
    
    const leaderboard: LeaderboardEntry[] = [
      {
        userId: "user1",
        username: "EnergyMaster",
        level: 45,
        totalXP: 202500,
        rank: 1,
      },
      {
        userId: "user2",
        username: "WellnessGuru",
        level: 42,
        totalXP: 176400,
        rank: 2,
      },
      {
        userId: "user3",
        username: "HabitHero",
        level: 38,
        totalXP: 144400,
        rank: 3,
      },
      {
        userId: "current",
        username: "You",
        level: currentUser.level,
        totalXP: currentUser.totalXP,
        rank: 4,
      },
      {
        userId: "user4",
        username: "FitnessFreak",
        level: 35,
        totalXP: 122500,
        rank: 5,
      },
    ];
    
    return leaderboard;
  } catch (error) {
    console.error("Failed to get leaderboard:", error);
    return [];
  }
}

/**
 * Get rewards
 */
export async function getRewards(): Promise<Reward[]> {
  try {
    const data = await AsyncStorage.getItem(REWARDS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    const rewards: Reward[] = [
      {
        id: "theme_dark",
        title: "Dark Theme",
        description: "Unlock the dark theme",
        cost: 500,
        type: "theme",
        unlocked: false,
      },
      {
        id: "theme_ocean",
        title: "Ocean Theme",
        description: "Unlock the ocean theme",
        cost: 1000,
        type: "theme",
        unlocked: false,
      },
      {
        id: "badge_gold",
        title: "Gold Badge",
        description: "Show off your gold badge",
        cost: 2000,
        type: "badge",
        unlocked: false,
      },
      {
        id: "feature_advanced_analytics",
        title: "Advanced Analytics",
        description: "Unlock advanced analytics features",
        cost: 3000,
        type: "feature",
        unlocked: false,
      },
      {
        id: "boost_2x_xp",
        title: "2x XP Boost (24h)",
        description: "Double XP for 24 hours",
        cost: 1500,
        type: "boost",
        unlocked: false,
      },
    ];
    
    await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
    return rewards;
  } catch (error) {
    console.error("Failed to get rewards:", error);
    return [];
  }
}

/**
 * Redeem reward
 */
export async function redeemReward(
  rewardId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const rewards = await getRewards();
    const reward = rewards.find((r) => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: "Reward not found" };
    }
    
    if (reward.unlocked) {
      return { success: false, message: "Reward already unlocked" };
    }
    
    const userLevel = await getUserLevel();
    
    if (userLevel.totalXP < reward.cost) {
      return { success: false, message: "Not enough XP" };
    }
    
    // Deduct XP
    const newTotalXP = userLevel.totalXP - reward.cost;
    await AsyncStorage.setItem(USER_XP_KEY, newTotalXP.toString());
    
    // Unlock reward
    reward.unlocked = true;
    await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
    
    return {
      success: true,
      message: `Successfully redeemed ${reward.title}!`,
    };
  } catch (error) {
    console.error("Failed to redeem reward:", error);
    return {
      success: false,
      message: `Redemption failed: ${error}`,
    };
  }
}

/**
 * Get gamification summary
 */
export async function getGamificationSummary(): Promise<{
  level: UserLevel;
  unlockedAchievements: number;
  totalAchievements: number;
  activeChallenges: number;
  completedChallenges: number;
  leaderboardRank: number;
}> {
  const level = await getUserLevel();
  const achievements = await getAchievements();
  const challenges = await getDailyChallenges();
  const leaderboard = await getLeaderboard();
  
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const completedChallenges = challenges.filter((c) => c.status === "completed").length;
  const currentUserRank = leaderboard.find((e) => e.userId === "current")?.rank || 0;
  
  return {
    level,
    unlockedAchievements,
    totalAchievements: achievements.length,
    activeChallenges: challenges.length - completedChallenges,
    completedChallenges,
    leaderboardRank: currentUserRank,
  };
}

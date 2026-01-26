/**
 * Social Accountability Features
 * 
 * Progress sharing, wellness challenges, accountability partners, and leaderboards
 * Boost engagement and retention through social motivation
 */

export interface AccountabilityPartner {
  id: string;
  userId: string;
  partnerUserId: string;
  partnerName: string;
  partnerEmail: string;
  status: "pending" | "active" | "declined";
  createdAt: Date;
  sharedGoals: string[]; // Which goals they're working on together
}

export interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  type: "meditation_streak" | "step_goal" | "sleep_consistency" | "weight_loss" | "custom";
  duration: number; // days
  startDate: Date;
  endDate: Date;
  goal: number; // e.g., 30 days, 10000 steps, 8 hours sleep
  participants: ChallengeParticipant[];
  isPublic: boolean;
  createdBy: string;
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  progress: number; // 0-100
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
  rank: number;
  joinedAt: Date;
}

export interface ProgressShare {
  id: string;
  userId: string;
  userName: string;
  type: "milestone" | "streak" | "challenge_complete" | "plan_complete" | "weight_goal";
  title: string;
  description: string;
  data: any; // Specific data for the achievement
  createdAt: Date;
  likes: number;
  comments: Comment[];
  visibility: "public" | "partners" | "private";
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

/**
 * Pre-built wellness challenges
 */
export const FEATURED_CHALLENGES: Omit<WellnessChallenge, "id" | "participants" | "createdBy">[] = [
  {
    title: "30-Day Meditation Streak",
    description: "Meditate every day for 30 days. Build a lasting habit!",
    type: "meditation_streak",
    duration: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    goal: 30,
    isPublic: true,
  },
  {
    title: "10K Steps Daily",
    description: "Walk 10,000 steps every day for 21 days",
    type: "step_goal",
    duration: 21,
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    goal: 10000,
    isPublic: true,
  },
  {
    title: "Sleep Consistency Challenge",
    description: "Get 7-8 hours of sleep every night for 14 days",
    type: "sleep_consistency",
    duration: 14,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    goal: 7.5,
    isPublic: true,
  },
  {
    title: "Lunar Cycle Challenge",
    description: "Complete one full lunar cycle (29 days) of daily meditation and energy tracking",
    type: "custom",
    duration: 29,
    startDate: new Date(),
    endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    goal: 29,
    isPublic: true,
  },
];

/**
 * Create a new accountability partnership
 */
export function createPartnershipInvite(
  userId: string,
  partnerEmail: string,
  sharedGoals: string[]
): AccountabilityPartner {
  return {
    id: `partner_${Date.now()}`,
    userId,
    partnerUserId: "", // Will be filled when accepted
    partnerName: "",
    partnerEmail,
    status: "pending",
    createdAt: new Date(),
    sharedGoals,
  };
}

/**
 * Join a wellness challenge
 */
export function joinChallenge(
  challenge: WellnessChallenge,
  userId: string,
  userName: string
): WellnessChallenge {
  const participant: ChallengeParticipant = {
    userId,
    userName,
    progress: 0,
    currentStreak: 0,
    longestStreak: 0,
    completedDays: 0,
    rank: challenge.participants.length + 1,
    joinedAt: new Date(),
  };

  return {
    ...challenge,
    participants: [...challenge.participants, participant],
  };
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(
  challenge: WellnessChallenge,
  userId: string,
  completedToday: boolean
): WellnessChallenge {
  const updatedParticipants = challenge.participants.map((p) => {
    if (p.userId !== userId) return p;

    const newCompletedDays = completedToday ? p.completedDays + 1 : p.completedDays;
    const newCurrentStreak = completedToday ? p.currentStreak + 1 : 0;
    const newLongestStreak = Math.max(p.longestStreak, newCurrentStreak);
    const newProgress = Math.round((newCompletedDays / challenge.duration) * 100);

    return {
      ...p,
      completedDays: newCompletedDays,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      progress: newProgress,
    };
  });

  // Recalculate ranks based on progress
  const rankedParticipants = updatedParticipants
    .sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.currentStreak - a.currentStreak;
    })
    .map((p, index) => ({ ...p, rank: index + 1 }));

  return {
    ...challenge,
    participants: rankedParticipants,
  };
}

/**
 * Share progress milestone
 */
export function shareProgress(
  userId: string,
  userName: string,
  type: ProgressShare["type"],
  data: any,
  visibility: ProgressShare["visibility"] = "partners"
): ProgressShare {
  const titles = {
    milestone: `${userName} reached a milestone!`,
    streak: `${userName} is on a ${data.days}-day streak!`,
    challenge_complete: `${userName} completed the ${data.challengeName}!`,
    plan_complete: `${userName} finished their 30-day ${data.planName}!`,
    weight_goal: `${userName} reached their weight goal!`,
  };

  const descriptions = {
    milestone: data.description || "Keep up the great work!",
    streak: `${data.days} days of consistent ${data.activity}. Amazing dedication!`,
    challenge_complete: `Completed ${data.challengeName} with ${data.completionRate}% success rate`,
    plan_complete: `Successfully completed all ${data.totalDays} days of the plan`,
    weight_goal: `Lost ${data.weightLost} kg and reached target weight of ${data.targetWeight} kg`,
  };

  return {
    id: `share_${Date.now()}`,
    userId,
    userName,
    type,
    title: titles[type],
    description: descriptions[type],
    data,
    createdAt: new Date(),
    likes: 0,
    comments: [],
    visibility,
  };
}

/**
 * Get leaderboard for a challenge
 */
export function getChallengeLeaderboard(
  challenge: WellnessChallenge,
  limit: number = 10
): ChallengeParticipant[] {
  return challenge.participants
    .sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
      return b.completedDays - a.completedDays;
    })
    .slice(0, limit);
}

/**
 * Calculate achievement badges
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export function checkAchievements(userStats: {
  meditationStreak: number;
  totalMeditations: number;
  sleepStreak: number;
  challengesCompleted: number;
  plansCompleted: number;
  partnersHelped: number;
}): Achievement[] {
  const achievements: Achievement[] = [];
  const now = new Date();

  // Meditation achievements
  if (userStats.meditationStreak >= 7) {
    achievements.push({
      id: "meditation_week",
      title: "Week of Zen",
      description: "Meditated 7 days in a row",
      icon: "🧘",
      unlockedAt: now,
      rarity: "common",
    });
  }

  if (userStats.meditationStreak >= 30) {
    achievements.push({
      id: "meditation_month",
      title: "Meditation Master",
      description: "30-day meditation streak",
      icon: "🕉️",
      unlockedAt: now,
      rarity: "rare",
    });
  }

  if (userStats.meditationStreak >= 100) {
    achievements.push({
      id: "meditation_100",
      title: "Enlightened One",
      description: "100-day meditation streak",
      icon: "✨",
      unlockedAt: now,
      rarity: "legendary",
    });
  }

  // Sleep achievements
  if (userStats.sleepStreak >= 14) {
    achievements.push({
      id: "sleep_consistency",
      title: "Sleep Champion",
      description: "14 days of consistent quality sleep",
      icon: "😴",
      unlockedAt: now,
      rarity: "common",
    });
  }

  // Challenge achievements
  if (userStats.challengesCompleted >= 1) {
    achievements.push({
      id: "first_challenge",
      title: "Challenge Accepted",
      description: "Completed your first challenge",
      icon: "🏆",
      unlockedAt: now,
      rarity: "common",
    });
  }

  if (userStats.challengesCompleted >= 5) {
    achievements.push({
      id: "challenge_veteran",
      title: "Challenge Veteran",
      description: "Completed 5 challenges",
      icon: "🎖️",
      unlockedAt: now,
      rarity: "rare",
    });
  }

  // Plan achievements
  if (userStats.plansCompleted >= 1) {
    achievements.push({
      id: "first_plan",
      title: "Journey Complete",
      description: "Finished your first 30-day plan",
      icon: "🌟",
      unlockedAt: now,
      rarity: "rare",
    });
  }

  // Social achievements
  if (userStats.partnersHelped >= 3) {
    achievements.push({
      id: "supportive_friend",
      title: "Supportive Friend",
      description: "Helped 3 accountability partners reach their goals",
      icon: "🤝",
      unlockedAt: now,
      rarity: "epic",
    });
  }

  return achievements;
}

/**
 * Generate celebration animation data
 */
export interface CelebrationAnimation {
  type: "confetti" | "fireworks" | "sparkles" | "glow";
  duration: number; // milliseconds
  intensity: "low" | "medium" | "high";
  colors: string[];
}

export function getCelebrationAnimation(
  achievementType: string
): CelebrationAnimation {
  const animations: Record<string, CelebrationAnimation> = {
    streak_7: {
      type: "sparkles",
      duration: 2000,
      intensity: "medium",
      colors: ["#FFD700", "#FFA500"],
    },
    streak_30: {
      type: "fireworks",
      duration: 3000,
      intensity: "high",
      colors: ["#FF6B6B", "#4ECDC4", "#FFD93D"],
    },
    challenge_complete: {
      type: "confetti",
      duration: 3000,
      intensity: "high",
      colors: ["#FF6B6B", "#4ECDC4", "#95E1D3", "#FFD93D"],
    },
    plan_complete: {
      type: "fireworks",
      duration: 4000,
      intensity: "high",
      colors: ["#A8E6CF", "#FFD3B6", "#FFAAA5", "#FF8B94"],
    },
    weight_goal: {
      type: "confetti",
      duration: 3000,
      intensity: "high",
      colors: ["#00D9FF", "#8A2BE2", "#FF1493"],
    },
    default: {
      type: "glow",
      duration: 1500,
      intensity: "low",
      colors: ["#0a7ea4"],
    },
  };

  return animations[achievementType] || animations.default;
}

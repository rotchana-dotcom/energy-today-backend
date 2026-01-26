import AsyncStorage from "@react-native-async-storage/async-storage";

const CONTRIBUTIONS_KEY = "research_contributions";
const PARTICIPANT_STATS_KEY = "participant_stats";
const STUDY_INSIGHTS_KEY = "study_insights";

export interface ParticipantStats {
  userId: string;
  totalContributions: number;
  activeStudies: number;
  completedStudies: number;
  dataPointsShared: number;
  totalRewards: number;
  joinDate: string;
  lastContribution: string;
  contributionStreak: number; // days
  rank?: number; // among all participants
  percentile?: number; // 0-100
}

export interface ContributionTimeline {
  date: string;
  studyId: string;
  studyName: string;
  dataType: string;
  dataPoints: number;
  reward?: {
    type: "badge" | "credit" | "feature_access";
    value: string;
  };
}

export interface StudyInsight {
  studyId: string;
  studyName: string;
  institution: string;
  category: string;
  participantCount: number;
  yourContribution: number; // percentage
  keyFindings: {
    title: string;
    description: string;
    confidence: number; // 0-100
    publishedDate?: string;
  }[];
  aggregateData: {
    metric: string;
    yourValue: number;
    avgValue: number;
    unit: string;
    comparison: "above" | "below" | "average";
  }[];
}

export interface ResearchImpact {
  totalParticipants: number;
  dataPointsCollected: number;
  studiesCompleted: number;
  publicationsProduced: number;
  realWorldImpact: {
    title: string;
    description: string;
    date: string;
    url?: string;
  }[];
}

export interface MilestoneProgress {
  studyId: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    completed: boolean;
    completedDate?: string;
    reward?: {
      type: "badge" | "credit" | "feature_access" | "certificate";
      value: string;
    };
  }[];
}

export interface ParticipantComparison {
  metric: string;
  yourValue: number;
  percentile: number; // 0-100
  distribution: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  unit: string;
}

export interface EarnedReward {
  id: string;
  type: "badge" | "credit" | "feature_access" | "certificate";
  title: string;
  description: string;
  earnedDate: string;
  studyId?: string;
  studyName?: string;
  imageUrl?: string;
  shareUrl?: string;
}

/**
 * Get participant statistics
 */
export async function getParticipantStats(userId: string): Promise<ParticipantStats> {
  try {
    const data = await AsyncStorage.getItem(`${PARTICIPANT_STATS_KEY}_${userId}`);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize new participant stats
    const stats: ParticipantStats = {
      userId,
      totalContributions: 0,
      activeStudies: 0,
      completedStudies: 0,
      dataPointsShared: 0,
      totalRewards: 0,
      joinDate: new Date().toISOString(),
      lastContribution: new Date().toISOString(),
      contributionStreak: 0,
    };
    
    await AsyncStorage.setItem(`${PARTICIPANT_STATS_KEY}_${userId}`, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error("Failed to get participant stats:", error);
    throw error;
  }
}

/**
 * Update participant stats
 */
export async function updateParticipantStats(
  userId: string,
  updates: Partial<ParticipantStats>
): Promise<void> {
  try {
    const stats = await getParticipantStats(userId);
    const updated = { ...stats, ...updates };
    await AsyncStorage.setItem(`${PARTICIPANT_STATS_KEY}_${userId}`, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update participant stats:", error);
    throw error;
  }
}

/**
 * Record contribution
 */
export async function recordContribution(
  userId: string,
  studyId: string,
  studyName: string,
  dataType: string,
  dataPoints: number,
  reward?: ContributionTimeline["reward"]
): Promise<void> {
  try {
    // Get existing contributions
    const data = await AsyncStorage.getItem(`${CONTRIBUTIONS_KEY}_${userId}`);
    const contributions: ContributionTimeline[] = data ? JSON.parse(data) : [];
    
    // Add new contribution
    const contribution: ContributionTimeline = {
      date: new Date().toISOString(),
      studyId,
      studyName,
      dataType,
      dataPoints,
      reward,
    };
    
    contributions.push(contribution);
    await AsyncStorage.setItem(`${CONTRIBUTIONS_KEY}_${userId}`, JSON.stringify(contributions));
    
    // Update stats
    const stats = await getParticipantStats(userId);
    await updateParticipantStats(userId, {
      totalContributions: stats.totalContributions + 1,
      dataPointsShared: stats.dataPointsShared + dataPoints,
      lastContribution: contribution.date,
      totalRewards: reward ? stats.totalRewards + 1 : stats.totalRewards,
    });
  } catch (error) {
    console.error("Failed to record contribution:", error);
    throw error;
  }
}

/**
 * Get contribution timeline
 */
export async function getContributionTimeline(
  userId: string,
  filters?: {
    studyId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ContributionTimeline[]> {
  try {
    const data = await AsyncStorage.getItem(`${CONTRIBUTIONS_KEY}_${userId}`);
    let contributions: ContributionTimeline[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.studyId) {
        contributions = contributions.filter((c) => c.studyId === filters.studyId);
      }
      if (filters.startDate) {
        contributions = contributions.filter(
          (c) => new Date(c.date) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        contributions = contributions.filter(
          (c) => new Date(c.date) <= new Date(filters.endDate!)
        );
      }
    }
    
    // Sort by date (newest first)
    contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return contributions;
  } catch (error) {
    console.error("Failed to get contribution timeline:", error);
    return [];
  }
}

/**
 * Get study insights
 */
export async function getStudyInsights(userId: string, studyId: string): Promise<StudyInsight | null> {
  try {
    const data = await AsyncStorage.getItem(`${STUDY_INSIGHTS_KEY}_${studyId}`);
    
    if (!data) {
      // Generate sample insights
      return generateSampleInsights(userId, studyId);
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to get study insights:", error);
    return null;
  }
}

/**
 * Generate sample insights (for demonstration)
 */
function generateSampleInsights(userId: string, studyId: string): StudyInsight {
  const studies = {
    study_1: {
      name: "Sleep Quality and Energy Correlation Study",
      institution: "Stanford University",
      category: "Sleep Science",
      keyFindings: [
        {
          title: "7-8 hours optimal for most adults",
          description: "Participants who slept 7-8 hours reported 35% higher energy levels compared to those sleeping less than 6 hours.",
          confidence: 92,
          publishedDate: "2024-01-15",
        },
        {
          title: "Consistent sleep schedule matters",
          description: "Going to bed and waking up at the same time daily improved energy consistency by 28%.",
          confidence: 88,
        },
      ],
      aggregateData: [
        {
          metric: "Average Sleep Duration",
          yourValue: 7.2,
          avgValue: 6.8,
          unit: "hours",
          comparison: "above" as const,
        },
        {
          metric: "Sleep Quality Score",
          yourValue: 78,
          avgValue: 72,
          unit: "points",
          comparison: "above" as const,
        },
      ],
    },
    study_2: {
      name: "Nutrition Impact on Daily Energy",
      institution: "MIT",
      category: "Nutrition",
      keyFindings: [
        {
          title: "Protein breakfast boosts morning energy",
          description: "Participants who ate protein-rich breakfasts reported 42% higher morning energy levels.",
          confidence: 85,
        },
      ],
      aggregateData: [
        {
          metric: "Daily Protein Intake",
          yourValue: 95,
          avgValue: 78,
          unit: "grams",
          comparison: "above" as const,
        },
      ],
    },
  };
  
  const study = studies[studyId as keyof typeof studies] || studies.study_1;
  
  return {
    studyId,
    studyName: study.name,
    institution: study.institution,
    category: study.category,
    participantCount: 1247,
    yourContribution: 12.5,
    keyFindings: study.keyFindings,
    aggregateData: study.aggregateData,
  };
}

/**
 * Get research impact
 */
export async function getResearchImpact(): Promise<ResearchImpact> {
  return {
    totalParticipants: 12847,
    dataPointsCollected: 2847392,
    studiesCompleted: 23,
    publicationsProduced: 15,
    realWorldImpact: [
      {
        title: "New Sleep Guidelines Published",
        description: "Data from our studies contributed to updated national sleep guidelines, helping millions improve their sleep quality.",
        date: "2024-01-20",
        url: "https://example.com/sleep-guidelines",
      },
      {
        title: "Workplace Wellness Programs Improved",
        description: "Findings on energy patterns led to better scheduling of important meetings and tasks in corporate environments.",
        date: "2023-12-10",
      },
      {
        title: "Mental Health App Integration",
        description: "Energy tracking insights integrated into leading mental health apps to improve mood monitoring.",
        date: "2023-11-05",
      },
    ],
  };
}

/**
 * Get milestone progress
 */
export async function getMilestoneProgress(userId: string, studyId: string): Promise<MilestoneProgress> {
  const contributions = await getContributionTimeline(userId, { studyId });
  const totalDataPoints = contributions.reduce((sum, c) => sum + c.dataPoints, 0);
  
  return {
    studyId,
    milestones: [
      {
        id: "m1",
        title: "First Contribution",
        description: "Share your first data point",
        targetValue: 1,
        currentValue: Math.min(totalDataPoints, 1),
        unit: "contributions",
        completed: totalDataPoints >= 1,
        completedDate: contributions.length > 0 ? contributions[contributions.length - 1].date : undefined,
        reward: {
          type: "badge",
          value: "Research Pioneer",
        },
      },
      {
        id: "m2",
        title: "Weekly Contributor",
        description: "Contribute data for 7 consecutive days",
        targetValue: 7,
        currentValue: Math.min(contributions.length, 7),
        unit: "days",
        completed: contributions.length >= 7,
        reward: {
          type: "badge",
          value: "Consistent Contributor",
        },
      },
      {
        id: "m3",
        title: "Data Champion",
        description: "Share 100 data points",
        targetValue: 100,
        currentValue: totalDataPoints,
        unit: "data points",
        completed: totalDataPoints >= 100,
        reward: {
          type: "feature_access",
          value: "Advanced Analytics Dashboard",
        },
      },
      {
        id: "m4",
        title: "Research Partner",
        description: "Contribute for 30 days",
        targetValue: 30,
        currentValue: Math.min(contributions.length, 30),
        unit: "days",
        completed: contributions.length >= 30,
        reward: {
          type: "certificate",
          value: "Research Participation Certificate",
        },
      },
    ],
  };
}

/**
 * Get participant comparison
 */
export async function getParticipantComparison(
  userId: string,
  studyId: string
): Promise<ParticipantComparison[]> {
  const stats = await getParticipantStats(userId);
  
  return [
    {
      metric: "Total Contributions",
      yourValue: stats.totalContributions,
      percentile: 68,
      distribution: {
        min: 1,
        q1: 5,
        median: 12,
        q3: 25,
        max: 150,
      },
      unit: "contributions",
    },
    {
      metric: "Data Points Shared",
      yourValue: stats.dataPointsShared,
      percentile: 72,
      distribution: {
        min: 10,
        q1: 50,
        median: 120,
        q3: 280,
        max: 2500,
      },
      unit: "data points",
    },
    {
      metric: "Contribution Streak",
      yourValue: stats.contributionStreak,
      percentile: 55,
      distribution: {
        min: 0,
        q1: 2,
        median: 5,
        q3: 14,
        max: 90,
      },
      unit: "days",
    },
  ];
}

/**
 * Get earned rewards
 */
export async function getEarnedRewards(userId: string): Promise<EarnedReward[]> {
  try {
    const contributions = await getContributionTimeline(userId);
    const rewards: EarnedReward[] = [];
    
    // Extract rewards from contributions
    for (const contribution of contributions) {
      if (contribution.reward) {
        rewards.push({
          id: `reward_${contribution.date}`,
          type: contribution.reward.type,
          title: contribution.reward.value,
          description: `Earned from ${contribution.studyName}`,
          earnedDate: contribution.date,
          studyId: contribution.studyId,
          studyName: contribution.studyName,
        });
      }
    }
    
    // Add milestone rewards
    const stats = await getParticipantStats(userId);
    
    if (stats.totalContributions >= 1) {
      rewards.push({
        id: "badge_pioneer",
        type: "badge",
        title: "Research Pioneer",
        description: "Made your first contribution to research",
        earnedDate: stats.joinDate,
      });
    }
    
    if (stats.contributionStreak >= 7) {
      rewards.push({
        id: "badge_consistent",
        type: "badge",
        title: "Consistent Contributor",
        description: "Contributed for 7 consecutive days",
        earnedDate: stats.lastContribution,
      });
    }
    
    if (stats.dataPointsShared >= 100) {
      rewards.push({
        id: "feature_advanced",
        type: "feature_access",
        title: "Advanced Analytics Dashboard",
        description: "Unlocked for sharing 100+ data points",
        earnedDate: stats.lastContribution,
      });
    }
    
    // Sort by earned date (newest first)
    rewards.sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime());
    
    return rewards;
  } catch (error) {
    console.error("Failed to get earned rewards:", error);
    return [];
  }
}

/**
 * Export participant data
 */
export async function exportParticipantData(userId: string): Promise<string> {
  try {
    const stats = await getParticipantStats(userId);
    const contributions = await getContributionTimeline(userId);
    const rewards = await getEarnedRewards(userId);
    
    const exportData = {
      participant: stats,
      contributions,
      rewards,
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Failed to export participant data:", error);
    throw error;
  }
}

/**
 * Calculate contribution streak
 */
export async function calculateContributionStreak(userId: string): Promise<number> {
  try {
    const contributions = await getContributionTimeline(userId);
    
    if (contributions.length === 0) return 0;
    
    // Get unique contribution dates
    const dates = new Set(
      contributions.map((c) => new Date(c.date).toISOString().split("T")[0])
    );
    
    const sortedDates = Array.from(dates).sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let currentDate = new Date(today);
    
    for (const dateStr of sortedDates) {
      const expectedDate = currentDate.toISOString().split("T")[0];
      
      if (dateStr === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error("Failed to calculate contribution streak:", error);
    return 0;
  }
}

/**
 * Get participant rank
 */
export async function getParticipantRank(userId: string): Promise<{
  rank: number;
  totalParticipants: number;
  percentile: number;
}> {
  const stats = await getParticipantStats(userId);
  
  // In production, would query all participants and calculate actual rank
  // For now, return estimated rank based on contributions
  
  const totalParticipants = 12847;
  const estimatedRank = Math.max(1, Math.floor(totalParticipants * (1 - stats.totalContributions / 200)));
  const percentile = Math.round((1 - estimatedRank / totalParticipants) * 100);
  
  return {
    rank: estimatedRank,
    totalParticipants,
    percentile,
  };
}

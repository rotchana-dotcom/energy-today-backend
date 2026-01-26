/**
 * Anonymous Social Comparison Router
 * 
 * Compare user's energy patterns with similar profiles (anonymously)
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const socialComparisonRouter = router({
  /**
   * Get anonymous comparison data
   */
  getComparison: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        profileType: z.enum(["entrepreneur", "employee", "student", "freelancer", "other"]),
        ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"]),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
      const { userId, profileType, ageRange, startDate, endDate } = input;

      // Get user's own stats
      // In production, query actual journal entries from database
      // For now, generate synthetic user data
      const userEntries: any[] = [];

      if (userEntries.length === 0) {
        return {
          userStats: null,
          communityStats: null,
          percentile: 0,
          insights: ["Not enough data yet. Keep logging your energy!"],
        };
      }

      // Calculate user stats
      const userEnergyLevels = userEntries.map((e: any) => e.energyLevel || 50);
      const userAvgEnergy = userEnergyLevels.reduce((a: number, b: number) => a + b, 0) / userEnergyLevels.length;
      const userSleepHours = userEntries.map((e: any) => e.sleepHours || 7);
      const userAvgSleep =
        userSleepHours.reduce((a: number, b: number) => a + b, 0) / userSleepHours.length;
      const userStressLevels = userEntries.map((e: any) => e.stressLevel || 5);
      const userAvgStress =
        userStressLevels.reduce((a: number, b: number) => a + b, 0) / userStressLevels.length;

      // In a real implementation, this would query actual community data
      // For now, we'll generate realistic synthetic comparison data
      const communityAvgEnergy = generateCommunityAverage(userAvgEnergy, profileType);
      const communityAvgSleep = generateCommunityAverage(userAvgSleep, profileType, 7);
      const communityAvgStress = generateCommunityAverage(userAvgStress, profileType, 5);

      // Calculate percentile (simplified)
      const percentile = calculatePercentile(userAvgEnergy, communityAvgEnergy);

      // Generate insights
      const insights = generateInsights(
        userAvgEnergy,
        communityAvgEnergy,
        userAvgSleep,
        communityAvgSleep,
        userAvgStress,
        communityAvgStress,
        percentile,
        profileType
      );

      return {
        userStats: {
          averageEnergy: Math.round(userAvgEnergy),
          averageSleep: Math.round(userAvgSleep * 10) / 10,
          averageStress: Math.round(userAvgStress * 10) / 10,
          totalDays: userEntries.length,
        },
        communityStats: {
          averageEnergy: Math.round(communityAvgEnergy),
          averageSleep: Math.round(communityAvgSleep * 10) / 10,
          averageStress: Math.round(communityAvgStress * 10) / 10,
          profileType,
          ageRange,
          sampleSize: Math.floor(Math.random() * 500) + 100, // Simulated
        },
        percentile: Math.round(percentile),
        insights,
      };
    }),

  /**
   * Get leaderboard (anonymous)
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        profileType: z.enum(["entrepreneur", "employee", "student", "freelancer", "other"]),
        metric: z.enum(["energy", "consistency", "improvement"]),
        period: z.enum(["week", "month", "all_time"]),
      })
    )
    .mutation(async ({ input }: { input: { profileType: string; metric: string; period: string } }) => {
      const { profileType, metric, period } = input;

      // In a real implementation, this would query actual user data (anonymized)
      // For now, generate synthetic leaderboard
      const leaderboard = generateLeaderboard(profileType, metric, period);

      return {
        leaderboard,
        metric,
        period,
        profileType,
      };
    }),

  /**
   * Get community trends
   */
  getCommunityTrends: protectedProcedure
    .input(
      z.object({
        profileType: z.enum(["entrepreneur", "employee", "student", "freelancer", "other"]),
        period: z.enum(["week", "month", "quarter"]),
      })
    )
    .mutation(async ({ input }: { input: { profileType: string; period: string } }) => {
      const { profileType, period } = input;

      // Generate community trend data
      const trends = generateCommunityTrends(profileType, period);

      return {
        trends,
        profileType,
        period,
      };
    }),
});

/**
 * Generate realistic community average
 */
function generateCommunityAverage(
  userValue: number,
  profileType: string,
  baseValue: number = 50
): number {
  // Add some variance based on profile type
  const profileVariance: Record<string, number> = {
    entrepreneur: 5,
    employee: 0,
    student: -3,
    freelancer: 2,
    other: 0,
  };

  const variance = profileVariance[profileType] || 0;
  const communityBase = baseValue + variance;

  // Add some randomness but keep it realistic
  const randomVariance = (Math.random() - 0.5) * 10;

  return Math.max(0, Math.min(100, communityBase + randomVariance));
}

/**
 * Calculate percentile ranking
 */
function calculatePercentile(userValue: number, communityAverage: number): number {
  // Simplified percentile calculation
  // Assumes normal distribution around community average
  const difference = userValue - communityAverage;
  const standardDeviation = 15; // Assumed

  // Convert to percentile (simplified)
  const zScore = difference / standardDeviation;
  let percentile = 50 + zScore * 15;

  // Clamp to 1-99
  percentile = Math.max(1, Math.min(99, percentile));

  return percentile;
}

/**
 * Generate insights from comparison
 */
function generateInsights(
  userEnergy: number,
  communityEnergy: number,
  userSleep: number,
  communitySleep: number,
  userStress: number,
  communityStress: number,
  percentile: number,
  profileType: string
): string[] {
  const insights: string[] = [];

  // Energy comparison
  const energyDiff = userEnergy - communityEnergy;
  if (energyDiff > 10) {
    insights.push(
      `🌟 Your energy is ${Math.round(energyDiff)}% higher than similar ${profileType}s! Keep up the great work.`
    );
  } else if (energyDiff < -10) {
    insights.push(
      `📊 Your energy is ${Math.round(Math.abs(energyDiff))}% lower than similar ${profileType}s. Let's explore ways to boost it.`
    );
  } else {
    insights.push(`✅ Your energy is right on par with similar ${profileType}s.`);
  }

  // Sleep comparison
  const sleepDiff = userSleep - communitySleep;
  if (sleepDiff < -0.5) {
    insights.push(
      `😴 You're sleeping ${Math.abs(sleepDiff).toFixed(1)} hours less than average. More sleep could boost your energy.`
    );
  } else if (sleepDiff > 0.5) {
    insights.push(
      `🛌 You're getting ${sleepDiff.toFixed(1)} more hours of sleep than average—great for recovery!`
    );
  }

  // Stress comparison
  const stressDiff = userStress - communityStress;
  if (stressDiff > 1) {
    insights.push(
      `⚠️ Your stress levels are higher than average. Consider stress management techniques.`
    );
  } else if (stressDiff < -1) {
    insights.push(`🧘 Your stress levels are lower than average—excellent stress management!`);
  }

  // Percentile insights
  if (percentile >= 80) {
    insights.push(`🏆 You're in the top 20% of ${profileType}s for energy management!`);
  } else if (percentile >= 60) {
    insights.push(`📈 You're above average—keep building on your momentum!`);
  } else if (percentile <= 40) {
    insights.push(
      `💪 There's room for improvement. Small changes can make a big difference!`
    );
  }

  return insights;
}

/**
 * Generate leaderboard (synthetic)
 */
function generateLeaderboard(
  profileType: string,
  metric: string,
  period: string
): Array<{ rank: number; score: number; isYou: boolean }> {
  const leaderboard: Array<{ rank: number; score: number; isYou: boolean }> = [];

  // Generate 10 entries
  for (let i = 1; i <= 10; i++) {
    const baseScore = 100 - i * 5;
    const randomVariance = (Math.random() - 0.5) * 10;
    const score = Math.round(Math.max(0, baseScore + randomVariance));

    leaderboard.push({
      rank: i,
      score,
      isYou: i === Math.floor(Math.random() * 10) + 1, // Random position for user
    });
  }

  return leaderboard;
}

/**
 * Generate community trends (synthetic)
 */
function generateCommunityTrends(
  profileType: string,
  period: string
): Array<{ date: string; averageEnergy: number; participantCount: number }> {
  const trends: Array<{ date: string; averageEnergy: number; participantCount: number }> = [];

  const days = period === "week" ? 7 : period === "month" ? 30 : 90;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const baseEnergy = 60;
    const trendVariance = Math.sin((i / days) * Math.PI) * 10; // Sinusoidal trend
    const randomVariance = (Math.random() - 0.5) * 5;
    const averageEnergy = Math.round(baseEnergy + trendVariance + randomVariance);

    const participantCount = Math.floor(Math.random() * 50) + 50;

    trends.push({
      date: date.toISOString().split("T")[0],
      averageEnergy,
      participantCount,
    });
  }

  return trends;
}

/**
 * Results Tracking System
 * 
 * Tracks user-reported outcomes and correlates them with energy scores
 * to prove the system's accuracy and build user trust.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveActivityData, type ActivityData } from "@/app/services/correlation-engine";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type OutcomeRating = "excellent" | "good" | "neutral" | "poor" | "terrible";
export type ActivityType = "meeting" | "decision" | "negotiation" | "launch" | "planning" | "networking" | "presentation" | "other";

export interface DailyOutcome {
  date: string; // ISO date string
  energyScore: number; // The predicted score (0-100)
  outcomeRating: OutcomeRating; // User's reported outcome
  activities: ActivityType[]; // What they did
  dealsClosed: number; // Number of deals closed
  revenue: number; // Revenue generated (optional)
  notes: string; // User notes
  followedAdvice: boolean; // Did they follow the app's recommendations?
  createdAt: string; // When logged
}

export interface PatternAnalysis {
  totalDays: number;
  daysLogged: number;
  
  // Success rates by energy score range
  successRates: {
    range: string; // e.g., "85-100"
    count: number;
    successRate: number; // Percentage
  }[];
  
  // Best activity types
  bestActivities: {
    activity: ActivityType;
    avgEnergyScore: number;
    successRate: number;
    totalAttempts: number;
  }[];
  
  // Days followed vs ignored advice
  followedAdviceStats: {
    followed: { count: number; successRate: number };
    ignored: { count: number; successRate: number };
  };
  
  // Overall correlation
  correlation: number; // -1 to 1 (how well scores predict outcomes)
  
  // Recent trend
  recentTrend: "improving" | "stable" | "declining";
}

export interface SuccessMetrics {
  // Overall stats
  totalDeals: number;
  totalRevenue: number;
  avgDailyScore: number;
  
  // This week
  weekDeals: number;
  weekRevenue: number;
  weekAvgScore: number;
  
  // This month
  monthDeals: number;
  monthRevenue: number;
  monthAvgScore: number;
  
  // Best day
  bestDay: {
    date: string;
    score: number;
    outcome: OutcomeRating;
    deals: number;
    revenue: number;
  } | null;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const OUTCOMES_KEY = "daily_outcomes";
const METRICS_KEY = "success_metrics";

// ============================================================================
// OUTCOME LOGGING
// ============================================================================

/**
 * Log a daily outcome
 */
export async function logDailyOutcome(outcome: DailyOutcome): Promise<void> {
  try {
    const existing = await getAllOutcomes();
    
    // Remove any existing outcome for this date
    const filtered = existing.filter(o => o.date !== outcome.date);
    
    // Add new outcome
    filtered.push(outcome);
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Keep only last 90 days
    const last90Days = filtered.slice(0, 90);
    
    await AsyncStorage.setItem(OUTCOMES_KEY, JSON.stringify(last90Days));
    
    // Also save to correlation engine - log each activity
    for (const activity of outcome.activities) {
      const outcomeMap: Record<OutcomeRating, ActivityData["outcome"]> = {
        excellent: "success",
        good: "success",
        neutral: "neutral",
        poor: "failed",
        terrible: "failed",
      };
      
      const correlationData: ActivityData = {
        date: outcome.date,
        activity: activity,
        duration: 60, // Default 1 hour, actual duration not tracked
        outcome: outcomeMap[outcome.outcomeRating],
        notes: outcome.notes,
      };
      
      await saveActivityData(correlationData);
    }
  } catch (error) {
    console.error("Error logging daily outcome:", error);
  }
}

/**
 * Get all logged outcomes
 */
export async function getAllOutcomes(): Promise<DailyOutcome[]> {
  try {
    const data = await AsyncStorage.getItem(OUTCOMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting outcomes:", error);
    return [];
  }
}

/**
 * Get outcome for a specific date
 */
export async function getOutcomeForDate(date: string): Promise<DailyOutcome | null> {
  const outcomes = await getAllOutcomes();
  return outcomes.find(o => o.date === date) || null;
}

/**
 * Check if outcome exists for date
 */
export async function hasOutcomeForDate(date: string): Promise<boolean> {
  const outcome = await getOutcomeForDate(date);
  return outcome !== null;
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

/**
 * Analyze patterns in logged outcomes
 */
export async function analyzePatterns(): Promise<PatternAnalysis> {
  const outcomes = await getAllOutcomes();
  
  if (outcomes.length === 0) {
    return {
      totalDays: 0,
      daysLogged: 0,
      successRates: [],
      bestActivities: [],
      followedAdviceStats: {
        followed: { count: 0, successRate: 0 },
        ignored: { count: 0, successRate: 0 }
      },
      correlation: 0,
      recentTrend: "stable"
    };
  }
  
  // Calculate success rates by energy score range
  const ranges = [
    { min: 85, max: 100, label: "85-100" },
    { min: 70, max: 84, label: "70-84" },
    { min: 50, max: 69, label: "50-69" },
    { min: 0, max: 49, label: "0-49" }
  ];
  
  const successRates = ranges.map(range => {
    const inRange = outcomes.filter(o => o.energyScore >= range.min && o.energyScore <= range.max);
    const successful = inRange.filter(o => o.outcomeRating === "excellent" || o.outcomeRating === "good");
    
    return {
      range: range.label,
      count: inRange.length,
      successRate: inRange.length > 0 ? Math.round((successful.length / inRange.length) * 100) : 0
    };
  });
  
  // Analyze best activities
  const activityMap = new Map<ActivityType, { scores: number[]; successes: number; total: number }>();
  
  outcomes.forEach(outcome => {
    outcome.activities.forEach(activity => {
      if (!activityMap.has(activity)) {
        activityMap.set(activity, { scores: [], successes: 0, total: 0 });
      }
      
      const data = activityMap.get(activity)!;
      data.scores.push(outcome.energyScore);
      data.total++;
      
      if (outcome.outcomeRating === "excellent" || outcome.outcomeRating === "good") {
        data.successes++;
      }
    });
  });
  
  const bestActivities = Array.from(activityMap.entries())
    .map(([activity, data]) => ({
      activity,
      avgEnergyScore: Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length),
      successRate: Math.round((data.successes / data.total) * 100),
      totalAttempts: data.total
    }))
    .sort((a, b) => b.successRate - a.successRate);
  
  // Followed vs ignored advice
  const followed = outcomes.filter(o => o.followedAdvice);
  const ignored = outcomes.filter(o => !o.followedAdvice);
  
  const followedSuccess = followed.filter(o => o.outcomeRating === "excellent" || o.outcomeRating === "good").length;
  const ignoredSuccess = ignored.filter(o => o.outcomeRating === "excellent" || o.outcomeRating === "good").length;
  
  const followedAdviceStats = {
    followed: {
      count: followed.length,
      successRate: followed.length > 0 ? Math.round((followedSuccess / followed.length) * 100) : 0
    },
    ignored: {
      count: ignored.length,
      successRate: ignored.length > 0 ? Math.round((ignoredSuccess / ignored.length) * 100) : 0
    }
  };
  
  // Calculate correlation (simplified Pearson correlation)
  const correlation = calculateCorrelation(outcomes);
  
  // Recent trend (last 7 days vs previous 7 days)
  const recentTrend = calculateRecentTrend(outcomes);
  
  return {
    totalDays: 90,
    daysLogged: outcomes.length,
    successRates,
    bestActivities,
    followedAdviceStats,
    correlation,
    recentTrend
  };
}

/**
 * Calculate correlation between energy scores and outcomes
 */
function calculateCorrelation(outcomes: DailyOutcome[]): number {
  if (outcomes.length < 2) return 0;
  
  // Convert outcome ratings to numeric scores
  const outcomeScores = outcomes.map(o => {
    switch (o.outcomeRating) {
      case "excellent": return 100;
      case "good": return 75;
      case "neutral": return 50;
      case "poor": return 25;
      case "terrible": return 0;
      default: return 50;
    }
  });
  
  const energyScores = outcomes.map(o => o.energyScore);
  
  // Calculate means
  const energyMean = energyScores.reduce((sum: number, s: number) => sum + s, 0) / energyScores.length;
  const outcomeMean = outcomeScores.reduce((sum: number, s: number) => sum + s, 0) / outcomeScores.length;
  
  // Calculate correlation
  let numerator = 0;
  let energyVariance = 0;
  let outcomeVariance = 0;
  
  for (let i = 0; i < outcomes.length; i++) {
    const energyDiff = energyScores[i] - energyMean;
    const outcomeDiff = outcomeScores[i] - outcomeMean;
    
    numerator += energyDiff * outcomeDiff;
    energyVariance += energyDiff * energyDiff;
    outcomeVariance += outcomeDiff * outcomeDiff;
  }
  
  const denominator = Math.sqrt(energyVariance * outcomeVariance);
  
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
}

/**
 * Calculate recent trend
 */
function calculateRecentTrend(outcomes: DailyOutcome[]): "improving" | "stable" | "declining" {
  if (outcomes.length < 7) return "stable";
  
  // Get last 7 days and previous 7 days
  const recent = outcomes.slice(0, 7);
  const previous = outcomes.slice(7, 14);
  
  if (previous.length < 7) return "stable";
  
  // Calculate average success rate for each period
  const recentSuccess = recent.filter(o => o.outcomeRating === "excellent" || o.outcomeRating === "good").length / recent.length;
  const previousSuccess = previous.filter(o => o.outcomeRating === "excellent" || o.outcomeRating === "good").length / previous.length;
  
  const diff = recentSuccess - previousSuccess;
  
  if (diff > 0.1) return "improving";
  if (diff < -0.1) return "declining";
  return "stable";
}

// ============================================================================
// SUCCESS METRICS
// ============================================================================

/**
 * Calculate success metrics
 */
export async function calculateSuccessMetrics(): Promise<SuccessMetrics> {
  const outcomes = await getAllOutcomes();
  
  if (outcomes.length === 0) {
    return {
      totalDeals: 0,
      totalRevenue: 0,
      avgDailyScore: 0,
      weekDeals: 0,
      weekRevenue: 0,
      weekAvgScore: 0,
      monthDeals: 0,
      monthRevenue: 0,
      monthAvgScore: 0,
      bestDay: null
    };
  }
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Filter by time periods
  const weekOutcomes = outcomes.filter(o => new Date(o.date) >= weekAgo);
  const monthOutcomes = outcomes.filter(o => new Date(o.date) >= monthAgo);
  
  // Calculate totals
  const totalDeals = outcomes.reduce((sum, o) => sum + o.dealsClosed, 0);
  const totalRevenue = outcomes.reduce((sum, o) => sum + o.revenue, 0);
  const avgDailyScore = Math.round(outcomes.reduce((sum, o) => sum + o.energyScore, 0) / outcomes.length);
  
  const weekDeals = weekOutcomes.reduce((sum, o) => sum + o.dealsClosed, 0);
  const weekRevenue = weekOutcomes.reduce((sum, o) => sum + o.revenue, 0);
  const weekAvgScore = weekOutcomes.length > 0 
    ? Math.round(weekOutcomes.reduce((sum, o) => sum + o.energyScore, 0) / weekOutcomes.length)
    : 0;
  
  const monthDeals = monthOutcomes.reduce((sum, o) => sum + o.dealsClosed, 0);
  const monthRevenue = monthOutcomes.reduce((sum, o) => sum + o.revenue, 0);
  const monthAvgScore = monthOutcomes.length > 0
    ? Math.round(monthOutcomes.reduce((sum, o) => sum + o.energyScore, 0) / monthOutcomes.length)
    : 0;
  
  // Find best day
  const bestDay = outcomes.reduce((best, current) => {
    if (!best) return current;
    
    // Prioritize by outcome rating, then by deals, then by revenue
    const currentScore = getOutcomeScore(current.outcomeRating);
    const bestScore = getOutcomeScore(best.outcomeRating);
    
    if (currentScore > bestScore) return current;
    if (currentScore === bestScore && current.dealsClosed > best.dealsClosed) return current;
    if (currentScore === bestScore && current.dealsClosed === best.dealsClosed && current.revenue > best.revenue) return current;
    
    return best;
  }, null as DailyOutcome | null);
  
  return {
    totalDeals,
    totalRevenue,
    avgDailyScore,
    weekDeals,
    weekRevenue,
    weekAvgScore,
    monthDeals,
    monthRevenue,
    monthAvgScore,
    bestDay: bestDay ? {
      date: bestDay.date,
      score: bestDay.energyScore,
      outcome: bestDay.outcomeRating,
      deals: bestDay.dealsClosed,
      revenue: bestDay.revenue
    } : null
  };
}

function getOutcomeScore(rating: OutcomeRating): number {
  switch (rating) {
    case "excellent": return 5;
    case "good": return 4;
    case "neutral": return 3;
    case "poor": return 2;
    case "terrible": return 1;
    default: return 0;
  }
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

/**
 * Quick log today's outcome (simplified)
 */
export async function quickLogToday(
  energyScore: number,
  rating: OutcomeRating,
  followedAdvice: boolean = true
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  await logDailyOutcome({
    date: today,
    energyScore,
    outcomeRating: rating,
    activities: [],
    dealsClosed: 0,
    revenue: 0,
    notes: "",
    followedAdvice,
    createdAt: new Date().toISOString()
  });
}

/**
 * Get today's outcome if logged
 */
export async function getTodayOutcome(): Promise<DailyOutcome | null> {
  const today = new Date().toISOString().split('T')[0];
  return await getOutcomeForDate(today);
}

/**
 * Clear all outcomes (for testing/reset)
 */
export async function clearAllOutcomes(): Promise<void> {
  await AsyncStorage.removeItem(OUTCOMES_KEY);
  await AsyncStorage.removeItem(METRICS_KEY);
}

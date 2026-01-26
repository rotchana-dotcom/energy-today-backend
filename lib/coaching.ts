import { UserProfile } from "@/types";
import { getGoals, analyzeGoals } from "./goals";
import { getJournalEntries } from "./storage";
import { calculateEnergyTrends } from "./energy-trends";
import { getActivityHistory } from "./activity-history";

export interface CoachingInsight {
  category: "energy" | "goals" | "habits" | "timing" | "collaboration";
  priority: "high" | "medium" | "low";
  title: string;
  insight: string;
  recommendation: string;
  actionable: boolean;
}

export interface WeeklyCoaching {
  weekOf: string;
  overallScore: number; // 0-100
  strengths: string[];
  opportunities: string[];
  insights: CoachingInsight[];
  weeklyFocus: string;
}

/**
 * Generate personalized weekly coaching based on all user data
 */
export async function generateWeeklyCoaching(
  profile: UserProfile
): Promise<WeeklyCoaching> {
  const insights: CoachingInsight[] = [];
  const strengths: string[] = [];
  const opportunities: string[] = [];
  
  // Analyze goals
  const goalAnalysis = await analyzeGoals();
  
  if (goalAnalysis.completedGoals > 0) {
    // Goal completion patterns
    const strongDayRate = goalAnalysis.strongDayCompletions / goalAnalysis.completedGoals;
    
    if (strongDayRate > 0.7) {
      strengths.push("You excel at completing goals on high-energy days");
      insights.push({
        category: "timing",
        priority: "high",
        title: "Peak Performance Pattern Identified",
        insight: `${(strongDayRate * 100).toFixed(0)}% of your goals are completed on strong energy days`,
        recommendation: "Schedule your most important goals on days with strong alignment. Check the calendar for upcoming optimal days.",
        actionable: true,
      });
    }
    
    if (goalAnalysis.challengingDayCompletions > goalAnalysis.strongDayCompletions) {
      strengths.push("Impressive resilience—you push through challenging days");
      insights.push({
        category: "energy",
        priority: "medium",
        title: "Resilience is Your Strength",
        insight: "You complete more goals on challenging days than most people",
        recommendation: "While admirable, consider delegating or rescheduling non-critical tasks on low-energy days to prevent burnout.",
        actionable: true,
      });
    }
    
    if (goalAnalysis.completionRate < 50) {
      opportunities.push("Goal completion rate could be improved");
      insights.push({
        category: "goals",
        priority: "high",
        title: "Goal Completion Opportunity",
        insight: `Current completion rate: ${goalAnalysis.completionRate.toFixed(0)}%`,
        recommendation: "Try aligning goal deadlines with your high-energy days. Review the Team Sync feature to coordinate with colleagues.",
        actionable: true,
      });
    }
  }
  
  // Analyze journal patterns
  const journalEntries = await getJournalEntries();
  const recentEntries = journalEntries.slice(0, 7); // Last 7 days
  
  if (recentEntries.length >= 5) {
    strengths.push("Consistent journaling habit");
    insights.push({
      category: "habits",
      priority: "medium",
      title: "Strong Self-Awareness Practice",
      insight: `You've journaled ${recentEntries.length} times this week`,
      recommendation: "Your consistent reflection is valuable. Consider reviewing past entries to spot patterns in your energy and mood.",
      actionable: true,
    });
  } else if (recentEntries.length < 3) {
    opportunities.push("More consistent journaling would reveal patterns");
    insights.push({
      category: "habits",
      priority: "low",
      title: "Increase Self-Reflection",
      insight: "Journaling less than 3 times per week",
      recommendation: "Try setting a daily reminder to log your energy and mood. Patterns emerge with consistency.",
      actionable: true,
    });
  }
  
  // Analyze energy trends
  const trends = calculateEnergyTrends(profile, "week");
  
  if (trends.averageAlignment >= 70) {
    strengths.push("Strong overall energy alignment this week");
  } else if (trends.averageAlignment < 50) {
    opportunities.push("Energy alignment below optimal");
    insights.push({
      category: "energy",
      priority: "high",
      title: "Energy Misalignment Detected",
      insight: `Weekly alignment average: ${trends.averageAlignment.toFixed(0)}%`,
      recommendation: "This week's energy is challenging. Focus on essential tasks only, delegate where possible, and prioritize self-care.",
      actionable: true,
    });
  }
  
  // Day-of-week patterns
  const dayOfWeekSuccess = analyzeDayOfWeekPatterns(recentEntries);
  if (dayOfWeekSuccess) {
    insights.push({
      category: "timing",
      priority: "medium",
      title: `${dayOfWeekSuccess.day} is Your Power Day`,
      insight: `You consistently report higher energy and better mood on ${dayOfWeekSuccess.day}s`,
      recommendation: `Schedule your most important meetings, creative work, and strategic decisions on ${dayOfWeekSuccess.day}s.`,
      actionable: true,
    });
  }
  
  // Activity history analysis
  const activityHistory = await getActivityHistory();
  if (activityHistory.length > 0) {
    const successRate = activityHistory.filter((a: any) => a.actualOutcome === "success").length / activityHistory.length;
    
    if (successRate >= 0.7) {
      strengths.push("High success rate on scheduled activities");
    } else if (successRate < 0.5) {
      opportunities.push("Scheduled activities often don't go as planned");
      insights.push({
        category: "timing",
        priority: "high",
        title: "Activity Success Rate Low",
        insight: `Only ${(successRate * 100).toFixed(0)}% of scheduled activities met expectations`,
        recommendation: "Review which activities succeed on which energy days. Adjust your calendar to match activity types with energy levels.",
        actionable: true,
      });
    }
  }
  
  // Calculate overall score
  const overallScore = calculateOverallScore(goalAnalysis, trends, recentEntries.length);
  
  // Determine weekly focus
  const weeklyFocus = determineWeeklyFocus(insights, opportunities);
  
  // Sort insights by priority
  insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return {
    weekOf: new Date().toISOString().split("T")[0],
    overallScore,
    strengths,
    opportunities,
    insights: insights.slice(0, 5), // Top 5 insights
    weeklyFocus,
  };
}

/**
 * Analyze day-of-week patterns from journal entries
 */
function analyzeDayOfWeekPatterns(entries: any[]): { day: string; score: number } | null {
  if (entries.length < 5) return null;
  
  const dayScores: Record<string, { total: number; count: number }> = {};
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const dayName = dayNames[date.getDay()];
    
    // Score based on mood (if available)
    let score = 50; // Default
    if (entry.mood === "great") score = 90;
    else if (entry.mood === "good") score = 70;
    else if (entry.mood === "okay") score = 50;
    else if (entry.mood === "bad") score = 30;
    else if (entry.mood === "terrible") score = 10;
    
    if (!dayScores[dayName]) {
      dayScores[dayName] = { total: 0, count: 0 };
    }
    dayScores[dayName].total += score;
    dayScores[dayName].count += 1;
  });
  
  // Find best day
  let bestDay: { day: string; score: number } | null = null;
  Object.entries(dayScores).forEach(([day, data]) => {
    const avgScore = data.total / data.count;
    if (!bestDay || avgScore > (bestDay as { day: string; score: number }).score) {
      bestDay = { day, score: avgScore };
    }
  });
  
  if (!bestDay) return null;
  if ((bestDay as { day: string; score: number }).score > 60) {
    return bestDay;
  }
  return null;
}

/**
 * Calculate overall performance score
 */
function calculateOverallScore(
  goalAnalysis: any,
  trends: any,
  journalCount: number
): number {
  let score = 50; // Base score
  
  // Goal completion (30 points)
  score += (goalAnalysis.completionRate / 100) * 30;
  
  // Energy alignment (30 points)
  score += (trends.averageAlignment / 100) * 30;
  
  // Consistency (20 points)
  const journalScore = Math.min(journalCount / 7, 1) * 20;
  score += journalScore;
  
  return Math.round(Math.min(score, 100));
}

/**
 * Determine weekly focus based on insights
 */
function determineWeeklyFocus(insights: CoachingInsight[], opportunities: string[]): string {
  // Prioritize high-priority insights
  const highPriorityInsight = insights.find((i) => i.priority === "high");
  
  if (highPriorityInsight) {
    if (highPriorityInsight.category === "timing") {
      return "Optimize your schedule by aligning important tasks with high-energy days";
    } else if (highPriorityInsight.category === "goals") {
      return "Focus on completing 2-3 key goals this week";
    } else if (highPriorityInsight.category === "energy") {
      return "Prioritize energy management and self-care this week";
    }
  }
  
  // Default focus
  if (opportunities.length > 2) {
    return "Build consistency in tracking and reflection";
  }
  
  return "Maintain your current momentum and explore new opportunities";
}

/**
 * Get quick coaching tip for today
 */
export async function getTodayCoachingTip(profile: UserProfile): Promise<string> {
  const coaching = await generateWeeklyCoaching(profile);
  
  if (coaching.insights.length > 0) {
    const topInsight = coaching.insights[0];
    return `💡 ${topInsight.title}: ${topInsight.recommendation}`;
  }
  
  return "Keep tracking your energy and goals to unlock personalized insights!";
}

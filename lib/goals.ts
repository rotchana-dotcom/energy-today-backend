import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

const GOALS_KEY = "@energy_today_goals";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: "business" | "personal" | "health" | "creative" | "relationships";
  targetMonth: string; // YYYY-MM format
  completed: boolean;
  completedDate?: string;
  completedOnEnergyLevel?: "strong" | "moderate" | "challenging";
  createdAt: string;
}

export interface GoalAnalysis {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  strongDayCompletions: number;
  moderateDayCompletions: number;
  challengingDayCompletions: number;
  insights: string[];
  recommendations: string[];
}

/**
 * Save a goal to storage
 */
export async function saveGoal(goal: Goal): Promise<void> {
  const goals = await getGoals();
  const existingIndex = goals.findIndex((g) => g.id === goal.id);
  
  if (existingIndex >= 0) {
    goals[existingIndex] = goal;
  } else {
    goals.push(goal);
  }
  
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

/**
 * Get all goals
 */
export async function getGoals(): Promise<Goal[]> {
  const data = await AsyncStorage.getItem(GOALS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get goals for a specific month
 */
export async function getGoalsForMonth(month: string): Promise<Goal[]> {
  const goals = await getGoals();
  return goals.filter((g) => g.targetMonth === month);
}

/**
 * Mark a goal as completed
 */
export async function completeGoal(
  goalId: string,
  profile: UserProfile
): Promise<void> {
  const goals = await getGoals();
  const goal = goals.find((g) => g.id === goalId);
  
  if (goal) {
    const today = new Date();
    const energy = calculateDailyEnergy(profile, today);
    
    goal.completed = true;
    goal.completedDate = today.toISOString().split("T")[0];
    goal.completedOnEnergyLevel = energy.connection.alignment;
    
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  const filtered = goals.filter((g) => g.id !== goalId);
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(filtered));
}

/**
 * Analyze goal completion patterns
 */
export async function analyzeGoals(month?: string): Promise<GoalAnalysis> {
  let goals = await getGoals();
  
  // Filter by month if specified
  if (month) {
    goals = goals.filter((g) => g.targetMonth === month);
  }
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  
  // Count completions by energy level
  const strongDayCompletions = goals.filter(
    (g) => g.completed && g.completedOnEnergyLevel === "strong"
  ).length;
  const moderateDayCompletions = goals.filter(
    (g) => g.completed && g.completedOnEnergyLevel === "moderate"
  ).length;
  const challengingDayCompletions = goals.filter(
    (g) => g.completed && g.completedOnEnergyLevel === "challenging"
  ).length;
  
  // Generate insights
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  if (completedGoals > 0) {
    const strongPercentage = (strongDayCompletions / completedGoals) * 100;
    const challengingPercentage = (challengingDayCompletions / completedGoals) * 100;
    
    if (strongPercentage > 60) {
      insights.push(
        `You complete ${strongPercentage.toFixed(0)}% of your goals on high-energy days`
      );
      recommendations.push(
        "Schedule important goals on days with strong alignment for best results"
      );
    }
    
    if (challengingPercentage > 30) {
      insights.push(
        `${challengingPercentage.toFixed(0)}% of completions happen on challenging days—impressive resilience!`
      );
      recommendations.push(
        "You can push through difficult days. Consider breaking big goals into smaller tasks."
      );
    }
    
    if (moderateDayCompletions > strongDayCompletions) {
      insights.push("You're most productive on moderate energy days");
      recommendations.push(
        "Moderate days offer balance. Use them for steady progress on medium-priority goals."
      );
    }
  }
  
  // Category insights
  const categoryCount: Record<string, number> = {};
  goals.forEach((g) => {
    if (g.completed) {
      categoryCount[g.category] = (categoryCount[g.category] || 0) + 1;
    }
  });
  
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push(`Your strongest area: ${topCategory[0]} goals (${topCategory[1]} completed)`);
  }
  
  // Completion rate insights
  if (completionRate >= 80) {
    insights.push("Outstanding goal achievement rate!");
  } else if (completionRate >= 50) {
    insights.push("Good progress on your goals");
    recommendations.push("Consider setting more ambitious targets or breaking goals into milestones");
  } else if (completionRate > 0) {
    insights.push("Room for improvement in goal completion");
    recommendations.push("Try aligning goal deadlines with your high-energy days");
  }
  
  if (insights.length === 0) {
    insights.push("Start tracking goals to discover your success patterns");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Set 3-5 monthly goals and track completion against energy levels");
  }
  
  return {
    totalGoals,
    completedGoals,
    completionRate,
    strongDayCompletions,
    moderateDayCompletions,
    challengingDayCompletions,
    insights,
    recommendations,
  };
}

/**
 * Get goal suggestions based on energy level
 */
export function getGoalSuggestions(
  energyLevel: "strong" | "moderate" | "challenging"
): string[] {
  const suggestions: Record<string, string[]> = {
    strong: [
      "Launch a new product or service",
      "Have an important client meeting",
      "Make a major business decision",
      "Start a challenging project",
      "Negotiate a deal or contract",
      "Present to stakeholders",
    ],
    moderate: [
      "Plan next quarter's strategy",
      "Review and optimize processes",
      "Team collaboration sessions",
      "Content creation and writing",
      "Networking and relationship building",
      "Learning and skill development",
    ],
    challenging: [
      "Administrative tasks and paperwork",
      "Routine maintenance and updates",
      "Research and information gathering",
      "Self-care and recovery",
      "Delegate and empower others",
      "Reflect and plan ahead",
    ],
  };
  
  return suggestions[energyLevel] || [];
}

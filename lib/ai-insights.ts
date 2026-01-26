import AsyncStorage from "@react-native-async-storage/async-storage";

const INSIGHTS_KEY = "ai_insights";
const ANOMALIES_KEY = "detected_anomalies";
const RECOMMENDATIONS_KEY = "ai_recommendations";

export interface AIInsight {
  id: string;
  type: "pattern" | "prediction" | "recommendation" | "anomaly" | "goal";
  category: "energy" | "sleep" | "nutrition" | "habits" | "social" | "overall";
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  actions?: InsightAction[];
  dataPoints: Record<string, unknown>;
  generatedDate: string;
  expiryDate?: string;
  dismissed: boolean;
}

export interface InsightAction {
  id: string;
  label: string;
  type: "navigate" | "create_habit" | "set_goal" | "schedule" | "external";
  params?: Record<string, unknown>;
}

export interface Anomaly {
  id: string;
  detectedDate: string;
  type: "energy_drop" | "sleep_disruption" | "habit_break" | "unusual_pattern";
  severity: "low" | "medium" | "high";
  description: string;
  possibleCauses: string[];
  recommendations: string[];
  resolved: boolean;
  resolvedDate?: string;
}

export interface PersonalizedRecommendation {
  id: string;
  category: "energy" | "sleep" | "nutrition" | "habits" | "stress";
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: "low" | "medium" | "high";
  difficulty: "easy" | "moderate" | "challenging";
  timeframe: string; // e.g., "1 week", "2 weeks"
  steps: string[];
  createdDate: string;
  accepted: boolean;
  completed: boolean;
}

export interface EnergyForecast {
  date: string;
  predictedEnergy: number;
  confidence: number;
  factors: ForecastFactor[];
  recommendations: string[];
}

export interface ForecastFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // 0-1
  description: string;
}

export interface GoalSuggestion {
  id: string;
  category: "energy" | "sleep" | "habits" | "fitness" | "wellness";
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  timeframe: number; // days
  difficulty: "easy" | "moderate" | "challenging";
  reasoning: string;
  milestones: GoalMilestone[];
}

export interface GoalMilestone {
  day: number;
  target: number;
  description: string;
}

export interface PatternRecognition {
  patternType: "daily" | "weekly" | "monthly" | "seasonal";
  description: string;
  confidence: number;
  examples: string[];
  recommendations: string[];
}

/**
 * Get all AI insights
 */
export async function getAIInsights(
  filters?: {
    type?: AIInsight["type"];
    category?: AIInsight["category"];
    priority?: AIInsight["priority"];
    dismissed?: boolean;
  }
): Promise<AIInsight[]> {
  try {
    const data = await AsyncStorage.getItem(INSIGHTS_KEY);
    let insights: AIInsight[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.type) {
        insights = insights.filter((i) => i.type === filters.type);
      }
      if (filters.category) {
        insights = insights.filter((i) => i.category === filters.category);
      }
      if (filters.priority) {
        insights = insights.filter((i) => i.priority === filters.priority);
      }
      if (filters.dismissed !== undefined) {
        insights = insights.filter((i) => i.dismissed === filters.dismissed);
      }
    }
    
    // Remove expired insights
    const now = new Date();
    insights = insights.filter((i) => !i.expiryDate || new Date(i.expiryDate) > now);
    
    // Sort by priority and date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    insights.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime();
    });
    
    return insights;
  } catch (error) {
    console.error("Failed to get AI insights:", error);
    return [];
  }
}

/**
 * Generate AI insights
 */
export async function generateAIInsights(): Promise<AIInsight[]> {
  try {
    // In real implementation, would use ML model to analyze user data
    // For now, generate sample insights based on patterns
    
    const newInsights: AIInsight[] = [
      {
        id: `insight_${Date.now()}_1`,
        type: "pattern",
        category: "energy",
        title: "Your Energy Peaks at 10 AM",
        description: "Analysis of 30 days shows your energy consistently peaks between 9:30-10:30 AM. Schedule important tasks during this window.",
        confidence: 92,
        priority: "high",
        actionable: true,
        actions: [
          {
            id: "action1",
            label: "Schedule High-Priority Task",
            type: "navigate",
            params: { screen: "task-scheduler" },
          },
        ],
        dataPoints: {
          peakTime: "10:00",
          averageEnergy: 88,
          consistency: 0.92,
        },
        generatedDate: new Date().toISOString(),
        dismissed: false,
      },
      {
        id: `insight_${Date.now()}_2`,
        type: "prediction",
        category: "sleep",
        title: "Sleep Debt Accumulating",
        description: "You've averaged 6.2 hours of sleep this week. Predict 15% energy drop by Friday if pattern continues.",
        confidence: 85,
        priority: "high",
        actionable: true,
        actions: [
          {
            id: "action2",
            label: "Set Earlier Bedtime",
            type: "create_habit",
            params: { habitType: "sleep", targetTime: "22:30" },
          },
        ],
        dataPoints: {
          averageSleep: 6.2,
          targetSleep: 7.5,
          deficit: 1.3,
        },
        generatedDate: new Date().toISOString(),
        dismissed: false,
      },
      {
        id: `insight_${Date.now()}_3`,
        type: "recommendation",
        category: "nutrition",
        title: "Reduce Afternoon Caffeine",
        description: "Caffeine after 2 PM correlates with 20% lower sleep quality. Try cutting off at 1 PM for better rest.",
        confidence: 78,
        priority: "medium",
        actionable: true,
        actions: [
          {
            id: "action3",
            label: "Track Caffeine Timing",
            type: "navigate",
            params: { screen: "nutrition-tracker" },
          },
        ],
        dataPoints: {
          afternoonCaffeine: 3.2,
          sleepQualityImpact: -20,
        },
        generatedDate: new Date().toISOString(),
        dismissed: false,
      },
      {
        id: `insight_${Date.now()}_4`,
        type: "goal",
        category: "habits",
        title: "Meditation Habit Opportunity",
        description: "Users with similar profiles who meditate 10min/day report 25% higher energy. Start with 5min/day.",
        confidence: 71,
        priority: "medium",
        actionable: true,
        actions: [
          {
            id: "action4",
            label: "Start Meditation Habit",
            type: "create_habit",
            params: { habitType: "meditation", duration: 5 },
          },
        ],
        dataPoints: {
          similarUserBenefit: 0.25,
          recommendedDuration: 5,
        },
        generatedDate: new Date().toISOString(),
        dismissed: false,
      },
    ];
    
    // Save insights
    const existingInsights = await getAIInsights();
    const allInsights = [...existingInsights, ...newInsights];
    await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(allInsights));
    
    return newInsights;
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    return [];
  }
}

/**
 * Dismiss insight
 */
export async function dismissInsight(insightId: string): Promise<void> {
  try {
    const insights = await getAIInsights({ dismissed: false });
    const insight = insights.find((i) => i.id === insightId);
    
    if (insight) {
      insight.dismissed = true;
      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
    }
  } catch (error) {
    console.error("Failed to dismiss insight:", error);
    throw error;
  }
}

/**
 * Detect anomalies
 */
export async function detectAnomalies(): Promise<Anomaly[]> {
  try {
    // In real implementation, would use statistical analysis and ML
    // For now, generate sample anomalies
    
    const anomalies: Anomaly[] = [
      {
        id: `anomaly_${Date.now()}_1`,
        detectedDate: new Date().toISOString(),
        type: "energy_drop",
        severity: "high",
        description: "Energy dropped 35% below your 30-day average yesterday",
        possibleCauses: [
          "Poor sleep quality (4.5 hours)",
          "Skipped morning routine",
          "High stress day",
        ],
        recommendations: [
          "Prioritize 8 hours sleep tonight",
          "Resume morning routine tomorrow",
          "Schedule recovery day",
        ],
        resolved: false,
      },
      {
        id: `anomaly_${Date.now()}_2`,
        detectedDate: new Date(Date.now() - 86400000).toISOString(),
        type: "sleep_disruption",
        severity: "medium",
        description: "Sleep pattern disrupted 3 nights this week",
        possibleCauses: [
          "Late screen time",
          "Irregular bedtime",
          "Caffeine after 3 PM",
        ],
        recommendations: [
          "Set consistent bedtime",
          "Enable night mode on devices",
          "Cut caffeine by 2 PM",
        ],
        resolved: false,
      },
    ];
    
    await AsyncStorage.setItem(ANOMALIES_KEY, JSON.stringify(anomalies));
    return anomalies;
  } catch (error) {
    console.error("Failed to detect anomalies:", error);
    return [];
  }
}

/**
 * Get anomalies
 */
export async function getAnomalies(resolved?: boolean): Promise<Anomaly[]> {
  try {
    const data = await AsyncStorage.getItem(ANOMALIES_KEY);
    let anomalies: Anomaly[] = data ? JSON.parse(data) : [];
    
    if (resolved !== undefined) {
      anomalies = anomalies.filter((a) => a.resolved === resolved);
    }
    
    return anomalies;
  } catch (error) {
    console.error("Failed to get anomalies:", error);
    return [];
  }
}

/**
 * Resolve anomaly
 */
export async function resolveAnomaly(anomalyId: string): Promise<void> {
  try {
    const anomalies = await getAnomalies();
    const anomaly = anomalies.find((a) => a.id === anomalyId);
    
    if (anomaly) {
      anomaly.resolved = true;
      anomaly.resolvedDate = new Date().toISOString();
      await AsyncStorage.setItem(ANOMALIES_KEY, JSON.stringify(anomalies));
    }
  } catch (error) {
    console.error("Failed to resolve anomaly:", error);
    throw error;
  }
}

/**
 * Generate personalized recommendations
 */
export async function generateRecommendations(): Promise<PersonalizedRecommendation[]> {
  try {
    const recommendations: PersonalizedRecommendation[] = [
      {
        id: `rec_${Date.now()}_1`,
        category: "sleep",
        title: "Optimize Sleep Schedule",
        description: "Shift bedtime 30 minutes earlier to align with natural circadian rhythm",
        reasoning: "Your energy data shows peak performance when you sleep 10:30 PM - 6:30 AM",
        expectedImpact: "high",
        difficulty: "moderate",
        timeframe: "2 weeks",
        steps: [
          "Week 1: Move bedtime to 11:00 PM",
          "Week 2: Move bedtime to 10:30 PM",
          "Maintain consistent wake time at 6:30 AM",
          "Avoid screens 1 hour before bed",
        ],
        createdDate: new Date().toISOString(),
        accepted: false,
        completed: false,
      },
      {
        id: `rec_${Date.now()}_2`,
        category: "energy",
        title: "Add Midday Energy Boost",
        description: "10-minute walk after lunch to prevent afternoon energy dip",
        reasoning: "Your energy drops 40% between 2-3 PM. Light exercise can boost it 25%.",
        expectedImpact: "medium",
        difficulty: "easy",
        timeframe: "1 week",
        steps: [
          "Set 1:00 PM reminder for walk",
          "Walk outside for 10 minutes",
          "Track energy before and after",
          "Adjust timing based on results",
        ],
        createdDate: new Date().toISOString(),
        accepted: false,
        completed: false,
      },
      {
        id: `rec_${Date.now()}_3`,
        category: "nutrition",
        title: "Protein-Rich Breakfast",
        description: "Increase morning protein to 25g for sustained energy",
        reasoning: "Days with 25g+ protein breakfast show 30% better energy stability",
        expectedImpact: "high",
        difficulty: "easy",
        timeframe: "1 week",
        steps: [
          "Add 2 eggs or Greek yogurt to breakfast",
          "Track energy levels throughout morning",
          "Compare with low-protein days",
          "Adjust portions as needed",
        ],
        createdDate: new Date().toISOString(),
        accepted: false,
        completed: false,
      },
    ];
    
    await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    return recommendations;
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return [];
  }
}

/**
 * Get recommendations
 */
export async function getRecommendations(
  filters?: {
    category?: PersonalizedRecommendation["category"];
    accepted?: boolean;
    completed?: boolean;
  }
): Promise<PersonalizedRecommendation[]> {
  try {
    const data = await AsyncStorage.getItem(RECOMMENDATIONS_KEY);
    let recommendations: PersonalizedRecommendation[] = data ? JSON.parse(data) : [];
    
    if (filters) {
      if (filters.category) {
        recommendations = recommendations.filter((r) => r.category === filters.category);
      }
      if (filters.accepted !== undefined) {
        recommendations = recommendations.filter((r) => r.accepted === filters.accepted);
      }
      if (filters.completed !== undefined) {
        recommendations = recommendations.filter((r) => r.completed === filters.completed);
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return [];
  }
}

/**
 * Accept recommendation
 */
export async function acceptRecommendation(recommendationId: string): Promise<void> {
  try {
    const recommendations = await getRecommendations();
    const recommendation = recommendations.find((r) => r.id === recommendationId);
    
    if (recommendation) {
      recommendation.accepted = true;
      await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    }
  } catch (error) {
    console.error("Failed to accept recommendation:", error);
    throw error;
  }
}

/**
 * Generate energy forecast
 */
export async function generateEnergyForecast(days: number = 7): Promise<EnergyForecast[]> {
  try {
    const forecast: EnergyForecast[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simulate forecast based on day of week and patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const baseEnergy = isWeekend ? 75 : 70;
      const variance = Math.random() * 10 - 5;
      const predictedEnergy = Math.round(baseEnergy + variance);
      
      const factors: ForecastFactor[] = [
        {
          name: "Sleep Quality",
          impact: predictedEnergy > 75 ? "positive" : "neutral",
          weight: 0.35,
          description: "Expected 7.5 hours based on recent patterns",
        },
        {
          name: "Day of Week",
          impact: isWeekend ? "positive" : "neutral",
          weight: 0.15,
          description: isWeekend ? "Weekend recovery day" : "Regular workday",
        },
        {
          name: "Weather",
          impact: "neutral",
          weight: 0.10,
          description: "Partly cloudy, 72°F",
        },
        {
          name: "Habits",
          impact: "positive",
          weight: 0.25,
          description: "Morning routine and exercise planned",
        },
        {
          name: "Social",
          impact: "neutral",
          weight: 0.15,
          description: "Moderate social activity expected",
        },
      ];
      
      const recommendations: string[] = [];
      if (predictedEnergy < 70) {
        recommendations.push("Schedule lighter workload");
        recommendations.push("Prioritize sleep tonight");
        recommendations.push("Add energy-boosting activities");
      } else if (predictedEnergy > 80) {
        recommendations.push("Tackle challenging tasks");
        recommendations.push("Schedule important meetings");
        recommendations.push("Maintain momentum with habits");
      }
      
      forecast.push({
        date: date.toISOString().split("T")[0],
        predictedEnergy,
        confidence: 75 + Math.random() * 15,
        factors,
        recommendations,
      });
    }
    
    return forecast;
  } catch (error) {
    console.error("Failed to generate energy forecast:", error);
    return [];
  }
}

/**
 * Suggest goals
 */
export async function suggestGoals(): Promise<GoalSuggestion[]> {
  try {
    const suggestions: GoalSuggestion[] = [
      {
        id: `goal_${Date.now()}_1`,
        category: "energy",
        title: "Increase Average Energy to 80",
        description: "Boost your daily average energy score from 72 to 80",
        targetValue: 80,
        currentValue: 72,
        unit: "points",
        timeframe: 30,
        difficulty: "moderate",
        reasoning: "Your energy patterns show potential for 10% improvement with consistent habits",
        milestones: [
          { day: 7, target: 74, description: "Establish morning routine" },
          { day: 14, target: 76, description: "Optimize sleep schedule" },
          { day: 21, target: 78, description: "Add energy-boosting habits" },
          { day: 30, target: 80, description: "Achieve target energy" },
        ],
      },
      {
        id: `goal_${Date.now()}_2`,
        category: "sleep",
        title: "Achieve 7.5 Hours Sleep Consistently",
        description: "Reach 7.5 hours sleep average for 21 consecutive days",
        targetValue: 7.5,
        currentValue: 6.8,
        unit: "hours",
        timeframe: 21,
        difficulty: "moderate",
        reasoning: "Sleep is your biggest energy lever. 7.5 hours will boost energy 15-20%",
        milestones: [
          { day: 7, target: 7.0, description: "Shift bedtime 15 minutes earlier" },
          { day: 14, target: 7.25, description: "Shift bedtime 30 minutes earlier" },
          { day: 21, target: 7.5, description: "Maintain consistent 7.5 hours" },
        ],
      },
      {
        id: `goal_${Date.now()}_3`,
        category: "habits",
        title: "Complete 5 Habits Daily for 30 Days",
        description: "Build consistency by completing 5 core habits every day",
        targetValue: 5,
        currentValue: 3.2,
        unit: "habits/day",
        timeframe: 30,
        difficulty: "challenging",
        reasoning: "Habit consistency correlates with 25% higher energy stability",
        milestones: [
          { day: 10, target: 4, description: "Add 1 new habit" },
          { day: 20, target: 5, description: "Add 2nd new habit" },
          { day: 30, target: 5, description: "Maintain all 5 habits" },
        ],
      },
    ];
    
    return suggestions;
  } catch (error) {
    console.error("Failed to suggest goals:", error);
    return [];
  }
}

/**
 * Recognize patterns
 */
export async function recognizePatterns(): Promise<PatternRecognition[]> {
  try {
    const patterns: PatternRecognition[] = [
      {
        patternType: "daily",
        description: "Energy peaks 10-11 AM, dips 2-3 PM, recovers 5-6 PM",
        confidence: 89,
        examples: [
          "Monday: Peak 10:15 AM (88), Dip 2:30 PM (62)",
          "Tuesday: Peak 10:30 AM (85), Dip 2:45 PM (58)",
          "Wednesday: Peak 10:00 AM (90), Dip 2:15 PM (65)",
        ],
        recommendations: [
          "Schedule important work 10-11 AM",
          "Take walk at 2 PM to prevent dip",
          "Plan creative work for 5-6 PM recovery",
        ],
      },
      {
        patternType: "weekly",
        description: "Energy highest Monday-Tuesday, lowest Thursday-Friday",
        confidence: 82,
        examples: [
          "Week 1: Mon 82, Tue 80, Wed 75, Thu 68, Fri 65",
          "Week 2: Mon 85, Tue 83, Wed 78, Thu 70, Fri 67",
          "Week 3: Mon 80, Tue 81, Wed 76, Thu 69, Fri 66",
        ],
        recommendations: [
          "Front-load important tasks early in week",
          "Schedule lighter work Thursday-Friday",
          "Plan recovery activities for weekends",
        ],
      },
      {
        patternType: "monthly",
        description: "Energy drops 15% during first week of month (deadline stress)",
        confidence: 75,
        examples: [
          "January 1-7: Average 68 (vs 80 rest of month)",
          "February 1-7: Average 70 (vs 82 rest of month)",
          "March 1-7: Average 67 (vs 79 rest of month)",
        ],
        recommendations: [
          "Prepare for month-end deadlines earlier",
          "Add stress management first week",
          "Increase sleep priority during this period",
        ],
      },
    ];
    
    return patterns;
  } catch (error) {
    console.error("Failed to recognize patterns:", error);
    return [];
  }
}

/**
 * Get AI insights summary
 */
export async function getAIInsightsSummary(): Promise<{
  totalInsights: number;
  criticalInsights: number;
  activeAnomalies: number;
  pendingRecommendations: number;
  acceptedRecommendations: number;
  averageConfidence: number;
}> {
  try {
    const insights = await getAIInsights({ dismissed: false });
    const anomalies = await getAnomalies(false);
    const recommendations = await getRecommendations();
    
    const criticalInsights = insights.filter((i) => i.priority === "critical").length;
    const pendingRecommendations = recommendations.filter((r) => !r.accepted).length;
    const acceptedRecommendations = recommendations.filter((r) => r.accepted).length;
    
    const averageConfidence = insights.length > 0
      ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)
      : 0;
    
    return {
      totalInsights: insights.length,
      criticalInsights,
      activeAnomalies: anomalies.length,
      pendingRecommendations,
      acceptedRecommendations,
      averageConfidence,
    };
  } catch (error) {
    console.error("Failed to get AI insights summary:", error);
    return {
      totalInsights: 0,
      criticalInsights: 0,
      activeAnomalies: 0,
      pendingRecommendations: 0,
      acceptedRecommendations: 0,
      averageConfidence: 0,
    };
  }
}

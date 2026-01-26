import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CorrelationData {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  confidence: number; // 0 to 1
  dataPoints: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: "increasing" | "decreasing" | "stable";
  changePercent: number;
  average: number;
  min: number;
  max: number;
}

export interface AnalyticsReport {
  title: string;
  generatedDate: string;
  timeRange: TimeRange;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: "chart" | "table" | "text" | "correlation";
  data: any;
}

/**
 * Get predefined time ranges
 */
export function getTimeRanges(): TimeRange[] {
  const now = new Date();
  
  return [
    {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: now,
      label: "Today",
    },
    {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
      label: "Last 7 Days",
    },
    {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
      label: "Last 30 Days",
    },
    {
      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      end: now,
      label: "Last 90 Days",
    },
    {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
      label: "This Year",
    },
    {
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear() - 1, 11, 31),
      label: "Last Year",
    },
  ];
}

/**
 * Get energy trend data
 */
export async function getEnergyTrendData(
  timeRange: TimeRange
): Promise<DataPoint[]> {
  // In real implementation, would fetch from AsyncStorage
  // For now, generate sample data
  
  const data: DataPoint[] = [];
  const daysDiff = Math.ceil(
    (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(timeRange.start);
    date.setDate(date.getDate() + i);
    
    // Simulate energy data with some variation
    const baseEnergy = 65;
    const variation = Math.sin(i / 7) * 15 + Math.random() * 10;
    const value = Math.max(20, Math.min(100, baseEnergy + variation));
    
    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value),
    });
  }
  
  return data;
}

/**
 * Analyze trend
 */
export function analyzeTrend(data: DataPoint[]): TrendAnalysis {
  if (data.length === 0) {
    return {
      metric: "Energy",
      trend: "stable",
      changePercent: 0,
      average: 0,
      min: 0,
      max: 0,
    };
  }
  
  const values = data.map((d) => d.value);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate trend using linear regression
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
  
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  let trend: "increasing" | "decreasing" | "stable";
  if (Math.abs(changePercent) < 5) {
    trend = "stable";
  } else if (changePercent > 0) {
    trend = "increasing";
  } else {
    trend = "decreasing";
  }
  
  return {
    metric: "Energy",
    trend,
    changePercent: Math.round(changePercent * 10) / 10,
    average: Math.round(average),
    min,
    max,
  };
}

/**
 * Calculate correlation between two metrics
 */
export function calculateCorrelation(
  data1: DataPoint[],
  data2: DataPoint[]
): number {
  if (data1.length !== data2.length || data1.length === 0) {
    return 0;
  }
  
  const n = data1.length;
  const values1 = data1.map((d) => d.value);
  const values2 = data2.map((d) => d.value);
  
  const mean1 = values1.reduce((sum, v) => sum + v, 0) / n;
  const mean2 = values2.reduce((sum, v) => sum + v, 0) / n;
  
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(denominator1 * denominator2);
  
  if (denominator === 0) {
    return 0;
  }
  
  return numerator / denominator;
}

/**
 * Get correlation analysis
 */
export async function getCorrelationAnalysis(
  timeRange: TimeRange
): Promise<CorrelationData[]> {
  // In real implementation, would fetch actual data
  // For now, simulate correlations
  
  const correlations: CorrelationData[] = [
    {
      factor1: "Sleep Quality",
      factor2: "Energy Level",
      correlation: 0.78,
      confidence: 0.92,
      dataPoints: 30,
    },
    {
      factor1: "Exercise",
      factor2: "Energy Level",
      correlation: 0.65,
      confidence: 0.88,
      dataPoints: 25,
    },
    {
      factor1: "Nutrition Score",
      factor2: "Energy Level",
      correlation: 0.54,
      confidence: 0.81,
      dataPoints: 28,
    },
    {
      factor1: "Stress Level",
      factor2: "Energy Level",
      correlation: -0.62,
      confidence: 0.85,
      dataPoints: 27,
    },
    {
      factor1: "Social Interactions",
      factor2: "Energy Level",
      correlation: 0.42,
      confidence: 0.76,
      dataPoints: 22,
    },
    {
      factor1: "Weather (Temperature)",
      factor2: "Energy Level",
      correlation: 0.31,
      confidence: 0.68,
      dataPoints: 30,
    },
  ];
  
  return correlations;
}

/**
 * Get habit success rate data
 */
export async function getHabitSuccessRates(
  timeRange: TimeRange
): Promise<{ habit: string; successRate: number; totalDays: number }[]> {
  // In real implementation, would fetch from AsyncStorage
  // For now, generate sample data
  
  return [
    {
      habit: "Morning Meditation",
      successRate: 85,
      totalDays: 30,
    },
    {
      habit: "Exercise",
      successRate: 72,
      totalDays: 30,
    },
    {
      habit: "Healthy Eating",
      successRate: 68,
      totalDays: 30,
    },
    {
      habit: "8 Hours Sleep",
      successRate: 61,
      totalDays: 30,
    },
    {
      habit: "Journaling",
      successRate: 54,
      totalDays: 30,
    },
  ];
}

/**
 * Get sleep quality vs energy data
 */
export async function getSleepEnergyData(
  timeRange: TimeRange
): Promise<{ date: string; sleepQuality: number; energyLevel: number }[]> {
  // In real implementation, would fetch from AsyncStorage
  // For now, generate sample data
  
  const data: { date: string; sleepQuality: number; energyLevel: number }[] = [];
  const daysDiff = Math.min(
    30,
    Math.ceil(
      (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(timeRange.start);
    date.setDate(date.getDate() + i);
    
    const sleepQuality = 60 + Math.random() * 30;
    const energyLevel = sleepQuality * 0.8 + Math.random() * 15;
    
    data.push({
      date: date.toISOString().split("T")[0],
      sleepQuality: Math.round(sleepQuality),
      energyLevel: Math.round(energyLevel),
    });
  }
  
  return data;
}

/**
 * Get nutrition impact data
 */
export async function getNutritionImpactData(
  timeRange: TimeRange
): Promise<{
  bestFoods: { food: string; avgEnergyIncrease: number; count: number }[];
  worstFoods: { food: string; avgEnergyDecrease: number; count: number }[];
}> {
  // In real implementation, would analyze actual meal and energy data
  // For now, return sample data
  
  return {
    bestFoods: [
      { food: "Oatmeal", avgEnergyIncrease: 15, count: 12 },
      { food: "Salmon", avgEnergyIncrease: 12, count: 8 },
      { food: "Spinach Salad", avgEnergyIncrease: 10, count: 15 },
      { food: "Almonds", avgEnergyIncrease: 8, count: 20 },
      { food: "Green Tea", avgEnergyIncrease: 7, count: 25 },
    ],
    worstFoods: [
      { food: "Sugary Snacks", avgEnergyDecrease: -18, count: 10 },
      { food: "Heavy Pasta", avgEnergyDecrease: -12, count: 7 },
      { food: "Energy Drinks", avgEnergyDecrease: -10, count: 5 },
      { food: "Fast Food", avgEnergyDecrease: -15, count: 6 },
      { food: "Late Night Snacks", avgEnergyDecrease: -8, count: 12 },
    ],
  };
}

/**
 * Get workout effectiveness data
 */
export async function getWorkoutEffectivenessData(
  timeRange: TimeRange
): Promise<{
  workoutType: string;
  avgEnergyBefore: number;
  avgEnergyAfter: number;
  sessions: number;
}[]> {
  // In real implementation, would fetch from AsyncStorage
  // For now, return sample data
  
  return [
    {
      workoutType: "Morning Run",
      avgEnergyBefore: 55,
      avgEnergyAfter: 75,
      sessions: 15,
    },
    {
      workoutType: "Yoga",
      avgEnergyBefore: 50,
      avgEnergyAfter: 68,
      sessions: 12,
    },
    {
      workoutType: "Weight Training",
      avgEnergyBefore: 60,
      avgEnergyAfter: 72,
      sessions: 10,
    },
    {
      workoutType: "Swimming",
      avgEnergyBefore: 58,
      avgEnergyAfter: 78,
      sessions: 8,
    },
    {
      workoutType: "Cycling",
      avgEnergyBefore: 62,
      avgEnergyAfter: 80,
      sessions: 11,
    },
  ];
}

/**
 * Get social energy patterns
 */
export async function getSocialEnergyPatterns(
  timeRange: TimeRange
): Promise<{
  activityType: string;
  avgEnergyChange: number;
  occurrences: number;
}[]> {
  // In real implementation, would fetch from AsyncStorage
  // For now, return sample data
  
  return [
    {
      activityType: "Solo Time",
      avgEnergyChange: 8,
      occurrences: 25,
    },
    {
      activityType: "Small Group (2-3)",
      avgEnergyChange: 5,
      occurrences: 18,
    },
    {
      activityType: "Medium Group (4-6)",
      avgEnergyChange: -2,
      occurrences: 12,
    },
    {
      activityType: "Large Group (7+)",
      avgEnergyChange: -8,
      occurrences: 6,
    },
    {
      activityType: "Video Calls",
      avgEnergyChange: -5,
      occurrences: 20,
    },
    {
      activityType: "In-Person Meetings",
      avgEnergyChange: -10,
      occurrences: 15,
    },
  ];
}

/**
 * Generate comprehensive analytics report
 */
export async function generateAnalyticsReport(
  timeRange: TimeRange
): Promise<AnalyticsReport> {
  const energyData = await getEnergyTrendData(timeRange);
  const trendAnalysis = analyzeTrend(energyData);
  const correlations = await getCorrelationAnalysis(timeRange);
  const habitRates = await getHabitSuccessRates(timeRange);
  const sleepEnergyData = await getSleepEnergyData(timeRange);
  const nutritionData = await getNutritionImpactData(timeRange);
  const workoutData = await getWorkoutEffectivenessData(timeRange);
  const socialData = await getSocialEnergyPatterns(timeRange);
  
  const report: AnalyticsReport = {
    title: `Energy Analytics Report - ${timeRange.label}`,
    generatedDate: new Date().toISOString(),
    timeRange,
    sections: [
      {
        title: "Energy Trend Overview",
        type: "chart",
        data: {
          chartData: energyData,
          analysis: trendAnalysis,
        },
      },
      {
        title: "Key Correlations",
        type: "correlation",
        data: correlations,
      },
      {
        title: "Habit Success Rates",
        type: "table",
        data: habitRates,
      },
      {
        title: "Sleep vs Energy",
        type: "chart",
        data: sleepEnergyData,
      },
      {
        title: "Nutrition Impact",
        type: "table",
        data: nutritionData,
      },
      {
        title: "Workout Effectiveness",
        type: "table",
        data: workoutData,
      },
      {
        title: "Social Energy Patterns",
        type: "table",
        data: socialData,
      },
    ],
  };
  
  return report;
}

/**
 * Export report to JSON
 */
export async function exportReportToJSON(report: AnalyticsReport): Promise<string> {
  return JSON.stringify(report, null, 2);
}

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(
  timeRange: TimeRange
): Promise<{
  averageEnergy: number;
  energyTrend: string;
  topCorrelation: CorrelationData;
  bestHabit: string;
  keyInsight: string;
}> {
  const energyData = await getEnergyTrendData(timeRange);
  const trendAnalysis = analyzeTrend(energyData);
  const correlations = await getCorrelationAnalysis(timeRange);
  const habitRates = await getHabitSuccessRates(timeRange);
  
  const topCorrelation = correlations.sort((a, b) => 
    Math.abs(b.correlation) - Math.abs(a.correlation)
  )[0];
  
  const bestHabit = habitRates.sort((a, b) => b.successRate - a.successRate)[0];
  
  let keyInsight = "";
  if (trendAnalysis.trend === "increasing") {
    keyInsight = `Your energy is trending up by ${Math.abs(trendAnalysis.changePercent)}%! Keep up the great work.`;
  } else if (trendAnalysis.trend === "decreasing") {
    keyInsight = `Your energy has decreased by ${Math.abs(trendAnalysis.changePercent)}%. Focus on ${topCorrelation.factor1.toLowerCase()} to improve.`;
  } else {
    keyInsight = `Your energy is stable. Consider optimizing ${topCorrelation.factor1.toLowerCase()} for better results.`;
  }
  
  return {
    averageEnergy: trendAnalysis.average,
    energyTrend: trendAnalysis.trend,
    topCorrelation,
    bestHabit: bestHabit.habit,
    keyInsight,
  };
}

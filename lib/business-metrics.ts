import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";
import { calculateUnifiedEnergy } from "./unified-energy-engine";

const METRICS_KEY = "@energy_today_business_metrics";

export interface BusinessMetric {
  id: string;
  date: string;
  type: "revenue" | "deals" | "meetings" | "leads" | "productivity" | "custom";
  name: string;
  value: number;
  unit: string;
  notes?: string;
  createdAt: string;
}

export interface MetricWithEnergy extends BusinessMetric {
  energyAlignment: "strong" | "moderate" | "challenging";
  energyScore: number;
}

export interface BusinessInsights {
  totalMetrics: number;
  averageOnStrongDays: number;
  averageOnModerateDays: number;
  averageOnChallengingDays: number;
  strongDayAdvantage: number;
  bestMetricType: string;
  insights: string[];
  roiEstimate: {
    currentAnnualValue: number;
    potentialWithOptimization: number;
    uplift: number;
    upliftPercent: number;
  };
}

export async function getBusinessMetrics(): Promise<BusinessMetric[]> {
  const data = await AsyncStorage.getItem(METRICS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveBusinessMetrics(metrics: BusinessMetric[]): Promise<void> {
  await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

export async function addBusinessMetric(
  date: string,
  type: BusinessMetric["type"],
  name: string,
  value: number,
  unit: string,
  notes?: string
): Promise<BusinessMetric> {
  const metrics = await getBusinessMetrics();
  const newMetric: BusinessMetric = {
    id: Date.now().toString(),
    date,
    type,
    name,
    value,
    unit,
    notes,
    createdAt: new Date().toISOString(),
  };
  metrics.push(newMetric);
  await saveBusinessMetrics(metrics);
  return newMetric;
}

export async function deleteBusinessMetric(metricId: string): Promise<void> {
  const metrics = await getBusinessMetrics();
  const updated = metrics.filter((m) => m.id !== metricId);
  await saveBusinessMetrics(updated);
}

export async function getMetricsWithEnergy(profile: UserProfile): Promise<MetricWithEnergy[]> {
  const metrics = await getBusinessMetrics();
  
  const metricsWithEnergy = await Promise.all(
    metrics.map(async (metric) => {
      const date = new Date(metric.date);
      const unifiedEnergy = await calculateUnifiedEnergy(profile, date);
      
      // Use Perfect Day Score for more accurate alignment
      const perfectDayScore = unifiedEnergy.combinedAnalysis.perfectDayScore;
      const alignment: "strong" | "moderate" | "challenging" = perfectDayScore >= 75 ? "strong" : perfectDayScore >= 50 ? "moderate" : "challenging";
      
      return {
        ...metric,
        energyAlignment: alignment,
        energyScore: perfectDayScore,
      };
    })
  );
  
  return metricsWithEnergy;
}

export async function analyzeBusinessMetrics(profile: UserProfile): Promise<BusinessInsights> {
  const metricsWithEnergy = await getMetricsWithEnergy(profile);
  
  if (metricsWithEnergy.length === 0) {
    return {
      totalMetrics: 0,
      averageOnStrongDays: 0,
      averageOnModerateDays: 0,
      averageOnChallengingDays: 0,
      strongDayAdvantage: 0,
      bestMetricType: "none",
      insights: [
        "Start tracking business metrics to see how energy affects performance",
      ],
      roiEstimate: {
        currentAnnualValue: 0,
        potentialWithOptimization: 0,
        uplift: 0,
        upliftPercent: 0,
      },
    };
  }
  
  const strongDayMetrics = metricsWithEnergy.filter((m) => m.energyAlignment === "strong");
  const moderateDayMetrics = metricsWithEnergy.filter((m) => m.energyAlignment === "moderate");
  const challengingDayMetrics = metricsWithEnergy.filter((m) => m.energyAlignment === "challenging");
  
  const avgStrong =
    strongDayMetrics.length > 0
      ? strongDayMetrics.reduce((sum, m) => sum + m.value, 0) / strongDayMetrics.length
      : 0;
  
  const avgModerate =
    moderateDayMetrics.length > 0
      ? moderateDayMetrics.reduce((sum, m) => sum + m.value, 0) / moderateDayMetrics.length
      : 0;
  
  const avgChallenging =
    challengingDayMetrics.length > 0
      ? challengingDayMetrics.reduce((sum, m) => sum + m.value, 0) / challengingDayMetrics.length
      : 0;
  
  const overallAvg = metricsWithEnergy.reduce((sum, m) => sum + m.value, 0) / metricsWithEnergy.length;
  const strongDayAdvantage = avgStrong > 0 ? ((avgStrong - overallAvg) / overallAvg) * 100 : 0;
  
  const metricsByType: Record<string, number[]> = {};
  metricsWithEnergy.forEach((m) => {
    if (!metricsByType[m.type]) metricsByType[m.type] = [];
    metricsByType[m.type].push(m.value);
  });
  
  let bestMetricType = "none";
  let bestAvg = 0;
  Object.entries(metricsByType).forEach(([type, values]) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestMetricType = type;
    }
  });
  
  const insights: string[] = [];
  
  if (avgStrong > avgChallenging * 1.3) {
    insights.push(
      `You perform ${((avgStrong / avgChallenging - 1) * 100).toFixed(0)}% better on strong energy days`
    );
  }
  
  const currentAnnualValue = overallAvg * 250;
  const potentialWithOptimization = avgStrong * 250;
  const uplift = potentialWithOptimization - currentAnnualValue;
  const upliftPercent = (uplift / currentAnnualValue) * 100;
  
  if (uplift > 0) {
    insights.push(
      `Optimizing your schedule could increase annual performance by ${upliftPercent.toFixed(0)}%`
    );
  }
  
  return {
    totalMetrics: metricsWithEnergy.length,
    averageOnStrongDays: avgStrong,
    averageOnModerateDays: avgModerate,
    averageOnChallengingDays: avgChallenging,
    strongDayAdvantage,
    bestMetricType,
    insights,
    roiEstimate: {
      currentAnnualValue,
      potentialWithOptimization,
      uplift,
      upliftPercent,
    },
  };
}

function getAlignmentScore(alignment: "strong" | "moderate" | "challenging"): number {
  switch (alignment) {
    case "strong":
      return 90;
    case "moderate":
      return 60;
    case "challenging":
      return 30;
  }
}

export function getMetricTypeSuggestions(): Array<{
  type: BusinessMetric["type"];
  name: string;
  unit: string;
  icon: string;
}> {
  return [
    { type: "revenue", name: "Revenue", unit: "$", icon: "💰" },
    { type: "deals", name: "Deals Closed", unit: "deals", icon: "🤝" },
    { type: "meetings", name: "Successful Meetings", unit: "meetings", icon: "📅" },
    { type: "leads", name: "Leads Generated", unit: "leads", icon: "📈" },
    { type: "productivity", name: "Productive Hours", unit: "hours", icon: "⏱️" },
    { type: "custom", name: "Custom Metric", unit: "units", icon: "📊" },
  ];
}

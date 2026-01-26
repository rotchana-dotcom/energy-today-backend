import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export interface EnergyTrendData {
  date: string;
  userEnergy: number;
  environmentalEnergy: number;
  alignment: "strong" | "moderate" | "challenging";
  alignmentScore: number; // 0-100
}

export interface TrendAnalysis {
  period: "week" | "month";
  data: EnergyTrendData[];
  averageUserEnergy: number;
  averageEnvironmentalEnergy: number;
  averageAlignment: number;
  bestDays: string[]; // Dates with strong alignment
  challengingDays: string[]; // Dates with challenging alignment
  insights: string[];
}

/**
 * Calculate energy trends for a given period
 */
export function calculateEnergyTrends(
  profile: UserProfile,
  period: "week" | "month"
): TrendAnalysis {
  const today = new Date();
  const days = period === "week" ? 7 : 30;
  const data: EnergyTrendData[] = [];

  // Calculate energy for each day in the period
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const energy = calculateDailyEnergy(profile, date);
    
    // Convert alignment to score
    let alignmentScore = 50;
    if (energy.connection.alignment === "strong") alignmentScore = 85;
    else if (energy.connection.alignment === "moderate") alignmentScore = 60;
    else alignmentScore = 35;

    data.push({
      date: date.toISOString(),
      userEnergy: energy.userEnergy.intensity,
      environmentalEnergy: energy.environmentalEnergy.intensity,
      alignment: energy.connection.alignment,
      alignmentScore,
    });
  }

  // Calculate averages
  const avgUserEnergy = Math.round(
    data.reduce((sum, d) => sum + d.userEnergy, 0) / data.length
  );
  const avgEnvironmentalEnergy = Math.round(
    data.reduce((sum, d) => sum + d.environmentalEnergy, 0) / data.length
  );
  const avgAlignment = Math.round(
    data.reduce((sum, d) => sum + d.alignmentScore, 0) / data.length
  );

  // Identify best and challenging days
  const bestDays = data
    .filter((d) => d.alignment === "strong")
    .map((d) => d.date);
  
  const challengingDays = data
    .filter((d) => d.alignment === "challenging")
    .map((d) => d.date);

  // Generate insights
  const insights = generateTrendInsights(data, period, avgAlignment);

  return {
    period,
    data,
    averageUserEnergy: avgUserEnergy,
    averageEnvironmentalEnergy: avgEnvironmentalEnergy,
    averageAlignment: avgAlignment,
    bestDays,
    challengingDays,
    insights,
  };
}

/**
 * Generate insights from trend data
 */
function generateTrendInsights(
  data: EnergyTrendData[],
  period: "week" | "month",
  avgAlignment: number
): string[] {
  const insights: string[] = [];

  // Overall trend
  if (avgAlignment >= 70) {
    insights.push(`This ${period} has been excellent for energy alignment. Great time for important projects.`);
  } else if (avgAlignment >= 55) {
    insights.push(`This ${period} shows balanced energy patterns. Good for steady progress.`);
  } else {
    insights.push(`This ${period} has been challenging. Focus on self-care and routine tasks.`);
  }

  // Identify patterns
  const strongCount = data.filter((d) => d.alignment === "strong").length;
  const challengingCount = data.filter((d) => d.alignment === "challenging").length;

  if (strongCount >= data.length * 0.4) {
    insights.push(`You have ${strongCount} high-energy days this ${period}. Perfect for launching new initiatives.`);
  }

  if (challengingCount >= data.length * 0.3) {
    insights.push(`${challengingCount} days require extra care. Schedule lighter activities on these days.`);
  }

  // User energy trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.userEnergy, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.userEnergy, 0) / secondHalf.length;

  if (secondHalfAvg > firstHalfAvg + 10) {
    insights.push("Your personal energy is rising. Momentum is building for the days ahead.");
  } else if (firstHalfAvg > secondHalfAvg + 10) {
    insights.push("Your personal energy is declining. Consider rest and recharge activities.");
  }

  // Day of week patterns (for week view)
  if (period === "week") {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bestDay = data.reduce((best, current, index) => {
      return current.alignmentScore > data[best].alignmentScore ? index : best;
    }, 0);
    
    const dayOfWeek = new Date(data[bestDay].date).getDay();
    insights.push(`${dayNames[dayOfWeek]} shows the strongest alignment this week.`);
  }

  return insights;
}

/**
 * Get upcoming energy forecast
 */
export function getEnergyForecast(
  profile: UserProfile,
  days: number = 7
): EnergyTrendData[] {
  const forecast: EnergyTrendData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const energy = calculateDailyEnergy(profile, date);
    
    let alignmentScore = 50;
    if (energy.connection.alignment === "strong") alignmentScore = 85;
    else if (energy.connection.alignment === "moderate") alignmentScore = 60;
    else alignmentScore = 35;

    forecast.push({
      date: date.toISOString(),
      userEnergy: energy.userEnergy.intensity,
      environmentalEnergy: energy.environmentalEnergy.intensity,
      alignment: energy.connection.alignment,
      alignmentScore,
    });
  }

  return forecast;
}

/**
 * Compare current period to previous period
 */
export function compareTrendPeriods(
  profile: UserProfile,
  period: "week" | "month"
): {
  current: TrendAnalysis;
  previous: TrendAnalysis;
  change: {
    userEnergy: number;
    environmentalEnergy: number;
    alignment: number;
  };
} {
  const current = calculateEnergyTrends(profile, period);
  
  // Calculate previous period
  const days = period === "week" ? 7 : 30;
  const data: EnergyTrendData[] = [];
  const today = new Date();

  for (let i = days * 2 - 1; i >= days; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const energy = calculateDailyEnergy(profile, date);
    
    let alignmentScore = 50;
    if (energy.connection.alignment === "strong") alignmentScore = 85;
    else if (energy.connection.alignment === "moderate") alignmentScore = 60;
    else alignmentScore = 35;

    data.push({
      date: date.toISOString(),
      userEnergy: energy.userEnergy.intensity,
      environmentalEnergy: energy.environmentalEnergy.intensity,
      alignment: energy.connection.alignment,
      alignmentScore,
    });
  }

  const avgUserEnergy = Math.round(
    data.reduce((sum, d) => sum + d.userEnergy, 0) / data.length
  );
  const avgEnvironmentalEnergy = Math.round(
    data.reduce((sum, d) => sum + d.environmentalEnergy, 0) / data.length
  );
  const avgAlignment = Math.round(
    data.reduce((sum, d) => sum + d.alignmentScore, 0) / data.length
  );

  const bestDays = data.filter((d) => d.alignment === "strong").map((d) => d.date);
  const challengingDays = data.filter((d) => d.alignment === "challenging").map((d) => d.date);
  const insights = generateTrendInsights(data, period, avgAlignment);

  const previous: TrendAnalysis = {
    period,
    data,
    averageUserEnergy: avgUserEnergy,
    averageEnvironmentalEnergy: avgEnvironmentalEnergy,
    averageAlignment: avgAlignment,
    bestDays,
    challengingDays,
    insights,
  };

  return {
    current,
    previous,
    change: {
      userEnergy: current.averageUserEnergy - previous.averageUserEnergy,
      environmentalEnergy: current.averageEnvironmentalEnergy - previous.averageEnvironmentalEnergy,
      alignment: current.averageAlignment - previous.averageAlignment,
    },
  };
}

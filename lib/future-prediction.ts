/**
 * Future Prediction Module
 * 
 * Provides forward-looking energy predictions including:
 * - 7-day and 30-day energy forecasts
 * - Upcoming significant dates
 * - Future activity recommendations
 */

import { calculateDailyEnergy } from "./energy-engine";
import { DailyEnergy, UserProfile, LunarPhase } from "@/types";

export interface ForecastDay {
  date: Date;
  dateString: string;
  dailyEnergy: DailyEnergy;
  significance: string;
  recommendation: string;
  rating: "excellent" | "good" | "moderate" | "challenging";
}

export interface SignificantDate {
  date: Date;
  dateString: string;
  type: "peak" | "low" | "transition" | "lunar" | "karmic";
  title: string;
  description: string;
  actionItems: string[];
}

export interface FutureForecast {
  days: ForecastDay[];
  significantDates: SignificantDate[];
  overallTrend: "rising" | "stable" | "declining";
  bestDays: ForecastDay[];
  challengingDays: ForecastDay[];
  recommendations: string[];
}

/**
 * Generate energy forecast for the next N days
 */
export function generateForecast(
  profile: UserProfile,
  daysAhead: number = 7
): FutureForecast {
  const today = new Date();
  const forecastDays: ForecastDay[] = [];
  
  // Generate daily forecasts
  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    const dailyEnergy = calculateDailyEnergy(profile, futureDate);
    const rating = getRatingFromAlignment(dailyEnergy.connection.alignment);
    const significance = getSignificance(dailyEnergy, futureDate);
    const recommendation = getRecommendation(dailyEnergy, futureDate);
    
    forecastDays.push({
      date: futureDate,
      dateString: futureDate.toISOString().split('T')[0],
      dailyEnergy,
      significance,
      recommendation,
      rating,
    });
  }
  
  // Identify significant dates
  const significantDates = identifySignificantDates(forecastDays);
  
  // Calculate overall trend
  const overallTrend = calculateTrend(forecastDays);
  
  // Identify best and challenging days
  const bestDays = forecastDays
    .filter(day => day.rating === "excellent" || day.rating === "good")
    .sort((a, b) => {
      const aScore = getRatingScore(a.dailyEnergy.connection.alignment);
      const bScore = getRatingScore(b.dailyEnergy.connection.alignment);
      return bScore - aScore;
    })
    .slice(0, 3);
    
  const challengingDays = forecastDays
    .filter(day => day.rating === "challenging")
    .sort((a, b) => {
      const aScore = getRatingScore(a.dailyEnergy.connection.alignment);
      const bScore = getRatingScore(b.dailyEnergy.connection.alignment);
      return aScore - bScore;
    })
    .slice(0, 3);
  
  // Generate overall recommendations
  const recommendations = generateRecommendations(forecastDays, overallTrend, significantDates);
  
  return {
    days: forecastDays,
    significantDates,
    overallTrend,
    bestDays,
    challengingDays,
    recommendations,
  };
}

/**
 * Get numeric score from alignment
 */
function getRatingScore(alignment: "strong" | "moderate" | "challenging"): number {
  switch (alignment) {
    case "strong": return 3;
    case "moderate": return 2;
    case "challenging": return 1;
  }
}

/**
 * Get rating from alignment
 */
function getRatingFromAlignment(alignment: "strong" | "moderate" | "challenging"): "excellent" | "good" | "moderate" | "challenging" {
  switch (alignment) {
    case "strong": return "excellent";
    case "moderate": return "good";
    case "challenging": return "challenging";
  }
}

/**
 * Get significance description for a day
 */
function getSignificance(dailyEnergy: DailyEnergy, date: Date): string {
  const { userEnergy, environmentalEnergy, connection, lunarPhase } = dailyEnergy;
  
  const significances: string[] = [];
  
  // High alignment
  if (connection.alignment === "strong") {
    significances.push("Exceptional alignment day");
  }
  
  // Lunar phases
  if (lunarPhase === "new_moon") {
    significances.push("New Moon - New beginnings");
  } else if (lunarPhase === "full_moon") {
    significances.push("Full Moon - Completion & manifestation");
  } else if (lunarPhase === "first_quarter") {
    significances.push("First Quarter - Action & decision time");
  } else if (lunarPhase === "last_quarter") {
    significances.push("Last Quarter - Release & let go");
  }
  
  // High personal energy
  if (userEnergy.intensity >= 80) {
    significances.push("Peak personal energy");
  }
  
  // High earth energy
  if (environmentalEnergy.intensity >= 80) {
    significances.push("Strong environmental support");
  }
  
  // Low alignment
  if (connection.alignment === "challenging") {
    significances.push("Challenging alignment - Practice patience");
  }
  
  return significances.length > 0 ? significances.join(" • ") : "Regular energy day";
}

/**
 * Get recommendation for a day
 */
function getRecommendation(dailyEnergy: DailyEnergy, date: Date): string {
  const { connection } = dailyEnergy;
  
  if (connection.alignment === "strong") {
    return "Ideal for major decisions, launches, and important meetings. Your energy is in perfect harmony.";
  }
  
  if (connection.alignment === "moderate") {
    return "Good day for productive work, networking, and moving projects forward.";
  }
  
  return "Rest and recharge. This is a day for reflection, self-care, and gentle activities.";
}

/**
 * Identify significant dates in the forecast period
 */
function identifySignificantDates(forecastDays: ForecastDay[]): SignificantDate[] {
  const significantDates: SignificantDate[] = [];
  
  forecastDays.forEach((day, index) => {
    const { dailyEnergy, date, dateString } = day;
    
    // Peak energy days
    if (dailyEnergy.connection.alignment === "strong") {
      significantDates.push({
        date,
        dateString,
        type: "peak",
        title: "Peak Energy Day",
        description: "Exceptional alignment between your personal energy and environmental forces. This is a power day.",
        actionItems: [
          "Schedule important meetings or presentations",
          "Launch new projects or initiatives",
          "Make significant decisions",
          "Network with key contacts",
        ],
      });
    }
    
    // Low energy days
    if (dailyEnergy.connection.alignment === "challenging") {
      significantDates.push({
        date,
        dateString,
        type: "low",
        title: "Rest & Recharge Day",
        description: "Your energy is not aligned with environmental forces. Focus on self-care and preparation.",
        actionItems: [
          "Avoid major decisions or commitments",
          "Practice self-care and rest",
          "Reflect and plan for upcoming peak days",
          "Do routine, low-stakes tasks",
        ],
      });
    }
    
    // New Moon
    if (dailyEnergy.lunarPhase === "new_moon") {
      significantDates.push({
        date,
        dateString,
        type: "lunar",
        title: "New Moon - Fresh Start",
        description: "The moon begins a new cycle. Perfect for setting intentions and starting new ventures.",
        actionItems: [
          "Set new goals and intentions",
          "Start new projects or habits",
          "Plant seeds for future growth",
          "Meditate on what you want to create",
        ],
      });
    }
    
    // Full Moon
    if (dailyEnergy.lunarPhase === "full_moon") {
      significantDates.push({
        date,
        dateString,
        type: "lunar",
        title: "Full Moon - Completion",
        description: "The moon is at its fullest. Time to complete projects and celebrate achievements.",
        actionItems: [
          "Complete ongoing projects",
          "Celebrate wins and milestones",
          "Release what no longer serves you",
          "Express gratitude",
        ],
      });
    }
    
    // Energy transitions (big changes from previous day)
    if (index > 0) {
      const prevAlignment = forecastDays[index - 1].dailyEnergy.connection.alignment;
      const currentAlignment = dailyEnergy.connection.alignment;
      
      // Detect major transitions
      if (
        (prevAlignment === "challenging" && currentAlignment === "strong") ||
        (prevAlignment === "strong" && currentAlignment === "challenging")
      ) {
        const direction = currentAlignment === "strong" ? "rising" : "falling";
        significantDates.push({
          date,
          dateString,
          type: "transition",
          title: `Energy Shift - ${direction === "rising" ? "Upswing" : "Downswing"}`,
          description: `Significant energy transition. Your alignment is ${direction} rapidly.`,
          actionItems: direction === "rising" 
            ? ["Prepare for increased productivity", "Schedule important tasks ahead", "Build momentum"]
            : ["Slow down and consolidate", "Finish current tasks", "Prepare for rest period"],
        });
      }
    }
  });
  
  return significantDates;
}

/**
 * Calculate overall trend
 */
function calculateTrend(forecastDays: ForecastDay[]): "rising" | "stable" | "declining" {
  if (forecastDays.length < 3) return "stable";
  
  const firstThird = forecastDays.slice(0, Math.floor(forecastDays.length / 3));
  const lastThird = forecastDays.slice(-Math.floor(forecastDays.length / 3));
  
  const firstAvg = firstThird.reduce((sum, day) => sum + getRatingScore(day.dailyEnergy.connection.alignment), 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, day) => sum + getRatingScore(day.dailyEnergy.connection.alignment), 0) / lastThird.length;
  
  const difference = lastAvg - firstAvg;
  
  if (difference > 0.3) return "rising";
  if (difference < -0.3) return "declining";
  return "stable";
}

/**
 * Generate overall recommendations
 */
function generateRecommendations(
  forecastDays: ForecastDay[],
  trend: "rising" | "stable" | "declining",
  significantDates: SignificantDate[]
): string[] {
  const recommendations: string[] = [];
  
  // Trend-based recommendations
  if (trend === "rising") {
    recommendations.push("Your energy is building momentum. Schedule important activities for the latter part of this period.");
  } else if (trend === "declining") {
    recommendations.push("Your energy will be stronger at the start of this period. Front-load important tasks.");
  } else {
    recommendations.push("Your energy remains stable. Maintain consistent effort throughout this period.");
  }
  
  // Peak days recommendation
  const peakDays = significantDates.filter(d => d.type === "peak");
  if (peakDays.length > 0) {
    const dates = peakDays.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(", ");
    recommendations.push(`Peak energy on ${dates}. Reserve these days for your most important work.`);
  }
  
  // Low days recommendation
  const lowDays = significantDates.filter(d => d.type === "low");
  if (lowDays.length > 0) {
    const dates = lowDays.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).join(", ");
    recommendations.push(`Lower energy on ${dates}. Plan lighter activities and self-care.`);
  }
  
  // Lunar recommendations
  const lunarEvents = significantDates.filter(d => d.type === "lunar");
  if (lunarEvents.length > 0) {
    lunarEvents.forEach(event => {
      recommendations.push(`${event.title} on ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${event.description}`);
    });
  }
  
  // General advice
  const avgScore = forecastDays.reduce((sum, day) => sum + getRatingScore(day.dailyEnergy.connection.alignment), 0) / forecastDays.length;
  if (avgScore >= 2.5) {
    recommendations.push("Overall, this is a strong period. Take advantage of the favorable conditions.");
  } else if (avgScore < 2) {
    recommendations.push("This period requires patience. Focus on preparation and building foundations.");
  }
  
  return recommendations;
}

/**
 * Get activity recommendations for a specific future date
 */
export function getActivityRecommendationsForDate(
  profile: UserProfile,
  targetDate: Date
): {
  bestActivities: string[];
  avoidActivities: string[];
  timing: string;
} {
  const dailyEnergy = calculateDailyEnergy(profile, targetDate);
  const rating = getRatingFromAlignment(dailyEnergy.connection.alignment);
  
  let bestActivities: string[] = [];
  let avoidActivities: string[] = [];
  let timing: string = "";
  
  switch (rating) {
    case "excellent":
      bestActivities = [
        "Product launches",
        "Major presentations",
        "Contract signings",
        "Important negotiations",
        "Strategic planning sessions",
        "Networking events",
      ];
      avoidActivities = ["Routine administrative work"];
      timing = "All day is favorable. Peak energy in the morning and early afternoon.";
      break;
      
    case "good":
      bestActivities = [
        "Team meetings",
        "Project kickoffs",
        "Creative brainstorming",
        "Client calls",
        "Problem-solving sessions",
      ];
      avoidActivities = ["High-risk decisions without consultation"];
      timing = "Morning and afternoon are best. Energy may dip in late evening.";
      break;
      
    case "moderate":
      bestActivities = [
        "Routine tasks",
        "Email and admin work",
        "Research and analysis",
        "Planning and preparation",
        "One-on-one check-ins",
      ];
      avoidActivities = [
        "Major launches",
        "High-stakes negotiations",
        "Important presentations",
      ];
      timing = "Steady energy throughout the day. Avoid pushing too hard.";
      break;
      
    case "challenging":
      bestActivities = [
        "Rest and recovery",
        "Reflection and journaling",
        "Learning and skill development",
        "Organizing and tidying",
        "Light exercise",
      ];
      avoidActivities = [
        "Major decisions",
        "Important meetings",
        "Launching new initiatives",
        "Confrontational conversations",
      ];
      timing = "Low energy day. Focus on self-care and gentle activities.";
      break;
  }
  
  return {
    bestActivities,
    avoidActivities,
    timing,
  };
}

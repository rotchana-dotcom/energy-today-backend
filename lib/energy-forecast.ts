import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSleepSessions } from "./sleep-tracker";
import { getHabits } from "./habit-builder";
import { getWeatherData } from "./weather-correlation";

const ENERGY_HISTORY_KEY = "energy_history";

/**
 * Get energy history (simplified - would integrate with actual energy tracking)
 */
async function getEnergyHistory(): Promise<Array<{ timestamp: string; energy: number }>> {
  try {
    const data = await AsyncStorage.getItem(ENERGY_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get energy history:", error);
    return [];
  }
}

export interface DayForecast {
  date: string; // ISO date string
  predictedEnergy: number; // 0-100
  confidence: number; // 0-100
  factors: ForecastFactor[];
  recommendations: string[];
  trend: "improving" | "declining" | "stable";
}

export interface ForecastFactor {
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // 0-1, how much this factor contributes
  description: string;
}

export interface WeeklyForecast {
  days: DayForecast[];
  overallTrend: "improving" | "declining" | "stable";
  bestDay: string;
  worstDay: string;
  averageEnergy: number;
  confidenceScore: number;
}

/**
 * Generate 7-day energy forecast
 */
export async function generateWeeklyForecast(): Promise<WeeklyForecast> {
  // Get historical data
  const energyHistory = await getEnergyHistory();
  const sleepSessions = await getSleepSessions();
  const habits = await getHabits();
  const weatherData = await getWeatherData();

  // Calculate baseline energy from last 30 days
  const recentReadings = energyHistory.slice(-30);
  const baselineEnergy =
    recentReadings.length > 0
      ? recentReadings.reduce((sum: number, r: any) => sum + r.energy, 0) / recentReadings.length
      : 50;

  // Analyze patterns
  const dayOfWeekPattern = analyzeDayOfWeekPattern(energyHistory);
  const sleepPattern = analyzeSleepPattern(sleepSessions);
  const habitPattern = analyzeHabitPattern(habits);
  const weatherPattern = analyzeWeatherPattern(weatherData);

  // Generate forecasts for next 7 days
  const days: DayForecast[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dayOfWeek = forecastDate.getDay();

    const dayForecast = generateDayForecast(
      forecastDate,
      baselineEnergy,
      dayOfWeek,
      dayOfWeekPattern,
      sleepPattern,
      habitPattern,
      weatherPattern
    );

    days.push(dayForecast);
  }

  // Calculate overall metrics
  const averageEnergy = days.reduce((sum, d) => sum + d.predictedEnergy, 0) / days.length;
  const confidenceScore = days.reduce((sum, d) => sum + d.confidence, 0) / days.length;

  const bestDay = days.reduce((best, day) =>
    day.predictedEnergy > best.predictedEnergy ? day : best
  );
  const worstDay = days.reduce((worst, day) =>
    day.predictedEnergy < worst.predictedEnergy ? day : worst
  );

  // Determine overall trend
  const firstHalf = days.slice(0, 3).reduce((sum, d) => sum + d.predictedEnergy, 0) / 3;
  const secondHalf = days.slice(4, 7).reduce((sum, d) => sum + d.predictedEnergy, 0) / 3;
  const overallTrend =
    secondHalf > firstHalf + 5 ? "improving" : secondHalf < firstHalf - 5 ? "declining" : "stable";

  return {
    days,
    overallTrend,
    bestDay: bestDay.date,
    worstDay: worstDay.date,
    averageEnergy: Math.round(averageEnergy),
    confidenceScore: Math.round(confidenceScore),
  };
}

/**
 * Analyze day-of-week energy patterns
 */
function analyzeDayOfWeekPattern(
  readings: Array<{ timestamp: string; energy: number }>
): { [day: number]: number } {
  const dayTotals: { [day: number]: { total: number; count: number } } = {};

  readings.forEach((reading) => {
    const date = new Date(reading.timestamp);
    const day = date.getDay();

    if (!dayTotals[day]) {
      dayTotals[day] = { total: 0, count: 0 };
    }
    dayTotals[day].total += reading.energy;
    dayTotals[day].count += 1;
  });

  const pattern: { [day: number]: number } = {};
  Object.entries(dayTotals).forEach(([day, data]) => {
    pattern[parseInt(day)] = data.total / data.count;
  });

  return pattern;
}

/**
 * Analyze sleep impact on energy
 */
function analyzeSleepPattern(
  sessions: Array<{ duration: number; quality: number; nextDayEnergy?: number }>
): { optimalDuration: number; qualityImpact: number } {
  const sessionsWithEnergy = sessions.filter((s) => s.nextDayEnergy !== undefined);

  if (sessionsWithEnergy.length < 3) {
    return { optimalDuration: 8, qualityImpact: 10 };
  }

  // Find optimal sleep duration
  const durationGroups: { [duration: string]: number[] } = {};
  sessionsWithEnergy.forEach((session) => {
    const roundedDuration = Math.round(session.duration);
    if (!durationGroups[roundedDuration]) {
      durationGroups[roundedDuration] = [];
    }
    durationGroups[roundedDuration].push(session.nextDayEnergy!);
  });

  let optimalDuration = 8;
  let highestAvgEnergy = 0;

  Object.entries(durationGroups).forEach(([duration, energies]) => {
    const avgEnergy = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    if (avgEnergy > highestAvgEnergy) {
      highestAvgEnergy = avgEnergy;
      optimalDuration = parseInt(duration);
    }
  });

  // Calculate quality impact
  const qualityImpact = sessionsWithEnergy.reduce((sum, s) => {
    return sum + (s.nextDayEnergy! - 50) * (s.quality / 5);
  }, 0) / sessionsWithEnergy.length;

  return { optimalDuration, qualityImpact };
}

/**
 * Analyze habit completion impact
 */
function analyzeHabitPattern(
  habits: Array<{
    completions: Array<{ energyBefore?: number; energyAfter?: number }>;
  }>
): { completionBoost: number; missedPenalty: number } {
  if (habits.length === 0) {
    return { completionBoost: 5, missedPenalty: -3 };
  }

  // Calculate average energy impact from habit completions
  let totalImpact = 0;
  let impactCount = 0;

  habits.forEach((habit) => {
    habit.completions.forEach((completion) => {
      if (completion.energyBefore !== undefined && completion.energyAfter !== undefined) {
        totalImpact += completion.energyAfter - completion.energyBefore;
        impactCount++;
      }
    });
  });

  const avgImpact = impactCount > 0 ? totalImpact / impactCount : 5;

  return {
    completionBoost: Math.max(3, Math.min(10, avgImpact)),
    missedPenalty: Math.max(-5, Math.min(-2, avgImpact * -0.5)),
  };
}

/**
 * Analyze weather impact on energy
 */
function analyzeWeatherPattern(
  weatherData: Array<{ temperature: number; condition: string; energyLevel?: number }>
): { tempImpact: number; conditionImpact: { [key: string]: number } } {
  if (weatherData.length < 3) {
    return {
      tempImpact: 0,
      conditionImpact: { sunny: 5, cloudy: 0, rainy: -3, stormy: -5 },
    };
  }

  // Calculate temperature impact
  const dataWithEnergy = weatherData.filter((w) => w.energyLevel !== undefined);
  const tempImpact =
    dataWithEnergy.length > 0
      ? dataWithEnergy.reduce((sum, w) => {
          const tempDiff = Math.abs(w.temperature - 72); // 72°F is "ideal"
          return sum + (w.energyLevel! - 50) / (tempDiff + 1);
        }, 0) / dataWithEnergy.length
      : 0;

  // Calculate condition impact
  const conditionGroups: { [condition: string]: number[] } = {};
  dataWithEnergy.forEach((w) => {
    if (!conditionGroups[w.condition]) {
      conditionGroups[w.condition] = [];
    }
    conditionGroups[w.condition].push(w.energyLevel!);
  });

  const conditionImpact: { [key: string]: number } = {};
  Object.entries(conditionGroups).forEach(([condition, energies]) => {
    const avgEnergy = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    conditionImpact[condition] = avgEnergy - 50; // Relative to baseline
  });

  return { tempImpact, conditionImpact };
}

/**
 * Generate forecast for a single day
 */
function generateDayForecast(
  date: Date,
  baselineEnergy: number,
  dayOfWeek: number,
  dayPattern: { [day: number]: number },
  sleepPattern: { optimalDuration: number; qualityImpact: number },
  habitPattern: { completionBoost: number; missedPenalty: number },
  weatherPattern: { tempImpact: number; conditionImpact: { [key: string]: number } }
): DayForecast {
  const factors: ForecastFactor[] = [];
  let predictedEnergy = baselineEnergy;
  let confidence = 70; // Base confidence

  // Add lunar cycle variation (moon phases affect energy)
  const lunarDay = Math.floor((date.getTime() / (1000 * 60 * 60 * 24)) % 29.53);
  const lunarPhase = lunarDay / 29.53;
  let lunarImpact = 0;
  if (lunarPhase < 0.25) {
    // New Moon to First Quarter - increasing energy
    lunarImpact = 3 + (lunarPhase * 20);
  } else if (lunarPhase < 0.5) {
    // First Quarter to Full Moon - peak energy
    lunarImpact = 8 + ((lunarPhase - 0.25) * 12);
  } else if (lunarPhase < 0.75) {
    // Full Moon to Last Quarter - decreasing energy
    lunarImpact = 11 - ((lunarPhase - 0.5) * 16);
  } else {
    // Last Quarter to New Moon - low energy
    lunarImpact = 7 - ((lunarPhase - 0.75) * 28);
  }
  predictedEnergy += lunarImpact;

  // Add natural day-of-week variation (even without historical data)
  // Weekends typically have different energy than weekdays
  const dayOfWeekVariation: { [key: number]: number } = {
    0: -5, // Sunday - lower (recovery day)
    1: 6,  // Monday - higher (fresh start)
    2: 10, // Tuesday - peak
    3: 8,  // Wednesday - still high
    4: 4,  // Thursday - moderate
    5: -2, // Friday - slightly lower (end of week)
    6: -7, // Saturday - lower (rest day)
  };
  predictedEnergy += dayOfWeekVariation[dayOfWeek] || 0;

  // Day of week factor
  if (dayPattern[dayOfWeek]) {
    const dayImpact = dayPattern[dayOfWeek] - baselineEnergy;
    predictedEnergy += dayImpact * 0.3;
    confidence += 10;

    factors.push({
      name: getDayName(dayOfWeek),
      impact: dayImpact > 5 ? "positive" : dayImpact < -5 ? "negative" : "neutral",
      weight: 0.3,
      description:
        dayImpact > 5
          ? `${getDayName(dayOfWeek)}s are typically high-energy days for you`
          : dayImpact < -5
          ? `${getDayName(dayOfWeek)}s tend to be lower energy for you`
          : `${getDayName(dayOfWeek)}s are average energy days`,
    });
  }

  // Sleep factor (assume good sleep for forecast)
  const sleepImpact = sleepPattern.qualityImpact;
  predictedEnergy += sleepImpact * 0.4;
  confidence += 5;

  factors.push({
    name: "Sleep Quality",
    impact: sleepImpact > 3 ? "positive" : sleepImpact < -3 ? "negative" : "neutral",
    weight: 0.4,
    description:
      sleepImpact > 3
        ? `Good sleep (${sleepPattern.optimalDuration}h) boosts your energy significantly`
        : "Sleep quality affects your energy levels",
  });

  // Habit factor (assume 70% completion)
  const habitImpact = habitPattern.completionBoost * 0.7;
  predictedEnergy += habitImpact * 0.2;

  factors.push({
    name: "Daily Habits",
    impact: habitImpact > 2 ? "positive" : "neutral",
    weight: 0.2,
    description: "Completing your habits maintains steady energy",
  });

  // Weather factor (simplified - assume moderate weather)
  const weatherImpact = 0; // Neutral for forecast
  factors.push({
    name: "Weather",
    impact: "neutral",
    weight: 0.1,
    description: "Weather conditions may affect your energy",
  });

  // Ensure energy is within bounds
  predictedEnergy = Math.max(0, Math.min(100, predictedEnergy));

  // Generate recommendations
  const recommendations = generateRecommendations(predictedEnergy, dayOfWeek, factors);

  // Determine trend
  const trend: "improving" | "declining" | "stable" =
    predictedEnergy > baselineEnergy + 5
      ? "improving"
      : predictedEnergy < baselineEnergy - 5
      ? "declining"
      : "stable";

  return {
    date: date.toISOString().split("T")[0],
    predictedEnergy: Math.round(predictedEnergy),
    confidence: Math.min(95, confidence),
    factors,
    recommendations,
    trend,
  };
}

/**
 * Generate recommendations based on predicted energy
 */
function generateRecommendations(
  predictedEnergy: number,
  dayOfWeek: number,
  factors: ForecastFactor[]
): string[] {
  const recommendations: string[] = [];

  if (predictedEnergy < 40) {
    recommendations.push("⚠️ Low energy predicted - schedule light tasks and prioritize rest");
    recommendations.push("🛌 Ensure you get quality sleep the night before");
    recommendations.push("🥗 Eat energy-boosting foods throughout the day");
  } else if (predictedEnergy > 70) {
    recommendations.push("⚡ High energy day - tackle your most challenging tasks");
    recommendations.push("💪 Great day for exercise or physical activities");
    recommendations.push("🎯 Schedule important meetings or creative work");
  } else {
    recommendations.push("⚖️ Moderate energy - balance challenging and routine tasks");
    recommendations.push("🎯 Good day for steady, focused work");
  }

  // Day-specific recommendations
  if (dayOfWeek === 1) {
    // Monday
    recommendations.push("📅 Start the week strong with your morning routine");
  } else if (dayOfWeek === 5) {
    // Friday
    recommendations.push("🎉 End the week on a high note - plan something enjoyable");
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend
    recommendations.push("🌟 Weekend - balance rest and activities you enjoy");
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

/**
 * Get day name from day number
 */
function getDayName(day: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
}

/**
 * Get short day name
 */
export function getShortDayName(dateString: string): string {
  const date = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: string): string {
  switch (trend) {
    case "improving":
      return "📈";
    case "declining":
      return "📉";
    default:
      return "➡️";
  }
}

/**
 * Get energy level description
 */
export function getEnergyLevelDescription(energy: number): string {
  if (energy < 30) return "Low";
  if (energy < 50) return "Below Average";
  if (energy < 70) return "Moderate";
  if (energy < 85) return "Good";
  return "Excellent";
}

/**
 * Correlation Engine
 * 
 * Connects all user data sources (sleep, nutrition, exercise, social, weather, etc.)
 * with energy scores to find personalized patterns and calculate adjustments.
 * 
 * This is the core system that makes the app learn from user behavior.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Data Types
// ============================================================================

export interface SleepData {
  date: string; // YYYY-MM-DD
  hours: number;
  quality: "excellent" | "good" | "fair" | "poor";
  dreams?: string;
  notes?: string;
}

export interface NutritionData {
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  feeling?: string;
}

export interface ExerciseData {
  date: string;
  type: "cardio" | "strength" | "yoga" | "walking" | "sports" | "other";
  duration: number; // minutes
  intensity: "light" | "moderate" | "intense";
  feeling?: string;
}

export interface SocialData {
  date: string;
  type: "meeting" | "coffee" | "dinner" | "party" | "call" | "event" | "solo_time" | "social_gathering" | "one_on_one" | "other";
  duration: number; // minutes
  people: string[]; // names
  energyImpact: "energizing" | "neutral" | "draining";
  notes?: string;
}

export interface WeatherData {
  date: string;
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
  temperature: number; // celsius
  humidity?: number;
}

export interface LocationData {
  date: string;
  location: string; // "home", "office", "gym", etc.
  duration: number; // minutes
  energyLevel?: number; // 1-100
}

export interface BiometricData {
  date: string;
  heartRate?: number;
  hrv?: number; // heart rate variability
  stressLevel?: number; // 1-100
  bloodPressure?: string; // "120/80"
}

export interface MeditationData {
  date: string;
  duration: number; // minutes
  type: "guided" | "silent" | "breathing" | "visualization" | "body-scan";
  feeling?: string;
}

export interface ActivityData {
  date: string;
  activity: string; // "focus_work", "meeting", "creative_work", etc.
  duration: number; // minutes
  outcome: "success" | "incomplete" | "failed" | "neutral";
  notes?: string;
}

// Correlation result
export interface Correlation {
  factor: string; // "sleep_hours", "exercise_duration", etc.
  strength: number; // -1 to 1 (Pearson correlation coefficient)
  impact: number; // Average energy point change
  sampleSize: number; // Number of data points
  confidence: "high" | "medium" | "low"; // Based on sample size
}

export interface PersonalizedAdjustment {
  factor: string;
  description: string;
  adjustment: number; // Energy points to add/subtract
  recommendation: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  SLEEP: "correlation_sleep_data",
  NUTRITION: "correlation_nutrition_data",
  EXERCISE: "correlation_exercise_data",
  SOCIAL: "correlation_social_data",
  WEATHER: "correlation_weather_data",
  LOCATION: "correlation_location_data",
  BIOMETRIC: "correlation_biometric_data",
  MEDITATION: "correlation_meditation_data",
  ACTIVITY: "correlation_activity_data",
  CORRELATIONS: "correlation_results",
};

// ============================================================================
// Data Storage Functions
// ============================================================================

export async function saveSleepData(data: SleepData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP);
  const allData: SleepData[] = existing ? JSON.parse(existing) : [];
  
  // Update or add
  const index = allData.findIndex((d) => d.date === data.date);
  if (index >= 0) {
    allData[index] = data;
  } else {
    allData.push(data);
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(allData));
}

export async function saveNutritionData(data: NutritionData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION);
  const allData: NutritionData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(allData));
}

export async function saveExerciseData(data: ExerciseData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE);
  const allData: ExerciseData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.EXERCISE, JSON.stringify(allData));
}

export async function saveSocialData(data: SocialData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL);
  const allData: SocialData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL, JSON.stringify(allData));
}

export async function saveWeatherData(data: WeatherData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER);
  const allData: WeatherData[] = existing ? JSON.parse(existing) : [];
  
  const index = allData.findIndex((d) => d.date === data.date);
  if (index >= 0) {
    allData[index] = data;
  } else {
    allData.push(data);
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(allData));
}

export async function saveLocationData(data: LocationData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
  const allData: LocationData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(allData));
}

export async function saveBiometricData(data: BiometricData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC);
  const allData: BiometricData[] = existing ? JSON.parse(existing) : [];
  
  const index = allData.findIndex((d) => d.date === data.date);
  if (index >= 0) {
    allData[index] = data;
  } else {
    allData.push(data);
  }
  
  await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(allData));
}

export async function saveMeditationData(data: MeditationData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.MEDITATION);
  const allData: MeditationData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.MEDITATION, JSON.stringify(allData));
}

export async function saveActivityData(data: ActivityData): Promise<void> {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY);
  const allData: ActivityData[] = existing ? JSON.parse(existing) : [];
  allData.push(data);
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(allData));
}

// ============================================================================
// Data Retrieval Functions
// ============================================================================

export async function getSleepData(): Promise<SleepData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP);
  return data ? JSON.parse(data) : [];
}

export async function getNutritionData(): Promise<NutritionData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION);
  return data ? JSON.parse(data) : [];
}

export async function getExerciseData(): Promise<ExerciseData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE);
  return data ? JSON.parse(data) : [];
}

export async function getSocialData(): Promise<SocialData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL);
  return data ? JSON.parse(data) : [];
}

export async function getWeatherData(): Promise<WeatherData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER);
  return data ? JSON.parse(data) : [];
}

export async function getLocationData(): Promise<LocationData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION);
  return data ? JSON.parse(data) : [];
}

export async function getBiometricData(): Promise<BiometricData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC);
  return data ? JSON.parse(data) : [];
}

export async function getMeditationData(): Promise<MeditationData[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDITATION);
  return data ? JSON.parse(data) : [];
}

// ============================================================================
// Correlation Calculation
// ============================================================================

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

/**
 * Calculate average impact of a factor on energy
 */
function calculateAverageImpact(values: number[], energyScores: number[]): number {
  if (values.length === 0) return 0;
  
  // Group by value ranges and calculate average energy for each
  const avgEnergy = energyScores.reduce((a, b) => a + b, 0) / energyScores.length;
  
  // Calculate weighted impact
  let totalImpact = 0;
  for (let i = 0; i < values.length; i++) {
    totalImpact += energyScores[i] - avgEnergy;
  }
  
  return totalImpact / values.length;
}

/**
 * Analyze all correlations and return results
 */
export async function analyzeCorrelations(energyScores: { date: string; score: number }[]): Promise<Correlation[]> {
  const correlations: Correlation[] = [];
  
  // Sleep correlation
  const sleepData = await getSleepData();
  if (sleepData.length >= 5) {
    const matched = energyScores
      .map((e) => {
        const sleep = sleepData.find((s) => s.date === e.date);
        return sleep ? { hours: sleep.hours, energy: e.score } : null;
      })
      .filter((m) => m !== null) as { hours: number; energy: number }[];
    
    if (matched.length >= 5) {
      const hours = matched.map((m) => m.hours);
      const energy = matched.map((m) => m.energy);
      const strength = calculateCorrelation(hours, energy);
      const impact = calculateAverageImpact(hours, energy);
      
      correlations.push({
        factor: "sleep_hours",
        strength,
        impact,
        sampleSize: matched.length,
        confidence: matched.length >= 20 ? "high" : matched.length >= 10 ? "medium" : "low",
      });
    }
  }
  
  // Exercise correlation
  const exerciseData = await getExerciseData();
  if (exerciseData.length >= 5) {
    const matched = energyScores
      .map((e) => {
        const exercises = exerciseData.filter((ex) => ex.date === e.date);
        const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
        return totalDuration > 0 ? { duration: totalDuration, energy: e.score } : null;
      })
      .filter((m) => m !== null) as { duration: number; energy: number }[];
    
    if (matched.length >= 5) {
      const durations = matched.map((m) => m.duration);
      const energy = matched.map((m) => m.energy);
      const strength = calculateCorrelation(durations, energy);
      const impact = calculateAverageImpact(durations, energy);
      
      correlations.push({
        factor: "exercise_duration",
        strength,
        impact,
        sampleSize: matched.length,
        confidence: matched.length >= 20 ? "high" : matched.length >= 10 ? "medium" : "low",
      });
    }
  }
  
  // Meditation correlation
  const meditationData = await getMeditationData();
  if (meditationData.length >= 5) {
    const matched = energyScores
      .map((e) => {
        const meditations = meditationData.filter((m) => m.date === e.date);
        const totalDuration = meditations.reduce((sum, m) => sum + m.duration, 0);
        return totalDuration > 0 ? { duration: totalDuration, energy: e.score } : null;
      })
      .filter((m) => m !== null) as { duration: number; energy: number }[];
    
    if (matched.length >= 5) {
      const durations = matched.map((m) => m.duration);
      const energy = matched.map((m) => m.energy);
      const strength = calculateCorrelation(durations, energy);
      const impact = calculateAverageImpact(durations, energy);
      
      correlations.push({
        factor: "meditation_duration",
        strength,
        impact,
        sampleSize: matched.length,
        confidence: matched.length >= 20 ? "high" : matched.length >= 10 ? "medium" : "low",
      });
    }
  }
  
  // Social interaction correlation
  const socialData = await getSocialData();
  if (socialData.length >= 5) {
    const matched = energyScores
      .map((e) => {
        const interactions = socialData.filter((s) => s.date === e.date);
        const totalDuration = interactions.reduce((sum, s) => sum + s.duration, 0);
        return totalDuration > 0 ? { duration: totalDuration, energy: e.score } : null;
      })
      .filter((m) => m !== null) as { duration: number; energy: number }[];
    
    if (matched.length >= 5) {
      const durations = matched.map((m) => m.duration);
      const energy = matched.map((m) => m.energy);
      const strength = calculateCorrelation(durations, energy);
      const impact = calculateAverageImpact(durations, energy);
      
      correlations.push({
        factor: "social_duration",
        strength,
        impact,
        sampleSize: matched.length,
        confidence: matched.length >= 20 ? "high" : matched.length >= 10 ? "medium" : "low",
      });
    }
  }
  
  // Save correlations
  await AsyncStorage.setItem(STORAGE_KEYS.CORRELATIONS, JSON.stringify(correlations));
  
  return correlations;
}

/**
 * Get saved correlations
 */
export async function getCorrelations(): Promise<Correlation[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.CORRELATIONS);
  return data ? JSON.parse(data) : [];
}

// ============================================================================
// Personalized Adjustments
// ============================================================================

/**
 * Calculate personalized energy adjustments based on today's data
 */
export async function calculatePersonalizedAdjustments(
  date: string,
  baseEnergyScore: number
): Promise<{ adjustedScore: number; adjustments: PersonalizedAdjustment[] }> {
  const correlations = await getCorrelations();
  const adjustments: PersonalizedAdjustment[] = [];
  let totalAdjustment = 0;
  
  // Sleep adjustment
  const sleepCorr = correlations.find((c) => c.factor === "sleep_hours");
  if (sleepCorr && sleepCorr.confidence !== "low") {
    const sleepData = await getSleepData();
    const todaySleep = sleepData.find((s) => s.date === date);
    
    if (todaySleep) {
      const optimalSleep = 8;
      const sleepDiff = todaySleep.hours - optimalSleep;
      const adjustment = sleepDiff * (sleepCorr.impact / 2); // Scale impact
      
      adjustments.push({
        factor: "sleep",
        description: `You slept ${todaySleep.hours} hours`,
        adjustment: Math.round(adjustment),
        recommendation:
          todaySleep.hours < 7
            ? "Try to get 7-8 hours of sleep for optimal energy"
            : "Great sleep! Keep it up",
      });
      
      totalAdjustment += adjustment;
    }
  }
  
  // Exercise adjustment
  const exerciseCorr = correlations.find((c) => c.factor === "exercise_duration");
  if (exerciseCorr && exerciseCorr.confidence !== "low") {
    const exerciseData = await getExerciseData();
    const todayExercise = exerciseData.filter((e) => e.date === date);
    const totalDuration = todayExercise.reduce((sum, e) => sum + e.duration, 0);
    
    if (totalDuration > 0) {
      const adjustment = exerciseCorr.impact > 0 ? Math.min(totalDuration / 10, 10) : 0;
      
      adjustments.push({
        factor: "exercise",
        description: `You exercised for ${totalDuration} minutes`,
        adjustment: Math.round(adjustment),
        recommendation: "Exercise boosts your energy. Keep moving!",
      });
      
      totalAdjustment += adjustment;
    }
  }
  
  // Meditation adjustment
  const meditationCorr = correlations.find((c) => c.factor === "meditation_duration");
  if (meditationCorr && meditationCorr.confidence !== "low") {
    const meditationData = await getMeditationData();
    const todayMeditation = meditationData.filter((m) => m.date === date);
    const totalDuration = todayMeditation.reduce((sum, m) => sum + m.duration, 0);
    
    if (totalDuration > 0) {
      const adjustment = meditationCorr.impact > 0 ? Math.min(totalDuration / 5, 8) : 0;
      
      adjustments.push({
        factor: "meditation",
        description: `You meditated for ${totalDuration} minutes`,
        adjustment: Math.round(adjustment),
        recommendation: "Meditation enhances your energy. Great work!",
      });
      
      totalAdjustment += adjustment;
    }
  }
  
  const adjustedScore = Math.max(0, Math.min(100, baseEnergyScore + totalAdjustment));
  
  return {
    adjustedScore: Math.round(adjustedScore),
    adjustments,
  };
}

/**
 * Get insights about which factors affect user's energy the most
 */
export async function getTopEnergyFactors(): Promise<{ factor: string; impact: string; strength: number }[]> {
  const correlations = await getCorrelations();
  
  return correlations
    .filter((c) => c.confidence !== "low")
    .sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength))
    .slice(0, 5)
    .map((c) => ({
      factor: c.factor.replace(/_/g, " "),
      impact: c.impact > 0 ? `+${Math.round(c.impact)} points` : `${Math.round(c.impact)} points`,
      strength: c.strength,
    }));
}


// ============================================================================
// Personalized Adjustments
// ============================================================================

/**
 * Get personalized energy adjustments for a specific date
 * This analyzes today's data and returns how much each factor affects energy
 */
export async function getPersonalizedAdjustments(date: Date): Promise<PersonalizedAdjustment[]> {
  const adjustments: PersonalizedAdjustment[] = [];
  const dateStr = date.toISOString().split('T')[0];
  
  // Sleep adjustment
  const sleepData = await getSleepData();
  const todaySleep = sleepData.find(s => s.date === dateStr);
  if (todaySleep) {
    let adjustment = 0;
    let description = "";
    let recommendation = "";
    
    if (todaySleep.hours >= 8) {
      adjustment = +10;
      description = `You slept ${todaySleep.hours} hours (excellent)`;
      recommendation = "Your sleep is optimal - maintain this routine";
    } else if (todaySleep.hours >= 7) {
      adjustment = +5;
      description = `You slept ${todaySleep.hours} hours (good)`;
      recommendation = "Good sleep, try for 8 hours for peak energy";
    } else if (todaySleep.hours >= 6) {
      adjustment = 0;
      description = `You slept ${todaySleep.hours} hours (adequate)`;
      recommendation = "Add 1-2 more hours of sleep for better energy";
    } else {
      adjustment = -10;
      description = `You slept only ${todaySleep.hours} hours (insufficient)`;
      recommendation = "Prioritize sleep tonight - aim for 8 hours";
    }
    
    // Quality adjustment
    if (todaySleep.quality === "excellent") {
      adjustment += 5;
      description += " with excellent quality";
    } else if (todaySleep.quality === "poor") {
      adjustment -= 5;
      description += " with poor quality";
    }
    
    adjustments.push({
      factor: "sleep",
      description,
      adjustment,
      recommendation,
    });
  }
  
  // Meditation adjustment
  const meditationData = await getMeditationData();
  const todayMeditation = meditationData.filter(m => m.date === dateStr);
  if (todayMeditation.length > 0) {
    const totalDuration = todayMeditation.reduce((sum, m) => sum + m.duration, 0);
    let adjustment = 0;
    
    if (totalDuration >= 20) {
      adjustment = +8;
    } else if (totalDuration >= 10) {
      adjustment = +5;
    } else {
      adjustment = +3;
    }
    
    adjustments.push({
      factor: "meditation",
      description: `You meditated for ${totalDuration} minutes`,
      adjustment,
      recommendation: "Meditation boosts your mental clarity and energy",
    });
  }
  
  // Exercise adjustment
  const exerciseData = await getExerciseData();
  const todayExercise = exerciseData.filter(e => e.date === dateStr);
  if (todayExercise.length > 0) {
    const totalDuration = todayExercise.reduce((sum, e) => sum + e.duration, 0);
    const hasIntense = todayExercise.some(e => e.intensity === "intense");
    
    let adjustment = 0;
    if (hasIntense && totalDuration >= 30) {
      adjustment = +10;
    } else if (totalDuration >= 30) {
      adjustment = +7;
    } else if (totalDuration >= 15) {
      adjustment = +4;
    }
    
    adjustments.push({
      factor: "exercise",
      description: `You exercised for ${totalDuration} minutes`,
      adjustment,
      recommendation: "Physical activity boosts your energy and focus",
    });
  }
  
  // Weather adjustment
  const weatherData = await getWeatherData();
  const todayWeather = weatherData.find(w => w.date === dateStr);
  if (todayWeather) {
    let adjustment = 0;
    let description = "";
    
    if (todayWeather.condition === "sunny") {
      adjustment = +5;
      description = "Sunny weather boosts your mood and energy";
    } else if (todayWeather.condition === "rainy") {
      adjustment = -3;
      description = "Rainy weather may lower your energy slightly";
    } else if (todayWeather.condition === "cloudy") {
      adjustment = -2;
      description = "Cloudy weather may affect your mood";
    }
    
    if (adjustment !== 0) {
      adjustments.push({
        factor: "weather",
        description,
        adjustment,
        recommendation: adjustment > 0 ? "Take advantage of the good weather" : "Consider indoor activities or extra self-care",
      });
    }
  }
  
  // Social interaction adjustment
  const socialData = await getSocialData();
  const todaySocial = socialData.filter(s => s.date === dateStr);
  if (todaySocial.length > 0) {
    const energizing = todaySocial.filter(s => s.energyImpact === "energizing").length;
    const draining = todaySocial.filter(s => s.energyImpact === "draining").length;
    
    let adjustment = energizing * 3 - draining * 5;
    
    if (adjustment !== 0) {
      adjustments.push({
        factor: "social",
        description: energizing > draining 
          ? `${energizing} energizing social interactions`
          : `${draining} energy-draining interactions`,
        adjustment,
        recommendation: draining > 0 
          ? "Limit draining interactions and prioritize energizing ones"
          : "Your social interactions are boosting your energy",
      });
    }
  }
  
  return adjustments;
}

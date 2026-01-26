import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PredictionRating {
  id: string;
  predictionText: string;
  predictionType: "energy" | "timing" | "task" | "general";
  rating: "accurate" | "inaccurate";
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO timestamp
  confidence?: number; // Original AI confidence score
}

const STORAGE_KEY = "@energy_today_prediction_ratings";

/**
 * Rate a prediction as accurate or inaccurate
 */
export async function ratePrediction(
  predictionText: string,
  rating: "accurate" | "inaccurate",
  predictionType: "energy" | "timing" | "task" | "general" = "general",
  confidence?: number
): Promise<void> {
  const ratings = await getPredictionRatings();
  
  const newRating: PredictionRating = {
    id: Date.now().toString(),
    predictionText,
    predictionType,
    rating,
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
    confidence,
  };
  
  ratings.push(newRating);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
}

/**
 * Get all prediction ratings
 */
export async function getPredictionRatings(): Promise<PredictionRating[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Calculate overall accuracy percentage
 */
export async function getAccuracyScore(): Promise<number> {
  const ratings = await getPredictionRatings();
  if (ratings.length === 0) return 0;
  
  const accurate = ratings.filter((r) => r.rating === "accurate").length;
  return Math.round((accurate / ratings.length) * 100);
}

/**
 * Get accuracy by prediction type
 */
export async function getAccuracyByType(type: PredictionRating["predictionType"]): Promise<number> {
  const ratings = await getPredictionRatings();
  const typeRatings = ratings.filter((r) => r.predictionType === type);
  
  if (typeRatings.length === 0) return 0;
  
  const accurate = typeRatings.filter((r) => r.rating === "accurate").length;
  return Math.round((accurate / typeRatings.length) * 100);
}

/**
 * Get recent prediction ratings (last N days)
 */
export async function getRecentRatings(days: number = 30): Promise<PredictionRating[]> {
  const ratings = await getPredictionRatings();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return ratings.filter((r) => new Date(r.timestamp) >= cutoffDate);
}

/**
 * Get accuracy stats summary
 */
export async function getAccuracyStats(): Promise<{
  overall: number;
  total: number;
  accurate: number;
  inaccurate: number;
  byType: Record<string, number>;
}> {
  const ratings = await getPredictionRatings();
  const accurate = ratings.filter((r) => r.rating === "accurate").length;
  const inaccurate = ratings.filter((r) => r.rating === "inaccurate").length;
  
  const byType: Record<string, number> = {
    energy: await getAccuracyByType("energy"),
    timing: await getAccuracyByType("timing"),
    task: await getAccuracyByType("task"),
    general: await getAccuracyByType("general"),
  };
  
  return {
    overall: ratings.length > 0 ? Math.round((accurate / ratings.length) * 100) : 0,
    total: ratings.length,
    accurate,
    inaccurate,
    byType,
  };
}

/**
 * Clear all prediction ratings (for testing)
 */
export async function clearPredictionRatings(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

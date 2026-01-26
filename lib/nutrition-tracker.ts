import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveNutritionData, type NutritionData } from "@/app/services/correlation-engine";

export interface MealEntry {
  id: string;
  date: string; // ISO date string
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodItems: string[];
  macros: {
    protein: number; // grams
    carbs: number; // grams
    fats: number; // grams
    calories: number;
  };
  caffeine: number; // mg
  sugar: number; // grams
  energyBefore?: number; // 0-100
  energyAfter?: number; // 0-100 (measured 1-2 hours after)
  notes?: string;
  createdAt: string;
}

export interface NutritionStats {
  totalMeals: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  totalCaffeine: number;
  totalSugar: number;
  energyImpact: number; // average energy change
  bestMealType: string;
  worstMealType: string;
}

export interface FoodCorrelation {
  foodItem: string;
  occurrences: number;
  averageEnergyImpact: number;
  recommendation: "boost" | "neutral" | "drain";
}

const STORAGE_KEY = "meal_entries";

/**
 * Save a meal entry
 */
export async function saveMealEntry(entry: Omit<MealEntry, "id" | "createdAt">): Promise<void> {
  try {
    const newEntry: MealEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const entries = await getMealEntries();
    entries.push(newEntry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Also save to correlation engine
    const correlationData: NutritionData = {
      date: entry.date,
      mealType: entry.mealType,
      foods: entry.foodItems.join(", "),
      calories: entry.macros.calories,
      protein: entry.macros.protein,
      carbs: entry.macros.carbs,
      fats: entry.macros.fats,
      feeling: entry.notes,
    };
    
    await saveNutritionData(correlationData);
  } catch (error) {
    console.error("Failed to save meal entry:", error);
    throw error;
  }
}

/**
 * Get all meal entries
 */
export async function getMealEntries(): Promise<MealEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get meal entries:", error);
    return [];
  }
}

/**
 * Get recent meal entries
 */
export async function getRecentMealEntries(days: number = 7): Promise<MealEntry[]> {
  const entries = await getMealEntries();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entries
    .filter((entry) => new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Delete a meal entry
 */
export async function deleteMealEntry(entryId: string): Promise<void> {
  try {
    const entries = await getMealEntries();
    const filtered = entries.filter((e) => e.id !== entryId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete meal entry:", error);
    throw error;
  }
}

/**
 * Get nutrition statistics
 */
export async function getNutritionStats(days: number = 30): Promise<NutritionStats> {
  const entries = await getRecentMealEntries(days);

  if (entries.length === 0) {
    return {
      totalMeals: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFats: 0,
      totalCaffeine: 0,
      totalSugar: 0,
      energyImpact: 0,
      bestMealType: "breakfast",
      worstMealType: "dinner",
    };
  }

  const totalCalories = entries.reduce((sum, e) => sum + e.macros.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.macros.protein, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.macros.carbs, 0);
  const totalFats = entries.reduce((sum, e) => sum + e.macros.fats, 0);
  const totalCaffeine = entries.reduce((sum, e) => sum + e.caffeine, 0);
  const totalSugar = entries.reduce((sum, e) => sum + e.sugar, 0);

  // Calculate energy impact
  const entriesWithEnergy = entries.filter(
    (e) => e.energyBefore !== undefined && e.energyAfter !== undefined
  );
  const energyImpact =
    entriesWithEnergy.length > 0
      ? entriesWithEnergy.reduce(
          (sum, e) => sum + (e.energyAfter! - e.energyBefore!),
          0
        ) / entriesWithEnergy.length
      : 0;

  // Find best and worst meal types
  const mealTypeImpact: { [key: string]: { total: number; count: number } } = {};
  entriesWithEnergy.forEach((entry) => {
    if (!mealTypeImpact[entry.mealType]) {
      mealTypeImpact[entry.mealType] = { total: 0, count: 0 };
    }
    mealTypeImpact[entry.mealType].total += entry.energyAfter! - entry.energyBefore!;
    mealTypeImpact[entry.mealType].count += 1;
  });

  let bestMealType = "breakfast";
  let worstMealType = "dinner";
  let highestImpact = -Infinity;
  let lowestImpact = Infinity;

  Object.entries(mealTypeImpact).forEach(([mealType, data]) => {
    const avgImpact = data.total / data.count;
    if (avgImpact > highestImpact) {
      highestImpact = avgImpact;
      bestMealType = mealType;
    }
    if (avgImpact < lowestImpact) {
      lowestImpact = avgImpact;
      worstMealType = mealType;
    }
  });

  return {
    totalMeals: entries.length,
    averageCalories: Math.round(totalCalories / entries.length),
    averageProtein: Math.round(totalProtein / entries.length),
    averageCarbs: Math.round(totalCarbs / entries.length),
    averageFats: Math.round(totalFats / entries.length),
    totalCaffeine,
    totalSugar,
    energyImpact: Math.round(energyImpact),
    bestMealType,
    worstMealType,
  };
}

/**
 * Analyze food correlations with energy
 */
export async function analyzeFoodCorrelations(): Promise<FoodCorrelation[]> {
  const entries = await getMealEntries();
  const entriesWithEnergy = entries.filter(
    (e) => e.energyBefore !== undefined && e.energyAfter !== undefined
  );

  if (entriesWithEnergy.length < 3) {
    return [];
  }

  // Build food impact map
  const foodImpact: {
    [food: string]: { impacts: number[]; occurrences: number };
  } = {};

  entriesWithEnergy.forEach((entry) => {
    const impact = entry.energyAfter! - entry.energyBefore!;
    entry.foodItems.forEach((food) => {
      const normalized = food.toLowerCase().trim();
      if (!foodImpact[normalized]) {
        foodImpact[normalized] = { impacts: [], occurrences: 0 };
      }
      foodImpact[normalized].impacts.push(impact);
      foodImpact[normalized].occurrences += 1;
    });
  });

  // Calculate correlations
  const correlations: FoodCorrelation[] = [];
  Object.entries(foodImpact).forEach(([food, data]) => {
    if (data.occurrences >= 2) {
      const avgImpact =
        data.impacts.reduce((sum, i) => sum + i, 0) / data.impacts.length;
      
      let recommendation: "boost" | "neutral" | "drain";
      if (avgImpact > 5) {
        recommendation = "boost";
      } else if (avgImpact < -5) {
        recommendation = "drain";
      } else {
        recommendation = "neutral";
      }

      correlations.push({
        foodItem: food,
        occurrences: data.occurrences,
        averageEnergyImpact: Math.round(avgImpact),
        recommendation,
      });
    }
  });

  // Sort by absolute impact
  return correlations.sort(
    (a, b) =>
      Math.abs(b.averageEnergyImpact) - Math.abs(a.averageEnergyImpact)
  );
}

/**
 * Get nutrition insights
 */
export async function getNutritionInsights(): Promise<string[]> {
  const stats = await getNutritionStats(30);
  const correlations = await analyzeFoodCorrelations();
  const insights: string[] = [];

  if (stats.totalMeals === 0) {
    insights.push("Start tracking your meals to discover how food affects your energy");
    return insights;
  }

  // Calorie insights
  if (stats.averageCalories < 1500) {
    insights.push(
      `Your average ${stats.averageCalories} cal/meal may be too low - consider increasing intake`
    );
  } else if (stats.averageCalories > 800) {
    insights.push(
      `Your meals average ${stats.averageCalories} calories - good balance for sustained energy`
    );
  }

  // Protein insights
  if (stats.averageProtein < 15) {
    insights.push(
      `Low protein (${stats.averageProtein}g/meal) - aim for 20-30g per meal for stable energy`
    );
  } else if (stats.averageProtein >= 25) {
    insights.push(`Excellent protein intake at ${stats.averageProtein}g per meal!`);
  }

  // Caffeine insights
  if (stats.totalCaffeine > 400) {
    insights.push(
      `High caffeine intake (${stats.totalCaffeine}mg) may cause energy crashes - consider reducing`
    );
  } else if (stats.totalCaffeine > 200) {
    insights.push(`Moderate caffeine use (${stats.totalCaffeine}mg) - monitor for energy crashes`);
  }

  // Sugar insights
  if (stats.totalSugar > 50) {
    insights.push(
      `High sugar intake (${stats.totalSugar}g) linked to energy crashes - try reducing`
    );
  }

  // Meal type insights
  if (stats.energyImpact > 5) {
    insights.push(`Your ${stats.bestMealType} gives you the best energy boost (+${stats.energyImpact})`);
  } else if (stats.energyImpact < -5) {
    insights.push(
      `Your ${stats.worstMealType} tends to lower energy (${stats.energyImpact}) - review food choices`
    );
  }

  // Food correlation insights
  const topBoosters = correlations.filter((c) => c.recommendation === "boost").slice(0, 2);
  const topDrains = correlations.filter((c) => c.recommendation === "drain").slice(0, 2);

  if (topBoosters.length > 0) {
    const foods = topBoosters.map((c) => c.foodItem).join(", ");
    insights.push(`Energy boosters: ${foods} consistently increase your energy`);
  }

  if (topDrains.length > 0) {
    const foods = topDrains.map((c) => c.foodItem).join(", ");
    insights.push(`Energy drains: ${foods} tend to lower your energy - eat sparingly`);
  }

  return insights;
}

/**
 * Get AI meal timing suggestions based on energy patterns
 */
export async function getMealTimingSuggestions(
  energyHistory: Array<{ hour: number; averageEnergy: number }>
): Promise<{
  breakfast: string;
  lunch: string;
  dinner: string;
  reasoning: string;
}> {
  // Find energy dips (good times to eat)
  const sorted = [...energyHistory].sort((a, b) => a.averageEnergy - b.averageEnergy);

  // Typical meal windows
  const breakfastWindow = energyHistory.filter((h) => h.hour >= 6 && h.hour <= 10);
  const lunchWindow = energyHistory.filter((h) => h.hour >= 11 && h.hour <= 14);
  const dinnerWindow = energyHistory.filter((h) => h.hour >= 17 && h.hour <= 20);

  // Find lowest energy in each window (when you need fuel most)
  const breakfastTime =
    breakfastWindow.length > 0
      ? breakfastWindow.reduce((min, h) => (h.averageEnergy < min.averageEnergy ? h : min))
      : { hour: 7, averageEnergy: 50 };

  const lunchTime =
    lunchWindow.length > 0
      ? lunchWindow.reduce((min, h) => (h.averageEnergy < min.averageEnergy ? h : min))
      : { hour: 12, averageEnergy: 60 };

  const dinnerTime =
    dinnerWindow.length > 0
      ? dinnerWindow.reduce((min, h) => (h.averageEnergy < min.averageEnergy ? h : min))
      : { hour: 18, averageEnergy: 55 };

  return {
    breakfast: `${breakfastTime.hour.toString().padStart(2, "0")}:00`,
    lunch: `${lunchTime.hour.toString().padStart(2, "0")}:00`,
    dinner: `${dinnerTime.hour.toString().padStart(2, "0")}:00`,
    reasoning:
      "Meal times are optimized to fuel you when your energy naturally dips, preventing crashes and maintaining stable energy throughout the day.",
  };
}

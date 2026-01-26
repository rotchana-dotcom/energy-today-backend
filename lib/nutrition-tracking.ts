/**
 * Nutrition Tracking
 * 
 * Log meals and correlate with energy levels
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@energy_today:nutrition_data";

export interface FoodItem {
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  category: "protein" | "carbs" | "fats" | "vegetables" | "fruits" | "snacks" | "drinks";
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  notes?: string;
}

export interface NutritionCorrelation {
  food: string;
  averageEnergyAfter: number;
  occurrences: number;
  impact: "positive" | "negative" | "neutral";
  confidence: number; // 0-100
}

export interface NutritionInsights {
  energyBoostingFoods: NutritionCorrelation[];
  energyDrainingFoods: NutritionCorrelation[];
  optimalMealTiming: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  macroBalance: {
    protein: number;
    carbs: number;
    fats: number;
  };
  recommendations: string[];
}

/**
 * Get all meals
 */
export async function getMeals(): Promise<Meal[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get meals:", error);
  }
  return [];
}

/**
 * Add meal entry
 */
export async function addMeal(meal: Omit<Meal, "id">): Promise<void> {
  try {
    const meals = await getMeals();
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
    };
    meals.push(newMeal);
    meals.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch (error) {
    console.error("Failed to add meal:", error);
    throw error;
  }
}

/**
 * Update meal
 */
export async function updateMeal(id: string, updates: Partial<Meal>): Promise<void> {
  try {
    const meals = await getMeals();
    const index = meals.findIndex((m) => m.id === id);
    if (index !== -1) {
      meals[index] = { ...meals[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    }
  } catch (error) {
    console.error("Failed to update meal:", error);
    throw error;
  }
}

/**
 * Delete meal
 */
export async function deleteMeal(id: string): Promise<void> {
  try {
    const meals = await getMeals();
    const filtered = meals.filter((m) => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete meal:", error);
    throw error;
  }
}

/**
 * Get meals for date range
 */
export async function getMealsRange(startDate: string, endDate: string): Promise<Meal[]> {
  const meals = await getMeals();
  return meals.filter((m) => m.date >= startDate && m.date <= endDate);
}

/**
 * Calculate total nutrition for a meal
 */
export function calculateMealNutrition(foods: FoodItem[]): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
} {
  return foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein,
      carbs: totals.carbs + food.carbs,
      fats: totals.fats + food.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

/**
 * Analyze food-energy correlation
 */
export async function analyzeFoodCorrelation(
  energyData: { date: string; time: string; energy: number }[]
): Promise<NutritionInsights> {
  const meals = await getMeals();

  // Match meals with energy data (within 2 hours after meal)
  const correlations: { [food: string]: { energies: number[]; count: number } } = {};

  for (const meal of meals) {
    const mealDateTime = new Date(`${meal.date}T${meal.time}`);
    
    // Find energy readings 1-2 hours after meal
    const relevantEnergy = energyData.filter((e) => {
      const energyDateTime = new Date(`${e.date}T${e.time}`);
      const diffHours = (energyDateTime.getTime() - mealDateTime.getTime()) / (1000 * 60 * 60);
      return diffHours >= 1 && diffHours <= 2;
    });

    if (relevantEnergy.length > 0) {
      const avgEnergy =
        relevantEnergy.reduce((sum, e) => sum + e.energy, 0) / relevantEnergy.length;

      for (const food of meal.foods) {
        if (!correlations[food.name]) {
          correlations[food.name] = { energies: [], count: 0 };
        }
        correlations[food.name].energies.push(avgEnergy);
        correlations[food.name].count++;
      }
    }
  }

  // Calculate correlations
  const foodCorrelations: NutritionCorrelation[] = Object.entries(correlations)
    .map(([food, data]) => {
      const avgEnergy = data.energies.reduce((sum, e) => sum + e, 0) / data.energies.length;
      const confidence = Math.min(100, data.count * 20); // More occurrences = higher confidence

      let impact: "positive" | "negative" | "neutral";
      if (avgEnergy >= 70) impact = "positive";
      else if (avgEnergy <= 50) impact = "negative";
      else impact = "neutral";

      return {
        food,
        averageEnergyAfter: Math.round(avgEnergy),
        occurrences: data.count,
        impact,
        confidence,
      };
    })
    .filter((c) => c.occurrences >= 2); // Only include foods eaten at least twice

  // Sort by energy impact
  foodCorrelations.sort((a, b) => b.averageEnergyAfter - a.averageEnergyAfter);

  const energyBoostingFoods = foodCorrelations
    .filter((c) => c.impact === "positive")
    .slice(0, 5);
  const energyDrainingFoods = foodCorrelations
    .filter((c) => c.impact === "negative")
    .slice(0, 5);

  // Analyze meal timing
  const mealsByType: { [key: string]: string[] } = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const meal of meals) {
    if (meal.type !== "snack") {
      mealsByType[meal.type].push(meal.time);
    }
  }

  const optimalMealTiming = {
    breakfast:
      mealsByType.breakfast.length > 0
        ? mealsByType.breakfast.sort()[Math.floor(mealsByType.breakfast.length / 2)]
        : "08:00",
    lunch:
      mealsByType.lunch.length > 0
        ? mealsByType.lunch.sort()[Math.floor(mealsByType.lunch.length / 2)]
        : "12:30",
    dinner:
      mealsByType.dinner.length > 0
        ? mealsByType.dinner.sort()[Math.floor(mealsByType.dinner.length / 2)]
        : "18:30",
  };

  // Calculate average macro balance
  const totalNutrition = meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + meal.totalProtein,
      carbs: totals.carbs + meal.totalCarbs,
      fats: totals.fats + meal.totalFats,
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );

  const totalMacros = totalNutrition.protein + totalNutrition.carbs + totalNutrition.fats;
  const macroBalance = {
    protein: Math.round((totalNutrition.protein / totalMacros) * 100),
    carbs: Math.round((totalNutrition.carbs / totalMacros) * 100),
    fats: Math.round((totalNutrition.fats / totalMacros) * 100),
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (energyBoostingFoods.length > 0) {
    recommendations.push(
      `Eat more ${energyBoostingFoods[0].food} - it consistently boosts your energy`
    );
  }

  if (energyDrainingFoods.length > 0) {
    recommendations.push(
      `Consider reducing ${energyDrainingFoods[0].food} - it tends to lower your energy`
    );
  }

  if (macroBalance.carbs > 60) {
    recommendations.push("Try increasing protein intake for more sustained energy");
  }

  if (macroBalance.protein < 20) {
    recommendations.push("Add more protein to your meals for better energy stability");
  }

  return {
    energyBoostingFoods,
    energyDrainingFoods,
    optimalMealTiming,
    macroBalance,
    recommendations,
  };
}

/**
 * Get nutrition statistics
 */
export async function getNutritionStats(days: number = 7): Promise<{
  totalMeals: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFats: number;
  mostCommonFoods: { name: string; count: number }[];
}> {
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const meals = await getMealsRange(startDateStr, endDate);

  if (meals.length === 0) {
    return {
      totalMeals: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFats: 0,
      mostCommonFoods: [],
    };
  }

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fats: acc.fats + meal.totalFats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Count food occurrences
  const foodCounts: { [name: string]: number } = {};
  for (const meal of meals) {
    for (const food of meal.foods) {
      foodCounts[food.name] = (foodCounts[food.name] || 0) + 1;
    }
  }

  const mostCommonFoods = Object.entries(foodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalMeals: meals.length,
    averageCalories: Math.round(totals.calories / meals.length),
    averageProtein: Math.round(totals.protein / meals.length),
    averageCarbs: Math.round(totals.carbs / meals.length),
    averageFats: Math.round(totals.fats / meals.length),
    mostCommonFoods,
  };
}

/**
 * Common food database
 */
export const COMMON_FOODS: FoodItem[] = [
  // Proteins
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, category: "protein" },
  { name: "Salmon", calories: 206, protein: 22, carbs: 0, fats: 13, category: "protein" },
  { name: "Eggs", calories: 155, protein: 13, carbs: 1, fats: 11, category: "protein" },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fats: 0.4, category: "protein" },
  { name: "Tofu", calories: 76, protein: 8, carbs: 2, fats: 4.8, category: "protein" },
  
  // Carbs
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fats: 1.8, category: "carbs" },
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fats: 3, category: "carbs" },
  { name: "Sweet Potato", calories: 112, protein: 2, carbs: 26, fats: 0.1, category: "carbs" },
  { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fats: 3.6, category: "carbs" },
  { name: "Whole Wheat Bread", calories: 80, protein: 4, carbs: 14, fats: 1, category: "carbs" },
  
  // Vegetables
  { name: "Broccoli", calories: 55, protein: 4, carbs: 11, fats: 0.6, category: "vegetables" },
  { name: "Spinach", calories: 23, protein: 3, carbs: 4, fats: 0.4, category: "vegetables" },
  { name: "Carrots", calories: 41, protein: 1, carbs: 10, fats: 0.2, category: "vegetables" },
  { name: "Bell Peppers", calories: 31, protein: 1, carbs: 6, fats: 0.3, category: "vegetables" },
  
  // Fruits
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0.4, category: "fruits" },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: "fruits" },
  { name: "Berries", calories: 57, protein: 1, carbs: 14, fats: 0.5, category: "fruits" },
  
  // Snacks
  { name: "Almonds", calories: 164, protein: 6, carbs: 6, fats: 14, category: "snacks" },
  { name: "Protein Bar", calories: 200, protein: 20, carbs: 20, fats: 7, category: "snacks" },
  { name: "Dark Chocolate", calories: 170, protein: 2, carbs: 13, fats: 12, category: "snacks" },
  
  // Drinks
  { name: "Coffee", calories: 2, protein: 0, carbs: 0, fats: 0, category: "drinks" },
  { name: "Green Tea", calories: 2, protein: 0, carbs: 0, fats: 0, category: "drinks" },
  { name: "Protein Shake", calories: 120, protein: 25, carbs: 3, fats: 1.5, category: "drinks" },
];

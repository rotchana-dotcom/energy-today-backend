/**
 * Favorite Meals Storage
 * 
 * Save and manage frequently eaten meals for quick re-logging
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorite_meals";

export interface FavoriteMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar?: number;
  fiber?: number;
  addedAt: string;
}

/**
 * Get all favorite meals
 */
export async function getFavoriteMeals(): Promise<FavoriteMeal[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load favorite meals:", error);
    return [];
  }
}

/**
 * Add a meal to favorites
 */
export async function addFavoriteMeal(meal: Omit<FavoriteMeal, "id" | "addedAt">): Promise<void> {
  try {
    const favorites = await getFavoriteMeals();
    
    // Check if already exists
    const exists = favorites.some(f => 
      f.name.toLowerCase() === meal.name.toLowerCase()
    );
    
    if (exists) {
      throw new Error("This meal is already in your favorites");
    }
    
    const newFavorite: FavoriteMeal = {
      ...meal,
      id: Date.now().toString(),
      addedAt: new Date().toISOString()
    };
    
    favorites.unshift(newFavorite); // Add to beginning
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to add favorite meal:", error);
    throw error;
  }
}

/**
 * Remove a meal from favorites
 */
export async function removeFavoriteMeal(id: string): Promise<void> {
  try {
    const favorites = await getFavoriteMeals();
    const updated = favorites.filter(f => f.id !== id);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove favorite meal:", error);
    throw error;
  }
}

/**
 * Update a favorite meal
 */
export async function updateFavoriteMeal(id: string, updates: Partial<Omit<FavoriteMeal, "id" | "addedAt">>): Promise<void> {
  try {
    const favorites = await getFavoriteMeals();
    const index = favorites.findIndex(f => f.id === id);
    
    if (index === -1) {
      throw new Error("Favorite meal not found");
    }
    
    favorites[index] = {
      ...favorites[index],
      ...updates
    };
    
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to update favorite meal:", error);
    throw error;
  }
}

/**
 * Clear all favorite meals
 */
export async function clearFavoriteMeals(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error("Failed to clear favorite meals:", error);
    throw error;
  }
}

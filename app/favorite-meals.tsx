/**
 * Favorite Meals Screen
 * 
 * View and manage saved favorite meals for quick re-logging
 */

import { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getFavoriteMeals, removeFavoriteMeal, type FavoriteMeal } from "@/lib/favorite-meals";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function FavoriteMealsScreen() {
  const colors = useColors();
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    const data = await getFavoriteMeals();
    setFavorites(data);
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      "Remove Favorite",
      `Remove "${name}" from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeFavoriteMeal(id);
            await loadFavorites();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  }

  function handleAddAgain(meal: FavoriteMeal) {
    // Navigate back to nutrition tracker with meal data
    router.push({
      pathname: "/nutrition-tracker",
      params: {
        favoriteMeal: JSON.stringify({
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          sugar: meal.sugar,
          fiber: meal.fiber
        })
      }
    });
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text style={{ color: colors.primary, fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
          
          <Text className="text-3xl font-bold text-foreground mb-2">
            ⭐ Favorite Meals
          </Text>
          <Text className="text-base text-muted">
            Quick add your frequently eaten meals
          </Text>
        </View>

        {/* Favorites List */}
        {loading ? (
          <View className="items-center py-8">
            <Text className="text-muted">Loading favorites...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">
              No Favorites Yet
            </Text>
            <Text className="text-base text-muted text-center px-8">
              Save your frequently eaten meals as favorites for quick logging
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {favorites.map((meal) => (
              <View
                key={meal.id}
                className="bg-surface rounded-xl p-4 border border-border"
              >
                {/* Meal Name */}
                <Text className="text-lg font-semibold text-foreground mb-2">
                  {meal.name}
                </Text>

                {/* Nutrition Info */}
                <View className="flex-row flex-wrap gap-3 mb-3">
                  <View className="bg-background rounded-lg px-3 py-1">
                    <Text className="text-xs text-muted">Calories</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {meal.calories}
                    </Text>
                  </View>
                  <View className="bg-background rounded-lg px-3 py-1">
                    <Text className="text-xs text-muted">Protein</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {meal.protein}g
                    </Text>
                  </View>
                  <View className="bg-background rounded-lg px-3 py-1">
                    <Text className="text-xs text-muted">Carbs</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {meal.carbs}g
                    </Text>
                  </View>
                  <View className="bg-background rounded-lg px-3 py-1">
                    <Text className="text-xs text-muted">Fats</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {meal.fats}g
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleAddAgain(meal)}
                    style={{ backgroundColor: colors.primary }}
                    className="flex-1 py-3 rounded-lg items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold">
                      Add Again
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(meal.id, meal.name)}
                    style={{ backgroundColor: colors.error }}
                    className="px-4 py-3 rounded-lg items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold">
                      🗑️
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

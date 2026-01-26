import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { VoiceInput } from "@/components/voice-input";
import { useColors } from "@/hooks/use-colors";
import { lookupBarcode, type FoodProduct } from "@/lib/openfoodfacts-api";
import { addFavoriteMeal } from "@/lib/favorite-meals";
import {
  saveMealEntry,
  getRecentMealEntries,
  getNutritionStats,
  getNutritionInsights,
  analyzeFoodCorrelations,
  deleteMealEntry,
  type MealEntry,
  type NutritionStats,
  type FoodCorrelation,
} from "@/lib/nutrition-tracker";

export default function NutritionTrackerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [correlations, setCorrelations] = useState<FoodCorrelation[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [newMeal, setNewMeal] = useState({
    date: new Date().toISOString().split("T")[0],
    mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
    foodItems: "",
    protein: "",
    carbs: "",
    fats: "",
    calories: "",
    caffeine: "0",
    sugar: "0",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // Handle favorite meal from route params
  useEffect(() => {
    if (params.favoriteMeal) {
      try {
        const meal = JSON.parse(params.favoriteMeal as string);
        setNewMeal({
          ...newMeal,
          foodItems: meal.name,
          calories: meal.calories.toString(),
          protein: meal.protein.toString(),
          carbs: meal.carbs.toString(),
          fats: meal.fats.toString(),
          sugar: meal.sugar?.toString() || "0",
        });
        setShowAddMeal(true);
      } catch (error) {
        console.error("Failed to parse favorite meal:", error);
      }
    }
  }, [params.favoriteMeal]);

  const loadData = async () => {
    const recentMeals = await getRecentMealEntries(30);
    setMeals(recentMeals);

    const nutritionStats = await getNutritionStats(30);
    setStats(nutritionStats);

    const nutritionInsights = await getNutritionInsights();
    setInsights(nutritionInsights);

    const foodCorr = await analyzeFoodCorrelations();
    setCorrelations(foodCorr.slice(0, 10));
  };

  const handleAddMeal = async () => {
    if (!newMeal.foodItems.trim()) {
      Alert.alert("Error", "Please enter at least one food item");
      return;
    }

    const protein = parseFloat(newMeal.protein) || 0;
    const carbs = parseFloat(newMeal.carbs) || 0;
    const fats = parseFloat(newMeal.fats) || 0;
    const calories = parseFloat(newMeal.calories) || 0;
    const caffeine = parseFloat(newMeal.caffeine) || 0;
    const sugar = parseFloat(newMeal.sugar) || 0;

    await saveMealEntry({
      date: newMeal.date,
      mealType: newMeal.mealType,
      foodItems: newMeal.foodItems.split(",").map((f) => f.trim()),
      macros: {
        protein,
        carbs,
        fats,
        calories,
      },
      caffeine,
      sugar,
      notes: newMeal.notes.trim() || undefined,
    });

    await loadData();
    setNewMeal({
      date: new Date().toISOString().split("T")[0],
      mealType: "lunch",
      foodItems: "",
      protein: "",
      carbs: "",
      fats: "",
      calories: "",
      caffeine: "0",
      sugar: "0",
      notes: "",
    });
    setShowAddMeal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert("Delete Meal?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMealEntry(mealId);
          await loadData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleSaveAsFavorite = async () => {
    if (!newMeal.foodItems.trim()) {
      Alert.alert("Error", "Please enter food items first");
      return;
    }

    try {
      await addFavoriteMeal({
        name: newMeal.foodItems,
        calories: parseFloat(newMeal.calories) || 0,
        protein: parseFloat(newMeal.protein) || 0,
        carbs: parseFloat(newMeal.carbs) || 0,
        fats: parseFloat(newMeal.fats) || 0,
        sugar: parseFloat(newMeal.sugar) || 0,
      });
      
      Alert.alert(
        "Saved! ⭐",
        `"${newMeal.foodItems}" has been added to your favorites.`,
        [{ text: "OK" }]
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save favorite",
        [{ text: "OK" }]
      );
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setScanning(true);
    
    try {
      const product = await lookupBarcode(barcode);
      
      if (product) {
        // Auto-fill form with product data
        setNewMeal({
          ...newMeal,
          foodItems: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
          protein: product.protein?.toFixed(1) || "",
          carbs: product.carbs?.toFixed(1) || "",
          fats: product.fat?.toFixed(1) || "",
          calories: product.calories?.toFixed(0) || "",
          sugar: product.sugar?.toFixed(1) || "0",
          notes: product.servingSize ? `Serving size: ${product.servingSize}` : "",
        });
        
        Alert.alert(
          "Product Found! 🎉",
          `${product.name}${product.brand ? ' by ' + product.brand : ''}\n\nNutrition data has been auto-filled. You can edit it before saving.`,
          [{ text: "OK" }]
        );
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          "Product Not Found",
          "This barcode is not in our database. Please enter nutrition info manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to look up product. Please try again or enter manually.",
        [{ text: "OK" }]
      );
    } finally {
      setScanning(false);
    }
  };

  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🍳";
      case "lunch":
        return "🍱";
      case "dinner":
        return "🍽️";
      case "snack":
        return "🍎";
      default:
        return "🍴";
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "boost":
        return colors.success;
      case "drain":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  if (showScanner) {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (showAddMeal) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowAddMeal(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Log Meal
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleSaveAsFavorite}>
                <Text className="text-lg" style={{ color: colors.primary }}>
                  ⭐
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddMeal}>
                <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Date
          </Text>
          <TextInput
            value={newMeal.date}
            onChangeText={(text) => setNewMeal({ ...newMeal, date: text })}
            placeholder="YYYY-MM-DD"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Meal Type
          </Text>
          <View className="flex-row gap-2 mb-4">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setNewMeal({ ...newMeal, mealType: type });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor: newMeal.mealType === type ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-center capitalize"
                  style={{
                    color: newMeal.mealType === type ? colors.background : colors.foreground,
                  }}
                >
                  {getMealTypeEmoji(type)} {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold" style={{ color: colors.muted }}>
              Food Items (comma-separated) *
            </Text>
            <TouchableOpacity
              onPress={() => setShowScanner(true)}
              disabled={scanning}
              className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-sm font-semibold">
                {scanning ? "Loading..." : "📷 Scan"}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            value={newMeal.foodItems}
            onChangeText={(text) => setNewMeal({ ...newMeal, foodItems: text })}
            placeholder="e.g., chicken breast, rice, broccoli"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={2}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Macros
          </Text>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Protein (g)
              </Text>
              <TextInput
                value={newMeal.protein}
                onChangeText={(text) => setNewMeal({ ...newMeal, protein: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Carbs (g)
              </Text>
              <TextInput
                value={newMeal.carbs}
                onChangeText={(text) => setNewMeal({ ...newMeal, carbs: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Fats (g)
              </Text>
              <TextInput
                value={newMeal.fats}
                onChangeText={(text) => setNewMeal({ ...newMeal, fats: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Calories
              </Text>
              <TextInput
                value={newMeal.calories}
                onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Caffeine (mg)
              </Text>
              <TextInput
                value={newMeal.caffeine}
                onChangeText={(text) => setNewMeal({ ...newMeal, caffeine: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                Sugar (g)
              </Text>
              <TextInput
                value={newMeal.sugar}
                onChangeText={(text) => setNewMeal({ ...newMeal, sugar: text })}
                keyboardType="numeric"
                placeholder="0"
                className="p-3 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={newMeal.notes}
            onChangeText={(text) => setNewMeal({ ...newMeal, notes: text })}
            placeholder="How did you feel after?"
            className="p-4 rounded-xl mb-6 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={2}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Nutrition Tracker
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.push("/favorite-meals")}>
              <Text className="text-2xl" style={{ color: colors.primary }}>
                ⭐
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddMeal(true)}>
              <Text className="text-3xl" style={{ color: colors.primary }}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {stats && stats.totalMeals > 0 && (
          <>
            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.averageCalories}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Calories
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.averageProtein}g
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Protein
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalCaffeine}mg
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Total Caffeine
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalSugar}g
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Total Sugar
                </Text>
              </View>
            </View>

            {/* Insights */}
            {insights.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
                  Insights
                </Text>
                {insights.map((insight, index) => (
                  <View
                    key={index}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-sm" style={{ color: colors.foreground }}>
                      💡 {insight}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Food Correlations */}
            {correlations.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
                  Food-Energy Correlations
                </Text>
                {correlations.map((corr, index) => (
                  <View
                    key={index}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-semibold capitalize" style={{ color: colors.foreground }}>
                        {corr.foodItem}
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: getRecommendationColor(corr.recommendation) + "30" }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: getRecommendationColor(corr.recommendation) }}
                        >
                          {corr.recommendation}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {corr.occurrences} meals • {corr.averageEnergyImpact > 0 ? "+" : ""}
                      {corr.averageEnergyImpact} energy impact
                    </Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Recent Meals */}
        <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
          Recent Meals ({meals.length})
        </Text>

        {meals.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No meals logged yet
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Start tracking your nutrition to discover energy patterns
            </Text>
          </View>
        ) : (
          meals.slice(0, 20).map((meal) => (
            <View
              key={meal.id}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">{getMealTypeEmoji(meal.mealType)}</Text>
                    <Text className="text-base font-semibold capitalize" style={{ color: colors.foreground }}>
                      {meal.mealType}
                    </Text>
                    <Text className="text-sm ml-2" style={{ color: colors.muted }}>
                      {new Date(meal.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                    {meal.foodItems.join(", ")}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {meal.macros.calories} cal
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      P: {meal.macros.protein}g
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      C: {meal.macros.carbs}g
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      F: {meal.macros.fats}g
                    </Text>
                    {meal.caffeine > 0 && (
                      <Text className="text-xs" style={{ color: colors.warning }}>
                        ☕ {meal.caffeine}mg
                      </Text>
                    )}
                    {meal.sugar > 0 && (
                      <Text className="text-xs" style={{ color: colors.error }}>
                        🍬 {meal.sugar}g
                      </Text>
                    )}
                  </View>
                  {meal.notes && (
                    <Text className="text-sm italic mt-2" style={{ color: colors.muted }}>
                      {meal.notes}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
                  <Text className="text-lg" style={{ color: colors.error }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

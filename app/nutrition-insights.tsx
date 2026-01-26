/**
 * Nutrition Insights Screen
 * 
 * Display food-energy correlations and nutrition statistics
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getMeals,
  addMeal,
  getNutritionStats,
  analyzeFoodCorrelation,
  calculateMealNutrition,
  COMMON_FOODS,
  type FoodItem,
  type Meal,
} from "@/lib/nutrition-tracking";

export default function NutritionInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    "breakfast"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, insightsData] = await Promise.all([
        getNutritionStats(7),
        analyzeFoodCorrelation([
          // Mock energy data - in production, fetch from actual energy logs
          { date: new Date().toISOString().split("T")[0], time: "10:00", energy: 75 },
        ]),
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (error) {
      console.error("Failed to load nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert("Error", "Please select at least one food item");
      return;
    }

    try {
      const nutrition = calculateMealNutrition(selectedFoods);
      const now = new Date();
      
      await addMeal({
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        type: mealType,
        foods: selectedFoods,
        totalCalories: nutrition.calories,
        totalProtein: nutrition.protein,
        totalCarbs: nutrition.carbs,
        totalFats: nutrition.fats,
      });

      setShowAddMeal(false);
      setSelectedFoods([]);
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add meal");
    }
  };

  const toggleFood = (food: FoodItem) => {
    const exists = selectedFoods.find((f) => f.name === food.name);
    if (exists) {
      setSelectedFoods(selectedFoods.filter((f) => f.name !== food.name));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getImpactColor = (impact: string) => {
    if (impact === "positive") return "#22C55E";
    if (impact === "negative") return "#EF4444";
    return "#6B7280";
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/more');
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Nutrition</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddMeal(true);
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 gap-6">
          {/* Stats Overview */}
          {stats && stats.totalMeals > 0 ? (
            <>
              <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
                <View className="flex-row items-start gap-3 mb-4">
                  <Text className="text-2xl">🍽️</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-2">
                      Nutrition Summary (7 Days)
                    </Text>
                    <Text className="text-sm text-muted">{stats.totalMeals} meals logged</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-2xl font-bold text-primary">
                      {stats.averageCalories}
                    </Text>
                    <Text className="text-xs text-muted mt-1">Avg Calories/Meal</Text>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <Text className="text-2xl font-bold text-primary">{stats.averageProtein}g</Text>
                    <Text className="text-xs text-muted mt-1">Avg Protein/Meal</Text>
                  </View>
                </View>
              </View>

              {/* Energy-Boosting Foods */}
              {insights?.energyBoostingFoods && insights.energyBoostingFoods.length > 0 && (
                <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Text className="text-xl">⚡</Text>
                    <Text className="text-base font-semibold text-foreground">
                      Energy-Boosting Foods
                    </Text>
                  </View>
                  <View className="gap-3">
                    {insights.energyBoostingFoods.map((food: any, index: number) => (
                      <View key={index} className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-foreground">{food.food}</Text>
                          <Text className="text-xs text-muted">
                            {food.occurrences} times • {food.confidence}% confidence
                          </Text>
                        </View>
                        <View className="bg-success/20 px-3 py-1 rounded-full">
                          <Text className="text-xs font-medium text-success">
                            +{food.averageEnergyAfter}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Energy-Draining Foods */}
              {insights?.energyDrainingFoods && insights.energyDrainingFoods.length > 0 && (
                <View className="bg-error/10 rounded-2xl p-5 border border-error/30">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Text className="text-xl">⚠️</Text>
                    <Text className="text-base font-semibold text-foreground">
                      Energy-Draining Foods
                    </Text>
                  </View>
                  <View className="gap-3">
                    {insights.energyDrainingFoods.map((food: any, index: number) => (
                      <View key={index} className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-foreground">{food.food}</Text>
                          <Text className="text-xs text-muted">
                            {food.occurrences} times • {food.confidence}% confidence
                          </Text>
                        </View>
                        <View className="bg-error/20 px-3 py-1 rounded-full">
                          <Text className="text-xs font-medium text-error">
                            {food.averageEnergyAfter}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommendations */}
              {insights?.recommendations && insights.recommendations.length > 0 && (
                <View className="bg-surface rounded-2xl p-5 border border-border">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Text className="text-xl">💡</Text>
                    <Text className="text-base font-semibold text-foreground">
                      Recommendations
                    </Text>
                  </View>
                  <View className="gap-3">
                    {insights.recommendations.map((rec: string, index: number) => (
                      <View key={index} className="flex-row items-start gap-2">
                        <Text className="text-primary mt-1">•</Text>
                        <Text className="flex-1 text-sm text-muted leading-relaxed">{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-4xl mb-4">🍽️</Text>
              <Text className="text-base font-medium text-foreground mb-2">
                No Meals Logged Yet
              </Text>
              <Text className="text-sm text-muted text-center mb-6">
                Start logging your meals to see nutrition insights
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddMeal(true)}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Log First Meal</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={showAddMeal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <TouchableOpacity
              onPress={() => {
                setShowAddMeal(false);
                setSelectedFoods([]);
              }}
            >
              <Text className="text-error text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">Add Meal</Text>
            <TouchableOpacity onPress={handleAddMeal}>
              <Text className="text-primary text-base font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          {/* Meal Type Selector */}
          <View className="px-6 py-4">
            <Text className="text-sm font-medium text-foreground mb-3">Meal Type</Text>
            <View className="flex-row gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setMealType(type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 py-2 rounded-lg border ${
                    mealType === type
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium capitalize ${
                      mealType === type ? "text-white" : "text-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food Selection */}
          <View className="flex-1 px-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              Select Foods ({selectedFoods.length})
            </Text>
            <FlatList
              data={COMMON_FOODS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => {
                const isSelected = selectedFoods.find((f) => f.name === item.name);
                return (
                  <TouchableOpacity
                    onPress={() => toggleFood(item)}
                    className={`flex-row items-center justify-between p-4 mb-2 rounded-lg border ${
                      isSelected ? "bg-primary/10 border-primary" : "bg-surface border-border"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted">
                        {item.calories} cal • {item.protein}g protein
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                        <Text className="text-white text-xs">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

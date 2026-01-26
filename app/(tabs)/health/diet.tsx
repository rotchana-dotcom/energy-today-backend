import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscriptionStatus } from "@/lib/subscription-status";
import { router } from "expo-router";
import { syncDietToCalendar } from "@/lib/calendar-sync-helper";
import { SyncStatusIndicator } from "@/components/sync-status-indicator";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";

interface FoodEntry {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  food: string;
  calories: number;
  notes: string;
  mealTime: string;
  date: string;
}

interface WeightEntry {
  id: string;
  weight: number;
  height: number;
  bmi: number;
  goal: "gain" | "lose" | "maintain";
  notes: string;
  date: string;
}

export default function DietTracker() {
  const colors = useColors();
  const { isPro } = useSubscriptionStatus();
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('diet');
  
  const [activeTab, setActiveTab] = useState<"food" | "weight">("food");
  
  // Food logging state
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [foodNotes, setFoodNotes] = useState("");
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  
  // Weight tracking state
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<"gain" | "lose" | "maintain">("maintain");
  const [weightNotes, setWeightNotes] = useState("");
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedFood = await AsyncStorage.getItem("food_entries");
      const storedWeight = await AsyncStorage.getItem("weight_entries");
      
      if (storedFood) setFoodEntries(JSON.parse(storedFood));
      if (storedWeight) setWeightEntries(JSON.parse(storedWeight));
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const saveFoodEntry = async () => {
    if (!food.trim()) {
      Alert.alert("Error", "Please enter what you ate");
      return;
    }

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      mealType,
      food: food.trim(),
      calories: calories ? parseInt(calories) : 0,
      notes: foodNotes,
      mealTime: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newEntry, ...foodEntries];
    setFoodEntries(updated);
    await AsyncStorage.setItem("food_entries", JSON.stringify(updated));

    // Sync to Google Calendar
    const syncResult = await syncDietToCalendar(
      mealType,
      food.trim(),
      newEntry.mealTime,
      newEntry.calories
    );

    // Reset form
    setFood("");
    setCalories("");
    setFoodNotes("");

    if (syncResult.success) {
      Alert.alert("Success", "Food entry saved and synced to calendar!");
    } else {
      Alert.alert("Success", "Food entry saved! (Calendar sync: " + syncResult.message + ")");
    }
  };

  const saveWeightEntry = async () => {
    if (!weight || !height) {
      Alert.alert("Error", "Please enter both weight and height");
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const bmi = weightNum / ((heightNum / 100) ** 2);

    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      weight: weightNum,
      height: heightNum,
      bmi: Math.round(bmi * 10) / 10,
      goal,
      notes: weightNotes,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newEntry, ...weightEntries];
    setWeightEntries(updated);
    await AsyncStorage.setItem("weight_entries", JSON.stringify(updated));

    // Reset form
    setWeight("");
    setWeightNotes("");

    Alert.alert("Success", `Weight logged! BMI: ${newEntry.bmi}`);
  };

  const getVisibleFoodEntries = () => {
    if (isPro) return foodEntries;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return foodEntries.filter((entry) => new Date(entry.mealTime) >= sevenDaysAgo);
  };

  const getVisibleWeightEntries = () => {
    if (isPro) return weightEntries;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return weightEntries.filter((entry) => new Date(entry.date) >= sevenDaysAgo);
  };

  const getTodayCalories = () => {
    const today = new Date().toISOString().split("T")[0];
    return foodEntries
      .filter((entry) => entry.date === today)
      .reduce((sum, entry) => sum + entry.calories, 0);
  };

  const getLast7DaysCalories = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayCalories = foodEntries
        .filter((entry) => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.calories, 0);
      
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      
      days.push({
        label: dayLabel,
        value: dayCalories,
      });
    }
    
    return days;
  };

  const getLast7DaysWeight = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayEntries = weightEntries.filter((entry) => entry.date === dateStr);
      const avgWeight = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.weight, 0) / dayEntries.length
        : 0;
      
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      
      days.push({
        label: dayLabel,
        value: Math.round(avgWeight * 10) / 10,
      });
    }
    
    return days;
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: "Underweight", color: colors.warning };
    if (bmi < 25) return { category: "Normal", color: colors.success };
    if (bmi < 30) return { category: "Overweight", color: colors.warning };
    return { category: "Obese", color: colors.error };
  };

  const quickFoods = {
    breakfast: ["Oatmeal", "Eggs", "Toast", "Yogurt", "Fruit", "Cereal"],
    lunch: ["Salad", "Sandwich", "Soup", "Rice Bowl", "Pasta", "Wrap"],
    dinner: ["Chicken", "Fish", "Beef", "Vegetables", "Rice", "Noodles"],
    snack: ["Apple", "Banana", "Nuts", "Protein Bar", "Chips", "Cookie"],
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Diet & Weight</Text>
        <Text className="text-sm text-muted mb-6">
          Track your nutrition and weight goals
        </Text>

        {/* Tab Switcher */}
        <View className="flex-row mb-6 bg-surface rounded-2xl p-1 border border-border">
          <Pressable
            onPress={() => setActiveTab("food")}
            style={{
              backgroundColor: activeTab === "food" ? colors.primary : "transparent",
            }}
            className="flex-1 py-2 rounded-xl"
          >
            <Text
              style={{
                color: activeTab === "food" ? colors.background : colors.foreground,
              }}
              className="text-center font-semibold"
            >
              Food Log
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("weight")}
            style={{
              backgroundColor: activeTab === "weight" ? colors.primary : "transparent",
            }}
            className="flex-1 py-2 rounded-xl"
          >
            <Text
              style={{
                color: activeTab === "weight" ? colors.background : colors.foreground,
              }}
              className="text-center font-semibold"
            >
              Weight/BMI
            </Text>
          </Pressable>
        </View>

        {/* AI-Powered Insights (Pro Feature) */}
        <AIInsightsCard
          feature="Diet"
          insights={aiInsights}
          loading={aiLoading}
          error={aiError || undefined}
          icon="🍽️"
        />

        {activeTab === "food" ? (
          <>
            {/* Today's Calories */}
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-muted">Today's Calories</Text>
                <SyncStatusIndicator feature="diet" />
              </View>
              <Text className="text-3xl font-bold text-foreground">{getTodayCalories()}</Text>
            </View>

            {/* 7-Day Calorie Trend */}
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">7-Day Calorie Trend</Text>
              <SimpleLineChart
                data={getLast7DaysCalories()}
                height={180}
                yAxisLabel="Calories"
                maxValue={3000}
              />
            </View>

            {/* Food Entry Form */}
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">Log Food</Text>

              {/* Meal Type */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Meal Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setMealType(type)}
                      style={{
                        backgroundColor: mealType === type ? colors.primary : colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="px-4 py-2 rounded-xl"
                    >
                      <Text
                        style={{
                          color: mealType === type ? colors.background : colors.foreground,
                        }}
                        className="capitalize"
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Quick Add Buttons */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Quick Add</Text>
                <View className="flex-row flex-wrap gap-2">
                  {quickFoods[mealType].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setFood(food ? `${food}, ${item}` : item)}
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="px-3 py-2 rounded-xl"
                    >
                      <Text className="text-foreground text-sm">{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Food Input */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">What did you eat?</Text>
                <TextInput
                  value={food}
                  onChangeText={setFood}
                  placeholder="e.g., Chicken salad with avocado"
                  placeholderTextColor={colors.muted}
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Calories (Optional) */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Calories (Optional)</Text>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="e.g., 450"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Notes */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Notes (Optional)</Text>
                <TextInput
                  value={foodNotes}
                  onChangeText={setFoodNotes}
                  placeholder="How did you feel after eating?"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={2}
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={saveFoodEntry}
                style={{ backgroundColor: colors.primary }}
                className="rounded-xl py-3 items-center"
              >
                <Text style={{ color: colors.background }} className="font-semibold">
                  Save Food Entry
                </Text>
              </Pressable>
            </View>

            {/* Food History */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-foreground">Food History</Text>
                {!isPro && foodEntries.length > 7 && (
                  <Pressable onPress={() => router.push("/upgrade")}>
                    <Text className="text-sm text-primary font-semibold">Upgrade for Full History</Text>
                  </Pressable>
                )}
              </View>

              {getVisibleFoodEntries().length === 0 ? (
                <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                  <Text className="text-muted text-center">No food entries yet. Start logging!</Text>
                </View>
              ) : (
                getVisibleFoodEntries().map((entry) => (
                  <View
                    key={entry.id}
                    className="bg-surface rounded-2xl p-4 mb-3 border border-border"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-xs text-muted capitalize mr-2">{entry.mealType}</Text>
                          <Text className="text-xs text-muted">
                            {new Date(entry.mealTime).toLocaleString()}
                          </Text>
                        </View>
                        <Text className="text-base font-semibold text-foreground">{entry.food}</Text>
                      </View>
                      {entry.calories > 0 && (
                        <View className="bg-background rounded-lg px-3 py-1">
                          <Text className="text-sm font-semibold text-foreground">
                            {entry.calories} cal
                          </Text>
                        </View>
                      )}
                    </View>
                    {entry.notes && (
                      <Text className="text-sm text-muted italic">{entry.notes}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* Latest BMI */}
            {weightEntries.length > 0 && (
              <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
                <Text className="text-sm text-muted mb-1">Current BMI</Text>
                <View className="flex-row items-end">
                  <Text className="text-3xl font-bold text-foreground mr-2">
                    {weightEntries[0].bmi}
                  </Text>
                  <Text
                    style={{ color: getBMICategory(weightEntries[0].bmi).color }}
                    className="text-base font-semibold mb-1"
                  >
                    {getBMICategory(weightEntries[0].bmi).category}
                  </Text>
                </View>
                <Text className="text-sm text-muted mt-1">
                  Weight: {weightEntries[0].weight} kg | Height: {weightEntries[0].height} cm
                </Text>
              </View>
            )}

            {/* 7-Day Weight Trend */}
            {weightEntries.length > 0 && (
              <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
                <Text className="text-lg font-semibold text-foreground mb-4">7-Day Weight Trend</Text>
                <SimpleLineChart
                  data={getLast7DaysWeight()}
                  height={180}
                  yAxisLabel="Weight (kg)"
                />
              </View>
            )}

            {/* Weight Entry Form */}
            <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">Log Weight</Text>

              {/* Weight */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Weight (kg)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="e.g., 70.5"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Height */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Height (cm)</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder="e.g., 175"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Goal */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Goal</Text>
                <View className="flex-row gap-2">
                  {(["lose", "maintain", "gain"] as const).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGoal(g)}
                      style={{
                        backgroundColor: goal === g ? colors.primary : colors.background,
                        borderColor: colors.border,
                        borderWidth: 1,
                      }}
                      className="flex-1 py-2 rounded-xl"
                    >
                      <Text
                        style={{
                          color: goal === g ? colors.background : colors.foreground,
                        }}
                        className="text-center capitalize"
                      >
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View className="mb-4">
                <Text className="text-sm text-muted mb-2">Notes (Optional)</Text>
                <TextInput
                  value={weightNotes}
                  onChangeText={setWeightNotes}
                  placeholder="How do you feel?"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={2}
                  style={{
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className="border rounded-xl p-3"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={saveWeightEntry}
                style={{ backgroundColor: colors.primary }}
                className="rounded-xl py-3 items-center"
              >
                <Text style={{ color: colors.background }} className="font-semibold">
                  Save Weight Entry
                </Text>
              </Pressable>
            </View>

            {/* Weight History */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-foreground">Weight History</Text>
                {!isPro && weightEntries.length > 7 && (
                  <Pressable onPress={() => router.push("/upgrade")}>
                    <Text className="text-sm text-primary font-semibold">Upgrade for Full History</Text>
                  </Pressable>
                )}
              </View>

              {getVisibleWeightEntries().length === 0 ? (
                <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                  <Text className="text-muted text-center">No weight entries yet. Start tracking!</Text>
                </View>
              ) : (
                getVisibleWeightEntries().map((entry) => (
                  <View
                    key={entry.id}
                    className="bg-surface rounded-2xl p-4 mb-3 border border-border"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View>
                        <Text className="text-sm text-muted">
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                        <Text className="text-xl font-bold text-foreground">
                          {entry.weight} kg
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-muted">BMI</Text>
                        <Text
                          style={{ color: getBMICategory(entry.bmi).color }}
                          className="text-xl font-bold"
                        >
                          {entry.bmi}
                        </Text>
                        <Text
                          style={{ color: getBMICategory(entry.bmi).color }}
                          className="text-xs"
                        >
                          {getBMICategory(entry.bmi).category}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-muted capitalize">Goal: {entry.goal} weight</Text>
                    {entry.notes && (
                      <Text className="text-sm text-muted italic mt-1">{entry.notes}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {!isPro && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Unlock Pro Features
            </Text>
            <Text className="text-sm text-muted mb-3">
              • Unlimited food & weight history{"\n"}
              • AI-powered nutrition insights{"\n"}
              • Personalized meal recommendations{"\n"}
              • Energy-based diet optimization
            </Text>
            <Pressable
              onPress={() => router.push("/upgrade")}
              style={{ backgroundColor: colors.primary }}
              className="rounded-xl py-3 items-center"
            >
              <Text style={{ color: colors.background }} className="font-semibold">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import {
  getHabits,
  addHabit,
  deleteHabit,
  getHabitLogsForDate,
  logHabit,
  analyzeHabitCorrelations,
  getDefaultHabitSuggestions,
  Habit,
  HabitLog,
  HabitInsights,
} from "@/lib/habits";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";

export default function HabitsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [insights, setInsights] = useState<HabitInsights | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Add habit form
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState<Habit["category"]>("health");
  const [newHabitIcon, setNewHabitIcon] = useState("✓");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) {
      router.replace("/onboarding/welcome" as any);
      return;
    }

    setProfile(userProfile);
    
    // Check Pro status
    const subscription = await getSubscriptionStatus();
    setIsPro(subscription.isPro);
    
    const userHabits = await getHabits();
    setHabits(userHabits);
    
    const logs = await getHabitLogsForDate(today);
    setTodayLogs(logs);
    
    // Only analyze correlations for Pro users
    if (userHabits.length > 0 && subscription.isPro) {
      const habitInsights = await analyzeHabitCorrelations(userProfile);
      setInsights(habitInsights);
    }
    
    setLoading(false);
  };

  const handleToggleHabit = async (habitId: string) => {
    const existingLog = todayLogs.find((l) => l.habitId === habitId);
    const newCompleted = !existingLog?.completed;
    
    await logHabit(habitId, today, newCompleted);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Reload logs
    const logs = await getHabitLogsForDate(today);
    setTodayLogs(logs);
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    
    await addHabit(newHabitName.trim(), newHabitCategory, newHabitIcon);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setNewHabitName("");
    setNewHabitCategory("health");
    setNewHabitIcon("✓");
    setShowAddModal(false);
    
    await loadData();
  };

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadData();
  };

  const handleAddSuggestion = async (suggestion: { name: string; category: Habit["category"]; icon: string }) => {
    await addHabit(suggestion.name, suggestion.category, suggestion.icon);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadData();
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  const suggestions = getDefaultHabitSuggestions();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Habit Tracker</Text>
              <Text className="text-sm text-muted mt-1">
                Discover which habits boost your energy
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/business')}
              className="bg-surface border border-border rounded-full p-2"
            >
              <Text className="text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Habits */}
          {habits.length > 0 ? (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-muted">TODAY'S HABITS</Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="bg-primary px-3 py-1 rounded-full"
                >
                  <Text className="text-white text-xs font-semibold">+ Add</Text>
                </TouchableOpacity>
              </View>
              
              {habits.map((habit) => {
                const log = todayLogs.find((l) => l.habitId === habit.id);
                const completed = log?.completed || false;
                
                return (
                  <View
                    key={habit.id}
                    className="flex-row items-center justify-between bg-background rounded-lg p-3 border border-border"
                  >
                    <TouchableOpacity
                      onPress={() => handleToggleHabit(habit.id)}
                      className="flex-row items-center gap-3 flex-1"
                    >
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          completed ? "bg-success border-success" : "border-border"
                        }`}
                      >
                        {completed && <Text className="text-white text-xs">✓</Text>}
                      </View>
                      <Text className="text-lg">{habit.icon}</Text>
                      <Text
                        className={`text-sm flex-1 ${
                          completed ? "text-muted line-through" : "text-foreground"
                        }`}
                      >
                        {habit.name}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteHabit(habit.id)}
                      className="p-2"
                    >
                      <Text className="text-error text-xs">✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-sm text-muted text-center mb-4">
                No habits yet. Add your first habit to start tracking!
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-center text-white font-semibold">Add First Habit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Insights Button or Upgrade Prompt */}
          {habits.length > 0 && (
            isPro ? (
              insights && insights.habits.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowInsights(!showInsights)}
                  className="bg-primary/10 border border-primary rounded-lg px-5 py-3"
                >
                  <Text className="text-center text-primary font-semibold">
                    {showInsights ? "Hide" : "View"} Energy Correlations
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/upgrade" as any)}
                className="bg-surface border border-border rounded-lg px-5 py-3"
              >
                <Text className="text-center text-muted font-semibold">
                  🔒 Upgrade to Pro for Habit-Energy Correlations
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Insights */}
          {showInsights && insights && (
            <>
              {/* Top Habits */}
              {insights.topHabits.length > 0 && (
                <View className="bg-success/10 rounded-2xl p-5 border border-success/30 gap-3">
                  <Text className="text-sm font-medium text-success">🏆 TOP ENERGY BOOSTERS</Text>
                  {insights.topHabits.map((habit, index) => (
                    <View key={habit.habitId} className="bg-background/50 rounded-lg p-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-foreground">
                          #{index + 1} {habit.habitName}
                        </Text>
                        <Text className="text-xs font-medium text-success">
                          +{habit.impactScore.toFixed(0)} energy
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">{habit.recommendation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* All Correlations */}
              <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                <Text className="text-sm font-medium text-muted">ALL HABITS</Text>
                {insights.habits.map((habit) => {
                  const impactColor =
                    habit.impact === "positive"
                      ? "text-success"
                      : habit.impact === "negative"
                      ? "text-error"
                      : "text-muted";
                  
                  return (
                    <View key={habit.habitId} className="bg-background rounded-lg p-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-foreground flex-1">
                          {habit.habitName}
                        </Text>
                        <Text className={`text-xs font-medium ${impactColor}`}>
                          {habit.impactScore > 0 ? "+" : ""}
                          {habit.impactScore.toFixed(0)}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted mb-2">{habit.recommendation}</Text>
                      <View className="flex-row gap-4">
                        <View>
                          <Text className="text-xs text-muted">When done</Text>
                          <Text className="text-sm font-semibold text-foreground">
                            {habit.averageEnergyWhenDone.toFixed(0)}%
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted">When skipped</Text>
                          <Text className="text-sm font-semibold text-foreground">
                            {habit.averageEnergyWhenSkipped.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Suggestions */}
              {insights.suggestions.length > 0 && (
                <View className="bg-primary/5 rounded-2xl p-5 border border-primary/20 gap-2">
                  <Text className="text-sm font-medium text-primary">💡 INSIGHTS</Text>
                  {insights.suggestions.map((suggestion, index) => (
                    <Text key={index} className="text-sm text-foreground leading-relaxed">
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Habit Suggestions */}
          {habits.length < 3 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-medium text-muted">SUGGESTED HABITS</Text>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAddSuggestion(suggestion)}
                  className="flex-row items-center justify-between bg-background rounded-lg p-3 border border-border"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg">{suggestion.icon}</Text>
                    <Text className="text-sm text-foreground">{suggestion.name}</Text>
                  </View>
                  <Text className="text-primary text-xs font-semibold">+ Add</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <Text className="text-xl font-bold text-foreground">Add New Habit</Text>
            
            <TextInput
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="Habit name"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            
            <View className="flex-row gap-2">
              {(["health", "productivity", "mindfulness", "social", "other"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewHabitCategory(cat)}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    newHabitCategory === cat
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xs text-center ${
                      newHabitCategory === cat ? "text-white" : "text-muted"
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setNewHabitName("");
                }}
                className="flex-1 bg-border py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-muted">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddHabit}
                disabled={!newHabitName.trim()}
                className={`flex-1 py-3 rounded-lg ${
                  newHabitName.trim() ? "bg-primary" : "bg-border"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    newHabitName.trim() ? "text-white" : "text-muted"
                  }`}
                >
                  Add Habit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

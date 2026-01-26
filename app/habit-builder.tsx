import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  createHabit,
  getHabits,
  deleteHabit,
  completeHabit,
  isCompletedToday,
  getHabitStats,
  getHabitInsights,
  HABIT_TEMPLATES,
  type Habit,
  type HabitStats,
} from "@/lib/habit-builder";

export default function HabitBuilderScreen() {
  const colors = useColors();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [habitInsights, setHabitInsights] = useState<string[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    category: "custom" as "health" | "productivity" | "mindfulness" | "social" | "custom",
    frequency: "daily" as "daily" | "weekly" | "custom",
    energyRequirement: "moderate" as "low" | "moderate" | "high",
    reminderEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allHabits = await getHabits();
    setHabits(allHabits);
    
    const habitStats = await getHabitStats();
    setStats(habitStats);

    // Check which habits are completed today
    const completed = new Set<string>();
    for (const habit of allHabits) {
      if (await isCompletedToday(habit.id)) {
        completed.add(habit.id);
      }
    }
    setCompletedToday(completed);
  };

  const handleCreateFromTemplate = async (template: typeof HABIT_TEMPLATES[0]) => {
    await createHabit(template);
    await loadData();
    setShowTemplates(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCreateCustom = async () => {
    if (!newHabit.name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    await createHabit(newHabit);
    await loadData();
    setNewHabit({
      name: "",
      description: "",
      category: "custom",
      frequency: "daily",
      energyRequirement: "moderate",
      reminderEnabled: true,
    });
    setShowCreateCustom(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCompleteHabit = async (habitId: string) => {
    await completeHabit(habitId);
    await loadData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert("Delete Habit?", `Are you sure you want to delete "${habitName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHabit(habitId);
          await loadData();
          setSelectedHabit(null);
        },
      },
    ]);
  };

  const viewHabitDetails = async (habit: Habit) => {
    setSelectedHabit(habit);
    const insights = await getHabitInsights(habit.id);
    setHabitInsights(insights);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "health":
        return "💪";
      case "productivity":
        return "⚡";
      case "mindfulness":
        return "🧘";
      case "social":
        return "👥";
      default:
        return "✨";
    }
  };

  const getEnergyColor = (requirement: string) => {
    switch (requirement) {
      case "high":
        return colors.error;
      case "moderate":
        return colors.warning;
      default:
        return colors.success;
    }
  };

  if (showTemplates) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Habit Templates
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {HABIT_TEMPLATES.map((template, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCreateFromTemplate(template)}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">{getCategoryEmoji(template.category)}</Text>
                    <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                      {template.name}
                    </Text>
                  </View>
                  {template.description && (
                    <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                      {template.description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-2">
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: getEnergyColor(template.energyRequirement) + "30" }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getEnergyColor(template.energyRequirement) }}
                      >
                        {template.energyRequirement} energy
                      </Text>
                    </View>
                    <Text className="text-xs capitalize" style={{ color: colors.muted }}>
                      {template.frequency}
                    </Text>
                    {template.optimalTime && (
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        ⏰ {template.optimalTime}
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="text-2xl" style={{ color: colors.primary }}>
                  +
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (showCreateCustom) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowCreateCustom(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Custom Habit
            </Text>
            <TouchableOpacity onPress={handleCreateCustom}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Habit Name *
          </Text>
          <TextInput
            value={newHabit.name}
            onChangeText={(text) => setNewHabit({ ...newHabit, name: text })}
            placeholder="e.g., Read for 30 minutes"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Description
          </Text>
          <TextInput
            value={newHabit.description}
            onChangeText={(text) => setNewHabit({ ...newHabit, description: text })}
            placeholder="Optional details..."
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={2}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(["health", "productivity", "mindfulness", "social", "custom"] as const).map(
              (category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => {
                    setNewHabit({ ...newHabit, category });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor:
                      newHabit.category === category ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    className="text-sm font-medium capitalize"
                    style={{
                      color: newHabit.category === category ? colors.background : colors.foreground,
                    }}
                  >
                    {getCategoryEmoji(category)} {category}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Energy Requirement
          </Text>
          <View className="flex-row gap-3 mb-6">
            {(["low", "moderate", "high"] as const).map((energy) => (
              <TouchableOpacity
                key={energy}
                onPress={() => {
                  setNewHabit({ ...newHabit, energyRequirement: energy });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor:
                    newHabit.energyRequirement === energy ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-center font-medium capitalize"
                  style={{
                    color:
                      newHabit.energyRequirement === energy ? colors.background : colors.foreground,
                  }}
                >
                  {energy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (selectedHabit) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setSelectedHabit(null)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {selectedHabit.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteHabit(selectedHabit.id, selectedHabit.name)}
            >
              <Text className="text-sm" style={{ color: colors.error }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>

          {/* Streak Display */}
          <View className="p-6 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-center text-6xl mb-2">🔥</Text>
            <Text className="text-center text-4xl font-bold mb-1" style={{ color: colors.foreground }}>
              {selectedHabit.streak}
            </Text>
            <Text className="text-center text-sm" style={{ color: colors.muted }}>
              Day Streak
            </Text>
            {selectedHabit.bestStreak > 0 && (
              <Text className="text-center text-xs mt-2" style={{ color: colors.muted }}>
                Best: {selectedHabit.bestStreak} days
              </Text>
            )}
          </View>

          {/* Insights */}
          {habitInsights.length > 0 && (
            <>
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
                Insights
              </Text>
              {habitInsights.map((insight, index) => (
                <View
                  key={index}
                  className="p-4 rounded-xl mb-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-sm" style={{ color: colors.foreground }}>
                    {insight}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Habit Details */}
          <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
            Details
          </Text>
          <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
            {selectedHabit.description && (
              <Text className="text-sm mb-3" style={{ color: colors.muted }}>
                {selectedHabit.description}
              </Text>
            )}
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-base" style={{ color: colors.foreground }}>
                {getCategoryEmoji(selectedHabit.category)}
              </Text>
              <Text className="text-sm capitalize" style={{ color: colors.foreground }}>
                {selectedHabit.category}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View
                className="px-2 py-1 rounded"
                style={{ backgroundColor: getEnergyColor(selectedHabit.energyRequirement) + "30" }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{ color: getEnergyColor(selectedHabit.energyRequirement) }}
                >
                  {selectedHabit.energyRequirement} energy
                </Text>
              </View>
              <Text className="text-xs capitalize" style={{ color: colors.muted }}>
                {selectedHabit.frequency}
              </Text>
            </View>
          </View>
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
            Habit Builder
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {stats && stats.totalHabits > 0 && (
          <>
            {/* Stats */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalHabits}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Total Habits
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.longestStreak}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Longest Streak
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.successRate}%
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Success Rate
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalCompletions}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Completions
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Habits List */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          My Habits ({habits.length})
        </Text>

        {habits.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No habits yet
            </Text>
            <Text className="text-base text-center mb-6" style={{ color: colors.muted }}>
              Start building better habits today
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const isCompleted = completedToday.has(habit.id);
            return (
              <View
                key={habit.id}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface, opacity: isCompleted ? 0.7 : 1 }}
              >
                <TouchableOpacity onPress={() => viewHabitDetails(habit)}>
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-2xl mr-2">{getCategoryEmoji(habit.category)}</Text>
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: colors.foreground }}
                        >
                          {habit.name}
                        </Text>
                      </View>
                      {habit.streak > 0 && (
                        <Text className="text-sm mb-2" style={{ color: colors.primary }}>
                          🔥 {habit.streak} day streak
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCompleteHabit(habit.id)}
                  disabled={isCompleted}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: isCompleted ? colors.success : colors.primary,
                  }}
                >
                  <Text
                    className="text-center font-semibold"
                    style={{ color: colors.background }}
                  >
                    {isCompleted ? "✓ Completed Today" : "Mark Complete"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => setShowTemplates(true)}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.background }}
            >
              📋 Templates
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCreateCustom(true)}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.success }}
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.background }}
            >
              + Custom
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

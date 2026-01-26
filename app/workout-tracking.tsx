import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import {
  saveWorkout,
  getWorkouts,
  deleteWorkout,
  calculateWorkoutInsights,
  type Workout,
  type WorkoutType,
  type WorkoutInsights,
} from "@/lib/workout-tracking";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { syncFitnessToCalendar } from "@/lib/calendar-sync-helper";

const WORKOUT_TYPES: Array<{ value: WorkoutType; label: string; icon: string }> = [
  { value: "cardio", label: "Cardio", icon: "❤️" },
  { value: "strength", label: "Strength", icon: "💪" },
  { value: "yoga", label: "Yoga", icon: "🧘" },
  { value: "pilates", label: "Pilates", icon: "🤸" },
  { value: "hiit", label: "HIIT", icon: "🔥" },
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "running", label: "Running", icon: "🏃" },
  { value: "cycling", label: "Cycling", icon: "🚴" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "other", label: "Other", icon: "🎯" },
];

export default function WorkoutTrackingScreen() {
  const colors = useColors();
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('fitness');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [insights, setInsights] = useState<WorkoutInsights | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [selectedType, setSelectedType] = useState<WorkoutType>("cardio");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const workoutData = await getWorkouts();
    setWorkouts(workoutData);
    
    // Mock energy data for insights calculation
    const energyData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      score: 60 + Math.random() * 40,
    }));
    
    const insightsData = await calculateWorkoutInsights(energyData);
    setInsights(insightsData);
  };

  const handleAddWorkout = async () => {
    if (!duration || parseInt(duration) <= 0) {
      Alert.alert("Error", "Please enter a valid duration");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const workout = {
      type: selectedType,
      duration: parseInt(duration),
      intensity,
      timestamp: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };
    
    await saveWorkout(workout);
    
    // Sync to calendar
    await syncFitnessToCalendar(
      selectedType,
      new Date(),
      parseInt(duration),
      intensity,
      workout.notes
    );

    setShowAddForm(false);
    setDuration("");
    setNotes("");
    loadData();
  };

  const handleDeleteWorkout = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteWorkout(id);
    loadData();
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Workout Tracking
          </Text>
          <Text className="text-base text-muted">
            Log exercises and see how they affect your energy
          </Text>
        </View>

        {/* AI-Powered Insights (Pro Feature) */}
        <AIInsightsCard
          feature="Fitness & Workouts"
          insights={aiInsights}
          loading={aiLoading}
          error={aiError || undefined}
          icon="💪"
        />

        {/* Add Workout Button */}
        {!showAddForm && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddForm(true);
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="rounded-xl p-4 mb-6"
          >
            <Text className="text-background text-center font-semibold text-base">
              + Log Workout
            </Text>
          </Pressable>
        )}

        {/* Add Workout Form */}
        {showAddForm && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              New Workout
            </Text>

            {/* Workout Type Selection */}
            <Text className="text-sm font-medium text-muted mb-2">Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {WORKOUT_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedType(type.value);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        selectedType === type.value ? colors.primary : colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="px-3 py-2 rounded-lg border border-border"
                >
                  <Text
                    style={{
                      color: selectedType === type.value ? colors.background : colors.foreground,
                    }}
                    className="text-sm"
                  >
                    {type.icon} {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Duration */}
            <Text className="text-sm font-medium text-muted mb-2">Duration (minutes)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="30"
              placeholderTextColor={colors.muted}
              style={{ color: colors.foreground, backgroundColor: colors.background }}
              className="border border-border rounded-lg px-4 py-3 mb-4"
            />

            {/* Intensity */}
            <Text className="text-sm font-medium text-muted mb-2">Intensity</Text>
            <View className="flex-row gap-2 mb-4">
              {(["low", "moderate", "high"] as const).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIntensity(level);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        intensity === level ? colors.primary : colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="flex-1 py-3 rounded-lg border border-border"
                >
                  <Text
                    style={{
                      color: intensity === level ? colors.background : colors.foreground,
                    }}
                    className="text-center text-sm font-medium capitalize"
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Notes */}
            <Text className="text-sm font-medium text-muted mb-2">Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How did you feel?"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{ color: colors.foreground, backgroundColor: colors.background }}
              className="border border-border rounded-lg px-4 py-3 mb-4"
            />

            {/* Action Buttons */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAddForm(false);
                  setDuration("");
                  setNotes("");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg border border-border"
              >
                <Text className="text-foreground text-center font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddWorkout}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg"
              >
                <Text className="text-background text-center font-semibold">Save</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Insights */}
        {insights && insights.totalWorkouts > 0 && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Workout Insights
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Workouts</Text>
                <Text className="text-foreground font-semibold">
                  {insights.totalWorkouts}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Total Minutes</Text>
                <Text className="text-foreground font-semibold">
                  {insights.totalMinutes}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Favorite Type</Text>
                <Text className="text-foreground font-semibold capitalize">
                  {insights.favoriteType}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Optimal Timing</Text>
                <Text className="text-foreground font-semibold capitalize">
                  {insights.optimalTiming}
                </Text>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-border">
              <Text className="text-sm font-medium text-foreground mb-2">
                Energy Recovery Pattern
              </Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Immediate (0-2h)</Text>
                  <Text
                    style={{
                      color:
                        insights.energyRecoveryPattern.immediate > 0
                          ? colors.success
                          : colors.error,
                    }}
                    className="font-semibold text-sm"
                  >
                    {insights.energyRecoveryPattern.immediate > 0 ? "+" : ""}
                    {insights.energyRecoveryPattern.immediate.toFixed(1)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Short-term (2-6h)</Text>
                  <Text
                    style={{
                      color:
                        insights.energyRecoveryPattern.shortTerm > 0
                          ? colors.success
                          : colors.error,
                    }}
                    className="font-semibold text-sm"
                  >
                    {insights.energyRecoveryPattern.shortTerm > 0 ? "+" : ""}
                    {insights.energyRecoveryPattern.shortTerm.toFixed(1)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted text-sm">Next Day</Text>
                  <Text
                    style={{
                      color:
                        insights.energyRecoveryPattern.nextDay > 0
                          ? colors.success
                          : colors.error,
                    }}
                    className="font-semibold text-sm"
                  >
                    {insights.energyRecoveryPattern.nextDay > 0 ? "+" : ""}
                    {insights.energyRecoveryPattern.nextDay.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {insights.recommendations.length > 0 && (
              <View className="mt-4 pt-4 border-t border-border">
                <Text className="text-sm font-medium text-foreground mb-2">
                  Recommendations
                </Text>
                {insights.recommendations.map((rec, index) => (
                  <Text key={index} className="text-muted text-sm mb-1">
                    • {rec}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Recent Workouts */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Recent Workouts
          </Text>
          {workouts.length === 0 ? (
            <Text className="text-muted text-center py-8">
              No workouts logged yet. Start tracking!
            </Text>
          ) : (
            <View className="gap-3">
              {workouts.slice(0, 10).map((workout) => {
                const typeInfo = WORKOUT_TYPES.find((t) => t.value === workout.type);
                const date = new Date(workout.timestamp);
                
                return (
                  <View
                    key={workout.id}
                    className="bg-surface rounded-xl p-4 border border-border"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-2xl">{typeInfo?.icon}</Text>
                        <View>
                          <Text className="text-foreground font-semibold">
                            {typeInfo?.label}
                          </Text>
                          <Text className="text-muted text-sm">
                            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteWorkout(workout.id)}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                      >
                        <Text className="text-error text-sm">Delete</Text>
                      </Pressable>
                    </View>
                    <View className="flex-row gap-4">
                      <Text className="text-muted text-sm">
                        {workout.duration} min
                      </Text>
                      <Text className="text-muted text-sm capitalize">
                        {workout.intensity} intensity
                      </Text>
                    </View>
                    {workout.notes && (
                      <Text className="text-muted text-sm mt-2">{workout.notes}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

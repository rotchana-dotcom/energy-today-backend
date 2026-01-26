import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import {
  saveGoal,
  getGoalsForMonth,
  completeGoal,
  deleteGoal,
  analyzeGoals,
  Goal,
  GoalAnalysis,
} from "@/lib/goals";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";

const CATEGORIES = [
  { id: "business", label: "Business", emoji: "💼" },
  { id: "personal", label: "Personal", emoji: "🎯" },
  { id: "health", label: "Health", emoji: "💪" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "relationships", label: "Relationships", emoji: "❤️" },
] as const;

export default function GoalsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analysis, setAnalysis] = useState<GoalAnalysis | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("business");
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

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
    const monthGoals = await getGoalsForMonth(currentMonth);
    const goalAnalysis = await analyzeGoals(currentMonth);
    
    setGoals(monthGoals);
    setAnalysis(goalAnalysis);
    setLoading(false);
  };

  const handleAddGoal = async () => {
    if (!title.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      targetMonth: currentMonth,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await saveGoal(newGoal);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setTitle("");
    setDescription("");
    setShowAddForm(false);
    await loadData();
  };

  const handleCompleteGoal = async (goalId: string) => {
    if (!profile) return;
    
    await completeGoal(goalId, profile);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadData();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(goalId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
  };

  if (loading || !analysis) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Monthly Goals</Text>
              <Text className="text-sm text-muted mt-1">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/business')}
              className="bg-surface border border-border rounded-full p-2"
            >
              <Text className="text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Overview */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-muted">PROGRESS</Text>
              <Text className="text-2xl font-bold text-primary">
                {analysis.completionRate.toFixed(0)}%
              </Text>
            </View>
            
            <View className="flex-row gap-2">
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted">Total</Text>
                <Text className="text-xl font-bold text-foreground">{analysis.totalGoals}</Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted">Done</Text>
                <Text className="text-xl font-bold text-success">{analysis.completedGoals}</Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted">Pending</Text>
                <Text className="text-xl font-bold text-warning">
                  {analysis.totalGoals - analysis.completedGoals}
                </Text>
              </View>
            </View>

            {/* Energy Pattern */}
            {analysis.completedGoals > 0 && (
              <View className="pt-4 border-t border-border">
                <Text className="text-xs font-medium text-muted mb-2">COMPLETED ON</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-success/10 rounded-lg p-2">
                    <Text className="text-xs text-muted">🟢 Strong</Text>
                    <Text className="text-lg font-bold text-success">
                      {analysis.strongDayCompletions}
                    </Text>
                  </View>
                  <View className="flex-1 bg-warning/10 rounded-lg p-2">
                    <Text className="text-xs text-muted">🟡 Moderate</Text>
                    <Text className="text-lg font-bold text-warning">
                      {analysis.moderateDayCompletions}
                    </Text>
                  </View>
                  <View className="flex-1 bg-error/10 rounded-lg p-2">
                    <Text className="text-xs text-muted">🔴 Challenging</Text>
                    <Text className="text-lg font-bold text-error">
                      {analysis.challengingDayCompletions}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <View className="bg-primary/5 rounded-2xl p-5 border border-primary/20 gap-3">
              <Text className="text-sm font-medium text-primary">INSIGHTS</Text>
              {analysis.insights.map((insight, index) => (
                <View key={index} className="flex-row gap-2">
                  <Text className="text-primary">•</Text>
                  <Text className="flex-1 text-sm text-foreground leading-relaxed">{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-medium text-muted">RECOMMENDATIONS</Text>
              {analysis.recommendations.map((rec, index) => (
                <View key={index} className="flex-row gap-2">
                  <Text className="text-primary">💡</Text>
                  <Text className="flex-1 text-sm text-foreground leading-relaxed">{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Add Goal Button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => {
                setShowAddForm(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="bg-primary px-6 py-4 rounded-full flex-row items-center justify-center gap-2"
            >
              <Text className="text-lg">+</Text>
              <Text className="text-white font-semibold">Add New Goal</Text>
            </TouchableOpacity>
          )}

          {/* Add Goal Form */}
          {showAddForm && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <Text className="text-sm font-medium text-muted">NEW GOAL</Text>
              
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Goal title (e.g., Launch new product)"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
              
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor="#9BA1A6"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground min-h-[80px]"
              />
              
              {/* Category Selector */}
              <View className="gap-2">
                <Text className="text-xs font-medium text-muted">CATEGORY</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      className={`px-4 py-2 rounded-full border ${
                        category === cat.id
                          ? "bg-primary/20 border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text className="text-sm">
                        {cat.emoji} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setTitle("");
                    setDescription("");
                  }}
                  className="flex-1 bg-border py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-muted">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddGoal}
                  disabled={!title.trim()}
                  className={`flex-1 py-3 rounded-lg ${
                    title.trim() ? "bg-primary" : "bg-border"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      title.trim() ? "text-white" : "text-muted"
                    }`}
                  >
                    Add Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Goals List */}
          {goals.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-medium text-muted">THIS MONTH'S GOALS</Text>
              {goals.map((goal) => {
                const categoryInfo = CATEGORIES.find((c) => c.id === goal.category);
                return (
                  <View
                    key={goal.id}
                    className={`bg-surface rounded-2xl p-4 border ${
                      goal.completed ? "border-success/30 bg-success/5" : "border-border"
                    }`}
                  >
                    <View className="flex-row items-start gap-3">
                      <TouchableOpacity
                        onPress={() => {
                          if (!goal.completed) {
                            handleCompleteGoal(goal.id);
                          }
                        }}
                        disabled={goal.completed}
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          goal.completed
                            ? "bg-success border-success"
                            : "bg-background border-border"
                        }`}
                      >
                        {goal.completed && <Text className="text-white text-xs">✓</Text>}
                      </TouchableOpacity>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-base">{categoryInfo?.emoji}</Text>
                          <Text
                            className={`flex-1 text-base font-semibold ${
                              goal.completed ? "text-muted line-through" : "text-foreground"
                            }`}
                          >
                            {goal.title}
                          </Text>
                        </View>
                        
                        {goal.description && (
                          <Text className="text-sm text-muted mb-2">{goal.description}</Text>
                        )}
                        
                        {goal.completed && goal.completedOnEnergyLevel && (
                          <View className="flex-row items-center gap-2 mt-2">
                            <Text className="text-xs text-muted">Completed on</Text>
                            <View
                              className={`px-2 py-1 rounded-full ${
                                goal.completedOnEnergyLevel === "strong"
                                  ? "bg-success/20"
                                  : goal.completedOnEnergyLevel === "moderate"
                                  ? "bg-warning/20"
                                  : "bg-error/20"
                              }`}
                            >
                              <Text className="text-xs">
                                {goal.completedOnEnergyLevel === "strong"
                                  ? "🟢 Strong"
                                  : goal.completedOnEnergyLevel === "moderate"
                                  ? "🟡 Moderate"
                                  : "🔴 Challenging"}{" "}
                                day
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => handleDeleteGoal(goal.id)}
                        className="bg-error/10 rounded-full p-2"
                      >
                        <Text className="text-xs">🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {goals.length === 0 && !showAddForm && (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-sm text-muted text-center">
                No goals yet. Add your first goal to start tracking your progress and energy patterns.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

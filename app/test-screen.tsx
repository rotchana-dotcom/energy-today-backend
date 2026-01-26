import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { loadMockData, clearAllData } from "@/lib/mock-data-generator";

export default function TestScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  async function handleLoadMockData() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    const result = await loadMockData();
    setLoading(false);

    if (result.success) {
      Alert.alert("✅ Mock Data Loaded", result.message, [
        {
          text: "View AI Calculations",
          onPress: () => router.push("/ai-calculation-display"),
        },
        { text: "OK" },
      ]);
    } else {
      Alert.alert("❌ Error", result.message);
    }
  }

  async function handleClearData() {
    Alert.alert(
      "⚠️ Clear All Data",
      "This will delete all user data, logs, and settings. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setLoading(true);
            const result = await clearAllData();
            setLoading(false);

            if (result.success) {
              Alert.alert("✅ Data Cleared", result.message);
            } else {
              Alert.alert("❌ Error", result.message);
            }
          },
        },
      ]
    );
  }

  const testFeatures = [
    {
      title: "Sleep Tracker",
      icon: "😴",
      description: "7 days of sleep logs with varying quality",
      route: "/health/sleep",
    },
    {
      title: "Meditation Timer",
      icon: "🧘",
      description: "5 meditation sessions (5-30 min each)",
      route: "/health/meditation",
    },
    {
      title: "Diet & Weight",
      icon: "🍎",
      description: "14 meal entries (breakfast, lunch, dinner)",
      route: "/health/diet",
    },
    {
      title: "Chi & Energy Flow",
      icon: "⚡",
      description: "7 days of energy tracking with chakra data",
      route: "/health/chi",
    },
    {
      title: "Fitness & Workouts",
      icon: "💪",
      description: "5 workouts (cardio, strength, yoga, HIIT, swimming)",
      route: "/fitness",
    },
    {
      title: "Task Scheduler",
      icon: "📋",
      description: "10 tasks across categories (meetings, creative, admin)",
      route: "/task-scheduler",
    },
    {
      title: "Journal",
      icon: "📔",
      description: "5 journal entries with moods and reflections",
      route: "/journal",
    },
    {
      title: "Analytics Dashboard",
      icon: "📊",
      description: "View patterns and AI insights from all data",
      route: "/analytics",
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.foreground }}>
            🧪 Test Screen
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            Load mock data and test all features with realistic sample data
          </Text>
        </View>

        {/* Mock Data Section */}
        <View className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Mock Data Controls
          </Text>

          {/* Load Mock Data Button */}
          <TouchableOpacity
            onPress={handleLoadMockData}
            disabled={loading}
            className="mb-3 px-6 py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-semibold mb-1" style={{ color: colors.background }}>
              {loading ? "Loading..." : "📥 Load Mock Data"}
            </Text>
            <Text className="text-xs text-center" style={{ color: colors.background, opacity: 0.8 }}>
              Populate all features with test data
            </Text>
          </TouchableOpacity>

          {/* View AI Calculations Button */}
          <TouchableOpacity
            onPress={() => router.push("/ai-calculation-display")}
            className="mb-3 px-6 py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-semibold mb-1" style={{ color: colors.background }}>
              🧠 View AI Calculations
            </Text>
            <Text className="text-xs text-center" style={{ color: colors.background, opacity: 0.8 }}>
              See how 7 spiritual systems combine with user data
            </Text>
          </TouchableOpacity>

          {/* Clear Data Button */}
          <TouchableOpacity
            onPress={handleClearData}
            disabled={loading}
            className="px-6 py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.error }}
          >
            <Text className="text-base font-semibold mb-1" style={{ color: colors.background }}>
              {loading ? "Clearing..." : "🗑️ Clear All Data"}
            </Text>
            <Text className="text-xs text-center" style={{ color: colors.background, opacity: 0.8 }}>
              Delete all user data and logs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mock Data Details */}
        <View className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            📦 What's Included in Mock Data
          </Text>
          <View className="gap-2">
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">👤 User Profile:</Text> Sarah Chen, born June 15, 1990 at 2:30 PM in
              Bangkok
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">😴 Sleep:</Text> 7 days of logs (6-9 hours, varying quality)
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">🧘 Meditation:</Text> 5 sessions (5-30 minutes each)
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">🍎 Diet:</Text> 14 meal entries (breakfast, lunch with calories)
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">⚡ Chi/Energy:</Text> 7 days of energy tracking with chakra data
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">💪 Workouts:</Text> 5 sessions (cardio, strength, yoga, HIIT, swimming)
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">📋 Tasks:</Text> 10 tasks across categories (some completed)
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">📔 Journal:</Text> 5 entries with moods and reflections
            </Text>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              <Text className="font-semibold">⚖️ Weight:</Text> 7 days of weight tracking (~65 kg)
            </Text>
          </View>
        </View>

        {/* Test Features Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            🎯 Test All Features
          </Text>
          <Text className="text-sm mb-4" style={{ color: colors.muted }}>
            After loading mock data, test each feature to see AI insights in action
          </Text>

          {testFeatures.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(feature.route as any);
              }}
              className="mb-3 p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">{feature.icon}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                    {feature.title}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {feature.description}
                  </Text>
                </View>
                <Text className="text-xl" style={{ color: colors.muted }}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View className="mb-8 p-4 rounded-xl" style={{ backgroundColor: colors.primary + "20" }}>
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
            📖 Testing Instructions
          </Text>
          <Text className="text-xs mb-1" style={{ color: colors.foreground }}>
            1. Tap "Load Mock Data" to populate all features with test data
          </Text>
          <Text className="text-xs mb-1" style={{ color: colors.foreground }}>
            2. Tap "View AI Calculations" to see how 7 spiritual systems work
          </Text>
          <Text className="text-xs mb-1" style={{ color: colors.foreground }}>
            3. Test each feature above to verify AI insights appear correctly
          </Text>
          <Text className="text-xs mb-1" style={{ color: colors.foreground }}>
            4. Check that lunar context appears in AI recommendations
          </Text>
          <Text className="text-xs" style={{ color: colors.foreground }}>
            5. Use "Clear All Data" when done testing to reset
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 px-6 py-3 rounded-xl items-center"
          style={{ backgroundColor: colors.border }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
            Back to Settings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

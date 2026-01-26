import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { generateTodayInsights } from "@/app/services/ai-interpretation-layer";
import { getUserProfile } from "@/lib/storage";
import { getPersonalizedAdjustments } from "@/app/services/correlation-engine";

export default function InsightsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [adjustments, setAdjustments] = useState<any[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const profile = await getUserProfile();
      if (!profile) {
        setLoading(false);
        return;
      }

      const result = await generateTodayInsights(new Date(), profile);
      setInsights(result);

      const personalAdjustments = await getPersonalizedAdjustments(new Date());
      setAdjustments(personalAdjustments);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullDashboard = () => {
    router.push("/ai-insights-dashboard" as any);
  };

  if (loading) {
    return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-muted">Loading your insights...</Text>
      </ScreenContainer>
    );
  }

  if (!insights) {
    return (
      <ScreenContainer className="bg-background items-center justify-center px-6">
        <Text className="text-2xl mb-2">🧠</Text>
        <Text className="text-xl font-bold text-foreground mb-2 text-center">
          No Profile Yet
        </Text>
        <Text className="text-muted text-center">
          Complete your profile to unlock AI-powered insights
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/settings" as any)}
          className="mt-6 px-6 py-3 bg-primary rounded-full"
        >
          <Text className="text-background font-semibold">Set Up Profile</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-bold text-foreground">AI Insights</Text>
          <Text className="text-base text-muted mt-1">
            Your personal advantage
          </Text>
        </View>

        {/* Personality Profile */}
        {insights.personalityProfile && (
          <View className="mx-6 mb-4 p-5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/30">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">{insights.personalityProfile.icon}</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">
                  Life Path {insights.personalityProfile.lifePathNumber}
                </Text>
                <Text className="text-sm text-muted">
                  {insights.personalityProfile.type}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-foreground leading-relaxed">
              {insights.personalityProfile.description}
            </Text>
          </View>
        )}

        {/* What Affects Your Success */}
        {adjustments.length > 0 && (
          <View className="mx-6 mb-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              What Affects YOUR Success
            </Text>
            <View className="bg-surface rounded-2xl p-4">
              {adjustments.slice(0, 5).map((adj, index) => (
                <View
                  key={index}
                  className="flex-row items-center py-2"
                  style={{
                    borderBottomWidth: index < 4 ? 0.5 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground capitalize">
                      {adj.factor}
                    </Text>
                    <Text className="text-sm text-muted">
                      {adj.correlation > 0 ? "Increases" : "Decreases"} your energy
                    </Text>
                  </View>
                  <Text
                    className="text-lg font-bold"
                    style={{
                      color: adj.adjustment > 0 ? colors.success : colors.error,
                    }}
                  >
                    {adj.adjustment > 0 ? "+" : ""}{adj.adjustment}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Success Prediction */}
        {insights.successPrediction && (
          <View className="mx-6 mb-4 p-5 bg-success/10 rounded-2xl border border-success/30">
            <Text className="text-lg font-bold text-foreground mb-2">
              Success Prediction
            </Text>
            <Text className="text-3xl font-bold mb-2" style={{ color: colors.success }}>
              {insights.successPrediction.rate}%
            </Text>
            <Text className="text-sm text-muted">
              {insights.successPrediction.explanation}
            </Text>
          </View>
        )}

        {/* Top Patterns */}
        {insights.topPatterns && insights.topPatterns.length > 0 && (
          <View className="mx-6 mb-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              Your Success Patterns
            </Text>
            {insights.topPatterns.slice(0, 3).map((pattern: any, index: number) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">{pattern.icon || "📊"}</Text>
                  <Text className="flex-1 text-base font-semibold text-foreground">
                    {pattern.title}
                  </Text>
                  <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                    {pattern.successRate}%
                  </Text>
                </View>
                <Text className="text-sm text-muted">
                  {pattern.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* View Full Dashboard Button */}
        <View className="mx-6 mt-2">
          <TouchableOpacity
            onPress={handleViewFullDashboard}
            className="bg-primary rounded-2xl p-4 items-center active:opacity-80"
          >
            <Text className="text-background font-semibold text-base">
              View Full AI Dashboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View className="mx-6 mt-4 p-4 bg-primary/10 rounded-2xl">
          <Text className="text-sm font-semibold text-foreground mb-1">
            💡 AI Learning Tip
          </Text>
          <Text className="text-sm text-muted">
            The more you track (sleep, meals, outcomes), the more accurate these insights become. Your AI gets smarter every day.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { generateWeeklyCoaching, WeeklyCoaching } from "@/lib/coaching";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";

export default function CoachingScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coaching, setCoaching] = useState<WeeklyCoaching | null>(null);
  const [isPro, setIsPro] = useState(false);

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
    
    if (subscription.isPro) {
      // Generate coaching for Pro users
      const weeklyCoaching = await generateWeeklyCoaching(userProfile);
      setCoaching(weeklyCoaching);
    }
    
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-primary";
      default:
        return "text-muted";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-error/10 border-error/30";
      case "medium":
        return "bg-warning/10 border-warning/30";
      case "low":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-surface border-border";
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!isPro) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center gap-6">
          <Text className="text-4xl">🎯</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            Energy Coaching
          </Text>
          <Text className="text-base text-muted text-center px-4">
            Get personalized weekly coaching recommendations based on your energy patterns and goals.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/upgrade" as any)}
            className="bg-primary px-8 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-semibold text-lg">Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!coaching) {
    return (
      <ScreenContainer className="p-6">
        <Text className="text-center text-muted">Unable to generate coaching insights</Text>
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
              <Text className="text-2xl font-bold text-foreground">Energy Coach</Text>
              <Text className="text-sm text-muted mt-1">
                Personalized insights for {profile?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/business')}
              className="bg-surface border border-border rounded-full p-2"
            >
              <Text className="text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Overall Score */}
          <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
            <Text className="text-sm font-medium text-primary mb-3">WEEKLY PERFORMANCE</Text>
            <View className="flex-row items-end gap-3">
              <Text className="text-6xl font-bold text-foreground">{coaching.overallScore}</Text>
              <Text className="text-2xl text-muted mb-2">/100</Text>
            </View>
            <View className="mt-4 bg-border h-2 rounded-full overflow-hidden">
              <View
                className="bg-primary h-full"
                style={{ width: `${coaching.overallScore}%` }}
              />
            </View>
          </View>

          {/* Weekly Focus */}
          <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-2xl">🎯</Text>
              <Text className="text-sm font-medium text-success">THIS WEEK'S FOCUS</Text>
            </View>
            <Text className="text-base text-foreground leading-relaxed">
              {coaching.weeklyFocus}
            </Text>
          </View>

          {/* Strengths */}
          {coaching.strengths.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">💪</Text>
                <Text className="text-sm font-medium text-muted">YOUR STRENGTHS</Text>
              </View>
              {coaching.strengths.map((strength, index) => (
                <View key={index} className="flex-row gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="flex-1 text-sm text-foreground leading-relaxed">
                    {strength}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Opportunities */}
          {coaching.opportunities.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🚀</Text>
                <Text className="text-sm font-medium text-muted">GROWTH OPPORTUNITIES</Text>
              </View>
              {coaching.opportunities.map((opportunity, index) => (
                <View key={index} className="flex-row gap-2">
                  <Text className="text-primary">→</Text>
                  <Text className="flex-1 text-sm text-foreground leading-relaxed">
                    {opportunity}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Insights */}
          {coaching.insights.length > 0 && (
            <View className="gap-4">
              <Text className="text-sm font-medium text-muted">PERSONALIZED INSIGHTS</Text>
              {coaching.insights.map((insight, index) => (
                <View
                  key={index}
                  className={`rounded-2xl p-5 border ${getPriorityBg(insight.priority)}`}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-base font-semibold text-foreground flex-1">
                      {insight.title}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        insight.priority === "high"
                          ? "bg-error/20"
                          : insight.priority === "medium"
                          ? "bg-warning/20"
                          : "bg-primary/20"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-sm text-muted mb-3 leading-relaxed">
                    {insight.insight}
                  </Text>
                  
                  {insight.actionable && (
                    <View className="bg-background/50 rounded-lg p-3 border border-border/50">
                      <Text className="text-xs font-medium text-primary mb-1">
                        💡 RECOMMENDATION
                      </Text>
                      <Text className="text-sm text-foreground leading-relaxed">
                        {insight.recommendation}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Refresh Button */}
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setLoading(true);
              await loadData();
            }}
            className="bg-primary px-6 py-4 rounded-full"
          >
            <Text className="text-center text-white font-semibold">Refresh Insights</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

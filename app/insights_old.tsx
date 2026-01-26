import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile, getSubscriptionStatus, getJournalEntries } from "@/lib/storage";
import { analyzePatterns, PatternAnalysis } from "@/lib/pattern-insights";
import { exportInsightsPDF } from "@/lib/pdf-export";
import { UserProfile } from "@/types";

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    const subscription = await getSubscriptionStatus();
    
    if (!userProfile) {
      router.replace("/onboarding/welcome" as any);
      return;
    }

    setProfile(userProfile);
    setIsPro(subscription.isPro);

    if (subscription.isPro) {
      const entries = await getJournalEntries();
      const patternAnalysis = analyzePatterns(entries, userProfile);
      setAnalysis(patternAnalysis);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  if (!isPro) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center gap-6">
            <View className="items-center gap-3">
              <Text className="text-4xl">🔒</Text>
              <Text className="text-2xl font-bold text-foreground text-center">
                Pattern Insights
              </Text>
              <Text className="text-base text-muted text-center max-w-sm leading-relaxed">
                Discover how your moods and experiences correlate with your energy patterns. Available with Pro.
              </Text>
            </View>

            <View className="bg-surface rounded-2xl p-5 border border-border gap-3 w-full max-w-sm">
              <Text className="text-sm font-semibold text-foreground">Pro Features:</Text>
              <Text className="text-sm text-muted leading-relaxed">
                • Mood-energy correlation analysis{"\n"}
                • Weekly rhythm patterns{"\n"}
                • Cycle tracking insights{"\n"}
                • Personalized recommendations{"\n"}
                • Stress pattern identification
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/settings" as any)}
              className="bg-primary px-8 py-4 rounded-full active:opacity-80"
            >
              <Text className="text-white font-semibold text-lg">
                Upgrade to Pro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
              <Text className="text-sm text-muted">Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
              <Text className="text-2xl font-bold text-foreground">Pattern Insights</Text>
              <Text className="text-sm text-muted mt-1">
                Based on {analysis?.totalEntries || 0} journal entries
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {analysis && profile && (
                <TouchableOpacity
                  onPress={() => exportInsightsPDF(profile, analysis)}
                  className="bg-primary px-3 py-2 rounded-lg active:opacity-80"
                >
                  <Text className="text-white font-medium text-xs">Export</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
                <Text className="text-xl text-foreground">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pro Badge */}
          <View className="bg-primary/10 rounded-lg p-3 border border-primary">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-medium text-primary">PRO FEATURE</Text>
              <Text className="text-xs text-muted">
                • Last updated: {new Date(analysis?.analysisDate || "").toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Insights */}
          {analysis && analysis.insights.length > 0 ? (
            analysis.insights.map((insight) => (
              <View
                key={insight.id}
                className="bg-surface rounded-2xl p-5 border border-border gap-3"
              >
                {/* Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {insight.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-primary/20 px-2 py-1 rounded">
                        <Text className="text-xs font-medium text-primary capitalize">
                          {insight.category}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">
                        {insight.confidence}% confidence
                      </Text>
                    </View>
                  </View>
                  <Text className="text-2xl">
                    {insight.category === "mood" ? "😊" :
                     insight.category === "energy" ? "⚡" :
                     insight.category === "timing" ? "⏰" : "🌸"}
                  </Text>
                </View>

                {/* Description */}
                <Text className="text-sm text-foreground leading-relaxed">
                  {insight.description}
                </Text>

                {/* Actionable Advice */}
                <View className="bg-success/10 rounded-lg p-3 border border-success/30">
                  <Text className="text-xs font-medium text-success mb-1">
                    ACTIONABLE INSIGHT
                  </Text>
                  <Text className="text-sm text-foreground leading-relaxed">
                    {insight.actionable}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <Text className="text-base text-muted text-center">
                Keep logging your daily experiences to unlock personalized insights!
              </Text>
            </View>
          )}

          {/* CTA to Log */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/log" as any)}
            className="bg-primary/10 border border-primary rounded-lg px-6 py-4 flex-row items-center justify-between"
          >
            <Text className="text-sm font-medium text-primary">
              Add Today's Entry
            </Text>
            <Text className="text-primary">→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

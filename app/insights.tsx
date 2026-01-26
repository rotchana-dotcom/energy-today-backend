import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { analyzePatterns, getRecognizedPatterns, PatternInsight, RecognizedPattern } from "@/lib/pattern-recognition";
import { getSubscriptionStatus } from "@/lib/subscription-status";

export default function InsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [insights, setInsights] = useState<PatternInsight | null>(null);
  const [patterns, setPatterns] = useState<RecognizedPattern[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const profile = await getUserProfile();
    if (!profile) {
      router.replace("/onboarding/welcome");
      return;
    }

    // Check subscription
    const subStatus = await getSubscriptionStatus();
    setIsPro(subStatus.isPro);

    // Load existing patterns
    const existingPatterns = await getRecognizedPatterns();
    setPatterns(existingPatterns);

    setLoading(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzePatterns();
    if (result) {
      setInsights(result);
      setPatterns(result.successPatterns);
    }
    setAnalyzing(false);
  };

  const getImpactColor = (impact: string): string => {
    if (impact === "high") return "#22C55E";
    if (impact === "medium") return "#F59E0B";
    return "#6B7280";
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 80) return "Very High";
    if (confidence >= 60) return "High";
    if (confidence >= 40) return "Moderate";
    return "Low";
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Personal Insights</Text>
            <Text className="text-sm text-muted mt-1">
              Patterns discovered from your energy history
            </Text>
          </View>

          {/* Pro Upgrade Prompt */}
          {!isPro && (
            <TouchableOpacity
              onPress={() => router.push("/upgrade" as any)}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 border border-primary/20"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">Unlock Pattern Recognition</Text>
                  <Text className="text-sm text-white/80 mt-1">
                    Discover your personal success patterns with AI analysis
                  </Text>
                </View>
                <Text className="text-2xl">🧠</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Analyze Button */}
          {isPro && (
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={analyzing}
              className="bg-primary rounded-2xl p-4 border border-primary/20"
            >
              <View className="flex-row items-center justify-center gap-2">
                {analyzing ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">Analyzing Patterns...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-xl">🔍</Text>
                    <Text className="text-base font-bold text-white">Analyze My Patterns</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Insights Summary */}
          {isPro && insights && (
            <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm gap-4">
              <Text className="text-lg font-bold text-foreground">Your Success Profile</Text>
              
              {/* Best Day */}
              <View className="p-4 bg-success/10 border border-success/20 rounded-xl">
                <Text className="text-xs font-bold text-success uppercase tracking-wide mb-2">
                  Power Day
                </Text>
                <Text className="text-2xl font-bold text-foreground mb-1">
                  {insights.bestDayOfWeek.day}s
                </Text>
                <Text className="text-sm text-muted">
                  Average score: {insights.bestDayOfWeek.score}
                </Text>
                <View className="mt-2 gap-1">
                  {insights.bestDayOfWeek.activities.map((activity, i) => (
                    <Text key={i} className="text-xs text-foreground">
                      • {activity}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Best Time */}
              <View className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                  Peak Window
                </Text>
                <Text className="text-2xl font-bold text-foreground mb-1">
                  {insights.bestTimeOfDay.window}
                </Text>
                <View className="mt-2 gap-1">
                  {insights.bestTimeOfDay.activities.map((activity, i) => (
                    <Text key={i} className="text-xs text-foreground">
                      • {activity}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Lunar Pattern */}
              <View className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <Text className="text-xs font-bold text-warning uppercase tracking-wide mb-2">
                  Lunar Influence
                </Text>
                <Text className="text-lg font-bold text-foreground mb-1">
                  {insights.lunarPattern.phase.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </Text>
                <Text className="text-sm text-muted">
                  {insights.lunarPattern.impact}
                </Text>
              </View>
            </View>
          )}

          {/* Recognized Patterns */}
          {isPro && patterns.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">
                Discovered Patterns ({patterns.length})
              </Text>
              
              {patterns.map((pattern) => (
                <View
                  key={pattern.id}
                  className="bg-surface rounded-2xl p-5 border border-border shadow-sm gap-3"
                >
                  {/* Pattern Header */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {pattern.title}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: getImpactColor(pattern.impact) + "20" }}
                        >
                          <Text 
                            className="text-xs font-bold uppercase"
                            style={{ color: getImpactColor(pattern.impact) }}
                          >
                            {pattern.impact} Impact
                          </Text>
                        </View>
                        <View className="px-2 py-1 bg-primary/10 rounded-full">
                          <Text className="text-xs font-bold text-primary">
                            {pattern.confidence}% Confidence
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Pattern Description */}
                  <Text className="text-sm text-foreground leading-relaxed">
                    {pattern.description}
                  </Text>

                  {/* Data Points */}
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-muted">
                      📊 Based on {pattern.dataPoints} observations
                    </Text>
                  </View>

                  {/* Recommendation */}
                  <View className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                      Recommendation
                    </Text>
                    <Text className="text-sm font-medium text-foreground leading-relaxed">
                      {pattern.recommendation}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* No Patterns Yet */}
          {isPro && patterns.length === 0 && !analyzing && (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center gap-4">
              <Text className="text-4xl">📈</Text>
              <Text className="text-lg font-bold text-foreground text-center">
                No Patterns Yet
              </Text>
              <Text className="text-sm text-muted text-center leading-relaxed">
                Keep logging your activities and energy readings for at least 14 days. 
                The AI will then analyze your data to discover your personal success patterns.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/log" as any)}
                className="mt-2 px-6 py-3 bg-primary rounded-full"
              >
                <Text className="text-sm font-bold text-white">Start Logging</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Free User Message */}
          {!isPro && (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center gap-4">
              <Text className="text-4xl">🔒</Text>
              <Text className="text-lg font-bold text-foreground text-center">
                Pattern Recognition
              </Text>
              <Text className="text-sm text-muted text-center leading-relaxed">
                Unlock AI-powered pattern recognition to discover:
              </Text>
              <View className="w-full gap-2">
                <Text className="text-sm text-foreground">• Your power days and optimal timing</Text>
                <Text className="text-sm text-foreground">• Personal success patterns</Text>
                <Text className="text-sm text-foreground">• Lunar and energy influences</Text>
                <Text className="text-sm text-foreground">• Actionable recommendations</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/upgrade" as any)}
                className="mt-4 px-8 py-4 bg-primary rounded-full"
              >
                <Text className="text-base font-bold text-white">Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

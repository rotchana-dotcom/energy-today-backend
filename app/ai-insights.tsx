/**
 * AI Insights Dashboard
 * 
 * Displays pattern recognition, predictions, and coaching recommendations
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

interface EnergyPattern {
  type: "weekly" | "daily" | "activity" | "trigger";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  examples: string[];
}

interface EnergyPrediction {
  date: string;
  predictedEnergy: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}

interface CoachingRecommendation {
  category: "sleep" | "stress" | "schedule" | "habits" | "mindset";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionSteps: string[];
  expectedImpact: string;
}

export default function AIInsightsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<EnergyPattern[]>([]);
  const [predictions, setPredictions] = useState<EnergyPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([]);
  
  const [activeTab, setActiveTab] = useState<"patterns" | "predictions" | "coaching">("patterns");

  const detectPatternsMutation = trpc.aiInsights.detectPatterns.useMutation();
  const predictEnergyMutation = trpc.aiInsights.predictEnergy.useMutation();
  const getCoachingMutation = trpc.aiInsights.getCoachingRecommendations.useMutation();

  useEffect(() => {
    loadAllInsights();
  }, []);

  const loadAllInsights = async () => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Load patterns
      const patternsResult = await detectPatternsMutation.mutateAsync({
        userId: String(user?.id || "anonymous"),
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

      if (patternsResult.success && patternsResult.patterns) {
        setPatterns(patternsResult.patterns);
      }

      // Load predictions
      const predictionsResult = await predictEnergyMutation.mutateAsync({
        userId: String(user?.id || "anonymous"),
        daysAhead: 7,
      });

      if (predictionsResult.success && predictionsResult.predictions) {
        setPredictions(predictionsResult.predictions);
      }

      // Load coaching
      const coachingResult = await getCoachingMutation.mutateAsync({
        userId: String(user?.id || "anonymous"),
        focusArea: "overall",
      });

      if (coachingResult.success && coachingResult.recommendations) {
        setRecommendations(coachingResult.recommendations);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to load insights:", error);
      Alert.alert("Error", "Failed to load AI insights");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#22C55E";
      default:
        return "#687076";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#22C55E";
      default:
        return "#687076";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sleep":
        return "😴";
      case "stress":
        return "🧘";
      case "schedule":
        return "📅";
      case "habits":
        return "🎯";
      case "mindset":
        return "🧠";
      default:
        return "💡";
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/more');
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">AI Insights</Text>
        <TouchableOpacity
          onPress={loadAllInsights}
          disabled={loading}
          className="py-2"
        >
          <Text className="text-primary text-base">{loading ? "..." : "↻"}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-3 gap-2 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("patterns");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "patterns" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-sm font-medium text-center ${
              activeTab === "patterns" ? "text-white" : "text-foreground"
            }`}
          >
            Patterns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("predictions");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "predictions" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-sm font-medium text-center ${
              activeTab === "predictions" ? "text-white" : "text-foreground"
            }`}
          >
            Forecast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("coaching");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "coaching" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-sm font-medium text-center ${
              activeTab === "coaching" ? "text-white" : "text-foreground"
            }`}
          >
            Coaching
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Analyzing your energy data...</Text>
          </View>
        ) : (
          <View className="p-6 gap-4">
            {/* Patterns Tab */}
            {activeTab === "patterns" && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    🔍 <Text className="font-medium">Pattern Recognition:</Text> AI analyzed your
                    energy data to detect recurring patterns and correlations.
                  </Text>
                </View>

                {patterns.length === 0 ? (
                  <View className="bg-surface rounded-2xl p-6 items-center">
                    <Text className="text-2xl mb-2">📊</Text>
                    <Text className="text-foreground font-medium mb-1">No Patterns Yet</Text>
                    <Text className="text-sm text-muted text-center">
                      Track your energy for a few more days to detect patterns
                    </Text>
                  </View>
                ) : (
                  patterns.map((pattern, index) => (
                    <View
                      key={index}
                      className="bg-surface rounded-2xl p-5 border border-border gap-3"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-foreground mb-1">
                            {pattern.title}
                          </Text>
                          <Text className="text-xs text-muted uppercase mb-2">
                            {pattern.type}
                          </Text>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: getImpactColor(pattern.impact) + "20",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getImpactColor(pattern.impact) }}
                          >
                            {pattern.impact.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm text-foreground leading-relaxed">
                        {pattern.description}
                      </Text>

                      <View className="bg-background rounded-lg p-3 gap-1">
                        <Text className="text-xs font-medium text-muted mb-1">EXAMPLES:</Text>
                        {pattern.examples.map((example, i) => (
                          <Text key={i} className="text-xs text-foreground">
                            • {example}
                          </Text>
                        ))}
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-muted">Confidence:</Text>
                        <View className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                          <View
                            className="bg-primary h-full"
                            style={{ width: `${pattern.confidence}%` }}
                          />
                        </View>
                        <Text className="text-xs font-medium text-foreground">
                          {Math.round(pattern.confidence)}%
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* Predictions Tab */}
            {activeTab === "predictions" && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    🔮 <Text className="font-medium">Energy Forecast:</Text> Predicted energy
                    levels for the next 7 days based on your patterns.
                  </Text>
                </View>

                {predictions.length === 0 ? (
                  <View className="bg-surface rounded-2xl p-6 items-center">
                    <Text className="text-2xl mb-2">📈</Text>
                    <Text className="text-foreground font-medium mb-1">No Predictions Yet</Text>
                    <Text className="text-sm text-muted text-center">
                      Track your energy for a few more days to generate forecasts
                    </Text>
                  </View>
                ) : (
                  predictions.map((prediction, index) => {
                    const date = new Date(prediction.date);
                    const energyColor =
                      prediction.predictedEnergy >= 70
                        ? "#22C55E"
                        : prediction.predictedEnergy >= 50
                        ? "#F59E0B"
                        : "#EF4444";

                    return (
                      <View
                        key={index}
                        className="bg-surface rounded-2xl p-5 border border-border gap-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-lg font-bold text-foreground">
                              {date.toLocaleDateString("en-US", { weekday: "long" })}
                            </Text>
                            <Text className="text-xs text-muted">
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text
                              className="text-3xl font-bold"
                              style={{ color: energyColor }}
                            >
                              {Math.round(prediction.predictedEnergy)}%
                            </Text>
                            <Text className="text-xs text-muted">
                              {Math.round(prediction.confidence)}% confident
                            </Text>
                          </View>
                        </View>

                        <View className="bg-background rounded-lg p-3 gap-1">
                          <Text className="text-xs font-medium text-muted mb-1">
                            INFLUENCING FACTORS:
                          </Text>
                          {prediction.factors.map((factor, i) => (
                            <Text key={i} className="text-xs text-foreground">
                              • {factor}
                            </Text>
                          ))}
                        </View>

                        <View className="bg-primary/10 rounded-lg p-3 border border-primary/30">
                          <Text className="text-xs font-medium text-muted mb-1">
                            💡 RECOMMENDATION:
                          </Text>
                          <Text className="text-sm text-foreground">
                            {prediction.recommendation}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* Coaching Tab */}
            {activeTab === "coaching" && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    🎯 <Text className="font-medium">Personalized Coaching:</Text> AI-generated
                    recommendations to improve your energy management.
                  </Text>
                </View>

                {recommendations.length === 0 ? (
                  <View className="bg-surface rounded-2xl p-6 items-center">
                    <Text className="text-2xl mb-2">🎓</Text>
                    <Text className="text-foreground font-medium mb-1">
                      No Recommendations Yet
                    </Text>
                    <Text className="text-sm text-muted text-center">
                      Track your energy for a few more days to get coaching
                    </Text>
                  </View>
                ) : (
                  recommendations.map((rec, index) => (
                    <View
                      key={index}
                      className="bg-surface rounded-2xl p-5 border border-border gap-3"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-2 flex-1">
                          <Text className="text-2xl">{getCategoryIcon(rec.category)}</Text>
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-foreground">
                              {rec.title}
                            </Text>
                            <Text className="text-xs text-muted uppercase">
                              {rec.category}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: getPriorityColor(rec.priority) + "20",
                          }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getPriorityColor(rec.priority) }}
                          >
                            {rec.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm text-foreground leading-relaxed">
                        {rec.description}
                      </Text>

                      <View className="bg-background rounded-lg p-3 gap-1">
                        <Text className="text-xs font-medium text-muted mb-1">
                          ACTION STEPS:
                        </Text>
                        {rec.actionSteps.map((step, i) => (
                          <Text key={i} className="text-xs text-foreground">
                            {i + 1}. {step}
                          </Text>
                        ))}
                      </View>

                      <View className="bg-success/10 rounded-lg p-3 border border-success/30">
                        <Text className="text-xs font-medium text-muted mb-1">
                          ✨ EXPECTED IMPACT:
                        </Text>
                        <Text className="text-sm text-foreground">{rec.expectedImpact}</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

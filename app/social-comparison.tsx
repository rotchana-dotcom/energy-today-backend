/**
 * Social Comparison Screen
 * 
 * Anonymous benchmarking against similar profiles
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
import { getUserProfile } from "@/lib/storage";

export default function SocialComparisonScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"comparison" | "leaderboard" | "trends">("comparison");
  const [profileType, setProfileType] = useState<"entrepreneur" | "employee" | "student" | "freelancer" | "other">("employee");
  const [ageRange, setAgeRange] = useState<"18-25" | "26-35" | "36-45" | "46-55" | "56+">("26-35");
  
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);

  const getComparisonMutation = trpc.socialComparison.getComparison.useMutation();
  const getLeaderboardMutation = trpc.socialComparison.getLeaderboard.useMutation();
  const getTrendsMutation = trpc.socialComparison.getCommunityTrends.useMutation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      if (!profile) {
        router.replace("/onboarding/welcome" as any);
        return;
      }

      // Load comparison data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const comparison = await getComparisonMutation.mutateAsync({
        userId: "user_1",
        profileType,
        ageRange,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      setComparisonData(comparison);
    } catch (error) {
      console.error("Failed to load comparison:", error);
      Alert.alert("Error", "Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboard = await getLeaderboardMutation.mutateAsync({
        profileType,
        metric: "energy",
        period: "month",
      });
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      Alert.alert("Error", "Failed to load leaderboard");
    }
  };

  const loadTrends = async () => {
    try {
      const trends = await getTrendsMutation.mutateAsync({
        profileType,
        period: "month",
      });
      setTrendsData(trends);
    } catch (error) {
      console.error("Failed to load trends:", error);
      Alert.alert("Error", "Failed to load trends");
    }
  };

  useEffect(() => {
    if (activeTab === "leaderboard" && !leaderboardData) {
      loadLeaderboard();
    } else if (activeTab === "trends" && !trendsData) {
      loadTrends();
    }
  }, [activeTab]);

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return "#22C55E";
    if (percentile >= 60) return "#0a7ea4";
    if (percentile >= 40) return "#F59E0B";
    return "#EF4444";
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
        <Text className="text-xl font-bold text-foreground">Community</Text>
        <View className="w-16" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-3 gap-2 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("comparison");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "comparison" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              activeTab === "comparison" ? "text-white" : "text-foreground"
            }`}
          >
            Compare
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("leaderboard");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "leaderboard" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              activeTab === "leaderboard" ? "text-white" : "text-foreground"
            }`}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("trends");
          }}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "trends" ? "bg-primary" : "bg-surface"
          }`}
        >
          <Text
            className={`text-xs font-medium text-center ${
              activeTab === "trends" ? "text-white" : "text-foreground"
            }`}
          >
            Trends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Loading...</Text>
          </View>
        ) : (
          <View className="p-6 gap-4">
            {/* Comparison Tab */}
            {activeTab === "comparison" && comparisonData && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    🔒 <Text className="font-medium">100% Anonymous:</Text> All comparisons are
                    aggregated and anonymized. No personal data is shared.
                  </Text>
                </View>

                {/* Percentile Card */}
                {comparisonData.userStats && (
                  <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                    <Text className="text-sm text-muted mb-2">YOUR RANKING</Text>
                    <Text
                      className="text-6xl font-bold mb-2"
                      style={{ color: getPercentileColor(comparisonData.percentile) }}
                    >
                      {comparisonData.percentile}
                      <Text className="text-2xl">th</Text>
                    </Text>
                    <Text className="text-base text-foreground">Percentile</Text>
                    <Text className="text-xs text-muted mt-2">
                      Among {comparisonData.communityStats.profileType}s aged{" "}
                      {comparisonData.communityStats.ageRange}
                    </Text>
                  </View>
                )}

                {/* Stats Comparison */}
                {comparisonData.userStats && comparisonData.communityStats && (
                  <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
                    <Text className="text-sm font-medium text-muted">YOUR STATS VS COMMUNITY</Text>

                    {/* Energy */}
                    <View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs text-muted">Average Energy</Text>
                        <Text className="text-xs text-foreground">
                          You: {comparisonData.userStats.averageEnergy}% | Community:{" "}
                          {comparisonData.communityStats.averageEnergy}%
                        </Text>
                      </View>
                      <View className="h-2 bg-background rounded-full overflow-hidden flex-row">
                        <View
                          className="bg-primary"
                          style={{ width: `${comparisonData.userStats.averageEnergy}%` }}
                        />
                      </View>
                    </View>

                    {/* Sleep */}
                    <View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs text-muted">Average Sleep</Text>
                        <Text className="text-xs text-foreground">
                          You: {comparisonData.userStats.averageSleep}h | Community:{" "}
                          {comparisonData.communityStats.averageSleep}h
                        </Text>
                      </View>
                      <View className="h-2 bg-background rounded-full overflow-hidden flex-row">
                        <View
                          className="bg-success"
                          style={{
                            width: `${(comparisonData.userStats.averageSleep / 10) * 100}%`,
                          }}
                        />
                      </View>
                    </View>

                    {/* Stress */}
                    <View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs text-muted">Average Stress</Text>
                        <Text className="text-xs text-foreground">
                          You: {comparisonData.userStats.averageStress}/10 | Community:{" "}
                          {comparisonData.communityStats.averageStress}/10
                        </Text>
                      </View>
                      <View className="h-2 bg-background rounded-full overflow-hidden flex-row">
                        <View
                          className="bg-warning"
                          style={{
                            width: `${(comparisonData.userStats.averageStress / 10) * 100}%`,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Insights */}
                {comparisonData.insights && comparisonData.insights.length > 0 && (
                  <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                    <Text className="text-sm font-medium text-muted">INSIGHTS</Text>
                    {comparisonData.insights.map((insight: string, index: number) => (
                      <View key={index} className="bg-background rounded-lg p-3">
                        <Text className="text-sm text-foreground leading-relaxed">{insight}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && leaderboardData && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    🏆 <Text className="font-medium">Anonymous Leaderboard:</Text> See how you rank
                    among similar profiles.
                  </Text>
                </View>

                <View className="bg-surface rounded-2xl p-5 border border-border gap-2">
                  <Text className="text-sm font-medium text-muted mb-2">
                    TOP {leaderboardData.profileType.toUpperCase()}S - ENERGY
                  </Text>
                  {leaderboardData.leaderboard.map(
                    (entry: { rank: number; score: number; isYou: boolean }, index: number) => (
                      <View
                        key={index}
                        className={`flex-row items-center justify-between p-3 rounded-lg ${
                          entry.isYou ? "bg-primary/20 border border-primary" : "bg-background"
                        }`}
                      >
                        <View className="flex-row items-center gap-3">
                          <Text className="text-lg font-bold text-foreground w-8">
                            #{entry.rank}
                          </Text>
                          <Text className="text-sm text-foreground">
                            {entry.isYou ? "You" : `User ${entry.rank}`}
                          </Text>
                        </View>
                        <Text className="text-base font-semibold text-primary">
                          {entry.score}%
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </>
            )}

            {/* Trends Tab */}
            {activeTab === "trends" && trendsData && (
              <>
                <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <Text className="text-sm text-foreground">
                    📈 <Text className="font-medium">Community Trends:</Text> See how energy levels
                    change over time.
                  </Text>
                </View>

                <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                  <Text className="text-sm font-medium text-muted">
                    AVERAGE ENERGY - LAST 30 DAYS
                  </Text>
                  {trendsData.trends.slice(-7).map((trend: any, index: number) => (
                    <View key={index} className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">
                          {new Date(trend.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <Text className="text-xs text-foreground">
                          {trend.averageEnergy}% ({trend.participantCount} users)
                        </Text>
                      </View>
                      <View className="h-2 bg-background rounded-full overflow-hidden">
                        <View
                          className="bg-primary"
                          style={{ width: `${trend.averageEnergy}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

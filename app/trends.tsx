import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { calculateEnergyTrends, compareTrendPeriods, TrendAnalysis } from "@/lib/energy-trends";
import { shareWeeklySummary } from "@/lib/sharing";
import * as Haptics from "expo-haptics";
import { UserProfile } from "@/types";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, useFont } from "@shopify/react-native-skia";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 48; // Account for padding

export default function TrendsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [comparison, setComparison] = useState<ReturnType<typeof compareTrendPeriods> | null>(null);
  const [isPro, setIsPro] = useState(false);
  // Removed chart press state to avoid type issues

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    setProfile(userProfile);
    
    // Check Pro status
    const subscription = await getSubscriptionStatus();
    setIsPro(subscription.isPro);
    
    if (subscription.isPro) {
      const trendData = calculateEnergyTrends(userProfile, period);
      const comparisonData = compareTrendPeriods(userProfile, period);

      setTrends(trendData);
      setComparison(comparisonData);
    }
    
    setLoading(false);
  };

  const getChangeIndicator = (value: number) => {
    if (value > 5) return { emoji: "📈", color: "text-success", text: `+${value}%` };
    if (value < -5) return { emoji: "📉", color: "text-error", text: `${value}%` };
    return { emoji: "➡️", color: "text-muted", text: "~" };
  };

  if (loading || !trends || !comparison) {
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
          <Text className="text-4xl">📈</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            Energy Trends
          </Text>
          <Text className="text-base text-muted text-center px-4">
            Visualize your energy patterns over time with detailed charts and historical analysis.
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

  // Prepare chart data
  const chartData = trends.data.map((d: any, index: number) => ({
    x: index,
    alignment: d.alignmentScore,
  }));

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Energy Trends</Text>
              <Text className="text-sm text-muted mt-1">
                Track your energy patterns over time
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/business')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Period Toggle */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setPeriod("week")}
              className={`flex-1 py-3 rounded-lg border ${
                period === "week"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  period === "week" ? "text-white" : "text-foreground"
                }`}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriod("month")}
              className={`flex-1 py-3 rounded-lg border ${
                period === "month"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  period === "month" ? "text-white" : "text-foreground"
                }`}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comparison Stats */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">VS PREVIOUS {period.toUpperCase()}</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Average Alignment</Text>
                <Text className="text-2xl font-bold text-foreground">{trends.averageAlignment}%</Text>
              </View>
              <View className="items-end">
                {(() => {
                  const indicator = getChangeIndicator(comparison.change.alignment);
                  return (
                    <>
                      <Text className="text-2xl">{indicator.emoji}</Text>
                      <Text className={`text-sm font-medium ${indicator.color}`}>
                        {indicator.text}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Your Energy</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {trends.averageUserEnergy}%
                </Text>
                {(() => {
                  const indicator = getChangeIndicator(comparison.change.userEnergy);
                  return (
                    <Text className={`text-xs ${indicator.color}`}>{indicator.text}</Text>
                  );
                })()}
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-1">Earth Energy</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {trends.averageEnvironmentalEnergy}%
                </Text>
                {(() => {
                  const indicator = getChangeIndicator(comparison.change.environmentalEnergy);
                  return (
                    <Text className={`text-xs ${indicator.color}`}>{indicator.text}</Text>
                  );
                })()}
              </View>
            </View>
          </View>

          {/* Chart */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <Text className="text-sm font-medium text-muted mb-4">ALIGNMENT TREND</Text>
            <View style={{ height: 200 }}>
              {/* @ts-ignore */}
              <CartesianChart
                data={chartData}
                xKey="x"
                yKeys={["alignment"]}
                domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
              >
                {({ points }: any) => (
                  <Line
                    points={points.alignment}
                    color="#0A7EA4"
                    strokeWidth={3}
                    curveType="natural"
                    animate={{ type: "timing", duration: 300 }}
                  />
                )}
              </CartesianChart>
            </View>

          </View>

          {/* Share Button */}
          <TouchableOpacity
            onPress={async () => {
              try {
                if (profile && trends) {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await shareWeeklySummary(profile, trends);
                }
              } catch (error) {
                console.error("Share failed:", error);
              }
            }}
            className="bg-primary/10 border border-primary rounded-lg px-4 py-3 flex-row items-center justify-center gap-2"
          >
            <Text className="text-sm font-medium text-primary">Share {period === "week" ? "Weekly" : "Monthly"} Summary</Text>
            <Text className="text-primary">📤</Text>
          </TouchableOpacity>

          {/* Insights */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">INSIGHTS</Text>
            {trends.insights.map((insight: string, index: number) => (
              <View key={index} className="flex-row gap-3">
                <Text className="text-primary">•</Text>
                <Text className="flex-1 text-sm text-foreground leading-relaxed">{insight}</Text>
              </View>
            ))}
          </View>

          {/* Best & Challenging Days */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-success/10 rounded-2xl p-4 border border-success">
              <Text className="text-xs font-medium text-success mb-2">BEST DAYS</Text>
              <Text className="text-3xl font-bold text-success">{trends.bestDays.length}</Text>
              <Text className="text-xs text-muted mt-1">Strong alignment</Text>
            </View>
            <View className="flex-1 bg-error/10 rounded-2xl p-4 border border-error">
              <Text className="text-xs font-medium text-error mb-2">CHALLENGING</Text>
              <Text className="text-3xl font-bold text-error">{trends.challengingDays.length}</Text>
              <Text className="text-xs text-muted mt-1">Needs extra care</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

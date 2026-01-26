import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getUserProfile } from "@/lib/storage";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import { getAllOutcomes } from "@/lib/results-tracker";

interface DayForecast {
  date: string;
  dayName: string;
  energyScore: number;
  recommendation: string;
  bestFor: string[];
}

export default function BusinessScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const profile = await getUserProfile();
      if (!profile) {
        setLoading(false);
        return;
      }

      // Generate 7-day forecast
      const forecastData: DayForecast[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const energyData = calculateUnifiedEnergy(profile as any, date);
        const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const score = energyData.combinedAnalysis.intensity;
        let recommendation = "";
        let bestFor: string[] = [];

        if (score >= 85) {
          recommendation = "Excellent day for major decisions";
          bestFor = ["Important meetings", "Product launches", "Negotiations", "Strategic planning"];
        } else if (score >= 70) {
          recommendation = "Good day for routine business";
          bestFor = ["Team meetings", "Client calls", "Project work", "Follow-ups"];
        } else if (score >= 50) {
          recommendation = "Focus on preparation";
          bestFor = ["Research", "Planning", "Admin tasks", "Internal work"];
        } else {
          recommendation = "Rest and recharge";
          bestFor = ["Light tasks", "Delegation", "Review work", "Personal time"];
        }

        forecastData.push({
          date: date.toISOString().split('T')[0],
          dayName,
          energyScore: score,
          recommendation,
          bestFor,
        });
      }

      setForecast(forecastData);

      // Load ROI stats
      const outcomes = await getAllOutcomes();
      const thisMonth = outcomes.filter((o: any) => {
        const outcomeDate = new Date(o.date);
        const now = new Date();
        return outcomeDate.getMonth() === now.getMonth() && 
               outcomeDate.getFullYear() === now.getFullYear();
      });

      const successful = thisMonth.filter((o: any) => o.rating >= 4).length;
      const total = thisMonth.length;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      const totalRevenue = thisMonth
        .filter((o: any) => o.type === 'deal' && o.revenue)
        .reduce((sum: number, o: any) => sum + (o.revenue || 0), 0);

      setStats({
        successRate,
        dealsThisMonth: thisMonth.filter((o: any) => o.type === 'deal').length,
        totalRevenue,
        totalOutcomes: total,
      });

    } catch (error) {
      console.error("Failed to load business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.primary;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  if (loading) {
    return (
      <ScreenContainer className="bg-background items-center justify-center">
        <Text className="text-muted">Loading business insights...</Text>
      </ScreenContainer>
    );
  }

  if (forecast.length === 0) {
    return (
      <ScreenContainer className="bg-background items-center justify-center px-6">
        <Text className="text-2xl mb-2">💼</Text>
        <Text className="text-xl font-bold text-foreground mb-2 text-center">
          No Profile Yet
        </Text>
        <Text className="text-muted text-center">
          Complete your profile to unlock business timing insights
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
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
          <Text className="text-3xl font-bold text-foreground">Business</Text>
          <Text className="text-base text-muted mt-1">
            Optimize your timing
          </Text>
        </View>

        {/* ROI Stats */}
        {stats && (
          <View className="mx-6 mb-6">
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
              This Month's Performance
            </Text>
            <View className="bg-surface rounded-2xl p-4">
              <View className="flex-row flex-wrap">
                <View className="w-1/2 pr-2 mb-4">
                  <Text className="text-sm text-muted mb-1">Success Rate</Text>
                  <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                    {stats.successRate}%
                  </Text>
                </View>
                <View className="w-1/2 pl-2 mb-4">
                  <Text className="text-sm text-muted mb-1">Deals Closed</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {stats.dealsThisMonth}
                  </Text>
                </View>
                {stats.totalRevenue > 0 && (
                  <View className="w-full">
                    <Text className="text-sm text-muted mb-1">Total Revenue</Text>
                    <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                      ${stats.totalRevenue.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 7-Day Forecast */}
        <View className="mx-6 mb-4">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            7-Day Energy Forecast
          </Text>
          <View className="gap-3">
            {forecast.map((day, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-4"
              >
                <View className="flex-row items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {day.dayName}
                    </Text>
                    <Text className="text-sm text-muted">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-3xl font-bold" style={{ color: getEnergyColor(day.energyScore) }}>
                      {day.energyScore}
                    </Text>
                    <Text className="text-xs text-muted">Energy</Text>
                  </View>
                </View>

                <Text className="text-sm font-semibold text-foreground mb-2">
                  {day.recommendation}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {day.bestFor.map((activity, i) => (
                    <View
                      key={i}
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: getEnergyColor(day.energyScore) + "20" }}
                    >
                      <Text className="text-xs font-medium" style={{ color: getEnergyColor(day.energyScore) }}>
                        {activity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-4">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Business Tools
          </Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/business-timing" as any)}
              className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-primary/20">
                <Text className="text-2xl">⏰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Business Timing
                </Text>
                <Text className="text-sm text-muted">
                  Find optimal times for specific activities
                </Text>
              </View>
              <Text className="text-muted text-lg">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/results-tracking" as any)}
              className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-success/20">
                <Text className="text-2xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Track Outcomes
                </Text>
                <Text className="text-sm text-muted">
                  Log deals, meetings, and results
                </Text>
              </View>
              <Text className="text-muted text-lg">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/reports" as any)}
              className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-warning/20">
                <Text className="text-2xl">📄</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Generate Report
                </Text>
                <Text className="text-sm text-muted">
                  Export performance analysis
                </Text>
              </View>
              <Text className="text-muted text-lg">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Advanced Tools */}
        <View className="mx-6 mb-4">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Advanced Tools
          </Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/analytics-dashboard" as any)}
              className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-primary/20">
                <Text className="text-2xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Analytics Dashboard
                </Text>
                <Text className="text-sm text-muted">
                  See detailed success patterns
                </Text>
              </View>
              <Text className="text-muted text-lg">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/task-scheduler" as any)}
              className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-success/20">
                <Text className="text-2xl">✅</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Schedule Tasks
                </Text>
                <Text className="text-sm text-muted">
                  AI-powered optimal timing
                </Text>
              </View>
              <Text className="text-muted text-lg">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip */}
        <View className="mx-6 mt-2 p-4 bg-primary/10 rounded-2xl">
          <Text className="text-sm font-semibold text-foreground mb-1">
            💡 Business Tip
          </Text>
          <Text className="text-sm text-muted">
            Schedule your most important meetings and decisions on high-energy days (85+) for best results. Track outcomes to prove ROI.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/storage";
import { generateForecast, FutureForecast } from "@/lib/future-prediction";
import { UserProfile } from "@/types";

export default function ForecastScreen() {
  const router = useRouter();
  const colors = useColors();
  const [forecast, setForecast] = useState<FutureForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState<7 | 30>(7);

  useEffect(() => {
    loadForecast();
  }, [forecastDays]);

  async function loadForecast() {
    try {
      const profile = await getUserProfile();
      if (!profile) {
        setLoading(false);
        return;
      }
      const forecastData = generateForecast(profile, forecastDays);
      setForecast(forecastData);
    } catch (error) {
      console.error("Error loading forecast:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Loading forecast...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!forecast) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-xl font-bold text-foreground">No Profile Data</Text>
          <Text className="text-base text-muted text-center">
            Please complete your profile to see energy forecasts.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-primary px-6 py-3 rounded-full active:opacity-80"
          >
            <Text className="text-background font-semibold">Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "rising") return "↗";
    if (trend === "declining") return "↘";
    return "→";
  };

  const getTrendColor = (trend: string) => {
    if (trend === "rising") return colors.success;
    if (trend === "declining") return colors.warning;
    return colors.muted;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return colors.success;
      case "good": return colors.primary;
      case "moderate": return colors.warning;
      case "challenging": return colors.error;
      default: return colors.muted;
    }
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.push('/(tabs)/')} className="active:opacity-70">
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Energy Forecast</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Forecast Period Selector */}
      <View className="flex-row gap-3 px-6 py-4">
        <TouchableOpacity
          onPress={() => setForecastDays(7)}
          className={`flex-1 py-3 rounded-lg ${forecastDays === 7 ? "bg-primary" : "bg-surface border border-border"}`}
        >
          <Text className={`text-center font-semibold ${forecastDays === 7 ? "text-white" : "text-foreground"}`}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setForecastDays(30)}
          className={`flex-1 py-3 rounded-lg ${forecastDays === 30 ? "bg-primary" : "bg-surface border border-border"}`}
        >
          <Text className={`text-center font-semibold ${forecastDays === 30 ? "text-white" : "text-foreground"}`}>
            30 Days
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Overall Trend */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Overall Trend</Text>
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 24, color: getTrendColor(forecast.overallTrend) }}>
                {getTrendIcon(forecast.overallTrend)}
              </Text>
              <Text className="text-base font-semibold capitalize" style={{ color: getTrendColor(forecast.overallTrend) }}>
                {forecast.overallTrend}
              </Text>
            </View>
          </View>

          <View className="gap-2">
            {forecast.recommendations.map((rec, idx) => (
              <View key={idx} className="bg-primary/5 p-3 rounded-lg">
                <Text className="text-sm text-foreground leading-relaxed">{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Best Days */}
        {forecast.bestDays.length > 0 && (
          <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Best Days</Text>
            {forecast.bestDays.map((day, idx) => (
              <View key={idx} className="mb-3 pb-3 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <View className="bg-success/10 px-3 py-1 rounded-full">
                    <Text className="text-sm text-success font-semibold capitalize">{day.rating}</Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed">{day.recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Challenging Days */}
        {forecast.challengingDays.length > 0 && (
          <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Challenging Days</Text>
            {forecast.challengingDays.map((day, idx) => (
              <View key={idx} className="mb-3 pb-3 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <View className="bg-warning/10 px-3 py-1 rounded-full">
                    <Text className="text-sm text-warning font-semibold capitalize">{day.rating}</Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed">{day.recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Significant Dates */}
        {forecast.significantDates.length > 0 && (
          <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Significant Dates</Text>
            {forecast.significantDates.map((sigDate, idx) => (
              <View key={idx} className="mb-4 pb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-foreground">
                    {new Date(sigDate.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <View className="bg-primary/10 px-3 py-1 rounded-full">
                    <Text className="text-xs text-primary font-semibold capitalize">{sigDate.type}</Text>
                  </View>
                </View>
                <Text className="text-base font-semibold text-foreground mb-1">{sigDate.title}</Text>
                <Text className="text-sm text-muted leading-relaxed mb-3">{sigDate.description}</Text>
                <View className="gap-1">
                  {sigDate.actionItems.map((item, itemIdx) => (
                    <Text key={itemIdx} className="text-sm text-muted">• {item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* All Days (condensed view) */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <Text className="text-xl font-bold text-foreground mb-4">Daily Breakdown</Text>
          {forecast.days.map((day, idx) => (
            <View key={idx} className="flex-row items-center justify-between py-2 border-b border-border last:border-b-0">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Text className="text-xs text-muted">{day.dailyEnergy.lunarPhaseEmoji} {day.significance}</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${getRatingColor(day.rating)}20` }}>
                <Text className="text-xs font-semibold capitalize" style={{ color: getRatingColor(day.rating) }}>
                  {day.rating}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

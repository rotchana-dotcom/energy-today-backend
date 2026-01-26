/**
 * Weather Insights Screen
 * 
 * Display weather-energy correlations and patterns
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function WeatherInsightsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [correlation, setCorrelation] = useState<any>(null);

  const analyzeCorrelation = trpc.weather.analyzeWeatherCorrelation.useMutation();

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // If no user, show empty state instead of infinite loading
      if (!user) {
        setLoading(false);
        setCorrelation(null);
        return;
      }

      const result = await analyzeCorrelation.mutateAsync({
        userId: user.id.toString(),
        days,
      });
      setCorrelation(result);
    } catch (error) {
      console.error("Failed to load weather correlation:", error);
      // Set correlation to null on error to show empty state
      setCorrelation(null);
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (value: number) => {
    if (Math.abs(value) > 0.5) return "#22C55E"; // Strong
    if (Math.abs(value) > 0.3) return "#F59E0B"; // Moderate
    return "#6B7280"; // Weak
  };

  const getCorrelationLabel = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.5) return "Strong";
    if (abs > 0.3) return "Moderate";
    return "Weak";
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
        <Text className="text-xl font-bold text-foreground">Weather Insights</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            loadData();
          }}
          className="py-2"
        >
          <Text className="text-primary text-2xl">↻</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Analyzing weather patterns...</Text>
        </View>
      ) : !correlation ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-4xl mb-4">🌤️</Text>
          <Text className="text-lg font-semibold text-foreground mb-2">No Weather Data Yet</Text>
          <Text className="text-sm text-muted text-center">
            Track your energy for a few more days to see weather correlations
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Time Range Selector */}
            <View className="flex-row gap-2">
              {([7, 30, 90] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  onPress={() => {
                    setDays(range);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    days === range ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      days === range ? "text-white" : "text-foreground"
                    }`}
                  >
                    {range} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary Card */}
            {correlation && (
              <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
                <View className="flex-row items-start gap-3">
                  <Text className="text-2xl">🌤️</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-2">
                      Weather Impact Summary
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      {correlation.summary}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Temperature Correlation */}
            {correlation?.correlations.temperature && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">🌡️</Text>
                    <Text className="text-base font-semibold text-foreground">
                      Temperature
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        getCorrelationColor(correlation.correlations.temperature.correlation) +
                        "20",
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color: getCorrelationColor(
                          correlation.correlations.temperature.correlation
                        ),
                      }}
                    >
                      {getCorrelationLabel(correlation.correlations.temperature.correlation)}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed">
                  {correlation.correlations.temperature.insight}
                </Text>
              </View>
            )}

            {/* Humidity Correlation */}
            {correlation?.correlations.humidity && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">💧</Text>
                    <Text className="text-base font-semibold text-foreground">Humidity</Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        getCorrelationColor(correlation.correlations.humidity.correlation) +
                        "20",
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color: getCorrelationColor(
                          correlation.correlations.humidity.correlation
                        ),
                      }}
                    >
                      {getCorrelationLabel(correlation.correlations.humidity.correlation)}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed">
                  {correlation.correlations.humidity.insight}
                </Text>
              </View>
            )}

            {/* Weather Condition */}
            {correlation?.correlations.condition && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center gap-2 mb-4">
                  <Text className="text-xl">☁️</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Weather Conditions
                  </Text>
                </View>
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Best Energy</Text>
                    <Text className="text-sm font-medium text-success">
                      {correlation.correlations.condition.bestCondition}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">Lowest Energy</Text>
                    <Text className="text-sm font-medium text-error">
                      {correlation.correlations.condition.worstCondition}
                    </Text>
                  </View>
                  <View className="h-px bg-border my-1" />
                  <Text className="text-sm text-muted leading-relaxed">
                    {correlation.correlations.condition.insight}
                  </Text>
                </View>
              </View>
            )}

            {/* UV Index */}
            {correlation?.correlations.uvIndex && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">☀️</Text>
                    <Text className="text-base font-semibold text-foreground">
                      Sunlight Exposure
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        getCorrelationColor(correlation.correlations.uvIndex.correlation) +
                        "20",
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color: getCorrelationColor(
                          correlation.correlations.uvIndex.correlation
                        ),
                      }}
                    >
                      {getCorrelationLabel(correlation.correlations.uvIndex.correlation)}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed">
                  {correlation.correlations.uvIndex.insight}
                </Text>
              </View>
            )}

            {/* Recommendations */}
            {correlation?.recommendations && correlation.recommendations.length > 0 && (
              <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
                <View className="flex-row items-center gap-2 mb-4">
                  <Text className="text-xl">💡</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Recommendations
                  </Text>
                </View>
                <View className="gap-3">
                  {correlation.recommendations.map((rec: string, index: number) => (
                    <View key={index} className="flex-row items-start gap-2">
                      <Text className="text-success mt-1">•</Text>
                      <Text className="flex-1 text-sm text-muted leading-relaxed">{rec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

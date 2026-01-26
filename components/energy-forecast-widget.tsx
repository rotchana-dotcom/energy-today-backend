/**
 * Energy Forecast Widget
 * 
 * Display tomorrow's predicted energy on home screen
 */

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

export function EnergyForecastWidget() {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<any>(null);

  const predictEnergyMutation = trpc.aiInsights.predictEnergy.useMutation();

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await predictEnergyMutation.mutateAsync({
        userId: "user_1",
        daysAhead: 1,
      });

      if (result && result.predictions && result.predictions.length > 0) {
        setForecast(result.predictions[0]);
      }
    } catch (error) {
      console.error("Failed to load forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 70) return "#22C55E";
    if (energy >= 40) return "#F59E0B";
    return "#EF4444";
  };

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 70) return "⚡";
    if (energy >= 40) return "🔋";
    return "🪫";
  };

  const getQuickTip = (energy: number, factors?: string[]) => {
    if (energy >= 70) {
      return "Perfect time for challenging tasks!";
    } else if (energy >= 40) {
      return "Good for moderate activities";
    } else {
      if (factors && factors.some((f) => f.toLowerCase().includes("sleep"))) {
        return "Prioritize rest tonight";
      }
      return "Schedule lighter tasks";
    }
  };

  if (loading) {
    return (
      <View className="bg-surface rounded-2xl p-4 border border-border">
        <View className="items-center py-4">
          <ActivityIndicator size="small" color="#0a7ea4" />
          <Text className="text-xs text-muted mt-2">Loading forecast...</Text>
        </View>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View className="bg-surface rounded-2xl p-4 border border-border">
        <Text className="text-sm font-medium text-muted">
          Not enough data for forecast yet
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push("/ai-insights" as any);
      }}
      className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-5 border border-primary/30"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
          Tomorrow's Forecast
        </Text>
        <Text className="text-xs text-muted">
          {new Date(forecast.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <View className="flex-row items-center gap-4">
        {/* Energy Level */}
        <View className="items-center">
          <Text className="text-4xl mb-1">{getEnergyEmoji(forecast.predictedEnergy)}</Text>
          <Text
            className="text-3xl font-bold"
            style={{ color: getEnergyColor(forecast.predictedEnergy) }}
          >
            {forecast.predictedEnergy}%
          </Text>
          <Text className="text-xs text-muted mt-1">Energy</Text>
        </View>

        {/* Divider */}
        <View className="w-px h-16 bg-border" />

        {/* Quick Tip */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground leading-relaxed">
            {getQuickTip(forecast.predictedEnergy, forecast.factors)}
          </Text>
          {forecast.confidence && (
            <View className="flex-row items-center gap-2 mt-2">
              <View className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${forecast.confidence}%` }}
                />
              </View>
              <Text className="text-xs text-muted">{forecast.confidence}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Key Factors */}
      {forecast.factors && forecast.factors.length > 0 && (
        <View className="mt-4 pt-4 border-t border-border/50">
          <Text className="text-xs text-muted mb-2">Key Factors:</Text>
          <View className="flex-row flex-wrap gap-2">
            {forecast.factors.slice(0, 3).map((factor: string, index: number) => (
              <View key={index} className="bg-background px-2 py-1 rounded-md">
                <Text className="text-xs text-foreground">{factor}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tap for Details */}
      <View className="mt-3 pt-3 border-t border-border/50">
        <Text className="text-xs text-primary text-center">
          Tap for detailed forecast →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

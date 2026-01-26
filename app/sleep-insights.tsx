/**
 * Sleep Insights Screen
 * 
 * Display sleep-energy correlations and sleep statistics
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
import {
  getSleepStats,
  analyzeSleepCorrelation,
  importSleepFromHealth,
  type SleepData,
} from "@/lib/sleep-tracking";

export default function SleepInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{
    totalNights: number;
    averageDuration: number;
    averageQuality: number;
    bestNight: SleepData | null;
    worstNight: SleepData | null;
  } | null>(null);
  const [correlation, setCorrelation] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, correlationData] = await Promise.all([
        getSleepStats(30),
        analyzeSleepCorrelation([
          // Mock energy data - in production, fetch from actual energy logs
          { date: new Date().toISOString().split("T")[0], energy: 75 },
        ]),
      ]);
      setStats(statsData);
      setCorrelation(correlationData);
    } catch (error) {
      console.error("Failed to load sleep data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSleep = async () => {
    try {
      setImporting(true);
      const count = await importSleepFromHealth(7);
      Alert.alert("Success", `Imported ${count} nights of sleep data`, [
        {
          text: "OK",
          onPress: () => {
            loadData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to import sleep data", [{ text: "OK" }]);
    } finally {
      setImporting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 3.5) return "#22C55E";
    if (quality >= 2.5) return "#F59E0B";
    return "#EF4444";
  };

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.5) return "#22C55E";
    if (abs > 0.3) return "#F59E0B";
    return "#6B7280";
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
        <Text className="text-xl font-bold text-foreground">Sleep Insights</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleImportSleep();
          }}
          className="py-2"
          disabled={importing}
        >
          <Text className="text-primary text-base">{importing ? "..." : "Import"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Analyzing sleep patterns...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Stats Overview */}
            {stats && stats.totalNights > 0 ? (
              <>
                <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
                  <View className="flex-row items-start gap-3 mb-4">
                    <Text className="text-2xl">😴</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground mb-2">
                        Sleep Summary (30 Days)
                      </Text>
                      <Text className="text-sm text-muted">
                        {stats.totalNights} nights tracked
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-4">
                    <View className="flex-1 min-w-[45%]">
                      <Text className="text-2xl font-bold text-primary">
                        {formatDuration(stats.averageDuration)}
                      </Text>
                      <Text className="text-xs text-muted mt-1">Average Duration</Text>
                    </View>
                    <View className="flex-1 min-w-[45%]">
                      <Text
                        className="text-2xl font-bold"
                        style={{ color: getQualityColor(stats.averageQuality) }}
                      >
                        {stats.averageQuality.toFixed(1)}/4
                      </Text>
                      <Text className="text-xs text-muted mt-1">Average Quality</Text>
                    </View>
                  </View>
                </View>

                {/* Correlation Analysis */}
                {correlation && (
                  <View className="bg-surface rounded-2xl p-5 border border-border">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl">📊</Text>
                        <Text className="text-base font-semibold text-foreground">
                          Sleep-Energy Correlation
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: getCorrelationColor(correlation.correlation) + "20",
                        }}
                      >
                        <Text
                          className="text-xs font-medium capitalize"
                          style={{ color: getCorrelationColor(correlation.correlation) }}
                        >
                          {correlation.strength}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-3 mb-4">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted">Correlation Score</Text>
                        <Text className="text-sm font-medium text-foreground">
                          {correlation.correlation.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-muted">Optimal Sleep</Text>
                        <Text className="text-sm font-medium text-success">
                          {formatDuration(correlation.optimalSleepDuration)}
                        </Text>
                      </View>
                    </View>

                    {correlation.insights.length > 0 && (
                      <>
                        <View className="h-px bg-border my-3" />
                        <View className="gap-2">
                          {correlation.insights.map((insight: string, index: number) => (
                            <View key={index} className="flex-row items-start gap-2">
                              <Text className="text-primary mt-1">•</Text>
                              <Text className="flex-1 text-sm text-muted leading-relaxed">
                                {insight}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
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

                {/* Best & Worst Nights */}
                {stats.bestNight && stats.worstNight && (
                  <View className="gap-3">
                    <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
                      <View className="flex-row items-center gap-2 mb-3">
                        <Text className="text-xl">🌟</Text>
                        <Text className="text-base font-semibold text-foreground">
                          Best Night
                        </Text>
                      </View>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Date</Text>
                          <Text className="text-sm font-medium text-foreground">
                            {stats.bestNight.date}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Duration</Text>
                          <Text className="text-sm font-medium text-success">
                            {formatDuration(stats.bestNight.duration)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Quality</Text>
                          <Text className="text-sm font-medium text-success capitalize">
                            {stats.bestNight.quality}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="bg-error/10 rounded-2xl p-5 border border-error/30">
                      <View className="flex-row items-center gap-2 mb-3">
                        <Text className="text-xl">⚠️</Text>
                        <Text className="text-base font-semibold text-foreground">
                          Worst Night
                        </Text>
                      </View>
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Date</Text>
                          <Text className="text-sm font-medium text-foreground">
                            {stats.worstNight.date}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Duration</Text>
                          <Text className="text-sm font-medium text-error">
                            {formatDuration(stats.worstNight.duration)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-muted">Quality</Text>
                          <Text className="text-sm font-medium text-error capitalize">
                            {stats.worstNight.quality}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-4xl mb-4">😴</Text>
                <Text className="text-base font-medium text-foreground mb-2">
                  No Sleep Data Yet
                </Text>
                <Text className="text-sm text-muted text-center mb-6">
                  Import sleep data from your health app to see insights
                </Text>
                <TouchableOpacity
                  onPress={handleImportSleep}
                  disabled={importing}
                  className="bg-primary px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">
                    {importing ? "Importing..." : "Import Sleep Data"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

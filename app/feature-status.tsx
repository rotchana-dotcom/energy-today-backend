/**
 * Feature Status Dashboard
 * 
 * Overview of all features with status, last activity, and quick tests
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getFeatureStats,
  type FeatureName,
} from "@/lib/activity-logger";

interface FeatureStatus {
  name: FeatureName;
  displayName: string;
  icon: string;
  route?: string;
  totalActions: number;
  successCount: number;
  errorCount: number;
  lastActivity: string | null;
  avgDuration: number | null;
}

export default function FeatureStatusScreen() {
  const colors = useColors();
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const featureDefinitions: Array<{ name: FeatureName; displayName: string; icon: string; route?: string }> = [
    { name: "diet", displayName: "Diet Tracker", icon: "🍽️", route: "/health/diet" },
    { name: "health", displayName: "Health & Chi", icon: "⚡", route: "/health/chi" },
    { name: "meditation", displayName: "Meditation Timer", icon: "🧘", route: "/meditation-timer" },
    { name: "tasks", displayName: "Task Scheduler", icon: "✅", route: "/task-scheduler" },
    { name: "calendar_sync", displayName: "Calendar Sync", icon: "📅", route: "/calendar-sync-settings" },
    { name: "business", displayName: "Business Timing", icon: "💼", route: "/business" },
    { name: "energy_forecast", displayName: "Energy Forecast", icon: "🔮", route: "/energy-forecast" },
    { name: "notifications", displayName: "Notifications", icon: "🔔" },
    { name: "system", displayName: "System", icon: "⚙️" },
  ];

  const loadFeatureStats = async () => {
    setLoading(true);
    const stats = await Promise.all(
      featureDefinitions.map(async (def) => {
        const featureStats = await getFeatureStats(def.name);
        return {
          ...def,
          ...featureStats,
        };
      })
    );
    setFeatures(stats);
    setLoading(false);
  };

  useEffect(() => {
    loadFeatureStats();
  }, []);

  const getStatusColor = (feature: FeatureStatus) => {
    if (feature.errorCount > 0) return colors.error;
    if (feature.totalActions === 0) return colors.muted;
    return colors.success;
  };

  const getStatusText = (feature: FeatureStatus) => {
    if (feature.errorCount > 0) return "Has Errors";
    if (feature.totalActions === 0) return "Not Used";
    return "Working";
  };

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleFeaturePress = (feature: FeatureStatus) => {
    if (feature.route) {
      router.push(feature.route as any);
    } else {
      Alert.alert(
        feature.displayName,
        `Total Actions: ${feature.totalActions}\nSuccess: ${feature.successCount}\nErrors: ${feature.errorCount}\nLast Activity: ${formatLastActivity(feature.lastActivity)}\nAvg Duration: ${feature.avgDuration ? `${feature.avgDuration.toFixed(0)}ms` : "N/A"}`
      );
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground">Feature Status</Text>
        <TouchableOpacity onPress={loadFeatureStats}>
          <Text className="text-primary text-base">Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm text-muted mb-4">
        Overview of all features with activity tracking
      </Text>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="items-center justify-center py-12">
            <Text className="text-muted">Loading feature stats...</Text>
          </View>
        ) : (
          <View className="gap-3">
            {features.map(feature => (
              <TouchableOpacity
                key={feature.name}
                className="bg-surface p-4 rounded-lg border border-border"
                onPress={() => handleFeaturePress(feature)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-2xl">{feature.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {feature.displayName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {formatLastActivity(feature.lastActivity)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: getStatusColor(feature) + "20" }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getStatusColor(feature) }}
                    >
                      {getStatusText(feature)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-muted">Total Actions</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {feature.totalActions}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted">Success</Text>
                    <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                      {feature.successCount}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted">Errors</Text>
                    <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                      {feature.errorCount}
                    </Text>
                  </View>
                  {feature.avgDuration !== null && (
                    <View className="flex-1">
                      <Text className="text-xs text-muted">Avg Time</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {feature.avgDuration.toFixed(0)}ms
                      </Text>
                    </View>
                  )}
                </View>

                {feature.route && (
                  <View className="mt-2 pt-2 border-t border-border">
                    <Text className="text-xs text-primary">Tap to open →</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View className="mt-4 gap-2">
        <TouchableOpacity
          className="bg-primary px-4 py-3 rounded-lg"
          onPress={() => {
            router.push("/debug-console");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text className="text-background text-center font-semibold">
            View Debug Console
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-surface px-4 py-3 rounded-lg border border-border"
          onPress={() => {
            router.push("/error-history");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text className="text-foreground text-center font-semibold">
            View Error History
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

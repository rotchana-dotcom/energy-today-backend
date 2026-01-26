/**
 * Debug Console
 * 
 * In-app console for testers to view activity logs and troubleshoot issues
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getActivityLogs,
  clearActivityLogs,
  exportLogsAsText,
  type ActivityLog,
  type LogLevel,
  type FeatureName,
} from "@/lib/activity-logger";

export default function DebugConsoleScreen() {
  const colors = useColors();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<FeatureName | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "all">("all");

  const loadLogs = async () => {
    const allLogs = await getActivityLogs();
    let filteredLogs = allLogs;

    if (selectedFeature !== "all") {
      filteredLogs = filteredLogs.filter(log => log.feature === selectedFeature);
    }

    if (selectedLevel !== "all") {
      filteredLogs = filteredLogs.filter(log => log.level === selectedLevel);
    }

    setLogs(filteredLogs);
  };

  useEffect(() => {
    loadLogs();
  }, [selectedFeature, selectedLevel]);

  const handleClearLogs = () => {
    Alert.alert(
      "Clear Logs",
      "Are you sure you want to clear all activity logs?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearActivityLogs();
            setLogs([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const text = await exportLogsAsText();
      await Share.share({
        message: text,
        title: "Energy Today Activity Logs",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to export logs");
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      case "performance":
        return colors.primary;
      default:
        return colors.muted;
    }
  };

  const getLevelEmoji = (level: LogLevel) => {
    switch (level) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "performance":
        return "⏱️";
      default:
        return "ℹ️";
    }
  };

  const features: Array<FeatureName | "all"> = [
    "all",
    "diet",
    "health",
    "meditation",
    "tasks",
    "calendar_sync",
    "business",
    "energy_forecast",
    "notifications",
    "system",
  ];

  const levels: Array<LogLevel | "all"> = ["all", "info", "warning", "error", "performance"];

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground">Debug Console</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          className="flex-1 bg-primary px-4 py-2 rounded-lg"
          onPress={loadLogs}
          style={{ opacity: 0.9 }}
        >
          <Text className="text-background text-center font-semibold">Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-surface px-4 py-2 rounded-lg border border-border"
          onPress={handleExportLogs}
        >
          <Text className="text-foreground text-center font-semibold">Export</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 px-4 py-2 rounded-lg border border-error"
          onPress={handleClearLogs}
        >
          <Text className="text-error text-center font-semibold">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Filter */}
      <View className="mb-3">
        <Text className="text-sm font-semibold text-foreground mb-2">Filter by Feature:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {features.map(feature => (
              <TouchableOpacity
                key={feature}
                className="px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: selectedFeature === feature ? colors.primary : colors.surface,
                  borderColor: colors.border,
                }}
                onPress={() => setSelectedFeature(feature)}
              >
                <Text
                  style={{
                    color: selectedFeature === feature ? colors.background : colors.foreground,
                  }}
                  className="text-sm"
                >
                  {feature}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Level Filter */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-foreground mb-2">Filter by Level:</Text>
        <View className="flex-row gap-2">
          {levels.map(level => (
            <TouchableOpacity
              key={level}
              className="px-3 py-1 rounded-full border"
              style={{
                backgroundColor: selectedLevel === level ? colors.primary : colors.surface,
                borderColor: colors.border,
              }}
              onPress={() => setSelectedLevel(level)}
            >
              <Text
                style={{
                  color: selectedLevel === level ? colors.background : colors.foreground,
                }}
                className="text-sm"
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Log Count */}
      <Text className="text-sm text-muted mb-2">
        Showing {logs.length} {logs.length === 1 ? "entry" : "entries"}
      </Text>

      {/* Logs List */}
      <ScrollView className="flex-1">
        {logs.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-muted text-center">No logs found</Text>
            <Text className="text-muted text-center text-sm mt-2">
              Activity logs will appear here as you use the app
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {logs.map(log => (
              <View
                key={log.id}
                className="bg-surface p-3 rounded-lg border border-border"
              >
                <View className="flex-row items-start justify-between mb-1">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Text className="text-base">{getLevelEmoji(log.level)}</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {log.feature}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded"
                      style={{ backgroundColor: getLevelColor(log.level) + "20" }}
                    >
                      <Text
                        className="text-xs"
                        style={{ color: getLevelColor(log.level) }}
                      >
                        {log.level}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-muted">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <Text className="text-sm text-foreground mb-1">{log.action}</Text>

                {log.details && (
                  <Text className="text-xs text-muted mb-1">{log.details}</Text>
                )}

                <View className="flex-row gap-3">
                  {log.duration !== undefined && (
                    <Text className="text-xs text-muted">⏱️ {log.duration}ms</Text>
                  )}
                  {log.success !== undefined && (
                    <Text className="text-xs text-muted">
                      {log.success ? "✅ Success" : "❌ Failed"}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

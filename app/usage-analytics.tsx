import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  getAnalyticsSummary,
  exportAnalyticsCSV,
  exportAnalyticsJSON,
  clearAnalytics,
  type AnalyticsSummary,
} from "@/lib/analytics";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function UsageAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getAnalyticsSummary();
    setSummary(data);
    setLoading(false);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csv = await exportAnalyticsCSV();
      
      const filename = `energy_today_usage_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Usage Analytics",
        });
      } else {
        Alert.alert("Success", `Analytics exported to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
      Alert.alert("Error", "Failed to export analytics data.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      const json = await exportAnalyticsJSON();
      
      const filename = `energy_today_usage_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Usage Analytics",
        });
      } else {
        Alert.alert("Success", `Analytics exported to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Failed to export JSON:", error);
      Alert.alert("Error", "Failed to export analytics data.");
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Analytics Data",
      "Are you sure you want to clear all analytics data? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAnalytics();
            await loadData();
            Alert.alert("Success", "Analytics data cleared.");
          },
        },
      ]
    );
  };

  if (loading || !summary) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Usage Analytics</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-muted -mt-4">
            Track promo code redemptions, trial metrics, and feature usage during closed testing.
          </Text>

          {/* Overview */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">OVERVIEW</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Total Events</Text>
              <Text className="text-base font-semibold text-foreground">{summary.totalEvents}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Date Range</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(summary.dateRange.start).toLocaleDateString()} - {new Date(summary.dateRange.end).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Promo Codes */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">PROMO CODE REDEMPTIONS</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Total Redemptions</Text>
              <Text className="text-base font-semibold text-foreground">{summary.promoCodeRedemptions.total}</Text>
            </View>

            {Object.keys(summary.promoCodeRedemptions.byCode).length > 0 ? (
              <View className="gap-2 mt-2">
                <Text className="text-xs text-muted">By Code:</Text>
                {Object.entries(summary.promoCodeRedemptions.byCode).map(([code, count]) => (
                  <View key={code} className="flex-row justify-between pl-4">
                    <Text className="text-xs text-foreground">{code}</Text>
                    <Text className="text-xs font-medium text-foreground">{count}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-xs text-muted italic">No promo codes redeemed yet</Text>
            )}
          </View>

          {/* Trial Metrics */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">TRIAL METRICS</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Trials Started</Text>
              <Text className="text-base font-semibold text-foreground">{summary.trialMetrics.trialsStarted}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Trials Expired</Text>
              <Text className="text-base font-semibold text-foreground">{summary.trialMetrics.trialsExpired}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Avg Days Used</Text>
              <Text className="text-base font-semibold text-foreground">{summary.trialMetrics.averageDaysUsed}</Text>
            </View>
          </View>

          {/* Feature Usage */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">FEATURE USAGE</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Total Feature Uses</Text>
              <Text className="text-base font-semibold text-foreground">{summary.featureUsage.total}</Text>
            </View>

            {Object.keys(summary.featureUsage.byFeature).length > 0 ? (
              <View className="gap-2 mt-2">
                <Text className="text-xs text-muted">Top Features:</Text>
                {Object.entries(summary.featureUsage.byFeature)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([feature, count]) => (
                    <View key={feature} className="flex-row justify-between pl-4">
                      <Text className="text-xs text-foreground">{feature}</Text>
                      <Text className="text-xs font-medium text-foreground">{count}</Text>
                    </View>
                  ))}
              </View>
            ) : (
              <Text className="text-xs text-muted italic">No feature usage tracked yet</Text>
            )}
          </View>

          {/* Engagement */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">ENGAGEMENT</Text>
            
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Daily Active Days</Text>
              <Text className="text-base font-semibold text-foreground">{summary.engagement.dailyActiveUsers}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Total Sessions</Text>
              <Text className="text-base font-semibold text-foreground">{summary.engagement.totalSessions}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Avg Session (seconds)</Text>
              <Text className="text-base font-semibold text-foreground">{summary.engagement.averageSessionDuration}</Text>
            </View>
          </View>

          {/* Export Actions */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">EXPORT DATA</Text>
            
            <TouchableOpacity
              onPress={handleExportCSV}
              disabled={exporting}
              className="bg-primary py-3 rounded-lg active:opacity-80"
            >
              {exporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center font-semibold text-white">Export as CSV</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportJSON}
              disabled={exporting}
              className="border border-primary py-3 rounded-lg active:opacity-60"
            >
              <Text className="text-center font-semibold text-primary">Export as JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearData}
              className="border border-error py-3 rounded-lg active:opacity-60 mt-2"
            >
              <Text className="text-center font-semibold text-error">Clear All Data</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-muted text-center">
            This data is stored locally on your device and is used for testing insights only.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

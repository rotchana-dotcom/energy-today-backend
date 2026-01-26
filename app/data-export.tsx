/**
 * Data Export Screen
 * 
 * Export all user data as JSON or CSV
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
  exportAsJSON,
  exportAsCSV,
  shareExportedFile,
  getExportStats,
} from "@/lib/data-export";

export default function DataExportScreen() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalHabits: 0,
    totalLogs: 0,
    totalVoiceNotes: 0,
    estimatedSize: "0 KB",
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const exportStats = await getExportStats();
      setStats(exportStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let filePath: string;
      if (format === "json") {
        filePath = await exportAsJSON();
      } else {
        filePath = await exportAsCSV();
      }

      await shareExportedFile(filePath);

      Alert.alert(
        "Export Successful",
        `Your data has been exported as ${format.toUpperCase()}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert(
        "Export Failed",
        "Failed to export your data. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setExporting(false);
    }
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
        <Text className="text-xl font-bold text-foreground">Export Data</Text>
        <View className="w-16" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading data...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Info Card */}
            <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
              <View className="flex-row items-start gap-3">
                <Text className="text-2xl">📦</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    Export Your Data
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    Download a complete backup of your Energy Today data. Choose JSON for
                    complete data or CSV for spreadsheet compatibility.
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Card */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Your Data Summary
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Journal Entries</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.totalEntries}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Habits Tracked</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.totalHabits}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Energy Logs</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.totalLogs}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Voice Notes</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.totalVoiceNotes}
                  </Text>
                </View>
                <View className="h-px bg-border my-2" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">Estimated Size</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {stats.estimatedSize}
                  </Text>
                </View>
              </View>
            </View>

            {/* Export Options */}
            <View className="gap-4">
              <Text className="text-base font-semibold text-foreground">
                Choose Export Format
              </Text>

              {/* JSON Export */}
              <TouchableOpacity
                onPress={() => handleExport("json")}
                disabled={exporting}
                className="bg-surface rounded-2xl p-5 border border-border active:opacity-70"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                    <Text className="text-2xl">📄</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      JSON Format
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      Complete data with full structure. Best for backup and data migration.
                    </Text>
                  </View>
                  {exporting ? (
                    <ActivityIndicator size="small" color="#0a7ea4" />
                  ) : (
                    <Text className="text-primary text-xl">→</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* CSV Export */}
              <TouchableOpacity
                onPress={() => handleExport("csv")}
                disabled={exporting}
                className="bg-surface rounded-2xl p-5 border border-border active:opacity-70"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-success/10 rounded-full items-center justify-center">
                    <Text className="text-2xl">📊</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      CSV Format
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      Spreadsheet-friendly format. Open in Excel, Google Sheets, or Numbers.
                    </Text>
                  </View>
                  {exporting ? (
                    <ActivityIndicator size="small" color="#22C55E" />
                  ) : (
                    <Text className="text-success text-xl">→</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Privacy Notice */}
            <View className="bg-warning/10 rounded-xl p-4 border border-warning/30">
              <View className="flex-row items-start gap-3">
                <Text className="text-xl">🔒</Text>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-1">
                    Privacy Notice
                  </Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    Your exported data contains personal information. Store it securely and
                    only share with trusted services.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

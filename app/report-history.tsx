/**
 * Report History Screen
 * 
 * Shows all generated PDF reports with preview and download options
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getReportHistory,
  deleteReport,
  type ReportMetadata,
} from "@/lib/report-history";

export default function ReportHistoryScreen() {
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportMetadata | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const history = await getReportHistory();
      setReports(history);
    } catch (error) {
      console.error("Failed to load reports:", error);
      Alert.alert("Error", "Failed to load report history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: ReportMetadata) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(report.reportUrl);
      
      if (supported) {
        await Linking.openURL(report.reportUrl);
      } else {
        Alert.alert("Error", "Cannot open report URL");
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download report");
    }
  };

  const handleDelete = async (report: ReportMetadata) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Delete Report",
      `Delete ${report.type} report for ${report.period}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReport(report.id);
              await loadReports();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete report");
            }
          },
        },
      ]
    );
  };

  const handlePreview = (report: ReportMetadata) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReport(report);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <Text className="text-xl font-bold text-foreground">Report History</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Loading reports...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Text className="text-6xl mb-4">📊</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">No Reports Yet</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Generate your first energy report from the Reports screen
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/reports" as any);
              }}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-background font-semibold">Generate Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-6 gap-4">
            {reports.map((report) => (
              <View
                key={report.id}
                className="bg-surface rounded-2xl p-5 border border-border gap-4"
              >
                {/* Report Info */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">
                        {report.type === "weekly" ? "📅" : "📊"}
                      </Text>
                      <Text className="text-base font-semibold text-foreground capitalize">
                        {report.type} Report
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        report.type === "weekly" ? "bg-primary/10" : "bg-success/10"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          report.type === "weekly" ? "text-primary" : "text-success"
                        }`}
                      >
                        {report.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-sm text-foreground">{report.period}</Text>
                  <Text className="text-xs text-muted">
                    Generated {formatDate(report.generatedAt)}
                  </Text>
                </View>

                {/* Preview (if content available) */}
                {selectedReport?.id === report.id && report.reportContent && (
                  <View className="bg-background rounded-xl p-4 border border-border">
                    <Text className="text-xs text-muted mb-2">PREVIEW</Text>
                    <ScrollView
                      className="max-h-40"
                      showsVerticalScrollIndicator={true}
                    >
                      <Text className="text-sm text-foreground">
                        {report.reportContent.substring(0, 500)}...
                      </Text>
                    </ScrollView>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-2">
                  {report.reportContent && (
                    <TouchableOpacity
                      onPress={() => handlePreview(report)}
                      className="flex-1 bg-primary/10 py-3 rounded-xl items-center"
                    >
                      <Text className="text-primary font-medium text-sm">
                        {selectedReport?.id === report.id ? "Hide Preview" : "Preview"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => handleDownload(report)}
                    className="flex-1 bg-primary py-3 rounded-xl items-center"
                  >
                    <Text className="text-background font-medium text-sm">Download</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(report)}
                    className="bg-error/10 py-3 px-4 rounded-xl items-center"
                  >
                    <Text className="text-error font-medium text-sm">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

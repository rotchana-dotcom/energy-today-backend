/**
 * Reports Screen
 * 
 * Generate and download AI-powered weekly/monthly energy reports
 */

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { getJournalEntries, getUserProfile } from "@/lib/storage";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import * as Haptics from "expo-haptics";
import { saveReportMetadata } from "@/lib/report-history";

export default function ReportsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<"weekly" | "monthly" | null>(null);

  const weeklyMutation = trpc.pdfReport.generateWeeklyReport.useMutation();
  const monthlyMutation = trpc.pdfReport.generateMonthlyReport.useMutation();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const subscription = await getSubscriptionStatus();
    setIsPro(subscription.isPro);
    setLoading(false);
  };

  const generateWeeklyReport = async () => {
    try {
      setGenerating(true);
      setReportType("weekly");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get last 7 days of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const profile = await getUserProfile();
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Generate energy data for last 7 days
      const energyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        const dailyEnergy = calculateUnifiedEnergy(profile, new Date(dateStr));
        energyData.push({
          date: dateStr,
          score: dailyEnergy.combinedAnalysis.perfectDayScore,
          type: dailyEnergy.combinedAnalysis.energyType,
          intensity: dailyEnergy.combinedAnalysis.intensity > 70 ? "high" : dailyEnergy.combinedAnalysis.intensity > 40 ? "moderate" : "low",
        });
      }

      // Generate report
      const result = await weeklyMutation.mutateAsync({
        userId: "current-user",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        energyData,
      });

      if (result.success && result.reportUrl) {
        // Save to history
        await saveReportMetadata({
          id: `weekly-${Date.now()}`,
          type: "weekly",
          generatedAt: new Date().toISOString(),
          period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          reportUrl: result.reportUrl,
          reportContent: result.reportContent,
        });
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Open PDF in browser
        await Linking.openURL(result.reportUrl);
      }
    } catch (error) {
      console.error("Weekly report generation error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGenerating(false);
      setReportType(null);
    }
  };

  const generateMonthlyReport = async () => {
    try {
      setGenerating(true);
      setReportType("monthly");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get last 30 days of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);

      const profile = await getUserProfile();
      if (!profile) {
        throw new Error("Profile not found");
      }

      // Generate energy data for last 30 days
      const energyData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        const dailyEnergy = calculateUnifiedEnergy(profile, new Date(dateStr));
        energyData.push({
          date: dateStr,
          score: dailyEnergy.combinedAnalysis.perfectDayScore,
          type: dailyEnergy.combinedAnalysis.energyType,
          intensity: dailyEnergy.combinedAnalysis.intensity > 70 ? "high" : dailyEnergy.combinedAnalysis.intensity > 40 ? "moderate" : "low",
        });
      }

      // Generate report
      const month = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const result = await monthlyMutation.mutateAsync({
        userId: "current-user",
        month,
        energyData,
      });

      if (result.success && result.reportUrl) {
        // Save to history
        await saveReportMetadata({
          id: `monthly-${Date.now()}`,
          type: "monthly",
          generatedAt: new Date().toISOString(),
          period: monthName,
          reportUrl: result.reportUrl,
          reportContent: result.reportContent,
        });
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Open PDF in browser
        await Linking.openURL(result.reportUrl);
      }
    } catch (error) {
      console.error("Monthly report generation error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGenerating(false);
      setReportType(null);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  if (!isPro) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-6">
            {/* Header */}
            <View>
              <Text className="text-2xl font-bold text-foreground">AI Reports</Text>
              <Text className="text-sm text-muted mt-1">
                Generate beautiful PDF reports with AI insights
              </Text>
            </View>

            {/* Pro Feature Lock */}
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30 gap-4">
              <Text className="text-4xl text-center">📊</Text>
              <Text className="text-lg font-bold text-foreground text-center">
                Pro Feature
              </Text>
              <Text className="text-sm text-muted text-center">
                Unlock AI-powered weekly and monthly reports with deep insights, pattern recognition, and strategic recommendations.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/upgrade");
                }}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold text-center">Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>

            {/* Feature Preview */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-muted">WHAT YOU'LL GET:</Text>
              
              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-sm font-medium text-foreground">📈 Weekly Reports</Text>
                <Text className="text-xs text-muted">
                  7-day energy analysis with best days, challenging days, and recommendations
                </Text>
              </View>

              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-sm font-medium text-foreground">📅 Monthly Reports</Text>
                <Text className="text-xs text-muted">
                  30-day deep dive with trends, patterns, achievements, and strategic insights
                </Text>
              </View>

              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-sm font-medium text-foreground">🤖 AI Analysis</Text>
                <Text className="text-xs text-muted">
                  Advanced pattern recognition and personalized recommendations
                </Text>
              </View>

              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <Text className="text-sm font-medium text-foreground">📄 Beautiful PDFs</Text>
                <Text className="text-xs text-muted">
                  Professional reports you can share with your team or coach
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">AI Reports</Text>
              <Text className="text-sm text-muted mt-1">
                Generate beautiful PDF reports with AI insights
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/report-history" as any);
              }}
              className="bg-primary/10 px-4 py-2 rounded-full"
            >
              <Text className="text-primary font-medium text-sm">History</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Report */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">📈</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">Weekly Report</Text>
                <Text className="text-xs text-muted">Last 7 days analysis</Text>
              </View>
            </View>

            <Text className="text-sm text-muted">
              Get a comprehensive 7-day energy analysis with insights on your best days, challenging moments, and specific recommendations for next week.
            </Text>

            <TouchableOpacity
              onPress={generateWeeklyReport}
              disabled={generating}
              className={`${generating && reportType === "weekly" ? "bg-primary/50" : "bg-primary"} px-6 py-3 rounded-full flex-row items-center justify-center gap-2`}
            >
              {generating && reportType === "weekly" ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-semibold">Generating...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold">Generate Weekly Report</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Monthly Report */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">📅</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">Monthly Report</Text>
                <Text className="text-xs text-muted">Last 30 days analysis</Text>
              </View>
            </View>

            <Text className="text-sm text-muted">
              Get a deep 30-day analysis with trend identification, pattern recognition, key achievements, and strategic recommendations for next month.
            </Text>

            <TouchableOpacity
              onPress={generateMonthlyReport}
              disabled={generating}
              className={`${generating && reportType === "monthly" ? "bg-primary/50" : "bg-primary"} px-6 py-3 rounded-full flex-row items-center justify-center gap-2`}
            >
              {generating && reportType === "monthly" ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-semibold">Generating...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold">Generate Monthly Report</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <Text className="text-xs text-muted">
              💡 Reports are generated using AI and include personalized insights based on your energy data. PDFs will open in your browser and can be downloaded or shared.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

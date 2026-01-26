/**
 * Streak Recovery Screen
 * 
 * Freeze streak once per month
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  canFreezeStreak,
  freezeStreak,
  getFreezeStats,
  getFreezeHistory,
} from "@/lib/streak-recovery";

export default function StreakRecoveryScreen() {
  const [loading, setLoading] = useState(true);
  const [freezing, setFreezing] = useState(false);
  const [canFreeze, setCanFreeze] = useState(false);
  const [reason, setReason] = useState("");
  const [stats, setStats] = useState({
    totalFreezesUsed: 0,
    freezesThisMonth: 0,
    freezesRemaining: 0,
    lastFreezeDate: null as string | null,
    nextResetDate: "",
  });
  const [history, setHistory] = useState<Array<{ date: string; reason?: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [freezeCheck, freezeStats, freezeHistory] = await Promise.all([
        canFreezeStreak(),
        getFreezeStats(),
        getFreezeHistory(),
      ]);

      setCanFreeze(freezeCheck.canFreeze);
      setStats(freezeStats);
      setHistory(freezeHistory);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async () => {
    try {
      setFreezing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await freezeStreak(reason.trim() || undefined);

      if (result.success) {
        Alert.alert("Success!", result.message, [
          {
            text: "OK",
            onPress: () => {
              setReason("");
              loadData();
            },
          },
        ]);
      } else {
        Alert.alert("Cannot Freeze", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Failed to freeze streak:", error);
      Alert.alert("Error", "Failed to freeze streak. Please try again.", [{ text: "OK" }]);
    } finally {
      setFreezing(false);
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
        <Text className="text-xl font-bold text-foreground">Streak Recovery</Text>
        <View className="w-16" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Info Card */}
            <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
              <View className="flex-row items-start gap-3">
                <Text className="text-2xl">🛡️</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    Protect Your Streak
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed">
                    Life happens! Use a streak freeze to protect your progress during illness,
                    travel, or busy days. You get 1 freeze per month.
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Card */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Freeze Status
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Freezes Remaining</Text>
                  <Text className="text-lg font-bold text-primary">
                    {stats.freezesRemaining}/1
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Used This Month</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.freezesThisMonth}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Total Used</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.totalFreezesUsed}
                  </Text>
                </View>
                <View className="h-px bg-border my-2" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Next Reset</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {new Date(stats.nextResetDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Freeze Action */}
            {canFreeze ? (
              <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
                <Text className="text-base font-semibold text-foreground">
                  Freeze Your Streak Today
                </Text>
                <View>
                  <Text className="text-sm text-muted mb-2">
                    Reason (optional)
                  </Text>
                  <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="e.g., Traveling, Sick, Busy day"
                    placeholderTextColor="#9BA1A6"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleFreeze}
                  disabled={freezing}
                  className="bg-primary rounded-xl py-4 items-center active:opacity-80"
                >
                  {freezing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Freeze Streak for Today
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-warning/10 rounded-2xl p-5 border border-warning/30">
                <View className="flex-row items-start gap-3">
                  <Text className="text-xl">⚠️</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-1">
                      Cannot Freeze
                    </Text>
                    <Text className="text-xs text-muted leading-relaxed">
                      {stats.freezesRemaining === 0
                        ? `You've used your freeze for this month. Next reset: ${new Date(
                            stats.nextResetDate
                          ).toLocaleDateString()}`
                        : "Your streak is already frozen for today."}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Freeze History */}
            {history.length > 0 && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Freeze History
                </Text>
                <View className="gap-3">
                  {history.slice(0, 5).map((freeze, index) => (
                    <View key={index} className="flex-row items-start gap-3">
                      <View className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">
                          {new Date(freeze.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        {freeze.reason && (
                          <Text className="text-xs text-muted mt-1">{freeze.reason}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                  {history.length > 5 && (
                    <Text className="text-xs text-muted text-center mt-2">
                      +{history.length - 5} more
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Tips */}
            <View className="bg-success/10 rounded-xl p-4 border border-success/30">
              <View className="flex-row items-start gap-3">
                <Text className="text-xl">💡</Text>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">Pro Tips</Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    • Freezes reset on the 1st of each month{"\n"}
                    • Use freezes strategically for planned breaks{"\n"}
                    • Your streak stays intact during freeze days{"\n"}
                    • Unused freezes don't carry over to next month
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

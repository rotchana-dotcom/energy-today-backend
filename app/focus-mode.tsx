/**
 * Focus Mode Screen
 * 
 * Start and manage focus sessions
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getActiveFocusSession,
  startFocusSession,
  endFocusSession,
  getFocusSettings,
  saveFocusSettings,
  getFocusStats,
  getRemainingTime,
  type FocusSession,
  type FocusSettings,
} from "@/lib/focus-mode";

export default function FocusModeScreen() {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [settings, setSettings] = useState<FocusSettings | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [session, settingsData, statsData] = await Promise.all([
        getActiveFocusSession(),
        getFocusSettings(),
        getFocusStats(7),
      ]);
      setActiveSession(session);
      setSettings(settingsData);
      setStats(statsData);
      if (session) {
        setRemainingMinutes(getRemainingTime(session));
      }
    } catch (error) {
      console.error("Failed to load focus data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRemainingTime = async () => {
    if (activeSession) {
      const remaining = getRemainingTime(activeSession);
      setRemainingMinutes(remaining);
      if (remaining === 0) {
        await handleEndSession(true);
      }
    }
  };

  const handleStartSession = async (duration: number) => {
    try {
      const session = await startFocusSession(duration, 75); // Mock energy level
      setActiveSession(session);
      setRemainingMinutes(duration);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to start focus session");
    }
  };

  const handleEndSession = async (completed: boolean) => {
    if (!activeSession) return;

    try {
      await endFocusSession(activeSession.id, completed);
      setActiveSession(null);
      setRemainingMinutes(0);
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to end focus session");
    }
  };

  const handleSettingChange = async (key: keyof FocusSettings, value: any) => {
    if (!settings) return;

    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await saveFocusSettings({ [key]: value });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
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
        <Text className="text-xl font-bold text-foreground">Focus Mode</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 gap-6">
          {/* Active Session */}
          {activeSession ? (
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30 items-center">
              <Text className="text-sm text-muted mb-2">Focus Session Active</Text>
              <Text className="text-5xl font-bold text-primary mb-4">
                {formatTime(remainingMinutes)}
              </Text>
              <Text className="text-sm text-muted mb-6">remaining</Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleEndSession(false)}
                  className="bg-error px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEndSession(true)}
                  className="bg-success px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Start Session Options */}
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Start Focus Session
                </Text>
                <View className="gap-3">
                  {[15, 25, 45, 60].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      onPress={() => handleStartSession(duration)}
                      className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex-row items-center justify-between"
                    >
                      <View>
                        <Text className="text-base font-medium text-foreground">
                          {duration} Minutes
                        </Text>
                        <Text className="text-xs text-muted">
                          {duration === 25 ? "Pomodoro" : duration === 15 ? "Quick Focus" : "Deep Work"}
                        </Text>
                      </View>
                      <View className="bg-primary w-10 h-10 rounded-full items-center justify-center">
                        <Text className="text-white text-lg">▶</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Statistics */}
              {stats && stats.totalSessions > 0 && (
                <View className="bg-surface rounded-2xl p-5 border border-border">
                  <Text className="text-base font-semibold text-foreground mb-4">
                    Focus Stats (7 Days)
                  </Text>
                  <View className="gap-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Total Sessions</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {stats.totalSessions}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Completed</Text>
                      <Text className="text-base font-semibold text-success">
                        {stats.completedSessions} ({stats.completionRate}%)
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Total Time</Text>
                      <Text className="text-base font-semibold text-primary">
                        {formatTime(stats.totalMinutes)}
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">Best Time</Text>
                      <Text className="text-base font-semibold text-foreground">
                        {stats.bestTimeOfDay}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Settings */}
          {settings && !activeSession && (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">Settings</Text>
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Auto-Start</Text>
                    <Text className="text-xs text-muted">
                      Start during high energy
                    </Text>
                  </View>
                  <Switch
                    value={settings.autoStartDuringHighEnergy}
                    onValueChange={(value) =>
                      handleSettingChange("autoStartDuringHighEnergy", value)
                    }
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      Block Notifications
                    </Text>
                    <Text className="text-xs text-muted">
                      Silence alerts during focus
                    </Text>
                  </View>
                  <Switch
                    value={settings.blockNotifications}
                    onValueChange={(value) => handleSettingChange("blockNotifications", value)}
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Show Timer</Text>
                    <Text className="text-xs text-muted">
                      Display countdown
                    </Text>
                  </View>
                  <Switch
                    value={settings.showTimer}
                    onValueChange={(value) => handleSettingChange("showTimer", value)}
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Allow Breaks</Text>
                    <Text className="text-xs text-muted">
                      Pomodoro-style breaks
                    </Text>
                  </View>
                  <Switch
                    value={settings.allowBreaks}
                    onValueChange={(value) => handleSettingChange("allowBreaks", value)}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

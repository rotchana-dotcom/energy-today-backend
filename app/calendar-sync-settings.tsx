/**
 * Calendar Sync Settings Screen
 * 
 * Configure which features sync to Google Calendar
 */

import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getCalendarSyncSettings,
  saveCalendarSyncSettings,
  type CalendarSyncSettings,
} from "@/lib/calendar-sync-helper";
import { isGoogleCalendarConnected, connectGoogleCalendar } from "@/lib/google-calendar";
import { syncSpiritualEventsToCalendar } from "@/lib/spiritual-calendar-sync";

export default function CalendarSyncSettingsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState<CalendarSyncSettings>({
    diet: false,
    health: false,
    fitness: false,
    meditation: false,
    business: false,
    schedule: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const isConnected = await isGoogleCalendarConnected();
    setConnected(isConnected);

    const syncSettings = await getCalendarSyncSettings();
    setSettings(syncSettings);
    setLoading(false);
  };

  const handleConnect = async () => {
    const success = await connectGoogleCalendar();
    if (success) {
      setConnected(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Google Calendar connected!");
    } else {
      Alert.alert("Error", "Failed to connect Google Calendar");
    }
  };

  const toggleFeature = async (feature: keyof CalendarSyncSettings) => {
    if (!connected) {
      Alert.alert("Not Connected", "Please connect Google Calendar first");
      return;
    }

    const newSettings = { ...settings, [feature]: !settings[feature] };
    setSettings(newSettings);
    await saveCalendarSyncSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const features = [
    {
      key: "diet" as keyof CalendarSyncSettings,
      icon: "🍽️",
      title: "Diet & Meals",
      description: "Sync meal times and food logs to calendar",
    },
    {
      key: "health" as keyof CalendarSyncSettings,
      icon: "❤️",
      title: "Health Activities",
      description: "Sync health check-ins and activities",
    },
    {
      key: "fitness" as keyof CalendarSyncSettings,
      icon: "💪",
      title: "Fitness Workouts",
      description: "Sync workout sessions and exercises",
    },
    {
      key: "meditation" as keyof CalendarSyncSettings,
      icon: "🧘",
      title: "Meditation Sessions",
      description: "Sync meditation practice times",
    },
    {
      key: "business" as keyof CalendarSyncSettings,
      icon: "💼",
      title: "Business Activities",
      description: "Sync business meetings and tasks",
    },
    {
      key: "schedule" as keyof CalendarSyncSettings,
      icon: "✅",
      title: "Scheduled Tasks",
      description: "Sync task scheduler to calendar",
    },
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Calendar Sync
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Connection Status */}
        <View
          className="p-5 rounded-xl mb-6"
          style={{
            backgroundColor: connected ? colors.success + "20" : colors.surface,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">📅</Text>
              <View>
                <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                  Google Calendar
                </Text>
                <Text
                  className="text-sm"
                  style={{
                    color: connected ? colors.success : colors.muted,
                  }}
                >
                  {connected ? "Connected" : "Not connected"}
                </Text>
              </View>
            </View>
            {!connected && (
              <TouchableOpacity
                onPress={handleConnect}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.background }}>
                  Connect
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {connected
              ? "Your activities will be synced to Google Calendar based on the settings below"
              : "Connect your Google Calendar to sync activities automatically"}
          </Text>
        </View>

        {/* Feature Toggles */}
        <Text className="text-lg font-semibold mb-4" style={{ color: colors.foreground }}>
          Sync Features
        </Text>

        {features.map((feature) => (
          <View
            key={feature.key}
            className="p-4 rounded-xl mb-3"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-3">
                <Text className="text-2xl">{feature.icon}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                    {feature.title}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings[feature.key]}
                onValueChange={() => toggleFeature(feature.key)}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor={colors.background}
                disabled={!connected}
              />
            </View>
          </View>
        ))}

        {/* Spiritual Events Sync */}
        <Text className="text-lg font-semibold mb-4 mt-6" style={{ color: colors.foreground }}>
          Spiritual Timing Events
        </Text>
        <View className="p-4 rounded-xl mb-3" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center gap-3 mb-3">
            <Text className="text-2xl">🌙</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                Sync Lunar Phases & Spiritual Events
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Add lunar phases and spiritual timing to your calendar for the next 30 days
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={async () => {
              if (!connected) {
                Alert.alert("Not Connected", "Please connect Google Calendar first");
                return;
              }
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLoading(true);
              const result = await syncSpiritualEventsToCalendar();
              setLoading(false);
              if (result.success) {
                Alert.alert(
                  "Sync Complete",
                  `${result.eventsSynced} spiritual events synced to your calendar`
                );
              } else {
                Alert.alert("Sync Failed", result.error || "Unknown error");
              }
            }}
            className="px-4 py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
            disabled={!connected || loading}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.background }}>
              {loading ? "Syncing..." : "Sync Spiritual Events"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: colors.primary + "20" }}>
          <Text className="text-sm" style={{ color: colors.foreground }}>
            <Text className="font-semibold">💡 Tip:</Text> Enable sync for features you want to track in
            your calendar. Spiritual events (lunar phases, etc.) are synced separately and appear automatically.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

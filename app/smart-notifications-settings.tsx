import { useState, useEffect } from "react";
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
import { useColors } from "@/hooks/use-colors";
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationStats,
  getNotificationInsights,
  scheduleHabitReminder,
  scheduleMealReminder,
  scheduleHydrationReminder,
  scheduleMovementReminder,
  scheduleSleepReminder,
  scheduleEnergyCheckIn,
  type NotificationSettings,
} from "@/lib/smart-notifications";

export default function SmartNotificationsSettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const notifSettings = await getNotificationSettings();
    setSettings(notifSettings);

    const notifStats = await getNotificationStats(30);
    setStats(notifStats);

    const notifInsights = await getNotificationInsights();
    setInsights(notifInsights);
  };

  const handleToggleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;

    await updateNotificationSettings({ [key]: value });
    setSettings({ ...settings, [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleScheduleTestNotifications = async () => {
    try {
      await scheduleHabitReminder("Morning Exercise", "08:00");
      await scheduleMealReminder("breakfast", "08:30");
      await scheduleHydrationReminder("10:00");
      await scheduleMovementReminder("14:00");
      await scheduleSleepReminder("22:00");
      await scheduleEnergyCheckIn("12:00");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Test notifications scheduled for today");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to schedule notifications");
    }
  };

  if (!settings) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Smart Notifications
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Stats Overview */}
        {stats && stats.totalSent > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              30-Day Stats
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalSent}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Sent
                </Text>
              </View>
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.totalActed}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Acted
                </Text>
              </View>
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.engagementRate)}%
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Engagement
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Insights
            </Text>
            {insights.map((insight, index) => (
              <View
                key={index}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  {insight}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Notification Types */}
        <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
          Notification Types
        </Text>
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Habit Reminders</Text>
            <Switch
              value={settings.habitReminders}
              onValueChange={(value) => handleToggleSetting("habitReminders", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Meal Reminders</Text>
            <Switch
              value={settings.mealReminders}
              onValueChange={(value) => handleToggleSetting("mealReminders", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Hydration Reminders</Text>
            <Switch
              value={settings.hydrationReminders}
              onValueChange={(value) => handleToggleSetting("hydrationReminders", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Movement Reminders</Text>
            <Switch
              value={settings.movementReminders}
              onValueChange={(value) => handleToggleSetting("movementReminders", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Sleep Reminders</Text>
            <Switch
              value={settings.sleepReminders}
              onValueChange={(value) => handleToggleSetting("sleepReminders", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Text style={{ color: colors.foreground }}>Energy Check-Ins</Text>
            <Switch
              value={settings.energyCheckIns}
              onValueChange={(value) => handleToggleSetting("energyCheckIns", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Smart Features */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          Smart Features
        </Text>
        <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-4">
              <Text style={{ color: colors.foreground }}>Adaptive Timing</Text>
              <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                AI learns your patterns and adjusts timing
              </Text>
            </View>
            <Switch
              value={settings.adaptiveTiming}
              onValueChange={(value) => handleToggleSetting("adaptiveTiming", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1 mr-4">
              <Text style={{ color: colors.foreground }}>Batch Notifications</Text>
              <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                Combine multiple reminders to reduce interruptions
              </Text>
            </View>
            <Switch
              value={settings.batchNotifications}
              onValueChange={(value) => handleToggleSetting("batchNotifications", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text style={{ color: colors.foreground }}>Respect Do Not Disturb</Text>
              <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                Honor system Do Not Disturb settings
              </Text>
            </View>
            <Switch
              value={settings.respectDoNotDisturb}
              onValueChange={(value) => handleToggleSetting("respectDoNotDisturb", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Test Button */}
        <TouchableOpacity
          onPress={handleScheduleTestNotifications}
          className="p-4 rounded-xl mb-4 items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.background }}>
            Schedule Test Notifications
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.background, opacity: 0.8 }}>
            Test all notification types
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

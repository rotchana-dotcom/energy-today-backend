/**
 * Notification Settings Screen
 * 
 * Configure weekly digest notifications
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getDigestPreferences,
  saveDigestPreferences,
  testDigestNotification,
  type DigestPreferences,
} from "@/lib/weekly-digest";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function NotificationSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [prefs, setPrefs] = useState<DigestPreferences>({
    enabled: false,
    dayOfWeek: 0,
    hour: 19,
    minute: 0,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await getDigestPreferences();
      setPrefs(preferences);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      Alert.alert("Error", "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await saveDigestPreferences(prefs);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved!", "Notification settings updated successfully");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      Alert.alert("Error", "Failed to save notification settings");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await testDigestNotification();
      Alert.alert("Test Sent!", "Check your notifications in a few seconds");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to send test notification:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send test notification");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setTesting(false);
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
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
        <Text className="text-xl font-bold text-foreground">Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Loading settings...</Text>
          </View>
        ) : (
          <View className="p-6 gap-6">
            {/* Enable/Disable */}
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-bold text-foreground mb-1">
                    Weekly Digest
                  </Text>
                  <Text className="text-sm text-muted">
                    Receive a weekly summary of your energy patterns and insights
                  </Text>
                </View>
                <Switch
                  value={prefs.enabled}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPrefs({ ...prefs, enabled: value });
                  }}
                  trackColor={{ false: "#E5E7EB", true: "#0a7ea4" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Schedule Settings */}
            {prefs.enabled && (
              <>
                {/* Day of Week */}
                <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                  <Text className="text-sm font-medium text-muted">DAY OF WEEK</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setPrefs({ ...prefs, dayOfWeek: index });
                          }}
                          className={`px-4 py-2 rounded-full ${
                            prefs.dayOfWeek === index
                              ? "bg-primary"
                              : "bg-background border border-border"
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              prefs.dayOfWeek === index ? "text-white" : "text-foreground"
                            }`}
                          >
                            {day.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Time */}
                <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                  <Text className="text-sm font-medium text-muted">TIME</Text>
                  <View className="flex-row items-center gap-3">
                    {/* Hour Picker */}
                    <View className="flex-1">
                      <Text className="text-xs text-muted mb-2">HOUR</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="max-h-12"
                      >
                        <View className="flex-row gap-2">
                          {HOURS.map((hour) => (
                            <TouchableOpacity
                              key={hour}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setPrefs({ ...prefs, hour });
                              }}
                              className={`px-3 py-2 rounded-lg ${
                                prefs.hour === hour
                                  ? "bg-primary"
                                  : "bg-background border border-border"
                              }`}
                            >
                              <Text
                                className={`text-sm font-medium ${
                                  prefs.hour === hour ? "text-white" : "text-foreground"
                                }`}
                              >
                                {hour % 12 || 12} {hour >= 12 ? "PM" : "AM"}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </View>

                  {/* Current Selection */}
                  <View className="bg-primary/10 rounded-lg p-3">
                    <Text className="text-sm text-foreground text-center">
                      Scheduled for{" "}
                      <Text className="font-bold">
                        {DAYS_OF_WEEK[prefs.dayOfWeek]}s at {formatTime(prefs.hour, prefs.minute)}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Test Notification */}
                <TouchableOpacity
                  onPress={handleTest}
                  disabled={testing}
                  className="bg-surface border border-border rounded-xl p-4 flex-row items-center justify-center gap-2"
                >
                  {testing ? (
                    <>
                      <ActivityIndicator size="small" color="#0A7EA4" />
                      <Text className="text-primary font-medium">Sending Test...</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-lg">🔔</Text>
                      <Text className="text-foreground font-medium">Send Test Notification</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Info Box */}
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
              <Text className="text-sm text-foreground">
                💡 <Text className="font-medium">Tip:</Text> Weekly digests include your best and
                worst energy days, average scores, and personalized recommendations based on your
                patterns.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={`${
                saving ? "bg-primary/50" : "bg-primary"
              } px-6 py-4 rounded-full flex-row items-center justify-center gap-2`}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-semibold text-lg">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold text-lg">Save Settings</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

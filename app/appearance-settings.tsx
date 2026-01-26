/**
 * Appearance Settings Screen
 * 
 * Customize theme colors and contrast
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
  getThemeCustomization,
  saveThemeCustomization,
  resetTheme,
  PRESET_COLORS,
  type ThemeCustomization,
} from "@/lib/theme-customization";

export default function AppearanceSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<ThemeCustomization>({
    accentColor: "#0A7EA4",
    contrast: "normal",
  });

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const savedTheme = await getThemeCustomization();
      setTheme(savedTheme);
    } catch (error) {
      console.error("Failed to load theme:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveThemeCustomization(theme);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Theme Saved",
        "Your appearance settings have been saved. Restart the app to see all changes.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save theme settings", [{ text: "OK" }]);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Theme",
      "Are you sure you want to reset to default theme?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetTheme();
            loadTheme();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
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
        <Text className="text-xl font-bold text-foreground">Appearance</Text>
        <TouchableOpacity onPress={handleReset} className="py-2">
          <Text className="text-error text-sm">Reset</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading settings...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Preview Card */}
            <View
              className="rounded-2xl p-5 border-2"
              style={{ borderColor: theme.accentColor }}
            >
              <View className="flex-row items-center gap-3 mb-3">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.accentColor + "20" }}
                >
                  <Text className="text-2xl">🎨</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Theme Preview
                  </Text>
                  <Text className="text-sm text-muted">
                    See your customization
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Text className="text-white font-semibold">Sample Button</Text>
              </TouchableOpacity>
            </View>

            {/* Accent Color */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Accent Color
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => {
                      setTheme({ ...theme, accentColor: color.value });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="items-center gap-2"
                    style={{ width: "30%" }}
                  >
                    <View
                      className="w-16 h-16 rounded-2xl border-2"
                      style={{
                        backgroundColor: color.value,
                        borderColor:
                          theme.accentColor === color.value ? color.value : "transparent",
                        borderWidth: theme.accentColor === color.value ? 3 : 0,
                      }}
                    />
                    <Text className="text-xs text-muted text-center">{color.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contrast */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Contrast Level
              </Text>
              <View className="gap-3">
                {(["low", "normal", "high"] as const).map((contrast) => (
                  <TouchableOpacity
                    key={contrast}
                    onPress={() => {
                      setTheme({ ...theme, contrast });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${
                      theme.contrast === contrast
                        ? "bg-primary/10"
                        : "bg-background"
                    }`}
                    style={{
                      borderColor:
                        theme.contrast === contrast ? theme.accentColor : "#E5E7EB",
                    }}
                  >
                    <View>
                      <Text className="text-sm font-medium text-foreground capitalize">
                        {contrast} Contrast
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {contrast === "low" && "Softer colors, easier on eyes"}
                        {contrast === "normal" && "Balanced appearance"}
                        {contrast === "high" && "Enhanced readability"}
                      </Text>
                    </View>
                    {theme.contrast === contrast && (
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        <Text className="text-white text-xs">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info */}
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
              <View className="flex-row items-start gap-3">
                <Text className="text-xl">ℹ️</Text>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-1">
                    Note
                  </Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    Some changes may require restarting the app to take full effect. Your
                    preferences are saved automatically.
                  </Text>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: theme.accentColor }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Save Appearance Settings
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getSyncSettings,
  updateSyncSettings,
  getBiometricStats,
  analyzeBiometricEnergyCorrelation,
  getBiometricInsights,
  syncAppleHealth,
  syncGoogleFit,
  addManualBiometricReading,
  getBiometricReadingsByType,
  type SyncSettings,
  type BiometricStats,
  type BiometricCorrelation,
  type BiometricReading,
} from "@/lib/biometric-sync";

export default function BiometricSyncScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [stats, setStats] = useState<BiometricStats | null>(null);
  const [correlations, setCorrelations] = useState<BiometricCorrelation[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [recentReadings, setRecentReadings] = useState<BiometricReading[]>([]);

  const [manualEntry, setManualEntry] = useState({
    type: "heart_rate" as BiometricReading["type"],
    value: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const syncSettings = await getSyncSettings();
    setSettings(syncSettings);

    const biometricStats = await getBiometricStats(30);
    setStats(biometricStats);

    const biometricCorrelations = await analyzeBiometricEnergyCorrelation();
    setCorrelations(biometricCorrelations);

    const biometricInsights = await getBiometricInsights();
    setInsights(biometricInsights);

    const heartRateReadings = await getBiometricReadingsByType("heart_rate", 7);
    setRecentReadings(heartRateReadings.slice(-10));
  };

  const handleSync = async () => {
    setSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let result;
    if (Platform.OS === "ios") {
      result = await syncAppleHealth();
    } else {
      result = await syncGoogleFit();
    }

    setSyncing(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", result.message);
      await loadData();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.message);
    }
  };

  const handleToggleSetting = async (key: keyof SyncSettings, value: boolean) => {
    if (!settings) return;

    await updateSyncSettings({ [key]: value });
    setSettings({ ...settings, [key]: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleManualEntry = async () => {
    const value = parseFloat(manualEntry.value);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }

    const units: Record<BiometricReading["type"], string> = {
      heart_rate: "bpm",
      hrv: "ms",
      steps: "steps",
      distance: "km",
      workout: "minutes",
      resting_hr: "bpm",
    };

    await addManualBiometricReading(manualEntry.type, value, units[manualEntry.type]);
    await loadData();
    setManualEntry({ type: "heart_rate", value: "" });
    setShowManualEntry(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.5) return colors.success;
    if (correlation > 0) return colors.primary;
    if (correlation > -0.5) return colors.warning;
    return colors.error;
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return "Very Strong";
    if (abs > 0.5) return "Strong";
    if (abs > 0.3) return "Moderate";
    return "Weak";
  };

  if (showManualEntry) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowManualEntry(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Manual Entry
            </Text>
            <TouchableOpacity onPress={handleManualEntry}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Metric Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(
              [
                { type: "heart_rate" as const, label: "Heart Rate" },
                { type: "hrv" as const, label: "HRV" },
                { type: "steps" as const, label: "Steps" },
                { type: "resting_hr" as const, label: "Resting HR" },
              ]
            ).map((item) => (
              <TouchableOpacity
                key={item.type}
                onPress={() => {
                  setManualEntry({ ...manualEntry, type: item.type });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: manualEntry.type === item.type ? colors.primary : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: manualEntry.type === item.type ? colors.background : colors.foreground,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Value
          </Text>
          <TextInput
            value={manualEntry.value}
            onChangeText={(text) => setManualEntry({ ...manualEntry, value: text })}
            keyboardType="numeric"
            placeholder={
              manualEntry.type === "heart_rate"
                ? "e.g., 72"
                : manualEntry.type === "hrv"
                ? "e.g., 55"
                : manualEntry.type === "steps"
                ? "e.g., 8000"
                : "e.g., 65"
            }
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />
        </ScrollView>
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
            Biometric Sync
          </Text>
          <TouchableOpacity onPress={() => setShowManualEntry(true)}>
            <Text className="text-3xl" style={{ color: colors.primary }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          onPress={handleSync}
          disabled={syncing}
          className="p-4 rounded-xl mb-4 items-center"
          style={{ backgroundColor: colors.primary, opacity: syncing ? 0.6 : 1 }}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.background }}>
            {syncing
              ? "Syncing..."
              : Platform.OS === "ios"
              ? "Sync with Apple Health"
              : "Sync with Google Fit"}
          </Text>
          {settings?.lastSyncTime && (
            <Text className="text-sm mt-1" style={{ color: colors.background, opacity: 0.8 }}>
              Last synced: {new Date(settings.lastSyncTime).toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>

        {/* Stats Overview */}
        {stats && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              30-Day Overview
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <View className="flex-1 min-w-[45%] p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.averageHeartRate)}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Heart Rate
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.restingHeartRate)}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Resting HR
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.averageHRV)}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg HRV
                </Text>
              </View>
              <View className="flex-1 min-w-[45%] p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {(stats.totalSteps / 1000).toFixed(1)}k
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Total Steps
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

        {/* Energy Correlations */}
        {correlations.length > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
              Energy Correlations
            </Text>
            {correlations.map((corr, index) => (
              <View
                key={index}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {corr.metric}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getCorrelationColor(corr.correlation) + "30" }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getCorrelationColor(corr.correlation) }}
                    >
                      {getCorrelationStrength(corr.correlation)}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                  {corr.description}
                </Text>
                <Text className="text-sm" style={{ color: colors.primary }}>
                  💡 {corr.recommendation}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Sync Settings */}
        {settings && (
          <>
            <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
              Sync Settings
            </Text>
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.foreground }}>Auto Sync</Text>
                <Switch
                  value={settings.autoSync}
                  onValueChange={(value) => handleToggleSetting("autoSync", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.foreground }}>Sync Heart Rate</Text>
                <Switch
                  value={settings.syncHeartRate}
                  onValueChange={(value) => handleToggleSetting("syncHeartRate", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.foreground }}>Sync Steps</Text>
                <Switch
                  value={settings.syncSteps}
                  onValueChange={(value) => handleToggleSetting("syncSteps", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.foreground }}>Sync Workouts</Text>
                <Switch
                  value={settings.syncWorkouts}
                  onValueChange={(value) => handleToggleSetting("syncWorkouts", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.foreground }}>Sync HRV</Text>
                <Switch
                  value={settings.syncHRV}
                  onValueChange={(value) => handleToggleSetting("syncHRV", value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

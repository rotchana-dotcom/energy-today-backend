import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getBiometricReadings,
  addBiometricReading,
  calculateBiometricInsights,
  type BiometricReading,
  type BiometricInsights,
} from "@/lib/biometric-integration";

export default function BiometricInsightsScreen() {
  const colors = useColors();
  const [readings, setReadings] = useState<BiometricReading[]>([]);
  const [insights, setInsights] = useState<BiometricInsights | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [hrv, setHrv] = useState("");
  const [stress, setStress] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const biometricData = await getBiometricReadings();
    setReadings(biometricData);

    // Mock energy data for correlation
    const energyData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      energy: 50 + Math.random() * 50,
    }));

    const calculatedInsights = await calculateBiometricInsights(biometricData, energyData);
    setInsights(calculatedInsights);
  };

  const handleAddReading = async () => {
    const hr = parseInt(heartRate);
    const hrvValue = parseInt(hrv);
    const stressValue = parseInt(stress);

    if (isNaN(hr) && isNaN(hrvValue) && isNaN(stressValue)) {
      Alert.alert("Invalid Input", "Please enter at least one biometric value.");
      return;
    }

    try {
      await addBiometricReading({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        heartRate: isNaN(hr) ? undefined : hr,
        heartRateVariability: isNaN(hrvValue) ? undefined : hrvValue,
        stressLevel: isNaN(stressValue) ? undefined : stressValue,
        source: "manual",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHeartRate("");
      setHrv("");
      setStress("");
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Error", "Failed to add biometric reading.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
      case "worsening":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return colors.success;
      case "declining":
      case "worsening":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Biometric Insights</Text>
        <Text className="text-sm text-muted mb-6">
          Track heart rate variability and stress levels to optimize your energy
        </Text>

        {/* Add Reading Button */}
        <Pressable
          onPress={() => {
            setShowAddForm(!showAddForm);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
          className="bg-primary p-4 rounded-xl items-center mb-6"
        >
          <Text className="text-background font-semibold text-lg">
            {showAddForm ? "Cancel" : "+ Add Reading"}
          </Text>
        </Pressable>

        {/* Add Reading Form */}
        {showAddForm && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">Manual Entry</Text>
            <View className="gap-4">
              <View>
                <Text className="text-sm text-muted mb-2">Heart Rate (bpm)</Text>
                <TextInput
                  value={heartRate}
                  onChangeText={setHeartRate}
                  placeholder="e.g., 72"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-lg p-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View>
                <Text className="text-sm text-muted mb-2">HRV (ms)</Text>
                <TextInput
                  value={hrv}
                  onChangeText={setHrv}
                  placeholder="e.g., 45"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-lg p-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View>
                <Text className="text-sm text-muted mb-2">Stress Level (0-100)</Text>
                <TextInput
                  value={stress}
                  onChangeText={setStress}
                  placeholder="e.g., 35"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-lg p-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <Pressable
                onPress={handleAddReading}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
                className="bg-primary p-3 rounded-xl items-center"
              >
                <Text className="text-background font-semibold">Save Reading</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Insights Summary */}
        {insights && readings.length > 0 && (
          <>
            {/* Key Metrics */}
            <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">Key Metrics</Text>
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted">Average HRV</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-bold text-foreground">{insights.averageHRV.toFixed(0)} ms</Text>
                    <Text style={{ color: getTrendColor(insights.hrvTrend) }}>
                      {getTrendEmoji(insights.hrvTrend)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted">Average Stress</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-bold text-foreground">{insights.averageStress.toFixed(0)}/100</Text>
                    <Text style={{ color: getTrendColor(insights.stressTrend) }}>
                      {getTrendEmoji(insights.stressTrend)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Energy Correlations */}
            <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">Energy Correlations</Text>
              <View className="gap-3">
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-muted">HRV → Energy</Text>
                    <Text className="text-foreground font-semibold">
                      {(insights.energyCorrelation.hrvToEnergy * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2">
                    <View
                      className="bg-primary rounded-full h-2"
                      style={{
                        width: `${Math.abs(insights.energyCorrelation.hrvToEnergy) * 100}%`,
                      }}
                    />
                  </View>
                  <Text className="text-xs text-muted mt-1">
                    {insights.energyCorrelation.hrvToEnergy > 0 ? "Positive" : "Negative"} correlation
                  </Text>
                </View>
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-muted">Stress → Energy</Text>
                    <Text className="text-foreground font-semibold">
                      {(insights.energyCorrelation.stressToEnergy * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View className="bg-background rounded-full h-2">
                    <View
                      className="bg-error rounded-full h-2"
                      style={{
                        width: `${Math.abs(insights.energyCorrelation.stressToEnergy) * 100}%`,
                      }}
                    />
                  </View>
                  <Text className="text-xs text-muted mt-1">
                    {insights.energyCorrelation.stressToEnergy > 0 ? "Positive" : "Negative"} correlation
                  </Text>
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">Recommendations</Text>
              <View className="gap-3">
                {insights.recommendations.map((rec, index) => (
                  <View key={index} className="flex-row gap-2">
                    <Text className="text-primary">•</Text>
                    <Text className="flex-1 text-foreground leading-relaxed">{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Recent Readings */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-3">Recent Readings</Text>
          {readings.length > 0 ? (
            <View className="gap-3">
              {readings.slice(0, 10).map((reading) => (
                <View key={reading.id} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-foreground font-semibold">{reading.date}</Text>
                    <Text className="text-muted text-sm">{reading.time}</Text>
                  </View>
                  <View className="flex-row gap-4">
                    {reading.heartRate && (
                      <Text className="text-sm text-muted">❤️ {reading.heartRate} bpm</Text>
                    )}
                    {reading.heartRateVariability && (
                      <Text className="text-sm text-muted">📊 {reading.heartRateVariability} ms</Text>
                    )}
                    {reading.stressLevel && (
                      <Text className="text-sm text-muted">😰 {reading.stressLevel}/100</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-8">
              <Text className="text-center text-muted mb-2">No readings yet</Text>
              <Text className="text-center text-sm text-muted">
                Add your first reading manually or connect a wearable device
              </Text>
            </View>
          )}
        </View>

        {/* Integration Info */}
        <View className="bg-primary/10 border border-primary rounded-xl p-4 mt-4">
          <Text className="text-primary font-semibold mb-2">🔗 Wearable Integration</Text>
          <Text className="text-muted text-sm leading-relaxed">
            Connect Apple Health (iOS) or Google Fit (Android) to automatically import heart rate variability and stress data from your wearable device.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

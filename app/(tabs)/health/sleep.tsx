import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMoonPhase, getMoonPhaseName, getMoonEmoji, analyzeSleepMoonCorrelation } from "@/lib/lunar-cycle";
import { useSubscriptionStatus } from "@/lib/subscription-status";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

interface SleepEntry {
  id: string;
  sleepTime: string;
  wakeTime: string;
  quality: number;
  notes: string;
  moonPhase: number;
  date: string;
}

export default function SleepTracker() {
  const colors = useColors();
  const { isPro } = useSubscriptionStatus();
  
  const [sleepTime, setSleepTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);

  useEffect(() => {
    loadSleepEntries();
  }, []);

  const loadSleepEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem("sleep_entries");
      if (stored) {
        setSleepEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load sleep entries:", error);
    }
  };

  const saveSleepEntry = async () => {
    if (wakeTime <= sleepTime) {
      Alert.alert("Invalid Times", "Wake time must be after sleep time");
      return;
    }

    const moonPhase = getMoonPhase(sleepTime);
    const newEntry: SleepEntry = {
      id: Date.now().toString(),
      sleepTime: sleepTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      quality,
      notes,
      moonPhase,
      date: sleepTime.toISOString().split("T")[0],
    };

    const updated = [newEntry, ...sleepEntries];
    setSleepEntries(updated);
    await AsyncStorage.setItem("sleep_entries", JSON.stringify(updated));

    // Reset form
    setSleepTime(new Date());
    setWakeTime(new Date());
    setQuality(3);
    setNotes("");

    Alert.alert("Success", "Sleep entry saved!");
  };

  const calculateSleepDuration = (sleep: string, wake: string): string => {
    const sleepDate = new Date(sleep);
    const wakeDate = new Date(wake);
    const hours = (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60);
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  const getVisibleEntries = () => {
    if (isPro) {
      return sleepEntries;
    }
    // Free users: last 7 days only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return sleepEntries.filter((entry) => new Date(entry.sleepTime) >= sevenDaysAgo);
  };

  const visibleEntries = getVisibleEntries();
  const moonCorrelation = isPro && sleepEntries.length >= 6
    ? analyzeSleepMoonCorrelation(sleepEntries.map(e => ({ quality: e.quality, moonPhase: e.moonPhase.toString() })))
    : null;

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Sleep Tracker</Text>
        <Text className="text-sm text-muted mb-6">
          Track your sleep cycles and discover lunar patterns
        </Text>

        {/* Sleep Entry Form */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Log Sleep</Text>

          {/* Sleep Time */}
          <View className="mb-4">
            <Text className="text-sm text-muted mb-2">Time You Went to Sleep</Text>
            <Pressable
              onPress={() => setShowSleepPicker(true)}
              className="bg-background border border-border rounded-xl p-3"
            >
              <Text className="text-foreground">
                {sleepTime.toLocaleString()}
              </Text>
            </Pressable>
            {showSleepPicker && (
              <DateTimePicker
                value={sleepTime}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowSleepPicker(Platform.OS === "ios");
                  if (date) setSleepTime(date);
                }}
              />
            )}
          </View>

          {/* Wake Time */}
          <View className="mb-4">
            <Text className="text-sm text-muted mb-2">Time You Woke Up</Text>
            <Pressable
              onPress={() => setShowWakePicker(true)}
              className="bg-background border border-border rounded-xl p-3"
            >
              <Text className="text-foreground">
                {wakeTime.toLocaleString()}
              </Text>
            </Pressable>
            {showWakePicker && (
              <DateTimePicker
                value={wakeTime}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowWakePicker(Platform.OS === "ios");
                  if (date) setWakeTime(date);
                }}
              />
            )}
          </View>

          {/* Quality Rating */}
          <View className="mb-4">
            <Text className="text-sm text-muted mb-2">Sleep Quality (1-5)</Text>
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Pressable
                  key={rating}
                  onPress={() => setQuality(rating)}
                  style={{
                    backgroundColor: quality === rating ? colors.primary : colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  className="w-12 h-12 rounded-full items-center justify-center"
                >
                  <Text
                    style={{
                      color: quality === rating ? colors.background : colors.foreground,
                    }}
                    className="font-semibold"
                  >
                    {rating}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-4">
            <Text className="text-sm text-muted mb-2">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How did you sleep? Any dreams?"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{
                color: colors.foreground,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-3"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={saveSleepEntry}
            style={{ backgroundColor: colors.primary }}
            className="rounded-xl py-3 items-center"
          >
            <Text style={{ color: colors.background }} className="font-semibold">
              Save Sleep Entry
            </Text>
          </Pressable>
        </View>

        {/* AI Insights (Pro) */}
        {isPro && moonCorrelation && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              🌙 Lunar Insights (Pro)
            </Text>
            <Text className="text-sm text-muted mb-3">{moonCorrelation.insight}</Text>
            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-muted">Full Moon Avg</Text>
                <Text className="text-xl font-bold text-foreground">
                  {moonCorrelation.fullMoonAvg}/5
                </Text>
              </View>
              <View>
                <Text className="text-xs text-muted">New Moon Avg</Text>
                <Text className="text-xl font-bold text-foreground">
                  {moonCorrelation.newMoonAvg}/5
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sleep History */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">Sleep History</Text>
            {!isPro && sleepEntries.length > 7 && (
              <Pressable onPress={() => router.push("/upgrade")}>
                <Text className="text-sm text-primary font-semibold">Upgrade for Full History</Text>
              </Pressable>
            )}
          </View>

          {visibleEntries.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">No sleep entries yet. Start tracking!</Text>
            </View>
          ) : (
            visibleEntries.map((entry) => (
              <View
                key={entry.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-sm text-muted">
                      {new Date(entry.sleepTime).toLocaleDateString()}
                    </Text>
                    <Text className="text-lg font-semibold text-foreground">
                      {calculateSleepDuration(entry.sleepTime, entry.wakeTime)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl">{getMoonEmoji(entry.moonPhase)}</Text>
                    <Text className="text-xs text-muted">{getMoonPhaseName(entry.moonPhase)}</Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-muted mr-2">Quality:</Text>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} className="text-lg">
                        {star <= entry.quality ? "⭐" : "☆"}
                      </Text>
                    ))}
                  </View>
                </View>
                {entry.notes && (
                  <Text className="text-sm text-muted italic">{entry.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {!isPro && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Unlock Pro Features
            </Text>
            <Text className="text-sm text-muted mb-3">
              • Unlimited sleep history{"\n"}
              • Lunar cycle correlations{"\n"}
              • AI-powered sleep predictions{"\n"}
              • Personalized insights
            </Text>
            <Pressable
              onPress={() => router.push("/upgrade")}
              style={{ backgroundColor: colors.primary }}
              className="rounded-xl py-3 items-center"
            >
              <Text style={{ color: colors.background }} className="font-semibold">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

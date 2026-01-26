import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  saveSleepSession,
  getRecentSleepSessions,
  getSleepStats,
  getSleepInsights,
  deleteSleepSession,
  type SleepSession,
  type SleepStats,
} from "@/lib/sleep-tracker";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";
import { syncHealthToCalendar } from "@/lib/calendar-sync-helper";
import { StreakBadge } from "@/components/streak-badge";
import { getStreak, updateStreak } from "@/lib/streak-tracker";

export default function SleepTrackerScreen() {
  const colors = useColors();
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('sleep');
  const [streak, setStreak] = useState(0);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"sleep" | "wake" | null>(null);

  const [newSession, setNewSession] = useState({
    sleepTime: new Date(),
    wakeTime: new Date(),
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    dream: "",
    dreamMood: "neutral" as "positive" | "neutral" | "negative" | "nightmare",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const recentSessions = await getRecentSleepSessions(30);
    setSessions(recentSessions);
    const sleepStats = await getSleepStats();
    setStats(sleepStats);
    const sleepInsights = await getSleepInsights();
    setInsights(sleepInsights);
    const streakData = await getStreak("sleep");
    setStreak(streakData.currentStreak);
  };

  const calculateDuration = (sleep: Date, wake: Date): number => {
    const diff = wake.getTime() - sleep.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
  };

  const handleAddSession = async () => {
    const duration = calculateDuration(newSession.sleepTime, newSession.wakeTime);

    if (duration <= 0 || duration > 24) {
      Alert.alert("Invalid Times", "Please check your sleep and wake times");
      return;
    }

    const session: SleepSession = {
      id: Date.now().toString(),
      sleepTime: newSession.sleepTime.toISOString(),
      wakeTime: newSession.wakeTime.toISOString(),
      duration,
      quality: newSession.quality,
      dream: newSession.dream.trim() || undefined,
      dreamMood: newSession.dream.trim() ? newSession.dreamMood : undefined,
      notes: newSession.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await saveSleepSession(session);
    
    // Sync to calendar
    await syncHealthToCalendar(
      'sleep',
      new Date(session.sleepTime),
      duration,
      `Sleep session (Quality: ${session.quality}/5)`,
      session.notes
    );
    
    await loadData();

    setNewSession({
      sleepTime: new Date(),
      wakeTime: new Date(),
      quality: 3,
      dream: "",
      dreamMood: "neutral",
      notes: "",
    });
    setShowAddSession(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert("Delete Session?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSleepSession(sessionId);
          await loadData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getQualityStars = (quality: number) => {
    return "★".repeat(quality) + "☆".repeat(5 - quality);
  };

  const getDreamMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      case "nightmare":
        return "😱";
      default:
        return "😐";
    }
  };

  if (showAddSession) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowAddSession(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Log Sleep
            </Text>
            <TouchableOpacity onPress={handleAddSession}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Sleep Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker("sleep")}
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg" style={{ color: colors.foreground }}>
              {newSession.sleepTime.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker === "sleep" && (
            <DateTimePicker
              value={newSession.sleepTime}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(null);
                if (date) setNewSession({ ...newSession, sleepTime: date });
              }}
            />
          )}

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Wake Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker("wake")}
            className="p-4 rounded-xl mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg" style={{ color: colors.foreground }}>
              {newSession.wakeTime.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker === "wake" && (
            <DateTimePicker
              value={newSession.wakeTime}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(null);
                if (date) setNewSession({ ...newSession, wakeTime: date });
              }}
            />
          )}

          <View className="p-3 rounded-xl mb-4" style={{ backgroundColor: colors.primary + "20" }}>
            <Text className="text-sm text-center" style={{ color: colors.foreground }}>
              Duration: {calculateDuration(newSession.sleepTime, newSession.wakeTime)}h
            </Text>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Sleep Quality
          </Text>
          <View className="flex-row justify-center gap-4 mb-4">
            {[1, 2, 3, 4, 5].map((quality) => (
              <TouchableOpacity
                key={quality}
                onPress={() => {
                  setNewSession({ ...newSession, quality: quality as 1 | 2 | 3 | 4 | 5 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  className="text-4xl"
                  style={{
                    opacity: quality <= newSession.quality ? 1 : 0.3,
                    color: colors.warning,
                  }}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Dream Journal (Optional)
          </Text>
          <TextInput
            value={newSession.dream}
            onChangeText={(text) => setNewSession({ ...newSession, dream: text })}
            placeholder="Describe your dream..."
            className="p-4 rounded-xl mb-3 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
          />

          {newSession.dream.trim() && (
            <>
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
                Dream Mood
              </Text>
              <View className="flex-row gap-2 mb-4">
                {(
                  [
                    { mood: "positive", emoji: "😊", label: "Positive" },
                    { mood: "neutral", emoji: "😐", label: "Neutral" },
                    { mood: "negative", emoji: "😔", label: "Negative" },
                    { mood: "nightmare", emoji: "😱", label: "Nightmare" },
                  ] as const
                ).map(({ mood, emoji, label }) => (
                  <TouchableOpacity
                    key={mood}
                    onPress={() => {
                      setNewSession({ ...newSession, dreamMood: mood });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="flex-1 p-3 rounded-xl items-center"
                    style={{
                      backgroundColor:
                        newSession.dreamMood === mood ? colors.primary : colors.surface,
                    }}
                  >
                    <Text className="text-2xl mb-1">{emoji}</Text>
                    <Text
                      className="text-xs"
                      style={{
                        color:
                          newSession.dreamMood === mood ? colors.background : colors.foreground,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={newSession.notes}
            onChangeText={(text) => setNewSession({ ...newSession, notes: text })}
            placeholder="Any other observations..."
            className="p-4 rounded-xl mb-6 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Sleep Tracker
          </Text>
          <TouchableOpacity onPress={() => setShowAddSession(true)}>
            <Text className="text-3xl" style={{ color: colors.primary }}>
              +
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Streak Counter */}
        {streak > 0 && (
          <View className="mb-4 items-center">
            <StreakBadge streak={streak} label="day streak" size="medium" />
          </View>
        )}

        {stats && stats.totalSessions > 0 && (
          <>
            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.averageDuration}h
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Duration
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {getQualityStars(Math.round(stats.averageQuality))}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Quality
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.optimalDuration}h
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Optimal Duration
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {stats.bestBedtime}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Best Bedtime
                </Text>
              </View>
            </View>

            {/* Insights */}
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
                  💡 {insight}
                </Text>
              </View>
            ))}

            {/* AI-Powered Insights (Pro Feature) */}
            <AIInsightsCard
              feature="Sleep"
              insights={aiInsights}
              loading={aiLoading}
              error={aiError || undefined}
              icon="😴"
            />
          </>
        )}

        {/* Recent Sessions */}
        <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
          Recent Sleep ({sessions.length})
        </Text>

        {sessions.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">😴</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No sleep data yet
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Start tracking your sleep to discover insights
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View
              key={session.id}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold mb-1" style={{ color: colors.foreground }}>
                    {formatDate(session.sleepTime)} • {session.duration}h
                  </Text>
                  <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                    {formatTime(session.sleepTime)} → {formatTime(session.wakeTime)}
                  </Text>
                  <Text className="text-lg mb-2" style={{ color: colors.warning }}>
                    {getQualityStars(session.quality)}
                  </Text>
                  {session.dream && (
                    <View
                      className="p-3 rounded-lg mb-2"
                      style={{ backgroundColor: colors.background }}
                    >
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base mr-2">
                          {getDreamMoodEmoji(session.dreamMood)}
                        </Text>
                        <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
                          Dream Journal
                        </Text>
                      </View>
                      <Text className="text-sm" style={{ color: colors.foreground }}>
                        {session.dream}
                      </Text>
                    </View>
                  )}
                  {session.notes && (
                    <Text className="text-sm italic" style={{ color: colors.muted }}>
                      Note: {session.notes}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteSession(session.id)}>
                  <Text className="text-lg" style={{ color: colors.error }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

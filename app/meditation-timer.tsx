import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { Audio } from "expo-av";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  saveMeditationSession,
  getMeditationSessions,
  getMeditationStats,
  getRecommendedMeditation,
  MEDITATION_PRESETS,
  AMBIENT_SOUNDS,
  type MeditationSession,
  type MeditationPreset,
} from "@/lib/meditation-timer";
import { calculateDailyEnergy } from "@/lib/energy-engine";
import { getUserProfile } from "@/lib/storage";
import { syncMeditationToCalendar } from "@/lib/calendar-sync-helper";
import { SyncStatusIndicator } from "@/components/sync-status-indicator";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";

export default function MeditationTimerScreen() {
  useKeepAwake(); // Keep screen awake during meditation
  const colors = useColors();

  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [selectedPreset, setSelectedPreset] = useState<MeditationPreset | null>(null);
  const [customDuration, setCustomDuration] = useState("15");
  const [energyBefore, setEnergyBefore] = useState<number | null>(null);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    averageEnergyIncrease: 0,
    currentStreak: 0,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const voiceRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('meditation');

  useEffect(() => {
    loadData();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (voiceRef.current) {
        voiceRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const playVoiceGuidance = async (audioFile: string) => {
    if (!voiceGuidanceEnabled) return;
    
    try {
      // Unload previous voice if any
      if (voiceRef.current) {
        await voiceRef.current.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        { volume: 0.8 }
      );
      voiceRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play voice guidance:", error);
    }
  };

  const loadData = async () => {
    const allSessions = await getMeditationSessions();
    setSessions(allSessions.slice(0, 5)); // Show last 5 sessions
    const allStats = await getMeditationStats();
    setStats(allStats);

    // Get current energy level for recommendation
    const profile = await getUserProfile();
    if (profile) {
      const energyData = calculateDailyEnergy(profile, new Date());
      setEnergyBefore(energyData.userEnergy.intensity);
    }
  };

  const startMeditation = async (preset: MeditationPreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPreset(preset);
    setTimeRemaining(preset.duration * 60);
    setIsTimerActive(true);

    // Set audio mode
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    // Play welcome voice guidance
    await playVoiceGuidance(require("@/assets/audio/meditation-welcome.wav"));

    // Play ambient sound if selected (after welcome finishes)
    if (selectedSound.url) {
      try {
        setTimeout(async () => {
          const { sound } = await Audio.Sound.createAsync(
            { uri: selectedSound.url },
            { isLooping: true, volume: 0.3 } // Lower volume for ambient
          );
          soundRef.current = sound;
          await sound.playAsync();
        }, 15000); // Wait 15s for welcome to finish
      } catch (error) {
        console.error("Failed to play ambient sound:", error);
      }
    }

    // Schedule voice guidance at intervals
    const totalSeconds = preset.duration * 60;
    
    // Breathing guidance at 20s
    setTimeout(() => playVoiceGuidance(require("@/assets/audio/meditation-breathing.wav")), 20000);
    
    // Body scan at 25% through
    if (totalSeconds > 120) {
      setTimeout(() => playVoiceGuidance(require("@/assets/audio/meditation-bodyscan.wav")), totalSeconds * 0.25 * 1000);
    }
    
    // Mindfulness at 50% through
    if (totalSeconds > 180) {
      setTimeout(() => playVoiceGuidance(require("@/assets/audio/meditation-mindfulness.wav")), totalSeconds * 0.5 * 1000);
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completeMeditation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCustomMeditation = () => {
    const duration = parseInt(customDuration);
    if (isNaN(duration) || duration < 1) {
      Alert.alert("Invalid Duration", "Please enter a valid duration in minutes");
      return;
    }

    const customPreset: MeditationPreset = {
      id: "custom",
      name: "Custom Session",
      duration,
      type: "silent",
      description: "Custom meditation session",
      energyState: "any",
    };

    startMeditation(customPreset);
  };

  const getLast7DaysMeditation = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const daySessions = sessions.filter((session) => session.date.startsWith(dateStr));
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      
      days.push({
        label: dayLabel,
        value: totalMinutes,
      });
    }
    
    return days;
  };

  const pauseMeditation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (soundRef.current) {
      soundRef.current.pauseAsync();
    }
  };

  const resumeMeditation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTimerActive(true);
    if (soundRef.current) {
      soundRef.current.playAsync();
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          completeMeditation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeMeditation = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Play completion voice guidance
    await playVoiceGuidance(require("@/assets/audio/meditation-complete.wav"));

    // Get energy after meditation
    const profile = await getUserProfile();
    if (!profile) return;
    const energyData = calculateDailyEnergy(profile, new Date());
    const energyAfter = energyData.userEnergy.intensity;

    // Save session
    if (selectedPreset && energyBefore !== null) {
      const session: MeditationSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: selectedPreset.duration,
        type: selectedPreset.type,
        energyBefore,
        energyAfter,
        mood: "calm",
      };
      await saveMeditationSession(session);
      await loadData();

      // Sync to Google Calendar
      const syncResult = await syncMeditationToCalendar(
        selectedPreset.duration,
        session.date,
        selectedPreset.type
      );

      const energyChange = energyAfter - energyBefore;
      const syncMessage = syncResult.success ? " Synced to calendar!" : "";
      Alert.alert(
        "Meditation Complete! 🧘",
        `Energy: ${energyBefore} → ${energyAfter} (${energyChange > 0 ? "+" : ""}${energyChange})${syncMessage}`
      );
    }

    setSelectedPreset(null);
    setTimeRemaining(0);
  };

  const cancelMeditation = () => {
    Alert.alert("Cancel Meditation?", "Your progress will not be saved.", [
      { text: "Continue", style: "cancel" },
      {
        text: "Cancel",
        style: "destructive",
        onPress: async () => {
          setIsTimerActive(false);
          setSelectedPreset(null);
          setTimeRemaining(0);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        },
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRecommendation = () => {
    if (energyBefore === null) return null;
    return getRecommendedMeditation(energyBefore);
  };

  if (selectedPreset && timeRemaining > 0) {
    // Timer active view
    const progress = 1 - timeRemaining / (selectedPreset.duration * 60);

    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <View className="flex-1 items-center justify-center w-full">
          {/* Timer Display */}
          <View
            className="w-64 h-64 rounded-full items-center justify-center mb-8"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 8,
              borderColor: colors.primary,
              opacity: 0.2 + progress * 0.8,
            }}
          >
            <Text className="text-6xl font-bold" style={{ color: colors.foreground }}>
              {formatTime(timeRemaining)}
            </Text>
            <Text className="text-lg mt-2" style={{ color: colors.muted }}>
              {selectedPreset.name}
            </Text>
          </View>

          {/* Controls */}
          <View className="flex-row gap-4">
            {isTimerActive ? (
              <TouchableOpacity
                onPress={pauseMeditation}
                className="px-8 py-4 rounded-full"
                style={{ backgroundColor: colors.warning }}
              >
                <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                  Pause
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={resumeMeditation}
                className="px-8 py-4 rounded-full"
                style={{ backgroundColor: colors.success }}
              >
                <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                  Resume
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={cancelMeditation}
              className="px-8 py-4 rounded-full"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ambient Sound Info */}
          {selectedSound.url && (
            <Text className="mt-8 text-sm" style={{ color: colors.muted }}>
              🎵 {selectedSound.name}
            </Text>
          )}
        </View>
      </ScreenContainer>
    );
  }

  const recommendation = getRecommendation();

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Meditation Timer
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Stats */}
        <View className="mb-2">
          <SyncStatusIndicator feature="meditation" />
        </View>
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              {stats.totalSessions}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Sessions
            </Text>
          </View>
          <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              {stats.totalMinutes}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Minutes
            </Text>
          </View>
          <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              {stats.currentStreak}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Day Streak
            </Text>
          </View>
        </View>

        {/* AI-Powered Insights (Pro Feature) */}
        <AIInsightsCard
          feature="Meditation"
          insights={aiInsights}
          loading={aiLoading}
          error={aiError || undefined}
          icon="🧘"
        />

        {/* Recommendation */}
        {recommendation && energyBefore !== null && (
          <View className="p-4 rounded-xl mb-6" style={{ backgroundColor: colors.primary + "20" }}>
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
              ✨ Recommended for You (Energy: {energyBefore})
            </Text>
            <TouchableOpacity
              onPress={() => startMeditation(recommendation)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                  {recommendation.name}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {recommendation.description}
                </Text>
              </View>
              <View className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.primary }}>
                <Text className="text-sm font-semibold" style={{ color: colors.background }}>
                  {recommendation.duration} min
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Voice Guidance Toggle */}
        <View className="flex-row items-center justify-between mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
              Voice Guidance
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Soft female voice with meditation instructions
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setVoiceGuidanceEnabled(!voiceGuidanceEnabled);
            }}
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: voiceGuidanceEnabled ? colors.success : colors.muted }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.background }}>
              {voiceGuidanceEnabled ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ambient Sound Selector */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          Ambient Sound
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {AMBIENT_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedSound(sound);
              }}
              className="mr-3 px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedSound.id === sound.id ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: selectedSound.id === sound.id ? colors.background : colors.foreground,
                }}
              >
                {sound.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Presets */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          Guided Sessions
        </Text>
        {MEDITATION_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            onPress={() => startMeditation(preset)}
            className="p-4 rounded-xl mb-3 flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-1">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                {preset.name}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {preset.description}
              </Text>
            </View>
            <View className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.primary }}>
              <Text className="text-sm font-semibold" style={{ color: colors.background }}>
                {preset.duration} min
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Custom Duration */}
        <Text className="text-lg font-semibold mb-3 mt-4" style={{ color: colors.foreground }}>
          Custom Duration
        </Text>
        <View className="flex-row gap-3 mb-6">
          <TextInput
            value={customDuration}
            onChangeText={setCustomDuration}
            keyboardType="number-pad"
            placeholder="15"
            className="flex-1 p-4 rounded-xl text-lg"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity
            onPress={startCustomMeditation}
            className="px-6 py-4 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-lg font-semibold" style={{ color: colors.background }}>
              Start
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7-Day Meditation Progress */}
        {sessions.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">7-Day Meditation Progress</Text>
            <SimpleLineChart
              data={getLast7DaysMeditation()}
              height={180}
              yAxisLabel="Minutes"
              maxValue={60}
            />
          </View>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Recent Sessions
            </Text>
            {sessions.map((session) => (
              <View
                key={session.id}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {session.type.charAt(0).toUpperCase() + session.type.slice(1)} •{" "}
                    {session.duration} min
                  </Text>
                  <View className="items-end">
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm mb-1" style={{ color: colors.muted }}>
                  Energy: {session.energyBefore} → {session.energyAfter} (
                  {session.energyAfter > session.energyBefore ? "+" : ""}
                  {session.energyAfter - session.energyBefore})
                </Text>
                {session.notes && (
                  <Text className="text-sm italic" style={{ color: colors.muted }}>
                    Note: {session.notes}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

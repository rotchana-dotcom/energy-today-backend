import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscriptionStatus } from "@/lib/subscription-status";
import { router } from "expo-router";
import {
  guidedMeditations,
  getFreeMeditations,
  getProMeditations,
  type GuidedMeditation,
} from "@/lib/guided-meditations";

interface MeditationSession {
  id: string;
  meditationId: string;
  meditationTitle: string;
  duration: number;
  completed: boolean;
  notes: string;
  startTime: string;
  endTime?: string;
  date: string;
}

export default function MeditationTracker() {
  const colors = useColors();
  const { isPro } = useSubscriptionStatus();
  
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState<GuidedMeditation | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem("meditation_sessions");
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load meditation sessions:", error);
    }
  };

  const startGuidedMeditation = (meditation: GuidedMeditation) => {
    if (meditation.isPro && !isPro) {
      Alert.alert(
        "Pro Feature",
        "This guided meditation is available for Pro members only.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/upgrade") },
        ]
      );
      return;
    }

    const newSession: MeditationSession = {
      id: Date.now().toString(),
      meditationId: meditation.id,
      meditationTitle: meditation.title,
      duration: meditation.duration,
      completed: false,
      notes: "",
      startTime: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
    };

    setActiveSession(newSession);
    setSelectedMeditation(meditation);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (selectedMeditation && currentStep < selectedMeditation.script.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeMeditation();
    }
  };

  const completeMeditation = async () => {
    if (!activeSession) return;

    const completed: MeditationSession = {
      ...activeSession,
      completed: true,
      endTime: new Date().toISOString(),
    };

    const updated = [completed, ...sessions];
    setSessions(updated);
    await AsyncStorage.setItem("meditation_sessions", JSON.stringify(updated));

    Alert.alert("Session Complete", "Great job! Your meditation session has been logged.");
    
    setActiveSession(null);
    setSelectedMeditation(null);
    setCurrentStep(0);
  };

  const cancelSession = () => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this meditation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setActiveSession(null);
            setSelectedMeditation(null);
            setCurrentStep(0);
          },
        },
      ]
    );
  };

  const getVisibleSessions = () => {
    if (isPro) return sessions;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return sessions.filter((s) => new Date(s.startTime) >= sevenDaysAgo);
  };

  const getTotalMinutes = () => {
    return sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  const getThisWeekSessions = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessions.filter(
      (s) => s.completed && new Date(s.startTime) >= weekAgo
    ).length;
  };

  const availableMeditations = isPro ? guidedMeditations : getFreeMeditations();
  const categories = Array.from(new Set(availableMeditations.map((m) => m.category)));

  // Active meditation session view
  if (activeSession && selectedMeditation) {
    return (
      <ScreenContainer>
        <View className="flex-1 p-6 justify-center">
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-2xl font-bold text-foreground text-center mb-2">
              {selectedMeditation.title}
            </Text>
            <Text className="text-sm text-muted text-center mb-6">
              Step {currentStep + 1} of {selectedMeditation.script.length}
            </Text>

            <View className="bg-background rounded-xl p-6 mb-6 min-h-[200px] justify-center">
              <Text className="text-lg text-foreground text-center leading-relaxed">
                {selectedMeditation.script[currentStep]}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={cancelSession}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
                className="flex-1 rounded-xl py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={nextStep}
                style={{ backgroundColor: colors.primary }}
                className="flex-1 rounded-xl py-3 items-center"
              >
                <Text style={{ color: colors.background }} className="font-semibold">
                  {currentStep < selectedMeditation.script.length - 1 ? "Next" : "Complete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Main meditation library view
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Meditation</Text>
        <Text className="text-sm text-muted mb-6">
          Guided meditations for mindfulness and inner peace
        </Text>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Total Minutes</Text>
            <Text className="text-2xl font-bold text-foreground">{getTotalMinutes()}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-1">This Week</Text>
            <Text className="text-2xl font-bold text-foreground">
              {getThisWeekSessions()} sessions
            </Text>
          </View>
        </View>

        {/* Guided Meditations by Category */}
        {categories.map((category) => {
          const categoryMeditations = availableMeditations.filter((m) => m.category === category);
          return (
            <View key={category} className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-3 capitalize">
                {category}
              </Text>
              {categoryMeditations.map((meditation) => (
                <Pressable
                  key={meditation.id}
                  onPress={() => startGuidedMeditation(meditation)}
                  className="bg-surface rounded-2xl p-4 mb-3 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-base font-semibold text-foreground">
                          {meditation.title}
                        </Text>
                        {meditation.isPro && (
                          <View
                            style={{ backgroundColor: colors.primary }}
                            className="ml-2 px-2 py-0.5 rounded"
                          >
                            <Text style={{ color: colors.background }} className="text-xs font-semibold">
                              PRO
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-muted">{meditation.description}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-foreground">
                        {meditation.duration} min
                      </Text>
                      <Text className="text-xs text-muted capitalize">{meditation.difficulty}</Text>
                    </View>
                  </View>
                  <View
                    style={{ backgroundColor: colors.primary }}
                    className="rounded-xl py-2 items-center"
                  >
                    <Text style={{ color: colors.background }} className="font-semibold">
                      Start Meditation
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}

        {/* Session History */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">Recent Sessions</Text>
            {!isPro && sessions.length > 7 && (
              <Pressable onPress={() => router.push("/upgrade")}>
                <Text className="text-sm text-primary font-semibold">Upgrade for Full History</Text>
              </Pressable>
            )}
          </View>

          {getVisibleSessions().length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">
                No meditation sessions yet. Start your first one!
              </Text>
            </View>
          ) : (
            getVisibleSessions().map((session) => (
              <View
                key={session.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground mb-1">
                      {session.meditationTitle}
                    </Text>
                    <Text className="text-sm text-muted">
                      {new Date(session.startTime).toLocaleString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-foreground">
                      {session.duration} min
                    </Text>
                    {session.completed && (
                      <Text className="text-xs text-success">✓ Completed</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {!isPro && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Unlock Pro Meditations
            </Text>
            <Text className="text-sm text-muted mb-3">
              • {getProMeditations().length} exclusive guided meditations{"\n"}
              • Advanced energy & chi practices{"\n"}
              • Lunar sleep meditations{"\n"}
              • Unlimited session history
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

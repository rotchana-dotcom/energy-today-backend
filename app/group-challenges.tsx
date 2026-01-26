import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import {
  createChallenge,
  getActiveChallenges,
  getLeaderboard,
  getChallengeProgress,
  updateChallengeProgress,
  getChallengeTypeLabel,
  getChallengeTypeIcon,
  type Challenge,
  type ChallengeType,
  type LeaderboardEntry,
} from "@/lib/group-challenges";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import { getUserProfile } from "@/lib/storage";

const CHALLENGE_TYPES: Array<{ value: ChallengeType; label: string }> = [
  { value: "streak", label: "Longest Streak" },
  { value: "average_energy", label: "Highest Average Energy" },
  { value: "total_insights", label: "Most Insights" },
  { value: "workout_minutes", label: "Total Workout Minutes" },
  { value: "journal_entries", label: "Most Journal Entries" },
];

export default function GroupChallengesScreen() {
  const colors = useColors();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [challengeName, setChallengeName] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("streak");
  const [duration, setDuration] = useState("7"); // days

  const userId = "current_user"; // In real app, get from auth context

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      loadLeaderboard(selectedChallenge.id);
    }
  }, [selectedChallenge]);

  const loadChallenges = async () => {
    const activeChallenges = await getActiveChallenges(userId);
    setChallenges(activeChallenges);
    if (activeChallenges.length > 0 && !selectedChallenge) {
      setSelectedChallenge(activeChallenges[0]);
    }
  };

  const loadLeaderboard = async (challengeId: string) => {
    const board = await getLeaderboard(challengeId);
    setLeaderboard(board);
  };

  const handleCreateChallenge = async () => {
    if (!challengeName.trim()) {
      Alert.alert("Error", "Please enter a challenge name");
      return;
    }

    const durationDays = parseInt(duration);
    if (isNaN(durationDays) || durationDays <= 0) {
      Alert.alert("Error", "Please enter a valid duration");
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    await createChallenge({
      name: challengeName,
      type: challengeType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      creatorId: userId,
      participants: [userId],
      description: `${durationDays}-day challenge`,
    });

    setShowCreateForm(false);
    setChallengeName("");
    setDuration("7");
    loadChallenges();
  };

  const handleUpdateProgress = async () => {
    if (!selectedChallenge) return;

    // Calculate real progress from user's energy score
    const profile = await getUserProfile();
    if (!profile) {
      Alert.alert("Error", "Please complete your profile first");
      return;
    }
    const energyData = calculateUnifiedEnergy(profile, new Date());
    const progressValue = Math.round(energyData.combinedAnalysis.overallAlignment);
    await updateChallengeProgress(selectedChallenge.id, userId, progressValue);
    await loadLeaderboard(selectedChallenge.id);
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success", "Progress updated!");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Group Challenges
          </Text>
          <Text className="text-base text-muted">
            Compete with friends on energy goals
          </Text>
        </View>

        {/* Create Challenge Button */}
        {!showCreateForm && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCreateForm(true);
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="rounded-xl p-4 mb-6"
          >
            <Text className="text-background text-center font-semibold text-base">
              + Create New Challenge
            </Text>
          </Pressable>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              New Challenge
            </Text>

            <Text className="text-sm font-medium text-muted mb-2">Challenge Name</Text>
            <TextInput
              value={challengeName}
              onChangeText={setChallengeName}
              placeholder="e.g., Weekend Energy Boost"
              placeholderTextColor={colors.muted}
              style={{ color: colors.foreground, backgroundColor: colors.background }}
              className="border border-border rounded-lg px-4 py-3 mb-4"
            />

            <Text className="text-sm font-medium text-muted mb-2">Challenge Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CHALLENGE_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChallengeType(type.value);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        challengeType === type.value ? colors.primary : colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="px-4 py-2 rounded-lg border border-border"
                >
                  <Text
                    style={{
                      color:
                        challengeType === type.value ? colors.background : colors.foreground,
                    }}
                    className="text-sm"
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-muted mb-2">Duration (days)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="7"
              placeholderTextColor={colors.muted}
              style={{ color: colors.foreground, backgroundColor: colors.background }}
              className="border border-border rounded-lg px-4 py-3 mb-4"
            />

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCreateForm(false);
                  setChallengeName("");
                  setDuration("7");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg border border-border"
              >
                <Text className="text-foreground text-center font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreateChallenge}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 py-3 rounded-lg"
              >
                <Text className="text-background text-center font-semibold">Create</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Active Challenges */}
        {challenges.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Your Challenges
            </Text>
            <View className="gap-3">
              {challenges.map((challenge) => {
                const isSelected = selectedChallenge?.id === challenge.id;
                const daysLeft = Math.ceil(
                  (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Pressable
                    key={challenge.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedChallenge(challenge);
                    }}
                    style={({ pressed }) => [
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    className="rounded-xl p-4 border border-border"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-2xl">
                          {getChallengeTypeIcon(challenge.type)}
                        </Text>
                        <View>
                          <Text
                            style={{
                              color: isSelected ? colors.background : colors.foreground,
                            }}
                            className="font-semibold"
                          >
                            {challenge.name}
                          </Text>
                          <Text
                            style={{
                              color: isSelected ? colors.background : colors.muted,
                              opacity: isSelected ? 0.8 : 1,
                            }}
                            className="text-sm"
                          >
                            {getChallengeTypeLabel(challenge.type)}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text
                          style={{
                            color: isSelected ? colors.background : colors.foreground,
                          }}
                          className="font-semibold"
                        >
                          {daysLeft}d left
                        </Text>
                        <Text
                          style={{
                            color: isSelected ? colors.background : colors.muted,
                            opacity: isSelected ? 0.8 : 1,
                          }}
                          className="text-sm"
                        >
                          {challenge.participants.length} participants
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Leaderboard */}
        {selectedChallenge && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-foreground">Leaderboard</Text>
              <Pressable
                onPress={handleUpdateProgress}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="px-4 py-2 rounded-lg"
              >
                <Text className="text-background text-sm font-medium">
                  Update Progress
                </Text>
              </Pressable>
            </View>

            {leaderboard.length === 0 ? (
              <Text className="text-muted text-center py-8">
                No progress yet. Update your progress to see the leaderboard!
              </Text>
            ) : (
              <View className="gap-3">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === userId;
                  const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : "";

                  return (
                    <View
                      key={entry.userId}
                      style={{
                        backgroundColor: isCurrentUser ? colors.primary : colors.surface,
                      }}
                      className="rounded-xl p-4 border border-border"
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                          <Text
                            style={{
                              color: isCurrentUser ? colors.background : colors.foreground,
                            }}
                            className="text-xl font-bold"
                          >
                            {rankEmoji || `#${entry.rank}`}
                          </Text>
                          <View>
                            <Text
                              style={{
                                color: isCurrentUser ? colors.background : colors.foreground,
                              }}
                              className="font-semibold"
                            >
                              {isCurrentUser ? "You" : entry.userName}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            color: isCurrentUser ? colors.background : colors.foreground,
                          }}
                          className="text-xl font-bold"
                        >
                          {entry.value.toFixed(0)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {challenges.length === 0 && !showCreateForm && (
          <View className="py-12">
            <Text className="text-muted text-center text-base">
              No active challenges yet.{"\n"}Create one to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

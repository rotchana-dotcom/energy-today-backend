import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChallengeType = "streak" | "average_energy" | "total_insights" | "workout_minutes" | "journal_entries";

export interface Challenge {
  id: string;
  name: string;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  creatorId: string;
  participants: string[]; // user IDs
  goal?: number; // optional target value
  description?: string;
}

export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  currentValue: number;
  rank: number;
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  value: number;
  rank: number;
}

const CHALLENGES_KEY = "@energy_today:challenges";
const PROGRESS_KEY = "@energy_today:challenge_progress";

export async function createChallenge(challenge: Omit<Challenge, "id">): Promise<Challenge> {
  const challenges = await getChallenges();
  const newChallenge: Challenge = {
    ...challenge,
    id: Date.now().toString(),
  };
  challenges.push(newChallenge);
  await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  return newChallenge;
}

export async function getChallenges(): Promise<Challenge[]> {
  const data = await AsyncStorage.getItem(CHALLENGES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getActiveChallenges(userId: string): Promise<Challenge[]> {
  const challenges = await getChallenges();
  const now = new Date();
  return challenges.filter(
    (c) =>
      c.participants.includes(userId) &&
      new Date(c.startDate) <= now &&
      new Date(c.endDate) >= now
  );
}

export async function joinChallenge(challengeId: string, userId: string): Promise<void> {
  const challenges = await getChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (challenge && !challenge.participants.includes(userId)) {
    challenge.participants.push(userId);
    await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  }
}

export async function leaveChallenge(challengeId: string, userId: string): Promise<void> {
  const challenges = await getChallenges();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (challenge) {
    challenge.participants = challenge.participants.filter((id) => id !== userId);
    await AsyncStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  }
}

export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  value: number
): Promise<void> {
  const progressData = await AsyncStorage.getItem(PROGRESS_KEY);
  const allProgress: ChallengeProgress[] = progressData ? JSON.parse(progressData) : [];
  
  const existingIndex = allProgress.findIndex(
    (p) => p.challengeId === challengeId && p.userId === userId
  );

  const progress: ChallengeProgress = {
    challengeId,
    userId,
    currentValue: value,
    rank: 0, // Will be calculated in getLeaderboard
    lastUpdated: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }

  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
}

export async function getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
  const progressData = await AsyncStorage.getItem(PROGRESS_KEY);
  const allProgress: ChallengeProgress[] = progressData ? JSON.parse(progressData) : [];
  
  const challengeProgress = allProgress
    .filter((p) => p.challengeId === challengeId)
    .sort((a, b) => b.currentValue - a.currentValue);

  // Mock user names (in real app, fetch from user database)
  const leaderboard: LeaderboardEntry[] = challengeProgress.map((p, index) => ({
    userId: p.userId,
    userName: `User ${p.userId.slice(0, 6)}`,
    value: p.currentValue,
    rank: index + 1,
  }));

  return leaderboard;
}

export async function getChallengeProgress(
  challengeId: string,
  userId: string
): Promise<ChallengeProgress | null> {
  const progressData = await AsyncStorage.getItem(PROGRESS_KEY);
  const allProgress: ChallengeProgress[] = progressData ? JSON.parse(progressData) : [];
  
  return allProgress.find(
    (p) => p.challengeId === challengeId && p.userId === userId
  ) || null;
}

export function getChallengeTypeLabel(type: ChallengeType): string {
  const labels: Record<ChallengeType, string> = {
    streak: "Longest Streak",
    average_energy: "Highest Average Energy",
    total_insights: "Most Insights Generated",
    workout_minutes: "Total Workout Minutes",
    journal_entries: "Most Journal Entries",
  };
  return labels[type];
}

export function getChallengeTypeIcon(type: ChallengeType): string {
  const icons: Record<ChallengeType, string> = {
    streak: "🔥",
    average_energy: "⚡",
    total_insights: "💡",
    workout_minutes: "💪",
    journal_entries: "📝",
  };
  return icons[type];
}

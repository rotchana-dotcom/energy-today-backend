/**
 * Wellness Features
 * Meditation, stress management, mood tracking, relationships, financial, career
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessMeditation, canAccessStressManagement, canAccessMoodTracking, canAccessRelationshipTracking, canAccessFinancialWellness, canAccessCareerEnergy } from "./feature-gates";

const STORAGE_KEY = "wellness";

// ============================================================================
// Meditation & Mindfulness (Phase 163)
// ============================================================================

export interface MeditationSession {
  id: string;
  title: string;
  duration: number; // minutes
  type: "breathing" | "body_scan" | "visualization" | "loving_kindness" | "mindfulness";
  audioUrl?: string;
  transcript: string;
  completed: boolean;
  completedAt?: Date;
}

export async function getMeditationSessions(): Promise<MeditationSession[]> {
  const access = await canAccessMeditation();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  return [
    {
      id: "1",
      title: "5-Minute Energy Boost",
      duration: 5,
      type: "breathing",
      transcript: "Find a comfortable position. Close your eyes. Take a deep breath in for 4 counts... Hold for 4... Exhale for 6...",
      completed: false,
    },
    {
      id: "2",
      title: "Midday Reset",
      duration: 10,
      type: "mindfulness",
      transcript: "Notice where you are right now. Feel your body in the chair. Hear the sounds around you...",
      completed: false,
    },
    {
      id: "3",
      title: "Evening Wind Down",
      duration: 15,
      type: "body_scan",
      transcript: "Lie down comfortably. We'll scan through your body, releasing tension from head to toe...",
      completed: false,
    },
  ];
}

export async function completeMeditationSession(sessionId: string): Promise<void> {
  const key = `${STORAGE_KEY}_meditation_${sessionId}`;
  await AsyncStorage.setItem(key, JSON.stringify({
    completedAt: new Date().toISOString(),
  }));
}

// ============================================================================
// Stress Management (Phase 164)
// ============================================================================

export interface StressLevel {
  level: number; // 1-10
  triggers: string[];
  symptoms: string[];
  copingStrategies: string[];
  timestamp: Date;
}

export interface BreathingExercise {
  id: string;
  name: string;
  pattern: { inhale: number; hold: number; exhale: number; pause: number };
  cycles: number;
  description: string;
}

export async function logStressLevel(stress: Omit<StressLevel, "timestamp">): Promise<void> {
  const access = await canAccessStressManagement();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_stress`;
  const data = await AsyncStorage.getItem(key);
  const history: StressLevel[] = data ? JSON.parse(data) : [];
  
  history.push({ ...stress, timestamp: new Date() });
  await AsyncStorage.setItem(key, JSON.stringify(history));
}

export function getBreathingExercises(): BreathingExercise[] {
  return [
    {
      id: "box",
      name: "Box Breathing",
      pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      cycles: 4,
      description: "Used by Navy SEALs to stay calm under pressure",
    },
    {
      id: "478",
      name: "4-7-8 Breathing",
      pattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
      cycles: 4,
      description: "Promotes relaxation and helps with sleep",
    },
    {
      id: "calm",
      name: "Calm Breathing",
      pattern: { inhale: 4, hold: 0, exhale: 6, pause: 0 },
      cycles: 6,
      description: "Simple technique to reduce anxiety quickly",
    },
  ];
}

// ============================================================================
// Mood Tracking (Phase 165)
// ============================================================================

export interface MoodEntry {
  id: string;
  mood: "great" | "good" | "okay" | "bad" | "terrible";
  emotions: string[];
  intensity: number; // 1-10
  notes?: string;
  triggers?: string[];
  activities?: string[];
  timestamp: Date;
}

export async function logMood(entry: Omit<MoodEntry, "id" | "timestamp">): Promise<void> {
  const access = await canAccessMoodTracking();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_mood`;
  const data = await AsyncStorage.getItem(key);
  const history: MoodEntry[] = data ? JSON.parse(data) : [];
  
  history.push({
    ...entry,
    id: Date.now().toString(),
    timestamp: new Date(),
  });
  
  await AsyncStorage.setItem(key, JSON.stringify(history));
}

export async function getMoodHistory(days: number = 30): Promise<MoodEntry[]> {
  const key = `${STORAGE_KEY}_mood`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return [];
  
  const history: MoodEntry[] = JSON.parse(data).map((entry: any) => ({
    ...entry,
    timestamp: new Date(entry.timestamp),
  }));
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return history.filter(entry => entry.timestamp >= cutoff);
}

export function getEmotionsList(): string[] {
  return [
    "Happy", "Sad", "Angry", "Anxious", "Calm", "Excited",
    "Frustrated", "Content", "Overwhelmed", "Peaceful", "Stressed",
    "Grateful", "Lonely", "Confident", "Insecure", "Energized",
  ];
}

// ============================================================================
// Relationship Tracking (Phase 166)
// ============================================================================

export interface Relationship {
  id: string;
  name: string;
  type: "partner" | "family" | "friend" | "colleague";
  energyImpact: "positive" | "neutral" | "negative";
  lastInteraction?: Date;
  notes?: string;
}

export interface SocialInteraction {
  id: string;
  relationshipId: string;
  type: "in_person" | "call" | "text" | "video";
  duration: number; // minutes
  quality: number; // 1-5
  energyBefore: number;
  energyAfter: number;
  notes?: string;
  timestamp: Date;
}

export async function addRelationship(rel: Omit<Relationship, "id">): Promise<void> {
  const key = `${STORAGE_KEY}_relationships`;
  const data = await AsyncStorage.getItem(key);
  const relationships: Relationship[] = data ? JSON.parse(data) : [];
  
  relationships.push({ ...rel, id: Date.now().toString() });
  await AsyncStorage.setItem(key, JSON.stringify(relationships));
}

export async function logSocialInteraction(
  interaction: Omit<SocialInteraction, "id" | "timestamp">
): Promise<void> {
  const access = await canAccessRelationshipTracking();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_interactions`;
  const data = await AsyncStorage.getItem(key);
  const interactions: SocialInteraction[] = data ? JSON.parse(data) : [];
  
  interactions.push({
    ...interaction,
    id: Date.now().toString(),
    timestamp: new Date(),
  });
  
  await AsyncStorage.setItem(key, JSON.stringify(interactions));
}

// ============================================================================
// Financial Wellness (Phase 167)
// ============================================================================

export interface FinancialStress {
  level: number; // 1-10
  concerns: string[];
  impact: "sleep" | "energy" | "mood" | "relationships" | "work";
  timestamp: Date;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: "high" | "medium" | "low";
}

export async function logFinancialStress(
  stress: Omit<FinancialStress, "timestamp">
): Promise<void> {
  const access = await canAccessFinancialWellness();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_financial_stress`;
  const data = await AsyncStorage.getItem(key);
  const history: FinancialStress[] = data ? JSON.parse(data) : [];
  
  history.push({ ...stress, timestamp: new Date() });
  await AsyncStorage.setItem(key, JSON.stringify(history));
}

export function getFinancialWellnessTips(): string[] {
  return [
    "Track your spending for one week to identify patterns",
    "Create a simple budget: 50% needs, 30% wants, 20% savings",
    "Build an emergency fund covering 3-6 months of expenses",
    "Automate savings - pay yourself first",
    "Review subscriptions monthly and cancel unused ones",
    "Set specific financial goals with deadlines",
    "Learn one new financial concept per week",
    "Celebrate small wins to stay motivated",
  ];
}

// ============================================================================
// Career Energy (Phase 168)
// ============================================================================

export interface WorkSession {
  id: string;
  type: "deep_work" | "meetings" | "admin" | "creative" | "learning";
  duration: number; // minutes
  energyBefore: number;
  energyAfter: number;
  productivity: number; // 1-10
  distractions: number;
  notes?: string;
  timestamp: Date;
}

export interface WorkLifeBalance {
  workHours: number;
  personalHours: number;
  sleepHours: number;
  exerciseHours: number;
  socialHours: number;
  date: Date;
}

export async function logWorkSession(
  session: Omit<WorkSession, "id" | "timestamp">
): Promise<void> {
  const access = await canAccessCareerEnergy();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_work_sessions`;
  const data = await AsyncStorage.getItem(key);
  const sessions: WorkSession[] = data ? JSON.parse(data) : [];
  
  sessions.push({
    ...session,
    id: Date.now().toString(),
    timestamp: new Date(),
  });
  
  await AsyncStorage.setItem(key, JSON.stringify(sessions));
}

export async function logWorkLifeBalance(
  balance: Omit<WorkLifeBalance, "date">
): Promise<void> {
  const key = `${STORAGE_KEY}_work_life_balance`;
  const data = await AsyncStorage.getItem(key);
  const history: WorkLifeBalance[] = data ? JSON.parse(data) : [];
  
  history.push({ ...balance, date: new Date() });
  await AsyncStorage.setItem(key, JSON.stringify(history));
}

export async function getCareerEnergyInsights(): Promise<{
  bestTimeForDeepWork: string;
  mostDrainingActivity: string;
  avgProductivity: number;
  workLifeScore: number;
}> {
  return {
    bestTimeForDeepWork: "9 AM - 11 AM",
    mostDrainingActivity: "meetings",
    avgProductivity: 7.2,
    workLifeScore: 6.8,
  };
}

export function getCareerEnergyTips(): string[] {
  return [
    "Block your peak energy hours for deep work",
    "Batch similar tasks together to reduce context switching",
    "Take a 5-minute break every hour",
    "Schedule meetings during your low-energy periods",
    "Set boundaries: no work emails after 7 PM",
    "Use the 2-minute rule: if it takes less than 2 minutes, do it now",
    "Review your week every Friday to plan the next",
    "Celebrate completed tasks, not just started ones",
  ];
}

/**
 * AI Features
 * Personal assistant, smart scheduling, auto-journaling, coaching evolution
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessAIAssistant, canAccessSmartScheduling, canAccessAutoJournaling, canAccessAICoachingEvolution } from "./feature-gates";

const STORAGE_KEY = "ai_features";

// ============================================================================
// AI Personal Assistant (Phase 169)
// ============================================================================

export interface AssistantSuggestion {
  id: string;
  type: "habit" | "schedule" | "insight" | "warning" | "celebration";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  action?: {
    label: string;
    type: string;
    params: Record<string, any>;
  };
  dismissible: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export async function getAssistantSuggestions(): Promise<AssistantSuggestion[]> {
  const access = await canAccessAIAssistant();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_suggestions`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return generateDefaultSuggestions();
  
  const suggestions: AssistantSuggestion[] = JSON.parse(data).map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    expiresAt: s.expiresAt ? new Date(s.expiresAt) : undefined,
  }));
  
  // Filter out expired
  const now = new Date();
  return suggestions.filter(s => !s.expiresAt || s.expiresAt > now);
}

function generateDefaultSuggestions(): AssistantSuggestion[] {
  return [
    {
      id: "1",
      type: "insight",
      priority: "high",
      title: "Peak Energy Window Detected",
      message: "You consistently have high energy between 9-11 AM. Block this time for your most important work.",
      action: {
        label: "Block Calendar",
        type: "block_time",
        params: { start: "09:00", end: "11:00" },
      },
      dismissible: true,
      createdAt: new Date(),
    },
    {
      id: "2",
      type: "warning",
      priority: "medium",
      title: "Energy Dip Predicted",
      message: "Based on your sleep last night (6 hours), you'll likely experience an energy dip around 2 PM. Consider a short walk or power nap.",
      dismissible: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "celebration",
      priority: "low",
      title: "7-Day Streak!",
      message: "You've logged your energy every day this week. Keep up the great work!",
      dismissible: true,
      createdAt: new Date(),
    },
  ];
}

export async function dismissSuggestion(id: string): Promise<void> {
  const suggestions = await getAssistantSuggestions();
  const filtered = suggestions.filter(s => s.id !== id);
  
  const key = `${STORAGE_KEY}_suggestions`;
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
}

// ============================================================================
// Smart Scheduling (Phase 170)
// ============================================================================

export interface SmartScheduleSlot {
  start: Date;
  end: Date;
  type: "deep_work" | "meetings" | "breaks" | "exercise" | "social";
  energyLevel: number;
  reasoning: string;
}

export interface ScheduleOptimization {
  currentScore: number;
  optimizedScore: number;
  improvements: string[];
  suggestedChanges: Array<{
    task: string;
    currentTime: string;
    suggestedTime: string;
    reason: string;
  }>;
}

export async function generateSmartSchedule(date: Date): Promise<SmartScheduleSlot[]> {
  const access = await canAccessSmartScheduling();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const schedule: SmartScheduleSlot[] = [];
  
  // Morning: High energy for deep work
  schedule.push({
    start: new Date(date.setHours(9, 0)),
    end: new Date(date.setHours(11, 0)),
    type: "deep_work",
    energyLevel: 9,
    reasoning: "Peak energy window - best for focused, important work",
  });
  
  // Late morning: Good for meetings
  schedule.push({
    start: new Date(date.setHours(11, 0)),
    end: new Date(date.setHours(12, 0)),
    type: "meetings",
    energyLevel: 7,
    reasoning: "Still high energy, good for collaboration",
  });
  
  // Lunch break
  schedule.push({
    start: new Date(date.setHours(12, 0)),
    end: new Date(date.setHours(13, 0)),
    type: "breaks",
    energyLevel: 5,
    reasoning: "Natural break time for meals and rest",
  });
  
  // Afternoon: Moderate energy for routine tasks
  schedule.push({
    start: new Date(date.setHours(13, 0)),
    end: new Date(date.setHours(15, 0)),
    type: "meetings",
    energyLevel: 6,
    reasoning: "Post-lunch dip - better for meetings than deep work",
  });
  
  // Late afternoon: Exercise boost
  schedule.push({
    start: new Date(date.setHours(15, 0)),
    end: new Date(date.setHours(16, 0)),
    type: "exercise",
    energyLevel: 5,
    reasoning: "Movement helps combat afternoon slump",
  });
  
  // Evening: Social time
  schedule.push({
    start: new Date(date.setHours(18, 0)),
    end: new Date(date.setHours(20, 0)),
    type: "social",
    energyLevel: 6,
    reasoning: "Good time for relationships and relaxation",
  });
  
  return schedule;
}

export async function optimizeSchedule(
  tasks: Array<{ name: string; duration: number; type: string; currentTime?: string }>
): Promise<ScheduleOptimization> {
  return {
    currentScore: 6.5,
    optimizedScore: 8.3,
    improvements: [
      "Move deep work to morning peak energy hours",
      "Batch meetings in afternoon low-energy period",
      "Add strategic breaks between tasks",
      "Schedule exercise before energy dip",
    ],
    suggestedChanges: [
      {
        task: "Write quarterly report",
        currentTime: "2:00 PM",
        suggestedTime: "9:00 AM",
        reason: "Requires focus - better during peak energy",
      },
      {
        task: "Team standup",
        currentTime: "9:30 AM",
        suggestedTime: "2:00 PM",
        reason: "Routine meeting - save morning for deep work",
      },
    ],
  };
}

export function getBestTimeFor(activityType: string): string {
  const recommendations: Record<string, string> = {
    deep_work: "9:00 AM - 11:00 AM (peak energy)",
    creative_work: "10:00 AM - 12:00 PM (high energy + creativity)",
    meetings: "2:00 PM - 4:00 PM (good for collaboration, not deep focus)",
    exercise: "3:00 PM - 5:00 PM (boosts afternoon energy)",
    learning: "10:00 AM - 12:00 PM (high focus and retention)",
    admin: "1:00 PM - 3:00 PM (routine tasks during energy dip)",
    social: "6:00 PM - 8:00 PM (relaxed evening energy)",
  };
  
  return recommendations[activityType] || "Flexible - schedule based on your energy";
}

// ============================================================================
// Auto-Journaling (Phase 171)
// ============================================================================

export interface AutoJournalEntry {
  id: string;
  date: Date;
  summary: string;
  highlights: string[];
  challenges: string[];
  energyPattern: string;
  insights: string[];
  gratitude: string[];
  tomorrowFocus: string[];
  generatedAt: Date;
}

export async function generateAutoJournal(date: Date): Promise<AutoJournalEntry> {
  const access = await canAccessAutoJournaling();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  // In production, analyze actual user data
  // For now, generate sample journal
  
  return {
    id: Date.now().toString(),
    date,
    summary: "Today was a productive day with steady energy levels. You maintained good habits and made progress on important goals.",
    highlights: [
      "Completed morning workout - boosted energy by 2 points",
      "Logged energy 5 times throughout the day",
      "Maintained 7-day habit streak",
      "Had quality time with family in the evening",
    ],
    challenges: [
      "Afternoon energy dip at 2 PM (as predicted)",
      "Skipped planned meditation session",
      "Stayed up 30 minutes past ideal bedtime",
    ],
    energyPattern: "Your energy peaked at 9 AM (8/10) and gradually declined to 5/10 by 3 PM. Evening energy recovered to 6/10 after dinner.",
    insights: [
      "8 hours of sleep resulted in 20% higher morning energy",
      "Exercise at 7 AM set a positive tone for the day",
      "Screen time before bed may have delayed sleep onset",
    ],
    gratitude: [
      "Supportive team at work",
      "Healthy meal prep made nutrition easy",
      "Beautiful weather for morning walk",
    ],
    tomorrowFocus: [
      "Block 9-11 AM for deep work on quarterly report",
      "Schedule 15-minute meditation at lunch",
      "Aim for 10:30 PM bedtime",
    ],
    generatedAt: new Date(),
  };
}

export async function saveAutoJournal(entry: AutoJournalEntry): Promise<void> {
  const key = `${STORAGE_KEY}_journals`;
  const data = await AsyncStorage.getItem(key);
  const journals: AutoJournalEntry[] = data ? JSON.parse(data) : [];
  
  journals.push(entry);
  await AsyncStorage.setItem(key, JSON.stringify(journals));
}

export async function getAutoJournals(days: number = 7): Promise<AutoJournalEntry[]> {
  const key = `${STORAGE_KEY}_journals`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return [];
  
  const journals: AutoJournalEntry[] = JSON.parse(data).map((j: any) => ({
    ...j,
    date: new Date(j.date),
    generatedAt: new Date(j.generatedAt),
  }));
  
  return journals.slice(-days);
}

// ============================================================================
// AI Coaching Evolution (Phase 174)
// ============================================================================

export interface CoachingProfile {
  userId: string;
  personalityType: "motivational" | "analytical" | "supportive" | "direct";
  communicationStyle: "casual" | "professional" | "friendly";
  focusAreas: string[];
  learningPreferences: string[];
  successPatterns: string[];
  challengePatterns: string[];
  lastUpdated: Date;
}

export interface CoachingFeedback {
  messageId: string;
  helpful: boolean;
  reason?: string;
  timestamp: Date;
}

export async function getCoachingProfile(userId: string): Promise<CoachingProfile> {
  const key = `${STORAGE_KEY}_coaching_${userId}`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) {
    return {
      userId,
      personalityType: "supportive",
      communicationStyle: "friendly",
      focusAreas: ["energy", "sleep", "habits"],
      learningPreferences: ["visual", "actionable"],
      successPatterns: [],
      challengePatterns: [],
      lastUpdated: new Date(),
    };
  }
  
  const profile = JSON.parse(data);
  return {
    ...profile,
    lastUpdated: new Date(profile.lastUpdated),
  };
}

export async function updateCoachingProfile(
  userId: string,
  updates: Partial<CoachingProfile>
): Promise<void> {
  const profile = await getCoachingProfile(userId);
  const updated = {
    ...profile,
    ...updates,
    lastUpdated: new Date(),
  };
  
  const key = `${STORAGE_KEY}_coaching_${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify(updated));
}

export async function recordCoachingFeedback(
  userId: string,
  feedback: CoachingFeedback
): Promise<void> {
  const access = await canAccessAICoachingEvolution();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_feedback_${userId}`;
  const data = await AsyncStorage.getItem(key);
  const history: CoachingFeedback[] = data ? JSON.parse(data) : [];
  
  history.push(feedback);
  await AsyncStorage.setItem(key, JSON.stringify(history));
  
  // Analyze feedback to evolve coaching style
  await evolveCoachingStyle(userId, history);
}

async function evolveCoachingStyle(
  userId: string,
  feedbackHistory: CoachingFeedback[]
): Promise<void> {
  // Analyze last 20 feedback items
  const recent = feedbackHistory.slice(-20);
  const helpfulCount = recent.filter(f => f.helpful).length;
  const helpfulRate = helpfulCount / recent.length;
  
  // If less than 60% helpful, adjust style
  if (helpfulRate < 0.6) {
    const profile = await getCoachingProfile(userId);
    
    // Try different personality type
    const types: CoachingProfile["personalityType"][] = [
      "motivational",
      "analytical",
      "supportive",
      "direct",
    ];
    const currentIndex = types.indexOf(profile.personalityType);
    const nextType = types[(currentIndex + 1) % types.length];
    
    await updateCoachingProfile(userId, {
      personalityType: nextType,
    });
  }
}

export function generateCoachingMessage(
  profile: CoachingProfile,
  context: {
    type: "insight" | "encouragement" | "suggestion" | "challenge";
    data: any;
  }
): string {
  const { personalityType, communicationStyle } = profile;
  
  // Customize message based on personality and style
  if (context.type === "insight") {
    if (personalityType === "analytical") {
      return "Analysis shows your energy peaks at 9 AM with 85% consistency. Optimize your schedule accordingly.";
    } else if (personalityType === "motivational") {
      return "You're crushing it! Your energy patterns show you're at your best at 9 AM - let's use that power!";
    } else if (personalityType === "supportive") {
      return "I've noticed you have great energy around 9 AM. How about we schedule your important tasks then?";
    } else {
      return "9 AM is your peak. Schedule deep work there.";
    }
  }
  
  return "Keep up the great work!";
}

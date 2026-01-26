/**
 * Focus Mode System
 * 
 * Block distractions during high-energy windows
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { saveActivityData, type ActivityData } from "@/app/services/correlation-engine";

const STORAGE_KEY = "@energy_today:focus_sessions";
const SETTINGS_KEY = "@energy_today:focus_settings";

export interface FocusSession {
  id: string;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  duration: number; // minutes
  energyLevel: number; // 0-100
  completed: boolean;
  interrupted: boolean;
  notes?: string;
}

export interface FocusSettings {
  enabled: boolean;
  autoStartDuringHighEnergy: boolean;
  minEnergyThreshold: number; // 0-100
  defaultDuration: number; // minutes
  blockNotifications: boolean;
  showTimer: boolean;
  allowBreaks: boolean;
  breakInterval: number; // minutes
  breakDuration: number; // minutes
}

const DEFAULT_SETTINGS: FocusSettings = {
  enabled: true,
  autoStartDuringHighEnergy: false,
  minEnergyThreshold: 70,
  defaultDuration: 25, // Pomodoro-style
  blockNotifications: true,
  showTimer: true,
  allowBreaks: true,
  breakInterval: 25,
  breakDuration: 5,
};

/**
 * Get all focus sessions
 */
export async function getFocusSessions(): Promise<FocusSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get focus sessions:", error);
  }
  return [];
}

/**
 * Start focus session
 */
export async function startFocusSession(
  duration: number,
  energyLevel: number
): Promise<FocusSession> {
  try {
    const sessions = await getFocusSessions();
    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60 * 1000);

    const session: FocusSession = {
      id: Date.now().toString(),
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      energyLevel,
      completed: false,
      interrupted: false,
    };

    sessions.push(session);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    // Block notifications if enabled
    const settings = await getFocusSettings();
    if (settings.blockNotifications) {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        }),
      });
    }

    // Schedule end notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Focus Session Complete",
        body: `Great job! You focused for ${duration} minutes.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: duration * 60,
      },
    });

    return session;
  } catch (error) {
    console.error("Failed to start focus session:", error);
    throw error;
  }
}

/**
 * End focus session
 */
export async function endFocusSession(
  id: string,
  completed: boolean = true
): Promise<void> {
  try {
    const sessions = await getFocusSessions();
    const index = sessions.findIndex((s) => s.id === id);
    
    if (index !== -1) {
      sessions[index].completed = completed;
      sessions[index].interrupted = !completed;
      sessions[index].endTime = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      
      // Also save to correlation engine
      const session = sessions[index];
      const sessionDate = new Date(session.startTime);
      const dateStr = sessionDate.toISOString().split('T')[0];
      
      const correlationData: ActivityData = {
        date: dateStr,
        activity: "focus_work",
        duration: session.duration,
        outcome: completed ? "success" : "incomplete",
        notes: session.notes,
      };
      
      await saveActivityData(correlationData);
    }

    // Restore notifications
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.error("Failed to end focus session:", error);
    throw error;
  }
}

/**
 * Get active focus session
 */
export async function getActiveFocusSession(): Promise<FocusSession | null> {
  try {
    const sessions = await getFocusSessions();
    const now = new Date();
    
    const active = sessions.find((s) => {
      const endTime = new Date(s.endTime);
      return !s.completed && !s.interrupted && endTime > now;
    });

    return active || null;
  } catch (error) {
    console.error("Failed to get active focus session:", error);
    return null;
  }
}

/**
 * Get focus settings
 */
export async function getFocusSettings(): Promise<FocusSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("Failed to get focus settings:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save focus settings
 */
export async function saveFocusSettings(settings: Partial<FocusSettings>): Promise<void> {
  try {
    const current = await getFocusSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save focus settings:", error);
    throw error;
  }
}

/**
 * Check if should auto-start focus mode
 */
export async function shouldAutoStartFocus(currentEnergy: number): Promise<boolean> {
  const settings = await getFocusSettings();
  const active = await getActiveFocusSession();
  
  return (
    settings.enabled &&
    settings.autoStartDuringHighEnergy &&
    currentEnergy >= settings.minEnergyThreshold &&
    !active
  );
}

/**
 * Get focus statistics
 */
export async function getFocusStats(days: number = 7): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  averageDuration: number;
  completionRate: number;
  averageEnergyLevel: number;
  bestTimeOfDay: string;
}> {
  const sessions = await getFocusSessions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSessions = sessions.filter((s) => {
    const startDate = new Date(s.startTime);
    return startDate >= cutoffDate;
  });

  if (recentSessions.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalMinutes: 0,
      averageDuration: 0,
      completionRate: 0,
      averageEnergyLevel: 0,
      bestTimeOfDay: "Morning",
    };
  }

  const completed = recentSessions.filter((s) => s.completed);
  const totalMinutes = completed.reduce((sum, s) => sum + s.duration, 0);
  const avgEnergy =
    recentSessions.reduce((sum, s) => sum + s.energyLevel, 0) / recentSessions.length;

  // Find best time of day
  const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
  for (const session of completed) {
    const hour = new Date(session.startTime).getHours();
    if (hour < 12) timeSlots.morning++;
    else if (hour < 18) timeSlots.afternoon++;
    else timeSlots.evening++;
  }

  const bestSlot = Object.entries(timeSlots).reduce((best, [slot, count]) =>
    count > timeSlots[best as keyof typeof timeSlots] ? slot : best
  , "morning");

  const bestTimeOfDay =
    bestSlot === "morning" ? "Morning" : bestSlot === "afternoon" ? "Afternoon" : "Evening";

  return {
    totalSessions: recentSessions.length,
    completedSessions: completed.length,
    totalMinutes,
    averageDuration: Math.round(totalMinutes / completed.length) || 0,
    completionRate: Math.round((completed.length / recentSessions.length) * 100),
    averageEnergyLevel: Math.round(avgEnergy),
    bestTimeOfDay,
  };
}

/**
 * Get focus session history
 */
export async function getFocusHistory(days: number = 30): Promise<FocusSession[]> {
  const sessions = await getFocusSessions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return sessions
    .filter((s) => new Date(s.startTime) >= cutoffDate)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

/**
 * Calculate remaining time in active session
 */
export function getRemainingTime(session: FocusSession): number {
  const now = new Date();
  const endTime = new Date(session.endTime);
  const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000 / 60));
  return remaining;
}

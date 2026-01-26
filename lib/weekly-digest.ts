/**
 * Weekly Digest Notifications
 * 
 * Generates and schedules weekly energy summary notifications
 */

import * as Notifications from "expo-notifications";
import { getJournalEntries, getUserProfile } from "./storage";
import { calculateUnifiedEnergy } from "./unified-energy-engine";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DIGEST_ENABLED_KEY = "weekly_digest_enabled";
const DIGEST_TIME_KEY = "weekly_digest_time";
const DIGEST_NOTIFICATION_ID_KEY = "weekly_digest_notification_id";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface DigestPreferences {
  enabled: boolean;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0-23
  minute: number; // 0-59
}

export async function getDigestPreferences(): Promise<DigestPreferences> {
  try {
    const enabled = await AsyncStorage.getItem(DIGEST_ENABLED_KEY);
    const time = await AsyncStorage.getItem(DIGEST_TIME_KEY);
    
    if (time) {
      const [dayOfWeek, hour, minute] = time.split(":").map(Number);
      return {
        enabled: enabled === "true",
        dayOfWeek,
        hour,
        minute,
      };
    }
    
    // Default: Sunday at 7 PM
    return {
      enabled: false,
      dayOfWeek: 0,
      hour: 19,
      minute: 0,
    };
  } catch (error) {
    console.error("Failed to load digest preferences:", error);
    return {
      enabled: false,
      dayOfWeek: 0,
      hour: 19,
      minute: 0,
    };
  }
}

export async function saveDigestPreferences(prefs: DigestPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(DIGEST_ENABLED_KEY, prefs.enabled.toString());
    await AsyncStorage.setItem(
      DIGEST_TIME_KEY,
      `${prefs.dayOfWeek}:${prefs.hour}:${prefs.minute}`
    );
    
    // Reschedule notifications
    if (prefs.enabled) {
      await scheduleWeeklyDigest(prefs);
    } else {
      await cancelWeeklyDigest();
    }
  } catch (error) {
    console.error("Failed to save digest preferences:", error);
    throw error;
  }
}

export async function generateWeeklySummary(): Promise<string> {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      return "Complete your profile to get personalized insights!";
    }

    // Get last 7 days of entries
    const entries = await getJournalEntries();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= sevenDaysAgo;
    });

    if (recentEntries.length === 0) {
      return "Start journaling to track your weekly energy patterns!";
    }

    // Calculate energy scores for each day
    const energyScores = [];
    for (const entry of recentEntries) {
      const energyData = await calculateUnifiedEnergy(profile, new Date(entry.date));
      energyScores.push({
        date: entry.date,
        score: energyData.combinedAnalysis.intensity,
      });
    }

    // Find best and worst days
    const sortedByScore = [...energyScores].sort((a, b) => b.score - a.score);
    const bestDay = sortedByScore[0];
    const worstDay = sortedByScore[sortedByScore.length - 1];

    // Calculate average
    const avgScore = energyScores.reduce((sum, day) => sum + day.score, 0) / energyScores.length;

    // Generate summary
    const summary = `🌟 Your Weekly Energy Summary\n\n` +
      `📊 Average Energy: ${Math.round(avgScore)}%\n` +
      `⚡ Best Day: ${new Date(bestDay.date).toLocaleDateString()} (${Math.round(bestDay.score)}%)\n` +
      `🔋 Challenging Day: ${new Date(worstDay.date).toLocaleDateString()} (${Math.round(worstDay.score)}%)\n\n` +
      `💡 Tip: ${getWeeklyTip(avgScore)}\n\n` +
      `Keep tracking to discover your energy patterns!`;

    return summary;
  } catch (error) {
    console.error("Failed to generate weekly summary:", error);
    return "Unable to generate summary. Please try again later.";
  }
}

function getWeeklyTip(avgScore: number): string {
  if (avgScore >= 70) {
    return "You're maintaining high energy! Consider sharing your strategies with your team.";
  } else if (avgScore >= 50) {
    return "Good energy balance. Focus on your peak hours for important tasks.";
  } else if (avgScore >= 30) {
    return "Your energy could use a boost. Review your sleep and stress management.";
  } else {
    return "Low energy week detected. Consider consulting with a wellness coach.";
  }
}

export async function scheduleWeeklyDigest(prefs: DigestPreferences): Promise<void> {
  try {
    // Cancel existing notification
    await cancelWeeklyDigest();

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Notification permissions not granted");
    }

    // Calculate next trigger time
    const now = new Date();
    const trigger = new Date();
    
    // Set to the specified day and time
    trigger.setDate(trigger.getDate() + ((prefs.dayOfWeek + 7 - trigger.getDay()) % 7));
    trigger.setHours(prefs.hour, prefs.minute, 0, 0);
    
    // If the time has already passed this week, schedule for next week
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 7);
    }

    // Generate summary
    const summary = await generateWeeklySummary();

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📊 Your Weekly Energy Digest",
        body: summary,
        data: { type: "weekly_digest" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        weekday: prefs.dayOfWeek + 1, // expo-notifications uses 1-7 (Sunday = 1)
        hour: prefs.hour,
        minute: prefs.minute,
      },
    });

    // Store notification ID
    await AsyncStorage.setItem(DIGEST_NOTIFICATION_ID_KEY, notificationId);
  } catch (error) {
    console.error("Failed to schedule weekly digest:", error);
    throw error;
  }
}

export async function cancelWeeklyDigest(): Promise<void> {
  try {
    const notificationId = await AsyncStorage.getItem(DIGEST_NOTIFICATION_ID_KEY);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(DIGEST_NOTIFICATION_ID_KEY);
    }
  } catch (error) {
    console.error("Failed to cancel weekly digest:", error);
  }
}

export async function testDigestNotification(): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Notification permissions not granted");
    }

    const summary = await generateWeeklySummary();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📊 Your Weekly Energy Digest (Test)",
        body: summary,
        data: { type: "weekly_digest_test" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
    throw error;
  }
}

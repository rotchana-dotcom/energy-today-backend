/**
 * Wellness Push Notifications System
 * 
 * Smart notifications for wellness plans, challenges, and optimal timing
 * Based on lunar cycles, user patterns, and 7 esoteric systems
 * 
 * Note: This is separate from the existing energy notifications in notifications.ts
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMoonPhase, getMoonPhaseName } from "./lunar-cycle";
import type { WellnessPlan, DailyTask } from "./wellness-plans";
import type { WellnessChallenge } from "./social-accountability";

const WELLNESS_NOTIFICATION_PREFS_KEY = "@energy_today:wellness_notification_prefs";

export interface WellnessNotificationPreferences {
  enabled: boolean;
  wellnessPlanReminders: boolean;
  challengeReminders: boolean;
  meditationSuggestions: boolean;
  achievementCelebrations: boolean;
  partnerUpdates: boolean;
  optimalTimes: {
    morning: string; // "07:00"
    afternoon: string; // "12:00"
    evening: string; // "19:00"
  };
}

export const DEFAULT_WELLNESS_NOTIFICATION_PREFERENCES: WellnessNotificationPreferences = {
  enabled: true,
  wellnessPlanReminders: true,
  challengeReminders: true,
  meditationSuggestions: true,
  achievementCelebrations: true,
  partnerUpdates: true,
  optimalTimes: {
    morning: "07:00",
    afternoon: "12:00",
    evening: "19:00",
  },
};

/**
 * Get wellness notification preferences
 */
export async function getWellnessNotificationPreferences(): Promise<WellnessNotificationPreferences> {
  const data = await AsyncStorage.getItem(WELLNESS_NOTIFICATION_PREFS_KEY);
  return data ? JSON.parse(data) : DEFAULT_WELLNESS_NOTIFICATION_PREFERENCES;
}

/**
 * Save wellness notification preferences
 */
export async function saveWellnessNotificationPreferences(
  prefs: WellnessNotificationPreferences
): Promise<void> {
  await AsyncStorage.setItem(WELLNESS_NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

/**
 * Schedule daily wellness plan reminders
 */
export async function scheduleWellnessPlanReminders(
  plan: WellnessPlan,
  preferences?: WellnessNotificationPreferences
): Promise<string[]> {
  if (Platform.OS === "web") return [];

  const prefs = preferences || (await getWellnessNotificationPreferences());
  if (!prefs.enabled || !prefs.wellnessPlanReminders) {
    return [];
  }

  const notificationIds: string[] = [];

  // Schedule notifications for the next 7 days
  for (let i = 0; i < 7; i++) {
    const dayTask = plan.dailyTasks.find((dt) => dt.day === plan.completedDays + i + 1);
    if (!dayTask) continue;

    const notificationTime = getOptimalNotificationTime(
      dayTask,
      prefs.optimalTimes.morning
    );

    const trigger = new Date();
    trigger.setDate(trigger.getDate() + i);
    const [hours, minutes] = notificationTime.split(":");
    trigger.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Day ${dayTask.day}: ${plan.title}`,
        body: generatePlanReminderMessage(dayTask, plan.goal),
        data: {
          type: "wellness_plan",
          planId: plan.id,
          day: dayTask.day,
        },
        sound: true,
      },
      trigger,
    });

    notificationIds.push(id);
  }

  return notificationIds;
}

/**
 * Get optimal notification time based on lunar cycle and task type
 */
function getOptimalNotificationTime(
  dayTask: DailyTask,
  defaultTime: string
): string {
  const moonPhase = dayTask.moonPhase;
  const moonPhaseName = dayTask.moonPhaseName;

  // Full moon: earlier notifications (high energy)
  if (moonPhaseName === "Full Moon") {
    return "06:30";
  }

  // New moon: slightly later (introspective energy)
  if (moonPhaseName === "New Moon") {
    return "07:30";
  }

  // Waxing moon (building energy): morning notifications
  if (moonPhase >= 0 && moonPhase < 0.5) {
    return "07:00";
  }

  // Waning moon (releasing energy): slightly later
  return "07:15";
}

/**
 * Generate personalized reminder message
 */
function generatePlanReminderMessage(dayTask: DailyTask, goal: string): string {
  const messages = {
    weight_loss: [
      `Today's focus: ${dayTask.energyFocus}. Stay committed to your goals!`,
      `Moon phase: ${dayTask.moonPhaseName}. Perfect energy for progress!`,
      `You have ${dayTask.tasks.length} tasks today. You've got this!`,
    ],
    better_sleep: [
      `Tonight's moon: ${dayTask.moonPhaseName}. Prepare for quality rest.`,
      `Focus on ${dayTask.energyFocus} today for better sleep tonight.`,
      `${dayTask.tasks.length} simple tasks for better sleep today.`,
    ],
    stress_reduction: [
      `Take a deep breath. Today's focus: ${dayTask.energyFocus}.`,
      `${dayTask.moonPhaseName} energy supports your peace today.`,
      `Your calm awaits. ${dayTask.tasks.length} mindful tasks ready.`,
    ],
    energy_boost: [
      `Rise and shine! ${dayTask.moonPhaseName} energy is perfect for you today.`,
      `Activate your ${dayTask.energyFocus} for peak energy!`,
      `${dayTask.tasks.length} energizing tasks await you!`,
    ],
    spiritual_growth: [
      `${dayTask.moonPhaseName}: A powerful day for spiritual work.`,
      `Connect with your ${dayTask.energyFocus} today.`,
      `Your spiritual journey continues. ${dayTask.tasks.length} practices ready.`,
    ],
    fitness_improvement: [
      `Time to move! ${dayTask.energyFocus} powers your workout today.`,
      `${dayTask.moonPhaseName} energy supports your fitness goals.`,
      `${dayTask.tasks.length} tasks to build your strength today!`,
    ],
  };

  const goalMessages = messages[goal as keyof typeof messages] || messages.energy_boost;
  return goalMessages[Math.floor(Math.random() * goalMessages.length)];
}

/**
 * Schedule challenge streak reminders
 */
export async function scheduleChallengeReminders(
  challenge: WellnessChallenge,
  preferences?: WellnessNotificationPreferences
): Promise<string[]> {
  if (Platform.OS === "web") return [];

  const prefs = preferences || (await getWellnessNotificationPreferences());
  if (!prefs.enabled || !prefs.challengeReminders) {
    return [];
  }

  const notificationIds: string[] = [];
  const [hours, minutes] = prefs.optimalTimes.morning.split(":");

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: challenge.title,
      body: `Don't break your streak! Complete today's ${challenge.type.replace("_", " ")}.`,
      data: {
        type: "challenge_reminder",
        challengeId: challenge.id,
      },
      sound: true,
    },
    trigger: {
      hour: parseInt(hours),
      minute: parseInt(minutes),
      repeats: true,
    },
  });

  notificationIds.push(id);
  return notificationIds;
}

/**
 * Send meditation time suggestion based on optimal energy
 */
export async function sendMeditationSuggestion(
  preferences?: WellnessNotificationPreferences
): Promise<void> {
  if (Platform.OS === "web") return;

  const prefs = preferences || (await getWellnessNotificationPreferences());
  if (!prefs.enabled || !prefs.meditationSuggestions) {
    return;
  }

  const now = new Date();
  const moonPhase = getMoonPhase(now);
  const moonPhaseName = getMoonPhaseName(moonPhase);

  let message = "";
  let suggestedTime = "";

  // Full moon: evening meditation
  if (moonPhaseName === "Full Moon") {
    message = "Full moon energy is perfect for evening meditation. Try the Lunar Sleep Meditation tonight.";
    suggestedTime = "20:00";
  }
  // New moon: morning meditation
  else if (moonPhaseName === "New Moon") {
    message = "New moon energy supports fresh intentions. Morning meditation is ideal today.";
    suggestedTime = "07:00";
  }
  // Waxing moon: energizing meditation
  else if (moonPhase >= 0 && moonPhase < 0.5) {
    message = "Waxing moon energy is building. Try Morning Energy Activation meditation.";
    suggestedTime = "06:30";
  }
  // Waning moon: releasing meditation
  else {
    message = "Waning moon supports letting go. Evening relaxation meditation recommended.";
    suggestedTime = "19:00";
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Perfect Time to Meditate",
      body: message,
      data: {
        type: "meditation_suggestion",
        suggestedTime,
        moonPhase: moonPhaseName,
      },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send achievement celebration notification
 */
export async function sendAchievementNotification(
  achievementTitle: string,
  achievementDescription: string,
  preferences?: WellnessNotificationPreferences
): Promise<void> {
  if (Platform.OS === "web") return;

  const prefs = preferences || (await getWellnessNotificationPreferences());
  if (!prefs.enabled || !prefs.achievementCelebrations) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎉 Achievement Unlocked!`,
      body: `${achievementTitle}: ${achievementDescription}`,
      data: {
        type: "achievement",
        title: achievementTitle,
      },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send partner activity notification
 */
export async function sendPartnerUpdateNotification(
  partnerName: string,
  activity: string,
  preferences?: WellnessNotificationPreferences
): Promise<void> {
  if (Platform.OS === "web") return;

  const prefs = preferences || (await getWellnessNotificationPreferences());
  if (!prefs.enabled || !prefs.partnerUpdates) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${partnerName} is making progress!`,
      body: activity,
      data: {
        type: "partner_update",
        partnerName,
      },
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Cancel wellness notifications (keeps energy notifications)
 */
export async function cancelWellnessNotifications(): Promise<void> {
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of allNotifications) {
    const data = notification.content.data as any;
    if (
      data?.type === "wellness_plan" ||
      data?.type === "challenge_reminder" ||
      data?.type === "meditation_suggestion" ||
      data?.type === "achievement" ||
      data?.type === "partner_update"
    ) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

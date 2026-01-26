import * as Notifications from "expo-notifications";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";
import { calculateTimeOfDayRecommendations } from "./time-of-day-energy";

/**
 * Schedule a smart notification that will be sent during the user's optimal energy window
 */
export async function scheduleSmartNotification(
  profile: UserProfile,
  title: string,
  body: string,
  targetDate: Date,
  activity?: string
): Promise<string> {
  // Calculate energy for the target date
  const energy = calculateDailyEnergy(profile, targetDate);
  
  // Get time-of-day recommendation
  let timeRec = { morning: 70, afternoon: 80, evening: 60 }; // Default
  if (activity) {
    const recs = calculateTimeOfDayRecommendations(profile, targetDate, activity);
    timeRec = {
      morning: recs.recommendations.find(r => r.time === "morning")?.score || 70,
      afternoon: recs.recommendations.find(r => r.time === "afternoon")?.score || 80,
      evening: recs.recommendations.find(r => r.time === "evening")?.score || 60,
    };
  }
  
  // Find the best time window
  let optimalHour = 14; // Default to 2 PM
  if (timeRec.afternoon >= timeRec.morning && timeRec.afternoon >= timeRec.evening) {
    optimalHour = 14; // 2 PM
  } else if (timeRec.morning >= timeRec.afternoon && timeRec.morning >= timeRec.evening) {
    optimalHour = 10; // 10 AM
  } else {
    optimalHour = 18; // 6 PM
  }
  
  // Schedule 30 minutes before the optimal time
  const notificationTime = new Date(targetDate);
  notificationTime.setHours(optimalHour - 1, 30, 0, 0);
  
  // Ensure notification is in the future
  if (notificationTime <= new Date()) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: "smart_reminder", activity },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationTime,
    } as Notifications.DateTriggerInput,
  });
  
  return notificationId;
}

/**
 * Schedule daily energy peak notifications
 */
export async function scheduleDailyEnergyPeakNotifications(
  profile: UserProfile,
  daysAhead: number = 7
): Promise<string[]> {
  const notificationIds: string[] = [];
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const energy = calculateDailyEnergy(profile, date);
    
    // Only notify on strong alignment days
    if (energy.connection.alignment === "strong") {
      const recs = calculateTimeOfDayRecommendations(profile, date, "important work");
      const timeRec = {
        morning: recs.recommendations.find(r => r.time === "morning")?.score || 70,
        afternoon: recs.recommendations.find(r => r.time === "afternoon")?.score || 80,
        evening: recs.recommendations.find(r => r.time === "evening")?.score || 60,
      };
      
      let peakHour = 14;
      if (timeRec.afternoon >= timeRec.morning && timeRec.afternoon >= timeRec.evening) {
        peakHour = 14;
      } else if (timeRec.morning >= timeRec.afternoon && timeRec.morning >= timeRec.evening) {
        peakHour = 10;
      } else {
        peakHour = 18;
      }
      
      const notificationTime = new Date(date);
      notificationTime.setHours(peakHour - 1, 0, 0, 0);
      
      if (notificationTime > new Date()) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "⚡ Energy Peak Approaching",
            body: `Your energy peaks in 1 hour—perfect time for important work`,
            data: { type: "energy_peak" },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationTime,
          } as Notifications.DateTriggerInput,
        });
        notificationIds.push(id);
      }
    }
  }
  
  return notificationIds;
}

/**
 * Cancel all scheduled smart notifications
 */
export async function cancelAllSmartNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get upcoming scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

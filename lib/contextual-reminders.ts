import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getUserProfile } from "./storage";
import { calculateTimeOfDayRecommendations } from "./time-of-day-energy";

const CONTEXTUAL_REMINDERS_KEY = "@energy_today:contextual_reminders_enabled";
const SCHEDULED_ACTIVITIES_KEY = "@energy_today:scheduled_activities";

export interface ScheduledActivity {
  id: string;
  activity: string;
  date: string; // ISO date string
  bestTime: "morning" | "afternoon" | "evening";
  reminderScheduled: boolean;
}

/**
 * Enable or disable contextual reminders
 */
export async function setContextualRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(CONTEXTUAL_REMINDERS_KEY, JSON.stringify(enabled));
  
  if (!enabled) {
    // Cancel all contextual reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const contextualReminders = scheduled.filter(n => 
      n.content.data?.type === "contextual_reminder"
    );
    
    for (const reminder of contextualReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
  }
}

/**
 * Check if contextual reminders are enabled
 */
export async function areContextualRemindersEnabled(): Promise<boolean> {
  const data = await AsyncStorage.getItem(CONTEXTUAL_REMINDERS_KEY);
  return data ? JSON.parse(data) : false;
}

/**
 * Schedule a contextual reminder for an activity
 */
export async function scheduleActivityReminder(
  activity: string,
  date: Date
): Promise<void> {
  if (Platform.OS === "web") return;

  const enabled = await areContextualRemindersEnabled();
  if (!enabled) return;

  const profile = await getUserProfile();
  if (!profile) return;

  // Get time recommendations
  const recommendations = calculateTimeOfDayRecommendations(profile, date, activity);
  const bestTime = recommendations.bestTime;

  // Calculate notification time (2 hours before best time)
  const notificationDate = new Date(date);
  
  if (bestTime === "morning") {
    notificationDate.setHours(6, 0, 0, 0); // Notify at 6 AM for morning activities
  } else if (bestTime === "afternoon") {
    notificationDate.setHours(11, 0, 0, 0); // Notify at 11 AM for afternoon activities
  } else {
    notificationDate.setHours(15, 0, 0, 0); // Notify at 3 PM for evening activities
  }

  // Only schedule if notification time is in the future
  if (notificationDate.getTime() <= Date.now()) {
    return;
  }

  const timeLabel = bestTime === "morning" ? "this morning" : 
                    bestTime === "afternoon" ? "this afternoon" : "this evening";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚡ Energy Peak Approaching",
      body: `Your energy peaks ${timeLabel} - great time for: ${activity}`,
      data: { 
        type: "contextual_reminder",
        activity,
        bestTime,
      },
    },
    trigger: notificationDate as any,
  });

  // Save scheduled activity
  await saveScheduledActivity({
    id: `activity_${Date.now()}`,
    activity,
    date: date.toISOString(),
    bestTime,
    reminderScheduled: true,
  });
}

/**
 * Save a scheduled activity
 */
async function saveScheduledActivity(activity: ScheduledActivity): Promise<void> {
  const data = await AsyncStorage.getItem(SCHEDULED_ACTIVITIES_KEY);
  const activities: ScheduledActivity[] = data ? JSON.parse(data) : [];
  
  activities.push(activity);
  await AsyncStorage.setItem(SCHEDULED_ACTIVITIES_KEY, JSON.stringify(activities));
}

/**
 * Get all scheduled activities
 */
export async function getScheduledActivities(): Promise<ScheduledActivity[]> {
  const data = await AsyncStorage.getItem(SCHEDULED_ACTIVITIES_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Remove old scheduled activities (past dates)
 */
export async function cleanupOldActivities(): Promise<void> {
  const activities = await getScheduledActivities();
  const now = new Date();
  
  const activeActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= now;
  });
  
  await AsyncStorage.setItem(SCHEDULED_ACTIVITIES_KEY, JSON.stringify(activeActivities));
}

/**
 * Schedule smart reminders for upcoming activities
 * This can be called daily or when user adds activities to calendar
 */
export async function scheduleSmartReminders(): Promise<void> {
  if (Platform.OS === "web") return;

  const enabled = await areContextualRemindersEnabled();
  if (!enabled) return;

  // Clean up old activities first
  await cleanupOldActivities();

  // In a full implementation, this would:
  // 1. Check user's calendar/planned activities
  // 2. Calculate optimal times for each
  // 3. Schedule reminders 1-2 hours before peak times
  // 4. Send notifications like "Your energy peaks in 2 hours - good time for that important call"
}

/**
 * Get reminder settings summary for display in Settings
 */
export async function getReminderSummary(): Promise<string> {
  const enabled = await areContextualRemindersEnabled();
  if (!enabled) return "Disabled";

  const activities = await getScheduledActivities();
  const upcomingCount = activities.filter(a => new Date(a.date) >= new Date()).length;

  if (upcomingCount === 0) {
    return "Enabled - No upcoming activities";
  }

  return `Enabled - ${upcomingCount} upcoming ${upcomingCount === 1 ? "reminder" : "reminders"}`;
}

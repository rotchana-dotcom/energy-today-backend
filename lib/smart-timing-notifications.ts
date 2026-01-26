/**
 * Smart Timing Notifications
 * 
 * Sends real-time alerts to users about their optimal performance windows:
 * - "Your peak decision-making window starts in 30 minutes"
 * - "Optimal meeting time approaching - prepare now"
 * - "Avoid major decisions for the next 2 hours"
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./storage";
import { calculateUnifiedEnergy } from "./unified-energy-engine";

const STORAGE_KEY = "@energy_today_smart_timing_enabled";

/**
 * Enable/disable smart timing notifications
 */
export async function setSmartTimingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  
  if (enabled) {
    await scheduleSmartTimingNotifications();
  } else {
    await cancelSmartTimingNotifications();
  }
}

/**
 * Check if smart timing notifications are enabled
 */
export async function isSmartTimingEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === "true";
}

/**
 * Schedule smart timing notifications for today
 */
export async function scheduleSmartTimingNotifications(): Promise<void> {
  // Cancel existing notifications first
  await cancelSmartTimingNotifications();
  
  const profile = await getUserProfile();
  if (!profile) return;
  
  const today = new Date();
  const reading = await calculateUnifiedEnergy(profile, today);
  
  // Parse optimal hour from business insights
  const optimalTimeMatch = reading.businessInsights.meetings.time.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!optimalTimeMatch) return;
  
  let optimalHour = parseInt(optimalTimeMatch[1]);
  const optimalMinute = parseInt(optimalTimeMatch[2]);
  const period = optimalTimeMatch[3];
  
  // Convert to 24-hour format
  if (period === "PM" && optimalHour !== 12) optimalHour += 12;
  if (period === "AM" && optimalHour === 12) optimalHour = 0;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Schedule notifications
  const notifications: Array<{
    title: string;
    body: string;
    trigger: Date;
    data: any;
  }> = [];
  
  // 1. Morning briefing (8 AM)
  if (currentHour < 8) {
    const morningTime = new Date(today);
    morningTime.setHours(8, 0, 0, 0);
    
    notifications.push({
      title: "Your Day Ahead",
      body: `Perfect Day Score: ${reading.combinedAnalysis.perfectDayScore}. ${reading.businessInsights.topPriority.split('.')[0]}.`,
      trigger: morningTime,
      data: { type: "morning_briefing", score: reading.combinedAnalysis.perfectDayScore, route: "/(tabs)/" }
    });
  }
  
  // 2. Pre-optimal window alert (30 minutes before)
  const preOptimalTime = new Date(today);
  preOptimalTime.setHours(optimalHour, optimalMinute - 30, 0, 0);
  
  if (preOptimalTime > now) {
    notifications.push({
      title: "Peak Performance Window Approaching",
      body: `Your optimal decision-making window starts in 30 minutes (${reading.businessInsights.meetings.time}). Prepare now!`,
      trigger: preOptimalTime,
      data: { type: "pre_optimal", confidence: reading.combinedAnalysis.confidenceScore, route: "/(tabs)/" }
    });
  }
  
  // 3. Optimal window start
  const optimalTime = new Date(today);
  optimalTime.setHours(optimalHour, optimalMinute, 0, 0);
  
  if (optimalTime > now) {
    notifications.push({
      title: "Peak Performance Window - NOW",
      body: `Your energy is at its peak right now. ${reading.businessInsights.topPriority.split('.')[0]}. Confidence: ${reading.combinedAnalysis.confidenceScore}%`,
      trigger: optimalTime,
      data: { type: "optimal_now", confidence: reading.combinedAnalysis.confidenceScore, route: "/(tabs)/" }
    });
  }
  
  // 4. Low-energy warning (if score < 60)
  if (reading.combinedAnalysis.perfectDayScore < 60) {
    const lowEnergyTime = new Date(today);
    lowEnergyTime.setHours(currentHour + 1, 0, 0, 0);
    
    if (lowEnergyTime.getHours() < 18) {
      notifications.push({
        title: "Energy Advisory",
        body: "Today favors planning over major decisions. Focus on preparation and strategic thinking.",
        trigger: lowEnergyTime,
        data: { type: "low_energy_warning", score: reading.combinedAnalysis.perfectDayScore, route: "/(tabs)/" }
      });
    }
  }
  
  // 5. End-of-day reflection (6 PM)
  if (currentHour < 18) {
    const eveningTime = new Date(today);
    eveningTime.setHours(18, 0, 0, 0);
    
    notifications.push({
      title: "Daily Reflection",
      body: "How did today go? Log your insights to improve future predictions.",
      trigger: eveningTime,
      data: { type: "evening_reflection", route: "/(tabs)/log" }
    });
  }
  
  // Schedule all notifications
  for (const notif of notifications) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notif.title,
        body: notif.body,
        data: notif.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notif.trigger },
    });
  }
  
  console.log(`Scheduled ${notifications.length} smart timing notifications`);
}

/**
 * Cancel all smart timing notifications
 */
export async function cancelSmartTimingNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notif of scheduled) {
    const data = notif.content.data;
    if (data && (
      data.type === "morning_briefing" ||
      data.type === "pre_optimal" ||
      data.type === "optimal_now" ||
      data.type === "low_energy_warning" ||
      data.type === "evening_reflection"
    )) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function handleSmartTimingNotification(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data;
  
  switch (data.type) {
    case "morning_briefing":
      // Navigate to Today screen
      break;
    case "pre_optimal":
    case "optimal_now":
      // Navigate to Today screen with focus on timing
      break;
    case "low_energy_warning":
      // Navigate to Forecast screen
      break;
    case "evening_reflection":
      // Navigate to Journal screen
      break;
  }
}

/**
 * Schedule notifications for the entire week (Pro feature)
 */
export async function scheduleWeeklySmartNotifications(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;
  
  // Cancel existing
  await cancelSmartTimingNotifications();
  
  // Schedule for next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    
    const reading = await calculateUnifiedEnergy(profile, date);
    
    // Morning briefing for each day
    const morningTime = new Date(date);
    morningTime.setHours(8, 0, 0, 0);
    
    if (morningTime > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${date.toLocaleDateString("en-US", { weekday: "long" })} Briefing`,
          body: `Perfect Day Score: ${reading.combinedAnalysis.perfectDayScore}. ${reading.businessInsights.topPriority.split('.')[0]}.`,
          data: { type: "morning_briefing", dayOffset, score: reading.combinedAnalysis.perfectDayScore, route: "/(tabs)/" },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morningTime },
      });
    }
  }
}

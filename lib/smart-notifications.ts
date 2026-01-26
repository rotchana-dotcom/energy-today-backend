import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const NOTIFICATION_SETTINGS_KEY = "smart_notification_settings";
const NOTIFICATION_HISTORY_KEY = "notification_history";
const USER_PATTERNS_KEY = "notification_user_patterns";

export interface NotificationSettings {
  enabled: boolean;
  habitReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  movementReminders: boolean;
  sleepReminders: boolean;
  energyCheckIns: boolean;
  adaptiveTiming: boolean;
  respectDoNotDisturb: boolean;
  batchNotifications: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
}

export interface ScheduledNotification {
  id: string;
  type: "habit" | "meal" | "hydration" | "movement" | "sleep" | "energy_checkin";
  title: string;
  body: string;
  scheduledTime: string;
  optimalTime: string;
  energyLevel?: number;
  priority: "low" | "medium" | "high";
  status: "pending" | "sent" | "dismissed" | "acted";
}

export interface UserPattern {
  habitCompletionTimes: { [habitId: string]: string[] }; // ISO timestamps
  mealTimes: string[]; // ISO timestamps
  activeHours: { start: string; end: string }; // HH:MM
  typicalEnergyPeaks: string[]; // HH:MM
  typicalEnergyDips: string[]; // HH:MM
  dismissalPatterns: { [type: string]: number }; // dismissal rate by type
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      enabled: true,
      habitReminders: true,
      mealReminders: true,
      hydrationReminders: true,
      movementReminders: true,
      sleepReminders: true,
      energyCheckIns: true,
      adaptiveTiming: true,
      respectDoNotDisturb: true,
      batchNotifications: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    return {
      enabled: true,
      habitReminders: true,
      mealReminders: true,
      hydrationReminders: true,
      movementReminders: true,
      sleepReminders: true,
      energyCheckIns: true,
      adaptiveTiming: true,
      respectDoNotDisturb: true,
      batchNotifications: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    throw error;
  }
}

/**
 * Get user patterns for adaptive timing
 */
async function getUserPatterns(): Promise<UserPattern> {
  try {
    const data = await AsyncStorage.getItem(USER_PATTERNS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default patterns
    return {
      habitCompletionTimes: {},
      mealTimes: [],
      activeHours: { start: "08:00", end: "22:00" },
      typicalEnergyPeaks: ["10:00", "15:00"],
      typicalEnergyDips: ["14:00", "20:00"],
      dismissalPatterns: {},
    };
  } catch (error) {
    console.error("Failed to get user patterns:", error);
    return {
      habitCompletionTimes: {},
      mealTimes: [],
      activeHours: { start: "08:00", end: "22:00" },
      typicalEnergyPeaks: ["10:00", "15:00"],
      typicalEnergyDips: ["14:00", "20:00"],
      dismissalPatterns: {},
    };
  }
}

/**
 * Update user patterns based on behavior
 */
export async function updateUserPatterns(
  updates: Partial<UserPattern>
): Promise<void> {
  try {
    const current = await getUserPatterns();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(USER_PATTERNS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update user patterns:", error);
  }
}

/**
 * Calculate optimal notification time based on energy and patterns
 */
async function calculateOptimalTime(
  type: ScheduledNotification["type"],
  baseTime: string,
  energyForecast?: { time: string; energy: number }[]
): Promise<string> {
  const settings = await getNotificationSettings();
  const patterns = await getUserPatterns();
  
  // If adaptive timing is disabled, use base time
  if (!settings.adaptiveTiming) {
    return baseTime;
  }
  
  // Parse base time
  const [hours, minutes] = baseTime.split(":").map(Number);
  let optimalHour = hours;
  
  // Adjust based on type and patterns
  switch (type) {
    case "habit":
      // Use historical completion times if available
      // For now, prefer energy peaks
      if (patterns.typicalEnergyPeaks.length > 0) {
        const closestPeak = patterns.typicalEnergyPeaks.reduce((prev, curr) => {
          const prevDiff = Math.abs(parseInt(prev.split(":")[0]) - hours);
          const currDiff = Math.abs(parseInt(curr.split(":")[0]) - hours);
          return currDiff < prevDiff ? curr : prev;
        });
        optimalHour = parseInt(closestPeak.split(":")[0]);
      }
      break;
      
    case "meal":
      // Use historical meal times
      if (patterns.mealTimes.length > 0) {
        const mealHours = patterns.mealTimes.map((t) =>
          new Date(t).getHours()
        );
        const avgHour = Math.round(
          mealHours.reduce((sum, h) => sum + h, 0) / mealHours.length
        );
        optimalHour = avgHour;
      }
      break;
      
    case "hydration":
      // Prefer energy dips (when people forget to hydrate)
      if (patterns.typicalEnergyDips.length > 0) {
        const closestDip = patterns.typicalEnergyDips.reduce((prev, curr) => {
          const prevDiff = Math.abs(parseInt(prev.split(":")[0]) - hours);
          const currDiff = Math.abs(parseInt(curr.split(":")[0]) - hours);
          return currDiff < prevDiff ? curr : prev;
        });
        optimalHour = parseInt(closestDip.split(":")[0]);
      }
      break;
      
    case "movement":
      // Prefer periods of low activity (typically after meals)
      optimalHour = hours + 1; // 1 hour after base time
      break;
      
    case "sleep":
      // Fixed time based on optimal bedtime
      optimalHour = 22; // 10 PM
      break;
      
    case "energy_checkin":
      // Prefer energy peaks for better engagement
      if (patterns.typicalEnergyPeaks.length > 0) {
        optimalHour = parseInt(patterns.typicalEnergyPeaks[0].split(":")[0]);
      }
      break;
  }
  
  // Ensure within active hours
  const activeStart = parseInt(patterns.activeHours.start.split(":")[0]);
  const activeEnd = parseInt(patterns.activeHours.end.split(":")[0]);
  optimalHour = Math.max(activeStart, Math.min(activeEnd, optimalHour));
  
  // Check quiet hours
  const quietStart = parseInt(settings.quietHoursStart.split(":")[0]);
  const quietEnd = parseInt(settings.quietHoursEnd.split(":")[0]);
  
  if (quietStart > quietEnd) {
    // Quiet hours span midnight
    if (optimalHour >= quietStart || optimalHour < quietEnd) {
      optimalHour = quietEnd;
    }
  } else {
    if (optimalHour >= quietStart && optimalHour < quietEnd) {
      optimalHour = quietEnd;
    }
  }
  
  return `${optimalHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Schedule a smart notification
 */
export async function scheduleSmartNotification(
  type: ScheduledNotification["type"],
  title: string,
  body: string,
  baseTime: string,
  priority: ScheduledNotification["priority"] = "medium"
): Promise<string> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) {
    throw new Error("Notifications are disabled");
  }
  
  // Check if this type is enabled
  const typeEnabled = {
    habit: settings.habitReminders,
    meal: settings.mealReminders,
    hydration: settings.hydrationReminders,
    movement: settings.movementReminders,
    sleep: settings.sleepReminders,
    energy_checkin: settings.energyCheckIns,
  };
  
  if (!typeEnabled[type]) {
    throw new Error(`${type} notifications are disabled`);
  }
  
  // Calculate optimal time
  const optimalTime = await calculateOptimalTime(type, baseTime);
  
  // Parse optimal time
  const [hours, minutes] = optimalTime.split(":").map(Number);
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (scheduledDate < new Date()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }
  
  // Schedule the notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type, priority, taskTitle: title },
      sound: true,
      categoryIdentifier: 'outcome_logging', // Enable action buttons
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledDate,
    } as Notifications.DateTriggerInput,
  });
  
  // Save to history
  const notification: ScheduledNotification = {
    id: notificationId,
    type,
    title,
    body,
    scheduledTime: scheduledDate.toISOString(),
    optimalTime,
    priority,
    status: "pending",
  };
  
  await saveNotificationToHistory(notification);
  
  return notificationId;
}

/**
 * Schedule habit reminder
 */
export async function scheduleHabitReminder(
  habitName: string,
  preferredTime: string
): Promise<string> {
  return scheduleSmartNotification(
    "habit",
    `Time for ${habitName}`,
    `Complete your ${habitName} habit to maintain your streak`,
    preferredTime,
    "high"
  );
}

/**
 * Schedule meal reminder
 */
export async function scheduleMealReminder(
  mealType: "breakfast" | "lunch" | "dinner",
  time: string
): Promise<string> {
  const titles = {
    breakfast: "Breakfast Time",
    lunch: "Lunch Time",
    dinner: "Dinner Time",
  };
  
  const bodies = {
    breakfast: "Start your day with a nutritious breakfast",
    lunch: "Time for a healthy lunch to maintain your energy",
    dinner: "Enjoy a balanced dinner for optimal recovery",
  };
  
  return scheduleSmartNotification(
    "meal",
    titles[mealType],
    bodies[mealType],
    time,
    "medium"
  );
}

/**
 * Schedule hydration reminder
 */
export async function scheduleHydrationReminder(time: string): Promise<string> {
  return scheduleSmartNotification(
    "hydration",
    "Stay Hydrated",
    "Remember to drink water to maintain your energy levels",
    time,
    "low"
  );
}

/**
 * Schedule movement reminder
 */
export async function scheduleMovementReminder(time: string): Promise<string> {
  return scheduleSmartNotification(
    "movement",
    "Time to Move",
    "Take a short break and move around to boost your energy",
    time,
    "medium"
  );
}

/**
 * Schedule sleep reminder
 */
export async function scheduleSleepReminder(bedtime: string): Promise<string> {
  return scheduleSmartNotification(
    "sleep",
    "Bedtime Reminder",
    "Wind down and prepare for quality sleep",
    bedtime,
    "high"
  );
}

/**
 * Schedule energy check-in
 */
export async function scheduleEnergyCheckIn(time: string): Promise<string> {
  return scheduleSmartNotification(
    "energy_checkin",
    "Energy Check-In",
    "How are you feeling? Log your energy level",
    time,
    "low"
  );
}

/**
 * Cancel notification
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
  
  // Update history
  const history = await getNotificationHistory();
  const updated = history.map((n) =>
    n.id === id ? { ...n, status: "dismissed" as const } : n
  );
  await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
}

/**
 * Cancel all notifications of a type
 */
export async function cancelNotificationsByType(
  type: ScheduledNotification["type"]
): Promise<void> {
  const history = await getNotificationHistory();
  const toCancel = history.filter((n) => n.type === type && n.status === "pending");
  
  for (const notification of toCancel) {
    await cancelNotification(notification.id);
  }
}

/**
 * Save notification to history
 */
async function saveNotificationToHistory(
  notification: ScheduledNotification
): Promise<void> {
  try {
    const history = await getNotificationHistory();
    history.push(notification);
    
    // Keep last 1000 notifications
    const trimmed = history.slice(-1000);
    
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save notification to history:", error);
  }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(): Promise<ScheduledNotification[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get notification history:", error);
    return [];
  }
}

/**
 * Mark notification as acted upon
 */
export async function markNotificationActed(id: string): Promise<void> {
  try {
    const history = await getNotificationHistory();
    const updated = history.map((n) =>
      n.id === id ? { ...n, status: "acted" as const } : n
    );
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to mark notification as acted:", error);
  }
}

/**
 * Get notification stats
 */
export async function getNotificationStats(days: number = 30): Promise<{
  totalSent: number;
  totalDismissed: number;
  totalActed: number;
  engagementRate: number;
  byType: { [key: string]: { sent: number; acted: number; rate: number } };
}> {
  const history = await getNotificationHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const recent = history.filter(
    (n) => new Date(n.scheduledTime) >= cutoff && n.status !== "pending"
  );
  
  const totalSent = recent.length;
  const totalDismissed = recent.filter((n) => n.status === "dismissed").length;
  const totalActed = recent.filter((n) => n.status === "acted").length;
  const engagementRate = totalSent > 0 ? (totalActed / totalSent) * 100 : 0;
  
  // Stats by type
  const byType: { [key: string]: { sent: number; acted: number; rate: number } } = {};
  
  const types = ["habit", "meal", "hydration", "movement", "sleep", "energy_checkin"];
  types.forEach((type) => {
    const typeNotifications = recent.filter((n) => n.type === type);
    const sent = typeNotifications.length;
    const acted = typeNotifications.filter((n) => n.status === "acted").length;
    const rate = sent > 0 ? (acted / sent) * 100 : 0;
    
    byType[type] = { sent, acted, rate };
  });
  
  return {
    totalSent,
    totalDismissed,
    totalActed,
    engagementRate,
    byType,
  };
}

/**
 * Get notification insights
 */
export async function getNotificationInsights(): Promise<string[]> {
  const insights: string[] = [];
  const stats = await getNotificationStats(30);
  
  if (stats.engagementRate > 70) {
    insights.push("🎯 Excellent notification engagement! You're acting on most reminders.");
  } else if (stats.engagementRate > 50) {
    insights.push("✅ Good notification engagement. Consider adjusting timing for better results.");
  } else if (stats.engagementRate > 0) {
    insights.push("⚠️ Low notification engagement. Try enabling adaptive timing for better results.");
  }
  
  // Find best performing type
  const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1].rate - a[1].rate);
  if (sortedTypes.length > 0 && sortedTypes[0][1].rate > 60) {
    insights.push(`💪 ${sortedTypes[0][0]} reminders work best for you (${Math.round(sortedTypes[0][1].rate)}% engagement)`);
  }
  
  // Find worst performing type
  if (sortedTypes.length > 0 && sortedTypes[sortedTypes.length - 1][1].rate < 30) {
    insights.push(`💡 Consider adjusting ${sortedTypes[sortedTypes.length - 1][0]} reminder timing or frequency`);
  }
  
  return insights;
}

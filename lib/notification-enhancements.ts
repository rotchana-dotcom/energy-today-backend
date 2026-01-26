import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const NOTIFICATION_SETTINGS_KEY = "notification_settings";
const NOTIFICATION_HISTORY_KEY = "notification_history";
const ENGAGEMENT_STATS_KEY = "notification_engagement";

export type NotificationCategory =
  | "energy_check"
  | "habit_reminder"
  | "meal_reminder"
  | "hydration"
  | "movement"
  | "sleep"
  | "social"
  | "achievement"
  | "insight"
  | "challenge";

export type NotificationPriority = "low" | "default" | "high" | "max";

export interface RichNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  imageUrl?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  groupId?: string;
  groupSummary?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  type?: "text_input" | "button";
  placeholder?: string; // For text_input
  destructive?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: Record<NotificationCategory, {
    enabled: boolean;
    priority: NotificationPriority;
    sound: string;
    vibrate: boolean;
  }>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  smartTiming: {
    enabled: boolean;
    avoidLowEnergyTimes: boolean;
    preferHighEnergyTimes: boolean;
  };
  grouping: {
    enabled: boolean;
    maxPerGroup: number;
  };
}

export interface NotificationHistory {
  id: string;
  notification: RichNotification;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  dismissedAt?: string;
  actionTaken?: string;
}

export interface EngagementStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalDismissed: number;
  openRate: number; // percentage
  avgTimeToOpen: number; // seconds
  byCategory: Record<NotificationCategory, {
    sent: number;
    opened: number;
    openRate: number;
  }>;
  byTimeOfDay: Record<number, { // hour of day
    sent: number;
    opened: number;
    openRate: number;
  }>;
}

/**
 * Initialize notification enhancements
 */
export async function initializeNotificationEnhancements(): Promise<void> {
  // Set default notification handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const settings = await getNotificationSettings();
      const category = notification.request.content.data?.category as NotificationCategory;
      
      // Check if in quiet hours
      if (settings.quietHours.enabled && isInQuietHours(settings.quietHours)) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }
      
      // Get category settings
      const categorySettings = category ? settings.categories[category] : undefined;
      
      return {
        shouldShowAlert: true,
        shouldPlaySound: categorySettings?.sound !== "none",
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });
  
  // Register notification categories with actions
  if (Platform.OS === "ios") {
    await Notifications.setNotificationCategoryAsync("energy_check", [
      {
        identifier: "log_energy",
        buttonTitle: "Log Energy",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "snooze",
        buttonTitle: "Remind Later",
        options: { opensAppToForeground: false },
      },
    ]);
    
    await Notifications.setNotificationCategoryAsync("habit_reminder", [
      {
        identifier: "complete",
        buttonTitle: "Mark Complete",
        options: { opensAppToForeground: false },
      },
      {
        identifier: "skip",
        buttonTitle: "Skip Today",
        options: { opensAppToForeground: false, isDestructive: true },
      },
    ]);
  }
}

/**
 * Send rich notification
 */
export async function sendRichNotification(
  notification: RichNotification,
  scheduledTime?: Date
): Promise<string> {
  const settings = await getNotificationSettings();
  
  // Check if category is enabled
  if (!settings.categories[notification.category]?.enabled) {
    throw new Error(`Notifications for category ${notification.category} are disabled`);
  }
  
  // Apply smart timing if enabled
  let finalTime = scheduledTime;
  if (settings.smartTiming.enabled && scheduledTime) {
    finalTime = await applySmartTiming(scheduledTime, notification.category);
  }
  
  // Prepare notification content
  const content: Notifications.NotificationContentInput = {
    title: notification.title,
    body: notification.body,
    data: {
      ...notification.data,
      category: notification.category,
      notificationId: notification.id,
    },
    sound: notification.sound || settings.categories[notification.category]?.sound || "default",
    badge: notification.badge,
  };
  
  // Add image if provided (iOS only)
  if (Platform.OS === "ios" && notification.imageUrl) {
    content.attachments = [
      {
        identifier: "image",
        url: notification.imageUrl,
        typeHint: "public.image",
      } as any, // Type assertion needed due to expo-notifications type limitations
    ];
  }
  
  // Add category for actions (iOS)
  if (Platform.OS === "ios" && notification.actions) {
    content.categoryIdentifier = notification.category;
  }
  
  // Note: Grouping on Android requires native configuration
  // For now, we'll use the groupId in data payload
  if (notification.groupId) {
    content.data = { ...content.data, groupId: notification.groupId };
  }
  
  // Schedule notification
  const trigger = finalTime
    ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: finalTime } as Notifications.DateTriggerInput
    : null;
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content,
    trigger,
  });
  
  // Record in history
  await recordNotificationHistory({
    id: notificationId,
    notification,
    sentAt: new Date().toISOString(),
  });
  
  // Update engagement stats
  await updateEngagementStats({ sent: 1, category: notification.category });
  
  return notificationId;
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
    
    // Return default settings
    return getDefaultNotificationSettings();
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    return getDefaultNotificationSettings();
  }
}

/**
 * Get default notification settings
 */
function getDefaultNotificationSettings(): NotificationSettings {
  const defaultCategorySettings = {
    enabled: true,
    priority: "default" as NotificationPriority,
    sound: "default",
    vibrate: true,
  };
  
  return {
    enabled: true,
    categories: {
      energy_check: defaultCategorySettings,
      habit_reminder: defaultCategorySettings,
      meal_reminder: defaultCategorySettings,
      hydration: defaultCategorySettings,
      movement: defaultCategorySettings,
      sleep: defaultCategorySettings,
      social: defaultCategorySettings,
      achievement: { ...defaultCategorySettings, priority: "high" },
      insight: defaultCategorySettings,
      challenge: defaultCategorySettings,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    smartTiming: {
      enabled: true,
      avoidLowEnergyTimes: true,
      preferHighEnergyTimes: false,
    },
    grouping: {
      enabled: true,
      maxPerGroup: 3,
    },
  };
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  updates: Partial<NotificationSettings>
): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    const updated = { ...settings, ...updates };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    throw error;
  }
}

/**
 * Check if current time is in quiet hours
 */
function isInQuietHours(quietHours: NotificationSettings["quietHours"]): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  
  const start = quietHours.start;
  const end = quietHours.end;
  
  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }
  
  return currentTime >= start && currentTime <= end;
}

/**
 * Apply smart timing to notification
 */
async function applySmartTiming(
  scheduledTime: Date,
  category: NotificationCategory
): Promise<Date> {
  // In production, would analyze user's energy patterns
  // For now, apply simple rules
  
  const hour = scheduledTime.getHours();
  
  // Avoid very early morning (before 7am)
  if (hour < 7) {
    scheduledTime.setHours(9, 0, 0, 0);
  }
  
  // Avoid late night (after 10pm)
  if (hour >= 22) {
    scheduledTime.setHours(20, 0, 0, 0);
  }
  
  // Avoid typical low-energy times (2-4pm) for important notifications
  if (hour >= 14 && hour < 16 && category !== "hydration" && category !== "movement") {
    scheduledTime.setHours(16, 0, 0, 0);
  }
  
  return scheduledTime;
}

/**
 * Record notification history
 */
async function recordNotificationHistory(history: NotificationHistory): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    const historyList: NotificationHistory[] = data ? JSON.parse(data) : [];
    
    historyList.push(history);
    
    // Keep only last 100 notifications
    if (historyList.length > 100) {
      historyList.shift();
    }
    
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(historyList));
  } catch (error) {
    console.error("Failed to record notification history:", error);
  }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(
  filters?: {
    category?: NotificationCategory;
    startDate?: string;
    endDate?: string;
  }
): Promise<NotificationHistory[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    let history: NotificationHistory[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        history = history.filter((h) => h.notification.category === filters.category);
      }
      if (filters.startDate) {
        history = history.filter((h) => h.sentAt >= filters.startDate!);
      }
      if (filters.endDate) {
        history = history.filter((h) => h.sentAt <= filters.endDate!);
      }
    }
    
    return history.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  } catch (error) {
    console.error("Failed to get notification history:", error);
    return [];
  }
}

/**
 * Update notification history (mark as opened/dismissed)
 */
export async function updateNotificationHistory(
  notificationId: string,
  updates: Partial<NotificationHistory>
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    const history: NotificationHistory[] = data ? JSON.parse(data) : [];
    
    const index = history.findIndex((h) => h.id === notificationId);
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
      
      // Update engagement stats
      if (updates.openedAt) {
        await updateEngagementStats({
          opened: 1,
          category: history[index].notification.category,
        });
      }
    }
  } catch (error) {
    console.error("Failed to update notification history:", error);
  }
}

/**
 * Update engagement stats
 */
async function updateEngagementStats(updates: {
  sent?: number;
  opened?: number;
  category: NotificationCategory;
}): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(ENGAGEMENT_STATS_KEY);
    const stats: EngagementStats = data
      ? JSON.parse(data)
      : {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalDismissed: 0,
          openRate: 0,
          avgTimeToOpen: 0,
          byCategory: {} as Record<NotificationCategory, { sent: number; opened: number; openRate: number }>,
          byTimeOfDay: {} as Record<number, { sent: number; opened: number; openRate: number }>,
        };
    
    if (updates.sent) {
      stats.totalSent += updates.sent;
      
      if (!stats.byCategory[updates.category]) {
        stats.byCategory[updates.category] = { sent: 0, opened: 0, openRate: 0 };
      }
      stats.byCategory[updates.category].sent += updates.sent;
    }
    
    if (updates.opened) {
      stats.totalOpened += updates.opened;
      
      if (!stats.byCategory[updates.category]) {
        stats.byCategory[updates.category] = { sent: 0, opened: 0, openRate: 0 };
      }
      stats.byCategory[updates.category].opened += updates.opened;
      stats.byCategory[updates.category].openRate =
        (stats.byCategory[updates.category].opened / stats.byCategory[updates.category].sent) * 100;
    }
    
    stats.openRate = stats.totalSent > 0 ? (stats.totalOpened / stats.totalSent) * 100 : 0;
    
    await AsyncStorage.setItem(ENGAGEMENT_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to update engagement stats:", error);
  }
}

/**
 * Get engagement stats
 */
export async function getEngagementStats(): Promise<EngagementStats> {
  try {
    const data = await AsyncStorage.getItem(ENGAGEMENT_STATS_KEY);
    
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalDismissed: 0,
      openRate: 0,
      avgTimeToOpen: 0,
      byCategory: {} as Record<NotificationCategory, { sent: number; opened: number; openRate: number }>,
      byTimeOfDay: {} as Record<number, { sent: number; opened: number; openRate: number }>,
    };
  } catch (error) {
    console.error("Failed to get engagement stats:", error);
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalDismissed: 0,
      openRate: 0,
      avgTimeToOpen: 0,
      byCategory: {} as Record<NotificationCategory, { sent: number; opened: number; openRate: number }>,
      byTimeOfDay: {} as Record<number, { sent: number; opened: number; openRate: number }>,
    };
  }
}

/**
 * Group notifications
 */
export async function groupNotifications(
  notifications: RichNotification[],
  groupId: string,
  groupSummary: string
): Promise<string[]> {
  const settings = await getNotificationSettings();
  
  if (!settings.grouping.enabled) {
    // Send individually if grouping disabled
    return Promise.all(notifications.map((n) => sendRichNotification(n)));
  }
  
  // Limit to maxPerGroup
  const limitedNotifications = notifications.slice(0, settings.grouping.maxPerGroup);
  
  // Send notifications with group ID
  const notificationIds = await Promise.all(
    limitedNotifications.map((n) =>
      sendRichNotification({
        ...n,
        groupId,
        groupSummary,
      })
    )
  );
  
  // If more than maxPerGroup, send a summary notification
  if (notifications.length > settings.grouping.maxPerGroup) {
    const summaryId = await sendRichNotification({
      id: `${groupId}_summary`,
      title: groupSummary,
      body: `${notifications.length} new notifications`,
      category: notifications[0].category,
      priority: "default",
      groupId,
    });
    notificationIds.push(summaryId);
  }
  
  return notificationIds;
}

/**
 * Cancel notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Test notification
 */
export async function sendTestNotification(category: NotificationCategory): Promise<void> {
  await sendRichNotification({
    id: `test_${Date.now()}`,
    title: "Test Notification",
    body: `This is a test notification for ${category}`,
    category,
    priority: "default",
  });
}

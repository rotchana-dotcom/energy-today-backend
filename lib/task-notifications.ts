import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_NOTIFICATIONS_KEY = "@energy_today:task_notifications";

export interface TaskNotification {
  taskId: string;
  notificationId: string;
  scheduledFor: string; // ISO date string
}

/**
 * Schedule a notification for a task at its scheduled date/time
 * 
 * @param taskId - Unique task identifier
 * @param taskTitle - Task title for notification
 * @param taskDescription - Task description (optional)
 * @param scheduledDate - Date in YYYY-MM-DD format
 * @param scheduledTime - Time in HH:MM format
 * @returns Notification ID if scheduled successfully, null otherwise
 */
export async function scheduleTaskNotification(
  taskId: string,
  taskTitle: string,
  taskDescription: string | undefined,
  scheduledDate: string,
  scheduledTime: string
): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    // Parse date and time
    const [year, month, day] = scheduledDate.split("-").map(Number);
    const [hour, minute] = scheduledTime.split(":").map(Number);

    // Create Date object
    const triggerDate = new Date(year, month - 1, day, hour, minute);

    // Don't schedule if date is in the past
    if (triggerDate.getTime() <= Date.now()) {
      console.log("[TaskNotifications] Date is in the past, not scheduling");
      return null;
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Task Reminder: ${taskTitle}`,
        body: taskDescription || "Time to work on this task!",
        data: {
          type: "task_reminder",
          taskId,
          route: "/task-scheduler",
        },
      },
      trigger: triggerDate,
    });

    // Store notification mapping
    await saveTaskNotification(taskId, notificationId, triggerDate.toISOString());

    console.log(`[TaskNotifications] Scheduled notification ${notificationId} for task ${taskId}`);
    return notificationId;
  } catch (error) {
    console.error("[TaskNotifications] Failed to schedule notification:", error);
    return null;
  }
}

/**
 * Cancel a notification for a specific task
 * 
 * @param taskId - Task identifier
 */
export async function cancelTaskNotification(taskId: string): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const notifications = await getTaskNotifications();
    const taskNotification = notifications.find((n) => n.taskId === taskId);

    if (taskNotification) {
      await Notifications.cancelScheduledNotificationAsync(taskNotification.notificationId);
      await removeTaskNotification(taskId);
      console.log(`[TaskNotifications] Cancelled notification for task ${taskId}`);
    }
  } catch (error) {
    console.error("[TaskNotifications] Failed to cancel notification:", error);
  }
}

/**
 * Cancel all task notifications
 */
export async function cancelAllTaskNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const notifications = await getTaskNotifications();
    
    for (const notification of notifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
    }

    await AsyncStorage.removeItem(TASK_NOTIFICATIONS_KEY);
    console.log("[TaskNotifications] Cancelled all task notifications");
  } catch (error) {
    console.error("[TaskNotifications] Failed to cancel all notifications:", error);
  }
}

/**
 * Get all scheduled task notifications
 */
async function getTaskNotifications(): Promise<TaskNotification[]> {
  try {
    const data = await AsyncStorage.getItem(TASK_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("[TaskNotifications] Failed to get notifications:", error);
    return [];
  }
}

/**
 * Save a task notification mapping
 */
async function saveTaskNotification(
  taskId: string,
  notificationId: string,
  scheduledFor: string
): Promise<void> {
  try {
    const notifications = await getTaskNotifications();
    
    // Remove existing notification for this task
    const filtered = notifications.filter((n) => n.taskId !== taskId);
    
    // Add new notification
    filtered.push({ taskId, notificationId, scheduledFor });
    
    await AsyncStorage.setItem(TASK_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[TaskNotifications] Failed to save notification:", error);
  }
}

/**
 * Remove a task notification mapping
 */
async function removeTaskNotification(taskId: string): Promise<void> {
  try {
    const notifications = await getTaskNotifications();
    const filtered = notifications.filter((n) => n.taskId !== taskId);
    await AsyncStorage.setItem(TASK_NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("[TaskNotifications] Failed to remove notification:", error);
  }
}

/**
 * Clean up expired notifications (past date)
 */
export async function cleanupExpiredTaskNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const notifications = await getTaskNotifications();
    const now = Date.now();
    
    const active = notifications.filter((n) => {
      const scheduledTime = new Date(n.scheduledFor).getTime();
      return scheduledTime > now;
    });

    await AsyncStorage.setItem(TASK_NOTIFICATIONS_KEY, JSON.stringify(active));
    console.log(`[TaskNotifications] Cleaned up ${notifications.length - active.length} expired notifications`);
  } catch (error) {
    console.error("[TaskNotifications] Failed to cleanup notifications:", error);
  }
}

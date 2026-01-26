/**
 * Adaptive Reminders System
 * 
 * Smart reminders that adapt to predicted energy levels
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "@energy_today:adaptive_reminders";

export interface AdaptiveReminder {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  preferredTime?: string; // HH:MM format
  adaptToEnergy: boolean;
  minEnergyLevel: number; // 0-100
  createdAt: string;
  lastTriggered?: string;
  isActive: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  respectQuietHours: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
  maxRemindersPerDay: number;
}

/**
 * Get all adaptive reminders
 */
export async function getAdaptiveReminders(): Promise<AdaptiveReminder[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get adaptive reminders:", error);
  }
  return [];
}

/**
 * Add a new adaptive reminder
 */
export async function addAdaptiveReminder(
  reminder: Omit<AdaptiveReminder, "id" | "createdAt">
): Promise<AdaptiveReminder> {
  try {
    const reminders = await getAdaptiveReminders();
    const newReminder: AdaptiveReminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    reminders.push(newReminder);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    return newReminder;
  } catch (error) {
    console.error("Failed to add adaptive reminder:", error);
    throw error;
  }
}

/**
 * Update an adaptive reminder
 */
export async function updateAdaptiveReminder(
  id: string,
  updates: Partial<Omit<AdaptiveReminder, "id" | "createdAt">>
): Promise<void> {
  try {
    const reminders = await getAdaptiveReminders();
    const index = reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }
  } catch (error) {
    console.error("Failed to update adaptive reminder:", error);
    throw error;
  }
}

/**
 * Delete an adaptive reminder
 */
export async function deleteAdaptiveReminder(id: string): Promise<void> {
  try {
    const reminders = await getAdaptiveReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete adaptive reminder:", error);
    throw error;
  }
}

/**
 * Get reminder settings
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const data = await AsyncStorage.getItem(`${STORAGE_KEY}:settings`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get reminder settings:", error);
  }

  // Default settings
  return {
    enabled: true,
    respectQuietHours: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    maxRemindersPerDay: 5,
  };
}

/**
 * Save reminder settings
 */
export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}:settings`, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save reminder settings:", error);
    throw error;
  }
}

/**
 * Check if reminder should be sent based on energy level
 */
export function shouldSendReminder(
  reminder: AdaptiveReminder,
  predictedEnergy: number
): boolean {
  if (!reminder.isActive) return false;
  if (!reminder.adaptToEnergy) return true;

  // High priority reminders always send
  if (reminder.priority === "high") return true;

  // Medium priority needs at least minimum energy
  if (reminder.priority === "medium") {
    return predictedEnergy >= reminder.minEnergyLevel;
  }

  // Low priority needs good energy
  return predictedEnergy >= Math.max(reminder.minEnergyLevel, 60);
}

/**
 * Schedule adaptive reminder notification
 */
export async function scheduleAdaptiveNotification(
  reminder: AdaptiveReminder,
  predictedEnergy: number
): Promise<string | null> {
  try {
    if (!shouldSendReminder(reminder, predictedEnergy)) {
      return null;
    }

    const settings = await getReminderSettings();
    if (!settings.enabled) return null;

    // Calculate optimal time based on energy and preferences
    const now = new Date();
    const triggerTime = new Date(now);

    if (reminder.preferredTime) {
      const [hours, minutes] = reminder.preferredTime.split(":").map(Number);
      triggerTime.setHours(hours, minutes, 0, 0);

      // If preferred time is in the past, schedule for tomorrow
      if (triggerTime < now) {
        triggerTime.setDate(triggerTime.getDate() + 1);
      }
    } else {
      // Schedule for 1 hour from now
      triggerTime.setHours(now.getHours() + 1);
    }

    // Check quiet hours
    if (settings.respectQuietHours) {
      const [quietStart, quietEnd] = [
        settings.quietHoursStart,
        settings.quietHoursEnd,
      ].map((time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      });

      const triggerMinutes = triggerTime.getHours() * 60 + triggerTime.getMinutes();

      if (
        (quietStart < quietEnd && triggerMinutes >= quietStart && triggerMinutes < quietEnd) ||
        (quietStart > quietEnd && (triggerMinutes >= quietStart || triggerMinutes < quietEnd))
      ) {
        // Reschedule to end of quiet hours
        const [endHours, endMinutes] = settings.quietHoursEnd.split(":").map(Number);
        triggerTime.setHours(endHours, endMinutes, 0, 0);
        if (triggerTime < now) {
          triggerTime.setDate(triggerTime.getDate() + 1);
        }
      }
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description || "Time to complete this task!",
        data: { reminderId: reminder.id, energy: predictedEnergy, taskTitle: reminder.title },
        categoryIdentifier: 'outcome_logging', // Enable action buttons
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerTime },
    });

    // Update last triggered time
    await updateAdaptiveReminder(reminder.id, {
      lastTriggered: new Date().toISOString(),
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule adaptive notification:", error);
    return null;
  }
}

/**
 * Get reminder statistics
 */
export async function getReminderStats(): Promise<{
  totalReminders: number;
  activeReminders: number;
  adaptiveReminders: number;
  triggeredToday: number;
}> {
  const reminders = await getAdaptiveReminders();
  const today = new Date().toISOString().split("T")[0];

  return {
    totalReminders: reminders.length,
    activeReminders: reminders.filter((r) => r.isActive).length,
    adaptiveReminders: reminders.filter((r) => r.adaptToEnergy).length,
    triggeredToday: reminders.filter(
      (r) => r.lastTriggered && r.lastTriggered.startsWith(today)
    ).length,
  };
}

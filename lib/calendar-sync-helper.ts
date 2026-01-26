/**
 * Calendar Sync Helper
 * 
 * Unified helper functions for syncing app activities to Google Calendar
 */

import { createGoogleCalendarEvent, isGoogleCalendarConnected } from "./google-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError, ERROR_CODES } from "./error-reporting";

const CALENDAR_SYNC_SETTINGS_KEY = "calendar_sync_settings";

export interface CalendarSyncSettings {
  diet: boolean;
  health: boolean;
  fitness: boolean;
  meditation: boolean;
  business: boolean;
  schedule: boolean;
}

/**
 * Get calendar sync settings
 */
export async function getCalendarSyncSettings(): Promise<CalendarSyncSettings> {
  try {
    const settings = await AsyncStorage.getItem(CALENDAR_SYNC_SETTINGS_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    // Default: all disabled
    return {
      diet: false,
      health: false,
      fitness: false,
      meditation: false,
      business: false,
      schedule: false,
    };
  } catch (error) {
    console.error("Failed to get calendar sync settings:", error);
    return {
      diet: false,
      health: false,
      fitness: false,
      meditation: false,
      business: false,
      schedule: false,
    };
  }
}

/**
 * Save calendar sync settings
 */
export async function saveCalendarSyncSettings(settings: CalendarSyncSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(CALENDAR_SYNC_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save calendar sync settings:", error);
  }
}

/**
 * Update a specific feature's sync setting
 */
export async function updateFeatureSyncSetting(
  feature: keyof CalendarSyncSettings,
  enabled: boolean
): Promise<void> {
  const settings = await getCalendarSyncSettings();
  settings[feature] = enabled;
  await saveCalendarSyncSettings(settings);
}

/**
 * Check if a feature has calendar sync enabled
 */
export async function isFeatureSyncEnabled(feature: keyof CalendarSyncSettings): Promise<boolean> {
  const settings = await getCalendarSyncSettings();
  return settings[feature];
}

/**
 * Sync a diet meal to Google Calendar
 */
export async function syncDietToCalendar(
  mealType: string,
  food: string,
  mealTime: string,
  calories: number
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("diet");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Diet calendar sync is disabled",
      };
    }

    const startTime = new Date(mealTime);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30); // 30 min meal duration

    const title = `🍽️ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
    const description = `${food}\n${calories} calories\n\nLogged by Energy Today`;

    const result = await createGoogleCalendarEvent(
      title,
      description,
      startTime.toISOString(),
      endTime.toISOString(),
      70 // Default energy score for meals
    );
    
    // Update last sync time
    if (result.success) {
      try {
        const { updateLastSyncTime } = await import("@/components/sync-status-indicator");
        await updateLastSyncTime("diet");
      } catch (error) {
        console.log("[CalendarSync] Failed to update sync time:", error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to sync diet to calendar:", error);
    await logError(
      ERROR_CODES.CALENDAR_SYNC_FAILED,
      `Diet sync failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Sync a fitness workout to Google Calendar
 */
export async function syncFitnessToCalendar(
  workoutType: string,
  duration: number,
  startTime: string
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("fitness");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Fitness calendar sync is disabled",
      };
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const title = `💪 ${workoutType}`;
    const description = `${duration} minutes\n\nLogged by Energy Today`;

    return await createGoogleCalendarEvent(
      title,
      description,
      start.toISOString(),
      end.toISOString(),
      80 // High energy for workouts
    );
  } catch (error) {
    console.error("Failed to sync fitness to calendar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Sync a meditation session to Google Calendar
 */
export async function syncMeditationToCalendar(
  duration: number,
  startTime: string,
  type?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("meditation");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Meditation calendar sync is disabled",
      };
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const title = type ? `🧘 ${type} Meditation` : "🧘 Meditation";
    const description = `${duration} minutes\n\nLogged by Energy Today`;

    const result = await createGoogleCalendarEvent(
      title,
      description,
      start.toISOString(),
      end.toISOString(),
      75 // Moderate-high energy for meditation
    );
    
    // Update last sync time
    if (result.success) {
      try {
        const { updateLastSyncTime } = await import("@/components/sync-status-indicator");
        await updateLastSyncTime("meditation");
      } catch (error) {
        console.log("[CalendarSync] Failed to update sync time:", error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to sync meditation to calendar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Sync a health activity to Google Calendar
 */
export async function syncHealthToCalendar(
  activityType: string,
  details: string,
  startTime: string,
  duration: number = 15
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("health");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Health calendar sync is disabled",
      };
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const title = `❤️ ${activityType}`;
    const description = `${details}\n\nLogged by Energy Today`;

    const result = await createGoogleCalendarEvent(
      title,
      description,
      start.toISOString(),
      end.toISOString(),
      70 // Default energy for health activities
    );
    
    // Update last sync time
    if (result.success) {
      try {
        const { updateLastSyncTime } = await import("@/components/sync-status-indicator");
        await updateLastSyncTime("health");
      } catch (error) {
        console.log("[CalendarSync] Failed to update sync time:", error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to sync health to calendar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Sync a business activity to Google Calendar
 */
export async function syncBusinessToCalendar(
  activityTitle: string,
  description: string,
  startTime: string,
  duration: number,
  energyScore: number = 70
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("business");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Business calendar sync is disabled",
      };
    }

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const title = `💼 ${activityTitle}`;
    const fullDescription = `${description}\n\nLogged by Energy Today`;

    const result = await createGoogleCalendarEvent(
      title,
      fullDescription,
      start.toISOString(),
      end.toISOString(),
      energyScore
    );
    
    // Update last sync time
    if (result.success) {
      try {
        const { updateLastSyncTime } = await import("@/components/sync-status-indicator");
        await updateLastSyncTime("schedule");
      } catch (error) {
        console.log("[CalendarSync] Failed to update sync time:", error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to sync business to calendar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Sync a scheduled task to Google Calendar
 */
export async function syncTaskToCalendar(
  taskTitle: string,
  description: string,
  scheduledDate: string,
  scheduledTime: string,
  duration: number,
  energyRequirement: string
): Promise<{ success: boolean; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    const syncEnabled = await isFeatureSyncEnabled("schedule");
    if (!syncEnabled) {
      return {
        success: false,
        message: "Schedule calendar sync is disabled",
      };
    }

    // Parse date and time
    const dateObj = new Date(scheduledDate);
    const timeMatch = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!timeMatch) {
      return {
        success: false,
        message: "Invalid time format",
      };
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    dateObj.setHours(hours, minutes, 0, 0);

    const start = dateObj;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);

    const title = `✅ ${taskTitle}`;
    const fullDescription = `${description}\n\nEnergy Requirement: ${energyRequirement}\nDuration: ${duration} minutes\n\nScheduled by Energy Today`;

    // Map energy requirement to score
    const energyScore = energyRequirement === "high" ? 80 : energyRequirement === "moderate" ? 60 : 40;

    const result = await createGoogleCalendarEvent(
      title,
      fullDescription,
      start.toISOString(),
      end.toISOString(),
      energyScore
    );
    
    // Update last sync time
    if (result.success) {
      try {
        const { updateLastSyncTime } = await import("@/components/sync-status-indicator");
        await updateLastSyncTime("schedule");
      } catch (error) {
        console.log("[CalendarSync] Failed to update sync time:", error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to sync task to calendar:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sync",
    };
  }
}

/**
 * Google Calendar OAuth Integration
 * 
 * Sync energy insights with Google Calendar via OAuth
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./storage";
import { calculateUnifiedEnergy } from "./unified-energy-engine";

const GOOGLE_TOKEN_KEY = "google_calendar_oauth_token";
const GOOGLE_CONNECTED_KEY = "google_calendar_connected";

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  colorId?: string;
}

export interface EnergyTimeSlot {
  startTime: string;
  endTime: string;
  energyScore: number;
  energyLevel: "high" | "moderate" | "low";
  recommended: boolean;
}

/**
 * Simulate Google Calendar connection (OAuth would require backend)
 * In production, this would use expo-auth-session with a backend OAuth flow
 */
export async function connectGoogleCalendar(): Promise<boolean> {
  try {
    // Simulate connection
    await AsyncStorage.setItem(GOOGLE_CONNECTED_KEY, "true");
    await AsyncStorage.setItem(GOOGLE_TOKEN_KEY, `mock_token_${Date.now()}`);
    return true;
  } catch (error) {
    console.error("Google Calendar connection error:", error);
    return false;
  }
}

/**
 * Check if Google Calendar is connected
 */
export async function isGoogleCalendarConnected(): Promise<boolean> {
  const connected = await AsyncStorage.getItem(GOOGLE_CONNECTED_KEY);
  return connected === "true";
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar(): Promise<void> {
  await AsyncStorage.removeItem(GOOGLE_CONNECTED_KEY);
  await AsyncStorage.removeItem(GOOGLE_TOKEN_KEY);
}

/**
 * Get optimal meeting times for a specific date based on energy
 */
export async function getOptimalMeetingTimes(
  date: Date,
  durationMinutes: number = 60
): Promise<EnergyTimeSlot[]> {
  try {
    const profile = await getUserProfile();
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Calculate energy for the day
    const energyData = await calculateUnifiedEnergy(profile, date);
    
    // Generate time slots (9 AM to 6 PM, hourly)
    const slots: EnergyTimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      // Calculate energy score for this time slot
      // Use overall intensity as hourly breakdown may not be available
      const energyScore = energyData.combinedAnalysis.intensity;

      let energyLevel: "high" | "moderate" | "low";
      if (energyScore >= 70) {
        energyLevel = "high";
      } else if (energyScore >= 40) {
        energyLevel = "moderate";
      } else {
        energyLevel = "low";
      }

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        energyScore,
        energyLevel,
        recommended: energyScore >= 60, // Recommend slots with 60%+ energy
      });
    }

    // Sort by energy score (highest first)
    return slots.sort((a, b) => b.energyScore - a.energyScore);
  } catch (error) {
    console.error("Failed to get optimal meeting times:", error);
    throw error;
  }
}

/**
 * Create a Google Calendar event with energy insights
 * Note: This is a mock implementation. Production would use Google Calendar API.
 */
export async function createGoogleCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  energyScore: number
): Promise<{ success: boolean; eventId?: string; message: string }> {
  try {
    const connected = await isGoogleCalendarConnected();
    if (!connected) {
      return {
        success: false,
        message: "Google Calendar not connected",
      };
    }

    // Mock event creation
    const eventId = `event_${Date.now()}`;
    
    // In production, this would call Google Calendar API:
    // POST https://www.googleapis.com/calendar/v3/calendars/primary/events
    
    return {
      success: true,
      eventId,
      message: `Event "${title}" scheduled with ${Math.round(energyScore)}% energy alignment`,
    };
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

/**
 * Schedule a meeting at the optimal energy time
 */
export async function scheduleOptimalMeeting(
  title: string,
  description: string,
  date: Date,
  durationMinutes: number = 60
): Promise<{ success: boolean; slot?: EnergyTimeSlot; message: string }> {
  try {
    // Get optimal time slots
    const slots = await getOptimalMeetingTimes(date, durationMinutes);
    
    // Find the best recommended slot
    const bestSlot = slots.find(slot => slot.recommended);
    if (!bestSlot) {
      return {
        success: false,
        message: "No optimal time slots found for this date",
      };
    }

    // Create calendar event
    const result = await createGoogleCalendarEvent(
      title,
      `${description}\n\n⚡ Energy Level: ${bestSlot.energyLevel.toUpperCase()} (${Math.round(bestSlot.energyScore)}%)\n\nScheduled at optimal energy time by Energy Today`,
      bestSlot.startTime,
      bestSlot.endTime,
      bestSlot.energyScore
    );

    if (result.success) {
      return {
        success: true,
        slot: bestSlot,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message,
    };
  } catch (error) {
    console.error("Failed to schedule optimal meeting:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to schedule meeting",
    };
  }
}

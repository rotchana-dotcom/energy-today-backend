/**
 * Spiritual Events Calendar Sync
 * 
 * Syncs lunar phases and 7 spiritual system events to Google Calendar
 * so users can see spiritual timing alongside their regular schedule.
 */

import { createGoogleCalendarEvent, isGoogleCalendarConnected } from "./google-calendar";
import { getMoonPhase, getMoonPhaseName, getMoonEmoji } from "./lunar-cycle";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SPIRITUAL_SYNC_KEY = "spiritual_events_last_sync";

/**
 * Sync spiritual events to Google Calendar for the next 30 days
 */
export async function syncSpiritualEventsToCalendar(): Promise<{
  success: boolean;
  eventsSynced: number;
  error?: string;
}> {
  try {
    // Check if Google Calendar is connected
    const isConnected = await isGoogleCalendarConnected();
    if (!isConnected) {
      return {
        success: false,
        eventsSynced: 0,
        error: "Google Calendar not connected"
      };
    }

    // Check if we've synced recently (don't sync more than once per day)
    const lastSync = await AsyncStorage.getItem(SPIRITUAL_SYNC_KEY);
    if (lastSync) {
      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSync < 24) {
        return {
          success: true,
          eventsSynced: 0,
          error: "Already synced today"
        };
      }
    }

    let eventsSynced = 0;

    // Sync lunar phases for next 30 days
    const lunarEvents = await syncLunarPhasesToCalendar();
    eventsSynced += lunarEvents;

    // TODO: Add other spiritual systems
    // - Numerology personal day changes
    // - Astrological transits
    // - I Ching hexagram changes
    // - Thai astrology day fortune
    // - Ayurvedic dosha shifts
    // - Feng Shui element days

    // Update last sync time
    await AsyncStorage.setItem(SPIRITUAL_SYNC_KEY, new Date().toISOString());

    return {
      success: true,
      eventsSynced
    };
  } catch (error) {
    console.error("Failed to sync spiritual events:", error);
    return {
      success: false,
      eventsSynced: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Sync lunar phases to calendar
 */
async function syncLunarPhasesToCalendar(): Promise<number> {
  let eventsSynced = 0;
  const now = new Date();

  // Check next 30 days for major lunar phases
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    const phase = getMoonPhase(date);
    const phaseName = getMoonPhaseName(phase);
    const emoji = getMoonEmoji(phase);

    // Only sync major phases (New Moon, First Quarter, Full Moon, Last Quarter)
    const isMajorPhase = 
      phaseName === "New Moon" ||
      phaseName === "First Quarter" ||
      phaseName === "Full Moon" ||
      phaseName === "Last Quarter";

    if (isMajorPhase) {
      try {
        // Create calendar event for lunar phase
        await createGoogleCalendarEvent({
          title: `${emoji} ${phaseName}`,
          description: `Lunar phase: ${phaseName}. This may affect sleep quality, energy levels, and emotional balance.`,
          startTime: date,
          endTime: date, // All-day event
          allDay: true,
          color: "#9333EA" // Purple color for spiritual events
        });
        eventsSynced++;
      } catch (error) {
        console.error(`Failed to sync ${phaseName}:`, error);
      }
    }
  }

  return eventsSynced;
}

/**
 * Get current lunar phase info for AI context
 */
export function getCurrentLunarContext(): {
  phase: number;
  phaseName: string;
  emoji: string;
  effects: string[];
} {
  const now = new Date();
  const phase = getMoonPhase(now);
  const phaseName = getMoonPhaseName(phase);
  const emoji = getMoonEmoji(phase);

  // Define effects based on lunar phase
  let effects: string[] = [];
  
  if (phaseName === "Full Moon") {
    effects = [
      "May cause lighter, more restless sleep",
      "Heightened emotions and energy",
      "Good time for completion and release",
      "Increased intuition and creativity"
    ];
  } else if (phaseName === "New Moon") {
    effects = [
      "Deeper, more restorative sleep",
      "Lower energy, good for rest",
      "Ideal for new beginnings and intentions",
      "Introspection and planning"
    ];
  } else if (phaseName === "First Quarter" || phaseName === "Last Quarter") {
    effects = [
      "Moderate energy levels",
      "Good time for action and decisions",
      "Balance between activity and rest"
    ];
  } else {
    effects = [
      "Gradual energy shifts",
      "Normal sleep patterns"
    ];
  }

  return {
    phase,
    phaseName,
    emoji,
    effects
  };
}

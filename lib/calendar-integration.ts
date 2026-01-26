import * as Calendar from "expo-calendar";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  calendarId: string;
}

export interface EnergyAnalyzedEvent extends CalendarEvent {
  energyAlignment: "strong" | "moderate" | "challenging";
  energyScore: number;
  recommendation: string;
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

/**
 * Get all available calendars
 */
export async function getCalendars(): Promise<Calendar.Calendar[]> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status !== "granted") {
    return [];
  }
  
  return await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
}

/**
 * Get events from a specific calendar within a date range
 */
export async function getCalendarEvents(
  calendarIds: string[],
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status !== "granted") {
    return [];
  }
  
  const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
  
  return events.map(event => ({
    id: event.id,
    title: event.title,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    location: event.location || undefined,
    notes: event.notes || undefined,
    calendarId: event.calendarId,
  }));
}

/**
 * Analyze events against user's energy patterns
 */
export async function analyzeEventsWithEnergy(
  profile: UserProfile,
  events: CalendarEvent[]
): Promise<EnergyAnalyzedEvent[]> {
  return events.map(event => {
    const energy = calculateDailyEnergy(profile, event.startDate);
    const alignment = energy.connection.alignment;
    const energyScore = energy.userEnergy.intensity;
    
    let recommendation = "";
    if (alignment === "strong") {
      recommendation = "Excellent timing! Your energy aligns well for this meeting.";
    } else if (alignment === "moderate") {
      recommendation = "Decent timing. Consider preparing extra to stay focused.";
    } else {
      recommendation = "Challenging alignment. If possible, reschedule to a stronger day.";
    }
    
    return {
      ...event,
      energyAlignment: alignment,
      energyScore,
      recommendation,
    };
  });
}

/**
 * Find optimal meeting times within a date range
 */
export async function findOptimalMeetingTimes(
  profile: UserProfile,
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 60
): Promise<{ date: Date; score: number; alignment: string }[]> {
  const optimalTimes: { date: Date; score: number; alignment: string }[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const energy = calculateDailyEnergy(profile, currentDate);
    
    if (energy.connection.alignment === "strong") {
      // Morning slot (10 AM)
      const morningSlot = new Date(currentDate);
      morningSlot.setHours(10, 0, 0, 0);
      optimalTimes.push({
        date: morningSlot,
        score: energy.userEnergy.intensity,
        alignment: energy.connection.alignment,
      });
      
      // Afternoon slot (2 PM)
      const afternoonSlot = new Date(currentDate);
      afternoonSlot.setHours(14, 0, 0, 0);
      optimalTimes.push({
        date: afternoonSlot,
        score: energy.userEnergy.intensity,
        alignment: energy.connection.alignment,
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Sort by score (highest first)
  return optimalTimes.sort((a, b) => b.score - a.score);
}

/**
 * Save selected calendar IDs for sync
 */
export async function saveSelectedCalendars(calendarIds: string[]): Promise<void> {
  await AsyncStorage.setItem("@energy_today_calendars", JSON.stringify(calendarIds));
}

/**
 * Get selected calendar IDs
 */
export async function getSelectedCalendars(): Promise<string[]> {
  const stored = await AsyncStorage.getItem("@energy_today_calendars");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Suggest rescheduling for poorly aligned meetings
 */
export async function suggestRescheduling(
  profile: UserProfile,
  event: EnergyAnalyzedEvent
): Promise<{ date: Date; score: number }[]> {
  // Look for better times in the next 14 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14);
  
  const optimalTimes = await findOptimalMeetingTimes(
    profile,
    startDate,
    endDate,
    Math.floor((event.endDate.getTime() - event.startDate.getTime()) / 60000)
  );
  
  // Return top 5 suggestions
  return optimalTimes.slice(0, 5);
}

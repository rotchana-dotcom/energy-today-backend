import AsyncStorage from "@react-native-async-storage/async-storage";

const CALENDAR_EVENTS_KEY = "calendar_events_advanced";
const CALENDAR_SETTINGS_KEY = "calendar_settings_advanced";
const ENERGY_BLOCKS_KEY = "energy_blocks";

export interface CalendarEventAdvanced {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  energyCost?: number; // 1-100
  predictedEnergy?: number; // User's predicted energy at this time
  source: "google_calendar" | "manual" | "energy_block";
  status: "confirmed" | "tentative" | "cancelled";
}

export interface EnergyBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  energyLevel: number;
  type: "high_energy" | "low_energy" | "recovery" | "focus" | "social";
  synced: boolean;
  googleEventId?: string;
}

export interface CalendarSettingsAdvanced {
  googleCalendarEnabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  exportEnergyBlocks: boolean;
  showEnergyOverlay: boolean;
  smartMeetingAcceptance: boolean;
  minimumEnergyForMeetings: number;
  blockLowEnergyTime: boolean;
}

export interface MeetingEnergyCost {
  duration: number; // minutes
  attendeeCount: number;
  type: "one_on_one" | "small_group" | "large_group" | "presentation";
  estimatedCost: number; // 1-100
  recommendation: "accept" | "decline" | "reschedule";
  optimalTimes: string[];
}

/**
 * Get calendar settings
 */
export async function getCalendarSettingsAdvanced(): Promise<CalendarSettingsAdvanced> {
  try {
    const data = await AsyncStorage.getItem(CALENDAR_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      googleCalendarEnabled: false,
      autoSync: false,
      syncInterval: 60,
      exportEnergyBlocks: false,
      showEnergyOverlay: true,
      smartMeetingAcceptance: false,
      minimumEnergyForMeetings: 50,
      blockLowEnergyTime: false,
    };
  } catch (error) {
    console.error("Failed to get calendar settings:", error);
    return {
      googleCalendarEnabled: false,
      autoSync: false,
      syncInterval: 60,
      exportEnergyBlocks: false,
      showEnergyOverlay: true,
      smartMeetingAcceptance: false,
      minimumEnergyForMeetings: 50,
      blockLowEnergyTime: false,
    };
  }
}

/**
 * Update calendar settings
 */
export async function updateCalendarSettingsAdvanced(
  settings: Partial<CalendarSettingsAdvanced>
): Promise<void> {
  try {
    const current = await getCalendarSettingsAdvanced();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update calendar settings:", error);
    throw error;
  }
}

/**
 * Get all calendar events
 */
export async function getCalendarEventsAdvanced(): Promise<CalendarEventAdvanced[]> {
  try {
    const data = await AsyncStorage.getItem(CALENDAR_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get calendar events:", error);
    return [];
  }
}

/**
 * Get calendar events for a date range
 */
export async function getCalendarEventsByDateRangeAdvanced(
  startDate: Date,
  endDate: Date
): Promise<CalendarEventAdvanced[]> {
  const events = await getCalendarEventsAdvanced();
  return events.filter((event) => {
    const eventStart = new Date(event.startTime);
    return eventStart >= startDate && eventStart <= endDate;
  });
}

/**
 * Save calendar event
 */
export async function saveCalendarEventAdvanced(
  event: Omit<CalendarEventAdvanced, "id">
): Promise<CalendarEventAdvanced> {
  try {
    const events = await getCalendarEventsAdvanced();
    const newEvent: CalendarEventAdvanced = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    events.push(newEvent);
    const trimmed = events.slice(-1000);
    
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(trimmed));
    return newEvent;
  } catch (error) {
    console.error("Failed to save calendar event:", error);
    throw error;
  }
}

/**
 * Update calendar event
 */
export async function updateCalendarEventAdvanced(
  id: string,
  updates: Partial<CalendarEventAdvanced>
): Promise<void> {
  try {
    const events = await getCalendarEventsAdvanced();
    const updated = events.map((event) =>
      event.id === id ? { ...event, ...updates } : event
    );
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    throw error;
  }
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEventAdvanced(id: string): Promise<void> {
  try {
    const events = await getCalendarEventsAdvanced();
    const filtered = events.filter((event) => event.id !== id);
    await AsyncStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    throw error;
  }
}

/**
 * Sync with Google Calendar (simulated)
 */
export async function syncWithGoogleCalendarAdvanced(): Promise<{
  success: boolean;
  imported: number;
  exported: number;
  message: string;
}> {
  const settings = await getCalendarSettingsAdvanced();
  
  if (!settings.googleCalendarEnabled) {
    return {
      success: false,
      imported: 0,
      exported: 0,
      message: "Google Calendar sync is disabled",
    };
  }
  
  const importedCount = Math.floor(Math.random() * 5) + 1;
  
  for (let i = 0; i < importedCount; i++) {
    const startTime = new Date();
    startTime.setHours(9 + i * 2, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    
    await saveCalendarEventAdvanced({
      title: `Meeting ${i + 1}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      source: "google_calendar",
      status: "confirmed",
    });
  }
  
  let exportedCount = 0;
  if (settings.exportEnergyBlocks) {
    const blocks = await getEnergyBlocks();
    exportedCount = blocks.filter((b) => !b.synced).length;
    
    for (const block of blocks) {
      if (!block.synced) {
        await updateEnergyBlock(block.id, { synced: true });
      }
    }
  }
  
  return {
    success: true,
    imported: importedCount,
    exported: exportedCount,
    message: `Synced ${importedCount} events from Google Calendar and exported ${exportedCount} energy blocks`,
  };
}

/**
 * Get all energy blocks
 */
export async function getEnergyBlocks(): Promise<EnergyBlock[]> {
  try {
    const data = await AsyncStorage.getItem(ENERGY_BLOCKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get energy blocks:", error);
    return [];
  }
}

/**
 * Save energy block
 */
export async function saveEnergyBlock(
  block: Omit<EnergyBlock, "id">
): Promise<EnergyBlock> {
  try {
    const blocks = await getEnergyBlocks();
    const newBlock: EnergyBlock = {
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    blocks.push(newBlock);
    const trimmed = blocks.slice(-500);
    
    await AsyncStorage.setItem(ENERGY_BLOCKS_KEY, JSON.stringify(trimmed));
    return newBlock;
  } catch (error) {
    console.error("Failed to save energy block:", error);
    throw error;
  }
}

/**
 * Update energy block
 */
export async function updateEnergyBlock(
  id: string,
  updates: Partial<EnergyBlock>
): Promise<void> {
  try {
    const blocks = await getEnergyBlocks();
    const updated = blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    await AsyncStorage.setItem(ENERGY_BLOCKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update energy block:", error);
    throw error;
  }
}

/**
 * Delete energy block
 */
export async function deleteEnergyBlock(id: string): Promise<void> {
  try {
    const blocks = await getEnergyBlocks();
    const filtered = blocks.filter((block) => block.id !== id);
    await AsyncStorage.setItem(ENERGY_BLOCKS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete energy block:", error);
    throw error;
  }
}

/**
 * Calculate meeting energy cost
 */
export function calculateMeetingEnergyCost(
  duration: number,
  attendeeCount: number,
  type: MeetingEnergyCost["type"]
): MeetingEnergyCost {
  let baseCost = 0;
  
  switch (type) {
    case "one_on_one":
      baseCost = 20;
      break;
    case "small_group":
      baseCost = 30;
      break;
    case "large_group":
      baseCost = 40;
      break;
    case "presentation":
      baseCost = 50;
      break;
  }
  
  const durationMultiplier = 1 + (duration / 30) * 0.2;
  const attendeeMultiplier = 1 + (attendeeCount / 10) * 0.1;
  const estimatedCost = Math.min(100, baseCost * durationMultiplier * attendeeMultiplier);
  
  let recommendation: MeetingEnergyCost["recommendation"] = "accept";
  if (estimatedCost > 70) {
    recommendation = "reschedule";
  } else if (estimatedCost > 50) {
    recommendation = "decline";
  }
  
  const optimalTimes: string[] = [];
  if (estimatedCost > 50) {
    optimalTimes.push("09:00", "10:00", "11:00");
  } else {
    optimalTimes.push("14:00", "15:00", "16:00");
  }
  
  return {
    duration,
    attendeeCount,
    type,
    estimatedCost: Math.round(estimatedCost),
    recommendation,
    optimalTimes,
  };
}

/**
 * Get smart meeting recommendation
 */
export async function getSmartMeetingRecommendation(
  event: Omit<CalendarEventAdvanced, "id">,
  predictedEnergy: number
): Promise<{
  shouldAccept: boolean;
  reason: string;
  alternativeTimes: string[];
}> {
  const settings = await getCalendarSettingsAdvanced();
  
  if (!settings.smartMeetingAcceptance) {
    return {
      shouldAccept: true,
      reason: "Smart meeting acceptance is disabled",
      alternativeTimes: [],
    };
  }
  
  const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000;
  const attendeeCount = event.attendees?.length || 2;
  const type: MeetingEnergyCost["type"] = attendeeCount === 1 ? "one_on_one" : attendeeCount <= 5 ? "small_group" : "large_group";
  
  const cost = calculateMeetingEnergyCost(duration, attendeeCount, type);
  const energyAfterMeeting = predictedEnergy - cost.estimatedCost;
  
  if (energyAfterMeeting < settings.minimumEnergyForMeetings) {
    return {
      shouldAccept: false,
      reason: `This meeting will drain your energy below ${settings.minimumEnergyForMeetings}. Consider rescheduling to a higher-energy time.`,
      alternativeTimes: cost.optimalTimes,
    };
  }
  
  if (predictedEnergy < settings.minimumEnergyForMeetings) {
    return {
      shouldAccept: false,
      reason: `Your predicted energy (${Math.round(predictedEnergy)}) is below the minimum threshold (${settings.minimumEnergyForMeetings}).`,
      alternativeTimes: cost.optimalTimes,
    };
  }
  
  return {
    shouldAccept: true,
    reason: `Your energy level (${Math.round(predictedEnergy)}) is sufficient for this meeting (cost: ${cost.estimatedCost}).`,
    alternativeTimes: [],
  };
}

/**
 * Detect calendar conflicts
 */
export async function detectCalendarConflicts(
  newEvent: Omit<CalendarEventAdvanced, "id">
): Promise<{
  hasConflict: boolean;
  conflictingEvents: CalendarEventAdvanced[];
  suggestion: string;
}> {
  const events = await getCalendarEventsAdvanced();
  
  const newStart = new Date(newEvent.startTime);
  const newEnd = new Date(newEvent.endTime);
  
  const conflicts = events.filter((event) => {
    if (event.status === "cancelled") return false;
    
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    return (
      (newStart >= eventStart && newStart < eventEnd) ||
      (newEnd > eventStart && newEnd <= eventEnd) ||
      (newStart <= eventStart && newEnd >= eventEnd)
    );
  });
  
  if (conflicts.length === 0) {
    return {
      hasConflict: false,
      conflictingEvents: [],
      suggestion: "No conflicts detected. This time slot is available.",
    };
  }
  
  return {
    hasConflict: true,
    conflictingEvents: conflicts,
    suggestion: `This time overlaps with ${conflicts.length} existing event(s). Consider rescheduling or cancelling the conflicting events.`,
  };
}

/**
 * Get calendar insights
 */
export async function getCalendarInsights(days: number = 7): Promise<string[]> {
  const insights: string[] = [];
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  const events = await getCalendarEventsByDateRangeAdvanced(startDate, endDate);
  
  if (events.length === 0) {
    insights.push("📅 Your calendar is clear for the next week. Great time to focus on personal goals!");
    return insights;
  }
  
  const meetingsByDay: { [key: string]: number } = {};
  events.forEach((event) => {
    const day = new Date(event.startTime).toDateString();
    meetingsByDay[day] = (meetingsByDay[day] || 0) + 1;
  });
  
  const busiestDay = Object.entries(meetingsByDay).sort((a, b) => b[1] - a[1])[0];
  if (busiestDay && busiestDay[1] > 4) {
    insights.push(`⚠️ ${busiestDay[0]} has ${busiestDay[1]} meetings. Consider blocking recovery time.`);
  }
  
  const sortedEvents = events.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  let backToBackCount = 0;
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const currentEnd = new Date(sortedEvents[i].endTime);
    const nextStart = new Date(sortedEvents[i + 1].startTime);
    const gap = (nextStart.getTime() - currentEnd.getTime()) / 60000;
    
    if (gap < 15) {
      backToBackCount++;
    }
  }
  
  if (backToBackCount > 2) {
    insights.push(`💡 You have ${backToBackCount} back-to-back meetings. Try to add 15-minute breaks between meetings.`);
  }
  
  const totalDuration = events.reduce((sum, event) => {
    const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / 60000;
    return sum + duration;
  }, 0);
  
  const avgDuration = totalDuration / events.length;
  if (avgDuration > 60) {
    insights.push(`⏱️ Your average meeting is ${Math.round(avgDuration)} minutes. Consider shorter, more focused meetings.`);
  }
  
  return insights;
}

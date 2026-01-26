/**
 * Life Events Storage
 * 
 * Store and manage life events for timeline correlation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@energy_today:life_events";

export interface LifeEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  category: "work" | "personal" | "health" | "social" | "travel" | "other";
  impact?: "positive" | "negative" | "neutral";
  color?: string;
}

/**
 * Get all life events
 */
export async function getAllLifeEvents(): Promise<LifeEvent[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get life events:", error);
  }
  return [];
}

/**
 * Add a new life event
 */
export async function addLifeEvent(event: Omit<LifeEvent, "id">): Promise<LifeEvent> {
  try {
    const events = await getAllLifeEvents();
    const newEvent: LifeEvent = {
      ...event,
      id: Date.now().toString(),
    };
    events.push(newEvent);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return newEvent;
  } catch (error) {
    console.error("Failed to add life event:", error);
    throw error;
  }
}

/**
 * Update a life event
 */
export async function updateLifeEvent(
  id: string,
  updates: Partial<Omit<LifeEvent, "id">>
): Promise<void> {
  try {
    const events = await getAllLifeEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  } catch (error) {
    console.error("Failed to update life event:", error);
    throw error;
  }
}

/**
 * Delete a life event
 */
export async function deleteLifeEvent(id: string): Promise<void> {
  try {
    const events = await getAllLifeEvents();
    const filtered = events.filter((e) => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete life event:", error);
    throw error;
  }
}

/**
 * Get events in date range
 */
export async function getEventsInRange(startDate: string, endDate: string): Promise<LifeEvent[]> {
  const events = await getAllLifeEvents();
  return events.filter((e) => e.date >= startDate && e.date <= endDate);
}

/**
 * Get events by category
 */
export async function getEventsByCategory(
  category: LifeEvent["category"]
): Promise<LifeEvent[]> {
  const events = await getAllLifeEvents();
  return events.filter((e) => e.category === category);
}

/**
 * Get category color
 */
export function getCategoryColor(category: LifeEvent["category"]): string {
  const colors = {
    work: "#3B82F6",
    personal: "#8B5CF6",
    health: "#10B981",
    social: "#F59E0B",
    travel: "#06B6D4",
    other: "#6B7280",
  };
  return colors[category];
}

/**
 * Get impact color
 */
export function getImpactColor(impact?: LifeEvent["impact"]): string {
  const colors = {
    positive: "#22C55E",
    negative: "#EF4444",
    neutral: "#6B7280",
  };
  return colors[impact || "neutral"];
}

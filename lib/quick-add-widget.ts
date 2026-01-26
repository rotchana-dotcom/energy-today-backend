/**
 * Quick Add Widget Configuration
 * 
 * This file provides the data layer for a home screen widget that allows
 * one-tap mood/note logging without opening the app.
 * 
 * Note: Actual widget implementation requires native code (iOS/Android).
 * This file provides the data structure and sync mechanism.
 * 
 * For iOS: Use WidgetKit with App Groups for data sharing
 * For Android: Use App Widgets with SharedPreferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveJournalEntry } from "./storage";

export interface QuickAddEntry {
  id: string;
  mood: "great" | "good" | "okay" | "poor";
  timestamp: string;
  synced: boolean;
}

const WIDGET_STORAGE_KEY = "@energy_today_widget_entries";

/**
 * Get pending widget entries (not yet synced to journal)
 */
export async function getPendingWidgetEntries(): Promise<QuickAddEntry[]> {
  const stored = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
  const entries: QuickAddEntry[] = stored ? JSON.parse(stored) : [];
  return entries.filter(e => !e.synced);
}

/**
 * Add a quick entry from widget
 */
export async function addQuickEntry(mood: "great" | "good" | "okay" | "poor"): Promise<void> {
  const entry: QuickAddEntry = {
    id: Date.now().toString(),
    mood,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  
  const stored = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
  const entries: QuickAddEntry[] = stored ? JSON.parse(stored) : [];
  entries.push(entry);
  
  await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Sync widget entries to journal
 */
export async function syncWidgetEntries(): Promise<number> {
  const pending = await getPendingWidgetEntries();
  
  for (const entry of pending) {
    // Convert mood to journal entry
    const moodText = {
      great: "Feeling great today! 🌟",
      good: "Good day overall 😊",
      okay: "Okay day, nothing special 😐",
      poor: "Challenging day 😔",
    }[entry.mood];
    
    const journalMood = entry.mood === "great" || entry.mood === "good" ? "happy" : entry.mood === "okay" ? "neutral" : "sad";
    
    await saveJournalEntry({
      id: entry.id,
      date: entry.timestamp,
      notes: moodText,
      mood: journalMood,
      createdAt: entry.timestamp,
    });
    
    // Mark as synced
    entry.synced = true;
  }
  
  // Update storage
  const stored = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
  const allEntries: QuickAddEntry[] = stored ? JSON.parse(stored) : [];
  await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(allEntries));
  
  return pending.length;
}

/**
 * Get widget configuration for native implementation
 */
export function getWidgetConfig() {
  return {
    title: "Quick Mood Log",
    description: "Tap to log your mood instantly",
    buttons: [
      { mood: "great", emoji: "🌟", label: "Great" },
      { mood: "good", emoji: "😊", label: "Good" },
      { mood: "okay", emoji: "😐", label: "Okay" },
      { mood: "poor", emoji: "😔", label: "Poor" },
    ],
  };
}

/**
 * Instructions for implementing native widgets
 */
export const WIDGET_IMPLEMENTATION_GUIDE = `
# Quick Add Widget Implementation Guide

## iOS (WidgetKit)

1. Create a Widget Extension in Xcode
2. Use App Groups to share data between app and widget
3. Widget Timeline Provider reads from shared UserDefaults
4. Widget buttons use deep links to trigger quick add

Example deep link: energytoday://quick-add?mood=great

## Android (App Widgets)

1. Create AppWidgetProvider class
2. Use SharedPreferences for data sharing
3. Widget buttons use PendingIntents
4. Broadcast receiver handles quick add actions

## Data Flow

1. User taps widget button
2. Widget writes to shared storage
3. App reads shared storage on next launch
4. Entries are synced to journal
5. Widget is updated with latest data

## Files to Create

iOS:
- TodayWidget/TodayWidget.swift
- TodayWidget/Info.plist
- App Groups entitlement

Android:
- android/app/src/main/java/.../QuickAddWidget.java
- android/app/src/main/res/xml/quick_add_widget_info.xml
- android/app/src/main/res/layout/quick_add_widget.xml
`;

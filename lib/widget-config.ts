/**
 * Widget Configuration for Energy Today
 * 
 * Home screen widgets display today's energy summary at a glance.
 * This file defines the widget structure and data format.
 * 
 * Note: Actual widget implementation requires native configuration in app.json
 * and widget extensions for iOS/Android. This file provides the data layer.
 */

import { getUserProfile } from "./storage";
import { calculateDailyEnergy } from "./energy-engine";
import { DailyEnergy } from "@/types";

export interface WidgetData {
  date: string;
  userEnergyType: string;
  userEnergyIntensity: number;
  environmentalEnergyType: string;
  environmentalEnergyIntensity: number;
  connectionAlignment: "strong" | "moderate" | "challenging";
  connectionColor: string;
  lunarPhase: string;
  lunarPhaseEmoji: string;
  summary: string;
}

/**
 * Get widget data for today
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  const profile = await getUserProfile();
  if (!profile) return null;

  const today = new Date();
  const energy = calculateDailyEnergy(profile, today);

  return {
    date: today.toISOString(),
    userEnergyType: energy.userEnergy.type,
    userEnergyIntensity: energy.userEnergy.intensity,
    environmentalEnergyType: energy.environmentalEnergy.type,
    environmentalEnergyIntensity: energy.environmentalEnergy.intensity,
    connectionAlignment: energy.connection.alignment,
    connectionColor: energy.connection.color,
    lunarPhase: energy.lunarPhase,
    lunarPhaseEmoji: energy.lunarPhaseEmoji,
    summary: generateWidgetSummary(energy),
  };
}

/**
 * Generate a concise summary for widget display
 */
function generateWidgetSummary(energy: DailyEnergy): string {
  const alignment = energy.connection.alignment;
  
  if (alignment === "strong") {
    return "Great alignment today! Ideal for important activities.";
  } else if (alignment === "moderate") {
    return "Steady energy ahead. Good for routine work.";
  } else {
    return "Navigate carefully today. Focus on self-care.";
  }
}

/**
 * Widget configuration for app.json
 * 
 * To enable widgets, add this to your app.json:
 * 
 * "expo": {
 *   "plugins": [
 *     [
 *       "expo-widget",
 *       {
 *         "ios": {
 *           "widgets": [
 *             {
 *               "name": "EnergyTodayWidget",
 *               "displayName": "Energy Today",
 *               "description": "View your daily energy summary",
 *               "families": ["systemSmall", "systemMedium"],
 *               "targetContentIdentifier": "energy-today-widget"
 *             }
 *           ]
 *         },
 *         "android": {
 *           "widgets": [
 *             {
 *               "name": "EnergyTodayWidget",
 *               "label": "Energy Today",
 *               "description": "View your daily energy summary",
 *               "minWidth": "2x2",
 *               "maxWidth": "4x2",
 *               "minHeight": "2x2",
 *               "maxHeight": "4x2",
 *               "updatePeriodMillis": 1800000
 *             }
 *           ]
 *         }
 *       }
 *     ]
 *   ]
 * }
 */

export const WIDGET_CONFIG = {
  name: "EnergyTodayWidget",
  displayName: "Energy Today",
  description: "View your daily energy summary at a glance",
  updateInterval: 30 * 60 * 1000, // 30 minutes
};

/**
 * Activity Logger
 * 
 * Comprehensive logging system for testing phase
 * Tracks user actions, performance, and feature usage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ACTIVITY_LOG_KEY = "activity_logs";
const MAX_LOG_ENTRIES = 100;

export type LogLevel = "info" | "warning" | "error" | "performance";

export type FeatureName = 
  | "diet"
  | "health"
  | "meditation"
  | "tasks"
  | "calendar_sync"
  | "business"
  | "energy_forecast"
  | "notifications"
  | "system";

export interface ActivityLog {
  id: string;
  timestamp: string;
  feature: FeatureName;
  level: LogLevel;
  action: string;
  details?: string;
  duration?: number; // milliseconds
  success?: boolean;
}

/**
 * Log an activity
 */
export async function logActivity(
  feature: FeatureName,
  action: string,
  level: LogLevel = "info",
  details?: string,
  duration?: number,
  success?: boolean
): Promise<void> {
  try {
    const log: ActivityLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      feature,
      level,
      action,
      details,
      duration,
      success,
    };

    const existingLogs = await getActivityLogs();
    const updatedLogs = [log, ...existingLogs].slice(0, MAX_LOG_ENTRIES);
    
    await AsyncStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedLogs));
    
    // Also log to console in development
    if (__DEV__) {
      const emoji = level === "error" ? "❌" : level === "warning" ? "⚠️" : level === "performance" ? "⏱️" : "ℹ️";
      console.log(`${emoji} [${feature}] ${action}${details ? `: ${details}` : ""}${duration ? ` (${duration}ms)` : ""}`);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Get all activity logs
 */
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const logs = await AsyncStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Failed to get activity logs:", error);
    return [];
  }
}

/**
 * Get logs filtered by feature
 */
export async function getLogsByFeature(feature: FeatureName): Promise<ActivityLog[]> {
  const logs = await getActivityLogs();
  return logs.filter(log => log.feature === feature);
}

/**
 * Get logs filtered by level
 */
export async function getLogsByLevel(level: LogLevel): Promise<ActivityLog[]> {
  const logs = await getActivityLogs();
  return logs.filter(log => log.level === level);
}

/**
 * Get logs within time range
 */
export async function getLogsByTimeRange(startTime: Date, endTime: Date): Promise<ActivityLog[]> {
  const logs = await getActivityLogs();
  return logs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= startTime && logTime <= endTime;
  });
}

/**
 * Clear all activity logs
 */
export async function clearActivityLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVITY_LOG_KEY);
  } catch (error) {
    console.error("Failed to clear activity logs:", error);
  }
}

/**
 * Export logs as text
 */
export async function exportLogsAsText(): Promise<string> {
  const logs = await getActivityLogs();
  
  let text = `Energy Today Activity Logs\n`;
  text += `Exported: ${new Date().toLocaleString()}\n`;
  text += `Platform: ${Platform.OS}\n`;
  text += `Total Entries: ${logs.length}\n`;
  text += `\n${"=".repeat(60)}\n\n`;
  
  logs.forEach(log => {
    text += `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()}\n`;
    text += `Feature: ${log.feature}\n`;
    text += `Action: ${log.action}\n`;
    if (log.details) text += `Details: ${log.details}\n`;
    if (log.duration) text += `Duration: ${log.duration}ms\n`;
    if (log.success !== undefined) text += `Success: ${log.success}\n`;
    text += `\n${"-".repeat(60)}\n\n`;
  });
  
  return text;
}

/**
 * Get feature statistics
 */
export async function getFeatureStats(feature: FeatureName): Promise<{
  totalActions: number;
  successCount: number;
  errorCount: number;
  lastActivity: string | null;
  avgDuration: number | null;
}> {
  const logs = await getLogsByFeature(feature);
  
  const successCount = logs.filter(log => log.success === true).length;
  const errorCount = logs.filter(log => log.level === "error").length;
  const lastActivity = logs.length > 0 ? logs[0].timestamp : null;
  
  const durationsWithValues = logs.filter(log => log.duration !== undefined).map(log => log.duration!);
  const avgDuration = durationsWithValues.length > 0
    ? durationsWithValues.reduce((sum, d) => sum + d, 0) / durationsWithValues.length
    : null;
  
  return {
    totalActions: logs.length,
    successCount,
    errorCount,
    lastActivity,
    avgDuration,
  };
}

/**
 * Performance tracking helper
 */
export class PerformanceTracker {
  private startTime: number;
  private feature: FeatureName;
  private action: string;

  constructor(feature: FeatureName, action: string) {
    this.feature = feature;
    this.action = action;
    this.startTime = Date.now();
  }

  async end(success: boolean = true, details?: string): Promise<void> {
    const duration = Date.now() - this.startTime;
    const level: LogLevel = duration > 1000 ? "performance" : "info";
    
    await logActivity(
      this.feature,
      this.action,
      level,
      details,
      duration,
      success
    );
  }
}

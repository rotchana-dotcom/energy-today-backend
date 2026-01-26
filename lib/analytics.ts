/**
 * Analytics Tracking System
 * 
 * Tracks user behavior and engagement for closed testing insights:
 * - Promo code redemptions
 * - Trial expirations
 * - Feature usage
 * - User engagement metrics
 * 
 * All data stored locally on device for privacy
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { Platform } from "react-native";

const ANALYTICS_KEY = "@energy_today_analytics";
const MAX_EVENTS = 1000; // Keep last 1000 events

/**
 * Event categories
 */
export enum EventCategory {
  PROMO_CODE = "promo_code",
  TRIAL = "trial",
  SUBSCRIPTION = "subscription",
  FEATURE_USAGE = "feature_usage",
  ONBOARDING = "onboarding",
  ENGAGEMENT = "engagement",
  ERROR = "error",
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  deviceInfo?: DeviceInfo;
}

/**
 * Device information
 */
interface DeviceInfo {
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel?: string;
  deviceBrand?: string;
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  totalEvents: number;
  dateRange: {
    start: string;
    end: string;
  };
  promoCodeRedemptions: {
    total: number;
    byCode: Record<string, number>;
  };
  trialMetrics: {
    trialsStarted: number;
    trialsExpired: number;
    averageDaysUsed: number;
  };
  featureUsage: {
    total: number;
    byFeature: Record<string, number>;
  };
  engagement: {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    totalSessions: number;
  };
}

/**
 * Get device information
 */
async function getDeviceInfo(): Promise<DeviceInfo> {
  try {
    const appVersion = Application.nativeApplicationVersion || "unknown";
    const osVersion = Platform.Version?.toString() || "unknown";
    
    return {
      platform: Platform.OS,
      osVersion,
      appVersion,
      deviceModel: Device.modelName || undefined,
      deviceBrand: Device.brand || undefined,
    };
  } catch (error) {
    console.error("Failed to get device info:", error);
    return {
      platform: Platform.OS,
      osVersion: "unknown",
      appVersion: "unknown",
    };
  }
}

/**
 * Get all analytics events
 */
async function getEvents(): Promise<AnalyticsEvent[]> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get analytics events:", error);
    return [];
  }
}

/**
 * Save analytics events
 */
async function saveEvents(events: AnalyticsEvent[]): Promise<void> {
  try {
    // Keep only the last MAX_EVENTS
    const trimmed = events.slice(-MAX_EVENTS);
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save analytics events:", error);
  }
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  category: EventCategory,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const deviceInfo = await getDeviceInfo();
    
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      action,
      label,
      value,
      metadata,
      deviceInfo,
    };
    
    const events = await getEvents();
    events.push(event);
    await saveEvents(events);
    
    // Log in development
    if (__DEV__) {
      console.log("[Analytics]", category, action, label, value);
    }
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Track promo code redemption
 */
export async function trackPromoCodeRedemption(
  code: string,
  success: boolean,
  durationDays?: number
): Promise<void> {
  await trackEvent(
    EventCategory.PROMO_CODE,
    success ? "redemption_success" : "redemption_failed",
    code,
    durationDays,
    { code, success, durationDays }
  );
}

/**
 * Track trial start
 */
export async function trackTrialStart(daysRemaining: number): Promise<void> {
  await trackEvent(
    EventCategory.TRIAL,
    "trial_started",
    undefined,
    daysRemaining,
    { daysRemaining }
  );
}

/**
 * Track trial expiration
 */
export async function trackTrialExpiration(daysUsed: number): Promise<void> {
  await trackEvent(
    EventCategory.TRIAL,
    "trial_expired",
    undefined,
    daysUsed,
    { daysUsed }
  );
}

/**
 * Track subscription purchase
 */
export async function trackSubscriptionPurchase(
  provider: string,
  plan: string,
  amount: number
): Promise<void> {
  await trackEvent(
    EventCategory.SUBSCRIPTION,
    "purchase_success",
    `${provider}_${plan}`,
    amount,
    { provider, plan, amount }
  );
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  featureName: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackEvent(
    EventCategory.FEATURE_USAGE,
    "feature_used",
    featureName,
    1,
    metadata
  );
}

/**
 * Track onboarding completion
 */
export async function trackOnboardingComplete(
  stepsCompleted: number
): Promise<void> {
  await trackEvent(
    EventCategory.ONBOARDING,
    "onboarding_complete",
    undefined,
    stepsCompleted,
    { stepsCompleted }
  );
}

/**
 * Track app session start
 */
export async function trackSessionStart(): Promise<void> {
  await trackEvent(
    EventCategory.ENGAGEMENT,
    "session_start",
    undefined,
    undefined,
    { timestamp: new Date().toISOString() }
  );
}

/**
 * Track app session end
 */
export async function trackSessionEnd(durationSeconds: number): Promise<void> {
  await trackEvent(
    EventCategory.ENGAGEMENT,
    "session_end",
    undefined,
    durationSeconds,
    { durationSeconds }
  );
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const events = await getEvents();
  
  if (events.length === 0) {
    return {
      totalEvents: 0,
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
      promoCodeRedemptions: {
        total: 0,
        byCode: {},
      },
      trialMetrics: {
        trialsStarted: 0,
        trialsExpired: 0,
        averageDaysUsed: 0,
      },
      featureUsage: {
        total: 0,
        byFeature: {},
      },
      engagement: {
        dailyActiveUsers: 0,
        averageSessionDuration: 0,
        totalSessions: 0,
      },
    };
  }
  
  // Date range
  const timestamps = events.map(e => new Date(e.timestamp).getTime());
  const start = new Date(Math.min(...timestamps)).toISOString();
  const end = new Date(Math.max(...timestamps)).toISOString();
  
  // Promo code redemptions
  const promoEvents = events.filter(
    e => e.category === EventCategory.PROMO_CODE && e.action === "redemption_success"
  );
  const promoByCode: Record<string, number> = {};
  promoEvents.forEach(e => {
    if (e.label) {
      promoByCode[e.label] = (promoByCode[e.label] || 0) + 1;
    }
  });
  
  // Trial metrics
  const trialsStarted = events.filter(
    e => e.category === EventCategory.TRIAL && e.action === "trial_started"
  ).length;
  const trialsExpired = events.filter(
    e => e.category === EventCategory.TRIAL && e.action === "trial_expired"
  ).length;
  const trialDaysUsed = events
    .filter(e => e.category === EventCategory.TRIAL && e.action === "trial_expired")
    .map(e => e.value || 0);
  const averageDaysUsed = trialDaysUsed.length > 0
    ? trialDaysUsed.reduce((a, b) => a + b, 0) / trialDaysUsed.length
    : 0;
  
  // Feature usage
  const featureEvents = events.filter(
    e => e.category === EventCategory.FEATURE_USAGE
  );
  const featureByName: Record<string, number> = {};
  featureEvents.forEach(e => {
    if (e.label) {
      featureByName[e.label] = (featureByName[e.label] || 0) + 1;
    }
  });
  
  // Engagement
  const sessionStarts = events.filter(
    e => e.category === EventCategory.ENGAGEMENT && e.action === "session_start"
  );
  const sessionEnds = events.filter(
    e => e.category === EventCategory.ENGAGEMENT && e.action === "session_end"
  );
  const sessionDurations = sessionEnds.map(e => e.value || 0);
  const averageSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
    : 0;
  
  // Daily active users (unique days with sessions)
  const sessionDates = new Set(
    sessionStarts.map(e => new Date(e.timestamp).toDateString())
  );
  
  return {
    totalEvents: events.length,
    dateRange: { start, end },
    promoCodeRedemptions: {
      total: promoEvents.length,
      byCode: promoByCode,
    },
    trialMetrics: {
      trialsStarted,
      trialsExpired,
      averageDaysUsed: Math.round(averageDaysUsed * 10) / 10,
    },
    featureUsage: {
      total: featureEvents.length,
      byFeature: featureByName,
    },
    engagement: {
      dailyActiveUsers: sessionDates.size,
      averageSessionDuration: Math.round(averageSessionDuration),
      totalSessions: sessionStarts.length,
    },
  };
}

/**
 * Export analytics data as CSV
 */
export async function exportAnalyticsCSV(): Promise<string> {
  const events = await getEvents();
  
  // CSV header
  let csv = "Timestamp,Category,Action,Label,Value,Platform,OS Version,App Version,Device Model\n";
  
  // CSV rows
  events.forEach(event => {
    const row = [
      event.timestamp,
      event.category,
      event.action,
      event.label || "",
      event.value?.toString() || "",
      event.deviceInfo?.platform || "",
      event.deviceInfo?.osVersion || "",
      event.deviceInfo?.appVersion || "",
      event.deviceInfo?.deviceModel || "",
    ].map(field => `"${field}"`).join(",");
    
    csv += row + "\n";
  });
  
  return csv;
}

/**
 * Export analytics summary as JSON
 */
export async function exportAnalyticsJSON(): Promise<string> {
  const summary = await getAnalyticsSummary();
  const events = await getEvents();
  
  return JSON.stringify({
    summary,
    events,
  }, null, 2);
}

/**
 * Clear all analytics data
 */
export async function clearAnalytics(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_KEY);
  } catch (error) {
    console.error("Failed to clear analytics:", error);
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(
  category: EventCategory
): Promise<AnalyticsEvent[]> {
  const events = await getEvents();
  return events.filter(e => e.category === category);
}

/**
 * Get events by date range
 */
export async function getEventsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEvent[]> {
  const events = await getEvents();
  return events.filter(e => {
    const eventDate = new Date(e.timestamp);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

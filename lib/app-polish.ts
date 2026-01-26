import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const ONBOARDING_KEY = "onboarding_completed";
const ACCESSIBILITY_KEY = "accessibility_settings";
const OFFLINE_DATA_KEY = "offline_data_cache";

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  hapticFeedbackEnabled: boolean;
  voiceAnnouncementsEnabled: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  recoverable: boolean;
}

export interface OfflineData {
  lastSyncDate: string;
  energyReadings: unknown[];
  habits: unknown[];
  sleepSessions: unknown[];
  meals: unknown[];
  workouts: unknown[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  interactive?: boolean;
  action?: () => void;
}

/**
 * Get accessibility settings
 */
export async function getAccessibilitySettings(): Promise<AccessibilitySettings> {
  try {
    const data = await AsyncStorage.getItem(ACCESSIBILITY_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      screenReaderEnabled: false,
      highContrastMode: false,
      reducedMotion: false,
      largeText: false,
      hapticFeedbackEnabled: Platform.OS !== "web",
      voiceAnnouncementsEnabled: false,
    };
  } catch (error) {
    console.error("Failed to get accessibility settings:", error);
    return {
      screenReaderEnabled: false,
      highContrastMode: false,
      reducedMotion: false,
      largeText: false,
      hapticFeedbackEnabled: false,
      voiceAnnouncementsEnabled: false,
    };
  }
}

/**
 * Update accessibility settings
 */
export async function updateAccessibilitySettings(
  settings: Partial<AccessibilitySettings>
): Promise<AccessibilitySettings> {
  try {
    const currentSettings = await getAccessibilitySettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error("Failed to update accessibility settings:", error);
    throw error;
  }
}

/**
 * Check if onboarding is completed
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_KEY);
    return data === "true";
  } catch (error) {
    console.error("Failed to check onboarding status:", error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    throw error;
  }
}

/**
 * Reset onboarding (for testing or user request)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error("Failed to reset onboarding:", error);
    throw error;
  }
}

/**
 * Get onboarding steps
 */
export function getOnboardingSteps(): OnboardingStep[] {
  return [
    {
      id: "welcome",
      title: "Welcome to Energy Today",
      description: "Track, analyze, and optimize your daily energy levels for peak performance.",
      interactive: false,
    },
    {
      id: "energy_tracking",
      title: "Track Your Energy",
      description: "Log your energy levels throughout the day. We'll find patterns and insights.",
      interactive: true,
    },
    {
      id: "predictions",
      title: "Get Predictions",
      description: "Our AI predicts your energy for the next 7 days based on your patterns.",
      interactive: false,
    },
    {
      id: "habits",
      title: "Build Better Habits",
      description: "Create habits that boost your energy. We'll remind you at optimal times.",
      interactive: true,
    },
    {
      id: "insights",
      title: "Receive Insights",
      description: "Get personalized recommendations to improve your energy and wellness.",
      interactive: false,
    },
    {
      id: "ready",
      title: "You're All Set!",
      description: "Start tracking your energy today and unlock your full potential.",
      interactive: false,
    },
  ];
}

/**
 * Cache data for offline use
 */
export async function cacheOfflineData(data: Partial<OfflineData>): Promise<void> {
  try {
    const existing = await getOfflineData();
    const updated = {
      ...existing,
      ...data,
      lastSyncDate: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to cache offline data:", error);
    throw error;
  }
}

/**
 * Get offline data
 */
export async function getOfflineData(): Promise<OfflineData> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      lastSyncDate: new Date().toISOString(),
      energyReadings: [],
      habits: [],
      sleepSessions: [],
      meals: [],
      workouts: [],
    };
  } catch (error) {
    console.error("Failed to get offline data:", error);
    return {
      lastSyncDate: new Date().toISOString(),
      energyReadings: [],
      habits: [],
      sleepSessions: [],
      meals: [],
      workouts: [],
    };
  }
}

/**
 * Clear offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear offline cache:", error);
    throw error;
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: Error | string): string {
  if (typeof error === "string") {
    return error;
  }
  
  // Map common errors to user-friendly messages
  const message = error.message.toLowerCase();
  
  if (message.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }
  if (message.includes("timeout")) {
    return "Request timed out. Please try again.";
  }
  if (message.includes("not found")) {
    return "The requested resource was not found.";
  }
  if (message.includes("permission")) {
    return "Permission denied. Please check your settings.";
  }
  if (message.includes("storage")) {
    return "Storage error. Please free up some space and try again.";
  }
  
  // Default message
  return "Something went wrong. Please try again.";
}

/**
 * Create error state
 */
export function createErrorState(
  error: Error | string,
  recoverable: boolean = true
): ErrorState {
  return {
    hasError: true,
    error: typeof error === "string" ? new Error(error) : error,
    message: formatErrorMessage(error),
    recoverable,
  };
}

/**
 * Create loading state
 */
export function createLoadingState(
  message?: string,
  progress?: number
): LoadingState {
  return {
    isLoading: true,
    message,
    progress,
  };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  if (Platform.OS === "web") {
    return navigator.onLine;
  }
  
  // For mobile, attempt a quick network request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get app performance metrics
 */
export function getPerformanceMetrics(): {
  memoryUsage?: number;
  renderTime?: number;
  navigationTime?: number;
} {
  if (Platform.OS === "web" && typeof performance !== "undefined") {
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    
    return {
      memoryUsage: memory ? memory.usedJSHeapSize / 1048576 : undefined, // MB
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : undefined,
      navigationTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : undefined,
    };
  }
  
  return {};
}

/**
 * Log analytics event (placeholder for analytics integration)
 */
export function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (__DEV__) {
    console.log(`[Analytics] ${eventName}`, params);
  }
  
  // In production, would send to analytics service
  // e.g., Analytics.logEvent(eventName, params);
}

/**
 * Get high contrast colors
 */
export function getHighContrastColors(): {
  background: string;
  foreground: string;
  primary: string;
  border: string;
} {
  return {
    background: "#000000",
    foreground: "#FFFFFF",
    primary: "#FFFF00",
    border: "#FFFFFF",
  };
}

/**
 * Get text size multiplier
 */
export function getTextSizeMultiplier(largeText: boolean): number {
  return largeText ? 1.3 : 1.0;
}

/**
 * Announce to screen reader
 */
export function announceToScreenReader(message: string): void {
  if (Platform.OS === "web") {
    // Create live region for screen reader announcement
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-10000px";
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
  
  // For mobile, would use AccessibilityInfo.announceForAccessibility
  // AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Validate input with debounce
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => Promise<boolean>,
  delay: number = 500
): (value: T) => Promise<boolean> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (value: T) => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(async () => {
        const isValid = await validator(value);
        resolve(isValid);
      }, delay);
    });
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Generate unique ID
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

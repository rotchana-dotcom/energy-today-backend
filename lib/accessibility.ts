/**
 * Accessibility Features
 * Inclusive design for all users
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccessibilityInfo, Platform } from "react-native";

const STORAGE_KEY = "accessibility_settings";

export interface AccessibilitySettings {
  // Screen Reader
  screenReaderEnabled: boolean;
  announceChanges: boolean;
  verboseDescriptions: boolean;
  
  // Visual
  highContrastMode: boolean;
  largeText: boolean;
  boldText: boolean;
  reducedMotion: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  
  // Audio
  audioDescriptions: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  
  // Interaction
  voiceControl: boolean;
  switchControl: boolean;
  touchAccommodations: boolean;
  holdDuration: number; // milliseconds
  
  // Focus
  focusIndicators: boolean;
  keyboardNavigation: boolean;
  skipToContent: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  screenReaderEnabled: false,
  announceChanges: true,
  verboseDescriptions: false,
  highContrastMode: false,
  largeText: false,
  boldText: false,
  reducedMotion: false,
  colorBlindMode: "none",
  audioDescriptions: false,
  hapticFeedback: true,
  soundEffects: true,
  voiceControl: false,
  switchControl: false,
  touchAccommodations: false,
  holdDuration: 500,
  focusIndicators: true,
  keyboardNavigation: true,
  skipToContent: true,
};

/**
 * Get accessibility settings
 */
export async function getAccessibilitySettings(): Promise<AccessibilitySettings> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return DEFAULT_SETTINGS;
  
  return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
}

/**
 * Update accessibility settings
 */
export async function updateAccessibilitySettings(
  updates: Partial<AccessibilitySettings>
): Promise<AccessibilitySettings> {
  const current = await getAccessibilitySettings();
  const updated = { ...current, ...updates };
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Reset to default settings
 */
export async function resetAccessibilitySettings(): Promise<AccessibilitySettings> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

/**
 * Check if screen reader is enabled on device
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    return false;
  }
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
  if (Platform.OS === "web") return;
  
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Check if reduce motion is enabled on device
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    return false;
  }
}

/**
 * Get text size multiplier based on settings
 */
export function getTextSizeMultiplier(largeText: boolean): number {
  return largeText ? 1.3 : 1.0;
}

/**
 * Get font weight based on settings
 */
export function getFontWeight(boldText: boolean): "normal" | "bold" {
  return boldText ? "bold" : "normal";
}

/**
 * Get animation duration based on reduced motion
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedMotion: boolean
): number {
  return reducedMotion ? 0 : normalDuration;
}

/**
 * Get high contrast colors
 */
export function getHighContrastColors(enabled: boolean) {
  if (!enabled) {
    return {
      background: "#FFFFFF",
      foreground: "#000000",
      primary: "#0A7EA4",
      surface: "#F5F5F5",
      border: "#E5E7EB",
    };
  }
  
  return {
    background: "#000000",
    foreground: "#FFFFFF",
    primary: "#00D9FF",
    surface: "#1A1A1A",
    border: "#FFFFFF",
  };
}

/**
 * Get color blind adjusted colors
 */
export function getColorBlindColors(mode: AccessibilitySettings["colorBlindMode"]) {
  const baseColors = {
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  };
  
  if (mode === "none") return baseColors;
  
  // Protanopia (red-blind)
  if (mode === "protanopia") {
    return {
      success: "#4A90E2", // Blue instead of green
      warning: "#F59E0B", // Keep orange
      error: "#8B4513", // Brown instead of red
      info: "#3B82F6", // Keep blue
    };
  }
  
  // Deuteranopia (green-blind)
  if (mode === "deuteranopia") {
    return {
      success: "#4A90E2", // Blue instead of green
      warning: "#F59E0B", // Keep orange
      error: "#EF4444", // Keep red
      info: "#3B82F6", // Keep blue
    };
  }
  
  // Tritanopia (blue-blind)
  if (mode === "tritanopia") {
    return {
      success: "#22C55E", // Keep green
      warning: "#F59E0B", // Keep orange
      error: "#EF4444", // Keep red
      info: "#E91E63", // Pink instead of blue
    };
  }
  
  return baseColors;
}

/**
 * Get accessible label for energy level
 */
export function getEnergyLevelLabel(level: number, verbose: boolean = false): string {
  if (level <= 3) {
    return verbose 
      ? `Low energy level ${level} out of 10. You may be feeling tired or drained.`
      : `Low energy: ${level}`;
  }
  
  if (level <= 6) {
    return verbose
      ? `Moderate energy level ${level} out of 10. You're functional but not at your peak.`
      : `Moderate energy: ${level}`;
  }
  
  if (level <= 8) {
    return verbose
      ? `High energy level ${level} out of 10. You're feeling productive and focused.`
      : `High energy: ${level}`;
  }
  
  return verbose
    ? `Peak energy level ${level} out of 10. You're at your absolute best!`
    : `Peak energy: ${level}`;
}

/**
 * Get accessible label for sleep quality
 */
export function getSleepQualityLabel(quality: number, verbose: boolean = false): string {
  const stars = "⭐".repeat(quality);
  
  if (verbose) {
    const descriptions = [
      "Very poor sleep quality",
      "Poor sleep quality",
      "Fair sleep quality",
      "Good sleep quality",
      "Excellent sleep quality",
    ];
    return `${descriptions[quality - 1]}: ${quality} out of 5 stars`;
  }
  
  return `${quality} stars: ${stars}`;
}

/**
 * Get accessible label for habit completion
 */
export function getHabitCompletionLabel(
  completed: number,
  total: number,
  verbose: boolean = false
): string {
  const percentage = Math.round((completed / total) * 100);
  
  if (verbose) {
    return `You've completed ${completed} out of ${total} habits today. That's ${percentage} percent completion.`;
  }
  
  return `${completed} of ${total} habits (${percentage}%)`;
}

/**
 * Get accessible label for date
 */
export function getAccessibleDateLabel(date: Date, verbose: boolean = false): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  if (isYesterday) return "Yesterday";
  
  if (verbose) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get accessible label for time
 */
export function getAccessibleTimeLabel(date: Date, verbose: boolean = false): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (verbose) {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
  
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get accessible button label
 */
export function getAccessibleButtonLabel(
  label: string,
  action: string,
  disabled: boolean = false
): string {
  if (disabled) {
    return `${label} button, disabled`;
  }
  
  return `${label} button, ${action}`;
}

/**
 * Get accessible input label
 */
export function getAccessibleInputLabel(
  label: string,
  value: string,
  required: boolean = false,
  error?: string
): string {
  let accessibleLabel = label;
  
  if (required) {
    accessibleLabel += ", required";
  }
  
  if (value) {
    accessibleLabel += `, current value: ${value}`;
  }
  
  if (error) {
    accessibleLabel += `, error: ${error}`;
  }
  
  return accessibleLabel;
}

/**
 * Get accessible chart description
 */
export function getAccessibleChartDescription(
  title: string,
  dataPoints: Array<{ label: string; value: number }>,
  trend: "increasing" | "decreasing" | "stable"
): string {
  const trendDescription = 
    trend === "increasing" ? "showing an upward trend" :
    trend === "decreasing" ? "showing a downward trend" :
    "remaining stable";
  
  const min = Math.min(...dataPoints.map(d => d.value));
  const max = Math.max(...dataPoints.map(d => d.value));
  const avg = dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length;
  
  return `${title} chart with ${dataPoints.length} data points, ${trendDescription}. ` +
         `Minimum value: ${min.toFixed(1)}, Maximum value: ${max.toFixed(1)}, ` +
         `Average value: ${avg.toFixed(1)}`;
}

/**
 * Get accessible list description
 */
export function getAccessibleListDescription(
  itemCount: number,
  itemType: string,
  selectedCount: number = 0
): string {
  let description = `List of ${itemCount} ${itemType}`;
  
  if (itemCount === 0) {
    description = `Empty list, no ${itemType}`;
  } else if (itemCount === 1) {
    description = `List with 1 ${itemType}`;
  }
  
  if (selectedCount > 0) {
    description += `, ${selectedCount} selected`;
  }
  
  return description;
}

/**
 * Get accessible navigation hint
 */
export function getAccessibleNavigationHint(
  currentScreen: string,
  totalScreens: number,
  position: number
): string {
  return `${currentScreen}, screen ${position} of ${totalScreens}. ` +
         `Swipe left or right to navigate between screens.`;
}

/**
 * Get accessible loading state
 */
export function getAccessibleLoadingState(
  isLoading: boolean,
  loadingMessage: string = "Loading"
): string {
  return isLoading ? `${loadingMessage}, please wait` : "Content loaded";
}

/**
 * Get accessible error state
 */
export function getAccessibleErrorState(
  error: string | null,
  retryAction?: string
): string {
  if (!error) return "No errors";
  
  let message = `Error: ${error}`;
  
  if (retryAction) {
    message += `. ${retryAction} to try again`;
  }
  
  return message;
}

/**
 * Get accessible progress indicator
 */
export function getAccessibleProgressIndicator(
  current: number,
  total: number,
  label: string = "Progress"
): string {
  const percentage = Math.round((current / total) * 100);
  return `${label}: ${current} of ${total} complete, ${percentage} percent`;
}

/**
 * Get accessible badge label
 */
export function getAccessibleBadgeLabel(
  badgeName: string,
  earned: boolean,
  earnedDate?: Date
): string {
  if (!earned) {
    return `${badgeName} badge, not yet earned`;
  }
  
  if (earnedDate) {
    return `${badgeName} badge, earned on ${getAccessibleDateLabel(earnedDate, true)}`;
  }
  
  return `${badgeName} badge, earned`;
}

/**
 * Get accessible notification
 */
export function getAccessibleNotification(
  title: string,
  message: string,
  priority: "low" | "medium" | "high" = "medium"
): string {
  const priorityLabel = 
    priority === "high" ? "Important notification" :
    priority === "low" ? "Low priority notification" :
    "Notification";
  
  return `${priorityLabel}: ${title}. ${message}`;
}

/**
 * Detect system accessibility features
 */
export async function detectSystemAccessibilityFeatures(): Promise<{
  screenReader: boolean;
  reduceMotion: boolean;
  boldText: boolean;
}> {
  if (Platform.OS === "web") {
    return {
      screenReader: false,
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      boldText: false,
    };
  }
  
  try {
    const [screenReader, reduceMotion, boldText] = await Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isBoldTextEnabled ? AccessibilityInfo.isBoldTextEnabled() : Promise.resolve(false),
    ]);
    
    return { screenReader, reduceMotion, boldText };
  } catch (error) {
    return { screenReader: false, reduceMotion: false, boldText: false };
  }
}

/**
 * Apply system accessibility settings
 */
export async function applySystemAccessibilitySettings(): Promise<AccessibilitySettings> {
  const systemFeatures = await detectSystemAccessibilityFeatures();
  const currentSettings = await getAccessibilitySettings();
  
  const updates: Partial<AccessibilitySettings> = {
    screenReaderEnabled: systemFeatures.screenReader,
    reducedMotion: systemFeatures.reduceMotion,
    boldText: systemFeatures.boldText,
  };
  
  return updateAccessibilitySettings(updates);
}

/**
 * Get accessibility recommendations
 */
export async function getAccessibilityRecommendations(): Promise<string[]> {
  const settings = await getAccessibilitySettings();
  const systemFeatures = await detectSystemAccessibilityFeatures();
  const recommendations: string[] = [];
  
  if (systemFeatures.screenReader && !settings.screenReaderEnabled) {
    recommendations.push("Enable screen reader support for better voice navigation");
  }
  
  if (systemFeatures.reduceMotion && !settings.reducedMotion) {
    recommendations.push("Enable reduced motion to match your system settings");
  }
  
  if (systemFeatures.boldText && !settings.boldText) {
    recommendations.push("Enable bold text to match your system settings");
  }
  
  if (!settings.highContrastMode && !settings.largeText) {
    recommendations.push("Consider enabling high contrast mode or large text for better readability");
  }
  
  if (!settings.hapticFeedback) {
    recommendations.push("Enable haptic feedback for better interaction confirmation");
  }
  
  return recommendations;
}

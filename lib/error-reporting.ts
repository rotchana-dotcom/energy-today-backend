/**
 * Error Reporting System
 * 
 * Provides user-friendly error reporting with numeric codes
 * Hides technical backend details from users
 */

import * as Device from "expo-device";
import * as Application from "expo-application";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Error categories mapped to numeric codes
 * Format: [Category][Specific Error]
 * 
 * 100-199: Subscription/Payment errors
 * 200-299: Energy calculation errors
 * 300-399: Data sync errors
 * 400-499: UI/Display errors
 * 500-599: Notification errors
 * 600-699: Calendar/Task errors
 * 700-799: Export/Import errors
 * 800-899: General app errors
 * 900-999: Network/API errors
 */

export const ERROR_CODES = {
  // Subscription/Payment (100-199)
  SUBSCRIPTION_LOAD_FAILED: 101,
  PAYMENT_FAILED: 102,
  SUBSCRIPTION_STATUS_UNKNOWN: 103,
  PROMO_CODE_INVALID: 104,
  PURCHASE_CANCELLED: 105,
  REVENUECAT_ERROR: 106,
  
  // Energy Calculation (200-299)
  ENERGY_CALCULATION_FAILED: 201,
  INVALID_BIRTH_DATA: 202,
  MISSING_PROFILE: 203,
  SCORE_OUT_OF_RANGE: 204,
  
  // Data Sync (300-399)
  STORAGE_READ_FAILED: 301,
  STORAGE_WRITE_FAILED: 302,
  DATA_CORRUPTION: 303,
  SYNC_FAILED: 304,
  
  // UI/Display (400-499)
  RENDER_ERROR: 401,
  NAVIGATION_ERROR: 402,
  COMPONENT_CRASH: 403,
  GRAPH_RENDER_FAILED: 404,
  
  // Notifications (500-599)
  NOTIFICATION_PERMISSION_DENIED: 501,
  NOTIFICATION_SCHEDULE_FAILED: 502,
  NOTIFICATION_NOT_DELIVERED: 503,
  
  // Calendar/Tasks (600-699)
  CALENDAR_SYNC_FAILED: 601,
  TASK_CREATION_FAILED: 602,
  CALENDAR_PERMISSION_DENIED: 603,
  RECURRING_TASK_FAILED: 604,
  TASK_CATEGORY_INVALID: 605,
  FIND_BEST_TIME_FAILED: 606,
  TASK_NOTIFICATION_FAILED: 607,
  
  // Export/Import (700-799)
  EXPORT_FAILED: 701,
  IMPORT_FAILED: 702,
  FILE_WRITE_ERROR: 703,
  
  // General App (800-899)
  APP_CRASH: 801,
  UNKNOWN_ERROR: 802,
  INITIALIZATION_FAILED: 803,
  
  // Network/API (900-999)
  NETWORK_ERROR: 901,
  API_ERROR: 902,
  TIMEOUT: 903,
  SERVER_ERROR: 904,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

interface ErrorReport {
  errorCode: ErrorCode;
  errorMessage: string;
  timestamp: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  userDescription?: string;
}

interface DeviceInfo {
  platform: string;
  osVersion: string;
  deviceModel: string;
  deviceBrand: string;
  appVersion: string;
}

/**
 * Get device information for error reports
 */
async function getDeviceInfo(): Promise<DeviceInfo> {
  return {
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    deviceModel: Device.modelName || "Unknown",
    deviceBrand: Device.brand || "Unknown",
    appVersion: Application.nativeApplicationVersion || "Unknown",
  };
}

/**
 * Log an error with a numeric code
 * Stores locally for later reporting
 */
export async function logError(
  errorCode: ErrorCode,
  errorMessage: string,
  userDescription?: string
): Promise<void> {
  try {
    const deviceInfo = await getDeviceInfo();
    
    const errorReport: ErrorReport = {
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString(),
      deviceInfo,
      appVersion: deviceInfo.appVersion,
      userDescription,
    };
    
    // Store error locally
    const existingErrors = await AsyncStorage.getItem("@energy_today_error_reports");
    const errors: ErrorReport[] = existingErrors ? JSON.parse(existingErrors) : [];
    errors.push(errorReport);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    await AsyncStorage.setItem("@energy_today_error_reports", JSON.stringify(errors));
    
    // Also log to console for debugging
    console.error(`[Error ${errorCode}] ${errorMessage}`, errorReport);
  } catch (error) {
    console.error("Failed to log error:", error);
  }
}

/**
 * Get all stored error reports
 */
export async function getErrorReports(): Promise<ErrorReport[]> {
  try {
    const stored = await AsyncStorage.getItem("@energy_today_error_reports");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get error reports:", error);
    return [];
  }
}

/**
 * Clear all stored error reports
 */
export async function clearErrorReports(): Promise<void> {
  try {
    await AsyncStorage.removeItem("@energy_today_error_reports");
  } catch (error) {
    console.error("Failed to clear error reports:", error);
  }
}

/**
 * Generate error report email body
 */
export function generateErrorReportEmail(
  errorCode: ErrorCode,
  userDescription: string
): { subject: string; body: string } {
  return {
    subject: `Energy Today - Error Report #${errorCode}`,
    body: `Error Code: ${errorCode}

User Description:
${userDescription}

---
This error code helps us identify and fix the issue quickly. Thank you for reporting!

Please do not modify the error code above.`,
  };
}

/**
 * Generate comprehensive error report for support
 */
export async function generateFullErrorReport(): Promise<string> {
  const deviceInfo = await getDeviceInfo();
  const errors = await getErrorReports();
  
  let report = `Energy Today - Error Report
Generated: ${new Date().toLocaleString()}

DEVICE INFORMATION
Platform: ${deviceInfo.platform}
OS Version: ${deviceInfo.osVersion}
Device: ${deviceInfo.deviceBrand} ${deviceInfo.deviceModel}
App Version: ${deviceInfo.appVersion}

`;

  if (errors.length > 0) {
    report += `RECENT ERRORS (Last ${Math.min(errors.length, 10)})\n`;
    errors.slice(-10).reverse().forEach((error, index) => {
      report += `
${index + 1}. Error #${error.errorCode}
   Time: ${new Date(error.timestamp).toLocaleString()}
   Message: ${error.errorMessage}
   ${error.userDescription ? `User Note: ${error.userDescription}` : ""}
`;
    });
  } else {
    report += "No recent errors recorded.\n";
  }
  
  return report;
}

/**
 * Get user-friendly error description
 */
export function getErrorDescription(errorCode: ErrorCode): string {
  const descriptions: Record<ErrorCode, string> = {
    // Subscription/Payment
    [ERROR_CODES.SUBSCRIPTION_LOAD_FAILED]: "Unable to load subscription status",
    [ERROR_CODES.PAYMENT_FAILED]: "Payment processing failed",
    [ERROR_CODES.SUBSCRIPTION_STATUS_UNKNOWN]: "Subscription status unclear",
    [ERROR_CODES.PROMO_CODE_INVALID]: "Promo code not recognized",
    [ERROR_CODES.PURCHASE_CANCELLED]: "Purchase was cancelled",
    [ERROR_CODES.REVENUECAT_ERROR]: "Billing system error",
    
    // Energy Calculation
    [ERROR_CODES.ENERGY_CALCULATION_FAILED]: "Energy score calculation failed",
    [ERROR_CODES.INVALID_BIRTH_DATA]: "Birth information appears invalid",
    [ERROR_CODES.MISSING_PROFILE]: "Profile information missing",
    [ERROR_CODES.SCORE_OUT_OF_RANGE]: "Energy score calculation error",
    
    // Data Sync
    [ERROR_CODES.STORAGE_READ_FAILED]: "Unable to read saved data",
    [ERROR_CODES.STORAGE_WRITE_FAILED]: "Unable to save data",
    [ERROR_CODES.DATA_CORRUPTION]: "Saved data appears corrupted",
    [ERROR_CODES.SYNC_FAILED]: "Data synchronization failed",
    
    // UI/Display
    [ERROR_CODES.RENDER_ERROR]: "Display rendering error",
    [ERROR_CODES.NAVIGATION_ERROR]: "Navigation error",
    [ERROR_CODES.COMPONENT_CRASH]: "Screen component crashed",
    [ERROR_CODES.GRAPH_RENDER_FAILED]: "Unable to render graph",
    
    // Notifications
    [ERROR_CODES.NOTIFICATION_PERMISSION_DENIED]: "Notification permission not granted",
    [ERROR_CODES.NOTIFICATION_SCHEDULE_FAILED]: "Unable to schedule notification",
    [ERROR_CODES.NOTIFICATION_NOT_DELIVERED]: "Notification not delivered",
    
    // Calendar/Tasks
    [ERROR_CODES.CALENDAR_SYNC_FAILED]: "Calendar sync failed",
    [ERROR_CODES.TASK_CREATION_FAILED]: "Unable to create task",
    [ERROR_CODES.CALENDAR_PERMISSION_DENIED]: "Calendar permission not granted",
    [ERROR_CODES.RECURRING_TASK_FAILED]: "Unable to create recurring task",
    [ERROR_CODES.TASK_CATEGORY_INVALID]: "Task category is invalid",
    [ERROR_CODES.FIND_BEST_TIME_FAILED]: "Unable to find optimal time slots",
    [ERROR_CODES.TASK_NOTIFICATION_FAILED]: "Unable to schedule task reminder",
    
    // Export/Import
    [ERROR_CODES.EXPORT_FAILED]: "Data export failed",
    [ERROR_CODES.IMPORT_FAILED]: "Data import failed",
    [ERROR_CODES.FILE_WRITE_ERROR]: "Unable to write file",
    
    // General App
    [ERROR_CODES.APP_CRASH]: "App crashed unexpectedly",
    [ERROR_CODES.UNKNOWN_ERROR]: "Unknown error occurred",
    [ERROR_CODES.INITIALIZATION_FAILED]: "App initialization failed",
    
    // Network/API
    [ERROR_CODES.NETWORK_ERROR]: "Network connection error",
    [ERROR_CODES.API_ERROR]: "Server communication error",
    [ERROR_CODES.TIMEOUT]: "Request timed out",
    [ERROR_CODES.SERVER_ERROR]: "Server error",
  };
  
  return descriptions[errorCode] || "Unknown error";
}

/**
 * Check if error code is valid
 */
export function isValidErrorCode(code: number): code is ErrorCode {
  return Object.values(ERROR_CODES).includes(code as ErrorCode);
}

/**
 * Error Tracking System Tests
 * 
 * Verifies error codes and logging for all features
 */

import { describe, it, expect } from "vitest";
import { ERROR_CODES, logError, getErrorReports, clearErrorReports, getErrorDescription, isValidErrorCode } from "./lib/error-reporting";

describe("Error Tracking System", () => {
  it("should have all required error codes defined", () => {
    // Subscription/Payment (100-199)
    expect(ERROR_CODES.SUBSCRIPTION_LOAD_FAILED).toBe(101);
    expect(ERROR_CODES.PAYMENT_FAILED).toBe(102);
    
    // Energy Calculation (200-299)
    expect(ERROR_CODES.ENERGY_CALCULATION_FAILED).toBe(201);
    expect(ERROR_CODES.INVALID_BIRTH_DATA).toBe(202);
    
    // Data Sync (300-399)
    expect(ERROR_CODES.STORAGE_READ_FAILED).toBe(301);
    expect(ERROR_CODES.SYNC_FAILED).toBe(304);
    
    // UI/Display (400-499)
    expect(ERROR_CODES.RENDER_ERROR).toBe(401);
    expect(ERROR_CODES.GRAPH_RENDER_FAILED).toBe(404); // New
    
    // Notifications (500-599)
    expect(ERROR_CODES.NOTIFICATION_PERMISSION_DENIED).toBe(501);
    expect(ERROR_CODES.NOTIFICATION_SCHEDULE_FAILED).toBe(502);
    
    // Calendar/Tasks (600-699)
    expect(ERROR_CODES.CALENDAR_SYNC_FAILED).toBe(601);
    expect(ERROR_CODES.TASK_CREATION_FAILED).toBe(602);
    expect(ERROR_CODES.RECURRING_TASK_FAILED).toBe(604); // New
    expect(ERROR_CODES.TASK_CATEGORY_INVALID).toBe(605); // New
    expect(ERROR_CODES.FIND_BEST_TIME_FAILED).toBe(606); // New
    expect(ERROR_CODES.TASK_NOTIFICATION_FAILED).toBe(607); // New
    
    // Export/Import (700-799)
    expect(ERROR_CODES.EXPORT_FAILED).toBe(701);
    
    // General App (800-899)
    expect(ERROR_CODES.APP_CRASH).toBe(801);
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe(802);
    
    // Network/API (900-999)
    expect(ERROR_CODES.NETWORK_ERROR).toBe(901);
    expect(ERROR_CODES.API_ERROR).toBe(902);
  });

  it("should have user-friendly descriptions for all error codes", () => {
    expect(getErrorDescription(ERROR_CODES.CALENDAR_SYNC_FAILED)).toBe("Calendar sync failed");
    expect(getErrorDescription(ERROR_CODES.RECURRING_TASK_FAILED)).toBe("Unable to create recurring task");
    expect(getErrorDescription(ERROR_CODES.FIND_BEST_TIME_FAILED)).toBe("Unable to find optimal time slots");
    expect(getErrorDescription(ERROR_CODES.GRAPH_RENDER_FAILED)).toBe("Unable to render graph");
    expect(getErrorDescription(ERROR_CODES.TASK_NOTIFICATION_FAILED)).toBe("Unable to schedule task reminder");
  });

  it("should validate error codes correctly", () => {
    expect(isValidErrorCode(601)).toBe(true);
    expect(isValidErrorCode(604)).toBe(true);
    expect(isValidErrorCode(606)).toBe(true);
    expect(isValidErrorCode(999)).toBe(false);
    expect(isValidErrorCode(1000)).toBe(false);
  });

  it("should log errors with proper structure", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.TASK_CREATION_FAILED,
      "Test error message"
    );
    
    const reports = await getErrorReports();
    expect(reports.length).toBeGreaterThan(0);
    
    const lastReport = reports[reports.length - 1];
    expect(lastReport.errorCode).toBe(ERROR_CODES.TASK_CREATION_FAILED);
    expect(lastReport.errorMessage).toBe("Test error message");
    expect(lastReport.timestamp).toBeDefined();
    expect(lastReport.deviceInfo).toBeDefined();
    expect(lastReport.appVersion).toBeDefined();
  });

  it("should log calendar sync errors", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.CALENDAR_SYNC_FAILED,
      "Failed to sync diet to calendar"
    );
    
    const reports = await getErrorReports();
    const syncError = reports.find(r => r.errorCode === ERROR_CODES.CALENDAR_SYNC_FAILED);
    
    expect(syncError).toBeDefined();
    expect(syncError?.errorMessage).toContain("sync");
  });

  it("should log task notification errors", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.TASK_NOTIFICATION_FAILED,
      "Failed to schedule notification"
    );
    
    const reports = await getErrorReports();
    const notifError = reports.find(r => r.errorCode === ERROR_CODES.TASK_NOTIFICATION_FAILED);
    
    expect(notifError).toBeDefined();
  });

  it("should log recurring task errors", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.RECURRING_TASK_FAILED,
      "Failed to create next occurrence"
    );
    
    const reports = await getErrorReports();
    const recurError = reports.find(r => r.errorCode === ERROR_CODES.RECURRING_TASK_FAILED);
    
    expect(recurError).toBeDefined();
  });

  it("should log Find Best Time errors", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.FIND_BEST_TIME_FAILED,
      "API returned no optimal slots"
    );
    
    const reports = await getErrorReports();
    const bestTimeError = reports.find(r => r.errorCode === ERROR_CODES.FIND_BEST_TIME_FAILED);
    
    expect(bestTimeError).toBeDefined();
  });

  it("should log graph rendering errors", async () => {
    await clearErrorReports();
    
    await logError(
      ERROR_CODES.GRAPH_RENDER_FAILED,
      "Invalid data format for graph"
    );
    
    const reports = await getErrorReports();
    const graphError = reports.find(r => r.errorCode === ERROR_CODES.GRAPH_RENDER_FAILED);
    
    expect(graphError).toBeDefined();
  });

  it("should clear error reports", async () => {
    await logError(ERROR_CODES.UNKNOWN_ERROR, "Test error");
    await clearErrorReports();
    
    const reports = await getErrorReports();
    expect(reports.length).toBe(0);
  });

  it("should limit error history to 50 entries", async () => {
    await clearErrorReports();
    
    // Log 60 errors
    for (let i = 0; i < 60; i++) {
      await logError(ERROR_CODES.UNKNOWN_ERROR, `Test error ${i}`);
    }
    
    const reports = await getErrorReports();
    expect(reports.length).toBeLessThanOrEqual(50);
  });
});

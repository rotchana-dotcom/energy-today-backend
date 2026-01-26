/**
 * Report History Management
 * 
 * Stores and retrieves generated report metadata
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ReportMetadata {
  id: string;
  type: "weekly" | "monthly";
  generatedAt: string;
  period: string; // e.g., "2026-01-13 to 2026-01-19" or "January 2026"
  reportUrl: string;
  reportContent?: string; // Optional markdown content for preview
}

const STORAGE_KEY = "report_history";

export async function saveReportMetadata(report: ReportMetadata): Promise<void> {
  try {
    const existing = await getReportHistory();
    const updated = [report, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save report metadata:", error);
    throw error;
  }
}

export async function getReportHistory(): Promise<ReportMetadata[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load report history:", error);
    return [];
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  try {
    const existing = await getReportHistory();
    const updated = existing.filter((r) => r.id !== reportId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete report:", error);
    throw error;
  }
}

export async function clearReportHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear report history:", error);
    throw error;
  }
}

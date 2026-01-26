/**
 * CSV Data Export for Pro Users
 * 
 * Export energy history and journal entries as CSV files
 * for custom analysis in Excel or other tools
 */

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { JournalEntry } from "@/types";

export interface EnergyHistoryRecord {
  date: string;
  yourEnergyScore: number;
  todayEnergyScore: number;
  alignment: string;
  synergy: string;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(",")];
  
  for (const item of data) {
    const values = headers.map((header) => {
      const value = item[header] ?? "";
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value).replace(/"/g, '""');
      if (stringValue.includes(",") || stringValue.includes("\n")) {
        return `"${stringValue}"`;
      }
      return stringValue;
    });
    rows.push(values.join(","));
  }
  
  return rows.join("\n");
}

/**
 * Export journal entries to CSV
 */
export async function exportJournalToCSV(entries: JournalEntry[]): Promise<void> {
  try {
    const headers = ["date", "mood", "notes", "menstrualCycle", "createdAt"];
    const csvContent = arrayToCSV(entries, headers);
    
    const fileName = `energy_today_journal_${new Date().toISOString().split("T")[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Journal Data",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      alert(`File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error("Error exporting journal to CSV:", error);
    throw new Error("Failed to export journal data");
  }
}

/**
 * Export energy history to CSV
 */
export async function exportEnergyHistoryToCSV(history: EnergyHistoryRecord[]): Promise<void> {
  try {
    const headers = ["date", "yourEnergyScore", "todayEnergyScore", "alignment", "synergy"];
    const csvContent = arrayToCSV(history, headers);
    
    const fileName = `energy_today_history_${new Date().toISOString().split("T")[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Energy History",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      alert(`File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error("Error exporting energy history to CSV:", error);
    throw new Error("Failed to export energy history");
  }
}

/**
 * Export combined data (energy + journal) to CSV
 */
export async function exportCombinedDataToCSV(
  history: EnergyHistoryRecord[],
  entries: JournalEntry[]
): Promise<void> {
  try {
    // Create a map of journal entries by date
    const journalMap = new Map<string, JournalEntry>();
    for (const entry of entries) {
      journalMap.set(entry.date, entry);
    }
    
    // Combine energy history with journal entries
    const combined = history.map((record) => {
      const journal = journalMap.get(record.date);
      return {
        date: record.date,
        yourEnergyScore: record.yourEnergyScore,
        todayEnergyScore: record.todayEnergyScore,
        alignment: record.alignment,
        synergy: record.synergy,
        mood: journal?.mood || "",
        notes: journal?.notes || "",
        menstrualCycle: journal?.menstrualCycle ? "Yes" : "No",
      };
    });
    
    const headers = [
      "date",
      "yourEnergyScore",
      "todayEnergyScore",
      "alignment",
      "synergy",
      "mood",
      "notes",
      "menstrualCycle",
    ];
    const csvContent = arrayToCSV(combined, headers);
    
    const fileName = `energy_today_combined_${new Date().toISOString().split("T")[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Combined Data",
        UTI: "public.comma-separated-values-text",
      });
    } else {
      alert(`File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error("Error exporting combined data to CSV:", error);
    throw new Error("Failed to export combined data");
  }
}

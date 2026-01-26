/**
 * Data Export Utility
 * 
 * Export all user data to JSON or CSV format
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export interface ExportData {
  exportDate: string;
  profile: any;
  journalEntries: any[];
  habits: any[];
  energyLogs: any[];
  voiceNotes: any[];
  teamMembers: any[];
  badges: any[];
}

/**
 * Gather all user data for export
 */
export async function gatherAllData(): Promise<ExportData> {
  try {
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter and get relevant data
    const allData: Record<string, any> = {};
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          allData[key] = JSON.parse(value);
        } catch {
          allData[key] = value;
        }
      }
    }

    // Organize data by category
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      profile: allData["@energy_today:profile"] || null,
      journalEntries: allData["@energy_today:journal_entries"] || [],
      habits: allData["@energy_today:habits"] || [],
      energyLogs: allData["@energy_today:energy_logs"] || [],
      voiceNotes: allData["@energy_today:voice_notes"] || [],
      teamMembers: allData["@energy_today:team_members"] || [],
      badges: allData["@energy_today:earned_badges"] || {},
    };

    return exportData;
  } catch (error) {
    console.error("Failed to gather data:", error);
    throw error;
  }
}

/**
 * Export data as JSON
 */
export async function exportAsJSON(): Promise<string> {
  try {
    const data = await gatherAllData();
    const json = JSON.stringify(data, null, 2);
    
    const fileName = `energy_today_export_${new Date().toISOString().split("T")[0]}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, json);
    
    return filePath;
  } catch (error) {
    console.error("Failed to export JSON:", error);
    throw error;
  }
}

/**
 * Export data as CSV
 */
export async function exportAsCSV(): Promise<string> {
  try {
    const data = await gatherAllData();
    
    // Create CSV for journal entries
    let csv = "Journal Entries\n";
    csv += "Date,Energy Level,Mood,Notes\n";
    
    if (Array.isArray(data.journalEntries)) {
      data.journalEntries.forEach((entry: any) => {
        const date = entry.date || "";
        const energy = entry.energyLevel || "";
        const mood = entry.mood || "";
        const notes = (entry.notes || "").replace(/"/g, '""').replace(/\n/g, " ");
        csv += `"${date}","${energy}","${mood}","${notes}"\n`;
      });
    }
    
    csv += "\n\nHabits\n";
    csv += "Name,Category,Completed Days\n";
    
    if (Array.isArray(data.habits)) {
      data.habits.forEach((habit: any) => {
        const name = (habit.name || "").replace(/"/g, '""');
        const category = habit.category || "";
        const completed = habit.completedDays?.length || 0;
        csv += `"${name}","${category}","${completed}"\n`;
      });
    }
    
    csv += "\n\nEnergy Logs\n";
    csv += "Date,Time,Energy Level,Activity\n";
    
    if (Array.isArray(data.energyLogs)) {
      data.energyLogs.forEach((log: any) => {
        const date = log.date || "";
        const time = log.time || "";
        const energy = log.energyLevel || "";
        const activity = (log.activity || "").replace(/"/g, '""');
        csv += `"${date}","${time}","${energy}","${activity}"\n`;
      });
    }
    
    const fileName = `energy_today_export_${new Date().toISOString().split("T")[0]}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(filePath, csv);
    
    return filePath;
  } catch (error) {
    console.error("Failed to export CSV:", error);
    throw error;
  }
}

/**
 * Share exported file
 */
export async function shareExportedFile(filePath: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Web: Download file
      const content = await FileSystem.readAsStringAsync(filePath);
      const blob = new Blob([content], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "export.json";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Mobile: Use sharing
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error("Sharing is not available on this device");
      }
    }
  } catch (error) {
    console.error("Failed to share file:", error);
    throw error;
  }
}

/**
 * Get export statistics
 */
export async function getExportStats(): Promise<{
  totalEntries: number;
  totalHabits: number;
  totalLogs: number;
  totalVoiceNotes: number;
  estimatedSize: string;
}> {
  try {
    const data = await gatherAllData();
    
    const totalEntries = Array.isArray(data.journalEntries) ? data.journalEntries.length : 0;
    const totalHabits = Array.isArray(data.habits) ? data.habits.length : 0;
    const totalLogs = Array.isArray(data.energyLogs) ? data.energyLogs.length : 0;
    const totalVoiceNotes = Array.isArray(data.voiceNotes) ? data.voiceNotes.length : 0;
    
    // Estimate size
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const estimatedSize = sizeInBytes > 1024 * 1024 
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeInKB} KB`;
    
    return {
      totalEntries,
      totalHabits,
      totalLogs,
      totalVoiceNotes,
      estimatedSize,
    };
  } catch (error) {
    console.error("Failed to get export stats:", error);
    return {
      totalEntries: 0,
      totalHabits: 0,
      totalLogs: 0,
      totalVoiceNotes: 0,
      estimatedSize: "0 KB",
    };
  }
}

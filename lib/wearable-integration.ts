import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const WEARABLE_SETTINGS_KEY = "wearable_settings";
const WEARABLE_DATA_KEY = "wearable_data";
const DEVICE_STATUS_KEY = "device_status";

export interface WearableDevice {
  id: string;
  name: string;
  type: "apple_watch" | "fitbit" | "garmin" | "other";
  connected: boolean;
  lastSync: string;
  batteryLevel?: number;
}

export interface WearableSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncHeartRate: boolean;
  syncActivity: boolean;
  syncSleep: boolean;
  syncWorkouts: boolean;
  backgroundSyncEnabled: boolean;
  connectedDevices: WearableDevice[];
}

export interface WearableData {
  timestamp: string;
  deviceId: string;
  type: "heart_rate" | "steps" | "distance" | "calories" | "sleep" | "workout";
  value: number;
  unit: string;
  metadata?: any;
}

/**
 * Get wearable settings
 */
export async function getWearableSettings(): Promise<WearableSettings> {
  try {
    const data = await AsyncStorage.getItem(WEARABLE_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      autoSync: false,
      syncInterval: 15,
      syncHeartRate: true,
      syncActivity: true,
      syncSleep: true,
      syncWorkouts: true,
      backgroundSyncEnabled: false,
      connectedDevices: [],
    };
  } catch (error) {
    console.error("Failed to get wearable settings:", error);
    return {
      autoSync: false,
      syncInterval: 15,
      syncHeartRate: true,
      syncActivity: true,
      syncSleep: true,
      syncWorkouts: true,
      backgroundSyncEnabled: false,
      connectedDevices: [],
    };
  }
}

/**
 * Update wearable settings
 */
export async function updateWearableSettings(
  settings: Partial<WearableSettings>
): Promise<void> {
  try {
    const current = await getWearableSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(WEARABLE_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update wearable settings:", error);
    throw error;
  }
}

/**
 * Connect to Apple Watch (iOS only)
 */
export async function connectAppleWatch(): Promise<{
  success: boolean;
  device?: WearableDevice;
  message: string;
}> {
  if (Platform.OS !== "ios") {
    return {
      success: false,
      message: "Apple Watch is only available on iOS",
    };
  }
  
  // In a real implementation, this would use:
  // - HealthKit for data access
  // - WatchConnectivity framework for communication
  
  // Simulate connection
  const device: WearableDevice = {
    id: "apple_watch_1",
    name: "Apple Watch Series 9",
    type: "apple_watch",
    connected: true,
    lastSync: new Date().toISOString(),
    batteryLevel: 85,
  };
  
  const settings = await getWearableSettings();
  const existingIndex = settings.connectedDevices.findIndex(
    (d) => d.type === "apple_watch"
  );
  
  if (existingIndex >= 0) {
    settings.connectedDevices[existingIndex] = device;
  } else {
    settings.connectedDevices.push(device);
  }
  
  await updateWearableSettings(settings);
  
  return {
    success: true,
    device,
    message: "Successfully connected to Apple Watch",
  };
}

/**
 * Connect to Fitbit
 */
export async function connectFitbit(): Promise<{
  success: boolean;
  device?: WearableDevice;
  message: string;
}> {
  // In a real implementation, this would use:
  // - Fitbit Web API with OAuth
  // - expo-auth-session for authentication
  
  // Simulate connection
  const device: WearableDevice = {
    id: "fitbit_1",
    name: "Fitbit Charge 6",
    type: "fitbit",
    connected: true,
    lastSync: new Date().toISOString(),
    batteryLevel: 72,
  };
  
  const settings = await getWearableSettings();
  const existingIndex = settings.connectedDevices.findIndex(
    (d) => d.type === "fitbit"
  );
  
  if (existingIndex >= 0) {
    settings.connectedDevices[existingIndex] = device;
  } else {
    settings.connectedDevices.push(device);
  }
  
  await updateWearableSettings(settings);
  
  return {
    success: true,
    device,
    message: "Successfully connected to Fitbit",
  };
}

/**
 * Connect to Garmin
 */
export async function connectGarmin(): Promise<{
  success: boolean;
  device?: WearableDevice;
  message: string;
}> {
  // In a real implementation, this would use:
  // - Garmin Connect API with OAuth
  // - expo-auth-session for authentication
  
  // Simulate connection
  const device: WearableDevice = {
    id: "garmin_1",
    name: "Garmin Forerunner 965",
    type: "garmin",
    connected: true,
    lastSync: new Date().toISOString(),
    batteryLevel: 90,
  };
  
  const settings = await getWearableSettings();
  const existingIndex = settings.connectedDevices.findIndex(
    (d) => d.type === "garmin"
  );
  
  if (existingIndex >= 0) {
    settings.connectedDevices[existingIndex] = device;
  } else {
    settings.connectedDevices.push(device);
  }
  
  await updateWearableSettings(settings);
  
  return {
    success: true,
    device,
    message: "Successfully connected to Garmin",
  };
}

/**
 * Disconnect device
 */
export async function disconnectDevice(deviceId: string): Promise<void> {
  try {
    const settings = await getWearableSettings();
    settings.connectedDevices = settings.connectedDevices.filter(
      (d) => d.id !== deviceId
    );
    await updateWearableSettings(settings);
  } catch (error) {
    console.error("Failed to disconnect device:", error);
    throw error;
  }
}

/**
 * Sync data from wearable devices
 */
export async function syncWearableData(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  try {
    const settings = await getWearableSettings();
    
    if (settings.connectedDevices.length === 0) {
      return {
        success: false,
        syncedCount: 0,
        message: "No devices connected",
      };
    }
    
    let syncedCount = 0;
    
    // Simulate syncing data from each device
    for (const device of settings.connectedDevices) {
      if (!device.connected) continue;
      
      // Simulate heart rate data
      if (settings.syncHeartRate) {
        await saveWearableData({
          timestamp: new Date().toISOString(),
          deviceId: device.id,
          type: "heart_rate",
          value: 65 + Math.floor(Math.random() * 30),
          unit: "bpm",
        });
        syncedCount++;
      }
      
      // Simulate steps data
      if (settings.syncActivity) {
        await saveWearableData({
          timestamp: new Date().toISOString(),
          deviceId: device.id,
          type: "steps",
          value: Math.floor(Math.random() * 10000) + 5000,
          unit: "steps",
        });
        syncedCount++;
      }
      
      // Simulate distance data
      if (settings.syncActivity) {
        await saveWearableData({
          timestamp: new Date().toISOString(),
          deviceId: device.id,
          type: "distance",
          value: Math.random() * 10 + 2,
          unit: "km",
        });
        syncedCount++;
      }
      
      // Update last sync time
      device.lastSync = new Date().toISOString();
    }
    
    await updateWearableSettings(settings);
    
    return {
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} data points from ${settings.connectedDevices.length} device(s)`,
    };
  } catch (error) {
    console.error("Failed to sync wearable data:", error);
    return {
      success: false,
      syncedCount: 0,
      message: `Sync failed: ${error}`,
    };
  }
}

/**
 * Save wearable data
 */
async function saveWearableData(data: WearableData): Promise<void> {
  try {
    const existing = await getWearableData();
    existing.push(data);
    
    // Keep last 10000 data points
    const trimmed = existing.slice(-10000);
    
    await AsyncStorage.setItem(WEARABLE_DATA_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save wearable data:", error);
    throw error;
  }
}

/**
 * Get wearable data
 */
export async function getWearableData(): Promise<WearableData[]> {
  try {
    const data = await AsyncStorage.getItem(WEARABLE_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get wearable data:", error);
    return [];
  }
}

/**
 * Get wearable data by type
 */
export async function getWearableDataByType(
  type: WearableData["type"]
): Promise<WearableData[]> {
  const allData = await getWearableData();
  return allData.filter((d) => d.type === type);
}

/**
 * Get wearable data by date range
 */
export async function getWearableDataByDateRange(
  startDate: Date,
  endDate: Date
): Promise<WearableData[]> {
  const allData = await getWearableData();
  return allData.filter((d) => {
    const timestamp = new Date(d.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });
}

/**
 * Get device status
 */
export async function getDeviceStatus(deviceId: string): Promise<{
  connected: boolean;
  lastSync: string;
  batteryLevel?: number;
  dataPoints: number;
}> {
  const settings = await getWearableSettings();
  const device = settings.connectedDevices.find((d) => d.id === deviceId);
  
  if (!device) {
    return {
      connected: false,
      lastSync: "Never",
      dataPoints: 0,
    };
  }
  
  const allData = await getWearableData();
  const deviceData = allData.filter((d) => d.deviceId === deviceId);
  
  return {
    connected: device.connected,
    lastSync: device.lastSync,
    batteryLevel: device.batteryLevel,
    dataPoints: deviceData.length,
  };
}

/**
 * Get sync statistics
 */
export async function getSyncStatistics(): Promise<{
  totalDevices: number;
  connectedDevices: number;
  totalDataPoints: number;
  lastSyncTime: string;
  dataByType: { [key: string]: number };
}> {
  const settings = await getWearableSettings();
  const allData = await getWearableData();
  
  const connectedDevices = settings.connectedDevices.filter((d) => d.connected);
  
  // Find most recent sync
  const lastSync = settings.connectedDevices.reduce((latest, device) => {
    const deviceTime = new Date(device.lastSync).getTime();
    return deviceTime > latest ? deviceTime : latest;
  }, 0);
  
  // Count data by type
  const dataByType: { [key: string]: number } = {};
  allData.forEach((d) => {
    dataByType[d.type] = (dataByType[d.type] || 0) + 1;
  });
  
  return {
    totalDevices: settings.connectedDevices.length,
    connectedDevices: connectedDevices.length,
    totalDataPoints: allData.length,
    lastSyncTime: lastSync > 0 ? new Date(lastSync).toISOString() : "Never",
    dataByType,
  };
}

/**
 * Get wearable insights
 */
export async function getWearableInsights(): Promise<string[]> {
  const insights: string[] = [];
  const stats = await getSyncStatistics();
  
  if (stats.connectedDevices === 0) {
    insights.push("📱 Connect a wearable device to get real-time health insights!");
    return insights;
  }
  
  // Heart rate insights
  const heartRateData = await getWearableDataByType("heart_rate");
  if (heartRateData.length > 0) {
    const avgHeartRate =
      heartRateData.reduce((sum, d) => sum + d.value, 0) / heartRateData.length;
    insights.push(
      `💓 Your average heart rate is ${Math.round(avgHeartRate)} bpm from ${heartRateData.length} readings`
    );
  }
  
  // Activity insights
  const stepsData = await getWearableDataByType("steps");
  if (stepsData.length > 0) {
    const totalSteps = stepsData.reduce((sum, d) => sum + d.value, 0);
    const avgSteps = totalSteps / stepsData.length;
    insights.push(
      `🚶 You're averaging ${Math.round(avgSteps).toLocaleString()} steps per sync`
    );
    
    if (avgSteps < 5000) {
      insights.push("💡 Try to increase your daily steps for better energy levels");
    }
  }
  
  // Sync frequency
  const lastSyncTime = new Date(stats.lastSyncTime);
  const hoursSinceSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceSync > 24) {
    insights.push(
      "⚠️ It's been over 24 hours since your last sync. Sync now for up-to-date insights!"
    );
  }
  
  return insights;
}

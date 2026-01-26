import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { saveBiometricData, type BiometricData } from "@/app/services/correlation-engine";

const BIOMETRIC_DATA_KEY = "biometric_data";
const SYNC_SETTINGS_KEY = "biometric_sync_settings";

export interface BiometricReading {
  id: string;
  timestamp: string;
  type: "heart_rate" | "hrv" | "steps" | "distance" | "workout" | "resting_hr";
  value: number;
  unit: string;
  source: "apple_health" | "google_fit" | "manual";
}

export interface WorkoutSession {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  duration: number; // minutes
  calories?: number;
  distance?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  energyBefore?: number;
  energyAfter?: number;
}

export interface BiometricStats {
  averageHeartRate: number;
  restingHeartRate: number;
  averageHRV: number;
  totalSteps: number;
  totalDistance: number; // km
  totalWorkouts: number;
  activeMinutes: number;
}

export interface BiometricCorrelation {
  metric: string;
  correlation: number; // -1 to 1
  description: string;
  recommendation: string;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  syncHeartRate: boolean;
  syncSteps: boolean;
  syncWorkouts: boolean;
  syncHRV: boolean;
  lastSyncTime?: string;
}

/**
 * Get sync settings
 */
export async function getSyncSettings(): Promise<SyncSettings> {
  try {
    const data = await AsyncStorage.getItem(SYNC_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      autoSync: true,
      syncInterval: 60, // 1 hour
      syncHeartRate: true,
      syncSteps: true,
      syncWorkouts: true,
      syncHRV: true,
    };
  } catch (error) {
    console.error("Failed to get sync settings:", error);
    return {
      autoSync: true,
      syncInterval: 60,
      syncHeartRate: true,
      syncSteps: true,
      syncWorkouts: true,
      syncHRV: true,
    };
  }
}

/**
 * Update sync settings
 */
export async function updateSyncSettings(settings: Partial<SyncSettings>): Promise<void> {
  try {
    const current = await getSyncSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update sync settings:", error);
    throw error;
  }
}

/**
 * Save biometric reading
 */
export async function saveBiometricReading(reading: Omit<BiometricReading, "id">): Promise<void> {
  try {
    const readings = await getBiometricReadings();
    const newReading: BiometricReading = {
      ...reading,
      id: `biometric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    readings.push(newReading);
    
    // Keep last 10,000 readings (about 3 months of hourly data)
    const trimmed = readings.slice(-10000);
    
    await AsyncStorage.setItem(BIOMETRIC_DATA_KEY, JSON.stringify(trimmed));
    
    // Also save to correlation engine (aggregate daily)
    const readingDate = new Date(reading.timestamp);
    const dateStr = readingDate.toISOString().split('T')[0];
    
    // Get all readings for this date to calculate daily averages
    const todayReadings = readings.filter(r => {
      const rDate = new Date(r.timestamp).toISOString().split('T')[0];
      return rDate === dateStr;
    });
    
    const hrReadings = todayReadings.filter(r => r.type === 'heart_rate');
    const hrvReadings = todayReadings.filter(r => r.type === 'hrv');
    
    if (hrReadings.length > 0 || hrvReadings.length > 0) {
      const correlationData: BiometricData = {
        date: dateStr,
        heartRate: hrReadings.length > 0 
          ? Math.round(hrReadings.reduce((sum, r) => sum + r.value, 0) / hrReadings.length)
          : undefined,
        hrv: hrvReadings.length > 0
          ? Math.round(hrvReadings.reduce((sum, r) => sum + r.value, 0) / hrvReadings.length)
          : undefined,
      };
      
      await saveBiometricData(correlationData);
    }
  } catch (error) {
    console.error("Failed to save biometric reading:", error);
    throw error;
  }
}

/**
 * Get all biometric readings
 */
export async function getBiometricReadings(): Promise<BiometricReading[]> {
  try {
    const data = await AsyncStorage.getItem(BIOMETRIC_DATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get biometric readings:", error);
    return [];
  }
}

/**
 * Get biometric readings by type
 */
export async function getBiometricReadingsByType(
  type: BiometricReading["type"],
  days: number = 30
): Promise<BiometricReading[]> {
  const readings = await getBiometricReadings();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return readings.filter(
    (r) => r.type === type && new Date(r.timestamp) >= cutoff
  );
}

/**
 * Get biometric stats for a period
 */
export async function getBiometricStats(days: number = 30): Promise<BiometricStats> {
  const readings = await getBiometricReadings();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const recentReadings = readings.filter((r) => new Date(r.timestamp) >= cutoff);
  
  const heartRateReadings = recentReadings.filter((r) => r.type === "heart_rate");
  const restingHRReadings = recentReadings.filter((r) => r.type === "resting_hr");
  const hrvReadings = recentReadings.filter((r) => r.type === "hrv");
  const stepsReadings = recentReadings.filter((r) => r.type === "steps");
  const distanceReadings = recentReadings.filter((r) => r.type === "distance");
  const workoutReadings = recentReadings.filter((r) => r.type === "workout");
  
  return {
    averageHeartRate:
      heartRateReadings.length > 0
        ? heartRateReadings.reduce((sum, r) => sum + r.value, 0) / heartRateReadings.length
        : 0,
    restingHeartRate:
      restingHRReadings.length > 0
        ? restingHRReadings.reduce((sum, r) => sum + r.value, 0) / restingHRReadings.length
        : 0,
    averageHRV:
      hrvReadings.length > 0
        ? hrvReadings.reduce((sum, r) => sum + r.value, 0) / hrvReadings.length
        : 0,
    totalSteps: stepsReadings.reduce((sum, r) => sum + r.value, 0),
    totalDistance: distanceReadings.reduce((sum, r) => sum + r.value, 0),
    totalWorkouts: workoutReadings.length,
    activeMinutes: workoutReadings.reduce((sum, r) => sum + r.value, 0),
  };
}

/**
 * Analyze correlation between biometrics and energy
 */
export async function analyzeBiometricEnergyCorrelation(): Promise<BiometricCorrelation[]> {
  const correlations: BiometricCorrelation[] = [];
  
  // This is a simplified correlation analysis
  // In a real implementation, you'd calculate actual correlation coefficients
  // using historical biometric data and energy readings
  
  const stats = await getBiometricStats(30);
  
  // Heart rate correlation
  if (stats.averageHeartRate > 0) {
    const correlation = stats.averageHeartRate < 70 ? 0.6 : -0.3;
    correlations.push({
      metric: "Heart Rate",
      correlation,
      description:
        correlation > 0
          ? "Lower resting heart rate correlates with higher energy levels"
          : "Elevated heart rate may indicate stress or fatigue",
      recommendation:
        correlation > 0
          ? "Maintain cardiovascular fitness through regular exercise"
          : "Consider stress management techniques and adequate rest",
    });
  }
  
  // HRV correlation
  if (stats.averageHRV > 0) {
    const correlation = stats.averageHRV > 50 ? 0.7 : 0.3;
    correlations.push({
      metric: "Heart Rate Variability",
      correlation,
      description:
        correlation > 0.5
          ? "High HRV indicates good recovery and resilience"
          : "Moderate HRV suggests room for improvement",
      recommendation:
        correlation > 0.5
          ? "Your HRV is excellent - keep up your wellness routine"
          : "Focus on sleep quality, stress reduction, and recovery",
    });
  }
  
  // Steps correlation
  if (stats.totalSteps > 0) {
    const avgDailySteps = stats.totalSteps / 30;
    const correlation = avgDailySteps > 7000 ? 0.5 : 0.2;
    correlations.push({
      metric: "Daily Steps",
      correlation,
      description:
        avgDailySteps > 7000
          ? "Regular movement positively impacts your energy"
          : "Increased movement could boost your energy levels",
      recommendation:
        avgDailySteps > 7000
          ? "Maintain your active lifestyle"
          : "Aim for 7,000-10,000 steps daily for optimal energy",
    });
  }
  
  // Workout correlation
  if (stats.totalWorkouts > 0) {
    const correlation = stats.totalWorkouts > 10 ? 0.6 : 0.3;
    correlations.push({
      metric: "Exercise Frequency",
      correlation,
      description:
        stats.totalWorkouts > 10
          ? "Regular exercise strongly correlates with sustained energy"
          : "More consistent exercise could improve energy levels",
      recommendation:
        stats.totalWorkouts > 10
          ? "Your workout routine is supporting your energy well"
          : "Aim for 3-5 workouts per week for better energy",
    });
  }
  
  return correlations;
}

/**
 * Get biometric insights
 */
export async function getBiometricInsights(): Promise<string[]> {
  const insights: string[] = [];
  const stats = await getBiometricStats(30);
  const correlations = await analyzeBiometricEnergyCorrelation();
  
  // Resting heart rate insights
  if (stats.restingHeartRate > 0) {
    if (stats.restingHeartRate < 60) {
      insights.push("💪 Your resting heart rate is excellent, indicating strong cardiovascular fitness");
    } else if (stats.restingHeartRate < 70) {
      insights.push("✅ Your resting heart rate is in a healthy range");
    } else {
      insights.push("⚠️ Your resting heart rate is elevated - consider more rest and stress management");
    }
  }
  
  // HRV insights
  if (stats.averageHRV > 0) {
    if (stats.averageHRV > 60) {
      insights.push("🌟 Your HRV is excellent - you're recovering well and managing stress effectively");
    } else if (stats.averageHRV > 40) {
      insights.push("✅ Your HRV is good - continue your wellness practices");
    } else {
      insights.push("⚠️ Your HRV is low - prioritize sleep, recovery, and stress reduction");
    }
  }
  
  // Steps insights
  const avgDailySteps = stats.totalSteps / 30;
  if (avgDailySteps > 10000) {
    insights.push("🚶 You're very active with over 10,000 steps daily - great for energy!");
  } else if (avgDailySteps > 7000) {
    insights.push("✅ You're meeting the recommended daily step goal");
  } else if (avgDailySteps > 0) {
    insights.push("💡 Increasing your daily steps to 7,000+ could boost your energy levels");
  }
  
  // Workout insights
  if (stats.totalWorkouts > 15) {
    insights.push("🏋️ You're very consistent with workouts - this supports sustained energy");
  } else if (stats.totalWorkouts > 8) {
    insights.push("✅ Good workout frequency - aim to maintain this consistency");
  } else if (stats.totalWorkouts > 0) {
    insights.push("💡 More regular exercise (3-5x/week) could improve your energy levels");
  }
  
  // Correlation insights
  const strongCorrelations = correlations.filter((c) => Math.abs(c.correlation) > 0.5);
  if (strongCorrelations.length > 0) {
    insights.push(
      `📊 Strong correlation found: ${strongCorrelations[0].metric} significantly impacts your energy`
    );
  }
  
  return insights;
}

/**
 * Sync with Apple Health (iOS only)
 */
export async function syncAppleHealth(): Promise<{ success: boolean; message: string }> {
  if (Platform.OS !== "ios") {
    return { success: false, message: "Apple Health is only available on iOS" };
  }
  
  try {
    // In a real implementation, you would use react-native-health or similar
    // For now, we'll simulate the sync
    
    const settings = await getSyncSettings();
    
    // Simulate importing data
    const now = new Date();
    
    if (settings.syncHeartRate) {
      // Simulate heart rate readings
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        await saveBiometricReading({
          timestamp: timestamp.toISOString(),
          type: "heart_rate",
          value: 60 + Math.random() * 20,
          unit: "bpm",
          source: "apple_health",
        });
      }
    }
    
    if (settings.syncSteps) {
      // Simulate daily steps
      await saveBiometricReading({
        timestamp: now.toISOString(),
        type: "steps",
        value: 8000 + Math.random() * 4000,
        unit: "steps",
        source: "apple_health",
      });
    }
    
    // Update last sync time
    await updateSyncSettings({ lastSyncTime: now.toISOString() });
    
    return { success: true, message: "Successfully synced with Apple Health" };
  } catch (error) {
    console.error("Failed to sync with Apple Health:", error);
    return { success: false, message: "Failed to sync with Apple Health" };
  }
}

/**
 * Sync with Google Fit (Android only)
 */
export async function syncGoogleFit(): Promise<{ success: boolean; message: string }> {
  if (Platform.OS !== "android") {
    return { success: false, message: "Google Fit is only available on Android" };
  }
  
  try {
    // In a real implementation, you would use @react-native-community/google-fit or similar
    // For now, we'll simulate the sync
    
    const settings = await getSyncSettings();
    
    // Simulate importing data
    const now = new Date();
    
    if (settings.syncHeartRate) {
      // Simulate heart rate readings
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        await saveBiometricReading({
          timestamp: timestamp.toISOString(),
          type: "heart_rate",
          value: 60 + Math.random() * 20,
          unit: "bpm",
          source: "google_fit",
        });
      }
    }
    
    if (settings.syncSteps) {
      // Simulate daily steps
      await saveBiometricReading({
        timestamp: now.toISOString(),
        type: "steps",
        value: 8000 + Math.random() * 4000,
        unit: "steps",
        source: "google_fit",
      });
    }
    
    // Update last sync time
    await updateSyncSettings({ lastSyncTime: now.toISOString() });
    
    return { success: true, message: "Successfully synced with Google Fit" };
  } catch (error) {
    console.error("Failed to sync with Google Fit:", error);
    return { success: false, message: "Failed to sync with Google Fit" };
  }
}

/**
 * Manual biometric entry
 */
export async function addManualBiometricReading(
  type: BiometricReading["type"],
  value: number,
  unit: string
): Promise<void> {
  await saveBiometricReading({
    timestamp: new Date().toISOString(),
    type,
    value,
    unit,
    source: "manual",
  });
}

/**
 * Delete biometric reading
 */
export async function deleteBiometricReading(id: string): Promise<void> {
  try {
    const readings = await getBiometricReadings();
    const filtered = readings.filter((r) => r.id !== id);
    await AsyncStorage.setItem(BIOMETRIC_DATA_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete biometric reading:", error);
    throw error;
  }
}

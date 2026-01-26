/**
 * Biometric Integration
 * 
 * Import heart rate variability and stress data from wearables
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "@energy_today:biometric_data";

export interface BiometricReading {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  heartRate?: number; // bpm
  heartRateVariability?: number; // ms (RMSSD)
  stressLevel?: number; // 0-100
  restingHeartRate?: number; // bpm
  vo2Max?: number; // ml/kg/min
  source: "apple_health" | "google_fit" | "manual";
}

export interface BiometricInsights {
  averageHRV: number;
  averageStress: number;
  hrvTrend: "improving" | "stable" | "declining";
  stressTrend: "improving" | "stable" | "worsening";
  energyCorrelation: {
    hrvToEnergy: number; // -1 to 1
    stressToEnergy: number; // -1 to 1
  };
  recommendations: string[];
}

/**
 * Get all biometric readings
 */
export async function getBiometricReadings(): Promise<BiometricReading[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get biometric readings:", error);
  }
  return [];
}

/**
 * Add biometric reading
 */
export async function addBiometricReading(reading: Omit<BiometricReading, "id">): Promise<void> {
  try {
    const readings = await getBiometricReadings();
    const newReading: BiometricReading = {
      ...reading,
      id: Date.now().toString(),
    };
    readings.push(newReading);
    readings.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch (error) {
    console.error("Failed to add biometric reading:", error);
    throw error;
  }
}

/**
 * Import from Apple Health (iOS only)
 */
export async function importFromAppleHealth(): Promise<BiometricReading[]> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Health is only available on iOS");
  }

  // Note: This requires expo-health or react-native-health package
  // For now, return mock data structure
  console.log("Apple Health integration requires expo-health package");
  return [];
}

/**
 * Import from Google Fit (Android only)
 */
export async function importFromGoogleFit(): Promise<BiometricReading[]> {
  if (Platform.OS !== "android") {
    throw new Error("Google Fit is only available on Android");
  }

  // Note: This requires @react-native-community/google-fit package
  // For now, return mock data structure
  console.log("Google Fit integration requires google-fit package");
  return [];
}

/**
 * Calculate biometric insights
 */
export async function calculateBiometricInsights(
  readings: BiometricReading[],
  energyData: Array<{ date: string; energy: number }>
): Promise<BiometricInsights> {
  if (readings.length === 0) {
    return {
      averageHRV: 0,
      averageStress: 0,
      hrvTrend: "stable",
      stressTrend: "stable",
      energyCorrelation: {
        hrvToEnergy: 0,
        stressToEnergy: 0,
      },
      recommendations: ["Start tracking biometric data to get personalized insights"],
    };
  }

  // Calculate averages
  const hrvReadings = readings.filter((r) => r.heartRateVariability !== undefined);
  const stressReadings = readings.filter((r) => r.stressLevel !== undefined);

  const averageHRV = hrvReadings.length > 0
    ? hrvReadings.reduce((sum, r) => sum + (r.heartRateVariability || 0), 0) / hrvReadings.length
    : 0;

  const averageStress = stressReadings.length > 0
    ? stressReadings.reduce((sum, r) => sum + (r.stressLevel || 0), 0) / stressReadings.length
    : 0;

  // Calculate trends (compare first half vs second half)
  const midpoint = Math.floor(readings.length / 2);
  const firstHalf = readings.slice(midpoint);
  const secondHalf = readings.slice(0, midpoint);

  const firstHalfHRV = firstHalf
    .filter((r) => r.heartRateVariability !== undefined)
    .reduce((sum, r) => sum + (r.heartRateVariability || 0), 0) / firstHalf.length;

  const secondHalfHRV = secondHalf
    .filter((r) => r.heartRateVariability !== undefined)
    .reduce((sum, r) => sum + (r.heartRateVariability || 0), 0) / secondHalf.length;

  const hrvTrend: "improving" | "stable" | "declining" =
    secondHalfHRV > firstHalfHRV * 1.1 ? "improving" :
    secondHalfHRV < firstHalfHRV * 0.9 ? "declining" : "stable";

  const firstHalfStress = firstHalf
    .filter((r) => r.stressLevel !== undefined)
    .reduce((sum, r) => sum + (r.stressLevel || 0), 0) / firstHalf.length;

  const secondHalfStress = secondHalf
    .filter((r) => r.stressLevel !== undefined)
    .reduce((sum, r) => sum + (r.stressLevel || 0), 0) / secondHalf.length;

  const stressTrend: "improving" | "stable" | "worsening" =
    secondHalfStress < firstHalfStress * 0.9 ? "improving" :
    secondHalfStress > firstHalfStress * 1.1 ? "worsening" : "stable";

  // Calculate correlations with energy
  const correlatedData = readings
    .map((r) => {
      const energyEntry = energyData.find((e) => e.date === r.date);
      return energyEntry ? { ...r, energy: energyEntry.energy } : null;
    })
    .filter((d) => d !== null) as Array<BiometricReading & { energy: number }>;

  const hrvToEnergy = calculateCorrelation(
    correlatedData.map((d) => d.heartRateVariability || 0),
    correlatedData.map((d) => d.energy)
  );

  const stressToEnergy = calculateCorrelation(
    correlatedData.map((d) => d.stressLevel || 0),
    correlatedData.map((d) => d.energy)
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (averageHRV < 30) {
    recommendations.push("Your HRV is low. Consider more rest, stress management, and sleep optimization.");
  } else if (averageHRV > 60) {
    recommendations.push("Excellent HRV! Your body is well-recovered and ready for challenges.");
  }

  if (averageStress > 70) {
    recommendations.push("High stress levels detected. Prioritize relaxation, meditation, and breaks.");
  }

  if (hrvTrend === "declining") {
    recommendations.push("Your HRV is declining. Reduce training intensity and focus on recovery.");
  }

  if (stressTrend === "worsening") {
    recommendations.push("Stress levels are increasing. Review your workload and self-care practices.");
  }

  if (Math.abs(hrvToEnergy) > 0.5) {
    recommendations.push(
      hrvToEnergy > 0
        ? "Higher HRV correlates with better energy. Keep up your recovery practices!"
        : "Lower HRV seems to boost your energy. This is unusual - consult a health professional."
    );
  }

  if (Math.abs(stressToEnergy) > 0.5) {
    recommendations.push(
      stressToEnergy < 0
        ? "High stress is draining your energy. Stress management is crucial for you."
        : "You seem to thrive under pressure. Just ensure you're getting adequate recovery."
    );
  }

  return {
    averageHRV,
    averageStress,
    hrvTrend,
    stressTrend,
    energyCorrelation: {
      hrvToEnergy,
      stressToEnergy,
    },
    recommendations,
  };
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Delete biometric reading
 */
export async function deleteBiometricReading(id: string): Promise<void> {
  try {
    const readings = await getBiometricReadings();
    const filtered = readings.filter((r) => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete biometric reading:", error);
    throw error;
  }
}

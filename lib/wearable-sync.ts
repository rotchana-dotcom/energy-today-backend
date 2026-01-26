/**
 * Wearable Integration
 * 
 * Syncs health data from Apple Health (iOS) and Google Fit (Android)
 * Auto-imports sleep, steps, heart rate, and activity data
 */

import { Platform } from "react-native";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "react-native-health";

export interface WearableData {
  sleep?: {
    startDate: Date;
    endDate: Date;
    value: number; // hours
  }[];
  steps?: {
    date: Date;
    value: number;
  }[];
  heartRate?: {
    date: Date;
    value: number; // bpm
  }[];
  calories?: {
    date: Date;
    value: number;
  }[];
}

/**
 * Request permissions for health data access
 */
export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === "ios") {
    return requestAppleHealthPermissions();
  } else if (Platform.OS === "android") {
    return requestGoogleFitPermissions();
  }
  return false;
}

/**
 * Request Apple Health permissions (iOS)
 */
async function requestAppleHealthPermissions(): Promise<boolean> {
  const permissions: HealthKitPermissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      ],
      write: [],
    },
  };

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log("[HealthKit] Error getting permissions:", error);
        resolve(false);
      } else {
        console.log("[HealthKit] Permissions granted");
        resolve(true);
      }
    });
  });
}

/**
 * Request Google Fit permissions (Android)
 */
async function requestGoogleFitPermissions(): Promise<boolean> {
  // Google Fit integration for Android
  // Note: Requires Google Fit API setup in Google Cloud Console
  // For now, return false and show manual entry option
  console.log("[GoogleFit] Not yet implemented - use manual entry");
  return false;
}

/**
 * Sync health data from wearables
 */
export async function syncWearableData(days: number = 7): Promise<WearableData> {
  if (Platform.OS === "ios") {
    return syncAppleHealthData(days);
  } else if (Platform.OS === "android") {
    return syncGoogleFitData(days);
  }
  return {};
}

/**
 * Sync data from Apple Health (iOS)
 */
async function syncAppleHealthData(days: number): Promise<WearableData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data: WearableData = {};

  // Sync sleep data
  try {
    const sleepData = await getSleepSamples(startDate, endDate);
    data.sleep = sleepData;
  } catch (error) {
    console.log("[HealthKit] Error syncing sleep:", error);
  }

  // Sync steps data
  try {
    const stepsData = await getStepSamples(startDate, endDate);
    data.steps = stepsData;
  } catch (error) {
    console.log("[HealthKit] Error syncing steps:", error);
  }

  // Sync heart rate data
  try {
    const heartRateData = await getHeartRateSamples(startDate, endDate);
    data.heartRate = heartRateData;
  } catch (error) {
    console.log("[HealthKit] Error syncing heart rate:", error);
  }

  // Sync calories data
  try {
    const caloriesData = await getCaloriesSamples(startDate, endDate);
    data.calories = caloriesData;
  } catch (error) {
    console.log("[HealthKit] Error syncing calories:", error);
  }

  return data;
}

/**
 * Get sleep samples from Apple Health
 */
function getSleepSamples(
  startDate: Date,
  endDate: Date
): Promise<WearableData["sleep"]> {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    AppleHealthKit.getSleepSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        // Group sleep sessions by date
        const sleepSessions = results
          .filter((sample: any) => sample.value === "ASLEEP")
          .map((sample: any) => ({
            startDate: new Date(sample.startDate),
            endDate: new Date(sample.endDate),
            value:
              (new Date(sample.endDate).getTime() -
                new Date(sample.startDate).getTime()) /
              (1000 * 60 * 60), // hours
          }));

        resolve(sleepSessions);
      }
    );
  });
}

/**
 * Get step samples from Apple Health
 */
function getStepSamples(
  startDate: Date,
  endDate: Date
): Promise<WearableData["steps"]> {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      period: 1440, // 1 day in minutes
    };

    AppleHealthKit.getDailyStepCountSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        const steps = results.map((sample: any) => ({
          date: new Date(sample.startDate),
          value: sample.value,
        }));

        resolve(steps);
      }
    );
  });
}

/**
 * Get heart rate samples from Apple Health
 */
function getHeartRateSamples(
  startDate: Date,
  endDate: Date
): Promise<WearableData["heartRate"]> {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    AppleHealthKit.getHeartRateSamples(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        const heartRate = results.map((sample: any) => ({
          date: new Date(sample.startDate),
          value: sample.value,
        }));

        resolve(heartRate);
      }
    );
  });
}

/**
 * Get calories samples from Apple Health
 */
function getCaloriesSamples(
  startDate: Date,
  endDate: Date
): Promise<WearableData["calories"]> {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }

        const calories = results.map((sample: any) => ({
          date: new Date(sample.startDate),
          value: sample.value,
        }));

        resolve(calories);
      }
    );
  });
}

/**
 * Sync data from Google Fit (Android)
 */
async function syncGoogleFitData(days: number): Promise<WearableData> {
  // Google Fit integration for Android
  // Requires Google Fit API setup and OAuth
  // For MVP, return empty data
  console.log("[GoogleFit] Sync not yet implemented");
  return {};
}

/**
 * Check if health permissions are granted
 */
export async function hasHealthPermissions(): Promise<boolean> {
  if (Platform.OS === "ios") {
    // Apple Health doesn't provide a way to check permissions
    // We assume they're granted if HealthKit is available
    return new Promise((resolve) => {
      AppleHealthKit.isAvailable((error: Object, available: boolean) => {
        resolve(available);
      });
    });
  } else if (Platform.OS === "android") {
    // Google Fit permission check
    return false; // Not yet implemented
  }
  return false;
}

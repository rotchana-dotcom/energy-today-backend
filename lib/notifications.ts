import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./storage";
import { calculateDailyEnergy } from "./energy-engine";

const NOTIFICATION_TIME_KEY = "@energy_today:notification_time";
const NOTIFICATION_ENABLED_KEY = "@energy_today:notification_enabled";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleEnergyNotification(hour: number = 8, minute: number = 0): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Get user profile and calculate today's energy
  const profile = await getUserProfile();
  if (!profile) return;

  const energy = calculateDailyEnergy(profile);

  // Schedule daily notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your Energy Today ⚡",
      body: `${energy.userEnergy.type} meets ${energy.environmentalEnergy.type}. ${energy.connection.alignment === "strong" ? "Great alignment today!" : energy.connection.alignment === "moderate" ? "Steady energy ahead." : "Navigate carefully today."}`,
      data: { type: "daily_energy", route: "/(tabs)/" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

export async function setNotificationTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, JSON.stringify({ hour, minute }));
  await scheduleEnergyNotification(hour, minute);
}

export async function getNotificationTime(): Promise<{ hour: number; minute: number }> {
  const data = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
  return data ? JSON.parse(data) : { hour: 8, minute: 0 };
}

export async function setNotificationEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(enabled));
  
  if (enabled) {
    const { hour, minute } = await getNotificationTime();
    await scheduleEnergyNotification(hour, minute);
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export async function isNotificationEnabled(): Promise<boolean> {
  const data = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
  return data ? JSON.parse(data) : false;
}

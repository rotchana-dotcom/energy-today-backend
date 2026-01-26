import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SyncStatusIndicatorProps {
  feature: "diet" | "health" | "fitness" | "meditation" | "schedule";
  lastSyncTime?: string; // ISO timestamp
  className?: string;
}

/**
 * Displays the last sync time for a feature
 * Shows "Synced X min ago" or "Not synced"
 */
export function SyncStatusIndicator({ feature, lastSyncTime, className }: SyncStatusIndicatorProps) {
  const colors = useColors();
  const [syncTime, setSyncTime] = useState<string | null>(lastSyncTime || null);
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    // Load last sync time from storage
    const loadSyncTime = async () => {
      try {
        const stored = await AsyncStorage.getItem(`@calendar_sync_last_${feature}`);
        if (stored) {
          setSyncTime(stored);
        }
      } catch (error) {
        console.error(`[SyncStatus] Failed to load sync time for ${feature}:`, error);
      }
    };

    loadSyncTime();
  }, [feature]);

  useEffect(() => {
    if (!syncTime) {
      setTimeAgo("");
      return;
    }

    // Calculate time ago
    const updateTimeAgo = () => {
      const now = Date.now();
      const syncDate = new Date(syncTime).getTime();
      const diffMs = now - syncDate;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        setTimeAgo("Just now");
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        setTimeAgo(`${hours}h ago`);
      } else {
        const days = Math.floor(diffMins / 1440);
        setTimeAgo(`${days}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [syncTime]);

  if (!syncTime) {
    return null; // Don't show indicator if never synced
  }

  return (
    <View
      className={`flex-row items-center gap-1 ${className || ""}`}
      style={{ opacity: 0.7 }}
    >
      <View
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.success }}
      />
      <Text className="text-xs" style={{ color: colors.muted }}>
        Synced {timeAgo}
      </Text>
    </View>
  );
}

/**
 * Helper function to update last sync time in storage
 * Call this after successful calendar sync
 */
export async function updateLastSyncTime(feature: "diet" | "health" | "fitness" | "meditation" | "schedule"): Promise<void> {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(`@calendar_sync_last_${feature}`, now);
  } catch (error) {
    console.error(`[SyncStatus] Failed to update sync time for ${feature}:`, error);
  }
}

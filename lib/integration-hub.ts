import AsyncStorage from "@react-native-async-storage/async-storage";

const INTEGRATIONS_KEY = "app_integrations";
const SYNC_SETTINGS_KEY = "sync_settings";

export type IntegrationType =
  | "spotify"
  | "headspace"
  | "calm"
  | "myfitnesspal"
  | "oura"
  | "strava"
  | "google_fit"
  | "apple_health"
  | "fitbit"
  | "garmin";

export interface Integration {
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  category: "music" | "meditation" | "nutrition" | "fitness" | "sleep" | "health";
  connected: boolean;
  connectedDate?: string;
  lastSyncDate?: string;
  syncEnabled: boolean;
  features: string[];
  requiresOAuth: boolean;
  status: "active" | "error" | "disconnected";
  errorMessage?: string;
}

export interface SyncSettings {
  integrationType: IntegrationType;
  autoSync: boolean;
  syncFrequency: "realtime" | "hourly" | "daily" | "manual";
  dataTypes: string[];
  lastSync?: string;
  nextSync?: string;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors?: string[];
  timestamp: string;
}

/**
 * Get all integrations
 */
export async function getAllIntegrations(): Promise<Integration[]> {
  try {
    const data = await AsyncStorage.getItem(INTEGRATIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Initialize with default integrations
    const integrations = getDefaultIntegrations();
    await AsyncStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    return integrations;
  } catch (error) {
    console.error("Failed to get integrations:", error);
    return [];
  }
}

/**
 * Default integrations
 */
function getDefaultIntegrations(): Integration[] {
  return [
    {
      type: "spotify",
      name: "Spotify",
      description: "Track music mood and energy correlation",
      icon: "🎵",
      category: "music",
      connected: false,
      syncEnabled: false,
      features: [
        "Track listening history",
        "Mood-energy correlation",
        "Music recommendations based on energy",
        "Playlist suggestions",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "headspace",
      name: "Headspace",
      description: "Sync meditation sessions automatically",
      icon: "🧘",
      category: "meditation",
      connected: false,
      syncEnabled: false,
      features: [
        "Auto-import meditation sessions",
        "Track meditation consistency",
        "Meditation-energy correlation",
        "Mindfulness minutes tracking",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "calm",
      name: "Calm",
      description: "Import meditation and sleep stories",
      icon: "🌊",
      category: "meditation",
      connected: false,
      syncEnabled: false,
      features: [
        "Meditation session sync",
        "Sleep story tracking",
        "Breathing exercise history",
        "Calm-energy correlation",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "myfitnesspal",
      name: "MyFitnessPal",
      description: "Auto-import meals and nutrition data",
      icon: "🍽️",
      category: "nutrition",
      connected: false,
      syncEnabled: false,
      features: [
        "Automatic meal logging",
        "Macro tracking sync",
        "Calorie intake correlation",
        "Nutrition-energy analysis",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "oura",
      name: "Oura Ring",
      description: "Advanced sleep and readiness data",
      icon: "💍",
      category: "sleep",
      connected: false,
      syncEnabled: false,
      features: [
        "Sleep stages tracking",
        "Readiness score",
        "Heart rate variability",
        "Body temperature",
        "Activity tracking",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "strava",
      name: "Strava",
      description: "Sync workouts and activities",
      icon: "🏃",
      category: "fitness",
      connected: false,
      syncEnabled: false,
      features: [
        "Workout auto-import",
        "Activity tracking",
        "Performance metrics",
        "Exercise-energy correlation",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "google_fit",
      name: "Google Fit",
      description: "Comprehensive health and fitness data",
      icon: "🏥",
      category: "health",
      connected: false,
      syncEnabled: false,
      features: [
        "Steps and activity",
        "Heart rate monitoring",
        "Sleep tracking",
        "Workout sessions",
        "Weight tracking",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "apple_health",
      name: "Apple Health",
      description: "Full health data integration (iOS)",
      icon: "❤️",
      category: "health",
      connected: false,
      syncEnabled: false,
      features: [
        "Steps and distance",
        "Heart rate data",
        "Sleep analysis",
        "Workouts",
        "Mindfulness minutes",
        "Nutrition data",
      ],
      requiresOAuth: false,
      status: "disconnected",
    },
    {
      type: "fitbit",
      name: "Fitbit",
      description: "Activity, sleep, and heart rate data",
      icon: "⌚",
      category: "health",
      connected: false,
      syncEnabled: false,
      features: [
        "Activity tracking",
        "Sleep stages",
        "Heart rate zones",
        "Exercise sessions",
        "Stress management score",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
    {
      type: "garmin",
      name: "Garmin Connect",
      description: "Advanced fitness and wellness metrics",
      icon: "🎯",
      category: "fitness",
      connected: false,
      syncEnabled: false,
      features: [
        "Activity and workouts",
        "Body Battery",
        "Stress tracking",
        "Sleep monitoring",
        "VO2 max and fitness age",
      ],
      requiresOAuth: true,
      status: "disconnected",
    },
  ];
}

/**
 * Get integration by type
 */
export async function getIntegration(
  type: IntegrationType
): Promise<Integration | null> {
  const integrations = await getAllIntegrations();
  return integrations.find((i) => i.type === type) || null;
}

/**
 * Connect integration
 */
export async function connectIntegration(
  type: IntegrationType,
  oauthToken?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const integrations = await getAllIntegrations();
    const integration = integrations.find((i) => i.type === type);
    
    if (!integration) {
      return {
        success: false,
        message: "Integration not found",
      };
    }
    
    if (integration.requiresOAuth && !oauthToken) {
      return {
        success: false,
        message: "OAuth token required",
      };
    }
    
    // In real implementation, would verify OAuth token and establish connection
    // For now, simulate successful connection
    
    integration.connected = true;
    integration.connectedDate = new Date().toISOString();
    integration.status = "active";
    integration.syncEnabled = true;
    
    await AsyncStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    
    // Initialize sync settings
    await initializeSyncSettings(type);
    
    return {
      success: true,
      message: `Successfully connected to ${integration.name}`,
    };
  } catch (error) {
    console.error("Failed to connect integration:", error);
    return {
      success: false,
      message: `Connection failed: ${error}`,
    };
  }
}

/**
 * Disconnect integration
 */
export async function disconnectIntegration(
  type: IntegrationType
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const integrations = await getAllIntegrations();
    const integration = integrations.find((i) => i.type === type);
    
    if (!integration) {
      return {
        success: false,
        message: "Integration not found",
      };
    }
    
    integration.connected = false;
    integration.connectedDate = undefined;
    integration.lastSyncDate = undefined;
    integration.status = "disconnected";
    integration.syncEnabled = false;
    integration.errorMessage = undefined;
    
    await AsyncStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    
    // Remove sync settings
    await AsyncStorage.removeItem(`${SYNC_SETTINGS_KEY}_${type}`);
    
    return {
      success: true,
      message: `Successfully disconnected from ${integration.name}`,
    };
  } catch (error) {
    console.error("Failed to disconnect integration:", error);
    return {
      success: false,
      message: `Disconnection failed: ${error}`,
    };
  }
}

/**
 * Initialize sync settings
 */
async function initializeSyncSettings(type: IntegrationType): Promise<void> {
  const defaultSettings: SyncSettings = {
    integrationType: type,
    autoSync: true,
    syncFrequency: "daily",
    dataTypes: [],
  };
  
  // Set default data types based on integration
  switch (type) {
    case "spotify":
      defaultSettings.dataTypes = ["listening_history", "mood_data"];
      break;
    case "headspace":
    case "calm":
      defaultSettings.dataTypes = ["meditation_sessions", "mindfulness_minutes"];
      break;
    case "myfitnesspal":
      defaultSettings.dataTypes = ["meals", "macros", "calories"];
      break;
    case "oura":
      defaultSettings.dataTypes = ["sleep", "readiness", "activity", "hrv"];
      break;
    case "strava":
      defaultSettings.dataTypes = ["workouts", "activities", "performance"];
      break;
    case "google_fit":
    case "apple_health":
    case "fitbit":
    case "garmin":
      defaultSettings.dataTypes = [
        "steps",
        "heart_rate",
        "sleep",
        "workouts",
        "activity",
      ];
      break;
  }
  
  await AsyncStorage.setItem(
    `${SYNC_SETTINGS_KEY}_${type}`,
    JSON.stringify(defaultSettings)
  );
}

/**
 * Get sync settings
 */
export async function getSyncSettings(
  type: IntegrationType
): Promise<SyncSettings | null> {
  try {
    const data = await AsyncStorage.getItem(`${SYNC_SETTINGS_KEY}_${type}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get sync settings:", error);
    return null;
  }
}

/**
 * Update sync settings
 */
export async function updateSyncSettings(
  type: IntegrationType,
  settings: Partial<SyncSettings>
): Promise<void> {
  try {
    const currentSettings = await getSyncSettings(type);
    if (!currentSettings) {
      throw new Error("Sync settings not found");
    }
    
    const updatedSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(
      `${SYNC_SETTINGS_KEY}_${type}`,
      JSON.stringify(updatedSettings)
    );
  } catch (error) {
    console.error("Failed to update sync settings:", error);
    throw error;
  }
}

/**
 * Sync integration data
 */
export async function syncIntegration(
  type: IntegrationType
): Promise<SyncResult> {
  try {
    const integration = await getIntegration(type);
    
    if (!integration || !integration.connected) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ["Integration not connected"],
        timestamp: new Date().toISOString(),
      };
    }
    
    const settings = await getSyncSettings(type);
    if (!settings) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ["Sync settings not found"],
        timestamp: new Date().toISOString(),
      };
    }
    
    // In real implementation, would fetch data from the integration's API
    // For now, simulate successful sync
    
    const itemsSynced = Math.floor(Math.random() * 20) + 5;
    
    // Update integration last sync date
    const integrations = await getAllIntegrations();
    const integrationIndex = integrations.findIndex((i) => i.type === type);
    if (integrationIndex > -1) {
      integrations[integrationIndex].lastSyncDate = new Date().toISOString();
      await AsyncStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    }
    
    // Update sync settings
    settings.lastSync = new Date().toISOString();
    if (settings.syncFrequency === "hourly") {
      const nextSync = new Date();
      nextSync.setHours(nextSync.getHours() + 1);
      settings.nextSync = nextSync.toISOString();
    } else if (settings.syncFrequency === "daily") {
      const nextSync = new Date();
      nextSync.setDate(nextSync.getDate() + 1);
      settings.nextSync = nextSync.toISOString();
    }
    
    await AsyncStorage.setItem(
      `${SYNC_SETTINGS_KEY}_${type}`,
      JSON.stringify(settings)
    );
    
    return {
      success: true,
      itemsSynced,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to sync integration:", error);
    return {
      success: false,
      itemsSynced: 0,
      errors: [`Sync failed: ${error}`],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Sync all connected integrations
 */
export async function syncAllIntegrations(): Promise<{
  totalSynced: number;
  results: { type: IntegrationType; result: SyncResult }[];
}> {
  const integrations = await getAllIntegrations();
  const connectedIntegrations = integrations.filter((i) => i.connected);
  
  const results: { type: IntegrationType; result: SyncResult }[] = [];
  let totalSynced = 0;
  
  for (const integration of connectedIntegrations) {
    const result = await syncIntegration(integration.type);
    results.push({ type: integration.type, result });
    totalSynced += result.itemsSynced;
  }
  
  return {
    totalSynced,
    results,
  };
}

/**
 * Get integration statistics
 */
export async function getIntegrationStatistics(): Promise<{
  totalIntegrations: number;
  connectedIntegrations: number;
  activeIntegrations: number;
  lastSyncDate?: string;
  totalDataSynced: number;
}> {
  const integrations = await getAllIntegrations();
  const connected = integrations.filter((i) => i.connected);
  const active = integrations.filter((i) => i.status === "active");
  
  // Find most recent sync date
  const syncDates = integrations
    .filter((i) => i.lastSyncDate)
    .map((i) => new Date(i.lastSyncDate!).getTime());
  
  const lastSyncDate = syncDates.length > 0
    ? new Date(Math.max(...syncDates)).toISOString()
    : undefined;
  
  // In real implementation, would calculate actual data synced
  const totalDataSynced = connected.length * 150; // Simulated
  
  return {
    totalIntegrations: integrations.length,
    connectedIntegrations: connected.length,
    activeIntegrations: active.length,
    lastSyncDate,
    totalDataSynced,
  };
}

/**
 * Test integration connection
 */
export async function testIntegrationConnection(
  type: IntegrationType
): Promise<{
  success: boolean;
  message: string;
  latency?: number;
}> {
  try {
    const integration = await getIntegration(type);
    
    if (!integration || !integration.connected) {
      return {
        success: false,
        message: "Integration not connected",
      };
    }
    
    // In real implementation, would ping the integration's API
    // For now, simulate successful test
    
    const latency = Math.floor(Math.random() * 200) + 50;
    
    return {
      success: true,
      message: "Connection test successful",
      latency,
    };
  } catch (error) {
    console.error("Failed to test integration:", error);
    return {
      success: false,
      message: `Connection test failed: ${error}`,
    };
  }
}

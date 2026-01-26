/**
 * Location-Based Insights
 * 
 * Correlate places with energy patterns
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { saveLocationData, type LocationData as CorrelationLocationData } from "@/app/services/correlation-engine";

const STORAGE_KEY = "@energy_today:location_data";
const PLACES_KEY = "@energy_today:places";
const LOCATION_PERMISSION_DENIED_KEY = "@energy_today:location_permission_denied";

export interface LocationData {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  latitude: number;
  longitude: number;
  placeName?: string;
  placeType?: string;
  energyLevel: number; // 0-100
}

export interface Place {
  id: string;
  name: string;
  type: "home" | "work" | "gym" | "cafe" | "other";
  latitude: number;
  longitude: number;
  radius: number; // meters
  visits: number;
  averageEnergy: number;
  lastVisit: string; // ISO timestamp
}

export interface LocationInsights {
  topEnergyPlaces: Place[];
  lowEnergyPlaces: Place[];
  mostVisitedPlaces: Place[];
  recommendations: string[];
  patterns: {
    morningLocation: string;
    afternoonLocation: string;
    eveningLocation: string;
  };
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    // Check if user previously denied permission
    const denied = await AsyncStorage.getItem(LOCATION_PERMISSION_DENIED_KEY);
    if (denied === "true") {
      return false;
    }
    
    // Check current permission status first
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    if (existingStatus === "granted") {
      return true;
    } else if (existingStatus === "denied") {
      // User previously denied, don't ask again
      await AsyncStorage.setItem(LOCATION_PERMISSION_DENIED_KEY, "true");
      return false;
    }
    
    // Ask for permission (only once)
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      // User denied, save it and don't ask again
      await AsyncStorage.setItem(LOCATION_PERMISSION_DENIED_KEY, "true");
    }
    return status === "granted";
  } catch (error) {
    console.error("Failed to request location permissions:", error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
}

/**
 * Log location with energy
 */
export async function logLocationEnergy(energyLevel: number): Promise<void> {
  try {
    const location = await getCurrentLocation();
    if (!location) return;

    const data = await getLocationData();
    const now = new Date();

    const entry: LocationData = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      latitude: location.latitude,
      longitude: location.longitude,
      energyLevel,
    };

    // Try to match with known places
    const places = await getPlaces();
    const matchedPlace = places.find((p) =>
      isWithinRadius(location.latitude, location.longitude, p.latitude, p.longitude, p.radius)
    );

    if (matchedPlace) {
      entry.placeName = matchedPlace.name;
      entry.placeType = matchedPlace.type;
    }

    data.push(entry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Also save to correlation engine
    const correlationData: CorrelationLocationData = {
      date: entry.date,
      location: entry.placeName || entry.placeType || "unknown",
      duration: 60, // Default 1 hour, can be improved with actual tracking
      energyLevel: energyLevel,
    };
    
    await saveLocationData(correlationData);
  } catch (error) {
    console.error("Failed to log location energy:", error);
    throw error;
  }
}

/**
 * Get all location data
 */
export async function getLocationData(): Promise<LocationData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get location data:", error);
  }
  return [];
}

/**
 * Get all places
 */
export async function getPlaces(): Promise<Place[]> {
  try {
    const data = await AsyncStorage.getItem(PLACES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get places:", error);
  }
  return [];
}

/**
 * Add place
 */
export async function addPlace(place: Omit<Place, "id" | "visits" | "averageEnergy" | "lastVisit">): Promise<void> {
  try {
    const places = await getPlaces();
    const newPlace: Place = {
      ...place,
      id: Date.now().toString(),
      visits: 0,
      averageEnergy: 0,
      lastVisit: new Date().toISOString(),
    };
    places.push(newPlace);
    await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(places));
  } catch (error) {
    console.error("Failed to add place:", error);
    throw error;
  }
}

/**
 * Update place
 */
export async function updatePlace(id: string, updates: Partial<Place>): Promise<void> {
  try {
    const places = await getPlaces();
    const index = places.findIndex((p) => p.id === id);
    if (index !== -1) {
      places[index] = { ...places[index], ...updates };
      await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(places));
    }
  } catch (error) {
    console.error("Failed to update place:", error);
    throw error;
  }
}

/**
 * Delete place
 */
export async function deletePlace(id: string): Promise<void> {
  try {
    const places = await getPlaces();
    const filtered = places.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete place:", error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if location is within radius
 */
function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
}

/**
 * Analyze location-energy patterns
 */
export async function analyzeLocationInsights(): Promise<LocationInsights> {
  const locationData = await getLocationData();
  const places = await getPlaces();

  // Update place statistics
  const placeStats: { [id: string]: { energies: number[]; visits: number } } = {};

  for (const entry of locationData) {
    if (entry.placeName) {
      const place = places.find((p) => p.name === entry.placeName);
      if (place) {
        if (!placeStats[place.id]) {
          placeStats[place.id] = { energies: [], visits: 0 };
        }
        placeStats[place.id].energies.push(entry.energyLevel);
        placeStats[place.id].visits++;
      }
    }
  }

  // Update places with calculated stats
  for (const place of places) {
    if (placeStats[place.id]) {
      const stats = placeStats[place.id];
      place.visits = stats.visits;
      place.averageEnergy =
        Math.round(stats.energies.reduce((sum, e) => sum + e, 0) / stats.energies.length);
    }
  }

  // Sort places
  const topEnergyPlaces = [...places]
    .filter((p) => p.visits >= 2)
    .sort((a, b) => b.averageEnergy - a.averageEnergy)
    .slice(0, 5);

  const lowEnergyPlaces = [...places]
    .filter((p) => p.visits >= 2)
    .sort((a, b) => a.averageEnergy - b.averageEnergy)
    .slice(0, 5);

  const mostVisitedPlaces = [...places]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  // Analyze time-based patterns
  const timePatterns = {
    morning: [] as string[],
    afternoon: [] as string[],
    evening: [] as string[],
  };

  for (const entry of locationData) {
    if (!entry.placeName) continue;

    const hour = parseInt(entry.time.split(":")[0]);
    if (hour < 12) timePatterns.morning.push(entry.placeName);
    else if (hour < 18) timePatterns.afternoon.push(entry.placeName);
    else timePatterns.evening.push(entry.placeName);
  }

  const getMostCommon = (arr: string[]): string => {
    if (arr.length === 0) return "Unknown";
    const counts: { [key: string]: number } = {};
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  };

  const patterns = {
    morningLocation: getMostCommon(timePatterns.morning),
    afternoonLocation: getMostCommon(timePatterns.afternoon),
    eveningLocation: getMostCommon(timePatterns.evening),
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (topEnergyPlaces.length > 0) {
    recommendations.push(
      `Your energy is highest at ${topEnergyPlaces[0].name} - consider scheduling important tasks there`
    );
  }

  if (lowEnergyPlaces.length > 0 && lowEnergyPlaces[0].averageEnergy < 50) {
    recommendations.push(
      `${lowEnergyPlaces[0].name} tends to drain your energy - limit time there when possible`
    );
  }

  if (patterns.afternoonLocation !== "Unknown") {
    recommendations.push(
      `You're usually at ${patterns.afternoonLocation} in the afternoon - optimize this time for your energy patterns`
    );
  }

  return {
    topEnergyPlaces,
    lowEnergyPlaces,
    mostVisitedPlaces,
    recommendations,
    patterns,
  };
}

/**
 * Auto-detect and suggest places
 */
export async function suggestPlaces(): Promise<Array<{
  latitude: number;
  longitude: number;
  frequency: number;
  suggestedName: string;
}>> {
  const locationData = await getLocationData();
  const places = await getPlaces();

  // Cluster locations
  const clusters: Array<{
    lat: number;
    lon: number;
    count: number;
  }> = [];

  for (const entry of locationData) {
    // Skip if already matched to a place
    if (entry.placeName) continue;

    // Find nearby cluster
    const nearbyCluster = clusters.find((c) =>
      isWithinRadius(entry.latitude, entry.longitude, c.lat, c.lon, 100)
    );

    if (nearbyCluster) {
      nearbyCluster.count++;
    } else {
      clusters.push({
        lat: entry.latitude,
        lon: entry.longitude,
        count: 1,
      });
    }
  }

  // Suggest places with 3+ visits
  const suggestions = clusters
    .filter((c) => c.count >= 3)
    .map((c, index) => ({
      latitude: c.lat,
      longitude: c.lon,
      frequency: c.count,
      suggestedName: `Location ${index + 1}`,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return suggestions;
}

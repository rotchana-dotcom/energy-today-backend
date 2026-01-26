/**
 * Weather API Service
 * 
 * Automatically fetches daily weather data based on user location
 * and stores it in the correlation engine.
 * 
 * Uses Open-Meteo API (completely free, no API key required)
 * https://open-meteo.com/
 */

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveWeatherData } from "@/lib/weather-correlation";

const LOCATION_PERMISSION_DENIED_KEY = "@energy_today:location_permission_denied";

// ============================================================================
// Types
// ============================================================================

interface OpenMeteoResponse {
  current: {
    temperature_2m: number; // Celsius
    relative_humidity_2m: number; // %
    surface_pressure: number; // hPa
    wind_speed_10m: number; // km/h
    weather_code: number; // WMO Weather interpretation code
  };
}

export interface WeatherData {
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
  temperature: number; // Celsius
  humidity: number;
  pressure: number;
  windSpeed: number;
}

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map WMO Weather codes to our simplified conditions
 * https://open-meteo.com/en/docs
 */
function mapWeatherCondition(weatherCode: number): WeatherData["condition"] {
  // Clear sky (0)
  if (weatherCode === 0) {
    return "sunny";
  }
  
  // Mainly clear, partly cloudy, overcast (1-3)
  if (weatherCode >= 1 && weatherCode <= 3) {
    return "cloudy";
  }
  
  // Fog (45, 48)
  if (weatherCode === 45 || weatherCode === 48) {
    return "foggy";
  }
  
  // Drizzle (51, 53, 55, 56, 57)
  if (weatherCode >= 51 && weatherCode <= 57) {
    return "rainy";
  }
  
  // Rain (61, 63, 65, 66, 67, 80, 81, 82)
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return "rainy";
  }
  
  // Snow (71, 73, 75, 77, 85, 86)
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return "snowy";
  }
  
  // Thunderstorm (95, 96, 99)
  if (weatherCode >= 95 && weatherCode <= 99) {
    return "stormy";
  }
  
  // Default
  return "cloudy";
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Fetch current weather for user's location
 */
export async function fetchCurrentWeather(): Promise<WeatherData | null> {
  try {
    // Check if user previously denied permission
    const denied = await AsyncStorage.getItem(LOCATION_PERMISSION_DENIED_KEY);
    if (denied === "true") {
      return null;
    }
    
    // Check current permission status first
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    // If already granted, use it
    if (existingStatus === "granted") {
      // Permission granted, continue
    } else if (existingStatus === "denied") {
      // User previously denied, don't ask again
      await AsyncStorage.setItem(LOCATION_PERMISSION_DENIED_KEY, "true");
      return null;
    } else {
      // Ask for permission (only once)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // User denied, save it and don't ask again
        await AsyncStorage.setItem(LOCATION_PERMISSION_DENIED_KEY, "true");
        console.warn("Location permission not granted");
        return null;
      }
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const { latitude, longitude } = location.coords;
    
    // Fetch weather data from Open-Meteo (no API key needed!)
    const url = `${API_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: OpenMeteoResponse = await response.json();
    
    // Parse and return weather data
    const weatherData: WeatherData = {
      condition: mapWeatherCondition(data.current.weather_code),
      temperature: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      windSpeed: Math.round(data.current.wind_speed_10m),
    };
    
    return weatherData;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
}

/**
 * Fetch and save today's weather to correlation engine
 */
export async function fetchAndSaveWeather(): Promise<boolean> {
  try {
    const weatherData = await fetchCurrentWeather();
    
    if (!weatherData) {
      return false;
    }
    
    // Save to correlation engine
    const today = new Date().toISOString().split('T')[0];
    await saveWeatherData({
      date: today,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      pressure: weatherData.pressure,
      condition: weatherData.condition,
      windSpeed: weatherData.windSpeed,
    });
    
    return true;
  } catch (error) {
    console.error("Failed to fetch and save weather:", error);
    return false;
  }
}

/**
 * Get weather icon emoji based on condition
 */
export function getWeatherIcon(condition: WeatherData["condition"]): string {
  const icons: Record<WeatherData["condition"], string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    stormy: "⛈️",
    snowy: "❄️",
    foggy: "🌫️",
  };
  
  return icons[condition] || "☁️";
}

/**
 * Get weather description
 */
export function getWeatherDescription(condition: WeatherData["condition"]): string {
  const descriptions: Record<WeatherData["condition"], string> = {
    sunny: "Clear and sunny",
    cloudy: "Cloudy",
    rainy: "Rainy",
    stormy: "Stormy",
    snowy: "Snowy",
    foggy: "Foggy",
  };
  
  return descriptions[condition] || "Unknown";
}

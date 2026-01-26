import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveWeatherData as saveWeatherToCorrelation, type WeatherData as CorrelationWeatherData } from "@/app/services/correlation-engine";

export interface WeatherData {
  id: string;
  date: string; // ISO date string
  temperature: number; // Celsius
  humidity: number; // percentage
  pressure: number; // hPa
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy";
  windSpeed: number; // km/h
  energyLevel?: number; // User's energy on that day
  createdAt: string;
}

export interface WeatherCorrelation {
  factor: "temperature" | "humidity" | "pressure" | "condition";
  correlation: number; // -1 to 1
  strength: "strong" | "moderate" | "weak" | "none";
  description: string;
}

export interface WeatherInsight {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  recommendation?: string;
}

const STORAGE_KEY = "weather_data";

/**
 * Save weather data
 */
export async function saveWeatherData(data: Omit<WeatherData, "id" | "createdAt">): Promise<void> {
  try {
    const weatherData: WeatherData = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const allData = await getWeatherData();
    
    // Check if data for this date already exists
    const existingIndex = allData.findIndex(
      (d) => new Date(d.date).toDateString() === new Date(data.date).toDateString()
    );

    if (existingIndex !== -1) {
      // Update existing
      allData[existingIndex] = { ...allData[existingIndex], ...weatherData };
    } else {
      // Add new
      allData.push(weatherData);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    
    // Also save to correlation engine
    const correlationData: CorrelationWeatherData = {
      date: data.date,
      condition: data.condition,
      temperature: data.temperature,
      humidity: data.humidity,
    };
    
    await saveWeatherToCorrelation(correlationData);
  } catch (error) {
    console.error("Failed to save weather data:", error);
    throw error;
  }
}

/**
 * Get all weather data
 */
export async function getWeatherData(): Promise<WeatherData[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get weather data:", error);
    return [];
  }
}

/**
 * Get weather data for a specific date
 */
export async function getWeatherForDate(date: Date): Promise<WeatherData | null> {
  const allData = await getWeatherData();
  return (
    allData.find(
      (d) => new Date(d.date).toDateString() === date.toDateString()
    ) || null
  );
}

/**
 * Get recent weather data
 */
export async function getRecentWeatherData(days: number = 30): Promise<WeatherData[]> {
  const allData = await getWeatherData();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return allData
    .filter((d) => new Date(d.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Calculate correlation between weather factors and energy
 */
export async function calculateWeatherCorrelations(): Promise<WeatherCorrelation[]> {
  const data = await getWeatherData();
  const dataWithEnergy = data.filter((d) => d.energyLevel !== undefined);

  if (dataWithEnergy.length < 5) {
    return [];
  }

  const correlations: WeatherCorrelation[] = [];

  // Temperature correlation
  const tempCorr = calculateCorrelation(
    dataWithEnergy.map((d) => d.temperature),
    dataWithEnergy.map((d) => d.energyLevel!)
  );
  correlations.push({
    factor: "temperature",
    correlation: tempCorr,
    strength: getCorrelationStrength(tempCorr),
    description: getTemperatureDescription(tempCorr),
  });

  // Humidity correlation
  const humidityCorr = calculateCorrelation(
    dataWithEnergy.map((d) => d.humidity),
    dataWithEnergy.map((d) => d.energyLevel!)
  );
  correlations.push({
    factor: "humidity",
    correlation: humidityCorr,
    strength: getCorrelationStrength(humidityCorr),
    description: getHumidityDescription(humidityCorr),
  });

  // Pressure correlation
  const pressureCorr = calculateCorrelation(
    dataWithEnergy.map((d) => d.pressure),
    dataWithEnergy.map((d) => d.energyLevel!)
  );
  correlations.push({
    factor: "pressure",
    correlation: pressureCorr,
    strength: getCorrelationStrength(pressureCorr),
    description: getPressureDescription(pressureCorr),
  });

  return correlations;
}

/**
 * Calculate correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Get correlation strength label
 */
function getCorrelationStrength(correlation: number): "strong" | "moderate" | "weak" | "none" {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return "strong";
  if (abs >= 0.4) return "moderate";
  if (abs >= 0.2) return "weak";
  return "none";
}

/**
 * Get temperature correlation description
 */
function getTemperatureDescription(correlation: number): string {
  if (correlation > 0.5) {
    return "Your energy increases with warmer temperatures";
  } else if (correlation < -0.5) {
    return "Your energy decreases in warmer weather - you prefer cooler temperatures";
  } else if (correlation > 0.2) {
    return "You tend to have slightly more energy in warmer weather";
  } else if (correlation < -0.2) {
    return "You tend to have slightly less energy in warmer weather";
  } else {
    return "Temperature doesn't significantly affect your energy";
  }
}

/**
 * Get humidity correlation description
 */
function getHumidityDescription(correlation: number): string {
  if (correlation > 0.5) {
    return "Higher humidity boosts your energy";
  } else if (correlation < -0.5) {
    return "High humidity drains your energy - you prefer drier air";
  } else if (correlation > 0.2) {
    return "You have slightly more energy in humid conditions";
  } else if (correlation < -0.2) {
    return "You have slightly less energy when humidity is high";
  } else {
    return "Humidity doesn't significantly affect your energy";
  }
}

/**
 * Get pressure correlation description
 */
function getPressureDescription(correlation: number): string {
  if (correlation > 0.5) {
    return "High atmospheric pressure boosts your energy";
  } else if (correlation < -0.5) {
    return "Low pressure (stormy weather) drains your energy";
  } else if (correlation > 0.2) {
    return "You have slightly more energy in high pressure systems";
  } else if (correlation < -0.2) {
    return "You have slightly less energy in low pressure systems";
  } else {
    return "Atmospheric pressure doesn't significantly affect your energy";
  }
}

/**
 * Get weather insights
 */
export async function getWeatherInsights(): Promise<WeatherInsight[]> {
  const correlations = await calculateWeatherCorrelations();
  const insights: WeatherInsight[] = [];

  if (correlations.length === 0) {
    insights.push({
      type: "neutral",
      title: "Not Enough Data",
      description: "Track your energy for at least 5 days with different weather conditions to discover patterns",
    });
    return insights;
  }

  // Temperature insights
  const tempCorr = correlations.find((c) => c.factor === "temperature");
  if (tempCorr && Math.abs(tempCorr.correlation) >= 0.4) {
    if (tempCorr.correlation > 0) {
      insights.push({
        type: "positive",
        title: "Warm Weather Booster",
        description: "You thrive in warmer temperatures",
        recommendation: "Plan important activities on warmer days",
      });
    } else {
      insights.push({
        type: "negative",
        title: "Heat Sensitive",
        description: "Your energy drops in warm weather",
        recommendation: "Stay hydrated and cool on hot days, schedule demanding tasks for cooler periods",
      });
    }
  }

  // Humidity insights
  const humidityCorr = correlations.find((c) => c.factor === "humidity");
  if (humidityCorr && Math.abs(humidityCorr.correlation) >= 0.4) {
    if (humidityCorr.correlation < 0) {
      insights.push({
        type: "negative",
        title: "Humidity Sensitive",
        description: "High humidity drains your energy",
        recommendation: "Use air conditioning or dehumidifiers on humid days",
      });
    }
  }

  // Pressure insights
  const pressureCorr = correlations.find((c) => c.factor === "pressure");
  if (pressureCorr && Math.abs(pressureCorr.correlation) >= 0.4) {
    if (pressureCorr.correlation < 0) {
      insights.push({
        type: "negative",
        title: "Weather-Sensitive",
        description: "Low pressure systems (storms) affect your energy",
        recommendation: "Be extra gentle with yourself on stormy days, adjust expectations",
      });
    }
  }

  // General insight if no strong correlations
  if (insights.length === 0) {
    insights.push({
      type: "positive",
      title: "Weather Resilient",
      description: "Your energy remains stable across different weather conditions",
    });
  }

  return insights;
}

/**
 * Get weather-based recommendations for today
 */
export async function getTodayRecommendations(
  todayWeather: Omit<WeatherData, "id" | "createdAt" | "energyLevel">
): Promise<string[]> {
  const correlations = await calculateWeatherCorrelations();
  const recommendations: string[] = [];

  if (correlations.length === 0) {
    return ["Track your energy to get personalized weather-based recommendations"];
  }

  const tempCorr = correlations.find((c) => c.factor === "temperature");
  if (tempCorr && tempCorr.correlation < -0.4 && todayWeather.temperature > 25) {
    recommendations.push("🌡️ Hot day ahead - stay hydrated and take breaks in cool spaces");
  } else if (tempCorr && tempCorr.correlation > 0.4 && todayWeather.temperature < 15) {
    recommendations.push("🌡️ Cool day - you may have lower energy, plan lighter activities");
  }

  const humidityCorr = correlations.find((c) => c.factor === "humidity");
  if (humidityCorr && humidityCorr.correlation < -0.4 && todayWeather.humidity > 70) {
    recommendations.push("💧 High humidity today - use AC if possible, avoid strenuous activities");
  }

  const pressureCorr = correlations.find((c) => c.factor === "pressure");
  if (pressureCorr && pressureCorr.correlation < -0.4 && todayWeather.pressure < 1010) {
    recommendations.push("⛈️ Low pressure system - be patient with yourself, prioritize rest");
  }

  if (todayWeather.condition === "sunny" && recommendations.length === 0) {
    recommendations.push("☀️ Beautiful day - great conditions for outdoor activities!");
  }

  if (recommendations.length === 0) {
    recommendations.push("Weather conditions are favorable for your energy today");
  }

  return recommendations;
}

/**
 * Get condition emoji
 */
export function getConditionEmoji(condition: string): string {
  switch (condition) {
    case "sunny":
      return "☀️";
    case "cloudy":
      return "☁️";
    case "rainy":
      return "🌧️";
    case "stormy":
      return "⛈️";
    case "snowy":
      return "❄️";
    case "foggy":
      return "🌫️";
    default:
      return "🌤️";
  }
}

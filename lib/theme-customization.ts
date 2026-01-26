/**
 * Theme Customization
 * 
 * Store and apply custom theme settings
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@energy_today:theme_customization";

export interface ThemeCustomization {
  accentColor: string;
  contrast: "normal" | "high" | "low";
  customColors?: {
    primary?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
}

export const PRESET_COLORS = [
  { name: "Ocean Blue", value: "#0A7EA4" }, // Default
  { name: "Forest Green", value: "#10B981" },
  { name: "Sunset Orange", value: "#F59E0B" },
  { name: "Royal Purple", value: "#8B5CF6" },
  { name: "Cherry Red", value: "#EF4444" },
  { name: "Sky Blue", value: "#06B6D4" },
  { name: "Rose Pink", value: "#EC4899" },
  { name: "Lime Green", value: "#84CC16" },
];

/**
 * Get theme customization
 */
export async function getThemeCustomization(): Promise<ThemeCustomization> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to get theme customization:", error);
  }

  // Return default
  return {
    accentColor: "#0A7EA4",
    contrast: "normal",
  };
}

/**
 * Save theme customization
 */
export async function saveThemeCustomization(theme: ThemeCustomization): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error("Failed to save theme customization:", error);
    throw error;
  }
}

/**
 * Update accent color
 */
export async function updateAccentColor(color: string): Promise<void> {
  const theme = await getThemeCustomization();
  theme.accentColor = color;
  await saveThemeCustomization(theme);
}

/**
 * Update contrast level
 */
export async function updateContrast(contrast: ThemeCustomization["contrast"]): Promise<void> {
  const theme = await getThemeCustomization();
  theme.contrast = contrast;
  await saveThemeCustomization(theme);
}

/**
 * Reset to default theme
 */
export async function resetTheme(): Promise<void> {
  await saveThemeCustomization({
    accentColor: "#0A7EA4",
    contrast: "normal",
  });
}

/**
 * Get contrast multiplier for colors
 */
export function getContrastMultiplier(contrast: ThemeCustomization["contrast"]): number {
  switch (contrast) {
    case "high":
      return 1.3;
    case "low":
      return 0.7;
    default:
      return 1.0;
  }
}

/**
 * Adjust color brightness for contrast
 */
export function adjustColorContrast(color: string, contrast: ThemeCustomization["contrast"]): string {
  if (contrast === "normal") return color;

  const multiplier = getContrastMultiplier(contrast);
  
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (value: number) => {
    if (contrast === "high") {
      // Increase contrast: make dark darker, light lighter
      return value > 128 
        ? Math.min(255, Math.round(value * multiplier))
        : Math.max(0, Math.round(value / multiplier));
    } else {
      // Decrease contrast: move towards middle
      return Math.round(128 + (value - 128) * multiplier);
    }
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

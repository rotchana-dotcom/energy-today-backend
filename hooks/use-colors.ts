import { Colors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";
import { useState, useEffect } from "react";
import { isADHDModeEnabled } from "@/lib/adhd-mode";
import { getADHDColors } from "@/lib/adhd-theme";

/**
 * Returns the current theme's color palette.
 * Usage: const colors = useColors(); then colors.text, colors.background, etc.
 * Automatically switches to high-contrast ADHD-friendly colors when ADHD mode is enabled.
 */
export function useColors(colorSchemeOverride?: ColorScheme): ThemeColorPalette {
  const colorSchema = useColorScheme();
  const scheme = (colorSchemeOverride ?? colorSchema ?? "light") as ColorScheme;
  const [adhdMode, setAdhdMode] = useState(false);

  useEffect(() => {
    isADHDModeEnabled().then(setAdhdMode);
  }, []);

  if (adhdMode) {
    return getADHDColors(scheme);
  }

  return Colors[scheme];
}

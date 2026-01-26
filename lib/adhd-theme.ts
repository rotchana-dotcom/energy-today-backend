/**
 * ADHD-Friendly High Contrast Theme
 * 
 * Provides high contrast colors and simplified visual hierarchy
 * for users with ADHD or visual processing challenges.
 */

export interface ADHDThemeColors {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  tint: string;
  text: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

/**
 * High contrast color palette for ADHD-friendly mode
 */
export const adhdThemeColors: { light: ADHDThemeColors; dark: ADHDThemeColors } = {
  light: {
    primary: '#0066CC',        // Stronger blue
    background: '#FFFFFF',     // Pure white
    surface: '#F0F0F0',        // Light gray
    foreground: '#000000',     // Pure black
    muted: '#555555',          // Dark gray
    border: '#000000',         // Black borders
    success: '#008000',        // Strong green
    warning: '#FF8C00',        // Dark orange
    error: '#CC0000',          // Strong red
    tint: '#0066CC',
    text: '#000000',
    icon: '#555555',
    tabIconDefault: '#555555',
    tabIconSelected: '#0066CC',
  },
  dark: {
    primary: '#00BFFF',        // Bright blue
    background: '#000000',     // Pure black
    surface: '#1A1A1A',        // Very dark gray
    foreground: '#FFFFFF',     // Pure white
    muted: '#CCCCCC',          // Light gray
    border: '#FFFFFF',         // White borders
    success: '#00FF00',        // Bright green
    warning: '#FFA500',        // Bright orange
    error: '#FF0000',          // Bright red
    tint: '#00BFFF',
    text: '#FFFFFF',
    icon: '#CCCCCC',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#00BFFF',
  },
};

/**
 * Get ADHD-friendly colors for current color scheme
 */
export function getADHDColors(colorScheme: 'light' | 'dark'): ADHDThemeColors {
  return adhdThemeColors[colorScheme];
}

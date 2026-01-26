import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Hook to get the navigation bar height
 * Use this to add bottom padding to scrollable content so it doesn't get hidden behind the nav bar
 * 
 * @example
 * const navBarHeight = useNavBarHeight();
 * <ScrollView contentContainerStyle={{ paddingBottom: navBarHeight }}>
 */
export function useNavBarHeight(): number {
  const insets = useSafeAreaInsets();
  
  // Nav bar height calculation:
  // - Top/bottom padding: 12px each = 24px
  // - Button height: ~40px (py-2.5 + text + icon)
  // - Safe area bottom inset (for iPhone notch, etc.)
  const navBarHeight = 24 + 40 + Math.max(insets.bottom, 8);
  
  return navBarHeight;
}

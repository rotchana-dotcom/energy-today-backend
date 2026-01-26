import { useRef, useCallback } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/**
 * Hook to enable auto-hide navigation on scroll
 * 
 * Usage in a screen:
 * ```tsx
 * const { onScroll } = useAutoHideNav();
 * 
 * <ScrollView onScroll={onScroll} scrollEventThrottle={16}>
 *   ...
 * </ScrollView>
 * ```
 */
export function useAutoHideNav() {
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<"up" | "down">("up");

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - lastScrollY.current;

    // Ignore very small movements
    if (Math.abs(delta) < 5) return;

    const newDirection = delta > 0 ? "down" : "up";

    // Only trigger if direction changed
    if (newDirection !== scrollDirection.current) {
      scrollDirection.current = newDirection;

      if (newDirection === "down" && currentScrollY > 50) {
        // Scrolling down and not at top - hide nav
        if ((global as any).hideNavBar) {
          (global as any).hideNavBar();
        }
      } else if (newDirection === "up") {
        // Scrolling up - show nav
        if ((global as any).showNavBar) {
          (global as any).showNavBar();
        }
      }
    }

    // Always show when at top
    if (currentScrollY < 10) {
      if ((global as any).showNavBar) {
        (global as any).showNavBar();
      }
    }

    lastScrollY.current = currentScrollY;
  }, []);

  return { onScroll };
}

import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncWidgetEntries } from "@/lib/quick-add-widget";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { ProfileProvider } from "@/lib/profile-context";
import { ErrorBoundary } from "@/components/error-boundary";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { initializeRevenueCat } from "@/lib/revenuecat-billing";
import { shouldShowExpirationWarning, getWarningMessage } from "@/lib/expiration-warnings";
import { Alert } from "react-native";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  const router = useRouter();

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
    // Sync widget entries on app launch
    syncWidgetEntries();
    
    // Initialize RevenueCat for in-app purchases
    initializeRevenueCat().catch((error) => {
      console.error("[RevenueCat] Failed to initialize:", error);
    });
    
    // Check for expiration warnings (5-7 days before Pro access expires)
    setTimeout(async () => {
      const warning = await shouldShowExpirationWarning();
      if (warning) {
        const { title, message, actionText } = getWarningMessage(warning);
        Alert.alert(
          title,
          message,
          [
            { text: "Later", style: "cancel" },
            {
              text: actionText,
              onPress: () => router.push("/upgrade"),
            },
          ]
        );
      }
    }, 2000); // Show after 2 seconds to avoid blocking app launch
    
    // Cancel all old notifications to prevent "Unmatched Route" errors
    // Old notifications don't have route field, so we clear them on startup
    if (Platform.OS !== "web") {
      Notifications.cancelAllScheduledNotificationsAsync().catch((error) => {
        console.error('[Notifications] Failed to cancel old notifications:', error);
      });
      
      // Set up notification categories with action buttons
      Notifications.setNotificationCategoryAsync('outcome_logging', [
        {
          identifier: 'great',
          buttonTitle: '😊 Great',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'good',
          buttonTitle: '🙂 Good',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'ok',
          buttonTitle: '😐 OK',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'bad',
          buttonTitle: '😞 Bad',
          options: { opensAppToForeground: false },
        },
      ]).catch((error) => {
        console.error('[Notifications] Failed to set notification category:', error);
      });
    }
  }, []);

  // Handle notification action buttons (outcome logging)
  useEffect(() => {
    if (Platform.OS === "web") return;

    const actionSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionIdentifier = response.actionIdentifier;
      
      // Handle outcome logging actions
      if (['great', 'good', 'ok', 'bad'].includes(actionIdentifier)) {
        try {
          const outcome = actionIdentifier as 'great' | 'good' | 'ok' | 'bad';
          const data = response.notification.request.content.data;
          const today = new Date().toISOString().split('T')[0];
          
          // Log outcome to AsyncStorage
          const outcomeData = {
            date: today,
            outcome,
            notes: data.taskTitle ? `Quick log from notification: ${data.taskTitle}` : 'Quick log from notification',
            timestamp: new Date().toISOString(),
          };
          
          // Get existing outcomes
          const existingData = await AsyncStorage.getItem('daily_outcomes');
          const outcomes = existingData ? JSON.parse(existingData) : [];
          
          // Add new outcome
          outcomes.push(outcomeData);
          
          // Save back to storage
          await AsyncStorage.setItem('daily_outcomes', JSON.stringify(outcomes));
          
          console.log(`[Notification] Logged outcome: ${outcome}`);
          
          // Show success notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Outcome Logged ✓',
              body: `Your ${outcome} outcome has been recorded.`,
            },
            trigger: null, // Show immediately
          });
        } catch (error) {
          console.error('[Notification] Failed to log outcome:', error);
        }
      }
    });

    return () => actionSubscription.remove();
  }, []);

  // Handle notification taps (deep links)
  useEffect(() => {
    if (Platform.OS === "web") return;

    // Handle notification taps when app is in foreground or background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data;
        
        // Handle different notification types
        if (data.route) {
          // Navigate to the route specified in notification data
          // Remove any scheme prefix (manus20251227002435:///) if present
          let route = String(data.route);
          if (route.includes('://')) {
            route = route.split('://')[1] || '/';
          }
          // Ensure route starts with /
          if (!route.startsWith('/')) {
            route = '/' + route;
          }
          console.log('[Notification] Navigating to:', route);
          router.push(route as any);
        } else if (data.type === "daily_energy") {
          router.push("/(tabs)/" as any);
        } else if (data.type === "badge_unlocked") {
          router.push("/badges" as any);
        } else if (data.type === "morning_briefing" || data.type === "pre_optimal" || data.type === "optimal_now") {
          router.push("/(tabs)/" as any);
        } else if (data.type === "evening_reflection") {
          router.push("/template-journal" as any);
        } else {
          // Default: go to home if notification type is unknown
          console.log('[Notification] Unknown type, going to home:', data.type);
          router.push("/(tabs)/" as any);
        }
      } catch (error) {
        console.error('[Notification] Error handling notification:', error);
        // On error, just go to home screen
        router.push("/(tabs)/" as any);
      }
    });

    return () => subscription.remove();
  }, [router]);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProfileProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
      </ProfileProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

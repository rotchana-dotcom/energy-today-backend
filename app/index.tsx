import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router } from "expo-router";
import { getUserProfile } from "@/lib/storage";

/**
 * App Entry Point - Single Source of Truth for Routing
 * 
 * This is the ONLY place that decides whether to show onboarding or main app.
 * No other screen should redirect to onboarding.
 * 
 * Flow:
 * 1. Load profile from AsyncStorage (with timeout)
 * 2. If profile exists → Navigate to /(tabs)
 * 3. If no profile → Navigate to /onboarding/welcome
 * 4. Only navigate once (prevent loops)
 */
export default function Index() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    checkOnboardingAndRoute();
  }, []);

  const checkOnboardingAndRoute = async () => {
    // Prevent multiple navigations
    if (hasNavigated.current) {
      console.log('[Index] Already navigated, skipping');
      return;
    }

    try {
      console.log('[Index] Checking onboarding status...');
      
      // Load profile with timeout (5 seconds max)
      const profilePromise = getUserProfile();
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 5000)
      );
      
      const profile = await Promise.race([profilePromise, timeoutPromise]);
      
      if (profile && profile.onboardingComplete) {
        // User has completed onboarding
        console.log('[Index] Profile found:', profile.name);
        console.log('[Index] Navigating to main app');
        hasNavigated.current = true;
        router.replace("/(tabs)");
      } else {
        // User needs to complete onboarding
        console.log('[Index] No profile found, navigating to onboarding');
        hasNavigated.current = true;
        router.replace("/onboarding/welcome");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('[Index] Error checking onboarding:', err);
      setError('Failed to load app. Please restart.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-lg font-bold text-error mb-2">Error</Text>
        <Text className="text-sm text-muted text-center">{error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0A7EA4" />
        <Text className="text-sm text-muted mt-4">Loading...</Text>
      </View>
    );
  }

  // Should never reach here (navigation happens before loading=false)
  return null;
}

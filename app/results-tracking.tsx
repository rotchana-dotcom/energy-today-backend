/**
 * Results Tracking Screen
 * 
 * Redirects to Analytics Dashboard for tracking business outcomes and results
 */

import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ResultsTrackingScreen() {
  const colors = useColors();

  useEffect(() => {
    // Redirect to analytics dashboard after a brief moment
    const timer = setTimeout(() => {
      router.replace("/analytics-dashboard");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="text-muted mt-4">Loading Results Tracking...</Text>
    </ScreenContainer>
  );
}

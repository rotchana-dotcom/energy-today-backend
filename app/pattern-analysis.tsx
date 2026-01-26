/**
 * Pattern Analysis Screen
 * 
 * Redirects to AI Insights Dashboard for pattern analysis
 */

import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function PatternAnalysisScreen() {
  const colors = useColors();

  useEffect(() => {
    // Redirect to AI Insights dashboard after a brief moment
    const timer = setTimeout(() => {
      router.replace("/ai-insights-dashboard");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="text-muted mt-4">Loading Pattern Analysis...</Text>
    </ScreenContainer>
  );
}

/**
 * Business Timing Screen
 * 
 * Redirects to Business tab for optimal timing recommendations
 */

import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function BusinessTimingScreen() {
  const colors = useColors();

  useEffect(() => {
    // Redirect to business tab after a brief moment
    const timer = setTimeout(() => {
      router.replace("/(tabs)/business");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer className="items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="text-muted mt-4">Loading Business Timing...</Text>
    </ScreenContainer>
  );
}

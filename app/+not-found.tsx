import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Catch-all route for unmatched paths
 * Redirects to home screen instead of showing error
 */
export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after a brief moment
    const timer = setTimeout(() => {
      router.replace("/(tabs)/");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenContainer className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#0a7ea4" />
      <Text className="mt-4 text-muted">Redirecting...</Text>
    </ScreenContainer>
  );
}

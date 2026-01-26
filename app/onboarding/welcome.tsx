import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function WelcomeScreen() {
  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-center items-center gap-8">
        {/* Logo */}
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        {/* Headline */}
        <View className="items-center gap-3">
          <Text className="text-4xl font-bold text-foreground text-center">
            Understand Your Energy
          </Text>
          <Text className="text-4xl font-bold text-foreground text-center">
            Optimize Your Timing
          </Text>
        </View>

        {/* Subtext */}
        <Text className="text-base text-muted text-center max-w-sm leading-relaxed">
          Make better decisions by understanding the energy of each day and how it aligns with your personal flow.
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          onPress={() => router.push("/onboarding/profile" as any)}
          className="bg-primary px-8 py-4 rounded-full active:opacity-80 mt-4"
        >
          <Text className="text-white font-semibold text-lg">
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <Text className="text-sm text-muted text-center mt-8">
          Your data stays private on your device
        </Text>
      </View>
    </ScreenContainer>
  );
}

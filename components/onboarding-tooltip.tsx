import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface OnboardingTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingTooltip({
  step,
  totalSteps,
  title,
  description,
  onNext,
  onSkip,
}: OnboardingTooltipProps) {
  const colors = useColors();

  return (
    <View className="bg-primary rounded-2xl p-5 mx-6 mb-4">
      {/* Progress dots */}
      <View className="flex-row justify-center gap-2 mb-4">
        {[...Array(totalSteps)].map((_, i) => (
          <View
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: i === step - 1 ? "#FFFFFF" : "#FFFFFF40",
            }}
          />
        ))}
      </View>

      {/* Content */}
      <Text className="text-lg font-bold text-background mb-2">{title}</Text>
      <Text className="text-sm text-background/90 leading-relaxed mb-4">
        {description}
      </Text>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSkip();
          }}
          className="flex-1 py-3 rounded-lg border border-background/30 active:opacity-70"
        >
          <Text className="text-center text-sm font-semibold text-background">
            Skip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNext();
          }}
          className="flex-1 py-3 rounded-lg bg-background active:opacity-70"
        >
          <Text
            className="text-center text-sm font-semibold"
            style={{ color: colors.primary }}
          >
            {step === totalSteps ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

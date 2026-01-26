import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface TutorialStep {
  title: string;
  description: string;
  highlight?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
  };
}

interface FirstTimeTutorialProps {
  screenId: string; // Unique ID for this screen (e.g., "strategic_calendar")
  steps: TutorialStep[];
  onComplete?: () => void;
}

/**
 * First-time tutorial overlay
 * Shows step-by-step instructions when a screen is opened for the first time
 * Stores completion state in AsyncStorage
 */
export function FirstTimeTutorial({ screenId, steps, onComplete }: FirstTimeTutorialProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const key = `@tutorial_completed_${screenId}`;
      const completed = await AsyncStorage.getItem(key);
      
      if (!completed) {
        // First time - show tutorial
        setVisible(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to check tutorial status:", error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      const key = `@tutorial_completed_${screenId}`;
      await AsyncStorage.setItem(key, "true");
      setVisible(false);
      onComplete?.();
    } catch (error) {
      console.error("Failed to save tutorial completion:", error);
    }
  };

  if (loading || !visible) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Dark overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {/* Tutorial card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: "100%",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Step indicator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 16,
              gap: 6,
            }}
          >
            {steps.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentStep ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>

          {/* Content */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.foreground,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {step.title}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: colors.muted,
              lineHeight: 22,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {step.description}
          </Text>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={handleSkip}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.muted,
                }}
              >
                Skip
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {isLastStep ? "Got it!" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

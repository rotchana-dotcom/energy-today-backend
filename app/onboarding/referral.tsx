/**
 * Referral Code Entry Screen
 * Optional step during onboarding where new users can enter a referral code
 * Both referrer and referee get +7 days of Pro trial
 */

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { applyReferralCode } from "@/lib/referral-system";
import { getUserProfile } from "@/lib/storage";
import * as Haptics from "expo-haptics";

export default function ReferralCodeScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Continue to main app
    router.replace("/(tabs)" as any);
  };

  const handleApplyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Enter Code", "Please enter a referral code or skip this step");
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const profile = await getUserProfile();
      if (!profile) {
        Alert.alert("Error", "Please complete your profile first");
        setLoading(false);
        return;
      }

      const result = await applyReferralCode(code, profile.name);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "🎉 Bonus Unlocked!",
          `You got ${result.bonusDays} extra days of Pro features!\n\nYour trial is now ${7 + (result.bonusDays || 0)} days total.`,
          [
            {
              text: "Awesome!",
              onPress: () => router.replace("/(tabs)" as any),
            },
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Invalid Code", result.error || "This referral code is not valid");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to apply referral code:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to apply referral code. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 justify-center gap-8">
        {/* Header */}
        <View className="items-center gap-3">
          <Text className="text-5xl">🎁</Text>
          <Text className="text-3xl font-bold text-foreground text-center">
            Got a Referral Code?
          </Text>
          <Text className="text-base text-muted text-center leading-relaxed">
            Enter your friend's code and you'll both get{" "}
            <Text className="font-bold text-primary">1 extra week</Text> of Pro features!
          </Text>
        </View>

        {/* Code Input */}
        <View className="gap-4">
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <Text className="text-sm font-medium text-muted mb-3">REFERRAL CODE</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Enter code (e.g., SARAH2026)"
              placeholderTextColor="#9BA1A6"
              autoCapitalize="characters"
              autoCorrect={false}
              className="text-lg font-semibold text-foreground"
              editable={!loading}
            />
          </View>

          {/* Benefits List */}
          <View className="gap-2 px-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">✨</Text>
              <Text className="text-sm text-muted">
                Get <Text className="font-semibold text-foreground">14 days total</Text> instead of 7
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🤝</Text>
              <Text className="text-sm text-muted">
                Your friend gets <Text className="font-semibold text-foreground">1 extra week</Text> too
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🎯</Text>
              <Text className="text-sm text-muted">
                Try all Pro features with <Text className="font-semibold text-foreground">no credit card</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleApplyCode}
            disabled={loading}
            className="bg-primary py-4 rounded-xl active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">
                Apply Code & Get Bonus
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={loading}
            className="py-3 active:opacity-60"
          >
            <Text className="text-center text-base text-muted">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text className="text-xs text-muted text-center leading-relaxed">
          You can always enter a code later from Settings
        </Text>
      </View>
    </ScreenContainer>
  );
}

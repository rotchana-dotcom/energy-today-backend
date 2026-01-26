import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getTodaysWisdom, generateDailyWisdom, DailyWisdom } from "@/lib/daily-wisdom";

export default function DailyWisdomScreen() {
  const [loading, setLoading] = useState(true);
  const [wisdom, setWisdom] = useState<DailyWisdom | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadWisdom();
  }, []);

  const loadWisdom = async () => {
    setLoading(true);
    const todaysWisdom = await getTodaysWisdom();
    setWisdom(todaysWisdom);
    setLoading(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    const newWisdom = await generateDailyWisdom();
    setWisdom(newWisdom);
    setRegenerating(false);
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted mt-4">Loading today's wisdom...</Text>
      </ScreenContainer>
    );
  }

  if (!wisdom) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl mb-4">🔮</Text>
          <Text className="text-lg font-semibold text-foreground mb-2">No Wisdom Available</Text>
          <Text className="text-sm text-muted text-center mb-6">
            Complete your profile to receive daily wisdom
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/profile-setup" as any)}
            className="bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const confidenceColor =
    wisdom.confidence >= 80 ? "text-success" : wisdom.confidence >= 60 ? "text-warning" : "text-error";

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Today's Wisdom</Text>
          <Text className="text-sm text-muted mt-1">
            {new Date(wisdom.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Wisdom Card */}
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl">🔮</Text>
            <View className="bg-background px-3 py-1 rounded-full">
              <Text className={`text-xs font-semibold ${confidenceColor}`}>
                {wisdom.confidence}% Confidence
              </Text>
            </View>
          </View>

          <Text className="text-base text-foreground leading-relaxed">{wisdom.wisdom}</Text>
        </View>

        {/* Actionable Steps */}
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Actionable Steps</Text>
          {wisdom.actionableSteps.map((step, index) => (
            <View key={index} className="flex-row mb-3">
              <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white text-xs font-bold">{index + 1}</Text>
              </View>
              <Text className="flex-1 text-sm text-foreground leading-relaxed">{step}</Text>
            </View>
          ))}
        </View>

        {/* Regenerate Button */}
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={regenerating}
          className="bg-surface border border-border py-4 rounded-lg mb-6"
        >
          {regenerating ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-center text-primary font-semibold">🔄 Regenerate Wisdom</Text>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View className="bg-background rounded-lg p-4 mb-6">
          <Text className="text-xs text-muted text-center">
            Daily wisdom is generated using your personal profile, current energy patterns, and the 7
            spiritual timing systems. New wisdom is generated each morning at 8 AM.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

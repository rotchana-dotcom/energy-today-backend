/**
 * Share Success Story Screen
 * Let users share wins and achievements
 * Viral marketing through authentic testimonials
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { shareSuccessStory, getSuccessStoryTemplates } from "@/lib/social-sharing";

export default function ShareSuccessScreen() {
  const [customStory, setCustomStory] = useState("");
  const [energyType, setEnergyType] = useState("high-energy");

  const templates = getSuccessStoryTemplates();

  const handleShareTemplate = async (template: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await shareSuccessStory(template, energyType);
    } catch (error) {
      console.error("Failed to share:", error);
      Alert.alert("Error", "Failed to share success story");
    }
  };

  const handleShareCustom = async () => {
    if (!customStory.trim()) {
      Alert.alert("Empty Story", "Please write your success story first");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await shareSuccessStory(customStory.trim(), energyType);
      setCustomStory("");
    } catch (error) {
      console.error("Failed to share:", error);
      Alert.alert("Error", "Failed to share success story");
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Share Your Win</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Message */}
          <View className="bg-success/10 border border-success/30 rounded-2xl p-5 gap-2">
            <Text className="text-lg font-bold text-foreground">
              ✨ Celebrate Your Success!
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              Share how Energy Today helped you achieve something great. Your story helps others discover the power of timing!
            </Text>
          </View>

          {/* Quick Templates */}
          <View className="gap-3">
            <Text className="text-sm font-medium text-muted">QUICK TEMPLATES</Text>
            
            <View className="gap-2">
              {templates.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleShareTemplate(item.template)}
                  className="bg-surface rounded-xl p-4 border border-border active:opacity-80"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-muted">
                        "Energy Today helped me {item.template}"
                      </Text>
                    </View>
                    <Text className="text-xl ml-3">📤</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Story */}
          <View className="gap-3">
            <Text className="text-sm font-medium text-muted">WRITE YOUR OWN</Text>
            
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-xs text-muted">
                Energy Today helped me...
              </Text>
              
              <TextInput
                value={customStory}
                onChangeText={setCustomStory}
                placeholder="e.g., land my dream job by scheduling the interview on my best day"
                placeholderTextColor="#9BA1A6"
                multiline
                numberOfLines={4}
                className="text-sm text-foreground min-h-[100px]"
                textAlignVertical="top"
              />

              <TouchableOpacity
                onPress={handleShareCustom}
                className="bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  📤 Share My Story
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Why Share */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">WHY SHARE?</Text>
            
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-xl">🎁</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Help Others</Text>
                  <Text className="text-xs text-muted mt-1">
                    Your story inspires others to optimize their timing
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-xl">🌟</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Celebrate Wins</Text>
                  <Text className="text-xs text-muted mt-1">
                    Share your achievements with friends and family
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-xl">💪</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Build Momentum</Text>
                  <Text className="text-xs text-muted mt-1">
                    Sharing success creates positive energy and motivation
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Note */}
          <Text className="text-xs text-muted text-center leading-relaxed">
            All shared stories include a link to Energy Today so your friends can get 7 days of Pro features free!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

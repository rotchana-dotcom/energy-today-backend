/**
 * Badges Screen
 * 
 * Display achievement badges and progress
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getAllBadges,
  getBadgesByCategory,
  getBadgeStats,
  type Badge,
  type BadgeCategory,
} from "@/lib/achievements";

export default function BadgesScreen() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [stats, setStats] = useState({ totalBadges: 0, earnedBadges: 0, percentage: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [badgeCategories, badgeStats] = await Promise.all([
        getBadgesByCategory(),
        getBadgeStats(),
      ]);

      setCategories(badgeCategories);
      setStats(badgeStats);
    } catch (error) {
      console.error("Failed to load badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (badge: Badge) => {
    const isEarned = badge.earned;

    return (
      <View
        key={badge.id}
        className={`p-4 rounded-xl border ${
          isEarned ? "bg-primary/10 border-primary/30" : "bg-surface border-border"
        }`}
      >
        <View className="flex-row items-center gap-3">
          <Text className={`text-4xl ${!isEarned && "opacity-30"}`}>{badge.icon}</Text>
          <View className="flex-1">
            <Text
              className={`text-base font-semibold ${
                isEarned ? "text-foreground" : "text-muted"
              }`}
            >
              {badge.name}
            </Text>
            <Text className="text-xs text-muted mt-1">{badge.description}</Text>
            {isEarned && badge.earnedAt && (
              <Text className="text-xs text-primary mt-1">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          {isEarned && <Text className="text-2xl">✓</Text>}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/more');
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Achievements</Text>
        <View className="w-16" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading badges...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Stats Card */}
            <View className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6 border border-primary/30">
              <View className="items-center">
                <Text className="text-5xl font-bold text-primary mb-2">
                  {stats.earnedBadges}/{stats.totalBadges}
                </Text>
                <Text className="text-base text-foreground font-medium">Badges Earned</Text>
                <View className="w-full h-3 bg-background rounded-full mt-4 overflow-hidden">
                  <View
                    className="h-full bg-primary"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </View>
                <Text className="text-sm text-muted mt-2">{stats.percentage}% Complete</Text>
              </View>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === null ? "bg-primary" : "bg-surface"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === null ? "text-white" : "text-foreground"
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(category.name);
                  }}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category.name ? "bg-primary" : "bg-surface"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category.name ? "text-white" : "text-foreground"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Badges by Category */}
            {categories
              .filter((cat) => !selectedCategory || cat.name === selectedCategory)
              .map((category) => (
                <View key={category.name} className="gap-3">
                  <Text className="text-lg font-bold text-foreground">{category.name}</Text>
                  <View className="gap-3">
                    {category.badges.map((badge) => renderBadge(badge))}
                  </View>
                </View>
              ))}

            {/* Empty State */}
            {categories.length === 0 && (
              <View className="items-center py-12">
                <Text className="text-6xl mb-4">🏆</Text>
                <Text className="text-lg font-semibold text-foreground">No Badges Yet</Text>
                <Text className="text-sm text-muted mt-2 text-center">
                  Start logging your energy to unlock achievements!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

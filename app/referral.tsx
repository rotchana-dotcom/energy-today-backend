/**
 * Referral Dashboard Screen
 * Shows user's referral code, stats, and sharing options
 * Turns users into a sales team with gamification
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getReferralStats, getShareMessage, type ReferralStats } from "@/lib/referral-system";

export default function ReferralScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const profile = await getUserProfile();
      if (!profile) {
        Alert.alert("Error", "Please complete your profile first");
        router.push('/(tabs)/more');
        return;
      }

      const referralStats = await getReferralStats(profile.name);
      setStats(referralStats);
    } catch (error) {
      console.error("Failed to load referral stats:", error);
      Alert.alert("Error", "Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!stats) return;
    
    await Clipboard.setStringAsync(stats.myReferralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied!", "Your referral code has been copied to clipboard");
  };

  const handleShare = async () => {
    if (!stats) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const message = getShareMessage(stats.myReferralCode);
      await Share.share({
        message,
        title: "Join me on Energy Today!",
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const getBadge = (referrals: number): { emoji: string; name: string; color: string } => {
    if (referrals >= 50) return { emoji: "💎", name: "Platinum", color: "#E5E4E2" };
    if (referrals >= 20) return { emoji: "🥇", name: "Gold", color: "#FFD700" };
    if (referrals >= 10) return { emoji: "🥈", name: "Silver", color: "#C0C0C0" };
    if (referrals >= 5) return { emoji: "🥉", name: "Bronze", color: "#CD7F32" };
    return { emoji: "⭐", name: "Starter", color: "#9BA1A6" };
  };

  const getNextBadge = (referrals: number): { target: number; name: string } => {
    if (referrals >= 50) return { target: 50, name: "Platinum" };
    if (referrals >= 20) return { target: 50, name: "Platinum" };
    if (referrals >= 10) return { target: 20, name: "Gold" };
    if (referrals >= 5) return { target: 10, name: "Silver" };
    return { target: 5, name: "Bronze" };
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  if (!stats) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-base text-muted">Failed to load referral data</Text>
      </ScreenContainer>
    );
  }

  const badge = getBadge(stats.totalReferrals);
  const nextBadge = getNextBadge(stats.totalReferrals);
  const progressToNext = stats.totalReferrals >= 50 ? 100 : (stats.totalReferrals / nextBadge.target) * 100;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Referral Program</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Message */}
          <View className="bg-primary/10 border border-primary/30 rounded-2xl p-5 gap-2">
            <Text className="text-lg font-bold text-foreground">
              🎁 Get 1 Week Free for Each Friend!
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              Share your code with friends. When they sign up, you both get{" "}
              <Text className="font-semibold text-foreground">7 extra days</Text> of Pro features!
            </Text>
          </View>

          {/* Referral Code Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">YOUR REFERRAL CODE</Text>
            
            <View className="bg-primary/10 rounded-xl p-4 items-center">
              <Text className="text-3xl font-bold text-primary tracking-wider">
                {stats.myReferralCode}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCopyCode}
                className="flex-1 bg-border py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-foreground">
                  📋 Copy Code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                className="flex-1 bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  📤 Share Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center gap-2">
              <Text className="text-3xl font-bold text-primary">{stats.totalReferrals}</Text>
              <Text className="text-xs text-muted text-center">Friends Referred</Text>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center gap-2">
              <Text className="text-3xl font-bold text-primary">{stats.bonusDaysEarned}</Text>
              <Text className="text-xs text-muted text-center">Bonus Days Earned</Text>
            </View>
          </View>

          {/* Badge Progress */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">YOUR RANK</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Text className="text-4xl">{badge.emoji}</Text>
                <View>
                  <Text className="text-lg font-bold text-foreground">{badge.name}</Text>
                  <Text className="text-xs text-muted">
                    {stats.totalReferrals >= 50 ? "Max Rank!" : `${stats.totalReferrals}/${nextBadge.target} to ${nextBadge.name}`}
                  </Text>
                </View>
              </View>
            </View>

            {stats.totalReferrals < 50 && (
              <View className="gap-2">
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progressToNext}%` }}
                  />
                </View>
                <Text className="text-xs text-muted">
                  {nextBadge.target - stats.totalReferrals} more referrals to {nextBadge.name}
                </Text>
              </View>
            )}
          </View>

          {/* Badge Tiers */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">BADGE TIERS</Text>
            
            <View className="gap-2">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">⭐</Text>
                  <Text className="text-sm text-foreground">Starter</Text>
                </View>
                <Text className="text-xs text-muted">0-4 referrals</Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🥉</Text>
                  <Text className="text-sm text-foreground">Bronze</Text>
                </View>
                <Text className="text-xs text-muted">5-9 referrals</Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🥈</Text>
                  <Text className="text-sm text-foreground">Silver</Text>
                </View>
                <Text className="text-xs text-muted">10-19 referrals</Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🥇</Text>
                  <Text className="text-sm text-foreground">Gold</Text>
                </View>
                <Text className="text-xs text-muted">20-49 referrals</Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">💎</Text>
                  <Text className="text-sm text-foreground font-bold">Platinum</Text>
                </View>
                <Text className="text-xs text-muted">50+ referrals</Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">HOW IT WORKS</Text>
            
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-2xl">1️⃣</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Share Your Code</Text>
                  <Text className="text-xs text-muted mt-1">
                    Send your unique code to friends via WhatsApp, SMS, or social media
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">2️⃣</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">They Sign Up</Text>
                  <Text className="text-xs text-muted mt-1">
                    When they download the app and enter your code during onboarding
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">3️⃣</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">You Both Win!</Text>
                  <Text className="text-xs text-muted mt-1">
                    You both get 7 extra days of Pro features instantly
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleShare}
            className="bg-primary py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-center text-base font-semibold text-white">
              🚀 Start Referring Friends
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

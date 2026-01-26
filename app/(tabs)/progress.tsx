import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { MultiProgressRings } from "@/components/progress-ring";
import { StreakBadge } from "@/components/streak-badge";
import { getAllStreaks, type StreakType } from "@/lib/streak-tracker";
import { getUserLevel } from "@/lib/gamification";
import { getBadgeStats } from "@/lib/achievements";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

export default function ProgressScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [level, setLevel] = useState({ level: 1, xp: 0, xpToNextLevel: 500, title: "Energy Novice" });
  const [badgeStats, setBadgeStats] = useState({ totalBadges: 0, earnedBadges: 0, percentage: 0 });
  const [streaks, setStreaks] = useState<any>({});
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [levelData, badgeData, streaksData] = await Promise.all([
        getUserLevel(),
        getBadgeStats(),
        getAllStreaks(),
      ]);
      
      setLevel(levelData);
      setBadgeStats(badgeData);
      setStreaks(streaksData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading progress data:", error);
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Calculate progress ring data
  const totalStreaks = Object.values(streaks).reduce((sum: number, s: any) => sum + (s?.currentStreak || 0), 0);
  const avgStreak = totalStreaks / 6 || 0; // 6 streak types
  const streakProgress = Math.min(avgStreak / 30, 1); // Max 30 days for 100%
  
  const xpProgress = level.xp / level.xpToNextLevel;
  const badgeProgress = badgeStats.totalBadges > 0 ? badgeStats.earnedBadges / badgeStats.totalBadges : 0;
  
  const rings = [
    {
      progress: xpProgress,
      label: "XP",
      value: `${Math.round(xpProgress * 100)}%`,
      color: colors.primary,
    },
    {
      progress: badgeProgress,
      label: "Badges",
      value: `${badgeStats.earnedBadges}/${badgeStats.totalBadges}`,
      color: colors.warning,
    },
    {
      progress: streakProgress,
      label: "Streaks",
      value: `${Math.round(avgStreak)}d`,
      color: colors.success,
    },
  ];
  
  // Get top 3 streaks
  const topStreaks = Object.entries(streaks)
    .map(([type, data]: [string, any]) => ({
      type: type as StreakType,
      streak: data?.currentStreak || 0,
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);
  
  return (
    <ScreenContainer className="p-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Your Progress</Text>
            <Text className="text-sm text-muted mt-1">Track your journey to mastery</Text>
          </View>
          
          {/* Progress Rings */}
          <View className="bg-surface rounded-2xl p-6 border border-border items-center">
            <MultiProgressRings rings={rings} size={200} />
            <View className="mt-4 gap-2 w-full">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">XP Progress</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {level.xp} / {level.xpToNextLevel} XP
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Badges Earned</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {badgeStats.earnedBadges} / {badgeStats.totalBadges}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Avg Streak</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {Math.round(avgStreak)} days
                </Text>
              </View>
            </View>
          </View>
          
          {/* Level Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-lg font-bold text-foreground">Level {level.level}</Text>
                <Text className="text-sm text-muted">{level.title}</Text>
              </View>
              <Text className="text-4xl">⭐</Text>
            </View>
            
            {/* XP Progress Bar */}
            <View className="bg-border rounded-full h-3 overflow-hidden">
              <View 
                className="bg-primary h-full rounded-full"
                style={{ width: `${(level.xp / level.xpToNextLevel) * 100}%` }}
              />
            </View>
            <Text className="text-xs text-muted mt-2 text-center">
              {level.xpToNextLevel - level.xp} XP to Level {level.level + 1}
            </Text>
          </View>
          
          {/* Top Streaks */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">Top Streaks</Text>
            {topStreaks.length > 0 && topStreaks.some(s => s.streak > 0) ? (
              <View className="gap-3">
                {topStreaks.filter(s => s.streak > 0).map(({ type, streak }) => (
                  <View key={type} className="flex-row items-center justify-between">
                    <Text className="text-sm text-foreground capitalize">{type}</Text>
                    <StreakBadge streak={streak} label="days" size="small" />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted text-center">
                Start logging activities to build streaks!
              </Text>
            )}
          </View>
          
          {/* Badges Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Achievement Badges</Text>
              <Text className="text-3xl">🏆</Text>
            </View>
            
            <View className="bg-border rounded-full h-3 overflow-hidden mb-3">
              <View 
                className="bg-primary h-full rounded-full"
                style={{ width: `${badgeStats.percentage}%` }}
              />
            </View>
            
            <Text className="text-sm text-muted text-center mb-4">
              {badgeStats.earnedBadges} of {badgeStats.totalBadges} badges earned ({badgeStats.percentage}%)
            </Text>
            
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/badges" as any);
              }}
              className="bg-primary py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">
                View All Badges
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Motivation Card */}
          <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30">
            <Text className="text-base font-semibold text-foreground text-center mb-2">
              Keep Going! 💪
            </Text>
            <Text className="text-sm text-muted text-center">
              Every day you log is progress. Build your streaks and unlock achievements!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

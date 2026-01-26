import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getFocusSessions, type FocusSession } from "@/lib/focus-mode";
import { getPlaces, type Place } from "@/lib/location-insights";

export default function ProductivityDashboardScreen() {
  const colors = useColors();
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    const sessions = await getFocusSessions();
    const allPlaces = await getPlaces();

    // Filter by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (timeRange === "week" ? 7 : 30));

    const filteredSessions = sessions.filter((s) => new Date(s.startTime) >= cutoffDate);
    setFocusSessions(filteredSessions);
    setPlaces(allPlaces);
  };

  // Calculate productivity metrics
  const totalFocusHours = focusSessions.reduce((sum, s) => {
    const duration = (new Date(s.endTime || Date.now()).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);

  const averageQuality = focusSessions.length > 0
    ? focusSessions.reduce((sum, s) => sum + (s.energyLevel || 0), 0) / focusSessions.length
    : 0;

  const completedSessions = focusSessions.filter((s) => s.completed).length;
  const completionRate = focusSessions.length > 0 ? (completedSessions / focusSessions.length) * 100 : 0;

  // Find best time of day
  const hourlyProductivity = Array(24).fill(0).map((_, hour) => {
    const sessionsAtHour = focusSessions.filter((s) => {
      const startHour = new Date(s.startTime).getHours();
      return startHour === hour;
    });
    const avgQuality = sessionsAtHour.length > 0
      ? sessionsAtHour.reduce((sum, s) => sum + (s.energyLevel || 0), 0) / sessionsAtHour.length
      : 0;
    return { hour, quality: avgQuality, count: sessionsAtHour.length };
  });

  const bestHour = hourlyProductivity.reduce((best, current) =>
    current.count > 0 && current.quality > best.quality ? current : best
  , { hour: 9, quality: 0, count: 0 });

  // Find best location
  const locationProductivity = places.map((place) => {
    const sessionsAtPlace = focusSessions.filter((s) => s.notes?.includes(place.name));
    const avgQuality = sessionsAtPlace.length > 0
      ? sessionsAtPlace.reduce((sum, s) => sum + (s.energyLevel || 0), 0) / sessionsAtPlace.length
      : 0;
    return { ...place, avgQuality, sessionCount: sessionsAtPlace.length };
  }).sort((a, b) => b.avgQuality - a.avgQuality);

  const bestLocation = locationProductivity[0];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Productivity Dashboard</Text>
        <Text className="text-sm text-muted mb-6">
          Analyze your focus patterns, energy levels, and optimal work environments
        </Text>

        {/* Time Range Selector */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => {
              setTimeRange("week");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className={`flex-1 p-3 rounded-xl ${
              timeRange === "week" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                timeRange === "week" ? "text-background" : "text-foreground"
              }`}
            >
              This Week
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setTimeRange("month");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className={`flex-1 p-3 rounded-xl ${
              timeRange === "month" ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                timeRange === "month" ? "text-background" : "text-foreground"
              }`}
            >
              This Month
            </Text>
          </Pressable>
        </View>

        {/* Key Metrics */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Key Metrics</Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Total Focus Time</Text>
              <Text className="text-2xl font-bold text-foreground">{totalFocusHours.toFixed(1)}h</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Average Quality</Text>
              <Text className="text-2xl font-bold text-foreground">{averageQuality.toFixed(0)}/100</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Completion Rate</Text>
              <Text className="text-2xl font-bold text-foreground">{completionRate.toFixed(0)}%</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-muted">Sessions Completed</Text>
              <Text className="text-2xl font-bold text-foreground">{completedSessions}/{focusSessions.length}</Text>
            </View>
          </View>
        </View>

        {/* Optimal Work Times */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-3">🕐 Optimal Work Times</Text>
          {bestHour.count > 0 ? (
            <>
              <View className="bg-primary/10 border border-primary rounded-lg p-3 mb-3">
                <Text className="text-primary font-semibold text-center">
                  Best Hour: {bestHour.hour}:00 - {bestHour.hour + 1}:00
                </Text>
                <Text className="text-muted text-center text-sm mt-1">
                  Average quality: {bestHour.quality.toFixed(0)}/100 ({bestHour.count} sessions)
                </Text>
              </View>
              <Text className="text-sm text-foreground leading-relaxed">
                Your focus quality peaks around {bestHour.hour}:00. Schedule your most important work during this window for maximum productivity.
              </Text>
            </>
          ) : (
            <Text className="text-muted text-center py-4">
              Complete more focus sessions to discover your optimal work times
            </Text>
          )}
        </View>

        {/* Best Locations */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-3">📍 Best Locations</Text>
          {bestLocation && bestLocation.sessionCount > 0 ? (
            <>
              <View className="bg-success/10 border border-success rounded-lg p-3 mb-3">
                <Text className="text-success font-semibold text-center">
                  {bestLocation.name}
                </Text>
                <Text className="text-muted text-center text-sm mt-1">
                  Average quality: {bestLocation.avgQuality.toFixed(0)}/100 ({bestLocation.sessionCount} sessions)
                </Text>
              </View>
              <View className="gap-2">
                {locationProductivity.slice(0, 3).map((loc, index) => (
                  loc.sessionCount > 0 && (
                    <View key={index} className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0">
                      <Text className="text-foreground">{loc.name}</Text>
                      <Text className="text-muted text-sm">{loc.avgQuality.toFixed(0)}/100</Text>
                    </View>
                  )
                ))}
              </View>
            </>
          ) : (
            <Text className="text-muted text-center py-4">
              Tag your focus sessions with locations to discover your best work environments
            </Text>
          )}
        </View>

        {/* Productivity Score */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-3">📊 Productivity Score</Text>
          <View className="items-center mb-3">
            <Text className="text-5xl font-bold text-primary">
              {Math.round((averageQuality * 0.4) + (completionRate * 0.3) + (Math.min(totalFocusHours / 40, 1) * 100 * 0.3))}
            </Text>
            <Text className="text-muted text-sm mt-1">out of 100</Text>
          </View>
          <Text className="text-sm text-foreground leading-relaxed">
            Your productivity score combines focus quality (40%), completion rate (30%), and total focus time (30%). Keep tracking to improve your score!
          </Text>
        </View>

        {/* Insights & Recommendations */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-3">💡 Insights & Recommendations</Text>
          <View className="gap-3">
            {totalFocusHours < 10 && (
              <View className="bg-warning/10 border border-warning rounded-lg p-3">
                <Text className="text-warning font-semibold">⚠️ Low Focus Time</Text>
                <Text className="text-muted text-sm mt-1">
                  You've logged {totalFocusHours.toFixed(1)} hours this {timeRange}. Aim for at least 20 hours of focused work for optimal productivity.
                </Text>
              </View>
            )}
            {completionRate < 70 && focusSessions.length > 5 && (
              <View className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-error font-semibold">❌ Low Completion Rate</Text>
                <Text className="text-muted text-sm mt-1">
                  Only {completionRate.toFixed(0)}% of your focus sessions are completed. Try shorter sessions or eliminate distractions.
                </Text>
              </View>
            )}
            {averageQuality > 80 && (
              <View className="bg-success/10 border border-success rounded-lg p-3">
                <Text className="text-success font-semibold">✅ Excellent Focus Quality</Text>
                <Text className="text-muted text-sm mt-1">
                  Your average focus quality is {averageQuality.toFixed(0)}/100. Keep up the great work!
                </Text>
              </View>
            )}
            {focusSessions.length === 0 && (
              <View className="bg-primary/10 border border-primary rounded-lg p-3">
                <Text className="text-primary font-semibold">🚀 Get Started</Text>
                <Text className="text-muted text-sm mt-1">
                  Start tracking focus sessions to unlock personalized productivity insights and recommendations.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

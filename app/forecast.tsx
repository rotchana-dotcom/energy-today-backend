import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { UserProfile } from "@/types";

interface DayForecast {
  date: Date;
  dayName: string;
  perfectDayScore: number;
  confidence: number;
  topPriority: string;
  bestFor: string[];
  avoid: string[];
  optimalTime: string;
  energyType: string;
}

export default function ForecastScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayForecast | null>(null);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) {
      router.replace("/onboarding/welcome");
      return;
    }

    setProfile(userProfile);

    // Check subscription status
    const subStatus = await getSubscriptionStatus();
    setIsPro(subStatus.isPro);

    // Generate 7-day forecast
    const forecastData: DayForecast[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const reading = calculateUnifiedEnergy(userProfile, date);
      
      forecastData.push({
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        perfectDayScore: reading.combinedAnalysis.perfectDayScore,
        confidence: reading.combinedAnalysis.confidenceScore,
        topPriority: reading.businessInsights.topPriority,
        bestFor: reading.businessInsights.bestFor,
        avoid: reading.businessInsights.avoid,
        optimalTime: reading.businessInsights.meetings.time,
        energyType: reading.combinedAnalysis.energyType,
      });
    }
    
    setForecast(forecastData);
    setLoading(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 75) return "#22C55E";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Exceptional";
    if (score >= 75) return "Optimal";
    if (score >= 60) return "Good";
    if (score >= 50) return "Moderate";
    return "Challenging";
  };

  const getBestDay = (): DayForecast | null => {
    if (forecast.length === 0) return null;
    return forecast.reduce((best, current) => 
      current.perfectDayScore > best.perfectDayScore ? current : best
    );
  };

  const getWorstDay = (): DayForecast | null => {
    if (forecast.length === 0) return null;
    return forecast.reduce((worst, current) => 
      current.perfectDayScore < worst.perfectDayScore ? current : worst
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  const bestDay = getBestDay();
  const worstDay = getWorstDay();
  const avgScore = forecast.reduce((sum, day) => sum + day.perfectDayScore, 0) / forecast.length;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">7-Day Forecast</Text>
            <Text className="text-sm text-muted mt-1">
              Strategic planning for the week ahead
            </Text>
          </View>

          {/* Week Overview */}
          <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm gap-4">
            <Text className="text-lg font-bold text-foreground">Week Overview</Text>
            
            <View className="flex-row gap-3">
              <View className="flex-1 p-4 bg-success/10 border border-success/20 rounded-xl">
                <Text className="text-2xl font-bold text-success">
                  {Math.round(avgScore)}
                </Text>
                <Text className="text-xs font-medium text-muted mt-1">Avg Score</Text>
              </View>
              
              <View className="flex-1 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <Text className="text-2xl font-bold text-primary">
                  {forecast.filter(d => d.perfectDayScore >= 75).length}
                </Text>
                <Text className="text-xs font-medium text-muted mt-1">Optimal Days</Text>
              </View>
              
              <View className="flex-1 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                <Text className="text-2xl font-bold text-warning">
                  {forecast.filter(d => d.confidence >= 80).length}
                </Text>
                <Text className="text-xs font-medium text-muted mt-1">High Confidence</Text>
              </View>
            </View>

            {isPro && bestDay && worstDay && (
              <View className="gap-2 pt-2 border-t border-border">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-muted">Best Day</Text>
                  <Text className="text-sm font-bold text-success">
                    {bestDay.dayName} ({bestDay.perfectDayScore})
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-muted">Most Challenging</Text>
                  <Text className="text-sm font-bold text-error">
                    {worstDay.dayName} ({worstDay.perfectDayScore})
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Strategic Recommendation */}
          {isPro && bestDay && (
            <View className="bg-primary/10 border border-primary/20 rounded-2xl p-5 gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">💡</Text>
                <Text className="text-sm font-bold text-primary uppercase tracking-wide">
                  Strategic Recommendation
                </Text>
              </View>
              <Text className="text-base font-medium text-foreground leading-relaxed">
                Schedule your most important meetings and decisions on {bestDay.dayName}. 
                Optimal window: {bestDay.optimalTime}. Confidence: {bestDay.confidence}%
              </Text>
            </View>
          )}

          {/* Pro Upgrade Prompt for Free Users */}
          {!isPro && (
            <TouchableOpacity
              onPress={() => router.push("/upgrade" as any)}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 border border-primary/20"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">Unlock Full Forecast</Text>
                  <Text className="text-sm text-white/80 mt-1">
                    Get detailed insights, optimal timing, and strategic recommendations
                  </Text>
                </View>
                <Text className="text-2xl">🔮</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Daily Forecast */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Daily Breakdown</Text>
            
            {forecast.map((day, index) => {
              const isToday = index === 0;
              const scoreColor = getScoreColor(day.perfectDayScore);
              const scoreLabel = getScoreLabel(day.perfectDayScore);
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
                  className="bg-surface rounded-2xl p-5 border border-border shadow-sm"
                >
                  {/* Day Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-bold text-foreground">{day.dayName}</Text>
                        {isToday && (
                          <View className="bg-primary px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-bold text-white">TODAY</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-muted mt-0.5">
                        {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text 
                        className="text-3xl font-bold"
                        style={{ color: scoreColor }}
                      >
                        {day.perfectDayScore}
                      </Text>
                      <Text className="text-xs font-medium text-muted">{scoreLabel}</Text>
                    </View>
                  </View>

                  {/* Energy Type */}
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="px-3 py-1.5 bg-background rounded-full">
                      <Text className="text-xs font-medium text-foreground">{day.energyType}</Text>
                    </View>
                    <View className="px-3 py-1.5 bg-primary/10 rounded-full">
                      <Text className="text-xs font-medium text-primary">
                        {day.confidence}% Confidence
                      </Text>
                    </View>
                  </View>

                  {/* Top Priority (Pro only or truncated for free) */}
                  {isPro ? (
                    <View className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                      <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                        Top Priority
                      </Text>
                      <Text className="text-sm font-medium text-foreground leading-relaxed">
                        {day.topPriority}
                      </Text>
                    </View>
                  ) : (
                    <View className="p-3 bg-muted/10 border border-border rounded-xl">
                      <Text className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                        Top Priority
                      </Text>
                      <Text className="text-sm text-muted">
                        Unlock Pro to see detailed guidance 🔒
                      </Text>
                    </View>
                  )}

                  {/* Expanded Details (Pro only) */}
                  {selectedDay?.date === day.date && isPro && (
                    <View className="mt-4 pt-4 border-t border-border gap-3">
                      {/* Optimal Time */}
                      <View>
                        <Text className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                          Optimal Time
                        </Text>
                        <Text className="text-sm font-medium text-foreground">
                          {day.optimalTime}
                        </Text>
                      </View>

                      {/* Best For */}
                      <View>
                        <Text className="text-xs font-bold text-success uppercase tracking-wide mb-2">
                          ✓ Best For
                        </Text>
                        {day.bestFor.slice(0, 3).map((item, i) => (
                          <Text key={i} className="text-sm text-foreground mb-1">
                            • {item}
                          </Text>
                        ))}
                      </View>

                      {/* Avoid */}
                      <View>
                        <Text className="text-xs font-bold text-error uppercase tracking-wide mb-2">
                          ✗ Avoid
                        </Text>
                        {day.avoid.slice(0, 3).map((item, i) => (
                          <Text key={i} className="text-sm text-foreground mb-1">
                            • {item}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

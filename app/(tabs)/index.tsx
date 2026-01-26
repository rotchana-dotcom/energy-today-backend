/**
 * Today Screen - Professional Business Dashboard
 * 
 * Uses unified energy engine + AI insights
 * Business-focused language, specific timing, confidence scores
 */

import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useProfile } from "@/lib/profile-context";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import * as Haptics from "expo-haptics";
import { calculateUnifiedEnergy, type UnifiedEnergyReading } from "@/lib/unified-energy-engine";
import { UserProfile } from "@/types";
import { trpc } from "@/lib/trpc";
import { EnergyForecastWidget } from "@/components/energy-forecast-widget";
import { useAutoHideNav } from "@/hooks/use-auto-hide-nav";
import { TodayInsightsWidget } from "@/components/today-insights-widget";
import { SuccessStatsWidget } from "@/components/success-stats-widget";
import { generateTodayInsights } from "@/app/services/ai-interpretation-layer";
import { fetchAndSaveWeather, fetchCurrentWeather, getWeatherIcon, type WeatherData } from "@/app/services/weather-api";
import { OnboardingTooltip } from "@/components/onboarding-tooltip";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TodayScreen() {
  const { profile: contextProfile, isLoading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [energyReading, setEnergyReading] = useState<UnifiedEnergyReading | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showKeyOpportunityModal, setShowKeyOpportunityModal] = useState(false);
  const [showWatchOutModal, setShowWatchOutModal] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Auto-hide navigation on scroll
  const { onScroll } = useAutoHideNav();

  useEffect(() => {
    // Wait for ProfileContext to finish loading before accessing profile
    if (!profileLoading) {
      loadData();
    }
  }, [profileLoading, contextProfile]);

  const loadData = async () => {
    try {
      console.log('[Today] Starting loadData...');
      
      // Get profile from context (should always exist if app/index.tsx routed us here)
      const userProfile = contextProfile;
      
      console.log('[Today] Profile from context:', userProfile ? userProfile.name : 'null');
      
      if (!userProfile) {
        // This should NEVER happen if app/index.tsx is working correctly
        // Show error instead of redirecting (prevents loops)
        console.error('[Today] No profile found - this should not happen!');
        setError('Profile not found. Please restart the app.');
        setLoading(false);
        return;
      }
      
      setProfile(userProfile);

      console.log('[Today] Getting subscription status...');
      const subscription = await getSubscriptionStatus();
      
      console.log('[Today] Calculating unified energy...');
      let reading;
      try {
        reading = calculateUnifiedEnergy(userProfile);
        console.log('[Today] Energy calculation complete:', { score: reading.combinedAnalysis.perfectDayScore });
      } catch (energyError) {
        console.error('[Today] Energy calculation FAILED:', energyError);
        console.error('[Today] Error details:', energyError instanceof Error ? energyError.message : String(energyError));
        console.error('[Today] User profile:', JSON.stringify(userProfile));
        throw new Error(`Energy calculation failed: ${energyError instanceof Error ? energyError.message : String(energyError)}`);
      }
      
      setProfile(userProfile);
      setEnergyReading(reading);
      setIsPro(subscription.isPro);
      
      // Fetch weather (don't block if it fails)
      try {
        await fetchAndSaveWeather();
        const weatherData = await fetchCurrentWeather();
        setWeather(weatherData);
      } catch (weatherError) {
        console.log("Weather fetch failed, continuing without weather:", weatherError);
        // Continue without weather data
      }
      
      // Load AI insights (Pro feature)
      if (subscription.isPro) {
        try {
          await loadAIInsights(reading, userProfile);
        } catch (aiError) {
          console.log("AI insights failed, continuing without AI:", aiError);
          // Continue without AI insights
        }
      }
      
      console.log('[Today] Load complete, setting loading to false');
      setLoading(false);
      
      // Check if this is first time user
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setOnboardingStep(1);
      }
    } catch (error) {
      console.error('[Today] ===== ERROR IN LOADDATA =====');
      console.error('[Today] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[Today] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[Today] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[Today] Profile data:', JSON.stringify(contextProfile, null, 2));
      console.error('[Today] ===== END ERROR =====');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to load data: ${errorMessage}`);
      setLoading(false);
    }
  };

  const loadAIInsights = async (reading: UnifiedEnergyReading, userProfile: UserProfile) => {
    try {
      // Use local AI interpretation layer, passing profile directly
      const insights = await generateTodayInsights(new Date(), userProfile);
      setAiInsights(insights);
    } catch (error) {
      console.error("Failed to load AI insights:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Show error state if profile is missing
  if (error) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center justify-center flex-1">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Text className="text-lg font-bold text-error mb-2">Error</Text>
            <Text className="text-sm text-muted text-center mb-6">
              {error}
            </Text>
            
            {/* Detailed error info for debugging */}
            <View className="bg-surface rounded-lg p-4 mb-6 w-full max-w-md">
              <Text className="text-xs font-mono text-muted mb-2">Debug Info:</Text>
              <Text className="text-xs font-mono text-foreground mb-1">
                Profile: {contextProfile ? '✅ Loaded' : '❌ Missing'}
              </Text>
              {contextProfile && (
                <>
                  <Text className="text-xs font-mono text-foreground mb-1">
                    Name: {contextProfile.name}
                  </Text>
                  <Text className="text-xs font-mono text-foreground mb-1">
                    DOB: {contextProfile.dateOfBirth}
                  </Text>
                  <Text className="text-xs font-mono text-foreground mb-1">
                    Location: {contextProfile.placeOfBirth?.city || 'N/A'}, {contextProfile.placeOfBirth?.country || 'N/A'}
                  </Text>
                  <Text className="text-xs font-mono text-foreground mb-1">
                    Coordinates: ({contextProfile.placeOfBirth?.latitude || 0}, {contextProfile.placeOfBirth?.longitude || 0})
                  </Text>
                </>
              )}
            </View>
            
            <TouchableOpacity
              onPress={() => router.replace("/settings" as any)}
              className="bg-primary px-6 py-3 rounded-full mb-3"
            >
              <Text className="text-white font-semibold">Go to Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setLoading(true);
                loadData();
              }}
              className="bg-surface px-6 py-3 rounded-full border border-border"
            >
              <Text className="text-foreground font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (loading || !energyReading) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <ActivityIndicator size="large" color="#0A7EA4" />
        <Text className="text-sm text-muted mt-4">Analyzing patterns...</Text>
        <Text className="text-xs text-muted mt-2 text-center">
          Calculating your energy
        </Text>
      </ScreenContainer>
    );
  }

  const { personalProfile, earthProfile, combinedAnalysis, businessInsights } = energyReading;
  
  const date = new Date(earthProfile.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "#22C55E"; // Green
    if (score >= 70) return "#0A7EA4"; // Blue
    if (score >= 55) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const scoreColor = getScoreColor(combinedAnalysis.perfectDayScore);

  return (
    <ScreenContainer className="p-6">
      <ScrollView 
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Performance Dashboard</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-sm text-muted">{formattedDate}</Text>
                {weather && (
                  <View className="flex-row items-center gap-1">
                    <Text className="text-sm">•</Text>
                    <Text className="text-sm">{getWeatherIcon(weather.condition)}</Text>
                    <Text className="text-sm text-muted">{weather.temperature}°C</Text>
                  </View>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity 
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRefresh();
                }}
                disabled={refreshing}
                className="active:opacity-70"
              >
                <Text className="text-2xl" style={{ opacity: refreshing ? 0.5 : 1 }}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/settings" as any)}>
                <Text className="text-2xl">⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Perfect Day Score - Prominent */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm font-medium text-muted mb-3 text-center">TODAY'S PERFORMANCE POTENTIAL</Text>
            <View className="items-center">
              <Text 
                className="text-6xl font-bold mb-2"
                style={{ color: scoreColor }}
              >
                {combinedAnalysis.perfectDayScore}
              </Text>
              <Text className="text-sm text-muted mb-2">out of 100</Text>
              
              {/* See Why Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/ai-insights-dashboard" as any);
                }}
                className="bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-3 active:opacity-70"
              >
                <Text className="text-xs font-semibold text-primary">ⓘ See Why</Text>
              </TouchableOpacity>
              
              {/* Score Interpretation */}
              <View className="bg-primary/5 rounded-lg px-4 py-2">
                <Text className="text-sm font-medium text-foreground text-center">
                  {combinedAnalysis.perfectDayScore >= 85 && "Exceptional conditions - seize opportunities"}
                  {combinedAnalysis.perfectDayScore >= 70 && combinedAnalysis.perfectDayScore < 85 && "Strong day - move forward confidently"}
                  {combinedAnalysis.perfectDayScore >= 55 && combinedAnalysis.perfectDayScore < 70 && "Moderate conditions - be strategic"}
                  {combinedAnalysis.perfectDayScore < 55 && "Challenging day - focus on preparation"}
                </Text>
              </View>
              
              {/* Confidence Indicator */}
              <View className="flex-row items-center gap-2 mt-3">
                <Text className="text-xs text-muted">Confidence:</Text>
                <View className="flex-row gap-1">
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: i < Math.round(combinedAnalysis.confidenceScore / 20) 
                          ? "#0A7EA4" 
                          : "#E5E7EB"
                      }}
                    />
                  ))}
                </View>
                <Text className="text-xs font-medium text-foreground">
                  {combinedAnalysis.confidenceScore}%
                </Text>
              </View>
            </View>
          </View>

          {/* Onboarding Tooltips */}
          {showOnboarding && onboardingStep === 1 && (
            <OnboardingTooltip
              step={1}
              totalSteps={4}
              title="Track Your Energy"
              description="Your energy score shows how optimal today is for important decisions. Track daily outcomes to prove the system works."
              onNext={() => setOnboardingStep(2)}
              onSkip={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {showOnboarding && onboardingStep === 2 && (
            <OnboardingTooltip
              step={2}
              totalSteps={4}
              title="Quick Actions"
              description="Log outcomes, schedule tasks at optimal times, and see your 7-day energy forecast. Everything you need in one place."
              onNext={() => setOnboardingStep(3)}
              onSkip={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {/* Quick Actions - Direct access to key features */}
          <View className="gap-3">
            <Text className="text-base font-bold text-foreground">Quick Actions</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/results-tracking" as any);
                }}
                className="flex-1 bg-primary rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-2xl mb-2">📊</Text>
                <Text className="text-sm font-semibold text-background">Log Outcome</Text>
                <Text className="text-xs text-background/80 mt-1">Track today's results</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/task-scheduler" as any);
                }}
                className="flex-1 bg-surface border border-border rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-2xl mb-2">✅</Text>
                <Text className="text-sm font-semibold text-foreground">Schedule Task</Text>
                <Text className="text-xs text-muted mt-1">Find optimal time</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/energy-forecast" as any);
                }}
                className="flex-1 bg-surface border border-border rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-2xl mb-2">📅</Text>
                <Text className="text-sm font-semibold text-foreground">7-Day Forecast</Text>
                <Text className="text-xs text-muted mt-1">Plan ahead</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/ai-insights-dashboard" as any);
                }}
                className="flex-1 bg-surface border border-border rounded-xl p-4 active:opacity-80"
              >
                <Text className="text-2xl mb-2">🧠</Text>
                <Text className="text-sm font-semibold text-foreground">AI Insights</Text>
                <Text className="text-xs text-muted mt-1">See patterns</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today Insights Widget - Shows score + quick outcome logging */}
          <TodayInsightsWidget
            energyScore={combinedAnalysis.perfectDayScore}
            topPriority={isPro && aiInsights?.topPriority?.action ? aiInsights.topPriority.action : businessInsights.topPriority}
            topPriorityWhy={isPro && aiInsights?.topPriority?.why ? aiInsights.topPriority.why : businessInsights.topPriorityWhy}
            onOutcomeLogged={loadData}
          />

          {showOnboarding && onboardingStep === 3 && (
            <OnboardingTooltip
              step={3}
              totalSteps={4}
              title="Analyze Patterns"
              description="See how your energy correlates with success. The more you track, the more accurate predictions become."
              onNext={() => setOnboardingStep(4)}
              onSkip={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {/* Success Stats Widget - Shows patterns and results */}
          <SuccessStatsWidget onRefresh={loadData} />

          {showOnboarding && onboardingStep === 4 && (
            <OnboardingTooltip
              step={4}
              totalSteps={4}
              title="Optimize Your Schedule"
              description="Schedule important meetings and decisions on high-energy days (85+). This is how professionals maximize success rates."
              onNext={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                setShowOnboarding(false);
              }}
              onSkip={async () => {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {/* Energy Forecast Widget */}
          <EnergyForecastWidget />

          {/* AI Top Priority (Pro) */}
          {isPro && aiInsights?.topPriority && (
            <View className="bg-primary/10 border-2 border-primary rounded-2xl p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-lg">🎯</Text>
                <Text className="text-sm font-bold text-primary uppercase">Top Priority Today</Text>
              </View>
              <Text className="text-lg font-bold text-foreground mb-2">
                {aiInsights.topPriority.action}
              </Text>
              <Text className="text-sm text-muted leading-relaxed mb-3">
                {aiInsights.topPriority.why}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-1 bg-primary/20 rounded-full h-1.5">
                  <View 
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${aiInsights.topPriority.confidence}%` }}
                  />
                </View>
                <Text className="text-xs font-medium text-primary">
                  {aiInsights.topPriority.confidence}% confidence
                </Text>
              </View>
            </View>
          )}

          {/* AI Insights Dashboard Button (Pro) */}
          {isPro && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/ai-insights-dashboard" as any);
              }}
              className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-5 border-2 border-primary/30"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-2xl">🧠</Text>
                    <Text className="text-lg font-bold text-foreground">Deep Insights</Text>
                  </View>
                  <Text className="text-sm text-muted leading-relaxed">
                    Discover your personality profile, success patterns, and what makes YOU successful
                  </Text>
                </View>
                <Text className="text-2xl ml-3">→</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Standard Top Priority (Free) */}
          {!isPro && (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-lg">🎯</Text>
                <Text className="text-sm font-bold text-muted uppercase">Today's Focus</Text>
              </View>
              <Text className="text-lg font-bold text-foreground mb-2">
                {businessInsights.topPriority}
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                {businessInsights.topPriorityWhy}
              </Text>
            </View>
          )}

          {/* Optimal Timing Windows */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <Text className="text-sm font-medium text-muted mb-4">OPTIMAL TIMING</Text>
            
            <View className="gap-3">
              {/* Meetings */}
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center relative">
                  <Text className="text-lg">💼</Text>
                  <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-xs font-bold text-background">1</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Meetings</Text>
                  <Text className="text-xs text-primary font-medium mt-0.5">
                    {isPro && aiInsights?.optimalTiming?.criticalWindow ? aiInsights.optimalTiming.criticalWindow : businessInsights.meetings.time}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {businessInsights.meetings.why}
                  </Text>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-primary">
                    {businessInsights.meetings.confidence}%
                  </Text>
                </View>
              </View>

              {/* Decisions */}
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center relative">
                  <Text className="text-lg">🧠</Text>
                  <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-xs font-bold text-background">2</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Decisions</Text>
                  <Text className="text-xs text-primary font-medium mt-0.5">
                    {businessInsights.decisions.time}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {businessInsights.decisions.why}
                  </Text>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-primary">
                    {businessInsights.decisions.confidence}%
                  </Text>
                </View>
              </View>

              {/* Deals */}
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center relative">
                  <Text className="text-lg">🤝</Text>
                  <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-xs font-bold text-background">3</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Deals</Text>
                  <Text className="text-xs text-primary font-medium mt-0.5">
                    {businessInsights.deals.time}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {businessInsights.deals.why}
                  </Text>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-primary">
                    {businessInsights.deals.confidence}%
                  </Text>
                </View>
              </View>

              {/* Planning */}
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-primary/10 rounded-lg items-center justify-center relative">
                  <Text className="text-lg">📊</Text>
                  <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center">
                    <Text className="text-xs font-bold text-background">4</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Planning</Text>
                  <Text className="text-xs text-primary font-medium mt-0.5">
                    {isPro && aiInsights?.optimalTiming?.planningWindow ? aiInsights.optimalTiming.planningWindow : businessInsights.planning.time}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {businessInsights.planning.why}
                  </Text>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                  <Text className="text-xs font-bold text-primary">
                    {businessInsights.planning.confidence}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Best For / Avoid */}
          <View className="flex-row gap-3">
            {/* Best For */}
            <View className="flex-1 bg-success/10 border border-success/30 rounded-xl p-4">
              <Text className="text-xs font-bold text-success mb-2 uppercase">✓ Best For</Text>
              <View className="gap-1.5">
                {(isPro && aiInsights?.bestFor ? aiInsights.bestFor : businessInsights.bestFor).slice(0, 3).map((item: string, index: number) => (
                  <View key={index} className="flex-row items-start gap-1.5">
                    <Text className="text-xs font-bold text-success">{index + 1}.</Text>
                    <Text className="text-xs text-foreground flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Avoid */}
            <View className="flex-1 bg-error/10 border border-error/30 rounded-xl p-4">
              <Text className="text-xs font-bold text-error mb-2 uppercase">✗ Avoid</Text>
              <View className="gap-1.5">
                {(isPro && aiInsights?.avoid ? aiInsights.avoid : businessInsights.avoid).slice(0, 3).map((item: string, index: number) => (
                  <View key={index} className="flex-row items-start gap-1.5">
                    <Text className="text-xs font-bold text-error">{index + 1}.</Text>
                    <Text className="text-xs text-foreground flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Key Opportunity & Watch Out */}
          <View className="gap-3">
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowKeyOpportunityModal(true);
              }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base">💡</Text>
                  <Text className="text-xs font-bold text-primary uppercase">Key Opportunity</Text>
                </View>
                <Text className="text-primary text-lg">▶</Text>
              </View>
              <Text className="text-sm text-foreground" numberOfLines={2}>
                {isPro && aiInsights?.keyOpportunity ? aiInsights.keyOpportunity : businessInsights.keyOpportunity}
              </Text>
              <Text className="text-xs text-muted mt-2">Tap to see more details</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowWatchOutModal(true);
              }}
              className="bg-warning/5 border border-warning/20 rounded-xl p-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base">⚠️</Text>
                  <Text className="text-xs font-bold text-warning uppercase">Watch Out</Text>
                </View>
                <Text className="text-warning text-lg">▶</Text>
              </View>
              <Text className="text-sm text-foreground" numberOfLines={2}>
                {isPro && aiInsights?.watchOut ? aiInsights.watchOut : businessInsights.watchOut}
              </Text>
              <Text className="text-xs text-muted mt-2">Tap to see more details</Text>
            </TouchableOpacity>
          </View>

          {/* Energy Type */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs font-medium text-muted mb-2">TODAY'S ENERGY TYPE</Text>
            <Text className="text-lg font-bold text-foreground mb-1">
              {combinedAnalysis.energyType}
            </Text>
            <Text className="text-sm text-muted">
              {combinedAnalysis.energyDescription}
            </Text>
          </View>

          {/* Upgrade CTA for Free Users */}
          {!isPro && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/upgrade" as any);
              }}
              className="bg-gradient-to-r bg-primary rounded-2xl p-6 border-2 border-primary/50"
            >
              <View className="flex-row items-center gap-3 mb-3">
                <Text className="text-3xl">🚀</Text>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">Unlock AI-Powered Insights</Text>
                  <Text className="text-sm text-white/80 mt-1">
                    Get scary-accurate timing recommendations from our AI advisor
                  </Text>
                </View>
              </View>
              <View className="bg-white/20 rounded-lg p-3">
                <Text className="text-xs text-white font-medium">✓ Specific time windows (e.g., "2:30-3:45 PM")</Text>
                <Text className="text-xs text-white font-medium mt-1">✓ AI-generated strategic insights</Text>
                <Text className="text-xs text-white font-medium mt-1">✓ Weekly forecasts and planning</Text>
                <Text className="text-xs text-white font-medium mt-1">✓ Decision guidance with confidence scores</Text>
              </View>
              <View className="mt-4 bg-white rounded-full py-3">
                <Text className="text-center font-bold text-primary">Try 7 Days Free →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push("/weekly-plan" as any)}
              className="bg-surface border border-border rounded-xl px-5 py-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Week Ahead</Text>
                <Text className="text-xs text-muted mt-1">Strategic planning for next 7 days</Text>
              </View>
              <Text className="text-2xl">📅</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/referral" as any)}
              className="bg-primary/10 border border-primary rounded-xl px-5 py-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary">Refer & Earn</Text>
                <Text className="text-xs text-muted mt-1">Get +7 days Pro for each friend</Text>
              </View>
              <Text className="text-2xl">🎁</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>

      {/* Key Opportunity Modal */}
      <Modal
        visible={showKeyOpportunityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKeyOpportunityModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-background rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">💡</Text>
                <Text className="text-xl font-bold text-primary">Key Opportunity</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowKeyOpportunityModal(false);
                }}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground text-lg">×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-96">
              <Text className="text-base text-foreground leading-relaxed mb-4">
                {isPro && aiInsights?.keyOpportunity ? aiInsights.keyOpportunity : businessInsights.keyOpportunity}
              </Text>
              
              <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                <Text className="text-xs font-bold text-primary uppercase mb-2">Why This Matters</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  Today's energy alignment creates a unique window for this opportunity. The combination of your personal energy patterns and environmental factors makes this the optimal time to act.
                </Text>
              </View>
              
              <View className="bg-surface rounded-xl p-4 mt-3">
                <Text className="text-xs font-bold text-muted uppercase mb-2">Action Steps</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  1. Block time in your calendar during peak energy hours{"\n"}
                  2. Prepare any necessary materials in advance{"\n"}
                  3. Minimize distractions during execution{"\n"}
                  4. Follow up within 24 hours for maximum impact
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Watch Out Modal */}
      <Modal
        visible={showWatchOutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWatchOutModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-background rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">⚠️</Text>
                <Text className="text-xl font-bold text-warning">Watch Out</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowWatchOutModal(false);
                }}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground text-lg">×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-96">
              <Text className="text-base text-foreground leading-relaxed mb-4">
                {isPro && aiInsights?.watchOut ? aiInsights.watchOut : businessInsights.watchOut}
              </Text>
              
              <View className="bg-warning/10 rounded-xl p-4 border border-warning/30">
                <Text className="text-xs font-bold text-warning uppercase mb-2">Why This Matters</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  Today's energy patterns suggest potential challenges in this area. Being aware of these factors helps you navigate them more effectively and avoid unnecessary setbacks.
                </Text>
              </View>
              
              <View className="bg-surface rounded-xl p-4 mt-3">
                <Text className="text-xs font-bold text-muted uppercase mb-2">How to Mitigate</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  1. Schedule these activities for later in the week if possible{"\n"}
                  2. Build in extra buffer time for unexpected delays{"\n"}
                  3. Double-check details before committing{"\n"}
                  4. Have a backup plan ready if things don't go smoothly
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

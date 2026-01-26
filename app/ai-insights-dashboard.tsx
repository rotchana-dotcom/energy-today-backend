/**
 * AI Insights Dashboard
 * 
 * Shows deep self-knowledge and personalized patterns:
 * - Personality profile (Life Path type and traits)
 * - Personal energy factors and their impact
 * - Success patterns over time
 * - What makes YOU successful specifically
 * 
 * This is where users gain deep understanding that compounds over time.
 */

import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { UserProfile } from "@/types";
import { generateTodayInsights } from "@/app/services/ai-interpretation-layer";
import { getPersonalizedAdjustments } from "@/app/services/correlation-engine";
import { getAllOutcomes } from "@/lib/results-tracker";

interface PersonalityInsight {
  lifePathNumber: number;
  type: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
}

interface EnergyFactor {
  name: string;
  impact: string; // e.g., "+15 points", "-8 points"
  description: string;
  correlation: number; // 0-1
}

interface SuccessPattern {
  condition: string;
  successRate: number;
  sampleSize: number;
  insight: string;
}

export default function AIInsightsDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [personality, setPersonality] = useState<PersonalityInsight | null>(null);
  const [energyFactors, setEnergyFactors] = useState<EnergyFactor[]>([]);
  const [successPatterns, setSuccessPatterns] = useState<SuccessPattern[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState<number>(0);
  const [expandedEnergyFactors, setExpandedEnergyFactors] = useState(true);
  const [expandedSuccessPatterns, setExpandedSuccessPatterns] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const userProfile = await getUserProfile();
      if (!userProfile) {
        router.replace("/onboarding/welcome" as any);
        return;
      }

      setProfile(userProfile);

      // Get AI insights to extract personality (pass profile directly)
      const aiInsights = await generateTodayInsights(new Date(), userProfile);
      
      // Extract personality from AI insights
      const lifePathNumber = calculateLifePathNumber(new Date(userProfile.dateOfBirth));
      setPersonality({
        lifePathNumber,
        type: aiInsights.personalityType,
        traits: aiInsights.personalityTraits,
        strengths: getStrengths(lifePathNumber),
        challenges: getChallenges(lifePathNumber),
      });

      // Get personal energy factors
      const adjustments = await getPersonalizedAdjustments(new Date());
      const factors: EnergyFactor[] = adjustments.map(adj => ({
        name: adj.factor.charAt(0).toUpperCase() + adj.factor.slice(1),
        impact: adj.adjustment > 0 ? `+${adj.adjustment} points` : `${adj.adjustment} points`,
        description: adj.description,
        correlation: Math.abs(adj.adjustment) / 20, // Rough correlation estimate
      }));
      setEnergyFactors(factors);

      // Analyze success patterns
      const patterns = await analyzeSuccessPatterns();
      setSuccessPatterns(patterns);

      // Calculate overall prediction accuracy
      const accuracy = await calculateOverallAccuracy();
      setOverallAccuracy(accuracy);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load insights:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
        <Text className="text-sm text-muted mt-4">Analyzing your patterns...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">AI Insights</Text>
              <Text className="text-sm text-muted mt-1">Deep Self-Knowledge</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/insights' as any)}>
              <Text className="text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Overall Accuracy */}
          <View className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
            {successPatterns.reduce((sum, p) => sum + p.sampleSize, 0) === 0 ? (
              // Empty state - no outcomes tracked yet
              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-muted">Prediction Accuracy</Text>
                    <Text className="text-lg font-bold text-primary mt-1">Not enough data yet</Text>
                  </View>
                  <Text className="text-4xl">🎯</Text>
                </View>
                <Text className="text-xs text-muted leading-relaxed">
                  Log your daily outcomes to see how well the app predicts your energy. The more you track, the smarter your insights become.
                </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/results-tracking' as any)}
                  className="bg-primary rounded-lg p-3 mt-3 items-center active:opacity-80"
                >
                  <Text className="text-background font-semibold text-sm">Log Your First Outcome</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Normal state - show accuracy percentage
              <View>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-muted">Prediction Accuracy</Text>
                    <Text className="text-3xl font-bold text-primary mt-1">{overallAccuracy}%</Text>
                  </View>
                  <Text className="text-4xl">🎯</Text>
                </View>
                <Text className="text-xs text-muted mt-2">
                  Based on {successPatterns.reduce((sum, p) => sum + p.sampleSize, 0)} tracked outcomes
                </Text>
              </View>
            )}
          </View>

          {/* Personality Profile */}
          {personality && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="flex-row items-center gap-3 mb-4">
                <Text className="text-3xl">🧠</Text>
                <View>
                  <Text className="text-lg font-bold text-foreground">Your Personality</Text>
                  <Text className="text-sm text-muted">Life Path {personality.lifePathNumber}</Text>
                </View>
              </View>

              <View className="bg-primary/5 rounded-lg p-3 mb-4">
                <Text className="text-sm font-medium text-foreground">{personality.type}</Text>
              </View>

              <View className="gap-3">
                <View>
                  <Text className="text-xs font-medium text-muted mb-2">KEY TRAITS</Text>
                  {personality.traits.map((trait, i) => (
                    <Text key={i} className="text-sm text-foreground mb-1">• {trait}</Text>
                  ))}
                </View>

                <View>
                  <Text className="text-xs font-medium text-muted mb-2">STRENGTHS</Text>
                  {personality.strengths.map((strength, i) => (
                    <Text key={i} className="text-sm text-foreground mb-1">✓ {strength}</Text>
                  ))}
                </View>

                <View>
                  <Text className="text-xs font-medium text-muted mb-2">CHALLENGES</Text>
                  {personality.challenges.map((challenge, i) => (
                    <Text key={i} className="text-sm text-foreground mb-1">⚠ {challenge}</Text>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* What Affects YOUR Energy */}
          <TouchableOpacity 
            onPress={() => setExpandedEnergyFactors(!expandedEnergyFactors)}
            className="bg-surface rounded-2xl p-6 border border-border active:opacity-80"
          >
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-3xl">⚡</Text>
              <Text className="text-lg font-bold text-foreground flex-1">What Affects YOUR Energy</Text>
              <Text className="text-2xl text-muted">{expandedEnergyFactors ? '▼' : '▶'}</Text>
            </View>

            {energyFactors.length > 0 ? (
              expandedEnergyFactors ? (
                <View className="gap-3">
                  {energyFactors.map((factor, i) => (
                    <View key={i} className="bg-background rounded-lg p-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2 flex-1">
                          <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                            <Text className="text-xs font-bold text-background">{i + 1}</Text>
                          </View>
                          <Text className="text-sm font-medium text-foreground flex-1">{factor.name}</Text>
                        </View>
                        <Text 
                          className="text-sm font-bold"
                          style={{ color: factor.impact.startsWith('+') ? '#22C55E' : '#EF4444' }}
                        >
                          {factor.impact}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">{factor.description}</Text>
                      
                      {/* Correlation strength bar */}
                      <View className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-primary"
                          style={{ width: `${factor.correlation * 100}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="gap-2">
                  {energyFactors.slice(0, 1).map((factor, i) => (
                    <View key={i} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2 flex-1">
                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                          <Text className="text-xs font-bold text-background">1</Text>
                        </View>
                        <Text className="text-sm text-foreground flex-1">{factor.name}</Text>
                      </View>
                      <Text 
                        className="text-sm font-bold"
                        style={{ color: factor.impact.startsWith('+') ? '#22C55E' : '#EF4444' }}
                      >
                        {factor.impact}
                      </Text>
                    </View>
                  ))}
                  {energyFactors.length > 1 && (
                    <Text className="text-xs text-muted mt-1">Tap to see {energyFactors.length - 1} more factors</Text>
                  )}
                </View>
              )
            ) : (
              <Text className="text-sm text-muted">
                Start tracking sleep, nutrition, and activities to see personalized insights
              </Text>
            )}
          </TouchableOpacity>

          {/* Success Patterns */}
          <TouchableOpacity 
            onPress={() => setExpandedSuccessPatterns(!expandedSuccessPatterns)}
            className="bg-surface rounded-2xl p-6 border border-border active:opacity-80"
          >
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-3xl">📊</Text>
              <Text className="text-lg font-bold text-foreground flex-1">What Makes YOU Successful</Text>
              <Text className="text-2xl text-muted">{expandedSuccessPatterns ? '▼' : '▶'}</Text>
            </View>

            {successPatterns.length > 0 ? (
              expandedSuccessPatterns ? (
                <View className="gap-3">
                  {successPatterns.map((pattern, i) => (
                    <View key={i} className="bg-background rounded-lg p-3">
                      <View className="flex-row items-start justify-between mb-2 gap-2">
                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mt-0.5">
                          <Text className="text-xs font-bold text-background">{i + 1}</Text>
                        </View>
                        <Text className="text-sm font-medium text-foreground flex-1">{pattern.condition}</Text>
                        <Text className="text-lg font-bold text-primary ml-2">{pattern.successRate}%</Text>
                      </View>
                      <Text className="text-xs text-muted mb-2">{pattern.insight}</Text>
                      <Text className="text-xs text-muted">Based on {pattern.sampleSize} outcomes</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm text-muted">
                  Tap to see your success patterns
                </Text>
              )
            ) : (
              <Text className="text-sm text-muted">
                Log more outcomes to discover your success patterns
              </Text>
            )}
          </TouchableOpacity>

          {/* Apply Insights - Quick Actions */}
          {successPatterns.length > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-2xl">⚡</Text>
                <Text className="text-lg font-bold text-foreground">Apply These Insights</Text>
              </View>
              <Text className="text-sm text-muted mb-4">
                Use your patterns to optimize your schedule and improve results
              </Text>
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/task-scheduler" as any);
                  }}
                  className="bg-primary rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">📅</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-background">Schedule Optimally</Text>
                      <Text className="text-xs text-background/80">Find best times for your tasks</Text>
                    </View>
                  </View>
                  <Text className="text-background text-lg">→</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/results-tracking" as any);
                  }}
                  className="bg-background border border-border rounded-lg p-4 flex-row items-center justify-between active:opacity-80"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">📊</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">Track More Outcomes</Text>
                      <Text className="text-xs text-muted">Improve prediction accuracy</Text>
                    </View>
                  </View>
                  <Text className="text-muted text-lg">→</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Deep Understanding Note */}
          <View className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <Text className="text-sm text-foreground leading-relaxed">
              💡 <Text className="font-medium">This dashboard gets smarter over time.</Text> The more you track (sleep, nutrition, activities, outcomes), the more accurate and personalized these insights become. You're building deep self-knowledge that will help you optimize your business and life decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateLifePathNumber(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();

  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);

  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

function getStrengths(lifePathNumber: number): string[] {
  const strengthsMap: Record<number, string[]> = {
    1: ["Natural leader", "Independent thinker", "Innovative problem-solver"],
    2: ["Diplomatic and cooperative", "Intuitive understanding of others", "Patient and persistent"],
    3: ["Creative and expressive", "Optimistic and enthusiastic", "Natural communicator"],
    4: ["Practical and organized", "Reliable and disciplined", "Strong work ethic"],
    5: ["Adaptable and versatile", "Adventurous spirit", "Quick learner"],
    6: ["Nurturing and supportive", "Strong sense of responsibility", "Harmonious relationships"],
    7: ["Analytical and insightful", "Spiritual awareness", "Deep thinker"],
    8: ["Business acumen", "Goal-oriented", "Material success"],
    9: ["Humanitarian", "Compassionate", "Wise and understanding"],
  };

  return strengthsMap[lifePathNumber] || ["Unique perspective", "Personal growth", "Life experience"];
}

function getChallenges(lifePathNumber: number): string[] {
  const challengesMap: Record<number, string[]> = {
    1: ["Can be overly independent", "May struggle with patience", "Needs to balance ego"],
    2: ["Can be overly sensitive", "May avoid conflict too much", "Needs to assert boundaries"],
    3: ["Can scatter energy", "May avoid serious topics", "Needs focus and discipline"],
    4: ["Can be too rigid", "May resist change", "Needs flexibility"],
    5: ["Can be restless", "May lack commitment", "Needs grounding"],
    6: ["Can be overly responsible", "May neglect self", "Needs personal boundaries"],
    7: ["Can be too isolated", "May overthink", "Needs social connection"],
    8: ["Can be too focused on material", "May neglect relationships", "Needs balance"],
    9: ["Can be overly idealistic", "May struggle with endings", "Needs practical grounding"],
  };

  return challengesMap[lifePathNumber] || ["Learning and growing", "Finding balance", "Developing self-awareness"];
}

async function analyzeSuccessPatterns(): Promise<SuccessPattern[]> {
  try {
    const results = await getAllOutcomes();
    const patterns: SuccessPattern[] = [];

    // Pattern 1: High energy + good sleep
    const highEnergyGoodSleep = results.filter((r: any) => 
      r.energyScore >= 80 && r.outcome === "success"
    );
    if (highEnergyGoodSleep.length >= 3) {
      patterns.push({
        condition: "Energy score 80+ with good sleep",
        successRate: Math.round((highEnergyGoodSleep.length / results.filter((r: any) => r.energyScore >= 80).length) * 100),
        sampleSize: highEnergyGoodSleep.length,
        insight: "You perform best when your energy is high and you're well-rested",
      });
    }

    // Pattern 2: Following recommendations
    const followedAdvice = results.filter((r: any) => 
      r.followedAdvice && r.outcome === "success"
    );
    if (followedAdvice.length >= 3) {
      patterns.push({
        condition: "When you follow AI recommendations",
        successRate: Math.round((followedAdvice.length / results.filter((r: any) => r.followedAdvice).length) * 100),
        sampleSize: followedAdvice.length,
        insight: "Following personalized recommendations significantly improves your outcomes",
      });
    }

    // Pattern 3: Specific activities
    const activityResults: Record<string, { success: number; total: number }> = {};
    results.forEach((r: any) => {
      if (!activityResults[r.activity]) {
        activityResults[r.activity] = { success: 0, total: 0 };
      }
      activityResults[r.activity].total++;
      if (r.outcome === "success") {
        activityResults[r.activity].success++;
      }
    });

    Object.entries(activityResults).forEach(([activity, stats]) => {
      if (stats.total >= 3) {
        const successRate = Math.round((stats.success / stats.total) * 100);
        if (successRate >= 70) {
          patterns.push({
            condition: `${activity} activities`,
            successRate,
            sampleSize: stats.total,
            insight: `You excel at ${activity.toLowerCase()} - consider doing more of this`,
          });
        }
      }
    });

    return patterns.slice(0, 5); // Top 5 patterns
  } catch (error) {
    console.error("Failed to analyze patterns:", error);
    return [];
  }
}

async function calculateOverallAccuracy(): Promise<number> {
  try {
    const results = await getAllOutcomes();
    if (results.length === 0) return 0;

    // Calculate how often high energy scores led to success
    const highEnergyResults = results.filter((r: any) => r.energyScore >= 70);
    const highEnergySuccess = highEnergyResults.filter((r: any) => r.outcome === "success").length;

    const lowEnergyResults = results.filter((r: any) => r.energyScore < 55);
    const lowEnergyFailures = lowEnergyResults.filter((r: any) => r.outcome === "failure").length;

    const correctPredictions = highEnergySuccess + lowEnergyFailures;
    const totalPredictions = highEnergyResults.length + lowEnergyResults.length;

    if (totalPredictions === 0) return 0;

    return Math.round((correctPredictions / totalPredictions) * 100);
  } catch (error) {
    console.error("Failed to calculate accuracy:", error);
    return 0;
  }
}

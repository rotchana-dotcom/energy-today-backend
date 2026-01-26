import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { compareEnergyCalendars, TeamMember, TeamSyncAnalysis } from "@/lib/team-sync";
import { UserProfile } from "@/types";
import { shareEnergySync } from "@/lib/sharing";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import { getTeamMembers, saveTeamMember, type SavedTeamMember } from "@/lib/team-members";

export default function TeamSyncScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<TeamSyncAnalysis | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiMeetingTimes, setAiMeetingTimes] = useState<any>(null);
  const [aiTeamComparison, setAiTeamComparison] = useState<any>(null);
  const [savedMembers, setSavedMembers] = useState<SavedTeamMember[]>([]);
  const [showSavedMembers, setShowSavedMembers] = useState(false);
  
  const meetingTimesMutation = trpc.team.findOptimalMeetingTimes.useMutation();
  const teamComparisonMutation = trpc.team.compareTeamEnergy.useMutation();
  
  // Form state
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) {
      router.replace("/onboarding/welcome" as any);
      return;
    }

    setProfile(userProfile);
    
    // Check Pro status
    const subscription = await getSubscriptionStatus();
    setIsPro(subscription.isPro);
    
    // Load saved team members
    const members = await getTeamMembers();
    setSavedMembers(members);
    
    setLoading(false);
  };

  const handleCompare = async () => {
    if (!profile || !name || !dateOfBirth || !city || !country) return;

    // Create team member profile
    const teamMember: TeamMember = {
      name: name.trim(),
      dateOfBirth,
      placeOfBirth: {
        city: city.trim(),
        country: country.trim(),
        latitude: 0, // Simplified - in production, would geocode
        longitude: 0,
      },
    };

    const syncAnalysis = compareEnergyCalendars(profile, teamMember, 14);
    setAnalysis(syncAnalysis);
    setShowForm(false);
    
    // Save team member for future use
    try {
      await saveTeamMember({
        name: name.trim(),
        dateOfBirth,
        placeOfBirth: `${city.trim()}, ${country.trim()}`,
      });
      // Reload saved members
      const members = await getTeamMembers();
      setSavedMembers(members);
    } catch (error) {
      console.error("Failed to save team member:", error);
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleShare = async () => {
    if (!analysis || !profile) return;
    await shareEnergySync(profile.name, name, analysis);
  };

  const handleAiMeetingTimes = async () => {
    if (!profile || !name || !dateOfBirth) return;
    
    try {
      setAiAnalyzing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Generate energy data for both members
      const teamMembers = [];
      
      // User's energy data
      const userEnergyData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const energy = calculateUnifiedEnergy(profile, date);
        userEnergyData.push({
          date: date.toISOString().split('T')[0],
          score: energy.combinedAnalysis.perfectDayScore,
          peakHours: energy.combinedAnalysis.peakHours,
        });
      }
      
      teamMembers.push({
        name: profile.name,
        energyData: userEnergyData,
      });
      
      // Team member's energy data (simplified - using user's profile as template)
      const memberEnergyData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const energy = calculateUnifiedEnergy(profile, date);
        memberEnergyData.push({
          date: date.toISOString().split('T')[0],
          score: energy.combinedAnalysis.perfectDayScore * 0.9, // Slight variation
          peakHours: energy.combinedAnalysis.peakHours,
        });
      }
      
      teamMembers.push({
        name: name,
        energyData: memberEnergyData,
      });
      
      // Call AI API
      const result = await meetingTimesMutation.mutateAsync({
        teamMembers,
        meetingDuration: 60,
        daysAhead: 7,
      });
      
      setAiMeetingTimes(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('AI meeting times error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAiTeamComparison = async () => {
    if (!profile || !name || !dateOfBirth) return;
    
    try {
      setAiAnalyzing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Generate energy data for both members
      const teamMembers = [];
      
      // User's energy data (last 7 days)
      const userEnergyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const energy = calculateUnifiedEnergy(profile, date);
        userEnergyData.push({
          date: date.toISOString().split('T')[0],
          score: energy.combinedAnalysis.perfectDayScore,
          type: energy.combinedAnalysis.energyType,
        });
      }
      
      teamMembers.push({
        name: profile.name,
        energyData: userEnergyData,
      });
      
      // Team member's energy data
      const memberEnergyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const energy = calculateUnifiedEnergy(profile, date);
        memberEnergyData.push({
          date: date.toISOString().split('T')[0],
          score: energy.combinedAnalysis.perfectDayScore * 0.85, // Variation
          type: energy.combinedAnalysis.energyType,
        });
      }
      
      teamMembers.push({
        name: name,
        energyData: memberEnergyData,
      });
      
      // Call AI API
      const result = await teamComparisonMutation.mutateAsync({
        teamMembers,
      });
      
      setAiTeamComparison(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('AI team comparison error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAiAnalyzing(false);
    }
  };
  if (loading || !profile) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!isPro) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center gap-6">
          <Text className="text-4xl">🤝</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            Team Energy Sync
          </Text>
          <Text className="text-base text-muted text-center px-4">
            Compare energy calendars with team members to find the best times for meetings and collaboration.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/upgrade" as any)}
            className="bg-primary px-8 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-semibold text-lg">Upgrade to Pro</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Team Energy Sync</Text>
                <Text className="text-sm text-muted mt-1">
                  Find optimal meeting times with colleagues
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/business')}
                className="bg-surface border border-border rounded-full p-2"
              >
                <Text className="text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Saved Members Link */}
            {savedMembers.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/team-members" as any);
                }}
                className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center gap-2 self-start"
              >
                <Text className="text-primary font-medium text-sm">
                  👥 {savedMembers.length} Saved {savedMembers.length === 1 ? "Member" : "Members"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Team Member Button */}
          {!showForm && !analysis && (
            <TouchableOpacity
              onPress={() => {
                setShowForm(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="bg-primary px-6 py-4 rounded-full flex-row items-center justify-center gap-2"
            >
              <Text className="text-lg">+</Text>
              <Text className="text-white font-semibold">Compare with Team Member</Text>
            </TouchableOpacity>
          )}

          {/* Team Member Form */}
          {showForm && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              {/* Quick Select from Saved Members */}
              {savedMembers.length > 0 && (
                <View className="gap-2">
                  <Text className="text-sm font-medium text-muted">QUICK SELECT</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    <View className="flex-row gap-2">
                      {savedMembers.slice(0, 5).map((member) => (
                        <TouchableOpacity
                          key={member.id}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setName(member.name);
                            setDateOfBirth(member.dateOfBirth);
                            const [city, country] = member.placeOfBirth.split(", ");
                            setCity(city || "");
                            setCountry(country || "");
                          }}
                          className="bg-primary/10 px-4 py-2 rounded-full"
                        >
                          <Text className="text-primary font-medium text-sm">{member.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              <Text className="text-sm font-medium text-muted">TEAM MEMBER INFO</Text>
              
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
              
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="Date of Birth (YYYY-MM-DD)"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
              
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
              
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="Country"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    setName("");
                    setDateOfBirth("");
                    setCity("");
                    setCountry("");
                  }}
                  className="flex-1 bg-border py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-muted">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCompare}
                  disabled={!name || !dateOfBirth || !city || !country}
                  className={`flex-1 py-3 rounded-lg ${
                    name && dateOfBirth && city && country ? "bg-primary" : "bg-border"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      name && dateOfBirth && city && country ? "text-white" : "text-muted"
                    }`}
                  >
                    Compare
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Analysis Results */}
          {analysis && (
            <>
              {/* Best Meeting Time */}
              <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
                <View className="flex-row items-center gap-2 mb-3">
                  <Text className="text-2xl">⭐</Text>
                  <Text className="text-sm font-medium text-success">BEST MEETING TIME</Text>
                </View>
                <Text className="text-lg font-bold text-foreground mb-2">
                  {new Date(analysis.bestMeetingTime.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text className="text-sm text-muted">{analysis.bestMeetingTime.reason}</Text>
              </View>

              {/* Summary */}
              <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
                <Text className="text-sm font-medium text-muted">NEXT 14 DAYS</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-success/10 rounded-lg p-3">
                    <Text className="text-xs text-muted">🟢 Optimal</Text>
                    <Text className="text-xl font-bold text-success">
                      {analysis.optimalDays.length}
                    </Text>
                  </View>
                  <View className="flex-1 bg-warning/10 rounded-lg p-3">
                    <Text className="text-xs text-muted">🟡 Good</Text>
                    <Text className="text-xl font-bold text-warning">
                      {analysis.goodDays.length}
                    </Text>
                  </View>
                  <View className="flex-1 bg-error/10 rounded-lg p-3">
                    <Text className="text-xs text-muted">🔴 Avoid</Text>
                    <Text className="text-xl font-bold text-error">
                      {analysis.avoidDays.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <View className="bg-primary/5 rounded-2xl p-5 border border-primary/20 gap-3">
                  <Text className="text-sm font-medium text-primary">INSIGHTS</Text>
                  {analysis.insights.map((insight, index) => (
                    <View key={index} className="flex-row gap-2">
                      <Text className="text-primary">•</Text>
                      <Text className="flex-1 text-sm text-foreground leading-relaxed">
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Calendar View */}
              <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
                <Text className="text-sm font-medium text-muted">CALENDAR</Text>
                {analysis.days.map((day) => {
                  const bgColor =
                    day.recommendation === "optimal"
                      ? "bg-success/10"
                      : day.recommendation === "good"
                      ? "bg-warning/10"
                      : day.recommendation === "okay"
                      ? "bg-background"
                      : "bg-error/10";
                  
                  const borderColor =
                    day.recommendation === "optimal"
                      ? "border-success/30"
                      : day.recommendation === "good"
                      ? "border-warning/30"
                      : day.recommendation === "okay"
                      ? "border-border"
                      : "border-error/30";

                  return (
                    <View
                      key={day.date}
                      className={`${bgColor} border ${borderColor} rounded-lg p-3`}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-foreground">
                          {day.dayOfWeek}, {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            day.recommendation === "optimal"
                              ? "bg-success/20"
                              : day.recommendation === "good"
                              ? "bg-warning/20"
                              : day.recommendation === "okay"
                              ? "bg-border"
                              : "bg-error/20"
                          }`}
                        >
                          <Text className="text-xs font-medium">
                            {day.recommendation === "optimal"
                              ? "⭐ Optimal"
                              : day.recommendation === "good"
                              ? "✓ Good"
                              : day.recommendation === "okay"
                              ? "○ Okay"
                              : "✕ Avoid"}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <Text className="text-xs text-muted mb-1">You</Text>
                          <Text className="text-sm">
                            {day.userAlignment === "strong"
                              ? "🟢 Strong"
                              : day.userAlignment === "moderate"
                              ? "🟡 Moderate"
                              : "🔴 Challenging"}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-muted mb-1">{name}</Text>
                          <Text className="text-sm">
                            {day.partnerAlignment === "strong"
                              ? "🟢 Strong"
                              : day.partnerAlignment === "moderate"
                              ? "🟡 Moderate"
                              : "🔴 Challenging"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* AI-Powered Analysis Buttons */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleAiMeetingTimes}
                  disabled={aiAnalyzing}
                  className={`${aiAnalyzing ? "bg-primary/50" : "bg-primary"} px-6 py-3 rounded-full flex-row items-center justify-center gap-2`}
                >
                  {aiAnalyzing ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white font-semibold">Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-lg">🤖</Text>
                      <Text className="text-white font-semibold">AI: Find Optimal Meeting Times</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAiTeamComparison}
                  disabled={aiAnalyzing}
                  className={`${aiAnalyzing ? "bg-primary/50" : "bg-primary"} px-6 py-3 rounded-full flex-row items-center justify-center gap-2`}
                >
                  {aiAnalyzing ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white font-semibold">Analyzing...</Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-lg">🧠</Text>
                      <Text className="text-white font-semibold">AI: Deep Team Analysis</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* AI Meeting Times Results */}
              {aiMeetingTimes && (
                <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30 gap-4">
                  <Text className="text-sm font-medium text-primary">🤖 AI MEETING RECOMMENDATIONS</Text>
                  
                  {aiMeetingTimes.recommendations?.map((rec: any, index: number) => (
                    <View key={index} className="bg-background rounded-lg p-4 gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-foreground">
                          {new Date(rec.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </Text>
                        <View className="bg-success/20 px-3 py-1 rounded-full">
                          <Text className="text-sm font-medium text-success">{rec.score}/100</Text>
                        </View>
                      </View>
                      <Text className="text-base font-semibold text-foreground">{rec.time}</Text>
                      <Text className="text-sm text-muted">{rec.reason}</Text>
                    </View>
                  ))}

                  {aiMeetingTimes.insights && aiMeetingTimes.insights.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-xs font-medium text-muted">KEY INSIGHTS</Text>
                      {aiMeetingTimes.insights.map((insight: string, index: number) => (
                        <View key={index} className="flex-row gap-2">
                          <Text className="text-primary">•</Text>
                          <Text className="flex-1 text-sm text-foreground">{insight}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* AI Team Comparison Results */}
              {aiTeamComparison && (
                <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30 gap-4">
                  <Text className="text-sm font-medium text-primary">🧠 AI TEAM ANALYSIS</Text>
                  
                  {/* Compatibility Score */}
                  <View className="bg-background rounded-lg p-4">
                    <Text className="text-xs text-muted mb-2">TEAM COMPATIBILITY</Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1 bg-success/10 rounded-full h-3">
                        <View 
                          className="bg-success rounded-full h-3"
                          style={{ width: `${aiTeamComparison.compatibility || 0}%` }}
                        />
                      </View>
                      <Text className="text-lg font-bold text-foreground">
                        {aiTeamComparison.compatibility || 0}%
                      </Text>
                    </View>
                  </View>

                  {/* Strengths */}
                  {aiTeamComparison.strengths && aiTeamComparison.strengths.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-xs font-medium text-success">✓ STRENGTHS</Text>
                      {aiTeamComparison.strengths.map((strength: string, index: number) => (
                        <View key={index} className="flex-row gap-2">
                          <Text className="text-success">•</Text>
                          <Text className="flex-1 text-sm text-foreground">{strength}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Challenges */}
                  {aiTeamComparison.challenges && aiTeamComparison.challenges.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-xs font-medium text-warning">⚠ CHALLENGES</Text>
                      {aiTeamComparison.challenges.map((challenge: string, index: number) => (
                        <View key={index} className="flex-row gap-2">
                          <Text className="text-warning">•</Text>
                          <Text className="flex-1 text-sm text-foreground">{challenge}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Recommendations */}
                  {aiTeamComparison.recommendations && aiTeamComparison.recommendations.length > 0 && (
                    <View className="gap-2">
                      <Text className="text-xs font-medium text-primary">💡 RECOMMENDATIONS</Text>
                      {aiTeamComparison.recommendations.map((rec: string, index: number) => (
                        <View key={index} className="flex-row gap-2">
                          <Text className="text-primary">•</Text>
                          <Text className="flex-1 text-sm text-foreground">{rec}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setAnalysis(null);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-surface border border-border py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-foreground">
                    Compare with Another
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  className="flex-1 bg-primary py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-white">Share Results</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!showForm && !analysis && (
            <View className="bg-surface rounded-lg p-6 border border-border">
              <Text className="text-sm text-muted text-center leading-relaxed">
                Compare your energy calendar with a colleague or partner to find the best times for
                meetings, collaboration, and important conversations.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

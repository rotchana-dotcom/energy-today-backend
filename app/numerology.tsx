import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/storage";
import { analyzeDayBorn, analyzeLifeLine, analyzeKarmicNumbers } from "@/lib/enhanced-numerology";
import type { DayBornAnalysis, LifeLineAnalysis, KarmicAnalysis } from "@/lib/enhanced-numerology";

export default function PersonalProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const [dayBorn, setDayBorn] = useState<DayBornAnalysis | null>(null);
  const [lifeLine, setLifeLine] = useState<LifeLineAnalysis | null>(null);
  const [karmic, setKarmic] = useState<KarmicAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNumerologyData();
  }, []);

  async function loadNumerologyData() {
    try {
      const profile = await getUserProfile();
      if (!profile) {
        setLoading(false);
        return;
      }
      const dateOfBirth = profile.dateOfBirth;
      const name = profile.name || "User";

      // Calculate all numerology insights
      const dayBornData = analyzeDayBorn(dateOfBirth);
      const lifeLineData = analyzeLifeLine(dateOfBirth);
      const karmicData = analyzeKarmicNumbers(dateOfBirth, name);

      setDayBorn(dayBornData);
      setLifeLine(lifeLineData);
      setKarmic(karmicData);
    } catch (error) {
      console.error("Error loading numerology data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Loading your profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!dayBorn || !lifeLine || !karmic) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-xl font-bold text-foreground">No Profile Data</Text>
          <Text className="text-base text-muted text-center">
            Please complete your profile to see your energy insights.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="bg-primary px-6 py-3 rounded-full active:opacity-80"
          >
            <Text className="text-background font-semibold">Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.push('/(tabs)/')} className="active:opacity-70">
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Personal Energy Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Day Born Section */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">Birth Day: {dayBorn.dayNumber}</Text>
            <Text className="text-lg text-primary font-semibold">Key Influence: {dayBorn.rulingPlanet}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Characteristics</Text>
            <View className="flex-row flex-wrap gap-2">
              {dayBorn.characteristics.map((char, idx) => (
                <View key={idx} className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-sm text-primary">{char}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Strengths</Text>
            {dayBorn.strengths.map((strength, idx) => (
              <Text key={idx} className="text-sm text-muted mb-1">• {strength}</Text>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Challenges</Text>
            {dayBorn.challenges.map((challenge, idx) => (
              <Text key={idx} className="text-sm text-muted mb-1">• {challenge}</Text>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Lucky Colors</Text>
            <View className="flex-row flex-wrap gap-2">
              {dayBorn.luckyColors.map((color, idx) => (
                <View key={idx} className="bg-success/10 px-3 py-1 rounded-full">
                  <Text className="text-sm text-success">{color}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Lucky Numbers</Text>
            <View className="flex-row flex-wrap gap-2">
              {dayBorn.luckyNumbers.map((num, idx) => (
                <View key={idx} className="bg-warning/10 px-3 py-1 rounded-full">
                  <Text className="text-sm text-warning font-semibold">{num}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Life Line Section */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">Life Pattern: {lifeLine.lifePathNumber}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-base text-foreground font-semibold mb-2">{lifeLine.description}</Text>
            <Text className="text-sm text-muted leading-relaxed">{lifeLine.purpose}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Your Talents</Text>
            {lifeLine.talents.map((talent, idx) => (
              <Text key={idx} className="text-sm text-muted mb-1">• {talent}</Text>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Life Challenges</Text>
            {lifeLine.challenges.map((challenge, idx) => (
              <Text key={idx} className="text-sm text-muted mb-1">• {challenge}</Text>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Career Paths</Text>
            <View className="flex-row flex-wrap gap-2">
              {lifeLine.career.map((career, idx) => (
                <View key={idx} className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-sm text-primary">{career}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Relationships</Text>
            <Text className="text-sm text-muted leading-relaxed">{lifeLine.relationships}</Text>
          </View>
        </View>

        {/* Karmic Numbers Section */}
        <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">Life Patterns Analysis</Text>
            {karmic.hasKarmicDebt && (
              <View className="bg-warning/10 px-3 py-1 rounded-full">
                <Text className="text-sm text-warning font-semibold">Important Patterns</Text>
              </View>
            )}
          </View>

          {karmic.hasKarmicDebt && karmic.karmicDebtNumbers.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Key Pattern Numbers</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {karmic.karmicDebtNumbers.map((num, idx) => (
                  <View key={idx} className="bg-error/10 px-3 py-1 rounded-full">
                    <Text className="text-sm text-error font-semibold">{num}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {karmic.lessons.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Life Lessons</Text>
              {karmic.lessons.map((lesson, idx) => (
                <View key={idx} className="bg-warning/5 p-3 rounded-lg mb-2">
                  <Text className="text-sm text-muted leading-relaxed">{lesson}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="bg-primary/5 p-4 rounded-lg">
            <Text className="text-sm text-foreground leading-relaxed">{karmic.guidance}</Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

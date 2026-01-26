import { useState, useEffect } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getSectionOrder,
  saveSectionOrder,
  resetSectionOrder,
  DEFAULT_TODAY_SECTIONS,
  DEFAULT_AI_INSIGHTS_SECTIONS,
  type SectionOrder,
} from "@/lib/section-order";

// Section labels for display
const TODAY_SECTION_LABELS: Record<string, string> = {
  performance_score: "Performance Score",
  top_priority: "Top Priority / Focus",
  optimal_timing: "Optimal Timing",
  best_for_avoid: "Best For / Avoid",
  key_opportunity_watch_out: "Key Opportunity / Watch Out",
  energy_type: "Energy Type",
};

const AI_INSIGHTS_SECTION_LABELS: Record<string, string> = {
  prediction_accuracy: "Prediction Accuracy",
  life_path_profile: "Life Path Profile",
  what_affects_energy: "What Affects YOUR Energy",
  what_makes_successful: "What Makes YOU Successful",
};

export default function CustomizeLayoutScreen() {
  const colors = useColors();
  const [sectionOrder, setSectionOrder] = useState<SectionOrder>({
    todayScreen: DEFAULT_TODAY_SECTIONS,
    aiInsightsDashboard: DEFAULT_AI_INSIGHTS_SECTIONS,
  });
  const [todayOrder, setTodayOrder] = useState<Record<string, string>>({});
  const [aiInsightsOrder, setAiInsightsOrder] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSectionOrder();
  }, []);

  const loadSectionOrder = async () => {
    const order = await getSectionOrder();
    setSectionOrder(order);

    // Convert array indices to display numbers (1-based)
    const todayMap: Record<string, string> = {};
    order.todayScreen.forEach((id, index) => {
      todayMap[id] = String(index + 1);
    });
    setTodayOrder(todayMap);

    const aiMap: Record<string, string> = {};
    order.aiInsightsDashboard.forEach((id, index) => {
      aiMap[id] = String(index + 1);
    });
    setAiInsightsOrder(aiMap);
  };

  const handleSave = async () => {
    // Convert display numbers back to ordered arrays
    const todayArray = Object.entries(todayOrder)
      .map(([id, num]) => ({ id, order: parseInt(num) || 999 }))
      .sort((a, b) => a.order - b.order)
      .map((item) => item.id);

    const aiArray = Object.entries(aiInsightsOrder)
      .map(([id, num]) => ({ id, order: parseInt(num) || 999 }))
      .sort((a, b) => a.order - b.order)
      .map((item) => item.id);

    await saveSectionOrder({
      todayScreen: todayArray,
      aiInsightsDashboard: aiArray,
    });

    router.push('/(tabs)/more');
  };

  const handleReset = async () => {
    await resetSectionOrder();
    await loadSectionOrder();
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 py-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')} className="mb-4">
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Customize Layout</Text>
          <Text className="text-base text-muted mt-2">
            Reorder sections by entering numbers (1, 2, 3...). Lower numbers appear first.
          </Text>
        </View>

        {/* Today Screen Sections */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">Today Screen</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            {DEFAULT_TODAY_SECTIONS.map((sectionId) => (
              <View key={sectionId} className="flex-row items-center gap-3">
                <TextInput
                  value={todayOrder[sectionId] || ""}
                  onChangeText={(text) =>
                    setTodayOrder({ ...todayOrder, [sectionId]: text })
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-12 h-12 bg-background rounded-lg text-center text-lg font-bold text-foreground border border-border"
                  style={{ borderColor: colors.border }}
                  placeholderTextColor={colors.muted}
                  placeholder="1"
                />
                <Text className="flex-1 text-sm text-foreground">
                  {TODAY_SECTION_LABELS[sectionId]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Insights Dashboard Sections */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">AI Insights Dashboard</Text>
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            {DEFAULT_AI_INSIGHTS_SECTIONS.map((sectionId) => (
              <View key={sectionId} className="flex-row items-center gap-3">
                <TextInput
                  value={aiInsightsOrder[sectionId] || ""}
                  onChangeText={(text) =>
                    setAiInsightsOrder({ ...aiInsightsOrder, [sectionId]: text })
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-12 h-12 bg-background rounded-lg text-center text-lg font-bold text-foreground border border-border"
                  style={{ borderColor: colors.border }}
                  placeholderTextColor={colors.muted}
                  placeholder="1"
                />
                <Text className="flex-1 text-sm text-foreground">
                  {AI_INSIGHTS_SECTION_LABELS[sectionId]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="mx-6 gap-3">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary rounded-2xl p-4 items-center active:opacity-80"
          >
            <Text className="text-background font-semibold text-base">Save Layout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="bg-surface border border-border rounded-2xl p-4 items-center active:opacity-80"
          >
            <Text className="text-foreground font-semibold text-base">Reset to Default</Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View className="mx-6 mt-4 p-4 bg-primary/10 rounded-2xl">
          <Text className="text-sm font-semibold text-foreground mb-1">
            💡 Pro Tip
          </Text>
          <Text className="text-sm text-muted">
            Put your most important sections at the top (1, 2) so you see them first. You can use the same number for multiple sections if order doesn't matter.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

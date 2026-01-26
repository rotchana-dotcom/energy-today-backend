import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { getTemplateById, JournalTemplate, TemplateQuestion } from "@/lib/journal-templates";
import { saveJournalEntry, getUserProfile } from "@/lib/storage";
import { JournalEntry } from "@/types";
import { calculateDailyEnergy } from "@/lib/energy-engine";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function TemplateJournalScreen() {
  const router = useRouter();
  const colors = useColors();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const [template, setTemplate] = useState<JournalTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (templateId) {
      const tmpl = getTemplateById(templateId);
      setTemplate(tmpl || null);
    }
  }, [templateId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSave = async () => {
    if (!template) return;

    // Check if at least one question is answered
    const hasAnswers = Object.values(answers).some((a) => a.trim().length > 0);
    if (!hasAnswers) {
      alert("Please answer at least one question");
      return;
    }

    setSaving(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const profile = await getUserProfile();
      if (!profile) {
        alert("Please complete your profile first");
        router.push("/onboarding/welcome");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const dailyEnergy = calculateDailyEnergy(profile, new Date());

      // Format answers as structured text
      const formattedNotes = `📋 ${template.title}\n\n${template.questions
        .map((q) => {
          const answer = answers[q.id] || "";
          if (answer.trim()) {
            return `${q.question}\n${answer}\n`;
          }
          return "";
        })
        .filter((text) => text.length > 0)
        .join("\n")}`;

      const entry: JournalEntry = {
        id: `${today}-${Date.now()}`,
        date: today,
        notes: formattedNotes,
        mood: undefined,
        menstrualCycle: false,
        createdAt: new Date().toISOString(),
      };

      await saveJournalEntry(entry);

      alert("✅ Entry saved!");
      router.push('/(tabs)/');
    } catch (error) {
      console.error("Error saving template entry:", error);
      alert("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Template not found</Text>
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
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-foreground">{template.title}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Template Info */}
        <View className="bg-primary/5 rounded-2xl p-5 mb-6 border border-primary/20">
          <View className="flex-row items-start gap-3 mb-3">
            <Text className="text-3xl">{template.icon}</Text>
            <View className="flex-1">
              <Text className="text-base text-foreground font-semibold mb-2">{template.title}</Text>
              <Text className="text-sm text-muted leading-relaxed">{template.description}</Text>
            </View>
          </View>
          <View className="bg-primary/10 rounded-lg p-3 mt-2">
            <Text className="text-xs text-primary font-medium">💡 {template.energyCorrelation}</Text>
          </View>
        </View>

        {/* Questions */}
        <View className="gap-6">
          {template.questions.map((question, idx) => (
            <View key={question.id} className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {idx + 1}. {question.question}
              </Text>
              {question.type === "multiline" ? (
                <TextInput
                  value={answers[question.id] || ""}
                  onChangeText={(text) => handleAnswerChange(question.id, text)}
                  placeholder={question.placeholder}
                  placeholderTextColor="#9BA1A6"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground min-h-[100px]"
                />
              ) : question.type === "rating" ? (
                <View className="gap-2">
                  <TextInput
                    value={answers[question.id] || ""}
                    onChangeText={(text) => handleAnswerChange(question.id, text)}
                    placeholder={question.placeholder}
                    placeholderTextColor="#9BA1A6"
                    keyboardType="numeric"
                    maxLength={2}
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  />
                  <View className="flex-row justify-between px-1">
                    <Text className="text-xs text-muted">1 (Low)</Text>
                    <Text className="text-xs text-muted">10 (High)</Text>
                  </View>
                </View>
              ) : (
                <TextInput
                  value={answers[question.id] || ""}
                  onChangeText={(text) => handleAnswerChange(question.id, text)}
                  placeholder={question.placeholder}
                  placeholderTextColor="#9BA1A6"
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                />
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <View className="mt-8 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`py-4 rounded-lg ${saving ? "bg-border" : "bg-primary"}`}
          >
            <Text className={`text-center font-semibold ${saving ? "text-muted" : "text-white"}`}>
              {saving ? "Saving..." : "Save Entry"}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-muted text-center mt-3">
            🔒 All entries are stored privately on your device
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

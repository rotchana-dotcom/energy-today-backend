import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { journalTemplates } from "@/lib/journal-templates";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function SelectTemplateScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleSelectTemplate = (templateId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/template-journal?templateId=${templateId}` as any);
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.push('/(tabs)/')} className="active:opacity-70">
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Choose Template</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-sm text-muted mb-4 leading-relaxed">
          Use a template to guide your reflection and track patterns across different activities.
        </Text>

        <View className="gap-3">
          {journalTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleSelectTemplate(template.id)}
              className="bg-surface rounded-2xl p-5 border border-border active:opacity-70"
            >
              <View className="flex-row items-start gap-3">
                <Text className="text-3xl">{template.icon}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-1">{template.title}</Text>
                  <Text className="text-sm text-muted leading-relaxed mb-2">{template.description}</Text>
                  <View className="bg-primary/10 rounded-lg px-3 py-2">
                    <Text className="text-xs text-primary">{template.questions.length} guided questions</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

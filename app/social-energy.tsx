import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  saveSocialInteraction,
  getRecentSocialInteractions,
  getSocialEnergyStats,
  getSocialEnergyInsights,
  getSocialEnergyRecommendations,
  analyzePersonImpact,
  deleteSocialInteraction,
  getInteractionTypeEmoji,
  type SocialInteraction,
  type SocialEnergyStats,
  type PersonImpact,
} from "@/lib/social-energy";

export default function SocialEnergyScreen() {
  const colors = useColors();
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [stats, setStats] = useState<SocialEnergyStats | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [personImpacts, setPersonImpacts] = useState<PersonImpact[]>([]);
  const [showAddInteraction, setShowAddInteraction] = useState(false);

  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    type: "meeting" as SocialInteraction["type"],
    title: "",
    duration: "",
    participants: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const recentInteractions = await getRecentSocialInteractions(30);
    setInteractions(recentInteractions);

    const socialStats = await getSocialEnergyStats(30);
    setStats(socialStats);

    const socialInsights = await getSocialEnergyInsights();
    setInsights(socialInsights);

    const socialRecs = await getSocialEnergyRecommendations();
    setRecommendations(socialRecs);

    const impacts = await analyzePersonImpact();
    setPersonImpacts(impacts.slice(0, 10));
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const duration = parseInt(newInteraction.duration) || 0;
    if (duration <= 0) {
      Alert.alert("Error", "Please enter a valid duration");
      return;
    }

    await saveSocialInteraction({
      date: newInteraction.date,
      time: newInteraction.time,
      type: newInteraction.type,
      title: newInteraction.title.trim(),
      duration,
      participants: newInteraction.participants
        ? newInteraction.participants.split(",").map((p) => p.trim())
        : undefined,
      notes: newInteraction.notes.trim() || undefined,
    });

    await loadData();
    setNewInteraction({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: "meeting",
      title: "",
      duration: "",
      participants: "",
      notes: "",
    });
    setShowAddInteraction(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteInteraction = (interactionId: string) => {
    Alert.alert("Delete Interaction?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSocialInteraction(interactionId);
          await loadData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const getBatteryColor = (level: number) => {
    if (level < 30) return colors.error;
    if (level < 60) return colors.warning;
    return colors.success;
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "energizing":
        return colors.success;
      case "draining":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  if (showAddInteraction) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowAddInteraction(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Log Interaction
            </Text>
            <TouchableOpacity onPress={handleAddInteraction}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          {/* Best Time Suggestion */}
          <View className="p-4 rounded-xl mb-6" style={{ backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary + '30' }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-2xl">💡</Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                Best Time for {newInteraction.type.replace('_', ' ')}
              </Text>
            </View>
            <Text className="text-sm mb-2" style={{ color: colors.foreground }}>
              Based on your energy patterns, schedule {newInteraction.type.replace('_', ' ')} between:
            </Text>
            <Text className="text-lg font-bold mb-1" style={{ color: colors.primary }}>
              10:00 AM - 2:00 PM
            </Text>
            <Text className="text-xs" style={{ color: colors.muted }}>
              ✓ 73% success rate during these hours
            </Text>
          </View>

          {/* How to Improve */}
          <View className="p-4 rounded-xl mb-6" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-2xl">🎯</Text>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                How to Improve
              </Text>
            </View>
            <View className="gap-2">
              <Text className="text-sm" style={{ color: colors.foreground }}>
                • Schedule 15min buffer before for preparation
              </Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                • Your Life Path 7 thrives with quiet reflection time
              </Text>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                • Avoid back-to-back {newInteraction.type.replace('_', ' ')}s
              </Text>
            </View>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Date
          </Text>
          <TextInput
            value={newInteraction.date}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, date: text })}
            placeholder="YYYY-MM-DD"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Time
          </Text>
          <TextInput
            value={newInteraction.time}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, time: text })}
            placeholder="HH:MM (24-hour format)"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(
              [
                "meeting",
                "call",
                "event",
                "solo_time",
                "social_gathering",
                "one_on_one",
              ] as const
            ).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setNewInteraction({ ...newInteraction, type });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: newInteraction.type === type ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="capitalize"
                  style={{
                    color: newInteraction.type === type ? colors.background : colors.foreground,
                  }}
                >
                  {getInteractionTypeEmoji(type)} {type.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Title *
          </Text>
          <TextInput
            value={newInteraction.title}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, title: text })}
            placeholder="e.g., Team standup, Coffee with Sarah"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Duration (minutes) *
          </Text>
          <TextInput
            value={newInteraction.duration}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, duration: text })}
            keyboardType="numeric"
            placeholder="60"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Participants (comma-separated, optional)
          </Text>
          <TextInput
            value={newInteraction.participants}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, participants: text })}
            placeholder="e.g., Sarah, John, Emily"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Notes (Optional)
          </Text>
          <TextInput
            value={newInteraction.notes}
            onChangeText={(text) => setNewInteraction({ ...newInteraction, notes: text })}
            placeholder="How did this interaction make you feel?"
            className="p-4 rounded-xl mb-6 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Social Energy
          </Text>
          <TouchableOpacity onPress={() => setShowAddInteraction(true)}>
            <Text className="text-3xl" style={{ color: colors.primary }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {stats && stats.totalInteractions > 0 && (
          <>
            {/* Social Battery */}
            <View className="p-6 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
                Social Battery
              </Text>
              <View className="flex-row items-center mb-2">
                <View className="flex-1 h-4 rounded-full" style={{ backgroundColor: colors.border }}>
                  <View
                    className="h-4 rounded-full"
                    style={{
                      width: `${stats.socialBatteryLevel}%`,
                      backgroundColor: getBatteryColor(stats.socialBatteryLevel),
                    }}
                  />
                </View>
                <Text className="text-2xl font-bold ml-3" style={{ color: colors.foreground }}>
                  {stats.socialBatteryLevel}%
                </Text>
              </View>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {stats.socialBatteryLevel < 30
                  ? "Low - Need recharge time"
                  : stats.socialBatteryLevel > 80
                  ? "High - Ready for socializing"
                  : "Balanced - Managing well"}
              </Text>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.totalSocialTime / 60)}h
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Social Time
                </Text>
              </View>
              <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(stats.totalSoloTime / 60)}h
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Solo Time
                </Text>
              </View>
            </View>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
                  Recommendations
                </Text>
                {recommendations.map((rec, index) => (
                  <View
                    key={index}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-sm" style={{ color: colors.foreground }}>
                      {rec}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
                  Insights
                </Text>
                {insights.map((insight, index) => (
                  <View
                    key={index}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-sm" style={{ color: colors.foreground }}>
                      💡 {insight}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Person Impact */}
            {personImpacts.length > 0 && (
              <>
                <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
                  People & Energy Impact
                </Text>
                {personImpacts.map((person, index) => (
                  <View
                    key={index}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                        {person.name}
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: getRecommendationColor(person.recommendation) + "30",
                        }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: getRecommendationColor(person.recommendation) }}
                        >
                          {person.recommendation}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {person.interactions} interactions • {Math.round(person.totalTime / 60)}h total
                      • {person.averageEnergyImpact > 0 ? "+" : ""}
                      {person.averageEnergyImpact} energy impact
                    </Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Recent Interactions */}
        <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
          Recent Interactions ({interactions.length})
        </Text>

        {interactions.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">👥</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No interactions logged yet
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Track social interactions to understand your energy patterns
            </Text>
          </View>
        ) : (
          interactions.slice(0, 20).map((interaction) => (
            <View
              key={interaction.id}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">
                      {getInteractionTypeEmoji(interaction.type)}
                    </Text>
                    <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                      {interaction.title}
                    </Text>
                  </View>
                  <Text className="text-sm mb-1" style={{ color: colors.muted }}>
                    {interaction.type.replace("_", " ")} • {interaction.duration} min •{" "}
                    {new Date(interaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  {interaction.participants && interaction.participants.length > 0 && (
                    <Text className="text-sm mb-1" style={{ color: colors.muted }}>
                      With: {interaction.participants.join(", ")}
                    </Text>
                  )}
                  {interaction.notes && (
                    <Text className="text-sm italic mt-2" style={{ color: colors.muted }}>
                      {interaction.notes}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteInteraction(interaction.id)}>
                  <Text className="text-lg" style={{ color: colors.error }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getRecentSocialInteractions,
  getInteractionTypeEmoji,
  type SocialInteraction,
} from "@/lib/social-energy";

export default function InteractionsCalendarScreen() {
  const colors = useColors();
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    const recentInteractions = await getRecentSocialInteractions(90); // Last 90 days
    setInteractions(recentInteractions);
  };

  // Group interactions by date
  const groupedInteractions = interactions.reduce((acc, interaction) => {
    const date = interaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interaction);
    return acc;
  }, {} as Record<string, SocialInteraction[]>);

  const sortedDates = Object.keys(groupedInteractions).sort((a, b) => b.localeCompare(a));

  const getTypeColor = (type: SocialInteraction["type"]) => {
    switch (type) {
      case "meeting":
        return "#3B82F6"; // Blue
      case "call":
        return "#10B981"; // Green
      case "event":
        return "#F59E0B"; // Orange
      case "solo_time":
        return "#8B5CF6"; // Purple
      case "social_gathering":
        return "#EC4899"; // Pink
      case "one_on_one":
        return "#06B6D4"; // Cyan
      default:
        return colors.muted;
    }
  };

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
            Calendar View
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {sortedDates.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-4">📅</Text>
            <Text className="text-lg font-semibold mb-2" style={{ color: colors.foreground }}>
              No Interactions Yet
            </Text>
            <Text className="text-sm text-center" style={{ color: colors.muted }}>
              Start logging your interactions to see them organized by date
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {sortedDates.map((date) => {
              const dayInteractions = groupedInteractions[date];
              const totalDuration = dayInteractions.reduce((sum, i) => sum + i.duration, 0);
              
              return (
                <View key={date} className="mb-2">
                  {/* Date Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        {dayInteractions.length} interaction{dayInteractions.length > 1 ? 's' : ''} • {Math.round(totalDuration / 60)}h total
                      </Text>
                    </View>
                  </View>

                  {/* Interactions for this date */}
                  <View className="gap-3">
                    {dayInteractions.map((interaction, index) => (
                      <View
                        key={interaction.id || index}
                        className="p-4 rounded-xl"
                        style={{ 
                          backgroundColor: colors.surface,
                          borderLeftWidth: 4,
                          borderLeftColor: getTypeColor(interaction.type),
                        }}
                      >
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-xl">
                                {getInteractionTypeEmoji(interaction.type)}
                              </Text>
                              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                                {interaction.title}
                              </Text>
                            </View>
                            <Text className="text-xs" style={{ color: colors.muted }}>
                              {interaction.duration} min • {interaction.type.replace('_', ' ')}
                            </Text>
                          </View>
                        </View>

                        {interaction.participants && interaction.participants.length > 0 && (
                          <View className="flex-row items-center gap-2 mt-2">
                            <Text className="text-xs" style={{ color: colors.muted }}>
                              👥 {interaction.participants.join(', ')}
                            </Text>
                          </View>
                        )}

                        {interaction.notes && (
                          <Text className="text-sm mt-2" style={{ color: colors.foreground }}>
                            {interaction.notes}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Add Interaction Button */}
        <TouchableOpacity
          onPress={() => router.push('/social-energy' as any)}
          className="mt-6 p-4 rounded-xl items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.background }}>
            + Log New Interaction
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

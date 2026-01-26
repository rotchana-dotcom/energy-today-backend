import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Modal } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { UserProfile } from "@/types";
import {
  getRecurringActivities,
  createRecurringActivity,
  getAllRecurringInsights,
  getUpcomingOccurrences,
  recordActivityOccurrence,
  deleteRecurringActivity,
  RecurringActivity,
  RecurringActivityInsight,
  RecurrencePattern,
} from "@/lib/recurring-activities";

export default function RecurringActivitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<RecurringActivityInsight[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityPattern, setNewActivityPattern] = useState<RecurrencePattern>("weekly");
  const [newActivityDay, setNewActivityDay] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    
    const allInsights = await getAllRecurringInsights();
    setInsights(allInsights);
    
    setLoading(false);
  };

  const handleAddActivity = async () => {
    if (!newActivityName.trim()) return;
    
    if (newActivityPattern === "weekly") {
      await createRecurringActivity(newActivityName, "weekly", newActivityDay);
    } else {
      await createRecurringActivity(newActivityName, "monthly", undefined, newActivityDay);
    }
    
    setNewActivityName("");
    setNewActivityDay(1);
    setShowAddModal(false);
    await loadData();
  };

  const handleDeleteActivity = async (activityId: string) => {
    await deleteRecurringActivity(activityId);
    await loadData();
  };

  if (loading || !profile) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Recurring Activities</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="bg-primary/10 rounded-lg p-4">
            <Text className="text-sm text-foreground leading-relaxed">
              Track weekly or monthly activities to see how they align with your energy patterns over time.
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="bg-primary rounded-lg py-3"
          >
            <Text className="text-white font-semibold text-center">+ Add Recurring Activity</Text>
          </TouchableOpacity>

          {/* Insights */}
          {insights.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-4xl mb-4">📅</Text>
              <Text className="text-base text-muted text-center">
                No recurring activities yet.{"\n"}Add one to start tracking patterns!
              </Text>
            </View>
          ) : (
            insights.map(insight => {
              const upcoming = getUpcomingOccurrences(insight.activity, 30);
              
              return (
                <View
                  key={insight.activity.id}
                  className="bg-surface rounded-2xl p-5 border border-border gap-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {insight.activity.name}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {insight.activity.pattern === "weekly"
                          ? `Every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][insight.activity.dayOfWeek!]}`
                          : `Monthly on day ${insight.activity.dayOfMonth}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteActivity(insight.activity.id)}
                      className="p-2"
                    >
                      <Text className="text-error">🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-background rounded-lg p-3">
                      <Text className="text-xs text-muted">Avg Energy</Text>
                      <Text className="text-xl font-bold text-foreground mt-1">
                        {insight.averageEnergyScore.toFixed(0)}%
                      </Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-3">
                      <Text className="text-xs text-muted">Success Rate</Text>
                      <Text className="text-xl font-bold text-foreground mt-1">
                        {insight.successRate.toFixed(0)}%
                      </Text>
                    </View>
                    <View className="flex-1 bg-background rounded-lg p-3">
                      <Text className="text-xs text-muted">Occurrences</Text>
                      <Text className="text-xl font-bold text-foreground mt-1">
                        {insight.activity.history.length}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-background rounded-lg p-3">
                    <Text className="text-xs text-muted mb-2">INSIGHT</Text>
                    <Text className="text-sm text-foreground leading-relaxed">
                      {insight.recommendation}
                    </Text>
                  </View>

                  {upcoming.length > 0 && (
                    <View className="bg-primary/5 rounded-lg p-3">
                      <Text className="text-xs text-muted mb-2">NEXT OCCURRENCE</Text>
                      <Text className="text-sm font-medium text-foreground">
                        {upcoming[0].toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <Text className="text-xl font-bold text-foreground">Add Recurring Activity</Text>
            
            <View>
              <Text className="text-sm text-muted mb-2">Activity Name</Text>
              <TextInput
                value={newActivityName}
                onChangeText={setNewActivityName}
                placeholder="e.g., Team Meeting, Monthly Review"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9BA1A6"
              />
            </View>

            <View>
              <Text className="text-sm text-muted mb-2">Pattern</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setNewActivityPattern("weekly")}
                  className={`flex-1 py-3 rounded-lg border ${
                    newActivityPattern === "weekly"
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      newActivityPattern === "weekly" ? "text-white" : "text-foreground"
                    }`}
                  >
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNewActivityPattern("monthly")}
                  className={`flex-1 py-3 rounded-lg border ${
                    newActivityPattern === "monthly"
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      newActivityPattern === "monthly" ? "text-white" : "text-foreground"
                    }`}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm text-muted mb-2">
                {newActivityPattern === "weekly" ? "Day of Week" : "Day of Month"}
              </Text>
              <TextInput
                value={newActivityDay.toString()}
                onChangeText={text => setNewActivityDay(parseInt(text) || 1)}
                keyboardType="number-pad"
                placeholder={newActivityPattern === "weekly" ? "0-6 (0=Sunday)" : "1-31"}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9BA1A6"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-lg bg-surface border border-border"
              >
                <Text className="text-center font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddActivity}
                className="flex-1 py-3 rounded-lg bg-primary"
              >
                <Text className="text-center font-medium text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

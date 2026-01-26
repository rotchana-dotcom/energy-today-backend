import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  getActivityHistory,
  getUpcomingActivities,
  getCompletedActivities,
  updateActivityOutcome,
  calculatePredictionAccuracy,
  ActivityHistoryEntry,
} from "@/lib/activity-history";

export default function ActivityHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"upcoming" | "completed">("upcoming");
  const [upcomingActivities, setUpcomingActivities] = useState<ActivityHistoryEntry[]>([]);
  const [completedActivities, setCompletedActivities] = useState<ActivityHistoryEntry[]>([]);
  const [accuracy, setAccuracy] = useState({ totalCompleted: 0, accurate: 0, accuracyRate: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const upcoming = await getUpcomingActivities();
    const completed = await getCompletedActivities();
    const acc = await calculatePredictionAccuracy();

    setUpcomingActivities(upcoming);
    setCompletedActivities(completed);
    setAccuracy(acc);
    setLoading(false);
  };

  const handleMarkComplete = async (
    id: string,
    outcome: "great" | "good" | "okay" | "difficult"
  ) => {
    await updateActivityOutcome(id, outcome, outcomeNotes);
    setEditingId(null);
    setOutcomeNotes("");
    await loadData();
  };

  const getAlignmentColor = (alignment: "strong" | "moderate" | "challenging") => {
    if (alignment === "strong") return "text-success";
    if (alignment === "moderate") return "text-warning";
    return "text-error";
  };

  const getAlignmentBg = (alignment: "strong" | "moderate" | "challenging") => {
    if (alignment === "strong") return "bg-success/10 border-success";
    if (alignment === "moderate") return "bg-warning/10 border-warning";
    return "bg-error/10 border-error";
  };

  const getOutcomeEmoji = (outcome: "great" | "good" | "okay" | "difficult") => {
    if (outcome === "great") return "🌟";
    if (outcome === "good") return "✅";
    if (outcome === "okay") return "👍";
    return "😓";
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Activity History</Text>
              <Text className="text-sm text-muted mt-1">
                Track your scheduled activities and validate predictions
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Accuracy Stats */}
          {accuracy.totalCompleted > 0 && (
            <View className="bg-primary/10 rounded-2xl p-5 border border-primary">
              <Text className="text-sm font-medium text-muted mb-2">PREDICTION ACCURACY</Text>
              <View className="flex-row items-baseline gap-2">
                <Text className="text-4xl font-bold text-primary">{accuracy.accuracyRate}%</Text>
                <Text className="text-sm text-muted">
                  ({accuracy.accurate} of {accuracy.totalCompleted} activities)
                </Text>
              </View>
            </View>
          )}

          {/* View Toggle */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setView("upcoming")}
              className={`flex-1 py-3 rounded-lg border ${
                view === "upcoming"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  view === "upcoming" ? "text-white" : "text-foreground"
                }`}
              >
                Upcoming ({upcomingActivities.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView("completed")}
              className={`flex-1 py-3 rounded-lg border ${
                view === "completed"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  view === "completed" ? "text-white" : "text-foreground"
                }`}
              >
                Completed ({completedActivities.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Activity List */}
          {view === "upcoming" && (
            <View className="gap-4">
              {upcomingActivities.length === 0 ? (
                <View className="bg-surface rounded-2xl p-8 items-center">
                  <Text className="text-4xl mb-3">📅</Text>
                  <Text className="text-base text-foreground font-medium">No Upcoming Activities</Text>
                  <Text className="text-sm text-muted mt-2 text-center">
                    Schedule activities from the Calendar tab
                  </Text>
                </View>
              ) : (
                upcomingActivities.map((activity) => (
                  <View
                    key={activity.id}
                    className={`rounded-2xl p-5 border ${getAlignmentBg(activity.predictedAlignment)}`}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {activity.activity}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(activity.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className={`text-xs font-medium ${getAlignmentColor(activity.predictedAlignment)} uppercase`}>
                          {activity.predictedAlignment}
                        </Text>
                        <Text className="text-xs text-muted mt-1 capitalize">
                          {activity.predictedBestTime}
                        </Text>
                      </View>
                    </View>

                    {editingId === activity.id ? (
                      <View className="gap-3 mt-3 pt-3 border-t border-border">
                        <Text className="text-sm font-medium text-foreground">How did it go?</Text>
                        <View className="flex-row gap-2">
                          {(["great", "good", "okay", "difficult"] as const).map((outcome) => (
                            <TouchableOpacity
                              key={outcome}
                              onPress={() => handleMarkComplete(activity.id, outcome)}
                              className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
                            >
                              <Text className="text-xl mb-1">{getOutcomeEmoji(outcome)}</Text>
                              <Text className="text-xs text-foreground capitalize">{outcome}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TextInput
                          placeholder="Optional notes..."
                          value={outcomeNotes}
                          onChangeText={setOutcomeNotes}
                          className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                          placeholderTextColor="#687076"
                          multiline
                        />
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(null);
                            setOutcomeNotes("");
                          }}
                          className="py-2"
                        >
                          <Text className="text-sm text-muted text-center">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setEditingId(activity.id)}
                        className="mt-3 py-2 bg-primary/20 rounded-lg"
                      >
                        <Text className="text-sm font-medium text-primary text-center">
                          Mark as Complete
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {view === "completed" && (
            <View className="gap-4">
              {completedActivities.length === 0 ? (
                <View className="bg-surface rounded-2xl p-8 items-center">
                  <Text className="text-4xl mb-3">✅</Text>
                  <Text className="text-base text-foreground font-medium">No Completed Activities</Text>
                  <Text className="text-sm text-muted mt-2 text-center">
                    Complete upcoming activities to see them here
                  </Text>
                </View>
              ) : (
                completedActivities.map((activity) => (
                  <View
                    key={activity.id}
                    className="bg-surface rounded-2xl p-5 border border-border"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {activity.activity}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(activity.scheduledDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-2xl">{activity.actualOutcome && getOutcomeEmoji(activity.actualOutcome)}</Text>
                        <Text className="text-xs text-muted mt-1 capitalize">
                          {activity.actualOutcome}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-2 mb-2">
                      <Text className="text-xs text-muted">Predicted:</Text>
                      <Text className={`text-xs font-medium ${getAlignmentColor(activity.predictedAlignment)} uppercase`}>
                        {activity.predictedAlignment}
                      </Text>
                      <Text className="text-xs text-muted">•</Text>
                      <Text className="text-xs text-muted capitalize">{activity.predictedBestTime}</Text>
                    </View>

                    {activity.actualNotes && (
                      <View className="mt-3 pt-3 border-t border-border">
                        <Text className="text-xs text-muted leading-relaxed">{activity.actualNotes}</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { calculateDailyEnergy } from "@/lib/energy-engine";
import { UserProfile, DailyEnergy } from "@/types";
import { getEnergyForecast } from "@/lib/energy-trends";
import * as Haptics from "expo-haptics";

interface PlannedActivity {
  id: string;
  date: string;
  activity: string;
  timeOfDay: "morning" | "afternoon" | "evening";
}

const ACTIVITY_TEMPLATES = [
  "Important meeting",
  "Product launch",
  "Strategic planning",
  "Team collaboration",
  "Creative work",
  "Client presentation",
  "Shopping",
  "Networking event",
  "Personal development",
  "Administrative tasks",
];

export default function WeeklyPlanScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState("");
  const [selectedTime, setSelectedTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [isPro, setIsPro] = useState(false);

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
    
    if (subscription.isPro) {
      const forecast = getEnergyForecast(userProfile, 7);
      setWeekData(forecast);
    }
    
    setLoading(false);
  };

  const getAlignmentColor = (alignment: string) => {
    if (alignment === "strong") return "bg-success";
    if (alignment === "moderate") return "bg-warning";
    return "bg-error";
  };

  const getAlignmentDot = (alignment: string) => {
    if (alignment === "strong") return "🟢";
    if (alignment === "moderate") return "🟡";
    return "🔴";
  };

  const addActivity = () => {
    if (!selectedDate || !newActivity.trim()) return;

    const activity: PlannedActivity = {
      id: Date.now().toString(),
      date: selectedDate,
      activity: newActivity.trim(),
      timeOfDay: selectedTime,
    };

    setPlannedActivities([...plannedActivities, activity]);
    setNewActivity("");
    setSelectedDate(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeActivity = (id: string) => {
    setPlannedActivities(plannedActivities.filter((a) => a.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getActivitiesForDate = (date: string) => {
    return plannedActivities.filter((a) => a.date === date);
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
          <Text className="text-4xl">📅</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            Weekly Planning
          </Text>
          <Text className="text-base text-muted text-center px-4">
            Plan your week strategically by scheduling activities during your highest energy alignment periods.
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
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Week Ahead</Text>
              <Text className="text-sm text-muted mt-1">
                Plan your activities based on energy alignment
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/business')}
              className="bg-surface border border-border rounded-full p-2"
            >
              <Text className="text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View className="flex-row items-center gap-4 bg-surface rounded-lg p-3 border border-border">
            <View className="flex-row items-center gap-2">
              <Text>🟢</Text>
              <Text className="text-xs text-muted">Strong</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text>🟡</Text>
              <Text className="text-xs text-muted">Moderate</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text>🔴</Text>
              <Text className="text-xs text-muted">Challenging</Text>
            </View>
          </View>

          {/* Weekly Timeline */}
          <View className="gap-3">
            {weekData.map((day, index) => {
              const dayActivities = getActivitiesForDate(day.date);
              const isSelected = selectedDate === day.date;

              return (
                <TouchableOpacity
                  key={day.date}
                  onPress={() => {
                    setSelectedDate(isSelected ? null : day.date);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`bg-surface rounded-2xl p-4 border ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  {/* Day Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">{getAlignmentDot(day.alignment)}</Text>
                      <View>
                        <Text className="text-base font-semibold text-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </Text>
                        <Text className="text-xs text-muted">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-muted">Alignment</Text>
                      <Text className="text-lg font-bold text-foreground">
                        {day.alignmentScore}%
                      </Text>
                    </View>
                  </View>

                  {/* Planned Activities */}
                  {dayActivities.length > 0 && (
                    <View className="gap-2 mb-3">
                      {dayActivities.map((activity) => (
                        <View
                          key={activity.id}
                          className="flex-row items-center gap-2 bg-background rounded-lg p-2"
                        >
                          <Text className="text-xs">
                            {activity.timeOfDay === "morning"
                              ? "🌅"
                              : activity.timeOfDay === "afternoon"
                              ? "☀️"
                              : "🌙"}
                          </Text>
                          <Text className="flex-1 text-sm text-foreground">
                            {activity.activity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeActivity(activity.id)}
                            className="bg-error/10 rounded-full px-2 py-1"
                          >
                            <Text className="text-xs text-error">✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Activity Form (when selected) */}
                  {isSelected && (
                    <View className="pt-3 border-t border-border gap-3">
                      <Text className="text-xs font-medium text-muted">ADD ACTIVITY</Text>

                      {/* Activity Templates */}
                      <View className="flex-row flex-wrap gap-2">
                        {ACTIVITY_TEMPLATES.map((template) => (
                          <TouchableOpacity
                            key={template}
                            onPress={() => {
                              setNewActivity(template);
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
                          >
                            <Text className="text-xs text-primary">{template}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Custom Activity Input */}
                      <TextInput
                        value={newActivity}
                        onChangeText={setNewActivity}
                        placeholder="Or type custom activity..."
                        placeholderTextColor="#9BA1A6"
                        className="bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                      />

                      {/* Time of Day Selector */}
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => setSelectedTime("morning")}
                          className={`flex-1 items-center py-2 rounded-lg border ${
                            selectedTime === "morning"
                              ? "bg-primary/20 border-primary"
                              : "bg-background border-border"
                          }`}
                        >
                          <Text className="text-lg">🌅</Text>
                          <Text className="text-xs text-muted">Morning</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setSelectedTime("afternoon")}
                          className={`flex-1 items-center py-2 rounded-lg border ${
                            selectedTime === "afternoon"
                              ? "bg-primary/20 border-primary"
                              : "bg-background border-border"
                          }`}
                        >
                          <Text className="text-lg">☀️</Text>
                          <Text className="text-xs text-muted">Afternoon</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setSelectedTime("evening")}
                          className={`flex-1 items-center py-2 rounded-lg border ${
                            selectedTime === "evening"
                              ? "bg-primary/20 border-primary"
                              : "bg-background border-border"
                          }`}
                        >
                          <Text className="text-lg">🌙</Text>
                          <Text className="text-xs text-muted">Evening</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Add Button */}
                      <TouchableOpacity
                        onPress={addActivity}
                        disabled={!newActivity.trim()}
                        className={`py-2 rounded-lg ${
                          newActivity.trim() ? "bg-primary" : "bg-border"
                        }`}
                      >
                        <Text
                          className={`text-center font-semibold ${
                            newActivity.trim() ? "text-white" : "text-muted"
                          }`}
                        >
                          Add Activity
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Summary */}
          <View className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
            <Text className="text-sm font-medium text-primary mb-2">PLANNING TIP</Text>
            <Text className="text-sm text-foreground leading-relaxed">
              Schedule important activities on days with strong alignment (🟢) for best results.
              Use challenging days (🔴) for routine tasks and self-care.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

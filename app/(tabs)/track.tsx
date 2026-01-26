import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

interface TodayLog {
  sleep?: boolean;
  meditation?: boolean;
  meals?: number;
  workout?: boolean;
  outcomes?: number;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Sleep",
    icon: "🛏️",
    route: "/sleep-tracker",
    color: "#8B5CF6",
    description: "Log last night's sleep",
  },
  {
    title: "Meditation",
    icon: "🧘",
    route: "/meditation-timer",
    color: "#06B6D4",
    description: "Start meditation session",
  },
  {
    title: "Meals",
    icon: "🍎",
    route: "/nutrition-tracker",
    color: "#10B981",
    description: "Log your meals",
  },
  {
    title: "Workout",
    icon: "💪",
    route: "/workout-tracking",
    color: "#F59E0B",
    description: "Log exercise",
  },
  {
    title: "Outcomes",
    icon: "📊",
    route: "/results-tracking",
    color: "#EF4444",
    description: "Log business results",
  },
];

export default function TrackScreen() {
  const colors = useColors();
  const [todayLog, setTodayLog] = useState<TodayLog>({});

  useEffect(() => {
    loadTodayLog();
  }, []);

  const loadTodayLog = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check what's been logged today
      const sleepData = await AsyncStorage.getItem('sleep_entries');
      const meditationData = await AsyncStorage.getItem('meditation_sessions');
      const nutritionData = await AsyncStorage.getItem('nutrition_entries');
      const workoutData = await AsyncStorage.getItem('workout_entries');
      const outcomesData = await AsyncStorage.getItem('outcomes');

      const log: TodayLog = {};

      if (sleepData) {
        const entries = JSON.parse(sleepData);
        log.sleep = entries.some((e: any) => e.date === today);
      }

      if (meditationData) {
        const sessions = JSON.parse(meditationData);
        log.meditation = sessions.some((s: any) => s.date?.startsWith(today));
      }

      if (nutritionData) {
        const entries = JSON.parse(nutritionData);
        const todayMeals = entries.filter((e: any) => e.date === today);
        log.meals = todayMeals.length;
      }

      if (workoutData) {
        const entries = JSON.parse(workoutData);
        log.workout = entries.some((e: any) => e.date === today);
      }

      if (outcomesData) {
        const outcomes = JSON.parse(outcomesData);
        const todayOutcomes = outcomes.filter((o: any) => o.date === today);
        log.outcomes = todayOutcomes.length;
      }

      setTodayLog(log);
    } catch (error) {
      console.error("Failed to load today's log:", error);
    }
  };

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  const getActionStatus = (action: QuickAction): string | null => {
    switch (action.title) {
      case "Sleep":
        return todayLog.sleep ? "✓ Logged" : null;
      case "Meditation":
        return todayLog.meditation ? "✓ Done" : null;
      case "Meals":
        return todayLog.meals ? `✓ ${todayLog.meals} logged` : null;
      case "Workout":
        return todayLog.workout ? "✓ Logged" : null;
      case "Outcomes":
        return todayLog.outcomes ? `✓ ${todayLog.outcomes} logged` : null;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-bold text-foreground">Track</Text>
          <Text className="text-base text-muted mt-1">
            Quick logging for daily activities
          </Text>
        </View>

        {/* Today's Progress */}
        <View className="mx-6 mb-6 p-4 bg-surface rounded-2xl">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Today's Progress
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-sm text-muted">
                {Object.values(todayLog).filter(Boolean).length} / 5 activities logged
              </Text>
            </View>
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: Object.values(todayLog).filter(Boolean).length >= i
                      ? colors.primary
                      : colors.border,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6">
          <Text className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Quick Actions
          </Text>
          <View className="gap-3">
            {QUICK_ACTIONS.map((action, index) => {
              const status = getActionStatus(action);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleActionPress(action.route)}
                  className="bg-surface rounded-2xl p-4 flex-row items-center active:opacity-70"
                >
                  {/* Icon */}
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: action.color + "20" }}
                  >
                    <Text className="text-2xl">{action.icon}</Text>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {action.title}
                    </Text>
                    <Text className="text-sm text-muted mt-0.5">
                      {status || action.description}
                    </Text>
                  </View>

                  {/* Status or Chevron */}
                  {status ? (
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: colors.success + "20" }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                        Done
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-muted text-lg">›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tip */}
        <View className="mx-6 mt-6 p-4 bg-primary/10 rounded-2xl">
          <Text className="text-sm font-semibold text-foreground mb-1">
            💡 Daily Tracking Tip
          </Text>
          <Text className="text-sm text-muted">
            Log your activities consistently for 7 days to see personalized patterns and AI insights become more accurate.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

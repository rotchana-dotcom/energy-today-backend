import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscriptionStatus } from "@/lib/subscription-status";
import { router } from "expo-router";


const { width } = Dimensions.get("window");
const chartWidth = width - 48; // padding

export default function HealthOverview() {
  console.log('[HealthOverview] Component mounting...');
  const colors = useColors();
  console.log('[HealthOverview] useColors:', colors);
  const { isPro } = useSubscriptionStatus();
  console.log('[HealthOverview] isPro:', isPro);
  
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [foodData, setFoodData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [meditationData, setMeditationData] = useState<any[]>([]);
  const [chiData, setChiData] = useState<any[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const sleep = await AsyncStorage.getItem("sleep_entries");
      const food = await AsyncStorage.getItem("food_entries");
      const weight = await AsyncStorage.getItem("weight_entries");
      const meditation = await AsyncStorage.getItem("meditation_sessions");
      const chi = await AsyncStorage.getItem("chi_entries");

      if (sleep) setSleepData(JSON.parse(sleep));
      if (food) setFoodData(JSON.parse(food));
      if (weight) setWeightData(JSON.parse(weight));
      if (meditation) setMeditationData(JSON.parse(meditation));
      if (chi) setChiData(JSON.parse(chi));
    } catch (error) {
      console.error("Failed to load health data:", error);
    }
  };

  const getLast7Days = () => {
    console.log('[HealthOverview] getLast7Days called');
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const getSleepQualityData = () => {
    console.log('[HealthOverview] getSleepQualityData called');
    const days = getLast7Days();
    return days.map((day) => {
      const entry = sleepData.find((e) => e.date === day);
      return entry ? entry.quality : 0;
    });
  };

  const getWeightData = () => {
    console.log('[HealthOverview] getWeightData called');
    const days = getLast7Days();
    return days.map((day) => {
      const entry = weightData.find((e) => e.date === day);
      return entry ? entry.weight : null;
    });
  };

  const getChiEnergyData = () => {
    console.log('[HealthOverview] getChiEnergyData called');
    const days = getLast7Days();
    return days.map((day) => {
      const entry = chiData.find((e) => e.date === day);
      return entry ? entry.energyLevel : 0;
    });
  };

  const renderSimpleLineChart = (data: (number | null)[], color: string, maxValue: number) => {
    const validData = data.map((d) => (d === null ? 0 : d));
    const max = Math.max(...validData, maxValue);
    const chartHeight = 100;
    const pointWidth = chartWidth / (data.length - 1);

    return (
      <View style={{ height: chartHeight, width: chartWidth }}>
        <View className="flex-row h-full items-end justify-between">
          {validData.map((value, index) => {
            const height = (value / max) * chartHeight;
            return (
              <View key={index} className="items-center flex-1">
                <View
                  style={{
                    height: height || 2,
                    backgroundColor: value > 0 ? color : colors.border,
                    width: 8,
                  }}
                  className="rounded-t"
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getTodayStats = () => {
    console.log('[HealthOverview] getTodayStats called');
    const today = new Date().toISOString().split("T")[0];
    
    const todaySleep = sleepData.find((e) => e.date === today);
    const todayCalories = foodData
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.calories, 0);
    const todayMeditation = meditationData.filter(
      (e) => e.date === today && e.completed
    ).length;
    const todayChi = chiData.find((e) => e.date === today);

    return {
      sleep: todaySleep ? `${todaySleep.quality}/5` : "No data",
      calories: todayCalories > 0 ? `${todayCalories} cal` : "No data",
      meditation: `${todayMeditation} sessions`,
      chi: todayChi ? `${todayChi.energyLevel}/10` : "No data",
    };
  };

  console.log('[HealthOverview] About to call getTodayStats...');
  const stats = getTodayStats();
  console.log('[HealthOverview] stats:', stats);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Pre-calculate weight chart data to avoid issues in JSX
  console.log('[HealthOverview] About to call getWeightData...');
  const weightChartData = getWeightData();
  console.log('[HealthOverview] weightChartData:', weightChartData);
  const validWeights = weightChartData.filter((d): d is number => d !== null);
  console.log('[HealthOverview] validWeights:', validWeights);
  const maxWeight = validWeights.length > 0 ? Math.max(...validWeights) : 1;
  console.log('[HealthOverview] maxWeight:', maxWeight);

  console.log('[HealthOverview] About to render...');
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Health & Wellness</Text>
        <Text className="text-sm text-muted mb-6">
          Your holistic health dashboard
        </Text>

        {/* Quick Stats */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 min-w-[45%] bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Sleep Quality</Text>
            <Text className="text-xl font-bold text-foreground">{stats.sleep}</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Calories Today</Text>
            <Text className="text-xl font-bold text-foreground">{stats.calories}</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Meditation</Text>
            <Text className="text-xl font-bold text-foreground">{stats.meditation}</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Chi Energy</Text>
            <Text className="text-xl font-bold text-foreground">{stats.chi}</Text>
          </View>
        </View>

        {/* Category Cards */}
        <View className="gap-3 mb-6">
          <Pressable
            onPress={() => router.push("/health/sleep")}
            className="bg-surface rounded-2xl p-4 border border-border"
          >
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  🌙 Sleep Tracker
                </Text>
                <Text className="text-sm text-muted">
                  Track sleep cycles & lunar patterns
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            {sleepData.length > 0 && (
              <View>
                <Text className="text-xs text-muted mb-2">Last 7 Days</Text>
                {renderSimpleLineChart(getSleepQualityData(), colors.primary, 5)}
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/health/diet")}
            className="bg-surface rounded-2xl p-4 border border-border"
          >
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  🍎 Diet & Weight
                </Text>
                <Text className="text-sm text-muted">
                  Log food & track BMI
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            {weightData.length > 0 && (
              <View>
                <Text className="text-xs text-muted mb-2">Weight Trend</Text>
                {renderSimpleLineChart(weightChartData, colors.success, maxWeight)}
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/health/meditation")}
            className="bg-surface rounded-2xl p-4 border border-border"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  🧘 Meditation
                </Text>
                <Text className="text-sm text-muted">
                  Guided sessions & mindfulness
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            {meditationData.length > 0 && (
              <View className="mt-3">
                <Text className="text-sm text-muted">
                  {meditationData.filter((s) => s.completed).length} sessions completed
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/health/chi")}
            className="bg-surface rounded-2xl p-4 border border-border"
          >
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  ⚡ Chi & Energy Flow
                </Text>
                <Text className="text-sm text-muted">
                  Track energy levels & chakras
                </Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            {chiData.length > 0 && (
              <View>
                <Text className="text-xs text-muted mb-2">Energy Level</Text>
                {renderSimpleLineChart(getChiEnergyData(), colors.warning, 10)}
              </View>
            )}
          </Pressable>
        </View>

        {/* AI Insights (Pro) */}
        {isPro && (sleepData.length > 3 || chiData.length > 3) && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">
              🤖 AI Insights (Pro)
            </Text>
            {sleepData.length > 3 && (
              <View className="mb-3">
                <Text className="text-sm text-foreground font-semibold mb-1">
                  Sleep Pattern
                </Text>
                <Text className="text-sm text-muted">
                  Your sleep quality averages{" "}
                  {(
                    sleepData.reduce((sum, e) => sum + e.quality, 0) / sleepData.length
                  ).toFixed(1)}
                  /5. Consider tracking moon phases for deeper insights.
                </Text>
              </View>
            )}
            {chiData.length > 3 && (
              <View>
                <Text className="text-sm text-foreground font-semibold mb-1">
                  Energy Flow
                </Text>
                <Text className="text-sm text-muted">
                  Your average energy level is{" "}
                  {(
                    chiData.reduce((sum, e) => sum + e.energyLevel, 0) / chiData.length
                  ).toFixed(1)}
                  /10. Try morning meditation to boost your chi.
                </Text>
              </View>
            )}
          </View>
        )}

        {!isPro && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Unlock Pro Features
            </Text>
            <Text className="text-sm text-muted mb-3">
              • AI-powered health insights{"\n"}
              • Lunar cycle correlations{"\n"}
              • Unlimited history for all trackers{"\n"}
              • Advanced chakra tracking{"\n"}
              • Personalized recommendations
            </Text>
            <Pressable
              onPress={() => router.push("/upgrade")}
              style={{ backgroundColor: colors.primary }}
              className="rounded-xl py-3 items-center"
            >
              <Text style={{ color: colors.background }} className="font-semibold">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

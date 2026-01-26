import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  generateWeeklyForecast,
  getShortDayName,
  getTrendEmoji,
  getEnergyLevelDescription,
  type WeeklyForecast,
  type DayForecast,
} from "@/lib/energy-forecast";

export default function EnergyForecastScreen() {
  const colors = useColors();
  const [forecast, setForecast] = useState<WeeklyForecast | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    const weeklyForecast = await generateWeeklyForecast();
    setForecast(weeklyForecast);
    setSelectedDay(weeklyForecast.days[0]); // Select today by default
    setLoading(false);
  };

  const getEnergyColor = (energy: number) => {
    if (energy < 30) return colors.error;
    if (energy < 50) return colors.warning;
    if (energy < 70) return colors.primary;
    return colors.success;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 60) return colors.error;
    if (confidence < 80) return colors.warning;
    return colors.success;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return colors.success;
      case "negative":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl" style={{ color: colors.muted }}>
            Generating forecast...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!forecast) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl" style={{ color: colors.error }}>
            Failed to generate forecast
          </Text>
        </View>
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
            Energy Forecast
          </Text>
          <TouchableOpacity onPress={loadForecast}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              🔄
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overall Summary */}
        <View className="p-6 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
                {forecast.averageEnergy}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Avg Energy
              </Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">{getTrendEmoji(forecast.overallTrend)}</Text>
                <Text className="text-lg font-semibold capitalize" style={{ color: colors.foreground }}>
                  {forecast.overallTrend}
                </Text>
              </View>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Confidence: {forecast.confidenceScore}%
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                Best Day
              </Text>
              <Text className="text-base" style={{ color: colors.foreground }}>
                {getShortDayName(forecast.bestDay)} {new Date(forecast.bestDay).getDate()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                Lowest Day
              </Text>
              <Text className="text-base" style={{ color: colors.foreground }}>
                {getShortDayName(forecast.worstDay)} {new Date(forecast.worstDay).getDate()}
              </Text>
            </View>
          </View>
        </View>

        {/* 7-Day Chart */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          7-Day Outlook
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {forecast.days.map((day, index) => {
              const isSelected = selectedDay?.date === day.date;
              const isToday = index === 0;
              return (
                <TouchableOpacity
                  key={day.date}
                  onPress={() => setSelectedDay(day)}
                  className="items-center p-4 rounded-xl"
                  style={{
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    width: 100,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <Text
                    className="text-xs font-semibold mb-2"
                    style={{
                      color: isSelected ? colors.background : colors.muted,
                    }}
                  >
                    {isToday ? "Today" : getShortDayName(day.date)}
                  </Text>
                  <Text
                    className="text-xs mb-2"
                    style={{
                      color: isSelected ? colors.background : colors.muted,
                    }}
                  >
                    {new Date(day.date).getDate()}
                  </Text>
                  <Text
                    className="text-3xl font-bold mb-1"
                    style={{
                      color: isSelected ? colors.background : getEnergyColor(day.predictedEnergy),
                    }}
                  >
                    {day.predictedEnergy}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{
                      color: isSelected ? colors.background : colors.muted,
                    }}
                  >
                    {getEnergyLevelDescription(day.predictedEnergy)}
                  </Text>
                  <Text className="text-lg mt-1">{getTrendEmoji(day.trend)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Selected Day Details */}
        {selectedDay && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              {new Date(selectedDay.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {/* Confidence Score */}
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                  Prediction Confidence
                </Text>
                <Text
                  className="text-lg font-bold"
                  style={{ color: getConfidenceColor(selectedDay.confidence) }}
                >
                  {selectedDay.confidence}%
                </Text>
              </View>
              <View className="h-2 rounded-full" style={{ backgroundColor: colors.border }}>
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${selectedDay.confidence}%`,
                    backgroundColor: getConfidenceColor(selectedDay.confidence),
                  }}
                />
              </View>
            </View>

            {/* Contributing Factors */}
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Contributing Factors
            </Text>
            {selectedDay.factors.map((factor, index) => (
              <View
                key={index}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {factor.name}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: getImpactColor(factor.impact) + "30" }}
                  >
                    <Text
                      className="text-xs font-semibold capitalize"
                      style={{ color: getImpactColor(factor.impact) }}
                    >
                      {factor.impact}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                  {factor.description}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-xs mr-2" style={{ color: colors.muted }}>
                    Weight:
                  </Text>
                  <View className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: colors.border }}>
                    <View
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${factor.weight * 100}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                  <Text className="text-xs ml-2" style={{ color: colors.muted }}>
                    {Math.round(factor.weight * 100)}%
                  </Text>
                </View>
              </View>
            ))}

            {/* Recommendations */}
            <Text className="text-lg font-semibold mb-3 mt-2" style={{ color: colors.foreground }}>
              Recommendations
            </Text>
            {selectedDay.recommendations.map((rec, index) => (
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

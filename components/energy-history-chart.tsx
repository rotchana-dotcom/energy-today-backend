import { View, Text } from "react-native";
import { UserProfile } from "@/types";
import { useEffect, useState } from "react";
import { getCompleteEnergyHistory, getEnergyTrend, EnergyHistoryEntry } from "@/lib/energy-history";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Circle, useFont } from "@shopify/react-native-skia";

interface EnergyHistoryChartProps {
  profile: UserProfile;
  days?: number;
}

export function EnergyHistoryChart({ profile, days = 30 }: EnergyHistoryChartProps) {
  const [history, setHistory] = useState<EnergyHistoryEntry[]>([]);
  const [trend, setTrend] = useState<{
    averageUserEnergy: number;
    trend: "improving" | "stable" | "declining";
    strongDays: number;
    moderateDays: number;
    challengingDays: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [profile]);

  const loadHistory = async () => {
    const data = await getCompleteEnergyHistory(profile, days);
    setHistory(data);
    
    const trendData = await getEnergyTrend(days);
    setTrend(trendData);
    
    setLoading(false);
  };

  if (loading || history.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = history.map((entry, index) => ({
    day: index + 1,
    score: entry.userEnergyScore,
  }));

  const getTrendEmoji = () => {
    if (!trend) return "📊";
    switch (trend.trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendText = () => {
    if (!trend) return "Stable";
    switch (trend.trend) {
      case "improving":
        return "Improving";
      case "declining":
        return "Declining";
      default:
        return "Stable";
    }
  };

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-medium text-muted">ENERGY HISTORY ({days} DAYS)</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{getTrendEmoji()}</Text>
          <Text className="text-xs font-medium text-foreground">{getTrendText()}</Text>
        </View>
      </View>

      {/* Simple line chart */}
      <View className="h-40 mb-4">
        <CartesianChart
          data={chartData}
          xKey={"day" as any}
          yKeys={["score"] as any}
          domainPadding={{ top: 20, bottom: 20 }}
        >
          {({ points }) => (
            <Line
              points={points.score}
              color="#0A7EA4"
              strokeWidth={2}
              animate={{ type: "timing", duration: 300 }}
            />
          )}
        </CartesianChart>
      </View>

      {/* Stats */}
      {trend && (
        <View className="flex-row gap-2">
          <View className="flex-1 bg-background rounded-lg p-3">
            <Text className="text-xs text-muted">Average</Text>
            <Text className="text-lg font-bold text-foreground mt-1">
              {trend.averageUserEnergy.toFixed(0)}%
            </Text>
          </View>
          <View className="flex-1 bg-success/10 rounded-lg p-3">
            <Text className="text-xs text-muted">Strong Days</Text>
            <Text className="text-lg font-bold text-success mt-1">
              {trend.strongDays}
            </Text>
          </View>
          <View className="flex-1 bg-warning/10 rounded-lg p-3">
            <Text className="text-xs text-muted">Moderate</Text>
            <Text className="text-lg font-bold text-warning mt-1">
              {trend.moderateDays}
            </Text>
          </View>
          <View className="flex-1 bg-error/10 rounded-lg p-3">
            <Text className="text-xs text-muted">Challenging</Text>
            <Text className="text-lg font-bold text-error mt-1">
              {trend.challengingDays}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * AI Insights Card Component
 * 
 * Reusable component that displays AI-powered recommendations
 * from 7 spiritual systems for Pro users across all features
 */

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useSubscriptionStatus } from "@/lib/subscription-status";

export interface AIInsight {
  title: string;
  recommendation: string;
  confidence: number; // 0-100
  reason: string;
}

interface AIInsightsCardProps {
  /**
   * Feature name (e.g., "Sleep", "Meditation", "Diet")
   */
  feature: string;
  
  /**
   * AI insights to display
   */
  insights: AIInsight[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Custom icon emoji
   */
  icon?: string;
}

export function AIInsightsCard({
  feature,
  insights,
  loading = false,
  error,
  icon = "🤖"
}: AIInsightsCardProps) {
  const colors = useColors();
  const { isPro } = useSubscriptionStatus();

  // Free users see upgrade prompt
  if (!isPro) {
    return (
      <View 
        className="p-6 rounded-xl mb-4" 
        style={{ 
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.primary + "40"
        }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <Text className="text-2xl">{icon}</Text>
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              AI-Powered {feature} Insights
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Pro Feature
            </Text>
          </View>
          <View 
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: colors.warning }}
          >
            <Text className="text-xs font-bold text-white">PRO</Text>
          </View>
        </View>

        <Text className="text-sm mb-4" style={{ color: colors.muted }}>
          Get personalized {feature.toLowerCase()} recommendations powered by AI analysis of 7 spiritual systems + your personal data.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/upgrade" as any)}
          className="py-3 rounded-lg items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.background }}>
            Upgrade to Pro
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pro users see AI insights
  return (
    <View 
      className="p-6 rounded-xl mb-4" 
      style={{ 
        backgroundColor: colors.primary + "15",
        borderWidth: 2,
        borderColor: colors.primary
      }}
    >
      <View className="flex-row items-center gap-3 mb-4">
        <Text className="text-2xl">{icon}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            AI-Powered {feature} Insights
          </Text>
          <Text className="text-xs" style={{ color: colors.muted }}>
            Based on 7 systems + your data
          </Text>
        </View>
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-xs font-bold text-white">PRO</Text>
        </View>
      </View>

      {loading && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm mt-3" style={{ color: colors.muted }}>
            Analyzing your patterns...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View 
          className="p-4 rounded-lg mb-3"
          style={{ backgroundColor: colors.error + "20" }}
        >
          <Text className="text-sm" style={{ color: colors.error }}>
            {error}
          </Text>
        </View>
      )}

      {!loading && !error && insights.length === 0 && (
        <View className="py-6 items-center">
          <Text className="text-2xl mb-2">📊</Text>
          <Text className="text-sm text-center" style={{ color: colors.muted }}>
            Not enough data yet. Keep tracking to get personalized insights!
          </Text>
        </View>
      )}

      {!loading && !error && insights.map((insight, index) => (
        <View 
          key={index}
          className="p-4 rounded-lg mb-3"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold flex-1" style={{ color: colors.foreground }}>
              {insight.title}
            </Text>
            <View 
              className="px-2 py-1 rounded"
              style={{ 
                backgroundColor: insight.confidence >= 80 
                  ? colors.success + "20" 
                  : insight.confidence >= 60 
                    ? colors.warning + "20" 
                    : colors.muted + "20"
              }}
            >
              <Text 
                className="text-xs font-bold"
                style={{ 
                  color: insight.confidence >= 80 
                    ? colors.success 
                    : insight.confidence >= 60 
                      ? colors.warning 
                      : colors.muted
                }}
              >
                {insight.confidence}%
              </Text>
            </View>
          </View>

          <Text className="text-sm font-medium mb-2" style={{ color: colors.primary }}>
            {insight.recommendation}
          </Text>

          <Text className="text-xs" style={{ color: colors.muted }}>
            {insight.reason}
          </Text>
        </View>
      ))}

      {!loading && !error && insights.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push("/analytics-dashboard" as any)}
          className="mt-2 py-2 items-center"
        >
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            View Full Analytics →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

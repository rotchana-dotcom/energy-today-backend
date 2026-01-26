import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  getPredictionRatings,
  getAccuracyStats,
  PredictionRating,
  clearPredictionRatings,
} from "@/lib/prediction-tracker";

export default function PredictionHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<PredictionRating[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allRatings = await getPredictionRatings();
    const accuracyStats = await getAccuracyStats();
    setRatings(allRatings.reverse()); // Most recent first
    setStats(accuracyStats);
    setLoading(false);
  };

  const handleClear = async () => {
    if (confirm("Clear all prediction ratings?")) {
      await clearPredictionRatings();
      loadData();
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted mt-4">Loading prediction history...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6">
        {/* Header */}
        <View className="mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">Prediction History</Text>
          <Text className="text-sm text-muted mt-1">Track AI accuracy over time</Text>
        </View>

        {/* Stats Card */}
        {stats && (
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            <View className="items-center mb-4">
              <Text className="text-5xl font-bold text-primary">{stats.overall}%</Text>
              <Text className="text-sm text-muted mt-1">Overall Accuracy</Text>
            </View>

            <View className="flex-row justify-around border-t border-border pt-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-success">{stats.accurate}</Text>
                <Text className="text-xs text-muted">Accurate</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-error">{stats.inaccurate}</Text>
                <Text className="text-xs text-muted">Inaccurate</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">{stats.total}</Text>
                <Text className="text-xs text-muted">Total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ratings List */}
        {ratings.length === 0 ? (
          <View className="bg-surface rounded-2xl p-8 border border-border items-center">
            <Text className="text-4xl mb-4">📊</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">No Ratings Yet</Text>
            <Text className="text-sm text-muted text-center">
              Rate AI predictions to track accuracy over time
            </Text>
          </View>
        ) : (
          <View className="gap-3 mb-6">
            {ratings.map((rating) => (
              <View key={rating.id} className="bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm text-foreground leading-relaxed">
                      {rating.predictionText}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      rating.rating === "accurate" ? "bg-success" : "bg-error"
                    }`}
                  >
                    <Text className="text-xs font-semibold text-white">
                      {rating.rating === "accurate" ? "👍 Accurate" : "👎 Inaccurate"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <Text className="text-xs text-muted capitalize">{rating.predictionType}</Text>
                  <Text className="text-xs text-muted">•</Text>
                  <Text className="text-xs text-muted">
                    {new Date(rating.timestamp).toLocaleDateString()}
                  </Text>
                  {rating.confidence && (
                    <>
                      <Text className="text-xs text-muted">•</Text>
                      <Text className="text-xs text-muted">{rating.confidence}% confidence</Text>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Clear Button */}
        {ratings.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="bg-surface border border-error py-3 rounded-lg mb-6"
          >
            <Text className="text-center text-error font-semibold">Clear All Ratings</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View className="bg-background rounded-lg p-4 mb-6">
          <Text className="text-xs text-muted text-center">
            Prediction accuracy helps improve future recommendations. Rate predictions honestly to help
            the AI learn your patterns better.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

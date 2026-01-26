import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import {
  getMetricsWithEnergy,
  addBusinessMetric,
  deleteBusinessMetric,
  analyzeBusinessMetrics,
  getMetricTypeSuggestions,
  BusinessMetric,
  MetricWithEnergy,
  BusinessInsights,
} from "@/lib/business-metrics";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";

export default function BusinessMetricsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<MetricWithEnergy[]>([]);
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Add metric form
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMetricType, setNewMetricType] = useState<BusinessMetric["type"]>("revenue");
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricValue, setNewMetricValue] = useState("");
  const [newMetricUnit, setNewMetricUnit] = useState("$");

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
      const businessMetrics = await getMetricsWithEnergy(userProfile);
      setMetrics(businessMetrics.sort((a, b) => b.date.localeCompare(a.date)));
      
      const businessInsights = await analyzeBusinessMetrics(userProfile);
      setInsights(businessInsights);
    }
    
    setLoading(false);
  };

  const handleAddMetric = async () => {
    if (!newMetricName.trim() || !newMetricValue.trim()) return;
    
    await addBusinessMetric(
      newMetricDate,
      newMetricType,
      newMetricName.trim(),
      parseFloat(newMetricValue),
      newMetricUnit
    );
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setNewMetricName("");
    setNewMetricValue("");
    setShowAddModal(false);
    
    await loadData();
  };

  const handleDeleteMetric = async (metricId: string) => {
    await deleteBusinessMetric(metricId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadData();
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  const suggestions = getMetricTypeSuggestions();

  if (!isPro) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 justify-center items-center gap-6">
          <Text className="text-4xl">📊</Text>
          <Text className="text-2xl font-bold text-foreground text-center">
            Business Metrics Dashboard
          </Text>
          <Text className="text-base text-muted text-center px-4">
            Track your business KPIs alongside energy data to identify high-performance patterns and optimize ROI.
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
              <Text className="text-2xl font-bold text-foreground">Business Metrics</Text>
              <Text className="text-sm text-muted mt-1">
                Track KPIs and energy correlation
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/business')}
              className="bg-surface border border-border rounded-full p-2"
            >
              <Text className="text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* ROI Estimate */}
          {insights && insights.totalMetrics > 5 && insights.roiEstimate.uplift > 0 && (
            <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">💎</Text>
                <Text className="text-sm font-medium text-success">ROI POTENTIAL</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground mb-2">
                +{insights.roiEstimate.upliftPercent.toFixed(0)}%
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                By scheduling key activities on high-energy days, you could increase annual
                performance by {insights.roiEstimate.uplift.toFixed(0)} {metrics[0]?.unit || "units"}
              </Text>
            </View>
          )}

          {/* Performance by Energy Level */}
          {insights && insights.totalMetrics > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <Text className="text-sm font-medium text-muted">PERFORMANCE BY ENERGY LEVEL</Text>
              
              <View className="flex-row gap-2">
                <View className="flex-1 bg-success/10 rounded-lg p-3">
                  <Text className="text-xs text-success mb-1">🟢 Strong Days</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {insights.averageOnStrongDays.toFixed(0)}
                  </Text>
                  <Text className="text-xs text-muted">{metrics[0]?.unit || "avg"}</Text>
                </View>
                
                <View className="flex-1 bg-warning/10 rounded-lg p-3">
                  <Text className="text-xs text-warning mb-1">🟡 Moderate</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {insights.averageOnModerateDays.toFixed(0)}
                  </Text>
                  <Text className="text-xs text-muted">{metrics[0]?.unit || "avg"}</Text>
                </View>
                
                <View className="flex-1 bg-error/10 rounded-lg p-3">
                  <Text className="text-xs text-error mb-1">🔴 Challenging</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {insights.averageOnChallengingDays.toFixed(0)}
                  </Text>
                  <Text className="text-xs text-muted">{metrics[0]?.unit || "avg"}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Insights */}
          {insights && insights.insights.length > 0 && (
            <View className="bg-primary/5 rounded-2xl p-5 border border-primary/20 gap-2">
              <Text className="text-sm font-medium text-primary">💡 INSIGHTS</Text>
              {insights.insights.map((insight, index) => (
                <Text key={index} className="text-sm text-foreground leading-relaxed">
                  • {insight}
                </Text>
              ))}
            </View>
          )}

          {/* Recent Metrics */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-muted">RECENT METRICS</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="bg-primary px-3 py-1 rounded-full"
              >
                <Text className="text-white text-xs font-semibold">+ Add</Text>
              </TouchableOpacity>
            </View>
            
            {metrics.length > 0 ? (
              metrics.slice(0, 10).map((metric) => {
                const energyColor =
                  metric.energyAlignment === "strong"
                    ? "bg-success/10 border-success/30"
                    : metric.energyAlignment === "moderate"
                    ? "bg-warning/10 border-warning/30"
                    : "bg-error/10 border-error/30";
                
                return (
                  <View
                    key={metric.id}
                    className={`rounded-lg p-3 border ${energyColor}`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {metric.name}
                        </Text>
                        <Text className="text-xs text-muted">
                          {new Date(metric.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-foreground">
                          {metric.value} {metric.unit}
                        </Text>
                        <Text className="text-xs text-muted">
                          {metric.energyAlignment === "strong"
                            ? "🟢 Strong"
                            : metric.energyAlignment === "moderate"
                            ? "🟡 Moderate"
                            : "🔴 Challenging"}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-muted capitalize">{metric.type}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteMetric(metric.id)}
                        className="p-1"
                      >
                        <Text className="text-error text-xs">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-sm text-muted text-center py-4">
                No metrics yet. Add your first business metric!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add Metric Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <Text className="text-xl font-bold text-foreground">Add Business Metric</Text>
            
            <View className="flex-row gap-2 flex-wrap">
              {suggestions.map((sug) => (
                <TouchableOpacity
                  key={sug.type}
                  onPress={() => {
                    setNewMetricType(sug.type);
                    setNewMetricName(sug.name);
                    setNewMetricUnit(sug.unit);
                  }}
                  className={`px-3 py-2 rounded-lg border ${
                    newMetricType === sug.type
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      newMetricType === sug.type ? "text-white" : "text-muted"
                    }`}
                  >
                    {sug.icon} {sug.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              value={newMetricDate}
              onChangeText={setNewMetricDate}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            
            <TextInput
              value={newMetricName}
              onChangeText={setNewMetricName}
              placeholder="Metric name"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            />
            
            <View className="flex-row gap-3">
              <TextInput
                value={newMetricValue}
                onChangeText={setNewMetricValue}
                placeholder="Value"
                keyboardType="numeric"
                placeholderTextColor="#9BA1A6"
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
              <TextInput
                value={newMetricUnit}
                onChangeText={setNewMetricUnit}
                placeholder="Unit"
                placeholderTextColor="#9BA1A6"
                className="w-20 bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setNewMetricName("");
                  setNewMetricValue("");
                }}
                className="flex-1 bg-border py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-muted">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMetric}
                disabled={!newMetricName.trim() || !newMetricValue.trim()}
                className={`flex-1 py-3 rounded-lg ${
                  newMetricName.trim() && newMetricValue.trim() ? "bg-primary" : "bg-border"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    newMetricName.trim() && newMetricValue.trim() ? "text-white" : "text-muted"
                  }`}
                >
                  Add Metric
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

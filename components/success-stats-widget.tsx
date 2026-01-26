/**
 * Success Stats Widget
 * 
 * Shows user's success metrics and pattern analysis results
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { calculateSuccessMetrics, analyzePatterns, type SuccessMetrics, type PatternAnalysis } from "@/lib/results-tracker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

interface SuccessStatsWidgetProps {
  onRefresh?: () => void;
}

export function SuccessStatsWidget({ onRefresh }: SuccessStatsWidgetProps) {
  const colors = useColors();
  const [metrics, setMetrics] = useState<SuccessMetrics | null>(null);
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const [metricsData, patternsData] = await Promise.all([
        calculateSuccessMetrics(),
        analyzePatterns()
      ]);
      
      setMetrics(metricsData);
      setPatterns(patternsData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load success stats:", error);
      setLoading(false);
    }
  };
  
  if (loading || !metrics || !patterns) {
    return null;
  }
  
  // Show empty state if no data
  if (patterns.daysLogged === 0) {
    return (
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
          Track Your Success
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 16 }}>
          Start logging your daily outcomes to see how energy scores correlate with your success. 
          You'll see patterns emerge and proof that timing matters!
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/results-tracking" as any);
          }}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Log Today's Outcome
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Calculate success rate for high-energy days
  const highEnergyRange = patterns.successRates.find(r => r.range === "85-100");
  const highEnergySuccessRate = highEnergyRange ? highEnergyRange.successRate : 0;
  
  // Get best activity
  const bestActivity = patterns.bestActivities[0];
  
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Your Success Stats
      </Text>
      
      {/* This Week */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
          This Week
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
              {metrics.weekDeals}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Deals Closed
            </Text>
          </View>
          
          <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
              {metrics.weekAvgScore}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Avg Score
            </Text>
          </View>
        </View>
      </View>
      
      {/* Success Rate on High Days */}
      {highEnergyRange && highEnergyRange.count > 0 && (
        <View style={{ 
          backgroundColor: "#22C55E20", 
          borderRadius: 12, 
          padding: 16,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "#22C55E" }}>
              {highEnergySuccessRate}%
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 8 }}>
              success rate
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            on your 85+ energy days ({highEnergyRange.count} days tracked)
          </Text>
        </View>
      )}
      
      {/* Best Activity */}
      {bestActivity && (
        <View style={{ 
          backgroundColor: colors.background, 
          borderRadius: 12, 
          padding: 16,
          marginBottom: 16
        }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            Your Best Activity
          </Text>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: "bold", marginBottom: 4 }}>
            {bestActivity.activity.charAt(0).toUpperCase() + bestActivity.activity.slice(1)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {bestActivity.successRate}% success rate • Avg score: {bestActivity.avgEnergyScore}
          </Text>
        </View>
      )}
      
      {/* Correlation Insight */}
      {patterns.correlation > 0.3 && (
        <View style={{ 
          backgroundColor: "#3B82F620", 
          borderRadius: 12, 
          padding: 16,
          marginBottom: 16
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 2 }}>
                The System Works!
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {patterns.correlation > 0.7 ? "Strong" : patterns.correlation > 0.5 ? "Good" : "Moderate"} correlation between energy scores and your reported outcomes
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* View Details Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/analytics-dashboard" as any);
        }}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
          View Full Analysis
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Today Insights Widget
 * 
 * Shows today's energy score, what it means, and quick outcome logging
 */

import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { logDailyOutcome, getTodayOutcome, type OutcomeRating } from "@/lib/results-tracker";
import { useEffect, useState } from "react";

interface TodayInsightsWidgetProps {
  energyScore: number;
  topPriority: string;
  topPriorityWhy: string;
  onOutcomeLogged?: () => void;
}

export function TodayInsightsWidget({
  energyScore,
  topPriority,
  topPriorityWhy,
  onOutcomeLogged
}: TodayInsightsWidgetProps) {
  const colors = useColors();
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  
  useEffect(() => {
    checkTodayOutcome();
  }, []);
  
  const checkTodayOutcome = async () => {
    const outcome = await getTodayOutcome();
    setHasLoggedToday(outcome !== null);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return "#22C55E"; // Green
    if (score >= 70) return "#3B82F6"; // Blue
    if (score >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Moderate";
    return "Challenging";
  };
  
  const handleQuickLog = (rating: OutcomeRating) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      "Log Today's Outcome",
      `How was today overall?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            await logDailyOutcome({
              date: new Date().toISOString().split('T')[0],
              energyScore,
              outcomeRating: rating,
              activities: [],
              dealsClosed: 0,
              revenue: 0,
              notes: "",
              followedAdvice: true,
              createdAt: new Date().toISOString()
            });
            
            setHasLoggedToday(true);
            
            if (onOutcomeLogged) {
              onOutcomeLogged();
            }
            
            Alert.alert("Success", "Today's outcome logged!");
          }
        }
      ]
    );
  };
  
  const scoreColor = getScoreColor(energyScore);
  const scoreLabel = getScoreLabel(energyScore);
  
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      {/* Today's Score */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>
            Today's Score
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 48, fontWeight: "bold", color: scoreColor }}>
              {energyScore}
            </Text>
            <Text style={{ fontSize: 16, color: colors.muted, marginLeft: 8 }}>
              {scoreLabel}
            </Text>
          </View>
        </View>
        
        {/* Visual indicator */}
        <View style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: `${scoreColor}20`,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={{ fontSize: 32 }}>
            {energyScore >= 85 ? "🌟" : energyScore >= 70 ? "✨" : energyScore >= 50 ? "💫" : "⚠️"}
          </Text>
        </View>
      </View>
      
      {/* What it means */}
      <View style={{ 
        backgroundColor: colors.background, 
        borderRadius: 12, 
        padding: 16,
        marginBottom: 16
      }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
          {topPriority}
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
          {topPriorityWhy}
        </Text>
      </View>
      
      {/* Quick outcome logging */}
      {!hasLoggedToday ? (
        <View>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12 }}>
            How's your day going?
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleQuickLog("excellent")}
              style={{
                flex: 1,
                backgroundColor: "#22C55E20",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>😊</Text>
              <Text style={{ fontSize: 12, color: "#22C55E", fontWeight: "600" }}>Great</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickLog("good")}
              style={{
                flex: 1,
                backgroundColor: "#3B82F620",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🙂</Text>
              <Text style={{ fontSize: 12, color: "#3B82F6", fontWeight: "600" }}>Good</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickLog("neutral")}
              style={{
                flex: 1,
                backgroundColor: "#F59E0B20",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>😐</Text>
              <Text style={{ fontSize: 12, color: "#F59E0B", fontWeight: "600" }}>OK</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickLog("poor")}
              style={{
                flex: 1,
                backgroundColor: "#EF444420",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center"
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 4 }}>😞</Text>
              <Text style={{ fontSize: 12, color: "#EF4444", fontWeight: "600" }}>Bad</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ 
          backgroundColor: "#22C55E20", 
          borderRadius: 8, 
          padding: 12,
          flexDirection: "row",
          alignItems: "center"
        }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>✅</Text>
          <Text style={{ fontSize: 14, color: "#22C55E", fontWeight: "600" }}>
            Today's outcome logged
          </Text>
        </View>
      )}
    </View>
  );
}

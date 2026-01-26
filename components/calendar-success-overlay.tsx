/**
 * Calendar Success Overlay Component
 * 
 * Shows visual success indicators on calendar dates where outcomes were logged
 */

import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { getAllOutcomes, type DailyOutcome } from "@/lib/results-tracker";

interface CalendarSuccessOverlayProps {
  date: Date;
  energyScore: number;
}

export function CalendarSuccessOverlay({ date, energyScore }: CalendarSuccessOverlayProps) {
  const [outcome, setOutcome] = useState<DailyOutcome | null>(null);
  
  useEffect(() => {
    loadOutcome();
  }, [date]);
  
  const loadOutcome = async () => {
    const dateStr = date.toISOString().split('T')[0];
    const outcomes = await getAllOutcomes();
    const found = outcomes.find(o => o.date === dateStr);
    setOutcome(found || null);
  };
  
  if (!outcome) {
    return null;
  }
  
  // Determine if outcome matched prediction
  const wasHighEnergy = energyScore >= 75;
  const wasGoodOutcome = outcome.outcomeRating === "excellent" || outcome.outcomeRating === "good";
  const matched = wasHighEnergy === wasGoodOutcome;
  
  // Success indicator
  const indicator = matched ? "✅" : "⚠️";
  const color = matched ? "#22C55E" : "#F59E0B";
  
  return (
    <View style={{
      position: "absolute",
      top: 2,
      right: 2,
      backgroundColor: color,
      borderRadius: 8,
      width: 14,
      height: 14,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Text style={{ fontSize: 8 }}>{indicator}</Text>
    </View>
  );
}

/**
 * Calendar Accuracy Badge Component
 * 
 * Shows prediction accuracy percentage for the month
 */

interface CalendarAccuracyBadgeProps {
  month: Date;
}

export function CalendarAccuracyBadge({ month }: CalendarAccuracyBadgeProps) {
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  
  useEffect(() => {
    calculateAccuracy();
  }, [month]);
  
  const calculateAccuracy = async () => {
    const outcomes = await getAllOutcomes();
    
    // Filter outcomes for this month
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const monthOutcomes = outcomes.filter(o => {
      const outcomeDate = new Date(o.date);
      return outcomeDate >= monthStart && outcomeDate <= monthEnd;
    });
    
    if (monthOutcomes.length === 0) {
      setAccuracy(null);
      setTotalDays(0);
      return;
    }
    
    // Calculate how many predictions matched reality
    let matches = 0;
    monthOutcomes.forEach(outcome => {
      const wasHighEnergy = outcome.energyScore >= 75;
      const wasGoodOutcome = outcome.outcomeRating === "excellent" || outcome.outcomeRating === "good";
      if (wasHighEnergy === wasGoodOutcome) {
        matches++;
      }
    });
    
    const accuracyPercent = Math.round((matches / monthOutcomes.length) * 100);
    setAccuracy(accuracyPercent);
    setTotalDays(monthOutcomes.length);
  };
  
  if (accuracy === null || totalDays === 0) {
    return null;
  }
  
  const color = accuracy >= 80 ? "#22C55E" : accuracy >= 60 ? "#3B82F6" : "#F59E0B";
  
  return (
    <View style={{
      backgroundColor: `${color}20`,
      borderWidth: 1,
      borderColor: color,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    }}>
      <Text style={{ fontSize: 16 }}>🎯</Text>
      <View>
        <Text style={{ fontSize: 14, fontWeight: "600", color }}>
          {accuracy}% Accurate
        </Text>
        <Text style={{ fontSize: 11, color }}>
          {totalDays} days logged
        </Text>
      </View>
    </View>
  );
}

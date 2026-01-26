/**
 * Outcome Logger Component
 * 
 * Detailed daily outcome logging with activities, deals, and revenue
 */

import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { logDailyOutcome, getTodayOutcome, type OutcomeRating, type ActivityType, type DailyOutcome } from "@/lib/results-tracker";

interface OutcomeLoggerProps {
  energyScore: number;
  onSaved?: () => void;
}

const ACTIVITIES: { type: ActivityType; label: string; icon: string }[] = [
  { type: "meeting", label: "Meeting", icon: "💼" },
  { type: "decision", label: "Decision", icon: "🎯" },
  { type: "negotiation", label: "Negotiation", icon: "🤝" },
  { type: "launch", label: "Launch", icon: "🚀" },
  { type: "presentation", label: "Presentation", icon: "🎤" },
  { type: "planning", label: "Planning", icon: "📋" },
];

const RATINGS: { rating: OutcomeRating; label: string; icon: string; color: string }[] = [
  { rating: "excellent", label: "Excellent", icon: "😊", color: "#22C55E" },
  { rating: "good", label: "Good", icon: "🙂", color: "#3B82F6" },
  { rating: "neutral", label: "Neutral", icon: "😐", color: "#F59E0B" },
  { rating: "poor", label: "Poor", icon: "😞", color: "#EF4444" },
];

export function OutcomeLogger({ energyScore, onSaved }: OutcomeLoggerProps) {
  const colors = useColors();
  const [hasLogged, setHasLogged] = useState(false);
  const [rating, setRating] = useState<OutcomeRating | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
  const [dealsClosed, setDealsClosed] = useState("");
  const [revenue, setRevenue] = useState("");
  const [notes, setNotes] = useState("");
  const [followedAdvice, setFollowedAdvice] = useState(true);
  
  useEffect(() => {
    checkExisting();
  }, []);
  
  const checkExisting = async () => {
    const existing = await getTodayOutcome();
    if (existing) {
      setHasLogged(true);
      setRating(existing.outcomeRating);
      setSelectedActivities(existing.activities);
      setDealsClosed(existing.dealsClosed.toString());
      setRevenue(existing.revenue.toString());
      setNotes(existing.notes);
      setFollowedAdvice(existing.followedAdvice);
    }
  };
  
  const toggleActivity = (activity: ActivityType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };
  
  const handleSave = async () => {
    if (!rating) {
      Alert.alert("Required", "Please select an outcome rating");
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const outcome: DailyOutcome = {
      date: new Date().toISOString().split('T')[0],
      energyScore,
      outcomeRating: rating,
      activities: selectedActivities,
      dealsClosed: parseInt(dealsClosed) || 0,
      revenue: parseFloat(revenue) || 0,
      notes: notes.trim(),
      followedAdvice,
      createdAt: new Date().toISOString()
    };
    
    await logDailyOutcome(outcome);
    setHasLogged(true);
    
    Alert.alert("Success", "Today's outcome saved!");
    
    if (onSaved) {
      onSaved();
    }
  };
  
  if (hasLogged && rating) {
    const ratingData = RATINGS.find(r => r.rating === rating);
    return (
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>{ratingData?.icon}</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
            Today's Outcome Logged
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
          Rating: {ratingData?.label} • {selectedActivities.length} activities • {dealsClosed || 0} deals
        </Text>
        <TouchableOpacity
          onPress={() => {
            setHasLogged(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Edit Today's Outcome
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Log Today's Outcome
      </Text>
      
      {/* Rating */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
        How was today overall?
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        {RATINGS.map((r) => (
          <TouchableOpacity
            key={r.rating}
            onPress={() => {
              setRating(r.rating);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              flex: 1,
              backgroundColor: rating === r.rating ? `${r.color}20` : colors.background,
              borderWidth: rating === r.rating ? 2 : 1,
              borderColor: rating === r.rating ? r.color : colors.border,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center"
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</Text>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: rating === r.rating ? "600" : "normal",
              color: rating === r.rating ? r.color : colors.muted 
            }}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Activities */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
        What did you do today?
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.type}
            onPress={() => toggleActivity(activity.type)}
            style={{
              backgroundColor: selectedActivities.includes(activity.type) 
                ? `${colors.primary}20` 
                : colors.background,
              borderWidth: selectedActivities.includes(activity.type) ? 2 : 1,
              borderColor: selectedActivities.includes(activity.type) 
                ? colors.primary 
                : colors.border,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6
            }}
          >
            <Text style={{ fontSize: 16 }}>{activity.icon}</Text>
            <Text style={{ 
              fontSize: 14,
              fontWeight: selectedActivities.includes(activity.type) ? "600" : "normal",
              color: selectedActivities.includes(activity.type) 
                ? colors.primary 
                : colors.foreground 
            }}>
              {activity.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Business Metrics */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
        Business Results (Optional)
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
            Deals Closed
          </Text>
          <TextInput
            value={dealsClosed}
            onChangeText={setDealsClosed}
            placeholder="0"
            keyboardType="number-pad"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              color: colors.foreground
            }}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
            Revenue ($)
          </Text>
          <TextInput
            value={revenue}
            onChangeText={setRevenue}
            placeholder="0"
            keyboardType="decimal-pad"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              color: colors.foreground
            }}
          />
        </View>
      </View>
      
      {/* Notes */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
        Notes (Optional)
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional details..."
        multiline
        numberOfLines={3}
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: colors.foreground,
          textAlignVertical: "top",
          marginBottom: 20
        }}
      />
      
      {/* Followed Advice */}
      <TouchableOpacity
        onPress={() => {
          setFollowedAdvice(!followedAdvice);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: followedAdvice ? colors.primary : colors.border,
          backgroundColor: followedAdvice ? colors.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12
        }}>
          {followedAdvice && (
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>✓</Text>
          )}
        </View>
        <Text style={{ fontSize: 14, color: colors.foreground }}>
          I followed today's timing recommendations
        </Text>
      </TouchableOpacity>
      
      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
          Save Today's Outcome
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "@/lib/energy-engine";

interface EnergyForecastProps {
  profile: UserProfile;
  daysAhead?: number;
}

export function EnergyForecast({ profile, daysAhead = 7 }: EnergyForecastProps) {
  const forecast = [];
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const energy = calculateDailyEnergy(profile, date);
    
    forecast.push({
      date,
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
      alignment: energy.connection.alignment,
      userScore: energy.userEnergy.intensity,
      todayScore: energy.environmentalEnergy.intensity,
      lunarPhase: energy.lunarPhase,
    });
  }
  
  const getAlignmentColor = (alignment: "strong" | "moderate" | "challenging") => {
    switch (alignment) {
      case "strong":
        return "bg-success";
      case "moderate":
        return "bg-warning";
      case "challenging":
        return "bg-error";
    }
  };
  
  const getAlignmentBg = (alignment: "strong" | "moderate" | "challenging") => {
    switch (alignment) {
      case "strong":
        return "bg-success/10 border-success/30";
      case "moderate":
        return "bg-warning/10 border-warning/30";
      case "challenging":
        return "bg-error/10 border-error/30";
    }
  };
  
  const getAlignmentEmoji = (alignment: "strong" | "moderate" | "challenging") => {
    switch (alignment) {
      case "strong":
        return "🟢";
      case "moderate":
        return "🟡";
      case "challenging":
        return "🔴";
    }
  };

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm font-medium text-muted">7-DAY ENERGY FORECAST</Text>
        <Text className="text-xs text-muted">Next Week</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {forecast.map((day, index) => (
            <View
              key={index}
              className={`rounded-xl p-3 border min-w-[80px] ${
                index === 0 ? "bg-primary/10 border-primary/30" : getAlignmentBg(day.alignment)
              }`}
            >
              <Text className="text-xs text-muted text-center mb-1">
                {day.dayName}
              </Text>
              <Text className="text-2xl font-bold text-foreground text-center mb-2">
                {day.dayNumber}
              </Text>
              <View className="items-center gap-1">
                <Text className="text-xl">{getAlignmentEmoji(day.alignment)}</Text>
                <Text className="text-xs text-muted capitalize text-center">
                  {day.alignment}
                </Text>
              </View>
              <View className="mt-2 pt-2 border-t border-border/50">
                <Text className="text-xs text-muted text-center">
                  {day.lunarPhase}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View className="mt-4 pt-4 border-t border-border flex-row gap-4 justify-center">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-success" />
          <Text className="text-xs text-muted">Strong</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-warning" />
          <Text className="text-xs text-muted">Moderate</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-full bg-error" />
          <Text className="text-xs text-muted">Challenging</Text>
        </View>
      </View>
    </View>
  );
}

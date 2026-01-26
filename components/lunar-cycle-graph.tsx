import { View, Text } from "react-native";
import { calculateDailyEnergy } from "@/lib/energy-engine";
import { UserProfile } from "@/types";

interface LunarCycleGraphProps {
  currentDate: Date;
  profile: UserProfile;
}

export function LunarCycleGraph({ currentDate, profile }: LunarCycleGraphProps) {
  // Calculate the 4 major phases for the current lunar cycle
  const phases = getMajorPhasesThisMonth(currentDate);
  
  // Get current moon phase
  const dailyEnergy = calculateDailyEnergy(profile, currentDate);
  const currentPhase = {
    phase: dailyEnergy.lunarPhase,
    emoji: dailyEnergy.lunarPhaseEmoji,
    illumination: 0.06 // This will be calculated properly
  };
  
  // Calculate position of current phase (0-100%)
  const position = calculatePhasePosition(currentDate, phases);

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <Text className="text-sm font-medium text-muted mb-4">LUNAR CYCLE THIS MONTH</Text>
      
      {/* Progress Bar */}
      <View className="relative h-12 mb-2">
        {/* Background bar */}
        <View className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full" />
        
        {/* Current position indicator */}
        <View 
          className="absolute top-3 w-5 h-5 rounded-full bg-success border-2 border-background"
          style={{ left: `${position}%`, marginLeft: -10 }}
        />
        
        {/* Phase markers */}
        <View className="absolute top-0 left-0 right-0 flex-row justify-between">
          {phases.map((phase, index) => (
            <View key={index} className="items-center" style={{ width: 60 }}>
              <Text className="text-2xl mb-1">{phase.emoji}</Text>
              <View className="w-2 h-2 rounded-full bg-muted" />
            </View>
          ))}
        </View>
      </View>
      
      {/* Phase labels */}
      <View className="flex-row justify-between mt-2">
        {phases.map((phase, index) => (
          <View key={index} className="items-center" style={{ width: 60 }}>
            <Text className="text-xs text-muted text-center" numberOfLines={2}>
              {phase.name}
            </Text>
            <Text className="text-xs text-muted mt-1">
              {phase.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Current phase info */}
      <View className="mt-4 pt-4 border-t border-border">
        <Text className="text-xs text-muted">You are here</Text>
        <Text className="text-sm font-medium text-foreground mt-1">
          {currentPhase.phase.replace(/_/g, " ")} • {Math.round(currentPhase.illumination * 100)}% illuminated
        </Text>
      </View>
    </View>
  );
}

// Helper function to get the 4 major phases for the current lunar cycle
function getMajorPhasesThisMonth(date: Date): Array<{ name: string; emoji: string; date: Date }> {
  const phases: Array<{ name: string; emoji: string; date: Date }> = [];
  
  // Start from the beginning of the month
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 15); // Include next month for phases
  
  // Find the 4 major phases
  let currentDate = new Date(startDate);
  const foundPhases = new Set<string>();
  
  while (currentDate <= endDate && phases.length < 4) {
    // Calculate energy for this date to get lunar phase
    const tempProfile: UserProfile = {
      name: "temp",
      dateOfBirth: new Date().toISOString(),
      placeOfBirth: {
        city: "temp",
        country: "temp",
        latitude: 0,
        longitude: 0
      },
      onboardingComplete: true
    };
    const dailyEnergy = calculateDailyEnergy(tempProfile, currentDate);
    const phaseName = dailyEnergy.lunarPhase;
    const phase = { phase: phaseName, emoji: dailyEnergy.lunarPhaseEmoji };
    
    // Check if this is a major phase and we haven't found it yet
    if (
      (phaseName === "new_moon" || 
       phaseName === "first_quarter" || 
       phaseName === "full_moon" || 
       phaseName === "last_quarter") &&
      !foundPhases.has(phaseName)
    ) {
      foundPhases.add(phaseName);
      phases.push({
        name: phaseName === "new_moon" ? "New Moon" :
              phaseName === "first_quarter" ? "First Quarter" :
              phaseName === "full_moon" ? "Full Moon" : "Last Quarter",
        emoji: phase.emoji,
        date: new Date(currentDate)
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Sort by date
  phases.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // If we don't have 4 phases, fill in with estimated dates
  while (phases.length < 4) {
    const lastPhase = phases[phases.length - 1];
    const nextDate = new Date(lastPhase.date);
    nextDate.setDate(nextDate.getDate() + 7); // Approximately 7 days between phases
    
    phases.push({
      name: "Next Phase",
      emoji: "🌙",
      date: nextDate
    });
  }
  
  return phases.slice(0, 4);
}

// Helper function to calculate current position (0-100%)
function calculatePhasePosition(currentDate: Date, phases: Array<{ date: Date }>): number {
  if (phases.length < 2) return 0;
  
  const currentTime = currentDate.getTime();
  const startTime = phases[0].date.getTime();
  const endTime = phases[phases.length - 1].date.getTime();
  
  if (currentTime < startTime) return 0;
  if (currentTime > endTime) return 100;
  
  const position = ((currentTime - startTime) / (endTime - startTime)) * 100;
  return Math.max(0, Math.min(100, position));
}

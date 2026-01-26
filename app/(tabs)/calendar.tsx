import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { calculateUnifiedEnergy } from "@/lib/unified-energy-engine";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { UserProfile } from "@/types";
import * as Haptics from "expo-haptics";
import { FirstTimeTutorial, TutorialStep } from "@/components/first-time-tutorial";
import { HowToUseSection, HowToUseItem } from "@/components/how-to-use-section";
import { CalendarSuccessOverlay, CalendarAccuracyBadge } from "@/components/calendar-success-overlay";

const ACTIVITIES = [
  { id: "meeting", label: "Important Meeting", icon: "👔" },
  { id: "decision", label: "Major Decision", icon: "🎯" },
  { id: "deal", label: "Close Deal", icon: "🤝" },
  { id: "planning", label: "Strategic Planning", icon: "📊" },
  { id: "presentation", label: "Presentation", icon: "📽️" },
  { id: "negotiation", label: "Negotiation", icon: "💼" },
  { id: "signing", label: "Sign Contract", icon: "✍️" },
  { id: "launch", label: "Product Launch", icon: "🚀" },
];

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Strategic Calendar",
    description: "Plan your most important activities by finding the optimal dates and times based on your personal energy patterns.",
  },
  {
    title: "Select Your Activity",
    description: "Tap any activity button (like Important Meeting or Major Decision) to see personalized timing recommendations.",
  },
  {
    title: "View Energy Scores",
    description: "Each day shows an energy score. Green (75+) = Optimal, Orange (50-74) = Viable, Red (<50) = Challenging.",
  },
  {
    title: "Get Detailed Insights",
    description: "Tap any date to see detailed energy breakdown and specific timing recommendations for that day.",
  },
];

const HOW_TO_USE_ITEMS: HowToUseItem[] = [
  {
    icon: "🎯",
    title: "Select Activity Type",
    description: "Tap activity buttons at the top to filter recommendations for specific business activities.",
  },
  {
    icon: "📅",
    title: "Read Energy Scores",
    description: "Green dots (75+) are optimal days, orange (50-74) are viable, red (<50) are challenging.",
  },
  {
    icon: "👆",
    title: "Tap Dates for Details",
    description: "Tap any calendar date to see detailed energy analysis and best time windows for your selected activity.",
  },
  {
    icon: "⏰",
    title: "Schedule Strategically",
    description: "Use the recommended time windows to schedule your most important activities for maximum success.",
  },
];

interface DayData {
  date: Date;
  perfectDayScore: number;
  confidence: number;
  topPriority: string;
  isOptimal: boolean;
}

export default function CalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) {
      router.replace("/onboarding/welcome");
      return;
    }

    setProfile(userProfile);

    // Check subscription status
    const subStatus = await getSubscriptionStatus();
    setIsPro(subStatus.isPro);

    // Calculate energy for the entire month
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    const data: DayData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const reading = calculateUnifiedEnergy(userProfile, date);
      
      data.push({
        date,
        perfectDayScore: reading.combinedAnalysis.perfectDayScore,
        confidence: reading.combinedAnalysis.confidenceScore,
        topPriority: reading.businessInsights.topPriority,
        isOptimal: reading.combinedAnalysis.perfectDayScore >= 75,
      });
    }
    
    setMonthData(data);
    setLoading(false);
  };

  const getDayColor = (score: number): string => {
    if (score >= 75) return "#22C55E"; // Green - Optimal
    if (score >= 50) return "#F59E0B"; // Orange - Viable
    return "#EF4444"; // Red - Challenging
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-[14%] aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthData.find(d => d.date.getDate() === day);
      const color = dayData ? getDayColor(dayData.perfectDayScore) : "#9BA1A6";
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDate?.toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <TouchableOpacity
          key={day}
          className="w-[14%] aspect-square p-1"
          onPress={() => {
            const date = new Date(year, month, day);
            setSelectedDate(date);
            setSelectedDayData(dayData || null);
          }}
        >
          <View className={`flex-1 items-center justify-center rounded-lg ${
            isSelected ? "bg-primary" : isToday ? "bg-primary/20" : ""
          }`}>
            <Text className={`text-sm font-medium ${
              isSelected ? "text-white" : "text-foreground"
            }`}>{day}</Text>
            {dayData && (
              <View className="flex-row items-center gap-1 mt-1">
                <View
                  style={{ backgroundColor: isSelected ? "#ffffff" : color }}
                  className="w-2 h-2 rounded-full"
                />
                {isPro && (
                  <Text className={`text-[10px] font-bold ${
                    isSelected ? "text-white" : "text-foreground"
                  }`}>{dayData.perfectDayScore}</Text>
                )}
              </View>
            )}
            {/* Success Overlay */}
            {dayData && (
              <CalendarSuccessOverlay
                date={new Date(year, month, day)}
                energyScore={dayData.perfectDayScore}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    setSelectedDate(null);
    setSelectedDayData(null);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <FirstTimeTutorial
        screenId="strategic_calendar"
        steps={TUTORIAL_STEPS}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Strategic Calendar</Text>
            <Text className="text-sm text-muted mt-1">
              Plan your most important activities for optimal outcomes
            </Text>
          </View>

          {/* Activity Selection */}
          {isPro && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">What are you planning?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {ACTIVITIES.map((activity) => (
                    <Pressable
                      key={activity.id}
                      onPress={() => {
                        console.log('Button pressed:', activity.label);
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setSelectedActivity(
                          activity.id === selectedActivity ? null : activity.id
                        );
                      }}
                      style={({ pressed }) => ([
                        {
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 9999,
                          borderWidth: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          opacity: pressed ? 0.7 : 1,
                        },
                        selectedActivity === activity.id
                          ? { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' }
                          : { backgroundColor: '#1e2022', borderColor: '#334155' }
                      ])}
                    >
                      <Text style={{ fontSize: 16 }}>{activity.icon}</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: selectedActivity === activity.id ? '#ffffff' : '#ECEDEE'
                        }}
                      >
                        {activity.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Pro Upgrade Prompt for Free Users */}
          {!isPro && (
            <TouchableOpacity
              onPress={() => router.push("/upgrade" as any)}
              className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 border border-primary/20"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">Unlock AI Timing</Text>
                  <Text className="text-sm text-white/80 mt-1">
                    Get specific recommendations for every activity
                  </Text>
                </View>
                <Text className="text-2xl">⚡</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Calendar */}
          <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
            {/* Month Navigation with Accuracy Badge */}
            <View className="flex-row items-center justify-between mb-5">
              <CalendarAccuracyBadge month={currentMonth} />
            </View>
            
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity 
                onPress={() => changeMonth(-1)} 
                className="p-2 bg-background rounded-lg active:opacity-70"
              >
                <Text className="text-xl text-foreground font-bold">←</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-foreground">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
              <TouchableOpacity 
                onPress={() => changeMonth(1)} 
                className="p-2 bg-background rounded-lg active:opacity-70"
              >
                <Text className="text-xl text-foreground font-bold">→</Text>
              </TouchableOpacity>
            </View>

            {/* Day Labels */}
            <View className="flex-row mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <View key={day} className="w-[14%] items-center">
                  <Text className="text-xs font-bold text-muted">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">{renderCalendar()}</View>

            {/* Legend */}
            <View className="flex-row items-center justify-center gap-4 mt-5 pt-4 border-t border-border">
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-full bg-success" />
                <Text className="text-xs font-medium text-muted">Optimal (75+)</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-full bg-warning" />
                <Text className="text-xs font-medium text-muted">Viable (50-74)</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-3 h-3 rounded-full bg-error" />
                <Text className="text-xs font-medium text-muted">Challenging (&lt;50)</Text>
              </View>
            </View>
          </View>

          {/* Selected Day Details */}
          {selectedDayData && selectedDate && (
            <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm gap-4">
              <View>
                <Text className="text-xs font-bold text-muted uppercase tracking-wide">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                </Text>
                <Text className="text-2xl font-bold text-foreground mt-1">
                  {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </Text>
              </View>

              {/* Perfect Day Score */}
              <View className="flex-row items-center justify-between p-4 bg-background rounded-xl">
                <View>
                  <Text className="text-xs font-bold text-muted uppercase tracking-wide">
                    Perfect Day Score
                  </Text>
                  <Text className="text-3xl font-bold text-foreground mt-1">
                    {selectedDayData.perfectDayScore}
                    <Text className="text-lg text-muted">/100</Text>
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-bold text-muted uppercase tracking-wide">
                    Confidence
                  </Text>
                  <Text className="text-2xl font-bold text-primary mt-1">
                    {selectedDayData.confidence}%
                  </Text>
                </View>
              </View>

              {/* Top Priority */}
              {isPro ? (
                <View className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <Text className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                    Top Priority
                  </Text>
                  <Text className="text-base font-medium text-foreground leading-relaxed">
                    {selectedDayData.topPriority}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push("/upgrade" as any)}
                  className="p-4 bg-muted/10 border border-border rounded-xl"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                        Top Priority
                      </Text>
                      <Text className="text-sm text-muted">
                        Unlock Pro to see your top priority for this day
                      </Text>
                    </View>
                    <Text className="text-xl">🔒</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Activity-Specific Recommendations (Pro Only) */}
              {isPro && selectedActivity && (
                <View className="p-4 bg-success/10 border border-success/20 rounded-xl gap-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">
                      {ACTIVITIES.find(a => a.id === selectedActivity)?.icon}
                    </Text>
                    <Text className="text-sm font-bold text-success uppercase tracking-wide">
                      Best Time for {ACTIVITIES.find(a => a.id === selectedActivity)?.label}
                    </Text>
                  </View>
                  <Text className="text-base font-medium text-foreground">
                    Schedule between 2:00 PM - 4:30 PM for optimal results
                  </Text>
                  <Text className="text-xs text-muted leading-relaxed">
                    Your analytical strengths peak during this window, and external conditions
                    are optimal for {ACTIVITIES.find(a => a.id === selectedActivity)?.label.toLowerCase()}.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Month Overview (Pro Only) */}
          {isPro && (
            <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm gap-4">
              <Text className="text-lg font-bold text-foreground">Month Overview</Text>
              
              <View className="flex-row gap-3">
                <View className="flex-1 p-4 bg-success/10 border border-success/20 rounded-xl">
                  <Text className="text-2xl font-bold text-success">
                    {monthData.filter(d => d.perfectDayScore >= 75).length}
                  </Text>
                  <Text className="text-xs font-medium text-muted mt-1">Optimal Days</Text>
                </View>
                
                <View className="flex-1 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                  <Text className="text-2xl font-bold text-warning">
                    {monthData.filter(d => d.perfectDayScore >= 50 && d.perfectDayScore < 75).length}
                  </Text>
                  <Text className="text-xs font-medium text-muted mt-1">Viable Days</Text>
                </View>
                
                <View className="flex-1 p-4 bg-error/10 border border-error/20 rounded-xl">
                  <Text className="text-2xl font-bold text-error">
                    {monthData.filter(d => d.perfectDayScore < 50).length}
                  </Text>
                  <Text className="text-xs font-medium text-muted mt-1">Challenging</Text>
                </View>
              </View>

              <Text className="text-xs text-muted leading-relaxed">
                Focus your most important activities on optimal days for best results.
                Use challenging days for planning, reflection, and preparation.
              </Text>
            </View>
          )}

          {/* How to Use Section */}
          <HowToUseSection items={HOW_TO_USE_ITEMS} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

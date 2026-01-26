import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSubscriptionStatus } from "@/lib/subscription-status";
import { router } from "expo-router";
import { syncHealthToCalendar, syncFitnessToCalendar } from "@/lib/calendar-sync-helper";
import { SyncStatusIndicator } from "@/components/sync-status-indicator";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";

interface ChiEntry {
  id: string;
  energyLevel: number; // 1-10
  balanceLevel: number; // 1-10
  chakras: {
    root: number;
    sacral: number;
    solarPlexus: number;
    heart: number;
    throat: number;
    thirdEye: number;
    crown: number;
  };
  notes: string;
  timestamp: string;
  date: string;
}

const chakraInfo = [
  { key: "root", name: "Root", color: "#EF4444", location: "Base of spine" },
  { key: "sacral", name: "Sacral", color: "#F97316", location: "Below navel" },
  { key: "solarPlexus", name: "Solar Plexus", color: "#EAB308", location: "Above navel" },
  { key: "heart", name: "Heart", color: "#22C55E", location: "Center of chest" },
  { key: "throat", name: "Throat", color: "#3B82F6", location: "Throat" },
  { key: "thirdEye", name: "Third Eye", color: "#6366F1", location: "Between eyebrows" },
  { key: "crown", name: "Crown", color: "#A855F7", location: "Top of head" },
];

export default function ChiTracker() {
  const colors = useColors();
  const { isPro } = useSubscriptionStatus();
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('chi');
  
  const [energyLevel, setEnergyLevel] = useState(5);
  const [balanceLevel, setBalanceLevel] = useState(5);
  const [chakras, setChakras] = useState({
    root: 5,
    sacral: 5,
    solarPlexus: 5,
    heart: 5,
    throat: 5,
    thirdEye: 5,
    crown: 5,
  });
  const [notes, setNotes] = useState("");
  const [chiEntries, setChiEntries] = useState<ChiEntry[]>([]);

  useEffect(() => {
    loadChiEntries();
  }, []);

  const loadChiEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem("chi_entries");
      if (stored) {
        setChiEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load chi entries:", error);
    }
  };

  const saveChiEntry = async () => {
    const newEntry: ChiEntry = {
      id: Date.now().toString(),
      energyLevel,
      balanceLevel,
      chakras: { ...chakras },
      notes,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newEntry, ...chiEntries];
    setChiEntries(updated);
    await AsyncStorage.setItem("chi_entries", JSON.stringify(updated));

    // Sync to Google Calendar as health/fitness activity
    const activityDetails = `Energy: ${energyLevel}/10, Balance: ${balanceLevel}/10\n${notes}`;
    const syncResult = await syncHealthToCalendar(
      "Chi/Energy Check-in",
      activityDetails,
      newEntry.timestamp,
      15 // 15 minute duration
    );

    // Reset form
    setEnergyLevel(5);
    setBalanceLevel(5);
    setChakras({
      root: 5,
      sacral: 5,
      solarPlexus: 5,
      heart: 5,
      throat: 5,
      thirdEye: 5,
      crown: 5,
    });
    setNotes("");

    if (syncResult.success) {
      Alert.alert("Success", "Chi entry saved and synced to calendar!");
    } else {
      Alert.alert("Success", "Chi entry saved!");
    }
  };

  const updateChakra = (chakra: keyof typeof chakras, value: number) => {
    setChakras({ ...chakras, [chakra]: value });
  };

  const getVisibleEntries = () => {
    if (isPro) return chiEntries;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return chiEntries.filter((entry) => new Date(entry.timestamp) >= sevenDaysAgo);
  };

  const getAverageEnergy = () => {
    if (chiEntries.length === 0) return 0;
    const sum = chiEntries.reduce((acc, entry) => acc + entry.energyLevel, 0);
    return Math.round((sum / chiEntries.length) * 10) / 10;
  };

  const getAverageBalance = () => {
    if (chiEntries.length === 0) return 0;
    const sum = chiEntries.reduce((acc, entry) => acc + entry.balanceLevel, 0);
    return Math.round((sum / chiEntries.length) * 10) / 10;
  };

  const getChakraAverage = (chakra: keyof typeof chakras) => {
    if (chiEntries.length === 0) return 0;
    const sum = chiEntries.reduce((acc, entry) => acc + entry.chakras[chakra], 0);
    return Math.round((sum / chiEntries.length) * 10) / 10;
  };

  const getLast7DaysEnergy = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayEntries = chiEntries.filter((entry) => entry.date === dateStr);
      const avgEnergy = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / dayEntries.length
        : 0;
      
      const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      
      days.push({
        label: dayLabel,
        value: Math.round(avgEnergy * 10) / 10,
      });
    }
    
    return days;
  };

  const renderSlider = (value: number, onChange: (value: number) => void, label: string) => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-muted">{label}</Text>
        <Text className="text-lg font-bold text-foreground">{value}/10</Text>
      </View>
      <View className="flex-row justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Pressable
            key={num}
            onPress={() => onChange(num)}
            style={{
              backgroundColor: num <= value ? colors.primary : colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="w-8 h-8 rounded-full items-center justify-center"
          >
            <Text
              style={{
                color: num <= value ? colors.background : colors.muted,
                fontSize: 10,
              }}
              className="font-semibold"
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Chi & Energy Flow</Text>
        <Text className="text-sm text-muted mb-6">
          Track your energy levels and chakra balance
        </Text>

        {/* Stats */}
        <View className="mb-2">
          <SyncStatusIndicator feature="health" />
        </View>

        {/* AI-Powered Insights (Pro Feature) */}
        <AIInsightsCard
          feature="Chi Energy"
          insights={aiInsights}
          loading={aiLoading}
          error={aiError || undefined}
          icon="⚡"
        />
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Avg Energy</Text>
            <Text className="text-2xl font-bold text-foreground">{getAverageEnergy()}/10</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-1">Avg Balance</Text>
            <Text className="text-2xl font-bold text-foreground">{getAverageBalance()}/10</Text>
          </View>
        </View>

        {/* 7-Day Energy Trend */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">7-Day Energy Trend</Text>
          <SimpleLineChart
            data={getLast7DaysEnergy()}
            height={180}
            yAxisLabel="Energy Level"
            maxValue={10}
          />
        </View>

        {/* Chi Entry Form */}
        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Log Chi Energy</Text>

          {/* Overall Energy Level */}
          {renderSlider(energyLevel, setEnergyLevel, "Overall Energy Level")}

          {/* Balance Level */}
          {renderSlider(balanceLevel, setBalanceLevel, "Energy Balance")}

          {/* Chakra Levels (Pro Feature) */}
          {isPro ? (
            <>
              <Text className="text-base font-semibold text-foreground mt-4 mb-3">
                Chakra Assessment
              </Text>
              {chakraInfo.map((chakra) => (
                <View key={chakra.key} className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <View
                      style={{ backgroundColor: chakra.color }}
                      className="w-4 h-4 rounded-full mr-2"
                    />
                    <Text className="text-sm text-foreground font-semibold flex-1">
                      {chakra.name}
                    </Text>
                    <Text className="text-sm text-muted">{chakra.location}</Text>
                    <Text className="text-base font-bold text-foreground ml-2">
                      {chakras[chakra.key as keyof typeof chakras]}/10
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Pressable
                        key={num}
                        onPress={() =>
                          updateChakra(chakra.key as keyof typeof chakras, num)
                        }
                        style={{
                          backgroundColor:
                            num <= chakras[chakra.key as keyof typeof chakras]
                              ? chakra.color
                              : colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                        }}
                        className="w-8 h-8 rounded-full items-center justify-center"
                      >
                        <Text
                          style={{
                            color:
                              num <= chakras[chakra.key as keyof typeof chakras]
                                ? "#FFFFFF"
                                : colors.muted,
                            fontSize: 10,
                          }}
                          className="font-semibold"
                        >
                          {num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View className="bg-background rounded-xl p-4 mt-4 mb-4 border border-border">
              <Text className="text-sm text-muted text-center mb-2">
                🔒 Chakra tracking is a Pro feature
              </Text>
              <Pressable
                onPress={() => router.push("/upgrade")}
                style={{ backgroundColor: colors.primary }}
                className="rounded-lg py-2 items-center"
              >
                <Text style={{ color: colors.background }} className="text-sm font-semibold">
                  Upgrade to Pro
                </Text>
              </Pressable>
            </View>
          )}

          {/* Notes */}
          <View className="mb-4">
            <Text className="text-sm text-muted mb-2">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How do you feel? Any insights?"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{
                color: colors.foreground,
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
              className="border rounded-xl p-3"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={saveChiEntry}
            style={{ backgroundColor: colors.primary }}
            className="rounded-xl py-3 items-center"
          >
            <Text style={{ color: colors.background }} className="font-semibold">
              Save Chi Entry
            </Text>
          </Pressable>
        </View>

        {/* Chi History */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">Chi History</Text>
            {!isPro && chiEntries.length > 7 && (
              <Pressable onPress={() => router.push("/upgrade")}>
                <Text className="text-sm text-primary font-semibold">
                  Upgrade for Full History
                </Text>
              </Pressable>
            )}
          </View>

          {getVisibleEntries().length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border">
              <Text className="text-muted text-center">
                No chi entries yet. Start tracking your energy!
              </Text>
            </View>
          ) : (
            getVisibleEntries().map((entry) => (
              <View
                key={entry.id}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-sm text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="items-center">
                      <Text className="text-xs text-muted">Energy</Text>
                      <Text className="text-lg font-bold text-foreground">
                        {entry.energyLevel}/10
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-muted">Balance</Text>
                      <Text className="text-lg font-bold text-foreground">
                        {entry.balanceLevel}/10
                      </Text>
                    </View>
                  </View>
                </View>

                {isPro && (
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {chakraInfo.map((chakra) => (
                      <View
                        key={chakra.key}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: chakra.color,
                          borderWidth: 2,
                        }}
                        className="px-2 py-1 rounded-lg"
                      >
                        <Text className="text-xs text-foreground">
                          {chakra.name}: {entry.chakras[chakra.key as keyof typeof chakras]}/10
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {entry.notes && (
                  <Text className="text-sm text-muted italic">{entry.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Pro Chakra Insights */}
        {isPro && chiEntries.length >= 3 && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Chakra Insights (Pro)
            </Text>
            <View className="gap-2">
              {chakraInfo.map((chakra) => {
                const avg = getChakraAverage(chakra.key as keyof typeof chakras);
                return (
                  <View key={chakra.key} className="flex-row items-center">
                    <View
                      style={{ backgroundColor: chakra.color }}
                      className="w-3 h-3 rounded-full mr-2"
                    />
                    <Text className="text-sm text-foreground flex-1">{chakra.name}</Text>
                    <Text className="text-sm font-semibold text-foreground">{avg}/10</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {!isPro && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Unlock Pro Features
            </Text>
            <Text className="text-sm text-muted mb-3">
              • Detailed chakra tracking{"\n"}
              • Chakra balance insights{"\n"}
              • Unlimited chi history{"\n"}
              • AI-powered energy recommendations
            </Text>
            <Pressable
              onPress={() => router.push("/upgrade")}
              style={{ backgroundColor: colors.primary }}
              className="rounded-xl py-3 items-center"
            >
              <Text style={{ color: colors.background }} className="font-semibold">
                Upgrade to Pro
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Energy Timeline Screen
 * 
 * Visual timeline of energy patterns with life event annotations
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { getJournalEntries } from "@/lib/storage";
import {
  getAllLifeEvents,
  addLifeEvent,
  deleteLifeEvent,
  getCategoryColor,
  getImpactColor,
  type LifeEvent,
} from "@/lib/life-events";

const { width } = Dimensions.get("window");
const GRAPH_WIDTH = width - 48; // padding
const GRAPH_HEIGHT = 200;

export default function EnergyTimelineScreen() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3months">("month");
  const [energyData, setEnergyData] = useState<Array<{ date: string; energy: number }>>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "personal" as LifeEvent["category"],
    impact: "neutral" as LifeEvent["impact"],
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entries, events] = await Promise.all([getJournalEntries(), getAllLifeEvents()]);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (timeRange === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      // Filter and aggregate energy data
      // Note: JournalEntry doesn't have energy field, using mood as proxy
      const dateMap = new Map<string, number[]>();
      entries.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= startDate && entryDate <= endDate) {
          const dateStr = entry.date.split("T")[0];
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, []);
          }
          // Convert mood to energy score
          const energy = entry.mood === "happy" ? 80 : entry.mood === "sad" ? 40 : 60;
          dateMap.get(dateStr)!.push(energy);
        }
      });

      // Calculate average energy per day
      const data: Array<{ date: string; energy: number }> = [];
      dateMap.forEach((energies, date) => {
        const avg = energies.reduce((sum, e) => sum + e, 0) / energies.length;
        data.push({ date, energy: Math.round(avg) });
      });

      data.sort((a, b) => a.date.localeCompare(b.date));
      setEnergyData(data);

      // Filter events in range
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];
      const filteredEvents = events.filter((e) => e.date >= startStr && e.date <= endStr);
      setLifeEvents(filteredEvents);
    } catch (error) {
      console.error("Failed to load timeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert("Error", "Please enter an event title", [{ text: "OK" }]);
      return;
    }

    try {
      await addLifeEvent(newEvent);
      setShowAddEvent(false);
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "personal",
        impact: "neutral",
      });
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add event", [{ text: "OK" }]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLifeEvent(id);
          loadData();
        },
      },
    ]);
  };

  const renderGraph = () => {
    if (energyData.length === 0) {
      return (
        <View className="items-center justify-center" style={{ height: GRAPH_HEIGHT }}>
          <Text className="text-muted">No energy data for this period</Text>
        </View>
      );
    }

    const maxEnergy = Math.max(...energyData.map((d) => d.energy));
    const minEnergy = Math.min(...energyData.map((d) => d.energy));
    const range = maxEnergy - minEnergy || 1;

    const pointWidth = GRAPH_WIDTH / (energyData.length - 1 || 1);

    return (
      <View style={{ width: GRAPH_WIDTH, height: GRAPH_HEIGHT }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = GRAPH_HEIGHT - (value / 100) * GRAPH_HEIGHT;
          return (
            <View
              key={value}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "#E5E7EB",
              }}
            />
          );
        })}

        {/* Energy line */}
        {energyData.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = energyData[index - 1];
          const x1 = (index - 1) * pointWidth;
          const y1 = GRAPH_HEIGHT - ((prevPoint.energy - minEnergy) / range) * GRAPH_HEIGHT;
          const x2 = index * pointWidth;
          const y2 = GRAPH_HEIGHT - ((point.energy - minEnergy) / range) * GRAPH_HEIGHT;

          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left: x1,
                top: Math.min(y1, y2),
                width: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                height: 2,
                backgroundColor: "#0A7EA4",
                transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }],
              }}
            />
          );
        })}

        {/* Data points */}
        {energyData.map((point, index) => {
          const x = index * pointWidth;
          const y = GRAPH_HEIGHT - ((point.energy - minEnergy) / range) * GRAPH_HEIGHT;

          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left: x - 4,
                top: y - 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#0A7EA4",
              }}
            />
          );
        })}

        {/* Life event markers */}
        {lifeEvents.map((event) => {
          const eventIndex = energyData.findIndex((d) => d.date === event.date);
          if (eventIndex === -1) return null;

          const x = eventIndex * pointWidth;
          return (
            <View
              key={event.id}
              style={{
                position: "absolute",
                left: x - 1,
                top: 0,
                width: 2,
                height: GRAPH_HEIGHT,
                backgroundColor: getCategoryColor(event.category),
                opacity: 0.5,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/more');
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Energy Timeline</Text>
        <TouchableOpacity
          onPress={() => setShowAddEvent(true)}
          className="py-2"
        >
          <Text className="text-primary text-2xl">+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading timeline...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Time Range Selector */}
            <View className="flex-row gap-2">
              {(["week", "month", "3months"] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  onPress={() => {
                    setTimeRange(range);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    timeRange === range ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      timeRange === range ? "text-white" : "text-foreground"
                    }`}
                  >
                    {range === "week" ? "7 Days" : range === "month" ? "1 Month" : "3 Months"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Graph Card */}
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Energy Pattern
              </Text>
              {renderGraph()}
            </View>

            {/* Life Events */}
            {lifeEvents.length > 0 && (
              <View className="bg-surface rounded-2xl p-5 border border-border">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Life Events
                </Text>
                <View className="gap-3">
                  {lifeEvents.map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      onLongPress={() => handleDeleteEvent(event.id)}
                      className="flex-row items-start gap-3 p-3 bg-background rounded-xl"
                    >
                      <View
                        className="w-3 h-3 rounded-full mt-1"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">
                          {event.title}
                        </Text>
                        {event.description && (
                          <Text className="text-xs text-muted mt-1">{event.description}</Text>
                        )}
                        <Text className="text-xs text-muted mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </Text>
                      </View>
                      {event.impact && (
                        <View
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: getImpactColor(event.impact) + "20" }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: getImpactColor(event.impact) }}
                          >
                            {event.impact}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Event Modal */}
      <Modal visible={showAddEvent} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">Add Life Event</Text>
            
            <TextInput
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              placeholder="Event title"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-3"
            />

            <TextInput
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              placeholder="Description (optional)"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-3"
              multiline
              numberOfLines={3}
            />

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleAddEvent();
                }}
                className="flex-1 bg-primary rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Add Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddEvent(false)}
                className="flex-1 bg-surface border border-border rounded-xl py-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

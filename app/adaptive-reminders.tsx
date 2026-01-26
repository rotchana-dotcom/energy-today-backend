/**
 * Adaptive Reminders Screen
 * 
 * Manage energy-based smart reminders
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getAdaptiveReminders,
  addAdaptiveReminder,
  updateAdaptiveReminder,
  deleteAdaptiveReminder,
  getReminderStats,
  type AdaptiveReminder,
} from "@/lib/adaptive-reminders";

export default function AdaptiveRemindersScreen() {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<AdaptiveReminder[]>([]);
  const [stats, setStats] = useState({
    totalReminders: 0,
    activeReminders: 0,
    adaptiveReminders: 0,
    triggeredToday: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    preferredTime: "",
    adaptToEnergy: true,
    minEnergyLevel: 50,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [remindersData, statsData] = await Promise.all([
        getAdaptiveReminders(),
        getReminderStats(),
      ]);
      setReminders(remindersData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert("Error", "Please enter a reminder title", [{ text: "OK" }]);
      return;
    }

    try {
      await addAdaptiveReminder(newReminder);
      setShowAddModal(false);
      setNewReminder({
        title: "",
        description: "",
        priority: "medium",
        preferredTime: "",
        adaptToEnergy: true,
        minEnergyLevel: 50,
        isActive: true,
      });
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add reminder", [{ text: "OK" }]);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateAdaptiveReminder(id, { isActive: !currentState });
      loadData();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert("Error", "Failed to update reminder", [{ text: "OK" }]);
    }
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAdaptiveReminder(id);
          loadData();
        },
      },
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#6B7280";
      default:
        return "#6B7280";
    }
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
        <Text className="text-xl font-bold text-foreground">Smart Reminders</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} className="py-2">
          <Text className="text-primary text-2xl">+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="text-muted mt-4">Loading reminders...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-6 gap-6">
            {/* Stats Card */}
            <View className="bg-primary/10 rounded-2xl p-5 border border-primary/30">
              <View className="flex-row items-start gap-3 mb-4">
                <Text className="text-2xl">🔔</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground mb-2">
                    Reminder Stats
                  </Text>
                  <Text className="text-sm text-muted">
                    Adaptive reminders adjust timing based on your energy levels
                  </Text>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-4">
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-2xl font-bold text-primary">{stats.activeReminders}</Text>
                  <Text className="text-xs text-muted mt-1">Active</Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-2xl font-bold text-primary">
                    {stats.adaptiveReminders}
                  </Text>
                  <Text className="text-xs text-muted mt-1">Adaptive</Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-2xl font-bold text-primary">{stats.triggeredToday}</Text>
                  <Text className="text-xs text-muted mt-1">Today</Text>
                </View>
                <View className="flex-1 min-w-[45%]">
                  <Text className="text-2xl font-bold text-primary">{stats.totalReminders}</Text>
                  <Text className="text-xs text-muted mt-1">Total</Text>
                </View>
              </View>
            </View>

            {/* Reminders List */}
            {reminders.length > 0 ? (
              <View className="gap-3">
                {reminders.map((reminder) => (
                  <View
                    key={reminder.id}
                    className="bg-surface rounded-2xl p-4 border border-border"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1 pr-4">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {reminder.title}
                        </Text>
                        {reminder.description && (
                          <Text className="text-sm text-muted">{reminder.description}</Text>
                        )}
                      </View>
                      <Switch
                        value={reminder.isActive}
                        onValueChange={() => handleToggleActive(reminder.id, reminder.isActive)}
                        trackColor={{ false: "#E5E7EB", true: "#0A7EA4" }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    <View className="flex-row flex-wrap gap-2 mb-3">
                      <View
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: getPriorityColor(reminder.priority) + "20" }}
                      >
                        <Text
                          className="text-xs font-medium capitalize"
                          style={{ color: getPriorityColor(reminder.priority) }}
                        >
                          {reminder.priority}
                        </Text>
                      </View>
                      {reminder.adaptToEnergy && (
                        <View className="px-2 py-1 rounded bg-success/20">
                          <Text className="text-xs font-medium text-success">
                            Adaptive • Min {reminder.minEnergyLevel}%
                          </Text>
                        </View>
                      )}
                      {reminder.preferredTime && (
                        <View className="px-2 py-1 rounded bg-primary/20">
                          <Text className="text-xs font-medium text-primary">
                            {reminder.preferredTime}
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(reminder.id)}
                      className="self-start"
                    >
                      <Text className="text-xs text-error">Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-12">
                <Text className="text-4xl mb-4">📝</Text>
                <Text className="text-base font-medium text-foreground mb-2">
                  No Reminders Yet
                </Text>
                <Text className="text-sm text-muted text-center">
                  Add your first adaptive reminder to get started
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Reminder Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">Add Reminder</Text>

            <TextInput
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              placeholder="Reminder title"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-3"
            />

            <TextInput
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              placeholder="Description (optional)"
              placeholderTextColor="#9BA1A6"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground mb-3"
              multiline
              numberOfLines={2}
            />

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-medium text-foreground">Adapt to Energy</Text>
              <Switch
                value={newReminder.adaptToEnergy}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, adaptToEnergy: value })
                }
                trackColor={{ false: "#E5E7EB", true: "#0A7EA4" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleAddReminder();
                }}
                className="flex-1 bg-primary rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Add Reminder</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
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

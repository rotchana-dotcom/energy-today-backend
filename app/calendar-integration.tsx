/**
 * Calendar Integration Screen
 * 
 * Connect Google Calendar and schedule optimal meetings
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  isGoogleCalendarConnected,
  getOptimalMeetingTimes,
  scheduleOptimalMeeting,
  type EnergyTimeSlot,
} from "@/lib/google-calendar";

export default function CalendarIntegrationScreen() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  
  // Meeting form
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState(60);
  
  // Optimal times
  const [showingOptimalTimes, setShowingOptimalTimes] = useState(false);
  const [optimalTimes, setOptimalTimes] = useState<EnergyTimeSlot[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const isConnected = await isGoogleCalendarConnected();
      setConnected(isConnected);
    } catch (error) {
      console.error("Failed to check connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const success = await connectGoogleCalendar();
      if (success) {
        setConnected(true);
        Alert.alert("Connected!", "Google Calendar connected successfully");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", "Failed to connect Google Calendar");
      }
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert("Error", "Failed to connect Google Calendar");
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      "Disconnect Google Calendar?",
      "You'll need to reconnect to schedule meetings",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await disconnectGoogleCalendar();
              setConnected(false);
              Alert.alert("Disconnected", "Google Calendar disconnected");
            } catch (error) {
              console.error("Disconnect error:", error);
              Alert.alert("Error", "Failed to disconnect");
            }
          },
        },
      ]
    );
  };

  const handleFindOptimalTimes = async () => {
    try {
      setLoadingTimes(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const times = await getOptimalMeetingTimes(selectedDate, duration);
      setOptimalTimes(times);
      setShowingOptimalTimes(true);
    } catch (error) {
      console.error("Failed to find optimal times:", error);
      Alert.alert("Error", "Failed to find optimal meeting times");
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleScheduleMeeting = async (slot?: EnergyTimeSlot) => {
    if (!meetingTitle.trim()) {
      Alert.alert("Missing Title", "Please enter a meeting title");
      return;
    }

    try {
      setScheduling(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await scheduleOptimalMeeting(
        meetingTitle,
        meetingDescription,
        selectedDate,
        duration
      );

      if (result.success && result.slot) {
        const startTime = new Date(result.slot.startTime);
        Alert.alert(
          "Meeting Scheduled! 🎉",
          `${meetingTitle}\n\n` +
          `${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n` +
          `⚡ Energy Level: ${result.slot.energyLevel.toUpperCase()} (${Math.round(result.slot.energyScore)}%)`
        );
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Reset form
        setMeetingTitle("");
        setMeetingDescription("");
        setShowingOptimalTimes(false);
      } else {
        Alert.alert("Scheduling Failed", result.message);
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      Alert.alert("Error", "Failed to schedule meeting");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setScheduling(false);
    }
  };

  const getEnergyColor = (level: string) => {
    switch (level) {
      case "high":
        return "#22C55E";
      case "moderate":
        return "#F59E0B";
      case "low":
        return "#EF4444";
      default:
        return "#687076";
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
        <Text className="text-xl font-bold text-foreground">Calendar</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Loading...</Text>
          </View>
        ) : (
          <View className="p-6 gap-6">
            {/* Connection Status */}
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">📅</Text>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">
                    Google Calendar
                  </Text>
                  <Text className="text-sm text-muted">
                    {connected ? "Connected" : "Not connected"}
                  </Text>
                </View>
                {connected && (
                  <View className="bg-success/20 px-3 py-1 rounded-full">
                    <Text className="text-xs text-success font-medium">✓ Connected</Text>
                  </View>
                )}
              </View>

              {connected ? (
                <TouchableOpacity
                  onPress={handleDisconnect}
                  className="bg-error/10 border border-error/30 py-3 rounded-lg"
                >
                  <Text className="text-error font-medium text-center">Disconnect</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleConnect}
                  className="bg-primary py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    Connect Google Calendar
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Schedule Meeting Form */}
            {connected && (
              <>
                <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
                  <Text className="text-lg font-bold text-foreground">
                    Schedule Optimal Meeting
                  </Text>

                  {/* Meeting Title */}
                  <View>
                    <Text className="text-xs font-medium text-muted mb-2">MEETING TITLE *</Text>
                    <TextInput
                      value={meetingTitle}
                      onChangeText={setMeetingTitle}
                      placeholder="e.g., Team Standup"
                      placeholderTextColor="#9BA1A6"
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                    />
                  </View>

                  {/* Meeting Description */}
                  <View>
                    <Text className="text-xs font-medium text-muted mb-2">DESCRIPTION</Text>
                    <TextInput
                      value={meetingDescription}
                      onChangeText={setMeetingDescription}
                      placeholder="Optional meeting details"
                      placeholderTextColor="#9BA1A6"
                      multiline
                      numberOfLines={3}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                    />
                  </View>

                  {/* Duration */}
                  <View>
                    <Text className="text-xs font-medium text-muted mb-2">DURATION</Text>
                    <View className="flex-row gap-2">
                      {[30, 60, 90, 120].map((mins) => (
                        <TouchableOpacity
                          key={mins}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setDuration(mins);
                          }}
                          className={`flex-1 py-2 rounded-lg ${
                            duration === mins
                              ? "bg-primary"
                              : "bg-background border border-border"
                          }`}
                        >
                          <Text
                            className={`text-sm font-medium text-center ${
                              duration === mins ? "text-white" : "text-foreground"
                            }`}
                          >
                            {mins}m
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Find Optimal Times Button */}
                  <TouchableOpacity
                    onPress={handleFindOptimalTimes}
                    disabled={loadingTimes}
                    className="bg-primary/10 border border-primary/30 py-3 rounded-lg flex-row items-center justify-center gap-2"
                  >
                    {loadingTimes ? (
                      <>
                        <ActivityIndicator size="small" color="#0A7EA4" />
                        <Text className="text-primary font-medium">Finding Times...</Text>
                      </>
                    ) : (
                      <>
                        <Text className="text-lg">⚡</Text>
                        <Text className="text-primary font-medium">Find Optimal Times</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Optimal Time Slots */}
                {showingOptimalTimes && optimalTimes.length > 0 && (
                  <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
                    <Text className="text-lg font-bold text-foreground">
                      Recommended Times
                    </Text>
                    <Text className="text-sm text-muted">
                      Based on your energy patterns for {selectedDate.toLocaleDateString()}
                    </Text>

                    <View className="gap-2">
                      {optimalTimes.slice(0, 5).map((slot, index) => {
                        const startTime = new Date(slot.startTime);
                        return (
                          <View
                            key={index}
                            className="bg-background rounded-lg p-4 border border-border gap-2"
                          >
                            <View className="flex-row items-center justify-between">
                              <Text className="text-base font-semibold text-foreground">
                                {startTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                              <View
                                className="px-3 py-1 rounded-full"
                                style={{
                                  backgroundColor: getEnergyColor(slot.energyLevel) + "20",
                                }}
                              >
                                <Text
                                  className="text-xs font-medium"
                                  style={{ color: getEnergyColor(slot.energyLevel) }}
                                >
                                  {slot.energyLevel.toUpperCase()} ({Math.round(slot.energyScore)}%)
                                </Text>
                              </View>
                            </View>
                            {slot.recommended && (
                              <View className="bg-success/10 px-2 py-1 rounded">
                                <Text className="text-xs text-success">✓ Recommended</Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Schedule Button */}
                    <TouchableOpacity
                      onPress={() => handleScheduleMeeting()}
                      disabled={scheduling}
                      className={`${
                        scheduling ? "bg-primary/50" : "bg-primary"
                      } py-4 rounded-full flex-row items-center justify-center gap-2`}
                    >
                      {scheduling ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text className="text-white font-semibold">Scheduling...</Text>
                        </>
                      ) : (
                        <>
                          <Text className="text-lg">📅</Text>
                          <Text className="text-white font-semibold">
                            Schedule at Best Time
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Info */}
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
              <Text className="text-sm text-foreground">
                💡 <Text className="font-medium">Smart Scheduling:</Text> The app analyzes your
                energy patterns and suggests meeting times when you'll be most focused and
                productive.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

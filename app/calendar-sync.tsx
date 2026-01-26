import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile } from "@/lib/storage";
import { UserProfile } from "@/types";
import {
  requestCalendarPermissions,
  getCalendars,
  getCalendarEvents,
  analyzeEventsWithEnergy,
  findOptimalMeetingTimes,
  saveSelectedCalendars,
  getSelectedCalendars,
  EnergyAnalyzedEvent,
} from "@/lib/calendar-integration";
import * as Calendar from "expo-calendar";

export default function CalendarSyncScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [analyzedEvents, setAnalyzedEvents] = useState<EnergyAnalyzedEvent[]>([]);
  const [optimalTimes, setOptimalTimes] = useState<{ date: Date; score: number; alignment: string }[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    
    const granted = await requestCalendarPermissions();
    setPermissionGranted(granted);
    
    if (granted) {
      const cals = await getCalendars();
      setCalendars(cals);
      
      const selected = await getSelectedCalendars();
      setSelectedCalendars(selected);
      
      if (selected.length > 0 && userProfile) {
        await analyzeCalendar(userProfile, selected);
      }
    }
    
    setLoading(false);
  };

  const analyzeCalendar = async (userProfile: UserProfile, calendarIds: string[]) => {
    // Get events for next 14 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    
    const events = await getCalendarEvents(calendarIds, startDate, endDate);
    const analyzed = await analyzeEventsWithEnergy(userProfile, events);
    setAnalyzedEvents(analyzed);
    
    // Find optimal meeting times
    const optimal = await findOptimalMeetingTimes(userProfile, startDate, endDate);
    setOptimalTimes(optimal.slice(0, 10)); // Top 10
  };

  const toggleCalendar = async (calendarId: string) => {
    let newSelected: string[];
    if (selectedCalendars.includes(calendarId)) {
      newSelected = selectedCalendars.filter(id => id !== calendarId);
    } else {
      newSelected = [...selectedCalendars, calendarId];
    }
    
    setSelectedCalendars(newSelected);
    await saveSelectedCalendars(newSelected);
    
    if (newSelected.length > 0 && profile) {
      await analyzeCalendar(profile, newSelected);
    } else {
      setAnalyzedEvents([]);
      setOptimalTimes([]);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  if (!permissionGranted) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-2xl">📅</Text>
          <Text className="text-xl font-bold text-foreground text-center">
            Calendar Access Required
          </Text>
          <Text className="text-sm text-muted text-center max-w-sm">
            To analyze your meetings and suggest optimal scheduling, Energy Today needs access to your calendar.
          </Text>
          <TouchableOpacity
            onPress={async () => {
              const granted = await requestCalendarPermissions();
              if (granted) {
                loadData();
              }
            }}
            className="bg-primary px-6 py-3 rounded-full mt-4"
          >
            <Text className="text-white font-semibold">Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-sm text-muted">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Calendar Sync</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Select Calendars */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">SELECT CALENDARS</Text>
            
            {calendars.length === 0 ? (
              <Text className="text-sm text-muted">No calendars found</Text>
            ) : (
              calendars.map(calendar => (
                <View key={calendar.id} className="flex-row items-center justify-between py-2">
                  <View className="flex-1">
                    <Text className="text-base text-foreground">{calendar.title}</Text>
                    <Text className="text-xs text-muted">{calendar.source.name}</Text>
                  </View>
                  <Switch
                    value={selectedCalendars.includes(calendar.id)}
                    onValueChange={() => toggleCalendar(calendar.id)}
                  />
                </View>
              ))
            )}
          </View>

          {/* Analyzed Events */}
          {analyzedEvents.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-medium text-muted mb-2">UPCOMING MEETINGS ({analyzedEvents.length})</Text>
              
              {analyzedEvents.slice(0, 5).map(event => (
                <View key={event.id} className="py-3 border-b border-border">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">{event.title}</Text>
                      <Text className="text-xs text-muted mt-1">
                        {event.startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        event.energyAlignment === "strong"
                          ? "bg-success/20"
                          : event.energyAlignment === "moderate"
                          ? "bg-warning/20"
                          : "bg-error/20"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          event.energyAlignment === "strong"
                            ? "text-success"
                            : event.energyAlignment === "moderate"
                            ? "text-warning"
                            : "text-error"
                        }`}
                      >
                        {event.energyAlignment}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-muted">{event.recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Optimal Meeting Times */}
          {optimalTimes.length > 0 && (
            <View className="bg-primary/10 rounded-2xl p-5 border border-primary/20 gap-3">
              <Text className="text-sm font-medium text-muted mb-2">OPTIMAL MEETING TIMES</Text>
              <Text className="text-xs text-muted mb-3">
                Best times for scheduling new meetings based on your energy patterns
              </Text>
              
              {optimalTimes.slice(0, 5).map((time, index) => (
                <View key={index} className="flex-row items-center justify-between py-2">
                  <View>
                    <Text className="text-base font-medium text-foreground">
                      {time.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text className="text-xs text-muted">
                      {time.date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-primary">{time.score}%</Text>
                    <Text className="text-lg">🟢</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

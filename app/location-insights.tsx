/**
 * Location Insights Screen
 * 
 * Display location-energy correlations
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getPlaces,
  addPlace,
  deletePlace,
  analyzeLocationInsights,
  requestLocationPermissions,
  suggestPlaces,
  type Place,
  type LocationInsights,
} from "@/lib/location-insights";

export default function LocationInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [insights, setInsights] = useState<LocationInsights | null>(null);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceType, setNewPlaceType] = useState<"home" | "work" | "gym" | "cafe" | "other">(
    "other"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [placesData, insightsData] = await Promise.all([
        getPlaces(),
        analyzeLocationInsights(),
      ]);
      setPlaces(placesData);
      setInsights(insightsData);
    } catch (error) {
      console.error("Failed to load location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await requestLocationPermissions();
    if (granted) {
      Alert.alert("Success", "Location permissions granted");
      loadData();
    } else {
      Alert.alert("Error", "Location permissions denied");
    }
  };

  const handleAddPlace = async () => {
    if (!newPlaceName.trim()) {
      Alert.alert("Error", "Please enter a place name");
      return;
    }

    try {
      await addPlace({
        name: newPlaceName.trim(),
        type: newPlaceType,
        latitude: 0, // In production, get from current location or map picker
        longitude: 0,
        radius: 100,
      });

      setShowAddPlace(false);
      setNewPlaceName("");
      setNewPlaceType("other");
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to add place");
    }
  };

  const handleDeletePlace = async (id: string) => {
    try {
      await deletePlace(id);
      loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to delete place");
    }
  };

  const getPlaceIcon = (type: string): string => {
    switch (type) {
      case "home":
        return "🏠";
      case "work":
        return "💼";
      case "gym":
        return "💪";
      case "cafe":
        return "☕";
      default:
        return "📍";
    }
  };

  const getEnergyColor = (energy: number): string => {
    if (energy >= 70) return "#22C55E";
    if (energy >= 50) return "#F59E0B";
    return "#EF4444";
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
        <Text className="text-xl font-bold text-foreground">Locations</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddPlace(true);
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 gap-6">
          {/* Permissions */}
          <TouchableOpacity
            onPress={handleRequestPermissions}
            className="bg-primary/10 rounded-2xl p-5 border border-primary/30"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">📍</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground mb-1">
                  Enable Location Tracking
                </Text>
                <Text className="text-sm text-muted">
                  Allow access to correlate places with energy
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Top Energy Places */}
          {insights?.topEnergyPlaces && insights.topEnergyPlaces.length > 0 && (
            <View className="bg-success/10 rounded-2xl p-5 border border-success/30">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-xl">⚡</Text>
                <Text className="text-base font-semibold text-foreground">
                  High Energy Places
                </Text>
              </View>
              <View className="gap-3">
                {insights.topEnergyPlaces.map((place) => (
                  <View key={place.id} className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-xl">{getPlaceIcon(place.type)}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">{place.name}</Text>
                        <Text className="text-xs text-muted">{place.visits} visits</Text>
                      </View>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${getEnergyColor(place.averageEnergy)}20` }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getEnergyColor(place.averageEnergy) }}
                      >
                        {place.averageEnergy}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Low Energy Places */}
          {insights?.lowEnergyPlaces && insights.lowEnergyPlaces.length > 0 && (
            <View className="bg-error/10 rounded-2xl p-5 border border-error/30">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-xl">⚠️</Text>
                <Text className="text-base font-semibold text-foreground">
                  Low Energy Places
                </Text>
              </View>
              <View className="gap-3">
                {insights.lowEnergyPlaces.map((place) => (
                  <View key={place.id} className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-xl">{getPlaceIcon(place.type)}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">{place.name}</Text>
                        <Text className="text-xs text-muted">{place.visits} visits</Text>
                      </View>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${getEnergyColor(place.averageEnergy)}20` }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getEnergyColor(place.averageEnergy) }}
                      >
                        {place.averageEnergy}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Time Patterns */}
          {insights?.patterns && (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-xl">🕐</Text>
                <Text className="text-base font-semibold text-foreground">Daily Patterns</Text>
              </View>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Morning</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {insights.patterns.morningLocation}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Afternoon</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {insights.patterns.afternoonLocation}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Evening</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {insights.patterns.eveningLocation}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recommendations */}
          {insights?.recommendations && insights.recommendations.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-xl">💡</Text>
                <Text className="text-base font-semibold text-foreground">Recommendations</Text>
              </View>
              <View className="gap-3">
                {insights.recommendations.map((rec, index) => (
                  <View key={index} className="flex-row items-start gap-2">
                    <Text className="text-primary mt-1">•</Text>
                    <Text className="flex-1 text-sm text-muted leading-relaxed">{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* All Places */}
          {places.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">Your Places</Text>
              <View className="gap-3">
                {places.map((place) => (
                  <View
                    key={place.id}
                    className="flex-row items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-xl">{getPlaceIcon(place.type)}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">{place.name}</Text>
                        <Text className="text-xs text-muted capitalize">{place.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePlace(place.id)}
                      className="p-2"
                    >
                      <Text className="text-error text-sm">Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Place Modal */}
      <Modal visible={showAddPlace} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <TouchableOpacity
              onPress={() => {
                setShowAddPlace(false);
                setNewPlaceName("");
              }}
            >
              <Text className="text-error text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-foreground">Add Place</Text>
            <TouchableOpacity onPress={handleAddPlace}>
              <Text className="text-primary text-base font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <View className="p-6 gap-6">
            {/* Place Name */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Place Name</Text>
              <TextInput
                value={newPlaceName}
                onChangeText={setNewPlaceName}
                placeholder="e.g., Home, Office, Gym"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#9BA1A6"
              />
            </View>

            {/* Place Type */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-3">Type</Text>
              <View className="gap-2">
                {(["home", "work", "gym", "cafe", "other"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setNewPlaceType(type);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`flex-row items-center gap-3 p-4 rounded-lg border ${
                      newPlaceType === type
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text className="text-2xl">{getPlaceIcon(type)}</Text>
                    <Text
                      className={`text-sm font-medium capitalize ${
                        newPlaceType === type ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

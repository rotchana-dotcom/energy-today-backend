import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useProfile } from "@/lib/profile-context";
import { UserProfile } from "@/types";
import { geocode } from "@/lib/geocoding";

/**
 * Onboarding Profile Screen
 * 
 * Collects user data and saves it, then navigates back to entry point
 * to let app/index.tsx decide the next route.
 * 
 * Flow:
 * 1. User fills form
 * 2. Save to AsyncStorage + ProfileContext
 * 3. Wait 500ms for AsyncStorage to persist
 * 4. Navigate to "/" (entry point)
 * 5. app/index.tsx re-checks and routes to /(tabs)
 */
export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthTime, setBirthTime] = useState<string | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const { saveProfile } = useProfile();

  const handleSubmit = async () => {
    // Prevent double-tap
    if (loading) {
      console.log('[Onboarding] Already processing, ignoring duplicate tap');
      return;
    }

    if (!name.trim() || !city.trim() || !country.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      console.log('[Onboarding] Starting profile save...');

      // Format date as YYYY-MM-DD (no time component)
      const year = dateOfBirth.getFullYear();
      const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
      const day = String(dateOfBirth.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      // Geocode city/country to coordinates for accurate astrology
      const coordinates = geocode(city.trim(), country.trim());
      console.log('[Onboarding] Geocoded coordinates:', coordinates);

      const profile: UserProfile = {
        name: name.trim(),
        dateOfBirth: dateString, // Simple date string, no time
        timeOfBirth: birthTime, // Optional HH:MM format
        placeOfBirth: {
          city: city.trim(),
          country: country.trim(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        onboardingComplete: true,
      };

      console.log('[Onboarding] Saving profile:', profile.name);
      
      // Save to both AsyncStorage AND ProfileContext
      await saveProfile(profile);
      
      console.log('[Onboarding] Profile saved successfully');
      
      // Wait 500ms to ensure AsyncStorage has persisted
      // This is a safety buffer for physical devices
      console.log('[Onboarding] Waiting 500ms for AsyncStorage persistence...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[Onboarding] Navigating to entry point (/)');
      // Navigate to "/" (entry point) instead of directly to "/(tabs)"
      // Let app/index.tsx re-check and route correctly
      router.replace("/");
      
    } catch (error) {
      console.error('[Onboarding] ===== ERROR DURING PROFILE SAVE =====');
      console.error('[Onboarding] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[Onboarding] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[Onboarding] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[Onboarding] Form data:', {
        name: name.trim(),
        dateOfBirth: dateOfBirth.toISOString(),
        city: city.trim(),
        country: country.trim(),
        birthTime,
      });
      console.error('[Onboarding] ===== END ERROR =====');
      
      setLoading(false);
      
      // Show detailed error message
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}\n\nStack: ${error.stack?.substring(0, 200)}...`
        : String(error);
      
      alert(`Failed to save profile:\n\n${errorMessage}\n\nPlease screenshot this error and send to developer.`);
    }
    
    // Don't set loading=false here - we're navigating away
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2 mt-4">
            <Text className="text-3xl font-bold text-foreground">
              Your Profile
            </Text>
            <Text className="text-base text-muted">
              We need a few details to calculate your unique energy profile
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4 mt-4">
            {/* Name */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9BA1A6"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                editable={!loading}
              />
            </View>

            {/* Date of Birth */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Date of Birth</Text>
              <Text className="text-xs text-muted mb-1">
                Buddhist Era years (พ.ศ.) will be automatically converted to CE
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-surface border border-border rounded-lg px-4 py-3"
                disabled={loading}
              >
                <Text className="text-foreground">
                  {dateOfBirth.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                    }
                  }}
                  minimumDate={new Date(1900, 0, 1)}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Birth Time (Optional) */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Birth Time (Optional)</Text>
              <Text className="text-xs text-muted mb-1">
                For more accurate rising sign calculation. Leave blank if unknown.
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-surface border border-border rounded-lg px-4 py-3"
                disabled={loading}
              >
                <Text className="text-foreground">
                  {birthTime || "Tap to set birth time (optional)"}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="default"
                  onChange={(event: any, selectedTime?: Date) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (selectedTime) {
                      const hours = selectedTime.getHours().toString().padStart(2, '0');
                      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                      setBirthTime(`${hours}:${minutes}`);
                    }
                  }}
                />
              )}
            </View>

            {/* Place of Birth - City */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Birth City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="e.g., New York"
                placeholderTextColor="#9BA1A6"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                editable={!loading}
              />
            </View>

            {/* Place of Birth - Country */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Birth Country</Text>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="e.g., United States"
                placeholderTextColor="#9BA1A6"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                editable={!loading}
              />
            </View>
          </View>

          {/* Privacy Note */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm text-muted text-center">
              🔒 Your data stays on your device and is never shared
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-primary px-8 py-4 rounded-full active:opacity-80 mt-4"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white font-semibold text-lg text-center">
              {loading ? "Saving..." : "Calculate My Energy"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Voice Input Component
 * 
 * Records voice and transcribes to text using device speech recognition
 */

import { useState } from "react";
import { View, TouchableOpacity, Text, Platform, Alert } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export function VoiceInput({ onTranscript, placeholder = "Tap to speak" }: VoiceInputProps) {
  const colors = useColors();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  async function startRecording() {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please enable microphone access to use voice input.");
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start voice recording");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setIsRecording(false);
      setRecording(null);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // For now, show a placeholder message
      // In production, you would send the audio to a speech-to-text API
      // or use device native speech recognition
      Alert.alert(
        "Voice Input",
        "Voice recording complete. Please type your meal manually for now.\n\n(Speech-to-text will be added in the next update)",
        [
          {
            text: "OK",
            onPress: () => {
              // Placeholder: in production, this would be the transcribed text
              onTranscript("");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to process voice recording");
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }

  return (
    <TouchableOpacity
      onPress={toggleRecording}
      style={{
        backgroundColor: isRecording ? colors.error : colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
      activeOpacity={0.7}
    >
      <Text style={{ fontSize: 20 }}>
        {isRecording ? "⏹️" : "🎤"}
      </Text>
      <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
        {isRecording ? "Stop Recording" : placeholder}
      </Text>
    </TouchableOpacity>
  );
}

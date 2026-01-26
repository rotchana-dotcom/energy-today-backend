import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VOICE_NOTES_KEY = "@energy_today_voice_notes";

export interface VoiceNote {
  id: string;
  date: string;
  uri: string;
  duration: number; // in milliseconds
  createdAt: string;
}

/**
 * Request audio recording permissions
 */
export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting audio permissions:", error);
    return false;
  }
}

/**
 * Start recording audio
 */
export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    // Configure audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error("Failed to start recording:", error);
    return null;
  }
}

/**
 * Stop recording and save the audio file
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<VoiceNote | null> {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (!uri) {
      throw new Error("No recording URI available");
    }

    // Get recording duration
    const status = await recording.getStatusAsync();
    const duration = (status as any).durationMillis ?? 0;

    // Create voice note object
    const voiceNote: VoiceNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      uri,
      duration,
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    await saveVoiceNote(voiceNote);

    return voiceNote;
  } catch (error) {
    console.error("Failed to stop recording:", error);
    return null;
  }
}

/**
 * Save voice note to storage
 */
async function saveVoiceNote(voiceNote: VoiceNote): Promise<void> {
  const notes = await getVoiceNotes();
  notes.push(voiceNote);
  await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(notes));
}

/**
 * Get all voice notes
 */
export async function getVoiceNotes(): Promise<VoiceNote[]> {
  const data = await AsyncStorage.getItem(VOICE_NOTES_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get voice notes for a specific date
 */
export async function getVoiceNotesForDate(date: string): Promise<VoiceNote[]> {
  const notes = await getVoiceNotes();
  return notes.filter((note) => note.date === date);
}

/**
 * Delete a voice note
 */
export async function deleteVoiceNote(id: string): Promise<void> {
  const notes = await getVoiceNotes();
  const note = notes.find((n) => n.id === id);

  if (note) {
    // Delete the audio file
    try {
      await FileSystem.deleteAsync(note.uri, { idempotent: true });
    } catch (error) {
      console.error("Failed to delete audio file:", error);
    }

    // Remove from storage
    const updatedNotes = notes.filter((n) => n.id !== id);
    await AsyncStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(updatedNotes));
  }
}

/**
 * Play a voice note
 */
export async function playVoiceNote(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error("Failed to play voice note:", error);
    return null;
  }
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

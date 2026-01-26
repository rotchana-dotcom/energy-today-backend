import { describe, it, expect, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getVoiceJournalSettings, saveVoiceJournalEntry, getVoiceJournalEntries } from "../lib/voice-journal-enhanced";
import { getNotificationSettings, scheduleHabitReminder } from "../lib/smart-notifications";
import { getSyncSettings, saveBiometricReading, getBiometricReadings } from "../lib/biometric-sync";

describe("Phase 94-96: Basic Functionality", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("should get biometric sync settings", async () => {
    const settings = await getSyncSettings();
    expect(settings).toHaveProperty("autoSync");
  });

  it("should save biometric reading", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 72,
      unit: "bpm",
      source: "manual",
    });

    const readings = await getBiometricReadings();
    expect(readings.length).toBe(1);
  });

  it("should get notification settings", async () => {
    const settings = await getNotificationSettings();
    expect(settings).toHaveProperty("enabled");
  });

  it("should schedule habit reminder", async () => {
    const id = await scheduleHabitReminder("Test", "10:00");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should get voice journal settings", async () => {
    const settings = await getVoiceJournalSettings();
    expect(settings).toHaveProperty("autoTranscribe");
  });

  it("should save voice journal entry", async () => {
    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Test",
      tags: [],
      sentiment: "neutral",
      keywords: [],
    });

    const entries = await getVoiceJournalEntries();
    expect(entries.length).toBe(1);
  });
});

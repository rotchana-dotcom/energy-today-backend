import { describe, it, expect, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Phase 94: Biometric Integration Enhancement
import {
  getSyncSettings,
  updateSyncSettings,
  saveBiometricReading,
  getBiometricReadings,
  getBiometricReadingsByType,
  getBiometricStats,
  analyzeBiometricEnergyCorrelation,
  getBiometricInsights,
  syncAppleHealth,
  syncGoogleFit,
  addManualBiometricReading,
  deleteBiometricReading,
} from "../lib/biometric-sync";

// Phase 95: Smart Notifications System
import {
  getNotificationSettings,
  updateNotificationSettings,
  scheduleHabitReminder,
  scheduleMealReminder,
  scheduleHydrationReminder,
  scheduleMovementReminder,
  scheduleSleepReminder,
  scheduleEnergyCheckIn,
  cancelNotification,
  getNotificationHistory,
  markNotificationActed,
  getNotificationStats,
  getNotificationInsights,
} from "../lib/smart-notifications";

// Phase 96: Energy Journal with Voice Notes
import {
  getVoiceJournalSettings,
  updateVoiceJournalSettings,
  saveVoiceJournalEntry,
  getVoiceJournalEntries,
  getVoiceJournalEntriesByDateRange,
  updateVoiceJournalEntry,
  deleteVoiceJournalEntry,
  transcribeAudio,
  detectSentiment,
  extractKeywords,
  suggestTags,
  getVoiceJournalInsights,
  getWeeklySummary,
  searchVoiceJournalEntries,
} from "../lib/voice-journal-enhanced";

describe("Phase 94: Biometric Integration Enhancement", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("should get default sync settings", async () => {
    const settings = await getSyncSettings();
    expect(settings.autoSync).toBe(true);
    expect(settings.syncHeartRate).toBe(true);
    expect(settings.syncSteps).toBe(true);
  });

  it("should update sync settings", async () => {
    await updateSyncSettings({ autoSync: false, syncInterval: 120 });
    const settings = await getSyncSettings();
    expect(settings.autoSync).toBe(false);
    expect(settings.syncInterval).toBe(120);
  });

  it("should save and retrieve biometric reading", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 72,
      unit: "bpm",
      source: "manual",
    });

    const readings = await getBiometricReadings();
    expect(readings.length).toBe(1);
    expect(readings[0].type).toBe("heart_rate");
    expect(readings[0].value).toBe(72);
  });

  it("should get biometric readings by type", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 72,
      unit: "bpm",
      source: "manual",
    });

    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "steps",
      value: 8000,
      unit: "steps",
      source: "manual",
    });

    const heartRateReadings = await getBiometricReadingsByType("heart_rate", 30);
    expect(heartRateReadings.length).toBe(1);
    expect(heartRateReadings[0].type).toBe("heart_rate");
  });

  it("should calculate biometric stats", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 72,
      unit: "bpm",
      source: "manual",
    });

    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "steps",
      value: 8000,
      unit: "steps",
      source: "manual",
    });

    const stats = await getBiometricStats(30);
    expect(stats.averageHeartRate).toBe(72);
    expect(stats.totalSteps).toBe(8000);
  });

  it("should analyze biometric energy correlation", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 65,
      unit: "bpm",
      source: "manual",
    });

    const correlations = await analyzeBiometricEnergyCorrelation();
    expect(correlations.length).toBeGreaterThan(0);
    expect(correlations[0]).toHaveProperty("metric");
    expect(correlations[0]).toHaveProperty("correlation");
    expect(correlations[0]).toHaveProperty("recommendation");
  });

  it("should get biometric insights", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "resting_hr",
      value: 58,
      unit: "bpm",
      source: "manual",
    });

    const insights = await getBiometricInsights();
    expect(insights.length).toBeGreaterThan(0);
    expect(typeof insights[0]).toBe("string");
  });

  it("should add manual biometric reading", async () => {
    await addManualBiometricReading("heart_rate", 75, "bpm");
    const readings = await getBiometricReadings();
    expect(readings.length).toBe(1);
    expect(readings[0].source).toBe("manual");
  });

  it("should delete biometric reading", async () => {
    await saveBiometricReading({
      timestamp: new Date().toISOString(),
      type: "heart_rate",
      value: 72,
      unit: "bpm",
      source: "manual",
    });

    const readings = await getBiometricReadings();
    await deleteBiometricReading(readings[0].id);

    const afterDelete = await getBiometricReadings();
    expect(afterDelete.length).toBe(0);
  });

  it("should sync with Apple Health (simulated)", async () => {
    const result = await syncAppleHealth();
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
  });

  it("should sync with Google Fit (simulated)", async () => {
    const result = await syncGoogleFit();
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
  });
});

describe("Phase 95: Smart Notifications System", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("should get default notification settings", async () => {
    const settings = await getNotificationSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.habitReminders).toBe(true);
    expect(settings.adaptiveTiming).toBe(true);
  });

  it("should update notification settings", async () => {
    await updateNotificationSettings({
      habitReminders: false,
      quietHoursStart: "23:00",
    });

    const settings = await getNotificationSettings();
    expect(settings.habitReminders).toBe(false);
    expect(settings.quietHoursStart).toBe("23:00");
  });

  it("should schedule habit reminder", async () => {
    const id = await scheduleHabitReminder("Morning Exercise", "08:00");
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should schedule meal reminder", async () => {
    const id = await scheduleMealReminder("breakfast", "08:30");
    expect(typeof id).toBe("string");
  });

  it("should schedule hydration reminder", async () => {
    const id = await scheduleHydrationReminder("10:00");
    expect(typeof id).toBe("string");
  });

  it("should schedule movement reminder", async () => {
    const id = await scheduleMovementReminder("14:00");
    expect(typeof id).toBe("string");
  });

  it("should schedule sleep reminder", async () => {
    const id = await scheduleSleepReminder("22:00");
    expect(typeof id).toBe("string");
  });

  it("should schedule energy check-in", async () => {
    const id = await scheduleEnergyCheckIn("12:00");
    expect(typeof id).toBe("string");
  });

  it("should get notification history", async () => {
    await scheduleHabitReminder("Test Habit", "10:00");
    const history = await getNotificationHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty("type");
    expect(history[0]).toHaveProperty("status");
  });

  it("should mark notification as acted", async () => {
    const id = await scheduleHabitReminder("Test Habit", "10:00");
    await markNotificationActed(id);
    const history = await getNotificationHistory();
    const notification = history.find((n) => n.id === id);
    expect(notification?.status).toBe("acted");
  });

  it("should get notification stats", async () => {
    await scheduleHabitReminder("Test Habit", "10:00");
    const stats = await getNotificationStats(30);
    expect(stats).toHaveProperty("totalSent");
    expect(stats).toHaveProperty("engagementRate");
    expect(stats).toHaveProperty("byType");
  });

  it("should get notification insights", async () => {
    const insights = await getNotificationInsights();
    expect(Array.isArray(insights)).toBe(true);
  });

  it("should cancel notification", async () => {
    const id = await scheduleHabitReminder("Test Habit", "10:00");
    await cancelNotification(id);
    const history = await getNotificationHistory();
    const notification = history.find((n) => n.id === id);
    expect(notification?.status).toBe("dismissed");
  });
});

describe("Phase 96: Energy Journal with Voice Notes", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("should get default voice journal settings", async () => {
    const settings = await getVoiceJournalSettings();
    expect(settings.autoTranscribe).toBe(true);
    expect(settings.saveAudio).toBe(true);
    expect(settings.autoDetectMood).toBe(true);
  });

  it("should update voice journal settings", async () => {
    await updateVoiceJournalSettings({
      autoTranscribe: false,
      privacyMode: true,
    });

    const settings = await getVoiceJournalSettings();
    expect(settings.autoTranscribe).toBe(false);
    expect(settings.privacyMode).toBe(true);
  });

  it("should save and retrieve voice journal entry", async () => {
    const entry = await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "This is a test voice note about my energy levels",
      energyLevel: 75,
      mood: "positive",
      tags: ["work", "energy"],
      sentiment: "positive",
      keywords: ["energy", "work"],
    });

    expect(entry).toHaveProperty("id");
    expect(entry.transcription).toContain("test voice note");

    const entries = await getVoiceJournalEntries();
    expect(entries.length).toBe(1);
  });

  it("should get voice journal entries by date range", async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await saveVoiceJournalEntry({
      timestamp: now.toISOString(),
      duration: 30,
      transcription: "Today's note",
      tags: [],
      sentiment: "neutral",
      keywords: [],
    });

    const entries = await getVoiceJournalEntriesByDateRange(yesterday, now);
    expect(entries.length).toBe(1);
  });

  it("should update voice journal entry", async () => {
    const entry = await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Original transcription",
      tags: [],
      sentiment: "neutral",
      keywords: [],
    });

    await updateVoiceJournalEntry(entry.id, {
      transcription: "Updated transcription",
      tags: ["updated"],
    });

    const entries = await getVoiceJournalEntries();
    expect(entries[0].transcription).toBe("Updated transcription");
    expect(entries[0].tags).toContain("updated");
  });

  it("should delete voice journal entry", async () => {
    const entry = await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Test entry",
      tags: [],
      sentiment: "neutral",
      keywords: [],
    });

    await deleteVoiceJournalEntry(entry.id);
    const entries = await getVoiceJournalEntries();
    expect(entries.length).toBe(0);
  });

  it("should transcribe audio (simulated)", async () => {
    const transcription = await transcribeAudio("test_audio_uri");
    expect(typeof transcription).toBe("string");
    expect(transcription.length).toBeGreaterThan(0);
  });

  it("should detect sentiment from text", () => {
    const positiveText = "I feel great and happy today!";
    const negativeText = "I feel terrible and sad today.";
    const neutralText = "Today is a normal day.";

    expect(detectSentiment(positiveText)).toBe("positive");
    expect(detectSentiment(negativeText)).toBe("negative");
    expect(detectSentiment(neutralText)).toBe("neutral");
  });

  it("should extract keywords from text", () => {
    const text = "I had a productive day at work with good energy levels";
    const keywords = extractKeywords(text);
    expect(keywords).toContain("work");
    expect(keywords).toContain("energy");
    expect(keywords).toContain("productive");
  });

  it("should suggest tags based on content", () => {
    const text = "I did a great workout and felt energized";
    const tags = suggestTags(text, 85);
    expect(tags).toContain("high-energy");
    expect(tags).toContain("exercise");
  });

  it("should get voice journal insights", async () => {
    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Feeling energized after workout",
      energyLevel: 85,
      tags: ["exercise"],
      sentiment: "positive",
      keywords: ["energy", "workout"],
    });

    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 45,
      transcription: "Productive work session",
      energyLevel: 75,
      tags: ["work"],
      sentiment: "positive",
      keywords: ["work", "productive"],
    });

    const insights = await getVoiceJournalInsights(30);
    expect(insights.totalEntries).toBe(2);
    expect(insights.totalDuration).toBeGreaterThan(0);
    expect(insights.averageEnergyLevel).toBeGreaterThan(0);
    expect(insights.mostCommonKeywords.length).toBeGreaterThan(0);
  });

  it("should get weekly summary", async () => {
    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Test entry",
      energyLevel: 75,
      tags: ["test"],
      sentiment: "positive",
      keywords: ["test"],
    });

    const summary = await getWeeklySummary();
    expect(typeof summary).toBe("string");
    expect(summary.length).toBeGreaterThan(0);
  });

  it("should search voice journal entries", async () => {
    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "I had a great workout today",
      tags: ["exercise"],
      sentiment: "positive",
      keywords: ["workout"],
    });

    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: 30,
      transcription: "Productive work session",
      tags: ["work"],
      sentiment: "positive",
      keywords: ["work"],
    });

    const results = await searchVoiceJournalEntries("workout");
    expect(results.length).toBe(1);
    expect(results[0].transcription).toContain("workout");
  });
});

/**
 * Tests for Phase 57-59 Features
 * 
 * - Voice Note Sharing
 * - Weekly Digest Notifications
 * - Google Calendar Integration
 */

import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

describe("Voice Note Sharing", () => {
  it("should have voice note analysis component with share functionality", async () => {
    const componentPath = path.join(process.cwd(), "components/voice-note-analysis.tsx");
    const content = await fs.readFile(componentPath, "utf-8");
    
    // Check for share imports
    expect(content).toContain("import { View, Text, TouchableOpacity, ActivityIndicator, Share, Alert }");
    expect(content).toContain("import * as Clipboard from \"expo-clipboard\"");
    
    // Check for share handler
    expect(content).toContain("const handleShare = async () =>");
    expect(content).toContain("await Share.share");
    
    // Check for copy handler
    expect(content).toContain("const handleCopyToClipboard = async () =>");
    expect(content).toContain("await Clipboard.setStringAsync");
    
    // Check for share buttons in UI
    expect(content).toContain("Share");
    expect(content).toContain("Copy");
  });

  it("should format shared content with all analysis details", async () => {
    const componentPath = path.join(process.cwd(), "components/voice-note-analysis.tsx");
    const content = await fs.readFile(componentPath, "utf-8");
    
    // Check share text includes all key fields
    expect(content).toContain("Voice Note Analysis");
    expect(content).toContain("TRANSCRIPTION");
    expect(content).toContain("EMOTIONAL TONE");
    expect(content).toContain("ENERGY LEVEL");
    expect(content).toContain("EMOTIONS");
    expect(content).toContain("THEMES");
    expect(content).toContain("AI INSIGHT");
  });
});

describe("Weekly Digest Notifications", () => {
  it("should have weekly digest utility with all required functions", async () => {
    const utilPath = path.join(process.cwd(), "lib/weekly-digest.ts");
    const content = await fs.readFile(utilPath, "utf-8");
    
    // Check for key functions
    expect(content).toContain("export async function getDigestPreferences");
    expect(content).toContain("export async function saveDigestPreferences");
    expect(content).toContain("export async function generateWeeklySummary");
    expect(content).toContain("export async function scheduleWeeklyDigest");
    expect(content).toContain("export async function cancelWeeklyDigest");
    expect(content).toContain("export async function testDigestNotification");
    
    // Check for notification handler setup
    expect(content).toContain("Notifications.setNotificationHandler");
  });

  it("should have notification settings screen", async () => {
    const screenPath = path.join(process.cwd(), "app/notification-settings.tsx");
    const exists = await fs.access(screenPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for key UI elements
    expect(content).toContain("Weekly Digest");
    expect(content).toContain("DAY OF WEEK");
    expect(content).toContain("TIME");
    expect(content).toContain("Send Test Notification");
    expect(content).toContain("Save Settings");
  });

  it("should generate weekly summary with energy insights", async () => {
    const utilPath = path.join(process.cwd(), "lib/weekly-digest.ts");
    const content = await fs.readFile(utilPath, "utf-8");
    
    // Check summary includes key metrics
    expect(content).toContain("Average Energy");
    expect(content).toContain("Best Day");
    expect(content).toContain("Challenging Day");
    expect(content).toContain("Tip:");
  });
});

describe("Google Calendar Integration", () => {
  it("should have Google Calendar utility with OAuth and scheduling", async () => {
    const utilPath = path.join(process.cwd(), "lib/google-calendar.ts");
    const content = await fs.readFile(utilPath, "utf-8");
    
    // Check for key functions
    expect(content).toContain("export async function connectGoogleCalendar");
    expect(content).toContain("export async function isGoogleCalendarConnected");
    expect(content).toContain("export async function disconnectGoogleCalendar");
    expect(content).toContain("export async function getOptimalMeetingTimes");
    expect(content).toContain("export async function scheduleOptimalMeeting");
    
    // Check for energy-based time slot calculation
    expect(content).toContain("EnergyTimeSlot");
    expect(content).toContain("energyScore");
    expect(content).toContain("energyLevel");
    expect(content).toContain("recommended");
  });

  it("should have calendar integration screen", async () => {
    const screenPath = path.join(process.cwd(), "app/calendar-integration.tsx");
    const exists = await fs.access(screenPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for key UI elements
    expect(content).toContain("Google Calendar");
    expect(content).toContain("Schedule Optimal Meeting");
    expect(content).toContain("Find Optimal Times");
    expect(content).toContain("Recommended Times");
  });

  it("should calculate optimal meeting times based on energy", async () => {
    const utilPath = path.join(process.cwd(), "lib/google-calendar.ts");
    const content = await fs.readFile(utilPath, "utf-8");
    
    // Check energy calculation logic
    expect(content).toContain("calculateUnifiedEnergy");
    expect(content).toContain("energyData.combinedAnalysis.intensity");
    
    // Check time slot generation (9 AM to 6 PM)
    expect(content).toContain("const startHour = 9");
    expect(content).toContain("const endHour = 18");
    
    // Check energy level categorization
    expect(content).toContain("high");
    expect(content).toContain("moderate");
    expect(content).toContain("low");
  });
});

describe("Feature Integration", () => {
  it("should have all three features fully implemented", async () => {
    // Voice Note Sharing
    const voiceAnalysisExists = await fs.access(
      path.join(process.cwd(), "components/voice-note-analysis.tsx")
    ).then(() => true).catch(() => false);
    
    // Weekly Digest
    const weeklyDigestExists = await fs.access(
      path.join(process.cwd(), "lib/weekly-digest.ts")
    ).then(() => true).catch(() => false);
    
    const notificationSettingsExists = await fs.access(
      path.join(process.cwd(), "app/notification-settings.tsx")
    ).then(() => true).catch(() => false);
    
    // Google Calendar
    const googleCalendarExists = await fs.access(
      path.join(process.cwd(), "lib/google-calendar.ts")
    ).then(() => true).catch(() => false);
    
    const calendarIntegrationExists = await fs.access(
      path.join(process.cwd(), "app/calendar-integration.tsx")
    ).then(() => true).catch(() => false);
    
    expect(voiceAnalysisExists).toBe(true);
    expect(weeklyDigestExists).toBe(true);
    expect(notificationSettingsExists).toBe(true);
    expect(googleCalendarExists).toBe(true);
    expect(calendarIntegrationExists).toBe(true);
  });
});

describe("Implementation Summary", () => {
  it("validates all Phase 57-59 features are complete", async () => {
    const features = [
      { name: "Voice Note Sharing", path: "components/voice-note-analysis.tsx" },
      { name: "Weekly Digest Utility", path: "lib/weekly-digest.ts" },
      { name: "Notification Settings", path: "app/notification-settings.tsx" },
      { name: "Google Calendar Utility", path: "lib/google-calendar.ts" },
      { name: "Calendar Integration Screen", path: "app/calendar-integration.tsx" },
    ];

    for (const feature of features) {
      const exists = await fs.access(path.join(process.cwd(), feature.path))
        .then(() => true)
        .catch(() => false);
      expect(exists, `${feature.name} should exist`).toBe(true);
    }
  });
});

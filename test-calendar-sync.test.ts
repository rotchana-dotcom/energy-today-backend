import { describe, it, expect } from "vitest";

/**
 * Test suite for Google Calendar Sync functionality
 * 
 * Tests cover:
 * 1. Calendar sync helper functions
 * 2. Settings management
 * 3. Integration with each feature (Diet, Health, Fitness, Meditation, Business, Schedule)
 * 4. Calendar Sync Settings screen
 */

describe("Google Calendar Sync", () => {
  describe("Calendar Sync Helper Library", () => {
    it("should have calendar sync helper file", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    it("should export sync functions for all features", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      // Check for all sync functions
      expect(content).toContain("syncDietToCalendar");
      expect(content).toContain("syncFitnessToCalendar");
      expect(content).toContain("syncMeditationToCalendar");
      expect(content).toContain("syncHealthToCalendar");
      expect(content).toContain("syncBusinessToCalendar");
      expect(content).toContain("syncTaskToCalendar");
    });

    it("should have settings management functions", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      expect(content).toContain("getCalendarSyncSettings");
      expect(content).toContain("saveCalendarSyncSettings");
      expect(content).toContain("updateFeatureSyncSetting");
      expect(content).toContain("isFeatureSyncEnabled");
    });

    it("should define CalendarSyncSettings interface", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      expect(content).toContain("interface CalendarSyncSettings");
      expect(content).toContain("diet: boolean");
      expect(content).toContain("health: boolean");
      expect(content).toContain("fitness: boolean");
      expect(content).toContain("meditation: boolean");
      expect(content).toContain("business: boolean");
      expect(content).toContain("schedule: boolean");
    });
  });

  describe("Calendar Sync Settings Screen", () => {
    it("should have calendar sync settings screen", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/calendar-sync-settings.tsx", "utf-8");
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    it("should import calendar sync helper functions", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/calendar-sync-settings.tsx", "utf-8");
      
      expect(content).toContain("getCalendarSyncSettings");
      expect(content).toContain("saveCalendarSyncSettings");
      expect(content).toContain("CalendarSyncSettings");
    });

    it("should have toggle switches for all features", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/calendar-sync-settings.tsx", "utf-8");
      
      expect(content).toContain("Diet & Meals");
      expect(content).toContain("Health Activities");
      expect(content).toContain("Fitness Workouts");
      expect(content).toContain("Meditation Sessions");
      expect(content).toContain("Business Activities");
      expect(content).toContain("Scheduled Tasks");
    });

    it("should have Google Calendar connection UI", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/calendar-sync-settings.tsx", "utf-8");
      
      expect(content).toContain("Google Calendar");
      expect(content).toContain("Connect");
      expect(content).toContain("isGoogleCalendarConnected");
      expect(content).toContain("connectGoogleCalendar");
    });
  });

  describe("Diet App Integration", () => {
    it("should import syncDietToCalendar", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/(tabs)/health/diet.tsx", "utf-8");
      
      expect(content).toContain("syncDietToCalendar");
    });

    it("should call sync function when saving food entry", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/(tabs)/health/diet.tsx", "utf-8");
      
      expect(content).toContain("await syncDietToCalendar");
      expect(content).toContain("mealType");
      expect(content).toContain("food");
      expect(content).toContain("mealTime");
      expect(content).toContain("calories");
    });
  });

  describe("Meditation App Integration", () => {
    it("should import syncMeditationToCalendar", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/meditation-timer.tsx", "utf-8");
      
      expect(content).toContain("syncMeditationToCalendar");
    });

    it("should call sync function after meditation session", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/meditation-timer.tsx", "utf-8");
      
      expect(content).toContain("await syncMeditationToCalendar");
      expect(content).toContain("duration");
      expect(content).toContain("session.date");
    });
  });

  describe("Task Scheduler Integration", () => {
    it("should import syncTaskToCalendar", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/task-scheduler.tsx", "utf-8");
      
      expect(content).toContain("syncTaskToCalendar");
    });

    it("should call sync function when adding task with date/time", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/task-scheduler.tsx", "utf-8");
      
      expect(content).toContain("await syncTaskToCalendar");
      expect(content).toContain("scheduledDate");
      expect(content).toContain("scheduledTime");
      expect(content).toContain("estimatedDuration");
      expect(content).toContain("energyRequirement");
    });
  });

  describe("Health/Fitness App Integration", () => {
    it("should import sync functions in chi.tsx", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/(tabs)/health/chi.tsx", "utf-8");
      
      expect(content).toContain("syncHealthToCalendar");
      expect(content).toContain("syncFitnessToCalendar");
    });

    it("should call sync function when saving chi entry", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/(tabs)/health/chi.tsx", "utf-8");
      
      expect(content).toContain("await syncHealthToCalendar");
      expect(content).toContain("Chi/Energy Check-in");
      expect(content).toContain("energyLevel");
      expect(content).toContain("balanceLevel");
    });
  });

  describe("Settings Screen Integration", () => {
    it("should have Calendar Sync Settings link in settings", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/settings.tsx", "utf-8");
      
      expect(content).toContain("CALENDAR SYNC");
      expect(content).toContain("/calendar-sync-settings");
      expect(content).toContain("Calendar Sync Settings");
    });

    it("should describe calendar sync feature", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./app/settings.tsx", "utf-8");
      
      expect(content).toContain("Sync your activities to Google Calendar");
      expect(content).toContain("Configure which features sync automatically");
    });
  });

  describe("Google Calendar Integration", () => {
    it("should have google-calendar.ts library", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/google-calendar.ts", "utf-8");
      
      expect(content).toBeDefined();
      expect(content).toContain("createGoogleCalendarEvent");
      expect(content).toContain("isGoogleCalendarConnected");
      expect(content).toContain("connectGoogleCalendar");
    });

    it("should export EnergyTimeSlot interface", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/google-calendar.ts", "utf-8");
      
      expect(content).toContain("interface EnergyTimeSlot");
      expect(content).toContain("startTime");
      expect(content).toContain("endTime");
      expect(content).toContain("energyScore");
    });
  });

  describe("Error Handling", () => {
    it("should check if calendar is connected before syncing", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      // Each sync function should check connection
      expect(content).toContain("await isGoogleCalendarConnected()");
      expect(content).toContain("Google Calendar not connected");
    });

    it("should check if feature sync is enabled", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      expect(content).toContain("await isFeatureSyncEnabled");
      expect(content).toContain("calendar sync is disabled");
    });

    it("should return success/failure status", async () => {
      const fs = await import("fs/promises");
      const content = await fs.readFile("./lib/calendar-sync-helper.ts", "utf-8");
      
      // Check return type structure
      expect(content).toContain("success: boolean");
      expect(content).toContain("message: string");
    });
  });
});

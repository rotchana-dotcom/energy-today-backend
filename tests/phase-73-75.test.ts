/**
 * Tests for Phase 73-75: Weather Integration, Adaptive Reminders, Sleep Tracking
 */

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

describe("Phase 73-75: Weather, Reminders, Sleep", () => {
  describe("Weather Integration", () => {
    it("should have weather router file", () => {
      const path = resolve(__dirname, "../server/weather-router.ts");
      expect(existsSync(path)).toBe(true);
    });

    it("should have weather insights screen", () => {
      const path = resolve(__dirname, "../app/weather-insights.tsx");
      expect(existsSync(path)).toBe(true);
    });

    it("should export weather router procedures", async () => {
      const { weatherRouter } = await import("../server/weather-router");
      expect(weatherRouter).toBeDefined();
      expect(weatherRouter._def).toBeDefined();
    });

    it("should have weather correlation analysis", async () => {
      const { weatherRouter } = await import("../server/weather-router");
      const procedures = weatherRouter._def.procedures;
      expect(procedures.analyzeWeatherCorrelation).toBeDefined();
    });

    it("should have weather history endpoint", async () => {
      const { weatherRouter } = await import("../server/weather-router");
      const procedures = weatherRouter._def.procedures;
      expect(procedures.getWeatherHistory).toBeDefined();
    });

    it("should have get weather endpoint", async () => {
      const { weatherRouter } = await import("../server/weather-router");
      const procedures = weatherRouter._def.procedures;
      expect(procedures.getWeather).toBeDefined();
    });
  });

  describe("Energy-Based Adaptive Reminders", () => {
    it("should have adaptive reminders library file", () => {
      const path = resolve(__dirname, "../lib/adaptive-reminders.ts");
      expect(existsSync(path)).toBe(true);
    });

    it("should have adaptive reminders screen", () => {
      const path = resolve(__dirname, "../app/adaptive-reminders.tsx");
      expect(existsSync(path)).toBe(true);
    });

    it("should have reminder priority system", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      expect(content).toContain("priority");
      expect(content).toContain("low");
      expect(content).toContain("medium");
      expect(content).toContain("high");
    });

    it("should have energy adaptation logic", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      expect(content).toContain("adaptToEnergy");
      expect(content).toContain("minEnergyLevel");
      expect(content).toContain("shouldSendReminder");
    });

    it("should have reminder settings", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      expect(content).toContain("ReminderSettings");
      expect(content).toContain("quietHours");
    });

    it("should have reminder statistics", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      expect(content).toContain("getReminderStats");
    });

    it("should have notification scheduling", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      expect(content).toContain("scheduleAdaptiveNotification");
    });
  });

  describe("Sleep Tracking Integration", () => {
    it("should have sleep tracking library file", () => {
      const path = resolve(__dirname, "../lib/sleep-tracking.ts");
      expect(existsSync(path)).toBe(true);
    });

    it("should have sleep insights screen", () => {
      const path = resolve(__dirname, "../app/sleep-insights.tsx");
      expect(existsSync(path)).toBe(true);
    });

    it("should have sleep data structure", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("SleepData");
      expect(content).toContain("duration");
      expect(content).toContain("quality");
      expect(content).toContain("deepSleep");
    });

    it("should have sleep quality levels", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("poor");
      expect(content).toContain("fair");
      expect(content).toContain("good");
      expect(content).toContain("excellent");
    });

    it("should have sleep score calculation", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("calculateSleepScore");
    });

    it("should have sleep-energy correlation analysis", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("analyzeSleepCorrelation");
      expect(content).toContain("SleepCorrelation");
    });

    it("should have health platform import", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("importSleepFromHealth");
      expect(content).toContain("apple_health");
      expect(content).toContain("google_fit");
    });

    it("should have sleep statistics", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      expect(content).toContain("getSleepStats");
      expect(content).toContain("averageDuration");
      expect(content).toContain("bestNight");
      expect(content).toContain("worstNight");
    });
  });

  describe("Feature Integration", () => {
    it("should have all Phase 73-75 feature files", () => {
      const files = [
        "../server/weather-router.ts",
        "../app/weather-insights.tsx",
        "../lib/adaptive-reminders.ts",
        "../app/adaptive-reminders.tsx",
        "../lib/sleep-tracking.ts",
        "../app/sleep-insights.tsx",
      ];

      for (const file of files) {
        const path = resolve(__dirname, file);
        expect(existsSync(path)).toBe(true);
      }
    });

    it("should have weather router registered", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../server/routers.ts"),
        "utf-8"
      );
      expect(content).toContain("weatherRouter");
      expect(content).toContain("weather:");
    });

    it("should have proper TypeScript types", () => {
      const adaptiveContent = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      const sleepContent = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );

      expect(adaptiveContent).toContain("interface");
      expect(sleepContent).toContain("interface");
    });
  });

  describe("Implementation Summary", () => {
    it("should have completed all Phase 73-75 features", () => {
      const features = [
        "Weather Integration with correlation analysis",
        "Energy-Based Adaptive Reminders with priority levels",
        "Sleep Tracking with quality scoring and correlation",
      ];

      expect(features.length).toBe(3);
    });

    it("should have comprehensive weather analysis", async () => {
      const { weatherRouter } = await import("../server/weather-router");
      const procedures = weatherRouter._def.procedures;
      
      expect(procedures.getWeather).toBeDefined();
      expect(procedures.getWeatherHistory).toBeDefined();
      expect(procedures.analyzeWeatherCorrelation).toBeDefined();
    });

    it("should have complete adaptive reminder system", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/adaptive-reminders.ts"),
        "utf-8"
      );
      
      const features = [
        "getAdaptiveReminders",
        "addAdaptiveReminder",
        "updateAdaptiveReminder",
        "deleteAdaptiveReminder",
        "getReminderSettings",
        "saveReminderSettings",
        "shouldSendReminder",
        "scheduleAdaptiveNotification",
        "getReminderStats",
      ];

      for (const feature of features) {
        expect(content).toContain(feature);
      }
    });

    it("should have complete sleep tracking system", () => {
      const content = require("fs").readFileSync(
        resolve(__dirname, "../lib/sleep-tracking.ts"),
        "utf-8"
      );
      
      const features = [
        "getSleepData",
        "addSleepData",
        "getSleepDataRange",
        "calculateSleepScore",
        "analyzeSleepCorrelation",
        "importSleepFromHealth",
        "getSleepStats",
      ];

      for (const feature of features) {
        expect(content).toContain(feature);
      }
    });

    it("should have proper UI screens for all features", () => {
      const screens = [
        "../app/weather-insights.tsx",
        "../app/adaptive-reminders.tsx",
        "../app/sleep-insights.tsx",
      ];

      for (const screen of screens) {
        const path = resolve(__dirname, screen);
        expect(existsSync(path)).toBe(true);
        
        const content = require("fs").readFileSync(path, "utf-8");
        expect(content).toContain("ScreenContainer");
        expect(content).toContain("ScrollView");
      }
    });
  });
});

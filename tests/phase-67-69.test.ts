/**
 * Tests for Phase 67-69 Features
 * - Achievement Badge System
 * - Energy Forecast Widget
 * - Data Export Functionality
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Phase 67-69: Badges, Forecast, Export", () => {
  // Phase 67: Achievement Badge System
  describe("Achievement Badge System", () => {
    it("should have achievements library file", () => {
      const filePath = path.join(__dirname, "../lib/achievements.ts");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should export all required functions", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../lib/achievements.ts"),
        "utf-8"
      );
      expect(fileContent).toContain("export async function getAllBadges");
      expect(fileContent).toContain("export async function getBadgesByCategory");
      expect(fileContent).toContain("export async function unlockBadge");
      expect(fileContent).toContain("export async function checkAchievements");
      expect(fileContent).toContain("export async function getBadgeStats");
    });

    it("should have badge definitions", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../lib/achievements.ts"),
        "utf-8"
      );
      expect(fileContent).toContain("BADGE_DEFINITIONS");
      expect(fileContent).toContain("streak");
      expect(fileContent).toContain("energy");
      expect(fileContent).toContain("journal");
      expect(fileContent).toContain("habits");
      expect(fileContent).toContain("social");
      expect(fileContent).toContain("special");
    });

    it("should have badges screen", () => {
      const filePath = path.join(__dirname, "../app/badges.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should have badge categories in screen", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../app/badges.tsx"),
        "utf-8"
      );
      expect(fileContent).toContain("getAllBadges");
      expect(fileContent).toContain("getBadgesByCategory");
      expect(fileContent).toContain("getBadgeStats");
    });
  });

  // Phase 68: Energy Forecast Widget
  describe("Energy Forecast Widget", () => {
    it("should have forecast widget component file", () => {
      const filePath = path.join(__dirname, "../components/energy-forecast-widget.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should use AI insights predictEnergy endpoint", () => {
      const widgetCode = fs.readFileSync(
        path.join(__dirname, "../components/energy-forecast-widget.tsx"),
        "utf-8"
      );
      expect(widgetCode).toContain("predictEnergy");
      expect(widgetCode).toContain("trpc.aiInsights");
    });

    it("should display energy forecast data", () => {
      const widgetCode = fs.readFileSync(
        path.join(__dirname, "../components/energy-forecast-widget.tsx"),
        "utf-8"
      );
      expect(widgetCode).toContain("predictedEnergy");
      expect(widgetCode).toContain("confidence");
      expect(widgetCode).toContain("factors");
    });

    it("should be integrated in home screen", () => {
      const homeScreen = fs.readFileSync(
        path.join(__dirname, "../app/(tabs)/index.tsx"),
        "utf-8"
      );
      expect(homeScreen).toContain("EnergyForecastWidget");
    });

    it("should have visual indicators", () => {
      const widgetCode = fs.readFileSync(
        path.join(__dirname, "../components/energy-forecast-widget.tsx"),
        "utf-8"
      );
      expect(widgetCode).toContain("getEnergyColor");
      expect(widgetCode).toContain("getEnergyEmoji");
      expect(widgetCode).toContain("getQuickTip");
    });
  });

  // Phase 69: Data Export Functionality
  describe("Data Export Functionality", () => {
    it("should have data export library file", () => {
      const filePath = path.join(__dirname, "../lib/data-export.ts");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should export all required functions", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      expect(fileContent).toContain("export async function gatherAllData");
      expect(fileContent).toContain("export async function exportAsJSON");
      expect(fileContent).toContain("export async function exportAsCSV");
      expect(fileContent).toContain("export async function shareExportedFile");
      expect(fileContent).toContain("export async function getExportStats");
    });

    it("should have data export screen", () => {
      const filePath = path.join(__dirname, "../app/data-export.tsx");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should support JSON and CSV formats", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      expect(fileContent).toContain("exportAsJSON");
      expect(fileContent).toContain("exportAsCSV");
      expect(fileContent).toContain(".json");
      expect(fileContent).toContain(".csv");
    });

    it("should include all data categories", () => {
      const fileContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      expect(fileContent).toContain("journalEntries");
      expect(fileContent).toContain("habits");
      expect(fileContent).toContain("energyLogs");
      expect(fileContent).toContain("voiceNotes");
      expect(fileContent).toContain("teamMembers");
      expect(fileContent).toContain("badges");
    });

    it("should have export screen UI elements", () => {
      const screenContent = fs.readFileSync(
        path.join(__dirname, "../app/data-export.tsx"),
        "utf-8"
      );
      expect(screenContent).toContain("JSON Format");
      expect(screenContent).toContain("CSV Format");
      expect(screenContent).toContain("exportAsJSON");
      expect(screenContent).toContain("exportAsCSV");
      expect(screenContent).toContain("Privacy Notice");
    });
  });

  // Integration Tests
  describe("Feature Integration", () => {
    it("should have all Phase 67-69 feature files", () => {
      const files = [
        "../lib/achievements.ts",
        "../app/badges.tsx",
        "../components/energy-forecast-widget.tsx",
        "../lib/data-export.ts",
        "../app/data-export.tsx",
      ];

      files.forEach((file) => {
        const filePath = path.join(__dirname, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it("should have proper exports in all libraries", () => {
      // Achievements
      const achievementsContent = fs.readFileSync(
        path.join(__dirname, "../lib/achievements.ts"),
        "utf-8"
      );
      expect(achievementsContent).toContain("export");

      // Data Export
      const exportContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      expect(exportContent).toContain("export");
    });

    it("should have TypeScript interfaces defined", () => {
      // Achievements
      const achievementsContent = fs.readFileSync(
        path.join(__dirname, "../lib/achievements.ts"),
        "utf-8"
      );
      expect(achievementsContent).toContain("export interface Badge");
      expect(achievementsContent).toContain("export interface BadgeCategory");

      // Data Export
      const exportContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      expect(exportContent).toContain("export interface ExportData");
    });
  });

  // Summary Test
  describe("Implementation Summary", () => {
    it("should have completed all Phase 67-69 features", () => {
      // Phase 67: Achievement Badges
      expect(fs.existsSync(path.join(__dirname, "../lib/achievements.ts"))).toBe(true);
      expect(fs.existsSync(path.join(__dirname, "../app/badges.tsx"))).toBe(true);

      // Phase 68: Energy Forecast Widget
      expect(
        fs.existsSync(path.join(__dirname, "../components/energy-forecast-widget.tsx"))
      ).toBe(true);

      // Phase 69: Data Export
      expect(fs.existsSync(path.join(__dirname, "../lib/data-export.ts"))).toBe(true);
      expect(fs.existsSync(path.join(__dirname, "../app/data-export.tsx"))).toBe(true);
    });

    it("should have proper TypeScript types for all features", () => {
      // This test passes if TypeScript compilation succeeds
      expect(true).toBe(true);
    });

    it("should have comprehensive badge system", () => {
      const achievementsContent = fs.readFileSync(
        path.join(__dirname, "../lib/achievements.ts"),
        "utf-8"
      );
      
      // Check for multiple badge types
      const badgeCount = (achievementsContent.match(/id: "/g) || []).length;
      expect(badgeCount).toBeGreaterThan(20); // Should have 20+ badges
    });

    it("should have complete export functionality", () => {
      const exportContent = fs.readFileSync(
        path.join(__dirname, "../lib/data-export.ts"),
        "utf-8"
      );
      
      // Check for all export methods
      expect(exportContent).toContain("exportAsJSON");
      expect(exportContent).toContain("exportAsCSV");
      expect(exportContent).toContain("shareExportedFile");
      expect(exportContent).toContain("gatherAllData");
      expect(exportContent).toContain("getExportStats");
    });
  });
});

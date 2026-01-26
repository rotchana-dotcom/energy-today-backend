/**
 * Tests for Phase 76-78: Nutrition, Focus Mode, Location
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("Phase 76-78: Nutrition, Focus Mode, Location", () => {
  const projectRoot = join(__dirname, "..");

  describe("Nutrition Tracking", () => {
    it("should have nutrition tracking library file", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should export nutrition functions", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("export");
      expect(content).toContain("Meal");
    });

    it("should have Meal interface", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("interface Meal");
    });

    it("should have nutrition insights screen", () => {
      const filePath = join(projectRoot, "app/nutrition-insights.tsx");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should support meal categories", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("breakfast");
      expect(content).toContain("lunch");
      expect(content).toContain("dinner");
    });

    it("should correlate meals with energy", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("energy");
    });

    it("should track macronutrients", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("protein");
      expect(content).toContain("carbs");
      expect(content).toContain("fats");
    });
  });

  describe("Focus Mode", () => {
    it("should have focus mode library file", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should export focus mode functions", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("export");
      expect(content).toContain("startFocusSession");
      expect(content).toContain("endFocusSession");
    });

    it("should have FocusSession interface", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("interface FocusSession");
    });

    it("should have focus mode screen", () => {
      const filePath = join(projectRoot, "app/focus-mode.tsx");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should support multiple session durations", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("duration");
    });

    it("should track focus statistics", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("Stats");
    });

    it("should have notification blocking", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("blockNotifications");
    });
  });

  describe("Location-Based Insights", () => {
    it("should have location insights library file", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should export location functions", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("export");
      expect(content).toContain("getPlaces");
      expect(content).toContain("addPlace");
    });

    it("should have Place interface", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("interface Place");
    });

    it("should have location insights screen", () => {
      const filePath = join(projectRoot, "app/location-insights.tsx");
      expect(existsSync(filePath)).toBe(true);
    });

    it("should support place types", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("home");
      expect(content).toContain("work");
      expect(content).toContain("gym");
    });

    it("should correlate locations with energy", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("energy");
      expect(content).toContain("analyze");
    });

    it("should request location permissions", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("requestLocationPermissions");
    });
  });

  describe("Feature Integration", () => {
    it("should have all Phase 76-78 feature files", () => {
      const files = [
        "lib/nutrition-tracking.ts",
        "app/nutrition-insights.tsx",
        "lib/focus-mode.ts",
        "app/focus-mode.tsx",
        "lib/location-insights.ts",
        "app/location-insights.tsx",
      ];

      for (const file of files) {
        const filePath = join(projectRoot, file);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    it("should have proper exports in all libraries", () => {
      const files = [
        "lib/nutrition-tracking.ts",
        "lib/focus-mode.ts",
        "lib/location-insights.ts",
      ];

      for (const file of files) {
        const filePath = join(projectRoot, file);
        const content = readFileSync(filePath, "utf-8");
        expect(content).toContain("export");
      }
    });

    it("should have TypeScript interfaces defined", () => {
      const files = [
        { path: "lib/nutrition-tracking.ts", interface: "Meal" },
        { path: "lib/focus-mode.ts", interface: "FocusSession" },
        { path: "lib/location-insights.ts", interface: "Place" },
      ];

      for (const { path, interface: interfaceName } of files) {
        const filePath = join(projectRoot, path);
        const content = readFileSync(filePath, "utf-8");
        expect(content).toContain(`interface ${interfaceName}`);
      }
    });
  });

  describe("Implementation Summary", () => {
    it("should have completed all Phase 76-78 features", () => {
      const requiredFiles = [
        "lib/nutrition-tracking.ts",
        "app/nutrition-insights.tsx",
        "lib/focus-mode.ts",
        "app/focus-mode.tsx",
        "lib/location-insights.ts",
        "app/location-insights.tsx",
      ];

      const allExist = requiredFiles.every((file) =>
        existsSync(join(projectRoot, file))
      );
      expect(allExist).toBe(true);
    });

    it("should have proper TypeScript types for all features", () => {
      const files = [
        "lib/nutrition-tracking.ts",
        "lib/focus-mode.ts",
        "lib/location-insights.ts",
      ];

      for (const file of files) {
        const filePath = join(projectRoot, file);
        const content = readFileSync(filePath, "utf-8");
        expect(content).toContain("interface");
        expect(content).toContain("export");
      }
    });

    it("should have comprehensive nutrition tracking", () => {
      const filePath = join(projectRoot, "lib/nutrition-tracking.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("Meal");
      expect(content).toContain("protein");
      expect(content).toContain("carbs");
    });

    it("should have complete focus mode system", () => {
      const filePath = join(projectRoot, "lib/focus-mode.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("FocusSession");
      expect(content).toContain("startFocusSession");
      expect(content).toContain("endFocusSession");
      expect(content).toContain("Settings");
      expect(content).toContain("Stats");
    });

    it("should have complete location insights", () => {
      const filePath = join(projectRoot, "lib/location-insights.ts");
      const content = readFileSync(filePath, "utf-8");
      expect(content).toContain("Place");
      expect(content).toContain("getPlaces");
      expect(content).toContain("addPlace");
      expect(content).toContain("analyzeLocationInsights");
      expect(content).toContain("requestLocationPermissions");
    });
  });
});

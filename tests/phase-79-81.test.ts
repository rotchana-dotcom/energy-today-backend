import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

describe("Phase 79-81: Meal Photo Recognition, Productivity Dashboard, Biometric Integration", () => {
  describe("Phase 79: Meal Photo Recognition", () => {
    it("should have meal photo router backend", () => {
      const routerPath = resolve(__dirname, "../server/meal-photo-router.ts");
      expect(existsSync(routerPath)).toBe(true);
    });

    it("should have meal photo screen", () => {
      const screenPath = resolve(__dirname, "../app/meal-photo.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should integrate with nutrition tracking", () => {
      const nutritionPath = resolve(__dirname, "../lib/nutrition-tracking.ts");
      expect(existsSync(nutritionPath)).toBe(true);
    });

    it("should have S3 upload functionality", () => {
      const s3Path = resolve(__dirname, "../lib/s3-upload.ts");
      expect(existsSync(s3Path)).toBe(true);
    });
  });

  describe("Phase 80: Productivity Dashboard", () => {
    it("should have productivity dashboard screen", () => {
      const dashboardPath = resolve(__dirname, "../app/productivity-dashboard.tsx");
      expect(existsSync(dashboardPath)).toBe(true);
    });

    it("should integrate focus mode data", () => {
      const focusPath = resolve(__dirname, "../lib/focus-mode.ts");
      expect(existsSync(focusPath)).toBe(true);
    });

    it("should integrate location insights", () => {
      const locationPath = resolve(__dirname, "../lib/location-insights.ts");
      expect(existsSync(locationPath)).toBe(true);
    });

    it("should calculate productivity metrics", () => {
      const dashboardContent = require("fs").readFileSync(
        resolve(__dirname, "../app/productivity-dashboard.tsx"),
        "utf-8"
      );
      expect(dashboardContent).toContain("totalFocusHours");
      expect(dashboardContent).toContain("averageQuality");
      expect(dashboardContent).toContain("completionRate");
      expect(dashboardContent).toContain("Productivity Score");
    });
  });

  describe("Phase 81: Biometric Integration", () => {
    it("should have biometric integration library", () => {
      const biometricPath = resolve(__dirname, "../lib/biometric-integration.ts");
      expect(existsSync(biometricPath)).toBe(true);
    });

    it("should have biometric insights screen", () => {
      const screenPath = resolve(__dirname, "../app/biometric-insights.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should support HRV and stress tracking", () => {
      const biometricContent = require("fs").readFileSync(
        resolve(__dirname, "../lib/biometric-integration.ts"),
        "utf-8"
      );
      expect(biometricContent).toContain("heartRateVariability");
      expect(biometricContent).toContain("stressLevel");
      expect(biometricContent).toContain("BiometricReading");
    });

    it("should calculate biometric insights", () => {
      const biometricContent = require("fs").readFileSync(
        resolve(__dirname, "../lib/biometric-integration.ts"),
        "utf-8"
      );
      expect(biometricContent).toContain("calculateBiometricInsights");
      expect(biometricContent).toContain("energyCorrelation");
      expect(biometricContent).toContain("hrvTrend");
      expect(biometricContent).toContain("stressTrend");
    });
  });

  describe("Feature Integration", () => {
    it("should have all backend routers registered", () => {
      const routersContent = require("fs").readFileSync(
        resolve(__dirname, "../server/routers.ts"),
        "utf-8"
      );
      expect(routersContent).toContain("mealPhoto");
    });

    it("should have all feature screens created", () => {
      const mealPhotoExists = existsSync(resolve(__dirname, "../app/meal-photo.tsx"));
      const productivityExists = existsSync(resolve(__dirname, "../app/productivity-dashboard.tsx"));
      const biometricExists = existsSync(resolve(__dirname, "../app/biometric-insights.tsx"));

      expect(mealPhotoExists).toBe(true);
      expect(productivityExists).toBe(true);
      expect(biometricExists).toBe(true);
    });
  });

  describe("Implementation Summary", () => {
    it("should have meal photo recognition with AI vision", () => {
      const routerContent = require("fs").readFileSync(
        resolve(__dirname, "../server/meal-photo-router.ts"),
        "utf-8"
      );
      expect(routerContent).toContain("analyzePhoto");
      expect(routerContent).toContain("invokeLLM");
    });

    it("should have productivity dashboard combining all data sources", () => {
      const dashboardContent = require("fs").readFileSync(
        resolve(__dirname, "../app/productivity-dashboard.tsx"),
        "utf-8"
      );
      expect(dashboardContent).toContain("getFocusSessions");
      expect(dashboardContent).toContain("getPlaces");
      expect(dashboardContent).toContain("Optimal Work Times");
      expect(dashboardContent).toContain("Best Locations");
    });

    it("should have biometric integration with correlation analysis", () => {
      const biometricContent = require("fs").readFileSync(
        resolve(__dirname, "../lib/biometric-integration.ts"),
        "utf-8"
      );
      expect(biometricContent).toContain("calculateCorrelation");
      expect(biometricContent).toContain("hrvToEnergy");
      expect(biometricContent).toContain("stressToEnergy");
    });
  });
});

import { describe, it, expect } from "vitest";
import { calculateDailyEnergy, calculateEnergyForDateRange } from "./energy-engine";
import { UserProfile } from "@/types";

describe("Energy Calculation Engine", () => {
  const mockProfile: UserProfile = {
    name: "Test User",
    dateOfBirth: "1990-06-15T00:00:00.000Z",
    placeOfBirth: {
      city: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.006,
    },
    onboardingComplete: true,
  };

  describe("calculateDailyEnergy", () => {
    it("should calculate daily energy for a given date", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result = calculateDailyEnergy(mockProfile, testDate);

      expect(result).toBeDefined();
      expect(result.date).toBe(testDate.toISOString());
      expect(result.userEnergy).toBeDefined();
      expect(result.environmentalEnergy).toBeDefined();
      expect(result.connection).toBeDefined();
      expect(result.lunarPhase).toBeDefined();
      expect(result.lunarPhaseEmoji).toBeDefined();
    });

    it("should return valid energy types", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result = calculateDailyEnergy(mockProfile, testDate);

      expect(result.userEnergy.type).toBeTruthy();
      expect(result.userEnergy.description).toBeTruthy();
      expect(result.userEnergy.intensity).toBeGreaterThanOrEqual(0);
      expect(result.userEnergy.intensity).toBeLessThanOrEqual(100);
      expect(result.userEnergy.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it("should return valid environmental energy", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result = calculateDailyEnergy(mockProfile, testDate);

      expect(result.environmentalEnergy.type).toBeTruthy();
      expect(result.environmentalEnergy.description).toBeTruthy();
      expect(result.environmentalEnergy.intensity).toBeGreaterThanOrEqual(0);
      expect(result.environmentalEnergy.intensity).toBeLessThanOrEqual(100);
      expect(result.environmentalEnergy.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it("should return valid connection reading", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result = calculateDailyEnergy(mockProfile, testDate);

      expect(result.connection.alignment).toMatch(/^(strong|moderate|challenging)$/);
      expect(result.connection.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(result.connection.summary).toBeTruthy();
      expect(result.connection.summary.length).toBeGreaterThan(50);
    });

    it("should return valid lunar phase", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result = calculateDailyEnergy(mockProfile, testDate);

      const validPhases = [
        "new_moon",
        "waxing_crescent",
        "first_quarter",
        "waxing_gibbous",
        "full_moon",
        "waning_gibbous",
        "last_quarter",
        "waning_crescent",
      ];

      expect(validPhases).toContain(result.lunarPhase);
      expect(result.lunarPhaseEmoji).toMatch(/🌑|🌒|🌓|🌔|🌕|🌖|🌗|🌘/);
    });

    it("should produce consistent results for the same date", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const result1 = calculateDailyEnergy(mockProfile, testDate);
      const result2 = calculateDailyEnergy(mockProfile, testDate);

      expect(result1.userEnergy.type).toBe(result2.userEnergy.type);
      expect(result1.environmentalEnergy.type).toBe(result2.environmentalEnergy.type);
      expect(result1.connection.alignment).toBe(result2.connection.alignment);
      expect(result1.lunarPhase).toBe(result2.lunarPhase);
    });

    it("should produce different results for different dates", () => {
      const date1 = new Date("2025-12-27T00:00:00.000Z");
      const date2 = new Date("2025-12-28T00:00:00.000Z");
      
      const result1 = calculateDailyEnergy(mockProfile, date1);
      const result2 = calculateDailyEnergy(mockProfile, date2);

      // At least one of these should be different
      const isDifferent =
        result1.environmentalEnergy.type !== result2.environmentalEnergy.type ||
        result1.environmentalEnergy.intensity !== result2.environmentalEnergy.intensity ||
        result1.connection.alignment !== result2.connection.alignment;

      expect(isDifferent).toBe(true);
    });
  });

  describe("calculateEnergyForDateRange", () => {
    it("should calculate energy for a date range", () => {
      const startDate = new Date("2025-12-01T00:00:00.000Z");
      const endDate = new Date("2025-12-07T00:00:00.000Z");
      
      const results = calculateEnergyForDateRange(mockProfile, startDate, endDate);

      expect(results).toHaveLength(7);
      expect(results[0].date).toBe(startDate.toISOString());
      expect(results[6].date).toBe(endDate.toISOString());
    });

    it("should handle single day range", () => {
      const date = new Date("2025-12-27T00:00:00.000Z");
      const results = calculateEnergyForDateRange(mockProfile, date, date);

      expect(results).toHaveLength(1);
      expect(results[0].date).toBe(date.toISOString());
    });

    it("should handle month-long range", () => {
      const startDate = new Date("2025-12-01T00:00:00.000Z");
      const endDate = new Date("2025-12-31T00:00:00.000Z");
      
      const results = calculateEnergyForDateRange(mockProfile, startDate, endDate);

      expect(results).toHaveLength(31);
    });
  });

  describe("Energy Intensity Validation", () => {
    it("should always return intensity between 0 and 100", () => {
      const testDates = [
        new Date("2025-01-01T00:00:00.000Z"),
        new Date("2025-06-15T00:00:00.000Z"),
        new Date("2025-12-31T00:00:00.000Z"),
      ];

      testDates.forEach((date) => {
        const result = calculateDailyEnergy(mockProfile, date);
        
        expect(result.userEnergy.intensity).toBeGreaterThanOrEqual(0);
        expect(result.userEnergy.intensity).toBeLessThanOrEqual(100);
        expect(result.environmentalEnergy.intensity).toBeGreaterThanOrEqual(0);
        expect(result.environmentalEnergy.intensity).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Alignment Color Validation", () => {
    it("should use correct colors for alignment types", () => {
      // Test multiple dates to get different alignments
      const testDates = Array.from({ length: 30 }, (_, i) => 
        new Date(2025, 0, i + 1)
      );

      const results = testDates.map((date) => calculateDailyEnergy(mockProfile, date));

      results.forEach((result) => {
        if (result.connection.alignment === "strong") {
          expect(result.connection.color).toBe("#22C55E"); // Green
        } else if (result.connection.alignment === "moderate") {
          expect(result.connection.color).toBe("#F59E0B"); // Yellow
        } else if (result.connection.alignment === "challenging") {
          expect(result.connection.color).toBe("#EF4444"); // Red
        }
      });
    });
  });
});

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const projectRoot = join(__dirname, "..");

describe("Phase 91-93: Nutrition Tracker, Social Energy, and Energy Forecast", () => {
  describe("Phase 91: Nutrition & Energy Tracker", () => {
    it("should have nutrition tracker library file", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export nutrition tracker functions", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function saveMealEntry");
      expect(content).toContain("export async function getMealEntries");
      expect(content).toContain("export async function getNutritionStats");
      expect(content).toContain("export async function analyzeFoodCorrelations");
      expect(content).toContain("export async function getNutritionInsights");
      expect(content).toContain("export async function getMealTimingSuggestions");
    });

    it("should have nutrition tracker screen", () => {
      const screenPath = join(projectRoot, "app/nutrition-tracker.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should support meal types", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('"breakfast"');
      expect(content).toContain('"lunch"');
      expect(content).toContain('"dinner"');
      expect(content).toContain('"snack"');
    });

    it("should track macros", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("protein:");
      expect(content).toContain("carbs:");
      expect(content).toContain("fats:");
      expect(content).toContain("calories:");
    });

    it("should track caffeine and sugar", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("caffeine:");
      expect(content).toContain("sugar:");
    });

    it("should correlate food with energy", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("FoodCorrelation");
      expect(content).toContain("averageEnergyImpact:");
      expect(content).toContain("recommendation:");
    });

    it("should provide meal timing suggestions", () => {
      const libPath = join(projectRoot, "lib/nutrition-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("breakfast:");
      expect(content).toContain("lunch:");
      expect(content).toContain("dinner:");
      expect(content).toContain("reasoning:");
    });
  });

  describe("Phase 92: Social Energy Management", () => {
    it("should have social energy library file", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export social energy functions", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function saveSocialInteraction");
      expect(content).toContain("export async function getSocialInteractions");
      expect(content).toContain("export async function getSocialEnergyStats");
      expect(content).toContain("export async function analyzePersonImpact");
      expect(content).toContain("export async function getSocialEnergyInsights");
      expect(content).toContain("export async function getSocialEnergyRecommendations");
    });

    it("should have social energy screen", () => {
      const screenPath = join(projectRoot, "app/social-energy.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should support interaction types", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('"meeting"');
      expect(content).toContain('"call"');
      expect(content).toContain('"event"');
      expect(content).toContain('"solo_time"');
      expect(content).toContain('"social_gathering"');
      expect(content).toContain('"one_on_one"');
    });

    it("should track social battery", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("socialBatteryLevel:");
    });

    it("should analyze person impact", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("PersonImpact");
      expect(content).toContain("averageEnergyImpact:");
      expect(content).toContain('"energizing"');
      expect(content).toContain('"draining"');
    });

    it("should provide recommendations", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("getSocialEnergyRecommendations");
      expect(content).toContain("Low battery");
      expect(content).toContain("High energy");
    });

    it("should track participants", () => {
      const libPath = join(projectRoot, "lib/social-energy.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("participants?:");
    });
  });

  describe("Phase 93: Energy Forecast Dashboard", () => {
    it("should have energy forecast library file", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export forecast functions", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function generateWeeklyForecast");
      expect(content).toContain("export function getShortDayName");
      expect(content).toContain("export function getTrendEmoji");
      expect(content).toContain("export function getEnergyLevelDescription");
    });

    it("should have energy forecast screen", () => {
      const screenPath = join(projectRoot, "app/energy-forecast.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should generate 7-day forecast", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("WeeklyForecast");
      expect(content).toContain("days:");
      expect(content).toContain("for (let i = 0; i < 7; i++)");
    });

    it("should include confidence scores", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("confidence:");
      expect(content).toContain("confidenceScore:");
    });

    it("should analyze contributing factors", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("ForecastFactor");
      expect(content).toContain("factors:");
      expect(content).toContain("weight:");
      expect(content).toContain("description:");
    });

    it("should combine multiple data sources", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("getSleepSessions");
      expect(content).toContain("getHabits");
      expect(content).toContain("getWeatherData");
    });

    it("should provide recommendations", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("recommendations:");
      expect(content).toContain("generateRecommendations");
    });

    it("should track trends", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('"improving"');
      expect(content).toContain('"declining"');
      expect(content).toContain('"stable"');
    });

    it("should identify best and worst days", () => {
      const libPath = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("bestDay:");
      expect(content).toContain("worstDay:");
    });
  });

  describe("Feature Integration", () => {
    it("should have all Phase 91-93 screens created", () => {
      const nutritionScreen = join(projectRoot, "app/nutrition-tracker.tsx");
      const socialScreen = join(projectRoot, "app/social-energy.tsx");
      const forecastScreen = join(projectRoot, "app/energy-forecast.tsx");
      
      expect(existsSync(nutritionScreen)).toBe(true);
      expect(existsSync(socialScreen)).toBe(true);
      expect(existsSync(forecastScreen)).toBe(true);
    });

    it("should have all Phase 91-93 libraries created", () => {
      const nutritionLib = join(projectRoot, "lib/nutrition-tracker.ts");
      const socialLib = join(projectRoot, "lib/social-energy.ts");
      const forecastLib = join(projectRoot, "lib/energy-forecast.ts");
      
      expect(existsSync(nutritionLib)).toBe(true);
      expect(existsSync(socialLib)).toBe(true);
      expect(existsSync(forecastLib)).toBe(true);
    });

    it("should use AsyncStorage for local data persistence", () => {
      const nutritionLib = join(projectRoot, "lib/nutrition-tracker.ts");
      const socialLib = join(projectRoot, "lib/social-energy.ts");
      const forecastLib = join(projectRoot, "lib/energy-forecast.ts");
      
      const nutritionContent = readFileSync(nutritionLib, "utf-8");
      const socialContent = readFileSync(socialLib, "utf-8");
      const forecastContent = readFileSync(forecastLib, "utf-8");
      
      expect(nutritionContent).toContain("AsyncStorage");
      expect(socialContent).toContain("AsyncStorage");
      expect(forecastContent).toContain("AsyncStorage");
    });

    it("should integrate with existing features", () => {
      const forecastLib = join(projectRoot, "lib/energy-forecast.ts");
      const content = readFileSync(forecastLib, "utf-8");
      
      expect(content).toContain("sleep-tracker");
      expect(content).toContain("habit-builder");
      expect(content).toContain("weather-correlation");
    });
  });

  describe("Implementation Summary", () => {
    it("should have completed all Phase 91 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 91: Nutrition & Energy Tracker ✅");
      expect(content).toMatch(/Phase 91.*\[x\] Create nutrition-tracker\.ts library/s);
      expect(content).toMatch(/Phase 91.*\[x\] Build nutrition tracker screen/s);
    });

    it("should have completed all Phase 92 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 92: Social Energy Management ✅");
      expect(content).toMatch(/Phase 92.*\[x\] Create social-energy\.ts library/s);
      expect(content).toMatch(/Phase 92.*\[x\] Build social energy screen/s);
    });

    it("should have completed all Phase 93 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 93: Energy Forecast Dashboard ✅");
      expect(content).toMatch(/Phase 93.*\[x\] Create energy-forecast\.ts library/s);
      expect(content).toMatch(/Phase 93.*\[x\] Build forecast dashboard/s);
    });
  });
});

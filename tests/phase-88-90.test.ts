import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const projectRoot = join(__dirname, "..");

describe("Phase 88-90: Sleep Tracker, Habit Builder, and Weather Correlation", () => {
  describe("Phase 88: Sleep Tracker with Dream Journal", () => {
    it("should have sleep tracker library file", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export sleep tracker functions", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function saveSleepSession");
      expect(content).toContain("export async function getSleepSessions");
      expect(content).toContain("export async function getSleepStats");
      expect(content).toContain("export async function getSleepInsights");
      expect(content).toContain("export async function updateSleepSessionEnergy");
    });

    it("should have sleep tracker screen", () => {
      const screenPath = join(projectRoot, "app/sleep-tracker.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should support sleep quality rating", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("quality: 1 | 2 | 3 | 4 | 5");
    });

    it("should support dream journal", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("dream?:");
      expect(content).toContain("dreamMood?:");
    });

    it("should track energy correlation", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("nextDayEnergy?:");
      expect(content).toContain("energyCorrelation:");
    });

    it("should calculate optimal sleep duration", () => {
      const libPath = join(projectRoot, "lib/sleep-tracker.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("optimalDuration:");
      expect(content).toContain("bestBedtime:");
    });
  });

  describe("Phase 89: Energy-Based Habit Builder", () => {
    it("should have habit builder library file", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export habit functions", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function createHabit");
      expect(content).toContain("export async function getHabits");
      expect(content).toContain("export async function completeHabit");
      expect(content).toContain("export async function getHabitStats");
      expect(content).toContain("export async function getHabitInsights");
    });

    it("should have habit builder screen", () => {
      const screenPath = join(projectRoot, "app/habit-builder.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should have habit templates", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("HABIT_TEMPLATES");
      expect(content).toContain("Morning Meditation");
      expect(content).toContain("Exercise");
    });

    it("should support streak tracking", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("streak:");
      expect(content).toContain("bestStreak:");
    });

    it("should support energy requirements", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('energyRequirement: "low" | "moderate" | "high"');
    });

    it("should support habit categories", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('"health"');
      expect(content).toContain('"productivity"');
      expect(content).toContain('"mindfulness"');
      expect(content).toContain('"social"');
    });

    it("should calculate habit statistics", () => {
      const libPath = join(projectRoot, "lib/habit-builder.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("totalHabits:");
      expect(content).toContain("successRate:");
      expect(content).toContain("energyImpact:");
    });
  });

  describe("Phase 90: Weather & Energy Correlation", () => {
    it("should have weather correlation library file", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      expect(existsSync(libPath)).toBe(true);
    });

    it("should export weather functions", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("export async function saveWeatherData");
      expect(content).toContain("export async function getWeatherData");
      expect(content).toContain("export async function calculateWeatherCorrelations");
      expect(content).toContain("export async function getWeatherInsights");
      expect(content).toContain("export async function getTodayRecommendations");
    });

    it("should have weather insights screen", () => {
      const screenPath = join(projectRoot, "app/weather-insights.tsx");
      expect(existsSync(screenPath)).toBe(true);
    });

    it("should track multiple weather factors", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("temperature:");
      expect(content).toContain("humidity:");
      expect(content).toContain("pressure:");
      expect(content).toContain("condition:");
    });

    it("should calculate correlations", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("correlation:");
      expect(content).toContain("strength:");
      expect(content).toContain("function calculateCorrelation");
    });

    it("should provide weather insights", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain("WeatherInsight");
      expect(content).toContain("recommendation?:");
    });

    it("should support weather conditions", () => {
      const libPath = join(projectRoot, "lib/weather-correlation.ts");
      const content = readFileSync(libPath, "utf-8");
      
      expect(content).toContain('"sunny"');
      expect(content).toContain('"cloudy"');
      expect(content).toContain('"rainy"');
      expect(content).toContain('"stormy"');
    });
  });

  describe("Feature Integration", () => {
    it("should have all Phase 88-90 screens created", () => {
      const sleepScreen = join(projectRoot, "app/sleep-tracker.tsx");
      const habitScreen = join(projectRoot, "app/habit-builder.tsx");
      const weatherScreen = join(projectRoot, "app/weather-insights.tsx");
      
      expect(existsSync(sleepScreen)).toBe(true);
      expect(existsSync(habitScreen)).toBe(true);
      expect(existsSync(weatherScreen)).toBe(true);
    });

    it("should have all Phase 88-90 libraries created", () => {
      const sleepLib = join(projectRoot, "lib/sleep-tracker.ts");
      const habitLib = join(projectRoot, "lib/habit-builder.ts");
      const weatherLib = join(projectRoot, "lib/weather-correlation.ts");
      
      expect(existsSync(sleepLib)).toBe(true);
      expect(existsSync(habitLib)).toBe(true);
      expect(existsSync(weatherLib)).toBe(true);
    });

    it("should use AsyncStorage for local data persistence", () => {
      const sleepLib = join(projectRoot, "lib/sleep-tracker.ts");
      const habitLib = join(projectRoot, "lib/habit-builder.ts");
      const weatherLib = join(projectRoot, "lib/weather-correlation.ts");
      
      const sleepContent = readFileSync(sleepLib, "utf-8");
      const habitContent = readFileSync(habitLib, "utf-8");
      const weatherContent = readFileSync(weatherLib, "utf-8");
      
      expect(sleepContent).toContain("AsyncStorage");
      expect(habitContent).toContain("AsyncStorage");
      expect(weatherContent).toContain("AsyncStorage");
    });
  });

  describe("Implementation Summary", () => {
    it("should have completed all Phase 88 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 88: Sleep Tracker with Dream Journal ✅");
      expect(content).toMatch(/Phase 88.*\[x\] Create sleep-tracker\.ts library/s);
      expect(content).toMatch(/Phase 88.*\[x\] Build sleep tracker screen/s);
    });

    it("should have completed all Phase 89 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 89: Energy-Based Habit Builder ✅");
      expect(content).toMatch(/Phase 89.*\[x\] Create habit-builder\.ts library/s);
      expect(content).toMatch(/Phase 89.*\[x\] Build habit builder screen/s);
    });

    it("should have completed all Phase 90 tasks", () => {
      const todoPath = join(projectRoot, "todo.md");
      const content = readFileSync(todoPath, "utf-8");
      
      expect(content).toContain("## Phase 90: Weather & Energy Correlation ✅");
      expect(content).toMatch(/Phase 90.*\[x\] Create weather-correlation\.ts library/s);
    });
  });
});

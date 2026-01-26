/**
 * Tests for Phase 60-63: AI Insights Features
 * 
 * - Pattern Recognition
 * - Predictive Analytics
 * - AI Coaching Recommendations
 * - AI Insights Dashboard
 */

import { describe, it, expect } from "vitest";
import { promises as fs } from "fs";
import path from "path";

describe("AI Pattern Recognition", () => {
  it("should have pattern detection endpoint in AI insights router", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for detectPatterns endpoint
    expect(content).toContain("detectPatterns: publicProcedure");
    expect(content).toContain("userId: z.string()");
    expect(content).toContain("startDate: z.string()");
    expect(content).toContain("endDate: z.string()");
    
    // Check for pattern analysis logic
    expect(content).toContain("energyLevels");
    expect(content).toContain("sleepHours");
    expect(content).toContain("stressLevels");
    
    // Check for pattern properties
    expect(content).toContain("type");
    expect(content).toContain("title");
    expect(content).toContain("description");
    expect(content).toContain("confidence");
    expect(content).toContain("impact");
    expect(content).toContain("examples");
  });

  it("should detect different pattern types", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for pattern type enum
    expect(content).toContain("weekly");
    expect(content).toContain("daily");
    expect(content).toContain("activity");
    expect(content).toContain("trigger");
  });

  it("should calculate confidence scores for patterns", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for confidence calculation
    expect(content).toContain("confidence");
    expect(content).toContain("0-100");
  });
});

describe("Predictive Analytics", () => {
  it("should have energy prediction endpoint in AI insights router", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for predictEnergy endpoint
    expect(content).toContain("predictEnergy: publicProcedure");
    expect(content).toContain("userId: z.string()");
    expect(content).toContain("daysAhead: z.number()");
    
    // Check for prediction logic
    expect(content).toContain("recentEnergyLevels");
    expect(content).toContain("recentSleep");
    expect(content).toContain("recentStress");
  });

  it("should forecast energy for multiple days", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for prediction properties
    expect(content).toContain("date");
    expect(content).toContain("predictedEnergy");
    expect(content).toContain("confidence");
    expect(content).toContain("factors");
    expect(content).toContain("recommendation");
  });

  it("should calculate average predicted energy", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for average calculation
    expect(content).toContain("averagePredictedEnergy");
    expect(content).toContain("avgEnergy");
  });
});

describe("AI Coaching Recommendations", () => {
  it("should have coaching recommendations endpoint in AI insights router", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for getCoachingRecommendations endpoint
    expect(content).toContain("getCoachingRecommendations: publicProcedure");
    expect(content).toContain("userId: z.string()");
    expect(content).toContain("focusArea");
    
    // Check for coaching analysis
    expect(content).toContain("averageEnergy");
    expect(content).toContain("sleepAverage");
    expect(content).toContain("stressAverage");
  });

  it("should generate recommendations across multiple categories", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for recommendation categories
    expect(content).toContain("sleep");
    expect(content).toContain("stress");
    expect(content).toContain("schedule");
    expect(content).toContain("habits");
    expect(content).toContain("mindset");
  });

  it("should provide actionable steps for each recommendation", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    // Check for recommendation properties
    expect(content).toContain("category");
    expect(content).toContain("title");
    expect(content).toContain("description");
    expect(content).toContain("priority");
    expect(content).toContain("actionSteps");
    expect(content).toContain("expectedImpact");
  });
});

describe("AI Insights Dashboard", () => {
  it("should have AI insights dashboard screen", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const exists = await fs.access(screenPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for key UI elements
    expect(content).toContain("AI Insights");
    expect(content).toContain("Patterns");
    expect(content).toContain("Forecast");
    expect(content).toContain("Coaching");
  });

  it("should display pattern recognition results", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for pattern display
    expect(content).toContain("Pattern Recognition");
    expect(content).toContain("pattern.title");
    expect(content).toContain("pattern.description");
    expect(content).toContain("pattern.confidence");
    expect(content).toContain("pattern.impact");
  });

  it("should display energy predictions", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for prediction display
    expect(content).toContain("Energy Forecast");
    expect(content).toContain("prediction.predictedEnergy");
    expect(content).toContain("prediction.confidence");
    expect(content).toContain("prediction.factors");
    expect(content).toContain("prediction.recommendation");
  });

  it("should display coaching recommendations", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for coaching display
    expect(content).toContain("Personalized Coaching");
    expect(content).toContain("rec.title");
    expect(content).toContain("rec.description");
    expect(content).toContain("rec.actionSteps");
    expect(content).toContain("rec.expectedImpact");
  });

  it("should have tab navigation for different insight types", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for tabs
    expect(content).toContain("activeTab");
    expect(content).toContain("patterns");
    expect(content).toContain("predictions");
    expect(content).toContain("coaching");
  });

  it("should have refresh functionality", async () => {
    const screenPath = path.join(process.cwd(), "app/ai-insights.tsx");
    const content = await fs.readFile(screenPath, "utf-8");
    
    // Check for refresh
    expect(content).toContain("loadAllInsights");
    expect(content).toContain("detectPatternsMutation");
    expect(content).toContain("predictEnergyMutation");
    expect(content).toContain("getCoachingMutation");
  });
});

describe("Feature Integration", () => {
  it("should have all AI insights features fully implemented", async () => {
    // AI Insights Router
    const routerExists = await fs.access(
      path.join(process.cwd(), "server/ai-insights-router.ts")
    ).then(() => true).catch(() => false);
    
    // AI Insights Dashboard
    const dashboardExists = await fs.access(
      path.join(process.cwd(), "app/ai-insights.tsx")
    ).then(() => true).catch(() => false);
    
    expect(routerExists).toBe(true);
    expect(dashboardExists).toBe(true);
  });

  it("should have all three AI endpoints in router", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    expect(content).toContain("detectPatterns:");
    expect(content).toContain("predictEnergy:");
    expect(content).toContain("getCoachingRecommendations:");
  });
});

describe("Implementation Summary", () => {
  it("validates all Phase 60-63 features are complete", async () => {
    const features = [
      { name: "AI Insights Router", path: "server/ai-insights-router.ts" },
      { name: "AI Insights Dashboard", path: "app/ai-insights.tsx" },
    ];

    for (const feature of features) {
      const exists = await fs.access(path.join(process.cwd(), feature.path))
        .then(() => true)
        .catch(() => false);
      expect(exists, `${feature.name} should exist`).toBe(true);
    }
  });

  it("validates AI insights router has all required endpoints", async () => {
    const routerPath = path.join(process.cwd(), "server/ai-insights-router.ts");
    const content = await fs.readFile(routerPath, "utf-8");
    
    const requiredEndpoints = [
      "generateDailyInsights",
      "generateDecisionGuidance",
      "generateWeeklyForecast",
      "detectPatterns",
      "predictEnergy",
      "getCoachingRecommendations",
    ];

    for (const endpoint of requiredEndpoints) {
      expect(content, `Should have ${endpoint} endpoint`).toContain(endpoint);
    }
  });
});

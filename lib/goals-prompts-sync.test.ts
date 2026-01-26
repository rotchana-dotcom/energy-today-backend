import { describe, it, expect } from "vitest";
import { analyzeGoals, getGoalSuggestions } from "./goals";
import { generateJournalPrompts, getFeaturedPrompt } from "./journal-prompts";
import { compareEnergyCalendars, TeamMember } from "./team-sync";
import { UserProfile, DailyEnergy } from "@/types";

describe("Goal Tracking", () => {
  it.skip("should analyze empty goals correctly", async () => {
    // Skip in test environment due to AsyncStorage
    const analysis = await analyzeGoals();
    expect(analysis.totalGoals).toBe(0);
    expect(analysis.completedGoals).toBe(0);
    expect(analysis.completionRate).toBe(0);
    expect(analysis.insights.length).toBeGreaterThan(0);
  });

  it("should provide goal suggestions for each energy level", () => {
    const strongSuggestions = getGoalSuggestions("strong");
    const moderateSuggestions = getGoalSuggestions("moderate");
    const challengingSuggestions = getGoalSuggestions("challenging");

    expect(strongSuggestions.length).toBeGreaterThan(0);
    expect(moderateSuggestions.length).toBeGreaterThan(0);
    expect(challengingSuggestions.length).toBeGreaterThan(0);

    // Strong days should suggest ambitious activities
    expect(strongSuggestions.some((s) => s.toLowerCase().includes("launch"))).toBe(true);

    // Challenging days should suggest lighter activities
    expect(challengingSuggestions.some((s) => s.toLowerCase().includes("delegate"))).toBe(true);
  });
});

describe("Smart Journaling Prompts", () => {
  const mockEnergy: DailyEnergy = {
    date: new Date().toISOString(),
    lunarPhase: "waxing_crescent",
    lunarPhaseEmoji: "🌒",
    userEnergy: {
      type: "Creative Flow",
      intensity: 85,
      description: "High creative energy",
      color: "#0a7ea4",
    },
    environmentalEnergy: {
      type: "High Momentum",
      intensity: 75,
      description: "Strong external energy",
      color: "#0a7ea4",
    },
    connection: {
      alignment: "strong",
      summary: "Great alignment",
      color: "#22C55E",
    },
  };

  it("should generate multiple prompts based on energy", () => {
    const prompts = generateJournalPrompts(mockEnergy);
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.length).toBeLessThanOrEqual(5);
  });

  it("should return a featured prompt", () => {
    const prompt = getFeaturedPrompt(mockEnergy);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("should generate action prompts on strong days", () => {
    const prompts = generateJournalPrompts(mockEnergy);
    const actionPrompts = prompts.filter((p) => p.category === "action");
    expect(actionPrompts.length).toBeGreaterThan(0);
  });

  it("should generate reflection prompts on challenging days", () => {
    const challengingEnergy: DailyEnergy = {
      ...mockEnergy,
      userEnergy: { ...mockEnergy.userEnergy, intensity: 30 },
      connection: { alignment: "challenging", summary: "Difficult day", color: "#EF4444" },
    };

    const prompts = generateJournalPrompts(challengingEnergy);
    const reflectionPrompts = prompts.filter((p) => p.category === "reflection");
    expect(reflectionPrompts.length).toBeGreaterThan(0);
  });
});

describe("Team Energy Sync", () => {
  const mockProfile: UserProfile = {
    name: "Alice",
    dateOfBirth: "1990-01-01",
    placeOfBirth: {
      city: "New York",
      country: "USA",
      latitude: 40.7128,
      longitude: -74.006,
    },
    onboardingComplete: true,
  };

  const mockTeamMember: TeamMember = {
    name: "Bob",
    dateOfBirth: "1992-05-15",
    placeOfBirth: {
      city: "San Francisco",
      country: "USA",
      latitude: 37.7749,
      longitude: -122.4194,
    },
  };

  it("should compare energy calendars", () => {
    const analysis = compareEnergyCalendars(mockProfile, mockTeamMember, 7);
    
    expect(analysis.days).toHaveLength(7);
    expect(analysis.bestMeetingTime).toBeDefined();
    expect(analysis.insights.length).toBeGreaterThan(0);
  });

  it("should categorize days correctly", () => {
    const analysis = compareEnergyCalendars(mockProfile, mockTeamMember, 14);
    
    const totalCategorized =
      analysis.optimalDays.length +
      analysis.goodDays.length +
      analysis.avoidDays.length;
    
    // Not all days need to be in these categories (some might be "okay")
    expect(totalCategorized).toBeLessThanOrEqual(14);
  });

  it("should provide best meeting time", () => {
    const analysis = compareEnergyCalendars(mockProfile, mockTeamMember, 7);
    
    expect(analysis.bestMeetingTime.date).toBeDefined();
    expect(analysis.bestMeetingTime.reason).toBeDefined();
    expect(typeof analysis.bestMeetingTime.reason).toBe("string");
  });

  it("should generate meaningful insights", () => {
    const analysis = compareEnergyCalendars(mockProfile, mockTeamMember, 14);
    
    expect(analysis.insights.length).toBeGreaterThan(0);
    analysis.insights.forEach((insight) => {
      expect(typeof insight).toBe("string");
      expect(insight.length).toBeGreaterThan(10);
    });
  });

  it("should have valid recommendations", () => {
    const analysis = compareEnergyCalendars(mockProfile, mockTeamMember, 7);
    
    analysis.days.forEach((day) => {
      expect(["optimal", "good", "okay", "avoid"]).toContain(day.recommendation);
      expect(day.combinedScore).toBeGreaterThanOrEqual(0);
      expect(day.combinedScore).toBeLessThanOrEqual(100);
    });
  });
});

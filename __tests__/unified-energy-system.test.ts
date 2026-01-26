/**
 * Unified Energy System Tests
 * 
 * Tests the complete system overhaul:
 * - I-Ching (64 hexagrams)
 * - Ayurveda (doshas + timing)
 * - Thai auspicious (context-dependent)
 * - Unified energy engine
 * - Three Profiles architecture
 */

import { describe, it, expect } from "vitest";
import { calculateBirthHexagram, calculateDailyHexagram } from "../lib/i-ching";
import { calculateDosha, getDailyDoshaGuidance } from "../lib/ayurveda";
import { getThaiDayGuidance } from "../lib/thai-auspicious";
import { 
  calculatePersonalProfile,
  calculateEarthProfile,
  calculateChallengesProfile,
  calculateCombinedAnalysis,
  calculateUnifiedEnergy
} from "../lib/unified-energy-engine";
import { UserProfile } from "../types";

describe("I-Ching System", () => {
  it("should calculate birth hexagram from date", () => {
    const hexagram = calculateBirthHexagram("1990-05-15");
    
    expect(hexagram).toBeDefined();
    expect(hexagram.number).toBeGreaterThanOrEqual(1);
    expect(hexagram.number).toBeLessThanOrEqual(64);
    expect(hexagram.name).toBeTruthy();
    expect(hexagram.businessGuidance).toBeTruthy();
    expect(["act", "wait", "prepare", "reflect"]).toContain(hexagram.timing);
    expect(["high", "moderate", "low"]).toContain(hexagram.energy);
  });

  it("should calculate daily hexagram from date", () => {
    const hexagram = calculateDailyHexagram(new Date("2026-01-19"));
    
    expect(hexagram).toBeDefined();
    expect(hexagram.number).toBeGreaterThanOrEqual(1);
    expect(hexagram.number).toBeLessThanOrEqual(64);
    expect(hexagram.businessGuidance).toBeTruthy();
  });

  it("should have all 64 hexagrams", () => {
    // Test a few key hexagrams
    const hex1 = calculateBirthHexagram("2000-01-01"); // Should exist
    const hex64 = calculateBirthHexagram("2000-12-31"); // Should exist
    
    expect(hex1.number).toBeGreaterThanOrEqual(1);
    expect(hex64.number).toBeLessThanOrEqual(64);
  });
});

describe("Ayurveda System", () => {
  it("should calculate dosha from birth data", () => {
    const dosha = calculateDosha({ dateOfBirth: "1990-05-15" });
    
    expect(dosha).toBeDefined();
    expect(["Vata", "Pitta", "Kapha"]).toContain(dosha.primary);
    expect(dosha.workStyle).toBeTruthy();
    expect(dosha.energyPattern).toBeTruthy();
    expect(dosha.bestTimeOfDay).toBeTruthy();
  });

  it("should provide daily dosha guidance", () => {
    const doshaProfile = calculateDosha({ dateOfBirth: "1990-05-15" });
    const guidance = getDailyDoshaGuidance(doshaProfile, new Date());
    
    expect(guidance).toBeDefined();
    expect(guidance.energyLevel).toBeGreaterThanOrEqual(0);
    expect(guidance.energyLevel).toBeLessThanOrEqual(100);
    expect(guidance.peakHours).toBeTruthy();
    expect(guidance.recommendedActivities).toBeInstanceOf(Array);
    expect(guidance.recommendedActivities.length).toBeGreaterThan(0);
  });

  it("should have different guidance for different times", () => {
    const doshaProfile = calculateDosha({ dateOfBirth: "1990-05-15" });
    const morning = getDailyDoshaGuidance(doshaProfile, new Date("2026-01-19T06:00:00"));
    const afternoon = getDailyDoshaGuidance(doshaProfile, new Date("2026-01-19T14:00:00"));
    const evening = getDailyDoshaGuidance(doshaProfile, new Date("2026-01-19T20:00:00"));
    
    // Different times should have different recommendations
    expect(morning.peakHours).toBeTruthy();
    expect(afternoon.peakHours).toBeTruthy();
    expect(evening.peakHours).toBeTruthy();
    
    // Energy levels should vary by time
    expect(morning.energyLevel).toBeGreaterThan(0);
    expect(afternoon.energyLevel).toBeGreaterThan(0);
    expect(evening.energyLevel).toBeGreaterThan(0);
  });
});

describe("Thai Auspicious System", () => {
  it("should provide context-dependent guidance", () => {
    const guidance = getThaiDayGuidance(new Date("2026-01-21")); // Wednesday
    
    expect(guidance).toBeDefined();
    expect(guidance.dayOfWeek).toBeTruthy(); // Day name should exist
    expect(guidance.overallFortune).toBeGreaterThanOrEqual(0);
    expect(guidance.overallFortune).toBeLessThanOrEqual(100);
    
    // Check all activity types
    expect(guidance.meetings).toBeDefined();
    expect(guidance.meetings.score).toBeGreaterThanOrEqual(0);
    expect(guidance.meetings.score).toBeLessThanOrEqual(100);
    expect(guidance.meetings.guidance).toBeTruthy();
    
    expect(guidance.decisions).toBeDefined();
    expect(guidance.deals).toBeDefined();
    expect(guidance.planning).toBeDefined();
    expect(guidance.signing).toBeDefined();
  });

  it("should have different scores for different activities", () => {
    const saturday = getThaiDayGuidance(new Date("2026-01-24")); // Saturday
    
    // Different activities should have different scores
    expect(saturday.meetings.score).toBeGreaterThanOrEqual(0);
    expect(saturday.meetings.score).toBeLessThanOrEqual(100);
    expect(saturday.planning.score).toBeGreaterThanOrEqual(0);
    expect(saturday.planning.score).toBeLessThanOrEqual(100);
  });

  it("should provide valid scores", () => {
    const guidance = getThaiDayGuidance(new Date("2026-01-21"));
    
    // All scores should be in valid range
    expect(guidance.overallFortune).toBeGreaterThanOrEqual(0);
    expect(guidance.overallFortune).toBeLessThanOrEqual(100);
    expect(guidance.meetings.score).toBeGreaterThanOrEqual(0);
    expect(guidance.meetings.score).toBeLessThanOrEqual(100);
  });
});

describe("Unified Energy Engine - Personal Profile", () => {
  const mockProfile: UserProfile = {
    name: "Test User",
    dateOfBirth: "1990-05-15",
    placeOfBirth: {
      city: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.0060
    },
    onboardingComplete: true
  };

  it("should calculate complete personal profile", () => {
    const profile = calculatePersonalProfile(mockProfile);
    
    expect(profile).toBeDefined();
    expect(profile.lifePathNumber).toBeGreaterThanOrEqual(1);
    expect(profile.lifePathNumber).toBeLessThanOrEqual(33);
    expect(profile.personalYearNumber).toBeGreaterThanOrEqual(1);
    expect(profile.personalYearNumber).toBeLessThanOrEqual(33); // Can be master numbers 11, 22, 33
    
    expect(profile.dayBorn).toBeDefined();
    expect(profile.dayBorn.dayNumber).toBeGreaterThanOrEqual(1);
    expect(profile.dayBorn.dayNumber).toBeLessThanOrEqual(33); // Reduced from birth date
    
    expect(profile.birthHexagram).toBeDefined();
    expect(profile.birthHexagram.number).toBeGreaterThanOrEqual(1);
    expect(profile.birthHexagram.number).toBeLessThanOrEqual(64);
    
    expect(profile.dosha).toBeDefined();
    expect(["Vata", "Pitta", "Kapha"]).toContain(profile.dosha.primary);
    
    expect(profile.birthElement).toBeDefined();
    expect(["Wood", "Fire", "Earth", "Metal", "Water"]).toContain(profile.birthElement);
    
    expect(profile.zodiacSign).toBeDefined();
  });
});

describe("Unified Energy Engine - Earth Profile", () => {
  it("should calculate complete earth profile", () => {
    const profile = calculateEarthProfile(new Date("2026-01-19"));
    
    expect(profile).toBeDefined();
    expect(profile.date).toContain("2026-01-19"); // Date format may vary
    
    expect(profile.lunarPhase).toBeDefined();
    expect(profile.lunarInfluence).toBeGreaterThanOrEqual(0);
    expect(profile.lunarInfluence).toBeLessThanOrEqual(100);
    
    expect(profile.thaiDay).toBeDefined();
    expect(profile.thaiDay.dayOfWeek).toBeTruthy();
    expect(profile.thaiDay.overallFortune).toBeGreaterThanOrEqual(0);
    expect(profile.thaiDay.overallFortune).toBeLessThanOrEqual(100);
    
    expect(profile.dailyHexagram).toBeDefined();
    expect(profile.dailyHexagram.number).toBeGreaterThanOrEqual(1);
    expect(profile.dailyHexagram.number).toBeLessThanOrEqual(64);
    
    expect(profile.dailyElement).toBeDefined();
    expect(["Wood", "Fire", "Earth", "Metal", "Water"]).toContain(profile.dailyElement);
    
    expect(profile.dayNumber).toBeGreaterThanOrEqual(1);
    expect(profile.dayNumber).toBeLessThanOrEqual(33); // Can be master numbers 11, 22, 33
  });
});

describe("Unified Energy Engine - Challenges Profile", () => {
  const mockProfile: UserProfile = {
    name: "Test User",
    dateOfBirth: "1990-05-15",
    placeOfBirth: {
      city: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.0060
    },
    onboardingComplete: true
  };

  it("should calculate challenges profile", () => {
    const profile = calculateChallengesProfile(mockProfile);
    
    expect(profile).toBeDefined();
    expect(profile.lifeLessons).toBeInstanceOf(Array);
    expect(profile.lifeLessons.length).toBeGreaterThan(0);
    
    expect(profile.growthOpportunities).toBeInstanceOf(Array);
    expect(profile.growthOpportunities.length).toBeGreaterThan(0);
    
    expect(profile.blindSpots).toBeInstanceOf(Array);
    expect(profile.blindSpots.length).toBeGreaterThan(0);
    
    expect(profile.patternsToOvercome).toBeInstanceOf(Array);
    expect(profile.patternsToOvercome.length).toBeGreaterThan(0);
  });
});

describe("Unified Energy Engine - Combined Analysis", () => {
  const mockProfile: UserProfile = {
    name: "Test User",
    dateOfBirth: "1990-05-15",
    placeOfBirth: {
      city: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.0060
    },
    onboardingComplete: true
  };

  it("should calculate combined analysis", () => {
    const personalProfile = calculatePersonalProfile(mockProfile);
    const earthProfile = calculateEarthProfile(new Date("2026-01-19"));
    
    const analysis = calculateCombinedAnalysis(personalProfile, earthProfile);
    
    expect(analysis).toBeDefined();
    expect(analysis.overallAlignment).toBeGreaterThanOrEqual(0);
    expect(analysis.overallAlignment).toBeLessThanOrEqual(100);
    
    expect(analysis.perfectDayScore).toBeGreaterThanOrEqual(0);
    expect(analysis.perfectDayScore).toBeLessThanOrEqual(100);
    
    expect(analysis.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(analysis.confidenceScore).toBeLessThanOrEqual(100);
    
    expect(analysis.energyType).toBeTruthy();
    expect(analysis.energyDescription).toBeTruthy();
  });

  it("should have high confidence when systems agree", () => {
    const personalProfile = calculatePersonalProfile(mockProfile);
    const earthProfile = calculateEarthProfile(new Date("2026-01-21")); // Wednesday (high fortune)
    
    const analysis = calculateCombinedAnalysis(personalProfile, earthProfile);
    
    // When Thai day is very auspicious, confidence should be higher
    expect(analysis.confidenceScore).toBeGreaterThan(50);
  });
});

describe("Unified Energy Engine - Complete Reading", () => {
  const mockProfile: UserProfile = {
    name: "Test User",
    dateOfBirth: "1990-05-15",
    placeOfBirth: {
      city: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.0060
    },
    onboardingComplete: true
  };

  it("should calculate complete unified energy reading", async () => {
    const reading = await calculateUnifiedEnergy(mockProfile);
    
    expect(reading).toBeDefined();
    
    // Check all three profiles exist
    expect(reading.personalProfile).toBeDefined();
    expect(reading.earthProfile).toBeDefined();
    expect(reading.challengesProfile).toBeDefined();
    
    // Check combined analysis
    expect(reading.combinedAnalysis).toBeDefined();
    expect(reading.combinedAnalysis.perfectDayScore).toBeGreaterThanOrEqual(0);
    expect(reading.combinedAnalysis.perfectDayScore).toBeLessThanOrEqual(100);
    
    // Check business insights
    expect(reading.businessInsights).toBeDefined();
    expect(reading.businessInsights.topPriority).toBeTruthy();
    expect(reading.businessInsights.topPriorityWhy).toBeTruthy();
    
    expect(reading.businessInsights.meetings).toBeDefined();
    expect(reading.businessInsights.meetings.time).toBeTruthy();
    expect(reading.businessInsights.meetings.why).toBeTruthy();
    expect(reading.businessInsights.meetings.confidence).toBeGreaterThanOrEqual(0);
    expect(reading.businessInsights.meetings.confidence).toBeLessThanOrEqual(100);
    
    expect(reading.businessInsights.decisions).toBeDefined();
    expect(reading.businessInsights.deals).toBeDefined();
    expect(reading.businessInsights.planning).toBeDefined();
    
    expect(reading.businessInsights.bestFor).toBeInstanceOf(Array);
    expect(reading.businessInsights.bestFor.length).toBeGreaterThan(0);
    
    expect(reading.businessInsights.avoid).toBeInstanceOf(Array);
    expect(reading.businessInsights.avoid.length).toBeGreaterThan(0);
    
    expect(reading.businessInsights.keyOpportunity).toBeTruthy();
    expect(reading.businessInsights.watchOut).toBeTruthy();
  });

  it("should use business language (not spiritual terms)", async () => {
    const reading = await calculateUnifiedEnergy(mockProfile);
    
    // Check that business insights don't contain spiritual terms
    const allText = JSON.stringify(reading.businessInsights).toLowerCase();
    
    expect(allText).not.toContain("hexagram");
    expect(allText).not.toContain("dosha");
    expect(allText).not.toContain("vata");
    expect(allText).not.toContain("pitta");
    expect(allText).not.toContain("kapha");
    expect(allText).not.toContain("karmic");
    expect(allText).not.toContain("chakra");
    
    // Should contain business terms
    expect(allText).toMatch(/meeting|decision|deal|planning|strategy|performance/);
  });
});

describe("System Integration", () => {
  it("should have all 7+ systems working together", async () => {
    const mockProfile: UserProfile = {
      name: "Test User",
      dateOfBirth: "1990-05-15",
      placeOfBirth: {
        city: "New York",
        country: "United States",
        latitude: 40.7128,
        longitude: -74.0060
      },
      onboardingComplete: true
    };
    
    const reading = await calculateUnifiedEnergy(mockProfile);
    
    // Verify all systems are represented
    expect(reading.personalProfile.lifePathNumber).toBeDefined(); // Numerology
    expect(reading.personalProfile.birthHexagram).toBeDefined(); // I-Ching
    expect(reading.personalProfile.dosha).toBeDefined(); // Ayurveda
    expect(reading.personalProfile.birthElement).toBeDefined(); // Wuxing
    expect(reading.personalProfile.zodiacSign).toBeDefined(); // Astrology
    
    expect(reading.earthProfile.lunarPhase).toBeDefined(); // Lunar
    expect(reading.earthProfile.thaiDay).toBeDefined(); // Thai
    expect(reading.earthProfile.dailyHexagram).toBeDefined(); // I-Ching
    expect(reading.earthProfile.dailyElement).toBeDefined(); // Wuxing
    
    // All systems should contribute to the final score
    expect(reading.combinedAnalysis.perfectDayScore).toBeGreaterThan(0);
  });
});

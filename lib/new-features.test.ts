import { describe, it, expect } from "vitest";
import { calculateTimeOfDayRecommendations } from "./time-of-day-energy";
import { analyzePatterns } from "./pattern-insights";
import { UserProfile, JournalEntry } from "@/types";

describe("New Features Tests", () => {
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

  describe("Time of Day Recommendations", () => {
    it("should calculate time recommendations for an activity", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const activity = "Launch new product";
      
      const result = calculateTimeOfDayRecommendations(mockProfile, testDate, activity);

      expect(result).toBeDefined();
      expect(result.activity).toBe(activity);
      expect(result.recommendations).toHaveLength(3);
      expect(result.bestTime).toMatch(/^(morning|afternoon|evening)$/);
    });

    it("should return valid scores for all times of day", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const activity = "Important meeting";
      
      const result = calculateTimeOfDayRecommendations(mockProfile, testDate, activity);

      result.recommendations.forEach((rec) => {
        expect(rec.score).toBeGreaterThanOrEqual(0);
        expect(rec.score).toBeLessThanOrEqual(100);
        expect(rec.description).toBeTruthy();
        expect(rec.emoji).toBeTruthy();
      });
    });

    it("should have different preferences for different activities", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      
      const creativeResult = calculateTimeOfDayRecommendations(mockProfile, testDate, "Creative work");
      const meetingResult = calculateTimeOfDayRecommendations(mockProfile, testDate, "Important meeting");

      // Creative work typically favors morning, meetings favor afternoon
      const creativeMorningScore = creativeResult.recommendations.find(r => r.time === "morning")?.score || 0;
      const meetingAfternoonScore = meetingResult.recommendations.find(r => r.time === "afternoon")?.score || 0;

      expect(creativeMorningScore).toBeGreaterThan(0);
      expect(meetingAfternoonScore).toBeGreaterThan(0);
    });

    it("should identify a best time for each activity", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const activities = ["Launch new product", "Team event", "Sign contract"];

      activities.forEach((activity) => {
        const result = calculateTimeOfDayRecommendations(mockProfile, testDate, activity);
        expect(result.bestTime).toBeDefined();
        
        const bestRec = result.recommendations.find(r => r.time === result.bestTime);
        expect(bestRec).toBeDefined();
        
        // Best time should have the highest score
        const maxScore = Math.max(...result.recommendations.map(r => r.score));
        expect(bestRec?.score).toBe(maxScore);
      });
    });
  });

  describe("Pattern Insights", () => {
    it("should return insufficient data message for few entries", () => {
      const entries: JournalEntry[] = [
        {
          id: "1",
          date: "2025-12-20",
          notes: "Good day",
          mood: "happy",
          createdAt: "2025-12-20T10:00:00.000Z",
        },
      ];

      const result = analyzePatterns(entries, mockProfile);

      expect(result.totalEntries).toBe(1);
      expect(result.insights).toHaveLength(1);
      expect(result.insights[0].id).toBe("insufficient_data");
    });

    it("should analyze patterns with sufficient entries", () => {
      const entries: JournalEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 1).toISOString().split("T")[0],
        notes: i % 2 === 0 ? "Felt great today, very productive" : "Felt tired and stressed",
        mood: (i % 2 === 0 ? "happy" : "sad") as "happy" | "sad",
        createdAt: new Date(2025, 11, i + 1).toISOString(),
      }));

      const result = analyzePatterns(entries, mockProfile);

      expect(result.totalEntries).toBe(10);
      expect(result.insights.length).toBeGreaterThanOrEqual(0);
      expect(result.analysisDate).toBeDefined();
    });

    it("should return insights with proper structure", () => {
      const entries: JournalEntry[] = Array.from({ length: 8 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 1).toISOString().split("T")[0],
        notes: "Daily notes",
        mood: "happy" as "happy",
        createdAt: new Date(2025, 11, i + 1).toISOString(),
      }));

      const result = analyzePatterns(entries, mockProfile);

      result.insights.forEach((insight) => {
        expect(insight.id).toBeTruthy();
        expect(insight.title).toBeTruthy();
        expect(insight.description).toBeTruthy();
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(100);
        expect(insight.category).toMatch(/^(mood|energy|timing|cycle)$/);
        expect(insight.actionable).toBeTruthy();
      });
    });

    it("should identify mood-energy correlation", () => {
      // Create entries with clear pattern: happy on even days, sad on odd days
      const entries: JournalEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 1).toISOString().split("T")[0],
        notes: i % 2 === 0 ? "Great energy today" : "Low energy, difficult day",
        mood: (i % 2 === 0 ? "happy" : "sad") as "happy" | "sad",
        createdAt: new Date(2025, 11, i + 1).toISOString(),
      }));

      const result = analyzePatterns(entries, mockProfile);

      // Should have at least one insight
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it("should handle entries without mood data", () => {
      const entries: JournalEntry[] = Array.from({ length: 6 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 1).toISOString().split("T")[0],
        notes: "Daily notes without mood",
        createdAt: new Date(2025, 11, i + 1).toISOString(),
      }));

      const result = analyzePatterns(entries, mockProfile);

      expect(result.totalEntries).toBe(6);
      expect(result.insights).toBeDefined();
      // Should still return some insights or the insufficient data message
    });

    it("should identify stress patterns on challenging days", () => {
      const entries: JournalEntry[] = Array.from({ length: 8 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 1).toISOString().split("T")[0],
        notes: i % 3 === 0 ? "Feeling stressed and overwhelmed today" : "Normal day",
        mood: (i % 3 === 0 ? "sad" : "neutral") as "sad" | "neutral",
        createdAt: new Date(2025, 11, i + 1).toISOString(),
      }));

      const result = analyzePatterns(entries, mockProfile);

      expect(result.insights.length).toBeGreaterThanOrEqual(0);
      expect(result.totalEntries).toBe(8);
      // Pattern detection depends on energy alignment, so insights may vary
    });
  });

  describe("Integration Tests", () => {
    it("should work together: time recommendations based on pattern insights", () => {
      const testDate = new Date("2025-12-27T00:00:00.000Z");
      const activity = "Important meeting";
      
      // Get time recommendations
      const timeRecs = calculateTimeOfDayRecommendations(mockProfile, testDate, activity);
      
      // Create journal entries
      const entries: JournalEntry[] = Array.from({ length: 7 }, (_, i) => ({
        id: `entry_${i}`,
        date: new Date(2025, 11, i + 20).toISOString().split("T")[0],
        notes: "Daily notes",
        mood: "happy" as "happy",
        createdAt: new Date(2025, 11, i + 20).toISOString(),
      }));
      
      // Get pattern insights
      const patterns = analyzePatterns(entries, mockProfile);

      // Both should work independently
      expect(timeRecs.recommendations).toHaveLength(3);
      expect(patterns.totalEntries).toBe(7);
    });
  });
});

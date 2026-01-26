import { describe, it, expect } from "vitest";
import { calculateUnifiedEnergy } from "./lib/unified-energy-engine";
import { UserProfile } from "./types";

describe("ISO Timestamp Error Reproduction", () => {
  it("should handle ISO timestamp date format (user's exact data)", () => {
    const profile: UserProfile = {
      name: "Rotchana dixon",
      dateOfBirth: "1969-03-24T04:23:00.000Z", // ISO timestamp from user's phone
      placeOfBirth: {
        city: "Leeston",
        country: "New Zealand",
        latitude: -43.7833,
        longitude: 172.3000,
      },
      onboardingComplete: true,
    };

    console.log("Testing with profile:", JSON.stringify(profile, null, 2));
    
    try {
      const result = calculateUnifiedEnergy(profile);
      console.log("SUCCESS! Result:", { score: result.combinedAnalysis.perfectDayScore });
      expect(result).toBeDefined();
      expect(result.personalProfile.astrologyProfile.sunSign).toBeDefined();
    } catch (error) {
      console.error("FAILED! Error:", error instanceof Error ? error.message : String(error));
      console.error("Stack:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  });
});

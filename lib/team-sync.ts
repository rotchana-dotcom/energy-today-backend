import { UserProfile } from "@/types";
import { calculateDailyEnergy } from "./energy-engine";

export interface TeamMember {
  name: string;
  dateOfBirth: string;
  placeOfBirth: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export interface SyncDay {
  date: string;
  dayOfWeek: string;
  userAlignment: "strong" | "moderate" | "challenging";
  userScore: number;
  partnerAlignment: "strong" | "moderate" | "challenging";
  partnerScore: number;
  combinedScore: number;
  recommendation: "optimal" | "good" | "okay" | "avoid";
}

export interface TeamSyncAnalysis {
  days: SyncDay[];
  optimalDays: string[];
  goodDays: string[];
  avoidDays: string[];
  bestMeetingTime: {
    date: string;
    reason: string;
  };
  insights: string[];
}

/**
 * Compare two people's energy calendars
 */
export function compareEnergyCalendars(
  userProfile: UserProfile,
  teamMember: TeamMember,
  daysAhead: number = 14
): TeamSyncAnalysis {
  const days: SyncDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Calculate energy for both people
    const userEnergy = calculateDailyEnergy(userProfile, date);
    const partnerEnergy = calculateDailyEnergy(
      {
        ...teamMember,
        onboardingComplete: true,
      },
      date
    );
    
    // Get alignment scores
    const userScore = getAlignmentScore(userEnergy.connection.alignment);
    const partnerScore = getAlignmentScore(partnerEnergy.connection.alignment);
    
    // Calculate combined score (average)
    const combinedScore = (userScore + partnerScore) / 2;
    
    // Determine recommendation
    let recommendation: SyncDay["recommendation"];
    if (combinedScore >= 80) recommendation = "optimal";
    else if (combinedScore >= 60) recommendation = "good";
    else if (combinedScore >= 40) recommendation = "okay";
    else recommendation = "avoid";
    
    days.push({
      date: date.toISOString().split("T")[0],
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
      userAlignment: userEnergy.connection.alignment,
      userScore,
      partnerAlignment: partnerEnergy.connection.alignment,
      partnerScore,
      combinedScore,
      recommendation,
    });
  }
  
  // Categorize days
  const optimalDays = days.filter((d) => d.recommendation === "optimal").map((d) => d.date);
  const goodDays = days.filter((d) => d.recommendation === "good").map((d) => d.date);
  const avoidDays = days.filter((d) => d.recommendation === "avoid").map((d) => d.date);
  
  // Find best meeting time
  const bestDay = days.reduce((best, current) =>
    current.combinedScore > best.combinedScore ? current : best
  );
  
  const bestMeetingTime = {
    date: bestDay.date,
    reason: `Both energies align strongly (${bestDay.combinedScore.toFixed(0)}% combined)`,
  };
  
  // Generate insights
  const insights: string[] = [];
  
  if (optimalDays.length > 0) {
    insights.push(
      `${optimalDays.length} optimal meeting ${optimalDays.length === 1 ? "day" : "days"} found in the next ${daysAhead} days`
    );
  }
  
  if (avoidDays.length > daysAhead / 2) {
    insights.push(
      "Energy misalignment is common—consider asynchronous communication or shorter check-ins"
    );
  }
  
  // Pattern analysis
  const userStrongDays = days.filter((d) => d.userAlignment === "strong").length;
  const partnerStrongDays = days.filter((d) => d.partnerAlignment === "strong").length;
  
  if (userStrongDays > partnerStrongDays * 1.5) {
    insights.push(
      `${userProfile.name}'s energy is generally higher—consider leading initiatives`
    );
  } else if (partnerStrongDays > userStrongDays * 1.5) {
    insights.push(
      `${teamMember.name}'s energy is generally higher—they may be better suited to lead`
    );
  } else {
    insights.push("Energy levels are balanced—great partnership potential");
  }
  
  // Timing insights
  const weekdayScores = days
    .filter((d) => {
      const date = new Date(d.date);
      const day = date.getDay();
      return day >= 1 && day <= 5; // Monday-Friday
    })
    .map((d) => d.combinedScore);
  
  const avgWeekdayScore =
    weekdayScores.reduce((sum, score) => sum + score, 0) / weekdayScores.length;
  
  if (avgWeekdayScore >= 70) {
    insights.push("Weekdays show strong alignment—schedule regular meetings");
  } else if (avgWeekdayScore < 50) {
    insights.push("Weekday energy is challenging—consider flexible scheduling");
  }
  
  return {
    days,
    optimalDays,
    goodDays,
    avoidDays,
    bestMeetingTime,
    insights,
  };
}

/**
 * Convert alignment to numeric score
 */
function getAlignmentScore(alignment: "strong" | "moderate" | "challenging"): number {
  switch (alignment) {
    case "strong":
      return 90;
    case "moderate":
      return 60;
    case "challenging":
      return 30;
  }
}

/**
 * Find optimal meeting slots for a team
 */
export function findOptimalMeetingSlots(
  userProfile: UserProfile,
  teamMembers: TeamMember[],
  daysAhead: number = 7
): {
  date: string;
  dayOfWeek: string;
  averageScore: number;
  allAlignments: Array<{ name: string; alignment: string; score: number }>;
}[] {
  const slots: Array<{
    date: string;
    dayOfWeek: string;
    averageScore: number;
    allAlignments: Array<{ name: string; alignment: string; score: number }>;
  }> = [];
  
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const alignments: Array<{ name: string; alignment: string; score: number }> = [];
    
    // User's energy
    const userEnergy = calculateDailyEnergy(userProfile, date);
    const userScore = getAlignmentScore(userEnergy.connection.alignment);
    alignments.push({
      name: userProfile.name,
      alignment: userEnergy.connection.alignment,
      score: userScore,
    });
    
    // Team members' energy
    for (const member of teamMembers) {
      const memberEnergy = calculateDailyEnergy(
        {
          ...member,
          onboardingComplete: true,
        },
        date
      );
      const memberScore = getAlignmentScore(memberEnergy.connection.alignment);
      alignments.push({
        name: member.name,
        alignment: memberEnergy.connection.alignment,
        score: memberScore,
      });
    }
    
    // Calculate average score
    const averageScore =
      alignments.reduce((sum, a) => sum + a.score, 0) / alignments.length;
    
    slots.push({
      date: date.toISOString().split("T")[0],
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
      averageScore,
      allAlignments: alignments,
    });
  }
  
  // Sort by average score (best first)
  return slots.sort((a, b) => b.averageScore - a.averageScore);
}

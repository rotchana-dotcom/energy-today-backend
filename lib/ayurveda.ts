/**
 * Ayurveda System
 * 
 * Complete Ayurvedic dosha analysis and timing recommendations.
 * Used internally - output translated to everyday business language.
 */

export type Dosha = "Vata" | "Pitta" | "Kapha";

export interface DoshaProfile {
  primary: Dosha;
  secondary?: Dosha;
  // Internal characteristics (not shown to user)
  element: string;
  qualities: string[];
  // Business translations (shown to user)
  workStyle: string;
  energyPattern: string;
  bestTimeOfDay: string;
  decisionMaking: string;
  strengths: string[];
  challenges: string[];
}

export interface DailyDoshaGuidance {
  energyLevel: number; // 0-100
  peakHours: string;
  recommendedActivities: string[];
  avoid: string[];
  businessFocus: string;
}

/**
 * Dosha characteristics and business translations
 */
const DOSHA_PROFILES: Record<Dosha, Omit<DoshaProfile, "primary" | "secondary">> = {
  Vata: {
    element: "Air + Space",
    qualities: ["Quick", "Creative", "Changeable", "Energetic"],
    workStyle: "Fast-paced with bursts of creativity",
    energyPattern: "High energy in short bursts, needs variety",
    bestTimeOfDay: "Morning (6-10 AM) and late afternoon (2-6 PM)",
    decisionMaking: "Quick, intuitive decisions work best",
    strengths: [
      "Creative thinking and innovation",
      "Adaptability to change",
      "Quick learning and processing",
      "Excellent at brainstorming"
    ],
    challenges: [
      "Can be scattered or unfocused",
      "May struggle with routine",
      "Tendency to overthink",
      "Energy can be inconsistent"
    ]
  },
  Pitta: {
    element: "Fire + Water",
    qualities: ["Focused", "Intense", "Driven", "Sharp"],
    workStyle: "Intense focus with clear goals",
    energyPattern: "Steady high energy, competitive drive",
    bestTimeOfDay: "Midday (10 AM - 2 PM)",
    decisionMaking: "Analytical, strategic decisions",
    strengths: [
      "Strong focus and concentration",
      "Natural leadership abilities",
      "Excellent at execution",
      "Strategic and analytical thinking"
    ],
    challenges: [
      "Can be overly critical",
      "May burn out from intensity",
      "Impatience with slower pace",
      "Tendency toward perfectionism"
    ]
  },
  Kapha: {
    element: "Earth + Water",
    qualities: ["Steady", "Reliable", "Calm", "Enduring"],
    workStyle: "Methodical and consistent",
    energyPattern: "Steady sustained energy, slow to start",
    bestTimeOfDay: "Late morning (10 AM - 2 PM) after warming up",
    decisionMaking: "Thoughtful, deliberate decisions",
    strengths: [
      "Exceptional endurance and stamina",
      "Reliable and consistent",
      "Excellent at building relationships",
      "Patient and thorough"
    ],
    challenges: [
      "Slow to start or change",
      "May resist new ideas",
      "Can become complacent",
      "Needs motivation to begin"
    ]
  }
};

/**
 * Calculate dosha from birth data
 * More sophisticated than just birth month
 */
export function calculateDosha(profile: {
  dateOfBirth: string;
  timeOfBirth?: string;
}): DoshaProfile {
  const date = new Date(profile.dateOfBirth);
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // Primary dosha based on birth season
  let primary: Dosha;
  
  // Vata season: Fall (Oct-Jan) - Air element dominant
  if (month >= 9 || month <= 0) {
    primary = "Vata";
  }
  // Pitta season: Summer (May-Sep) - Fire element dominant
  else if (month >= 4 && month <= 8) {
    primary = "Pitta";
  }
  // Kapha season: Spring (Feb-Apr) - Earth/Water dominant
  else {
    primary = "Kapha";
  }
  
  // Secondary dosha based on day of month
  let secondary: Dosha | undefined;
  if (day <= 10) {
    secondary = "Vata";
  } else if (day <= 20) {
    secondary = "Pitta";
  } else {
    secondary = "Kapha";
  }
  
  // Don't set secondary if same as primary
  if (secondary === primary) {
    secondary = undefined;
  }
  
  const profile_data = DOSHA_PROFILES[primary];
  
  return {
    primary,
    secondary,
    ...profile_data
  };
}

/**
 * Get daily dosha guidance based on time and season
 */
export function getDailyDoshaGuidance(
  doshaProfile: DoshaProfile,
  currentDate: Date
): DailyDoshaGuidance {
  const hour = currentDate.getHours();
  const month = currentDate.getMonth();
  
  // Determine current season's dominant dosha
  let seasonalDosha: Dosha;
  if (month >= 9 || month <= 0) {
    seasonalDosha = "Vata";
  } else if (month >= 4 && month <= 8) {
    seasonalDosha = "Pitta";
  } else {
    seasonalDosha = "Kapha";
  }
  
  // Calculate energy level based on dosha and time
  let energyLevel: number;
  let peakHours: string;
  let recommendedActivities: string[];
  let avoid: string[];
  let businessFocus: string;
  
  if (doshaProfile.primary === "Vata") {
    // Vata peaks in morning and late afternoon
    if (hour >= 6 && hour < 10) {
      energyLevel = 90;
      peakHours = "6-10 AM";
      recommendedActivities = [
        "Creative brainstorming",
        "Innovation sessions",
        "Quick decisions",
        "Networking"
      ];
      avoid = ["Routine tasks", "Long meetings", "Detailed analysis"];
      businessFocus = "Peak creativity - use for innovation and ideation";
    } else if (hour >= 14 && hour < 18) {
      energyLevel = 85;
      peakHours = "2-6 PM";
      recommendedActivities = [
        "Client calls",
        "Presentations",
        "Strategic planning",
        "Problem-solving"
      ];
      avoid = ["Monotonous work", "Heavy analysis"];
      businessFocus = "High energy window - ideal for dynamic activities";
    } else {
      energyLevel = 60;
      peakHours = "6-10 AM or 2-6 PM";
      recommendedActivities = ["Planning", "Light tasks", "Communication"];
      avoid = ["Major decisions", "Complex projects"];
      businessFocus = "Moderate energy - focus on lighter activities";
    }
  } else if (doshaProfile.primary === "Pitta") {
    // Pitta peaks at midday
    if (hour >= 10 && hour < 14) {
      energyLevel = 95;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = [
        "Strategic decisions",
        "Competitive situations",
        "Negotiations",
        "Execution",
        "Leadership tasks"
      ];
      avoid = ["Passive activities", "Routine work"];
      businessFocus = "Peak intensity - tackle your most challenging work";
    } else if (hour >= 6 && hour < 10) {
      energyLevel = 75;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = ["Planning", "Analysis", "Preparation"];
      avoid = ["Major decisions before peak"];
      businessFocus = "Warm-up period - prepare for peak performance";
    } else {
      energyLevel = 65;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = ["Review", "Follow-up", "Relationships"];
      avoid = ["High-intensity work", "Major decisions"];
      businessFocus = "Post-peak - focus on relationship building";
    }
  } else { // Kapha
    // Kapha needs time to warm up, peaks late morning
    if (hour >= 10 && hour < 14) {
      energyLevel = 85;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = [
        "Steady execution",
        "Relationship building",
        "Long-term planning",
        "Team collaboration"
      ];
      avoid = ["Rushed decisions", "Quick pivots"];
      businessFocus = "Steady energy - ideal for sustained effort";
    } else if (hour >= 6 && hour < 10) {
      energyLevel = 55;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = ["Warm-up activities", "Planning", "Review"];
      avoid = ["Important decisions", "High-pressure situations"];
      businessFocus = "Warming up - ease into the day";
    } else {
      energyLevel = 70;
      peakHours = "10 AM - 2 PM";
      recommendedActivities = ["Maintenance", "Relationships", "Reflection"];
      avoid = ["Starting new projects", "High energy demands"];
      businessFocus = "Maintenance mode - consolidate and connect";
    }
  }
  
  // Adjust for seasonal dosha
  if (seasonalDosha === doshaProfile.primary) {
    // Same dosha can be amplified (good) or excessive (challenging)
    if (energyLevel > 80) {
      energyLevel = Math.min(100, energyLevel + 5); // Amplify peaks
    } else {
      energyLevel = Math.max(50, energyLevel - 10); // May be excessive at low times
    }
  }
  
  return {
    energyLevel,
    peakHours,
    recommendedActivities,
    avoid,
    businessFocus
  };
}

/**
 * Calculate dosha compatibility with lunar phase
 * Returns alignment score 0-100
 */
export function calculateDoshaLunarAlignment(
  dosha: Dosha,
  lunarPhase: string
): number {
  // Vata (Air) aligns with New Moon and Waning phases
  if (dosha === "Vata") {
    if (lunarPhase === "new_moon" || lunarPhase === "waning_crescent") {
      return 90;
    }
    if (lunarPhase === "full_moon") {
      return 60;
    }
    return 75;
  }
  
  // Pitta (Fire) aligns with Full Moon and Waxing phases
  if (dosha === "Pitta") {
    if (lunarPhase === "full_moon" || lunarPhase === "waxing_gibbous") {
      return 90;
    }
    if (lunarPhase === "new_moon") {
      return 60;
    }
    return 75;
  }
  
  // Kapha (Earth/Water) aligns with First/Last Quarter
  if (dosha === "Kapha") {
    if (lunarPhase === "first_quarter" || lunarPhase === "last_quarter") {
      return 90;
    }
    return 75;
  }
  
  return 70;
}

/**
 * Get business-language guidance (hide Ayurvedic terms)
 */
export function getBusinessGuidance(
  doshaProfile: DoshaProfile,
  dailyGuidance: DailyDoshaGuidance
): {
  energyStyle: string;
  optimalTiming: string;
  keyStrengths: string[];
  watchOut: string[];
} {
  return {
    energyStyle: doshaProfile.workStyle,
    optimalTiming: dailyGuidance.peakHours,
    keyStrengths: doshaProfile.strengths,
    watchOut: doshaProfile.challenges
  };
}

/**
 * Translate dosha to everyday language (no Sanskrit terms)
 */
export function translateDoshaToEveryday(dosha: Dosha): string {
  const translations = {
    Vata: "Creative, fast-paced energy",
    Pitta: "Focused, intense energy",
    Kapha: "Steady, enduring energy"
  };
  return translations[dosha];
}

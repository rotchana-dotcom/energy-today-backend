export interface UserProfile {
  name: string;
  dateOfBirth: string; // ISO date string or YYYY-MM-DD
  timeOfBirth?: string; // Optional HH:MM format (24-hour)
  placeOfBirth: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  onboardingComplete: boolean;
}

export interface EnergyReading {
  type: string; // e.g., "Creative Flow", "Focused Execution"
  description: string;
  intensity: number; // 0-100
  color: string; // hex color
}

export interface ConnectionReading {
  alignment: "strong" | "moderate" | "challenging";
  color: string; // green, yellow, or red
  summary: string;
  detailedInsight?: string; // Only for paid users
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date string
  mood?: "happy" | "neutral" | "sad";
  notes: string;
  menstrualCycle?: boolean; // Optional for women
  createdAt: string;
}

export interface SubscriptionStatus {
  isPro: boolean;
  provider?: "stripe" | "paypal" | "trial" | "admin" | "local" | null;
  plan?: "monthly" | "annual" | null;
  status?: "active" | "trial" | "cancelled" | "expired" | null;
  source?: "database" | "local" | "admin";
  trialDaysRemaining?: number;
  isTrialActive?: boolean;
  nextBillingDate?: Date | null;
  // Legacy fields (deprecated)
  expiresAt?: string;
  isTrial?: boolean;
  canceledAt?: string;
}

export type LunarPhase = 
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export interface DailyEnergy {
  date: string;
  userEnergy: EnergyReading;
  environmentalEnergy: EnergyReading;
  connection: ConnectionReading;
  lunarPhase: LunarPhase;
  lunarPhaseEmoji: string;
}

/**
 * Biorhythm Calculations
 * 
 * Calculates physical, emotional, and intellectual cycles for optimal timing.
 * Based on established biorhythm theory with business applications.
 */

export interface BiorhythmCycle {
  name: "Physical" | "Emotional" | "Intellectual";
  period: number; // days
  value: number; // -100 to +100
  phase: "High" | "Low" | "Critical";
  percentage: number; // 0-100
  description: string;
}

export interface BiorhythmProfile {
  date: string;
  physical: BiorhythmCycle;
  emotional: BiorhythmCycle;
  intellectual: BiorhythmCycle;
  composite: number; // Average of all three (0-100)
  overallPhase: "Peak" | "High" | "Neutral" | "Low" | "Critical";
  businessRecommendations: {
    bestFor: string[];
    avoid: string[];
    optimalActivities: string[];
  };
}

// ============================================================================
// BIORHYTHM CYCLE CALCULATIONS
// ============================================================================

/**
 * Calculate biorhythm value for a specific cycle
 * @param birthDate Date of birth
 * @param targetDate Date to calculate for
 * @param period Cycle period in days (23 for physical, 28 for emotional, 33 for intellectual)
 * @returns Value between -100 and +100
 */
function calculateCycleValue(birthDate: Date, targetDate: Date, period: number): number {
  const daysSinceBirth = Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const cyclePosition = (daysSinceBirth % period) / period; // 0 to 1
  const radians = cyclePosition * 2 * Math.PI;
  const value = Math.sin(radians) * 100;
  return Math.round(value);
}

/**
 * Determine phase of cycle based on value
 */
function determinePhase(value: number): "High" | "Low" | "Critical" {
  if (Math.abs(value) < 5) return "Critical"; // Near zero crossing
  if (value > 0) return "High";
  return "Low";
}

/**
 * Get description for cycle phase
 */
function getPhaseDescription(name: string, phase: string, value: number): string {
  const intensity = Math.abs(value);
  
  if (phase === "Critical") {
    return `${name} cycle is at a critical transition point. Exercise caution.`;
  }
  
  if (name === "Physical") {
    if (phase === "High") {
      return intensity > 70
        ? "Peak physical energy and stamina. Excellent for demanding tasks."
        : "Good physical energy. Suitable for active work.";
    } else {
      return intensity > 70
        ? "Low physical energy. Prioritize rest and light activities."
        : "Moderate physical energy. Pace yourself.";
    }
  }
  
  if (name === "Emotional") {
    if (phase === "High") {
      return intensity > 70
        ? "Peak emotional stability and optimism. Great for people-facing activities."
        : "Positive emotional state. Good for collaboration.";
    } else {
      return intensity > 70
        ? "Emotionally sensitive period. Avoid high-stress situations."
        : "Moderate emotional energy. Be mindful of reactions.";
    }
  }
  
  if (name === "Intellectual") {
    if (phase === "High") {
      return intensity > 70
        ? "Peak mental clarity and analytical ability. Ideal for complex decisions."
        : "Good mental focus. Suitable for problem-solving.";
    } else {
      return intensity > 70
        ? "Mental fatigue likely. Postpone critical thinking tasks."
        : "Moderate mental energy. Take breaks as needed.";
    }
  }
  
  return "Normal cycle phase.";
}

/**
 * Calculate single biorhythm cycle
 */
function calculateCycle(
  name: "Physical" | "Emotional" | "Intellectual",
  period: number,
  birthDate: Date,
  targetDate: Date
): BiorhythmCycle {
  const value = calculateCycleValue(birthDate, targetDate, period);
  const phase = determinePhase(value);
  const percentage = Math.round(((value + 100) / 200) * 100); // Convert -100/+100 to 0-100
  const description = getPhaseDescription(name, phase, value);
  
  return {
    name,
    period,
    value,
    phase,
    percentage,
    description
  };
}

// ============================================================================
// BUSINESS RECOMMENDATIONS
// ============================================================================

function generateBusinessRecommendations(
  physical: BiorhythmCycle,
  emotional: BiorhythmCycle,
  intellectual: BiorhythmCycle
): {
  bestFor: string[];
  avoid: string[];
  optimalActivities: string[];
} {
  const bestFor: string[] = [];
  const avoid: string[] = [];
  const optimalActivities: string[] = [];
  
  // Physical cycle impact
  if (physical.phase === "High" && physical.value > 50) {
    bestFor.push("Long meetings and presentations");
    bestFor.push("Travel and site visits");
    optimalActivities.push("High-energy networking events");
  } else if (physical.phase === "Low" || physical.phase === "Critical") {
    avoid.push("Physically demanding tasks");
    avoid.push("Long travel");
    optimalActivities.push("Remote work and virtual meetings");
  }
  
  // Emotional cycle impact
  if (emotional.phase === "High" && emotional.value > 50) {
    bestFor.push("Client negotiations");
    bestFor.push("Team collaboration");
    bestFor.push("Conflict resolution");
    optimalActivities.push("Building new relationships");
  } else if (emotional.phase === "Low" || emotional.phase === "Critical") {
    avoid.push("Difficult conversations");
    avoid.push("High-pressure negotiations");
    optimalActivities.push("Solo work and analysis");
  }
  
  // Intellectual cycle impact
  if (intellectual.phase === "High" && intellectual.value > 50) {
    bestFor.push("Strategic planning");
    bestFor.push("Complex problem-solving");
    bestFor.push("Financial analysis");
    optimalActivities.push("Major business decisions");
  } else if (intellectual.phase === "Low" || intellectual.phase === "Critical") {
    avoid.push("Critical decisions");
    avoid.push("Complex negotiations");
    optimalActivities.push("Routine tasks and follow-ups");
  }
  
  // Triple-high days (all cycles high)
  if (physical.value > 50 && emotional.value > 50 && intellectual.value > 50) {
    bestFor.push("Major launches and announcements");
    bestFor.push("Important presentations");
    optimalActivities.push("Closing major deals");
  }
  
  // Triple-low or multiple critical days
  const criticalCount = [physical, emotional, intellectual].filter(c => c.phase === "Critical").length;
  if (criticalCount >= 2) {
    avoid.push("Any major commitments");
    avoid.push("Risky decisions");
    optimalActivities.push("Planning and preparation");
  }
  
  return { bestFor, avoid, optimalActivities };
}

/**
 * Determine overall phase based on composite score
 */
function determineOverallPhase(composite: number): "Peak" | "High" | "Neutral" | "Low" | "Critical" {
  if (composite >= 80) return "Peak";
  if (composite >= 60) return "High";
  if (composite >= 40) return "Neutral";
  if (composite >= 20) return "Low";
  return "Critical";
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate complete biorhythm profile for a specific date
 */
export function calculateBiorhythm(dateOfBirth: string, targetDate: Date = new Date()): BiorhythmProfile {
  const birthDate = new Date(dateOfBirth);
  
  // Calculate three primary cycles
  const physical = calculateCycle("Physical", 23, birthDate, targetDate);
  const emotional = calculateCycle("Emotional", 28, birthDate, targetDate);
  const intellectual = calculateCycle("Intellectual", 33, birthDate, targetDate);
  
  // Calculate composite score (average percentage)
  const composite = Math.round((physical.percentage + emotional.percentage + intellectual.percentage) / 3);
  
  // Determine overall phase
  const overallPhase = determineOverallPhase(composite);
  
  // Generate business recommendations
  const businessRecommendations = generateBusinessRecommendations(physical, emotional, intellectual);
  
  return {
    date: targetDate.toISOString(),
    physical,
    emotional,
    intellectual,
    composite,
    overallPhase,
    businessRecommendations
  };
}

/**
 * Calculate biorhythm for a date range (useful for calendar view)
 */
export function calculateBiorhythmRange(
  dateOfBirth: string,
  startDate: Date,
  days: number
): BiorhythmProfile[] {
  const profiles: BiorhythmProfile[] = [];
  
  for (let i = 0; i < days; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + i);
    profiles.push(calculateBiorhythm(dateOfBirth, targetDate));
  }
  
  return profiles;
}

/**
 * Find optimal days within a date range
 */
export function findOptimalDays(
  dateOfBirth: string,
  startDate: Date,
  days: number,
  minComposite: number = 70
): Date[] {
  const profiles = calculateBiorhythmRange(dateOfBirth, startDate, days);
  return profiles
    .filter(p => p.composite >= minComposite)
    .map(p => new Date(p.date));
}

/**
 * Find critical days (caution periods) within a date range
 */
export function findCriticalDays(
  dateOfBirth: string,
  startDate: Date,
  days: number
): Date[] {
  const profiles = calculateBiorhythmRange(dateOfBirth, startDate, days);
  return profiles
    .filter(p => {
      const criticalCount = [p.physical, p.emotional, p.intellectual]
        .filter(c => c.phase === "Critical").length;
      return criticalCount >= 2;
    })
    .map(p => new Date(p.date));
}

/**
 * Get biorhythm compatibility between two people (for partnerships/meetings)
 */
export function calculateBiorhythmCompatibility(
  dateOfBirth1: string,
  dateOfBirth2: string,
  targetDate: Date = new Date()
): {
  compatibility: number; // 0-100
  description: string;
  bestActivities: string[];
} {
  const profile1 = calculateBiorhythm(dateOfBirth1, targetDate);
  const profile2 = calculateBiorhythm(dateOfBirth2, targetDate);
  
  // Calculate compatibility based on cycle alignment
  const physicalDiff = Math.abs(profile1.physical.value - profile2.physical.value);
  const emotionalDiff = Math.abs(profile1.emotional.value - profile2.emotional.value);
  const intellectualDiff = Math.abs(profile1.intellectual.value - profile2.intellectual.value);
  
  const avgDiff = (physicalDiff + emotionalDiff + intellectualDiff) / 3;
  const compatibility = Math.round(100 - (avgDiff / 2)); // Convert to 0-100 scale
  
  let description = "";
  const bestActivities: string[] = [];
  
  if (compatibility >= 80) {
    description = "Excellent alignment. Great day for collaboration and joint decisions.";
    bestActivities.push("Major partnership decisions", "Joint presentations", "Strategic planning sessions");
  } else if (compatibility >= 60) {
    description = "Good alignment. Suitable for most collaborative activities.";
    bestActivities.push("Team meetings", "Brainstorming sessions", "Project planning");
  } else if (compatibility >= 40) {
    description = "Moderate alignment. Focus on structured, agenda-driven interactions.";
    bestActivities.push("Status updates", "Routine check-ins", "Follow-up meetings");
  } else {
    description = "Low alignment. Consider rescheduling important joint decisions.";
    bestActivities.push("Independent work", "Email communication", "Preparation tasks");
  }
  
  return {
    compatibility,
    description,
    bestActivities
  };
}

/**
 * Lunar Cycle Utilities
 * 
 * Calculate moon phases and lunar correlations for health tracking
 */

/**
 * Calculate moon phase for a given date
 * Returns a value between 0 and 1:
 * - 0 = New Moon
 * - 0.25 = First Quarter
 * - 0.5 = Full Moon
 * - 0.75 = Last Quarter
 * - 1 = New Moon (next cycle)
 */
export function getMoonPhase(date: Date): number {
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date("2000-01-06T18:14:00Z").getTime();
  const lunarCycle = 29.53058867; // days
  
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceKnownNewMoon % lunarCycle) / lunarCycle;
  
  return Math.round(phase * 100) / 100; // Round to 2 decimal places
}

/**
 * Get moon phase name
 */
export function getMoonPhaseName(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return "New Moon";
  if (phase < 0.1875) return "Waxing Crescent";
  if (phase < 0.3125) return "First Quarter";
  if (phase < 0.4375) return "Waxing Gibbous";
  if (phase < 0.5625) return "Full Moon";
  if (phase < 0.6875) return "Waning Gibbous";
  if (phase < 0.8125) return "Last Quarter";
  return "Waning Crescent";
}

/**
 * Get moon emoji
 */
export function getMoonEmoji(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return "🌑"; // New Moon
  if (phase < 0.1875) return "🌒"; // Waxing Crescent
  if (phase < 0.3125) return "🌓"; // First Quarter
  if (phase < 0.4375) return "🌔"; // Waxing Gibbous
  if (phase < 0.5625) return "🌕"; // Full Moon
  if (phase < 0.6875) return "🌖"; // Waning Gibbous
  if (phase < 0.8125) return "🌗"; // Last Quarter
  return "🌘"; // Waning Crescent
}

/**
 * Get lunar energy description
 */
export function getLunarEnergyDescription(phase: number): string {
  const phaseName = getMoonPhaseName(phase);
  
  switch (phaseName) {
    case "New Moon":
      return "Time for new beginnings and setting intentions. Energy is introspective.";
    case "Waxing Crescent":
      return "Energy is building. Good time for starting new projects and habits.";
    case "First Quarter":
      return "Energy peaks for action and decision-making. Overcome obstacles.";
    case "Waxing Gibbous":
      return "Refinement phase. Perfect energy for adjustments and improvements.";
    case "Full Moon":
      return "Peak energy and emotions. Time for completion and celebration.";
    case "Waning Gibbous":
      return "Gratitude and sharing phase. Energy for teaching and giving back.";
    case "Last Quarter":
      return "Release and let go. Energy for breaking bad habits and clearing space.";
    case "Waning Crescent":
      return "Rest and recovery. Energy is low - focus on self-care and reflection.";
    default:
      return "Transitional energy phase.";
  }
}

/**
 * Analyze sleep quality correlation with moon phase
 */
export function analyzeSleepMoonCorrelation(sleepEntries: Array<{
  quality: number | null;
  moonPhase: string | null;
}>): {
  fullMoonAvg: number;
  newMoonAvg: number;
  correlation: "positive" | "negative" | "neutral";
  insight: string;
} {
  const fullMoonSleep = sleepEntries.filter(
    (entry) => entry.moonPhase && parseFloat(entry.moonPhase) >= 0.45 && parseFloat(entry.moonPhase) <= 0.55 && entry.quality
  );
  
  const newMoonSleep = sleepEntries.filter(
    (entry) => entry.moonPhase && (parseFloat(entry.moonPhase) <= 0.05 || parseFloat(entry.moonPhase) >= 0.95) && entry.quality
  );
  
  const fullMoonAvg = fullMoonSleep.length > 0
    ? fullMoonSleep.reduce((sum, entry) => sum + (entry.quality || 0), 0) / fullMoonSleep.length
    : 0;
  
  const newMoonAvg = newMoonSleep.length > 0
    ? newMoonSleep.reduce((sum, entry) => sum + (entry.quality || 0), 0) / newMoonSleep.length
    : 0;
  
  let correlation: "positive" | "negative" | "neutral" = "neutral";
  let insight = "Not enough data to determine lunar correlation.";
  
  if (fullMoonSleep.length >= 3 && newMoonSleep.length >= 3) {
    const diff = fullMoonAvg - newMoonAvg;
    
    if (Math.abs(diff) < 0.5) {
      correlation = "neutral";
      insight = "Moon phases don't significantly affect your sleep quality.";
    } else if (diff > 0) {
      correlation = "positive";
      insight = `You sleep ${Math.round((diff / newMoonAvg) * 100)}% better during full moons. Consider planning important rest during this phase.`;
    } else {
      correlation = "negative";
      insight = `You sleep ${Math.round((Math.abs(diff) / fullMoonAvg) * 100)}% better during new moons. Full moons may disrupt your sleep - try extra relaxation techniques.`;
    }
  }
  
  return {
    fullMoonAvg: Math.round(fullMoonAvg * 10) / 10,
    newMoonAvg: Math.round(newMoonAvg * 10) / 10,
    correlation,
    insight,
  };
}

/**
 * Get next significant moon phase
 */
export function getNextSignificantPhase(currentDate: Date = new Date()): {
  phase: string;
  date: Date;
  daysUntil: number;
} {
  const currentPhase = getMoonPhase(currentDate);
  const lunarCycle = 29.53058867;
  
  // Calculate days to next significant phase (new moon, first quarter, full moon, last quarter)
  const significantPhases = [0, 0.25, 0.5, 0.75];
  let nearestPhase = significantPhases[0];
  let daysToPhase = Infinity;
  
  for (const targetPhase of significantPhases) {
    let phaseDiff = targetPhase - currentPhase;
    if (phaseDiff < 0) phaseDiff += 1;
    
    const days = phaseDiff * lunarCycle;
    if (days < daysToPhase) {
      daysToPhase = days;
      nearestPhase = targetPhase;
    }
  }
  
  const nextPhaseDate = new Date(currentDate.getTime() + daysToPhase * 24 * 60 * 60 * 1000);
  
  return {
    phase: getMoonPhaseName(nearestPhase),
    date: nextPhaseDate,
    daysUntil: Math.ceil(daysToPhase),
  };
}

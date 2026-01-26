/**
 * Lunar Context (Server-Safe)
 * 
 * Provides current lunar phase information without client-side dependencies.
 * Safe to import in server code.
 */

import { getMoonPhase, getMoonPhaseName, getMoonEmoji } from "./lunar-cycle";

/**
 * Get current lunar context for AI predictions
 * Server-safe function with no client dependencies
 */
export function getCurrentLunarContext(): {
  phase: number;
  phaseName: string;
  emoji: string;
  effects: string[];
} {
  const now = new Date();
  const phase = getMoonPhase(now);
  const phaseName = getMoonPhaseName(phase);
  const emoji = getMoonEmoji(phase);

  // Define effects based on lunar phase
  let effects: string[] = [];
  
  if (phaseName === "Full Moon") {
    effects = [
      "May cause lighter, more restless sleep",
      "Heightened emotions and energy",
      "Good time for completion and release",
      "Increased intuition and creativity"
    ];
  } else if (phaseName === "New Moon") {
    effects = [
      "Deeper, more restorative sleep",
      "Lower energy, good for rest",
      "Ideal for new beginnings and planning",
      "Time for introspection"
    ];
  } else if (phaseName === "First Quarter") {
    effects = [
      "Building energy and momentum",
      "Good for taking action",
      "May experience challenges to overcome",
      "Time to push forward on goals"
    ];
  } else if (phaseName === "Last Quarter") {
    effects = [
      "Energy winding down",
      "Time for reflection and letting go",
      "Good for completing unfinished tasks",
      "Prepare for the new cycle"
    ];
  } else {
    // Waxing or Waning phases
    effects = [
      "Transitional energy",
      "Balance between action and rest",
      "Good for steady progress"
    ];
  }

  return {
    phase,
    phaseName,
    emoji,
    effects
  };
}

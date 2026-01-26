import { UserProfile, EnergyReading, ConnectionReading, DailyEnergy, LunarPhase } from "@/types";

// ============================================================================
// NUMEROLOGY CALCULATIONS
// ============================================================================

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function calculateLifePathNumber(dateOfBirth: string): number {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const sum = day + month + year;
  return reduceToSingleDigit(sum);
}

function calculatePersonalYearNumber(dateOfBirth: string, currentYear: number): number {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  const sum = day + month + currentYear;
  return reduceToSingleDigit(sum);
}

function calculateDayNumber(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const sum = day + month + year;
  return reduceToSingleDigit(sum);
}

// ============================================================================
// LUNAR CYCLE CALCULATIONS
// ============================================================================

function getLunarPhase(date: Date): { phase: LunarPhase; emoji: string } {
  // Use accurate astronomical calculation (Conway's algorithm)
  // Reference: Known full moon on January 21, 2000 at 04:40 UTC
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Calculate Julian Day Number
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
           Math.floor(275 * month / 9) + day + 1721013.5;
  jd += (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
  
  // Days since known full moon (Jan 21, 2000)
  const daysSinceFullMoon = jd - 2451565.4;
  const lunarCycles = daysSinceFullMoon / 29.53058867; // Synodic month
  let phase = (lunarCycles - Math.floor(lunarCycles));
  
  // Adjust phase so 0.0 = Full Moon, 0.5 = New Moon
  // We want 0.0 = New Moon, so add 0.5 and wrap
  phase = (phase + 0.5) % 1.0;
  
  // Map phase to moon phase names (0 = new moon, 0.5 = full moon)
  if (phase < 0.0625 || phase >= 0.9375) return { phase: "new_moon", emoji: "🌑" };
  if (phase < 0.1875) return { phase: "waxing_crescent", emoji: "🌒" };
  if (phase < 0.3125) return { phase: "last_quarter", emoji: "🌗" };
  if (phase < 0.4375) return { phase: "waxing_gibbous", emoji: "🌔" };
  if (phase < 0.5625) return { phase: "full_moon", emoji: "🌕" };
  if (phase < 0.6875) return { phase: "waning_gibbous", emoji: "🌖" };
  if (phase < 0.8125) return { phase: "first_quarter", emoji: "🌓" };
  return { phase: "waning_crescent", emoji: "🌘" };
}

// ============================================================================
// WUXING (FIVE ELEMENTS) CALCULATIONS
// ============================================================================

type WuxingElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

function getWuxingElement(year: number): WuxingElement {
  const lastDigit = year % 10;
  
  if (lastDigit === 0 || lastDigit === 1) return "Metal";
  if (lastDigit === 2 || lastDigit === 3) return "Water";
  if (lastDigit === 4 || lastDigit === 5) return "Wood";
  if (lastDigit === 6 || lastDigit === 7) return "Fire";
  return "Earth";
}

function getElementInteraction(userElement: WuxingElement, dayElement: WuxingElement): number {
  // Generative cycle: +1
  const generative: Record<WuxingElement, WuxingElement> = {
    Wood: "Fire",
    Fire: "Earth",
    Earth: "Metal",
    Metal: "Water",
    Water: "Wood",
  };
  
  // Destructive cycle: -1
  const destructive: Record<WuxingElement, WuxingElement> = {
    Wood: "Earth",
    Earth: "Water",
    Water: "Fire",
    Fire: "Metal",
    Metal: "Wood",
  };
  
  if (userElement === dayElement) return 1; // Same element: harmony
  if (generative[userElement] === dayElement) return 0.8; // User generates day: supportive
  if (generative[dayElement] === userElement) return 0.6; // Day generates user: receiving
  if (destructive[userElement] === dayElement) return -0.5; // User destroys day: challenging
  if (destructive[dayElement] === userElement) return -0.8; // Day destroys user: very challenging
  
  return 0; // Neutral
}

// ============================================================================
// THAI AUSPICIOUS DAY CALCULATIONS
// ============================================================================

function getThaiDayEnergy(dayOfWeek: number): { color: string; fortune: number } {
  // 0 = Sunday, 1 = Monday, etc.
  const thaiDays = [
    { color: "Red", fortune: 0.7 },      // Sunday: Good for rest, spirituality
    { color: "Yellow", fortune: 0.8 },   // Monday: Good for new beginnings
    { color: "Pink", fortune: 0.6 },     // Tuesday: Moderate, be cautious
    { color: "Green", fortune: 0.9 },    // Wednesday: Very auspicious
    { color: "Orange", fortune: 0.5 },   // Thursday: Neutral
    { color: "Blue", fortune: 0.7 },     // Friday: Good for relationships
    { color: "Purple", fortune: 0.4 },   // Saturday: Challenging, avoid major decisions
  ];
  
  return thaiDays[dayOfWeek];
}

// ============================================================================
// I-CHING HEXAGRAM CALCULATION
// ============================================================================

function getDailyHexagram(date: Date): { number: number; name: string; meaning: string } {
  // Simplified: Use date to deterministically select one of 64 hexagrams
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hexagramNumber = (dayOfYear % 64) + 1;
  
  const hexagrams = [
    { name: "The Creative", meaning: "Initiating energy, leadership, action" },
    { name: "The Receptive", meaning: "Openness, support, yielding" },
    { name: "Difficulty at the Beginning", meaning: "Patience, careful planning" },
    { name: "Youthful Folly", meaning: "Learning, seeking guidance" },
    { name: "Waiting", meaning: "Patience, timing, preparation" },
    // ... (simplified for brevity, would include all 64)
  ];
  
  const index = (hexagramNumber - 1) % hexagrams.length;
  return { number: hexagramNumber, ...hexagrams[index] };
}

// ============================================================================
// AYURVEDA DOSHA CALCULATION
// ============================================================================

type Dosha = "Vata" | "Pitta" | "Kapha";

function getDominantDosha(dateOfBirth: string): Dosha {
  // Simplified: Use birth month to determine dosha
  const date = new Date(dateOfBirth);
  const month = date.getMonth();
  
  if (month >= 2 && month <= 5) return "Pitta"; // Spring/Summer: Fire
  if (month >= 6 && month <= 9) return "Vata";  // Fall: Air
  return "Kapha"; // Winter: Earth/Water
}

function getDoshaBalance(dosha: Dosha, lunarPhase: LunarPhase): number {
  // Lunar phases affect doshas differently
  if (lunarPhase === "full_moon") {
    return dosha === "Kapha" ? 0.9 : 0.7;
  }
  if (lunarPhase === "new_moon") {
    return dosha === "Vata" ? 0.9 : 0.7;
  }
  return 0.75;
}

// ============================================================================
// ASTROLOGY (SIMPLIFIED)
// ============================================================================

function getZodiacSign(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

// ============================================================================
// ENERGY SYNTHESIS
// ============================================================================

const ENERGY_TYPES = [
  {
    name: "Creative Flow",
    description: "High imagination, idea generation, artistic expression",
    keywords: ["creativity", "innovation", "brainstorming", "artistic"],
  },
  {
    name: "Focused Execution",
    description: "Deep concentration, task completion, analytical work",
    keywords: ["focus", "productivity", "analysis", "completion"],
  },
  {
    name: "Reflective Pause",
    description: "Introspection, planning, rest, consolidation",
    keywords: ["reflection", "planning", "rest", "integration"],
  },
  {
    name: "Communicative Energy",
    description: "Networking, presentations, negotiations, social interaction",
    keywords: ["communication", "networking", "collaboration", "social"],
  },
  {
    name: "Grounded Stability",
    description: "Practical tasks, organization, routine, maintenance",
    keywords: ["stability", "organization", "routine", "practical"],
  },
  {
    name: "High Momentum",
    description: "Fast-paced, action-oriented, initiating energy",
    keywords: ["action", "momentum", "initiative", "dynamic"],
  },
  {
    name: "Structured Growth",
    description: "Methodical progress, building, step-by-step advancement",
    keywords: ["growth", "structure", "building", "methodical"],
  },
  {
    name: "Transformative",
    description: "Change, release, endings and new beginnings",
    keywords: ["transformation", "change", "release", "renewal"],
  },
  {
    name: "Harmonious",
    description: "Balance, relationships, beauty, cooperation",
    keywords: ["harmony", "balance", "relationships", "cooperation"],
  },
];

function calculateUserEnergy(profile: UserProfile, date: Date): EnergyReading {
  const lifePathNumber = calculateLifePathNumber(profile.dateOfBirth);
  const personalYearNumber = calculatePersonalYearNumber(profile.dateOfBirth, date.getFullYear());
  const zodiacSign = getZodiacSign(profile.dateOfBirth);
  const birthYear = new Date(profile.dateOfBirth).getFullYear();
  const userElement = getWuxingElement(birthYear);
  const dosha = getDominantDosha(profile.dateOfBirth);
  
  // Combine factors to determine energy type
  const energyIndex = (lifePathNumber + personalYearNumber) % 9;
  const energyType = ENERGY_TYPES[energyIndex];
  
  // Calculate intensity based on multiple factors
  const lunarInfo = getLunarPhase(date);
  const doshaBalance = getDoshaBalance(dosha, lunarInfo.phase);
  const intensity = Math.round(doshaBalance * 100);
  
  return {
    type: energyType.name,
    description: energyType.description,
    intensity,
    color: intensity > 70 ? "#22C55E" : intensity > 40 ? "#F59E0B" : "#EF4444",
  };
}

function calculateEnvironmentalEnergy(date: Date): EnergyReading {
  const dayNumber = calculateDayNumber(date);
  const lunarInfo = getLunarPhase(date);
  const dayOfWeek = date.getDay();
  const thaiEnergy = getThaiDayEnergy(dayOfWeek);
  const currentYear = date.getFullYear();
  const yearElement = getWuxingElement(currentYear);
  
  // Combine factors to determine environmental energy type
  const energyIndex = (dayNumber + 5) % 9;
  const energyType = ENERGY_TYPES[energyIndex];
  
  // Calculate intensity
  const intensity = Math.round(thaiEnergy.fortune * 100);
  
  return {
    type: energyType.name,
    description: energyType.description,
    intensity,
    color: intensity > 70 ? "#22C55E" : intensity > 40 ? "#F59E0B" : "#EF4444",
  };
}

function calculateConnection(userEnergy: EnergyReading, envEnergy: EnergyReading, profile: UserProfile, date: Date): ConnectionReading {
  const birthYear = new Date(profile.dateOfBirth).getFullYear();
  const userElement = getWuxingElement(birthYear);
  const yearElement = getWuxingElement(date.getFullYear());
  
  const elementInteraction = getElementInteraction(userElement, yearElement);
  const intensityDiff = Math.abs(userEnergy.intensity - envEnergy.intensity);
  
  // Calculate alignment score
  let alignmentScore = 0.5; // Base neutral
  alignmentScore += elementInteraction * 0.3;
  alignmentScore += (100 - intensityDiff) / 200; // Closer intensities = better alignment
  
  let alignment: "strong" | "moderate" | "challenging";
  let color: string;
  let summary: string;
  
  if (alignmentScore > 0.7) {
    alignment = "strong";
    color = "#22C55E";
    summary = `A day of **${envEnergy.type}** aligns beautifully with your **${userEnergy.type}**. This is an excellent time to leverage this synergy. Your natural tendencies are amplified by today's energy. Move forward with confidence.`;
  } else if (alignmentScore > 0.4) {
    alignment = "moderate";
    color = "#F59E0B";
    summary = `Today's **${envEnergy.type}** energy offers a steady backdrop for your **${userEnergy.type}**. While not the most dynamic combination, it's a solid day for consistent progress. Focus on steady advancement rather than dramatic breakthroughs.`;
  } else {
    alignment = "challenging";
    color = "#EF4444";
    summary = `Your **${userEnergy.type}** energy meets today's **${envEnergy.type}** energy, creating some friction. You may feel pulled in different directions. Prioritize flexibility today. Complete essential work early, then allow space for adaptation.`;
  }
  
  return {
    alignment,
    color,
    summary,
  };
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function calculateDailyEnergy(profile: UserProfile, date: Date = new Date()): DailyEnergy {
  const userEnergy = calculateUserEnergy(profile, date);
  const environmentalEnergy = calculateEnvironmentalEnergy(date);
  const connection = calculateConnection(userEnergy, environmentalEnergy, profile, date);
  const lunarInfo = getLunarPhase(date);
  
  return {
    date: date.toISOString(),
    userEnergy,
    environmentalEnergy,
    connection,
    lunarPhase: lunarInfo.phase,
    lunarPhaseEmoji: lunarInfo.emoji,
  };
}

// Helper function for calendar view
export function calculateEnergyForDateRange(
  profile: UserProfile,
  startDate: Date,
  endDate: Date
): DailyEnergy[] {
  const results: DailyEnergy[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    results.push(calculateDailyEnergy(profile, new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return results;
}

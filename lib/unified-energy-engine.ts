/**
 * Unified Energy Engine
 * 
 * Combines ALL 7+ spiritual systems into Three Profiles architecture.
 * Output in everyday business language - spiritual systems hidden.
 */

import { UserProfile } from "@/types";
import { calculateBirthHexagram, calculateDailyHexagram, type Hexagram } from "./i-ching";
import { calculateDosha, getDailyDoshaGuidance, type DoshaProfile, type DailyDoshaGuidance } from "./ayurveda";
import { getThaiDayGuidance, type ThaiDayGuidance } from "./thai-auspicious";
import { analyzeDayBorn, analyzeLifeLine, analyzeKarmicNumbers, type DayBornAnalysis, type LifeLineAnalysis, type KarmicAnalysis } from "./enhanced-numerology";
import { calculateAstrologyProfile, calculateDailyTransits, type AstrologyProfile, type DailyTransits } from "./astrology";
import { calculateBiorhythm, type BiorhythmProfile } from "./biorhythm";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Personal Profile - Your Soul Blueprint
 * Calculated once from birth data, stored forever
 */
export interface PersonalProfile {
  // Numerology
  lifePathNumber: number;
  personalYearNumber: number;
  dayBorn: DayBornAnalysis;
  lifeLine: LifeLineAnalysis;
  
  // I-Ching
  birthHexagram: Hexagram;
  
  // Ayurveda
  dosha: DoshaProfile;
  
  // Wuxing (Five Elements)
  birthElement: "Wood" | "Fire" | "Earth" | "Metal" | "Water";
  
  // Western Astrology
  zodiacSign: string;
  astrologyProfile: AstrologyProfile;
  
  // Calculated timestamp
  calculatedAt: string;
}

/**
 * Earth Profile - Today's Universal Energy
 * Changes daily, affects everyone
 */
export interface EarthProfile {
  date: string;
  
  // Lunar
  lunarPhase: string;
  lunarEmoji: string;
  lunarInfluence: number; // 0-100
  
  // Thai Auspicious
  thaiDay: ThaiDayGuidance;
  
  // I-Ching
  dailyHexagram: Hexagram;
  
  // Wuxing
  dailyElement: "Wood" | "Fire" | "Earth" | "Metal" | "Water";
  
  // Numerology
  dayNumber: number;
  
  // Astrology transits
  transits: DailyTransits;
  
  // Biorhythm
  biorhythm: BiorhythmProfile;
}

/**
 * Challenges Profile - Your Growth Areas
 * Based on karmic analysis and life lessons
 */
export interface ChallengesProfile {
  karmic: KarmicAnalysis;
  lifeLessons: string[];
  blindSpots: string[];
  growthOpportunities: string[];
  patternsToOvercome: string[];
}

/**
 * Combined Analysis - All Systems Together
 */
export interface CombinedAnalysis {
  // Alignment scores
  overallAlignment: number; // 0-100
  perfectDayScore: number; // 0-100
  
  // Energy type
  energyType: string;
  energyDescription: string;
  intensity: number; // 0-100
  
  // Timing
  peakHours: string;
  optimalWindows: {
    meetings: string;
    decisions: string;
    deals: string;
    planning: string;
  };
  
  // Confidence
  confidenceScore: number; // 0-100 (how much systems agree)
}

/**
 * Business Insights - Everyday Language Output
 */
export interface BusinessInsights {
  // Top priority
  topPriority: string;
  topPriorityWhy: string;
  
  // Timing recommendations
  meetings: { time: string; why: string; confidence: number };
  decisions: { time: string; why: string; confidence: number };
  deals: { time: string; why: string; confidence: number };
  planning: { time: string; why: string; confidence: number };
  
  // Guidance
  bestFor: string[];
  avoid: string[];
  keyOpportunity: string;
  watchOut: string;
  
  // Scores
  perfectDayScore: number;
  confidenceScore: number;
}

/**
 * Complete Unified Energy Reading
 */
export interface UnifiedEnergyReading {
  personalProfile: PersonalProfile;
  earthProfile: EarthProfile;
  challengesProfile: ChallengesProfile;
  combinedAnalysis: CombinedAnalysis;
  businessInsights: BusinessInsights;
  calculatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
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

function getWuxingElement(year: number): "Wood" | "Fire" | "Earth" | "Metal" | "Water" {
  const lastDigit = year % 10;
  
  if (lastDigit === 0 || lastDigit === 1) return "Metal";
  if (lastDigit === 2 || lastDigit === 3) return "Water";
  if (lastDigit === 4 || lastDigit === 5) return "Wood";
  if (lastDigit === 6 || lastDigit === 7) return "Fire";
  return "Earth";
}

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

function getLunarPhase(date: Date): { phase: string; emoji: string; influence: number } {
  // Accurate astronomical calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
           Math.floor(275 * month / 9) + day + 1721013.5;
  jd += (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
  
  const daysSinceFullMoon = jd - 2451565.4;
  const lunarCycles = daysSinceFullMoon / 29.53058867;
  let phase = (lunarCycles - Math.floor(lunarCycles));
  phase = (phase + 0.5) % 1.0;
  
  if (phase < 0.0625 || phase >= 0.9375) return { phase: "new_moon", emoji: "🌑", influence: 70 };
  if (phase < 0.1875) return { phase: "waxing_crescent", emoji: "🌒", influence: 75 };
  if (phase < 0.3125) return { phase: "first_quarter", emoji: "🌓", influence: 80 };
  if (phase < 0.4375) return { phase: "waxing_gibbous", emoji: "🌔", influence: 85 };
  if (phase < 0.5625) return { phase: "full_moon", emoji: "🌕", influence: 95 };
  if (phase < 0.6875) return { phase: "waning_gibbous", emoji: "🌖", influence: 85 };
  if (phase < 0.8125) return { phase: "last_quarter", emoji: "🌗", influence: 75 };
  return { phase: "waning_crescent", emoji: "🌘", influence: 65 };
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Personal Profile (once per user)
 */
export function calculatePersonalProfile(userProfile: UserProfile): PersonalProfile {
  const birthDate = new Date(userProfile.dateOfBirth);
  const birthYear = birthDate.getFullYear();
  
  return {
    lifePathNumber: calculateLifePathNumber(userProfile.dateOfBirth),
    personalYearNumber: calculatePersonalYearNumber(userProfile.dateOfBirth, new Date().getFullYear()),
    dayBorn: analyzeDayBorn(userProfile.dateOfBirth),
    lifeLine: analyzeLifeLine(userProfile.dateOfBirth),
    birthHexagram: calculateBirthHexagram(userProfile.dateOfBirth),
    dosha: calculateDosha({ dateOfBirth: userProfile.dateOfBirth }),
    birthElement: getWuxingElement(birthYear),
    zodiacSign: getZodiacSign(userProfile.dateOfBirth),
    astrologyProfile: calculateAstrologyProfile(
      userProfile.dateOfBirth,
      userProfile.placeOfBirth ? {
        latitude: userProfile.placeOfBirth.latitude,
        longitude: userProfile.placeOfBirth.longitude
      } : undefined
    ),
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Calculate Earth Profile (daily)
 */
export function calculateEarthProfile(date: Date = new Date()): EarthProfile {
  const lunar = getLunarPhase(date);
  
  return {
    date: date.toISOString(),
    lunarPhase: lunar.phase,
    lunarEmoji: lunar.emoji,
    lunarInfluence: lunar.influence,
    thaiDay: getThaiDayGuidance(date),
    dailyHexagram: calculateDailyHexagram(date),
    dailyElement: getWuxingElement(date.getFullYear()),
    dayNumber: calculateDayNumber(date),
    transits: calculateDailyTransits(date),
    biorhythm: { date: date.toISOString(), physical: { name: "Physical", period: 23, value: 0, phase: "High", percentage: 50, description: "" }, emotional: { name: "Emotional", period: 28, value: 0, phase: "High", percentage: 50, description: "" }, intellectual: { name: "Intellectual", period: 33, value: 0, phase: "High", percentage: 50, description: "" }, composite: 50, overallPhase: "Neutral", businessRecommendations: { bestFor: [], avoid: [], optimalActivities: [] } } // Placeholder, will be calculated with user profile
  };
}

/**
 * Calculate Challenges Profile
 */
export function calculateChallengesProfile(userProfile: UserProfile): ChallengesProfile {
  const karmic = analyzeKarmicNumbers(userProfile.dateOfBirth, userProfile.name || "User");
  
  // Extract life lessons from karmic analysis
  const lifeLessons = karmic.lessons;
  
  // Generate blind spots based on life path
  const lifePathNumber = calculateLifePathNumber(userProfile.dateOfBirth);
  const blindSpots = getBlindSpotsForLifePath(lifePathNumber);
  
  // Growth opportunities
  const growthOpportunities = getGrowthOpportunities(lifePathNumber, karmic);
  
  // Patterns to overcome
  const patternsToOvercome = getPatternsToOvercome(karmic);
  
  return {
    karmic,
    lifeLessons,
    blindSpots,
    growthOpportunities,
    patternsToOvercome
  };
}

/**
 * Calculate Combined Analysis
 */
export function calculateCombinedAnalysis(
  personal: PersonalProfile,
  earth: EarthProfile,
  userDateOfBirth?: string
): CombinedAnalysis {
  // Calculate biorhythm if birth date provided
  if (userDateOfBirth) {
    earth.biorhythm = calculateBiorhythm(userDateOfBirth, new Date(earth.date));
  }
  
  // Calculate alignment scores from different systems
  const scores: number[] = [];
  
  // Hexagram alignment
  const hexagramScore = calculateHexagramAlignment(personal.birthHexagram, earth.dailyHexagram);
  scores.push(hexagramScore);
  
  // Element alignment
  const elementScore = calculateElementAlignment(personal.birthElement, earth.dailyElement);
  scores.push(elementScore);
  
  // Thai day score
  scores.push(earth.thaiDay.overallFortune);
  
  // Lunar influence
  scores.push(earth.lunarInfluence);
  
  // Biorhythm composite
  scores.push(earth.biorhythm.composite);
  
  // Astrology business impact (average)
  const astroImpact = (earth.transits.businessImpact.meetings + earth.transits.businessImpact.decisions + 
                       earth.transits.businessImpact.negotiations + earth.transits.businessImpact.launches) / 4;
  scores.push(astroImpact);
  
  // Dosha-lunar alignment
  const doshaLunarScore = calculateDoshaLunarAlignment(personal.dosha.primary, earth.lunarPhase);
  scores.push(doshaLunarScore);
  
  // Overall alignment (average of all scores)
  const overallAlignment = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Perfect day score (weighted average, emphasizing Thai and Hexagram)
  const perfectDayScore = (
    hexagramScore * 0.25 +
    elementScore * 0.20 +
    earth.thaiDay.overallFortune * 0.30 +
    earth.lunarInfluence * 0.15 +
    doshaLunarScore * 0.10
  );
  
  // Confidence score (how much systems agree)
  const variance = calculateVariance(scores);
  const confidenceScore = Math.max(0, 100 - variance * 2);
  
  // Determine energy type
  const energyType = determineEnergyType(personal, earth);
  
  // Get dosha guidance for timing
  const doshaGuidance = getDailyDoshaGuidance(personal.dosha, new Date(earth.date));
  
  // Optimal windows
  const optimalWindows = {
    meetings: doshaGuidance.peakHours,
    decisions: earth.dailyHexagram.optimalTiming,
    deals: earth.thaiDay.deals.guidance,
    planning: earth.thaiDay.planning.guidance
  };
  
  return {
    overallAlignment: Math.round(overallAlignment),
    perfectDayScore: Math.round(perfectDayScore),
    energyType: energyType.name,
    energyDescription: energyType.description,
    intensity: Math.round(overallAlignment),
    peakHours: doshaGuidance.peakHours,
    optimalWindows,
    confidenceScore: Math.round(confidenceScore)
  };
}

/**
 * Helper: Calculate optimal hour based on ALL systems
 */
function calculateOptimalHour(
  personal: PersonalProfile,
  earth: EarthProfile,
  doshaGuidance: any
): number {
  // Parse peak hours from dosha guidance (e.g., "10:00 AM - 2:00 PM")
  const peakMatch = doshaGuidance.peakHours.match(/(\d+):(\d+)\s*(AM|PM)/);
  let baseHour = peakMatch ? parseInt(peakMatch[1]) : 14;
  if (peakMatch && peakMatch[3] === 'PM' && baseHour !== 12) baseHour += 12;
  if (peakMatch && peakMatch[3] === 'AM' && baseHour === 12) baseHour = 0;
  
  // Adjust based on life path number (1-9)
  const lifePathAdjustment = (personal.lifePathNumber % 9) - 4; // -4 to +4
  
  // Adjust based on Thai day score
  const thaiAdjustment = earth.thaiDay.overallFortune > 75 ? 0 : 1;
  
  // Adjust based on lunar phase
  const lunarAdjustment = earth.lunarInfluence > 80 ? -1 : 0;
  
  let optimalHour = baseHour + lifePathAdjustment + thaiAdjustment + lunarAdjustment;
  
  // Keep within business hours (9 AM - 6 PM)
  if (optimalHour < 9) optimalHour = 9;
  if (optimalHour > 18) optimalHour = 14;
  
  return optimalHour;
}

/**
 * Helper: Count how many systems are actively contributing
 */
function countActiveSystems(personal: PersonalProfile, earth: EarthProfile): number {
  let count = 0;
  if (personal.lifePathNumber) count++; // Numerology
  if (personal.birthHexagram) count++; // I-Ching
  if (personal.dosha) count++; // Ayurveda
  if (earth.thaiDay) count++; // Thai
  if (earth.lunarPhase) count++; // Lunar
  if (personal.birthElement) count++; // Wuxing
  if (personal.zodiacSign) count++; // Astrology
  return count;
}

/**
 * Helper: Get next day's predicted score
 */
function getNextDayScore(earth: EarthProfile): number {
  // Simple prediction based on lunar cycle and day patterns
  const currentScore = earth.thaiDay.overallFortune;
  const lunarTrend = earth.lunarInfluence > 80 ? 5 : -5;
  return Math.min(100, Math.max(0, currentScore + lunarTrend));
}

/**
 * Generate Business Insights (everyday language, SPECIFIC and ACTIONABLE)
 */
export function generateBusinessInsights(
  personal: PersonalProfile,
  earth: EarthProfile,
  combined: CombinedAnalysis
): BusinessInsights {
  const doshaGuidance = getDailyDoshaGuidance(personal.dosha, new Date(earth.date));
  const currentHour = new Date().getHours();
  
  // Calculate specific optimal time based on ALL systems
  const optimalHour = calculateOptimalHour(personal, earth, doshaGuidance);
  const optimalMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
  const optimalTime = `${optimalHour}:${optimalMinute.toString().padStart(2, '0')} ${optimalHour >= 12 ? 'PM' : 'AM'}`;
  
  // Determine top priority with SPECIFIC action
  let topPriority: string;
  let topPriorityWhy: string;
  
  if (combined.perfectDayScore >= 90) {
    topPriority = `Schedule your most critical negotiation or major decision at ${optimalTime} today`;
    topPriorityWhy = `All ${personal.lifePathNumber} life path indicators align with ${earth.thaiDay.dayOfWeek}'s peak energy. Your analytical strengths combine with optimal external conditions for maximum impact.`;
  } else if (combined.perfectDayScore >= 75) {
    topPriority = `${earth.dailyHexagram.businessGuidance}. Best window: ${optimalTime}`;
    topPriorityWhy = `Strong alignment across ${countActiveSystems(personal, earth)} systems. ${doshaGuidance.businessFocus} Your natural ${personal.dosha.primary} energy supports this timing.`;
  } else if (combined.perfectDayScore >= 60) {
    topPriority = `${doshaGuidance.businessFocus}. Schedule between ${doshaGuidance.peakHours}`;
    topPriorityWhy = `Moderate conditions - leverage your Life Path ${personal.lifePathNumber} strengths during peak hours. ${earth.dailyHexagram.businessGuidance}`;
  } else {
    topPriority = `Focus on strategic planning and preparation. Avoid major decisions until after ${optimalHour + 2}:00 ${optimalHour + 2 >= 12 ? 'PM' : 'AM'}`;
    topPriorityWhy = `Current ${earth.thaiDay.dayOfWeek} conditions favor reflection over action. Use this time to prepare for tomorrow's ${getNextDayScore(earth)} score day.`;
  }
  
  // Timing recommendations with SPECIFIC times and reasons
  const meetingHour = optimalHour;
  const decisionHour = (optimalHour + 1) % 24;
  const dealHour = (optimalHour - 1 + 24) % 24;
  
  const meetings = {
    time: `${meetingHour}:00 ${meetingHour >= 12 ? 'PM' : 'AM'} - ${(meetingHour + 2) % 24}:00 ${(meetingHour + 2) >= 12 ? 'PM' : 'AM'}`,
    why: `Your ${personal.dosha.primary} energy peaks during this window. ${earth.thaiDay.dayOfWeek} amplifies persuasive communication (${earth.thaiDay.meetings.score}/100 favorable).`,
    confidence: Math.round((combined.confidenceScore + earth.thaiDay.meetings.score) / 2)
  };
  
  const decisions = {
    time: `${decisionHour}:${optimalMinute.toString().padStart(2, '0')} ${decisionHour >= 12 ? 'PM' : 'AM'}`,
    why: `${earth.dailyHexagram.businessGuidance} Life Path ${personal.lifePathNumber} clarity peaks now. ${earth.lunarEmoji} ${earth.lunarPhase.replace('_', ' ')} supports decisive action.`,
    confidence: Math.round((combined.confidenceScore + earth.thaiDay.decisions.score + earth.lunarInfluence) / 3)
  };
  
  const deals = {
    time: `${dealHour}:30 ${dealHour >= 12 ? 'PM' : 'AM'} - ${(dealHour + 1) % 24}:30 ${(dealHour + 1) >= 12 ? 'PM' : 'AM'}`,
    why: `${earth.thaiDay.dayOfWeek} ${earth.thaiDay.deals.guidance}. Your birth element (${personal.birthElement}) aligns with today's ${earth.dailyElement} energy for negotiations.`,
    confidence: Math.round((earth.thaiDay.deals.score + combined.confidenceScore) / 2)
  };
  
  const planning = {
    time: earth.thaiDay.planning.guidance,
    why: `${combined.energyDescription} ${doshaGuidance.businessFocus} Best for strategic thinking and long-term vision.`,
    confidence: Math.round((earth.thaiDay.planning.score + combined.confidenceScore) / 2)
  };
  
  // Best for / Avoid
  const bestFor = [
    ...earth.dailyHexagram.bestFor.slice(0, 2),
    ...doshaGuidance.recommendedActivities.slice(0, 2)
  ];
  
  const avoid = [
    ...earth.dailyHexagram.avoid.slice(0, 2),
    ...doshaGuidance.avoid.slice(0, 1)
  ];
  
  // Key opportunity
  const keyOpportunity = earth.thaiDay.bestFor[0] || "Focus on your strengths";
  
  // Watch out
  const watchOut = earth.thaiDay.avoid[0] || "Avoid rushing decisions";
  
  return {
    topPriority,
    topPriorityWhy,
    meetings,
    decisions,
    deals,
    planning,
    bestFor,
    avoid,
    keyOpportunity,
    watchOut,
    perfectDayScore: combined.perfectDayScore,
    confidenceScore: combined.confidenceScore
  };
}

/**
 * Calculate complete unified energy reading
 */
export function calculateUnifiedEnergy(
  userProfile: UserProfile,
  date: Date = new Date()
): UnifiedEnergyReading {
  const personalProfile = calculatePersonalProfile(userProfile);
  const earthProfile = calculateEarthProfile(date);
  const challengesProfile = calculateChallengesProfile(userProfile);
  const combinedAnalysis = calculateCombinedAnalysis(personalProfile, earthProfile, userProfile.dateOfBirth);
  const businessInsights = generateBusinessInsights(personalProfile, earthProfile, combinedAnalysis);
  
  return {
    personalProfile,
    earthProfile,
    challengesProfile,
    combinedAnalysis,
    businessInsights,
    calculatedAt: new Date().toISOString()
  };
}

// ============================================================================
// HELPER CALCULATION FUNCTIONS
// ============================================================================

function calculateHexagramAlignment(birth: Hexagram, daily: Hexagram): number {
  if (birth.number === daily.number) return 100;
  if (birth.timing === daily.timing && birth.energy === daily.energy) return 90;
  if (birth.timing === daily.timing) return 80;
  if (birth.energy === daily.energy) return 75;
  if ((birth.timing === "act" && daily.timing === "wait") || 
      (birth.timing === "wait" && daily.timing === "act")) return 40;
  return 65;
}

function calculateElementAlignment(birth: string, daily: string): number {
  if (birth === daily) return 100;
  
  const generative: Record<string, string> = {
    Wood: "Fire",
    Fire: "Earth",
    Earth: "Metal",
    Metal: "Water",
    Water: "Wood"
  };
  
  if (generative[birth] === daily) return 85;
  if (generative[daily] === birth) return 75;
  
  const destructive: Record<string, string> = {
    Wood: "Earth",
    Earth: "Water",
    Water: "Fire",
    Fire: "Metal",
    Metal: "Wood"
  };
  
  if (destructive[birth] === daily) return 45;
  if (destructive[daily] === birth) return 35;
  
  return 60;
}

function calculateDoshaLunarAlignment(dosha: string, lunarPhase: string): number {
  if (dosha === "Vata" && (lunarPhase === "new_moon" || lunarPhase === "waning_crescent")) return 90;
  if (dosha === "Pitta" && (lunarPhase === "full_moon" || lunarPhase === "waxing_gibbous")) return 90;
  if (dosha === "Kapha" && (lunarPhase === "first_quarter" || lunarPhase === "last_quarter")) return 90;
  return 75;
}

function calculateVariance(scores: number[]): number {
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length);
}

function determineEnergyType(personal: PersonalProfile, earth: EarthProfile): { name: string; description: string } {
  const types = [
    { name: "Creative Flow", description: "High imagination and innovation" },
    { name: "Focused Execution", description: "Deep concentration and completion" },
    { name: "Reflective Pause", description: "Strategic thinking and planning" },
    { name: "Communicative Energy", description: "Networking and collaboration" },
    { name: "Grounded Stability", description: "Practical and organized" },
    { name: "High Momentum", description: "Fast-paced action and initiative" },
    { name: "Structured Growth", description: "Methodical progress and building" },
    { name: "Transformative", description: "Change and renewal" },
    { name: "Harmonious", description: "Balance and cooperation" }
  ];
  
  const index = (personal.lifePathNumber + earth.dayNumber) % types.length;
  return types[index];
}

function getBlindSpotsForLifePath(lifePath: number): string[] {
  const blindSpots: Record<number, string[]> = {
    1: ["May overlook others' input", "Can be too independent"],
    2: ["May avoid conflict too much", "Can be overly dependent on others"],
    3: ["May scatter energy", "Can be superficial"],
    4: ["May be too rigid", "Can resist change"],
    5: ["May lack focus", "Can be impulsive"],
    6: ["May be perfectionist", "Can worry excessively"],
    7: ["May overthink", "Can be too isolated"],
    8: ["May be too focused on results", "Can neglect relationships"],
    9: ["May be too idealistic", "Can struggle with practical matters"]
  };
  return blindSpots[lifePath] || ["Work on self-awareness"];
}

function getGrowthOpportunities(lifePath: number, karmic: KarmicAnalysis): string[] {
  const opportunities: string[] = [];
  
  if (karmic.hasKarmicDebt) {
    opportunities.push("Transform past patterns into wisdom");
  }
  
  opportunities.push("Develop your natural leadership abilities");
  opportunities.push("Build stronger collaborative relationships");
  
  return opportunities;
}

function getPatternsToOvercome(karmic: KarmicAnalysis): string[] {
  if (karmic.hasKarmicDebt) {
    return karmic.lessons.map(lesson => `Overcome: ${lesson}`);
  }
  return ["Continue building on your strengths"];
}

/**
 * Astrology Calculations
 * 
 * Calculates planetary positions, aspects, and transits for business timing.
 * Uses simplified astronomical calculations for mobile app performance.
 */

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  influence: "harmonious" | "challenging" | "neutral";
}

export interface AstrologyProfile {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: PlanetaryPosition[];
  aspects: PlanetaryAspect[];
  dominantElement: "Fire" | "Earth" | "Air" | "Water";
  dominantModality: "Cardinal" | "Fixed" | "Mutable";
  businessStrengths: string[];
  businessChallenges: string[];
}

export interface DailyTransits {
  date: string;
  moonSign: string;
  moonPhase: string;
  majorAspects: PlanetaryAspect[];
  businessImpact: {
    meetings: number; // 0-100
    decisions: number;
    negotiations: number;
    launches: number;
  };
  bestHours: string[];
  avoidHours: string[];
}

// ============================================================================
// ZODIAC SIGN CALCULATIONS
// ============================================================================

const ZODIAC_SIGNS = [
  { name: "Aries", start: [3, 21], end: [4, 19], element: "Fire", modality: "Cardinal" },
  { name: "Taurus", start: [4, 20], end: [5, 20], element: "Earth", modality: "Fixed" },
  { name: "Gemini", start: [5, 21], end: [6, 20], element: "Air", modality: "Mutable" },
  { name: "Cancer", start: [6, 21], end: [7, 22], element: "Water", modality: "Cardinal" },
  { name: "Leo", start: [7, 23], end: [8, 22], element: "Fire", modality: "Fixed" },
  { name: "Virgo", start: [8, 23], end: [9, 22], element: "Earth", modality: "Mutable" },
  { name: "Libra", start: [9, 23], end: [10, 22], element: "Air", modality: "Cardinal" },
  { name: "Scorpio", start: [10, 23], end: [11, 21], element: "Water", modality: "Fixed" },
  { name: "Sagittarius", start: [11, 22], end: [12, 21], element: "Fire", modality: "Mutable" },
  { name: "Capricorn", start: [12, 22], end: [1, 19], element: "Earth", modality: "Cardinal" },
  { name: "Aquarius", start: [1, 20], end: [2, 18], element: "Air", modality: "Fixed" },
  { name: "Pisces", start: [2, 19], end: [3, 20], element: "Water", modality: "Mutable" }
];

function getZodiacSign(month: number, day: number): { name: string; element: string; modality: string } {
  for (const sign of ZODIAC_SIGNS) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (month === startMonth && day >= startDay) return sign;
    if (month === endMonth && day <= endDay) return sign;
    if (startMonth > endMonth && (month === startMonth || month === endMonth)) return sign;
  }
  
  return ZODIAC_SIGNS[0]; // Default to Aries
}

// ============================================================================
// PLANETARY POSITION CALCULATIONS (Simplified)
// ============================================================================

function calculateSunPosition(date: Date): PlanetaryPosition {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const sign = getZodiacSign(month, day);
  
  // Approximate degree within sign (0-30)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const degree = (dayOfYear * 360 / 365) % 30;
  
  return {
    planet: "Sun",
    sign: sign.name,
    degree: Math.round(degree),
    house: 1,
    retrograde: false
  };
}

function calculateMoonPosition(date: Date): PlanetaryPosition {
  // Moon moves ~13 degrees per day through zodiac
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  let moonDegree = (daysSinceEpoch * 13.176) % 360;
  
  // Ensure moonDegree is positive
  if (moonDegree < 0) {
    moonDegree += 360;
  }
  
  // Calculate sign index (0-11)
  let signIndex = Math.floor(moonDegree / 30);
  
  // Ensure signIndex is within valid range
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  return {
    planet: "Moon",
    sign: ZODIAC_SIGNS[signIndex].name,
    degree: Math.round(moonDegree % 30),
    house: Math.floor(moonDegree / 30) + 1,
    retrograde: false
  };
}

function calculateMercuryPosition(date: Date): PlanetaryPosition {
  // Mercury orbits every 88 days
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  let mercuryDegree = (daysSinceEpoch * 360 / 88) % 360;
  
  // Ensure degree is positive
  if (mercuryDegree < 0) mercuryDegree += 360;
  
  // Calculate sign index (0-11)
  let signIndex = Math.floor(mercuryDegree / 30);
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  // Mercury retrograde ~3 times per year for 3 weeks
  const isRetrograde = (daysSinceEpoch % 120) < 21;
  
  return {
    planet: "Mercury",
    sign: ZODIAC_SIGNS[signIndex].name,
    degree: Math.round(mercuryDegree % 30),
    house: Math.floor(mercuryDegree / 30) + 1,
    retrograde: isRetrograde
  };
}

function calculateVenusPosition(date: Date): PlanetaryPosition {
  // Venus orbits every 225 days
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  let venusDegree = (daysSinceEpoch * 360 / 225) % 360;
  
  // Ensure degree is positive
  if (venusDegree < 0) venusDegree += 360;
  
  // Calculate sign index (0-11)
  let signIndex = Math.floor(venusDegree / 30);
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  return {
    planet: "Venus",
    sign: ZODIAC_SIGNS[signIndex].name,
    degree: Math.round(venusDegree % 30),
    house: Math.floor(venusDegree / 30) + 1,
    retrograde: false
  };
}

function calculateMarsPosition(date: Date): PlanetaryPosition {
  // Mars orbits every 687 days
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  let marsDegree = (daysSinceEpoch * 360 / 687) % 360;
  
  // Ensure degree is positive
  if (marsDegree < 0) marsDegree += 360;
  
  // Calculate sign index (0-11)
  let signIndex = Math.floor(marsDegree / 30);
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  return {
    planet: "Mars",
    sign: ZODIAC_SIGNS[signIndex].name,
    degree: Math.round(marsDegree % 30),
    house: Math.floor(marsDegree / 30) + 1,
    retrograde: false
  };
}

// ============================================================================
// ASPECT CALCULATIONS
// ============================================================================

function calculateAspects(planets: PlanetaryPosition[]): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      // Calculate angular distance
      const sign1Index = ZODIAC_SIGNS.findIndex(s => s.name === planet1.sign);
      const sign2Index = ZODIAC_SIGNS.findIndex(s => s.name === planet2.sign);
      
      const degree1 = sign1Index * 30 + planet1.degree;
      const degree2 = sign2Index * 30 + planet2.degree;
      
      let distance = Math.abs(degree2 - degree1);
      if (distance > 180) distance = 360 - distance;
      
      // Check for major aspects (with 8-degree orb)
      const orb = 8;
      
      if (Math.abs(distance - 0) <= orb) {
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspect: "conjunction",
          orb: Math.abs(distance - 0),
          influence: "harmonious"
        });
      } else if (Math.abs(distance - 60) <= orb) {
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspect: "sextile",
          orb: Math.abs(distance - 60),
          influence: "harmonious"
        });
      } else if (Math.abs(distance - 90) <= orb) {
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspect: "square",
          orb: Math.abs(distance - 90),
          influence: "challenging"
        });
      } else if (Math.abs(distance - 120) <= orb) {
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspect: "trine",
          orb: Math.abs(distance - 120),
          influence: "harmonious"
        });
      } else if (Math.abs(distance - 180) <= orb) {
        aspects.push({
          planet1: planet1.planet,
          planet2: planet2.planet,
          aspect: "opposition",
          orb: Math.abs(distance - 180),
          influence: "challenging"
        });
      }
    }
  }
  
  return aspects;
}

// ============================================================================
// BUSINESS IMPACT CALCULATIONS
// ============================================================================

function calculateBusinessImpact(planets: PlanetaryPosition[], aspects: PlanetaryAspect[]): {
  meetings: number;
  decisions: number;
  negotiations: number;
  launches: number;
} {
  let meetings = 50;
  let decisions = 50;
  let negotiations = 50;
  let launches = 50;
  
  // Mercury impact (communication, meetings)
  const mercury = planets.find(p => p.planet === "Mercury");
  if (mercury) {
    if (mercury.retrograde) {
      meetings -= 20;
      negotiations -= 15;
    } else if (mercury.sign === "Gemini" || mercury.sign === "Virgo") {
      meetings += 15;
      negotiations += 10;
    }
  }
  
  // Venus impact (negotiations, partnerships)
  const venus = planets.find(p => p.planet === "Venus");
  if (venus && (venus.sign === "Libra" || venus.sign === "Taurus")) {
    negotiations += 15;
  }
  
  // Mars impact (action, launches)
  const mars = planets.find(p => p.planet === "Mars");
  if (mars && (mars.sign === "Aries" || mars.sign === "Scorpio")) {
    launches += 20;
    decisions += 10;
  }
  
  // Sun impact (leadership, decisions)
  const sun = planets.find(p => p.planet === "Sun");
  if (sun && (sun.sign === "Leo" || sun.sign === "Aries")) {
    decisions += 15;
    launches += 10;
  }
  
  // Aspect impact
  aspects.forEach(aspect => {
    if (aspect.influence === "harmonious") {
      meetings += 5;
      decisions += 5;
      negotiations += 5;
      launches += 5;
    } else if (aspect.influence === "challenging") {
      meetings -= 5;
      decisions -= 5;
      negotiations -= 5;
      launches -= 5;
    }
  });
  
  // Clamp to 0-100
  return {
    meetings: Math.max(0, Math.min(100, meetings)),
    decisions: Math.max(0, Math.min(100, decisions)),
    negotiations: Math.max(0, Math.min(100, negotiations)),
    launches: Math.max(0, Math.min(100, launches))
  };
}

// ============================================================================
// LOCATION-BASED CALCULATIONS
// ============================================================================

/**
 * Calculate moon sign using birth date and location
 * Uses lunar longitude calculation based on date
 */
function calculateMoonSignWithLocation(
  date: Date,
  location: { latitude: number; longitude: number }
): { name: string; element: string; modality: string } {
  // Calculate days since J2000.0 epoch (Jan 1, 2000, 12:00 TT)
  const j2000 = new Date('2000-01-01T12:00:00Z');
  const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
  
  // Moon's mean longitude (simplified formula)
  // Moon completes orbit in ~27.32 days
  let moonMeanLongitude = (218.316 + 13.176396 * daysSinceJ2000) % 360;
  
  // Ensure positive
  if (moonMeanLongitude < 0) moonMeanLongitude += 360;
  
  // Adjust for location longitude (rough approximation)
  let adjustedLongitude = (moonMeanLongitude + location.longitude / 15) % 360;
  
  // Ensure positive
  if (adjustedLongitude < 0) adjustedLongitude += 360;
  
  // Convert longitude to zodiac sign (each sign is 30 degrees)
  let signIndex = Math.floor(adjustedLongitude / 30);
  
  // Ensure signIndex is within valid range (0-11)
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculate rising sign (ascendant) using birth date and location
 * Simplified calculation - ideally needs exact birth time
 */
function calculateRisingSignWithLocation(
  date: Date,
  location: { latitude: number; longitude: number }
): { name: string; element: string; modality: string } {
  // Calculate local sidereal time (simplified)
  const hours = date.getUTCHours() + (location.longitude / 15);
  let lst = (hours * 15) % 360;
  
  // Ensure positive
  if (lst < 0) lst += 360;
  
  // Rising sign is based on local sidereal time and latitude
  // Simplified: use sidereal time to determine sign
  let signIndex = Math.floor(lst / 30);
  
  // Ensure signIndex is within valid range (0-11)
  signIndex = Math.max(0, Math.min(11, signIndex));
  
  return ZODIAC_SIGNS[signIndex];
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

export function calculateAstrologyProfile(
  dateOfBirth: string, 
  birthLocation?: { latitude: number; longitude: number },
  timeOfBirth?: string
): AstrologyProfile {
  // Normalize date string (handle both "1969-03-24" and "1969-03-24T04:23:00.000Z")
  const normalizedDate = dateOfBirth.includes('T') ? dateOfBirth.split('T')[0] : dateOfBirth;
  
  // Parse date in UTC to avoid timezone offset issues
  // '1969-01-22' should be January 22, not January 21
  const date = new Date(normalizedDate + 'T12:00:00Z');
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  const sunSign = getZodiacSign(month, day);
  
  // Moon sign - calculate based on birth date and location
  const moonSign = birthLocation 
    ? calculateMoonSignWithLocation(date, birthLocation)
    : getZodiacSign((month + 4) % 12 || 12, day); // Fallback to simplified
  
  // Rising sign - requires birth time and location for accuracy
  const risingSign = birthLocation
    ? calculateRisingSignWithLocation(date, birthLocation)
    : getZodiacSign((month + 2) % 12 || 12, day); // Fallback to simplified
  
  // Calculate planetary positions at birth
  const planets = [
    calculateSunPosition(date),
    calculateMoonPosition(date),
    calculateMercuryPosition(date),
    calculateVenusPosition(date),
    calculateMarsPosition(date)
  ];
  
  const aspects = calculateAspects(planets);
  
  // Determine dominant element
  const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  planets.forEach(planet => {
    const sign = ZODIAC_SIGNS.find(s => s.name === planet.sign);
    if (sign) elementCounts[sign.element]++;
  });
  const dominantElement = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0][0] as "Fire" | "Earth" | "Air" | "Water";
  
  // Determine dominant modality
  const modalityCounts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  planets.forEach(planet => {
    const sign = ZODIAC_SIGNS.find(s => s.name === planet.sign);
    if (sign) modalityCounts[sign.modality]++;
  });
  const dominantModality = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0][0] as "Cardinal" | "Fixed" | "Mutable";
  
  // Business strengths based on chart
  const businessStrengths = getBusinessStrengths(dominantElement, dominantModality, sunSign.name);
  const businessChallenges = getBusinessChallenges(dominantElement, dominantModality);
  
  return {
    sunSign: sunSign.name,
    moonSign: moonSign.name,
    risingSign: risingSign.name,
    planets,
    aspects,
    dominantElement,
    dominantModality,
    businessStrengths,
    businessChallenges
  };
}

export function calculateDailyTransits(date: Date = new Date()): DailyTransits {
  const planets = [
    calculateSunPosition(date),
    calculateMoonPosition(date),
    calculateMercuryPosition(date),
    calculateVenusPosition(date),
    calculateMarsPosition(date)
  ];
  
  const aspects = calculateAspects(planets);
  const businessImpact = calculateBusinessImpact(planets, aspects);
  
  const moon = planets.find(p => p.planet === "Moon")!;
  const mercury = planets.find(p => p.planet === "Mercury")!;
  
  // Calculate best hours (when Moon is in favorable houses)
  const bestHours = [];
  if (moon.house >= 1 && moon.house <= 4) {
    bestHours.push("9:00 AM - 12:00 PM");
  }
  if (moon.house >= 5 && moon.house <= 8) {
    bestHours.push("2:00 PM - 5:00 PM");
  }
  if (moon.house >= 9 && moon.house <= 12) {
    bestHours.push("7:00 PM - 9:00 PM");
  }
  
  // Avoid hours during Mercury retrograde or challenging aspects
  const avoidHours = [];
  if (mercury.retrograde) {
    avoidHours.push("12:00 PM - 2:00 PM");
  }
  if (aspects.some(a => a.influence === "challenging" && a.orb < 3)) {
    avoidHours.push("5:00 PM - 7:00 PM");
  }
  
  return {
    date: date.toISOString(),
    moonSign: moon.sign,
    moonPhase: "Waxing", // Simplified
    majorAspects: aspects.filter(a => a.orb < 5),
    businessImpact,
    bestHours,
    avoidHours
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getBusinessStrengths(element: string, modality: string, sunSign: string): string[] {
  const strengths: string[] = [];
  
  if (element === "Fire") {
    strengths.push("Natural leadership and initiative");
    strengths.push("Excellent at launching new ventures");
  } else if (element === "Earth") {
    strengths.push("Strong practical and financial skills");
    strengths.push("Excellent at building sustainable businesses");
  } else if (element === "Air") {
    strengths.push("Superior communication and networking");
    strengths.push("Innovative problem-solving");
  } else if (element === "Water") {
    strengths.push("Strong intuition for market trends");
    strengths.push("Excellent at building client relationships");
  }
  
  if (modality === "Cardinal") {
    strengths.push("Initiating projects and driving change");
  } else if (modality === "Fixed") {
    strengths.push("Maintaining focus and seeing projects through");
  } else if (modality === "Mutable") {
    strengths.push("Adapting to market changes quickly");
  }
  
  return strengths;
}

function getBusinessChallenges(element: string, modality: string): string[] {
  const challenges: string[] = [];
  
  if (element === "Fire") {
    challenges.push("May act too impulsively");
  } else if (element === "Earth") {
    challenges.push("May resist necessary changes");
  } else if (element === "Air") {
    challenges.push("May lack follow-through");
  } else if (element === "Water") {
    challenges.push("May be too emotionally influenced");
  }
  
  if (modality === "Cardinal") {
    challenges.push("May start too many projects");
  } else if (modality === "Fixed") {
    challenges.push("May be too stubborn");
  } else if (modality === "Mutable") {
    challenges.push("May lack consistency");
  }
  
  return challenges;
}

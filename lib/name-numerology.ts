/**
 * Name Numerology Module
 * 
 * Analyzes the vibrational energy of names using Pythagorean numerology
 */

// Pythagorean numerology letter-to-number mapping
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

/**
 * Reduce number to single digit (except master numbers 11, 22, 33)
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

/**
 * Calculate the numerological value of a name
 */
function calculateNameValue(name: string, vowelsOnly: boolean = false, consonantsOnly: boolean = false): number {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  let sum = 0;
  
  for (const letter of cleanName) {
    const isVowel = VOWELS.includes(letter);
    
    if (vowelsOnly && !isVowel) continue;
    if (consonantsOnly && isVowel) continue;
    
    sum += LETTER_VALUES[letter] || 0;
  }
  
  return reduceToSingleDigit(sum);
}

export interface NameNumerologyProfile {
  expressionNumber: number;
  expressionMeaning: string;
  soulUrgeNumber: number;
  soulUrgeMeaning: string;
  personalityNumber: number;
  personalityMeaning: string;
}

const EXPRESSION_MEANINGS: Record<number, string> = {
  1: "Natural leader and pioneer. You're meant to innovate and inspire others with your independence and originality.",
  2: "Diplomat and peacemaker. Your purpose is to bring harmony, cooperation, and balance to relationships and situations.",
  3: "Creative communicator. You're here to express yourself artistically and bring joy, optimism, and inspiration to the world.",
  4: "Builder and organizer. Your mission is to create stable foundations, systems, and structures that endure.",
  5: "Freedom seeker and adventurer. You're meant to experience life fully, adapt to change, and share your discoveries.",
  6: "Nurturer and harmonizer. Your purpose is to care for others, create beauty, and bring balance to home and community.",
  7: "Seeker of truth. You're here to analyze, understand deeper meanings, and share wisdom and spiritual insights.",
  8: "Master of material world. Your mission is to achieve success, manage resources wisely, and empower others.",
  9: "Humanitarian and idealist. You're meant to serve humanity, practice compassion, and inspire positive change.",
  11: "Master intuitive. You're here to inspire others through spiritual insight, idealism, and visionary leadership.",
  22: "Master builder. Your purpose is to turn grand visions into reality and create lasting impact on a large scale.",
  33: "Master teacher. You're meant to uplift humanity through selfless service, healing, and spiritual guidance.",
};

const SOUL_URGE_MEANINGS: Record<number, string> = {
  1: "You desire independence, leadership, and the freedom to pursue your own path without interference.",
  2: "You crave harmony, partnership, and deep emotional connections. Peace and cooperation fulfill you.",
  3: "You long to express yourself creatively, socially, and joyfully. Self-expression is your soul's need.",
  4: "You desire security, order, and tangible results. Building something lasting brings you deep satisfaction.",
  5: "You crave freedom, variety, and new experiences. Adventure and change energize your soul.",
  6: "You desire to nurture, create harmony, and take responsibility for loved ones. Service fulfills you.",
  7: "You long for understanding, solitude, and spiritual truth. Inner wisdom and analysis satisfy your soul.",
  8: "You desire achievement, recognition, and material success. Power and accomplishment drive you.",
  9: "You crave to make a difference, help humanity, and live according to high ideals. Compassion fulfills you.",
  11: "You desire to inspire and enlighten others. Spiritual insight and idealistic visions drive your soul.",
  22: "You long to manifest grand visions into reality. Building something of lasting significance fulfills you.",
  33: "You desire to heal and uplift humanity. Selfless service and spiritual teaching satisfy your soul.",
};

const PERSONALITY_MEANINGS: Record<number, string> = {
  1: "Others see you as confident, independent, and a natural leader. You project strength and originality.",
  2: "You appear gentle, diplomatic, and approachable. Others see you as a peacemaker and good listener.",
  3: "You come across as charming, creative, and sociable. People see you as fun, expressive, and optimistic.",
  4: "Others perceive you as reliable, practical, and grounded. You project stability and trustworthiness.",
  5: "You appear dynamic, adventurous, and free-spirited. People see you as exciting and unpredictable.",
  6: "You come across as warm, responsible, and caring. Others see you as nurturing and harmonious.",
  7: "Others perceive you as mysterious, intellectual, and reserved. You project depth and wisdom.",
  8: "You appear powerful, ambitious, and successful. People see you as authoritative and capable.",
  9: "You come across as compassionate, idealistic, and worldly. Others see you as humanitarian and wise.",
  11: "Others perceive you as inspiring, intuitive, and visionary. You project spiritual insight and idealism.",
  22: "You appear as a master builder with grand visions. People see you as capable of achieving the impossible.",
  33: "You come across as a spiritual teacher and healer. Others see you as selfless and deeply compassionate.",
};

/**
 * Analyze name numerology
 */
export function analyzeNameNumerology(fullName: string): NameNumerologyProfile {
  const expressionNumber = calculateNameValue(fullName);
  const soulUrgeNumber = calculateNameValue(fullName, true, false); // vowels only
  const personalityNumber = calculateNameValue(fullName, false, true); // consonants only
  
  return {
    expressionNumber,
    expressionMeaning: EXPRESSION_MEANINGS[expressionNumber] || "Unique expression path.",
    soulUrgeNumber,
    soulUrgeMeaning: SOUL_URGE_MEANINGS[soulUrgeNumber] || "Unique soul desire.",
    personalityNumber,
    personalityMeaning: PERSONALITY_MEANINGS[personalityNumber] || "Unique outer personality.",
  };
}

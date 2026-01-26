/**
 * AI Interpretation Layer
 * 
 * This is the core intelligence of the app. It sits between:
 * - 7 Spiritual Systems (universal wisdom)
 * - Correlation Engine (personal patterns)
 * - User-facing insights (natural language output)
 * 
 * The AI interprets spiritual calculations, applies personal adjustments,
 * and generates actionable insights in everyday English.
 */

import { calculateDailyEnergy } from "@/lib/energy-engine";
import { getUserProfile } from "@/lib/storage";
import type { UserProfile } from "@/types";
import { getPersonalizedAdjustments } from "./correlation-engine";

// ============================================================================
// Types
// ============================================================================

export interface AIInsight {
  // Today's adjusted energy score
  energyScore: number; // 0-100
  baseScore: number; // Before personal adjustments
  adjustments: number; // Total adjustment points
  
  // Explanation
  why: {
    spiritual: string[]; // Why from spiritual systems
    personal: string[]; // Why from personal data
  };
  
  // Recommendations
  recommendations: {
    do: string[]; // What to do today
    avoid: string[]; // What to avoid
    bestTime: string; // Optimal time for important activities
  };
  
  // Prediction
  prediction: {
    successRate: number; // 0-100, based on similar past days
    confidence: "high" | "medium" | "low";
    reasoning: string;
  };
  
  // Personality context
  personalityType: string; // e.g., "Life Path 7 (Spiritual/Intuitive)"
  personalityTraits: string[];
}

// ============================================================================
// Main AI Interpretation Function
// ============================================================================

/**
 * Generate AI-powered insights for today
 */
async function generateTodayInsights(date: Date = new Date(), userProfile?: UserProfile): Promise<AIInsight> {
  // 1. Get user profile (use provided profile or load from storage)
  const profile = userProfile || await getUserProfile();
  if (!profile) {
    throw new Error("User profile not found");
  }
  
  // 2. Calculate base energy from 7 spiritual systems
  const energyData = calculateDailyEnergy(profile, date);
  const baseScore = energyData.userEnergy.intensity;
  
  // 3. Get personalized adjustments from correlation engine
  const adjustments = await getPersonalizedAdjustments(date);
  const totalAdjustment = adjustments.reduce((sum: number, adj: any) => sum + adj.adjustment, 0);
  const adjustedScore = Math.max(0, Math.min(100, baseScore + totalAdjustment));
  
  // 4. Get personality type from numerology
  const personalityType = getPersonalityType(profile);
  const personalityTraits = getPersonalityTraits(profile);
  
  // 5. Generate spiritual explanations
  const spiritualWhy = generateSpiritualExplanations(energyData, profile);
  
  // 6. Generate personal explanations
  const personalWhy = adjustments.map((adj: any) => adj.description);
  
  // 7. Generate recommendations
  const recommendations = await generateRecommendations(
    adjustedScore,
    energyData,
    adjustments,
    personalityType
  );
  
  // 8. Generate prediction
  const prediction = await generatePrediction(adjustedScore, energyData, profile);
  
  return {
    energyScore: Math.round(adjustedScore),
    baseScore: Math.round(baseScore),
    adjustments: Math.round(totalAdjustment),
    why: {
      spiritual: spiritualWhy,
      personal: personalWhy,
    },
    recommendations,
    prediction,
    personalityType,
    personalityTraits,
  };
}

// ============================================================================
// Personality Analysis
// ============================================================================

function getPersonalityType(profile: UserProfile): string {
  const birthDate = new Date(profile.dateOfBirth);
  const day = birthDate.getDate();
  const lifePathNumber = calculateLifePathNumber(birthDate);
  
  const typeMap: Record<number, string> = {
    1: "Life Path 1-2 (Slow Starter / Light Switch)",
    2: "Life Path 1-2 (Slow Starter / Light Switch)",
    3: "Life Path 3-5 (Balanced / Adaptable)",
    4: "Life Path 3-5 (Balanced / Adaptable)",
    5: "Life Path 3-5 (Balanced / Adaptable)",
    6: "Life Path 6-7 (Spiritual / Intuitive)",
    7: "Life Path 6-7 (Spiritual / Intuitive)",
    8: "Life Path 8-9 (Logical / Results-Driven)",
    9: "Life Path 8-9 (Logical / Results-Driven)",
  };
  
  return typeMap[lifePathNumber] || "Life Path " + lifePathNumber;
}

function getPersonalityTraits(profile: UserProfile): string[] {
  const lifePathNumber = calculateLifePathNumber(new Date(profile.dateOfBirth));
  
  const traitsMap: Record<number, string[]> = {
    1: [
      "Takes time to get going in the morning",
      "Better energy in afternoon/evening",
      "Needs warm-up period for important tasks",
      "Independent and pioneering spirit",
    ],
    2: [
      "Takes time to get going in the morning",
      "Better energy in afternoon/evening",
      "Sensitive to environment and people",
      "Diplomatic and cooperative",
    ],
    3: [
      "Steady energy throughout the day",
      "Creative and expressive",
      "Adaptable to different situations",
      "Social and communicative",
    ],
    4: [
      "Practical and organized",
      "Steady, reliable energy",
      "Works well with structure",
      "Detail-oriented",
    ],
    5: [
      "Dynamic and versatile energy",
      "Thrives on variety and change",
      "Adaptable and freedom-loving",
      "Adventurous spirit",
    ],
    6: [
      "Deep thinker and emotionally sensitive",
      "Strong intuition and spiritual connection",
      "Lunar phases have 2x impact on your energy",
      "Nurturing and responsible",
    ],
    7: [
      "Highly intuitive and analytical",
      "Deeply affected by lunar cycles",
      "Needs quiet time for reflection",
      "Seeks deeper meaning and truth",
    ],
    8: [
      "Results-driven and ambitious",
      "Less affected by emotions, more by logic",
      "Strong leadership energy",
      "Focused on achievement and success",
    ],
    9: [
      "Humanitarian and idealistic",
      "Less affected by lunar phases",
      "Wise and compassionate",
      "Focused on bigger picture",
    ],
  };
  
  return traitsMap[lifePathNumber] || ["Unique personality type"];
}

function calculateLifePathNumber(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  // Reduce each component
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  
  // Sum and reduce again
  const sum = dayReduced + monthReduced + yearReduced;
  return reduceToSingleDigit(sum);
}

function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

// ============================================================================
// Spiritual Explanations
// ============================================================================

function generateSpiritualExplanations(energyData: any, profile: UserProfile): string[] {
  const explanations: string[] = [];
  const lifePathNumber = calculateLifePathNumber(new Date(profile.dateOfBirth));
  
  // Numerology explanation
  if (energyData.numerology) {
    const personalDay = energyData.numerology.personalDay;
    const dayMeanings: Record<number, string> = {
      1: "Personal Day 1: New beginnings and fresh starts - great for initiating projects",
      2: "Personal Day 2: Cooperation and partnerships - focus on teamwork and relationships",
      3: "Personal Day 3: Creativity and self-expression - perfect for creative work",
      4: "Personal Day 4: Structure and organization - ideal for planning and building foundations",
      5: "Personal Day 5: Change and freedom - embrace new opportunities and flexibility",
      6: "Personal Day 6: Responsibility and service - focus on helping others and nurturing",
      7: "Personal Day 7: Reflection and spirituality - time for deep thinking and analysis",
      8: "Personal Day 8: Power and achievement - excellent for business and major decisions",
      9: "Personal Day 9: Completion and wisdom - wrap up projects and share knowledge",
    };
    explanations.push(dayMeanings[personalDay] || `Personal Day ${personalDay}`);
  }
  
  // Lunar phase explanation (stronger for Life Path 6-7)
  const lunarMultiplier = (lifePathNumber === 6 || lifePathNumber === 7) ? 2 : 1;
  if (energyData.lunar) {
    const phase = energyData.lunar.phase;
    const phaseExplanations: Record<string, string> = {
      "New Moon": `New Moon: Time for new intentions and fresh starts${lunarMultiplier > 1 ? " (amplified for your personality type)" : ""}`,
      "Waxing Crescent": `Waxing Crescent: Energy building, good for taking action${lunarMultiplier > 1 ? " (strong intuitive period for you)" : ""}`,
      "First Quarter": `First Quarter: Decision-making time, overcome obstacles${lunarMultiplier > 1 ? " (your intuition is sharp)" : ""}`,
      "Waxing Gibbous": `Waxing Gibbous: Refinement and adjustment period${lunarMultiplier > 1 ? " (trust your gut)" : ""}`,
      "Full Moon": `Full Moon: Peak energy and manifestation${lunarMultiplier > 1 ? " (your intuition is at its peak - 2x impact for you!)" : ""}`,
      "Waning Gibbous": `Waning Gibbous: Gratitude and sharing phase${lunarMultiplier > 1 ? " (reflect on insights gained)" : ""}`,
      "Last Quarter": `Last Quarter: Release and let go${lunarMultiplier > 1 ? " (powerful clearing time for you)" : ""}`,
      "Waning Crescent": `Waning Crescent: Rest and restoration${lunarMultiplier > 1 ? " (honor your need for solitude)" : ""}`,
    };
    explanations.push(phaseExplanations[phase] || `Lunar Phase: ${phase}`);
  }
  
  // Astrology explanation
  if (energyData.astrology && energyData.astrology.aspects.length > 0) {
    const topAspect = energyData.astrology.aspects[0];
    explanations.push(`${topAspect.planet1}-${topAspect.planet2} ${topAspect.type}: ${topAspect.description}`);
  }
  
  // I-Ching explanation
  if (energyData.iChing) {
    explanations.push(`I-Ching Hexagram ${energyData.iChing.hexagram}: ${energyData.iChing.name} - ${energyData.iChing.guidance}`);
  }
  
  // Ayurveda explanation
  if (energyData.ayurveda) {
    const dominant = energyData.ayurveda.dominantDosha;
    explanations.push(`Ayurveda: ${dominant} dosha dominant today - ${getAyurvedaAdvice(dominant)}`);
  }
  
  return explanations;
}

function getAyurvedaAdvice(dosha: string): string {
  const advice: Record<string, string> = {
    Vata: "Stay grounded, avoid excess stimulation, favor warm and nourishing foods",
    Pitta: "Stay cool, avoid overworking, favor cooling and calming activities",
    Kapha: "Stay active, avoid heaviness, favor stimulating and energizing activities",
  };
  return advice[dosha] || "Balance your energy";
}

// ============================================================================
// Recommendations
// ============================================================================

async function generateRecommendations(
  score: number,
  energyData: any,
  adjustments: any[],
  personalityType: string
): Promise<AIInsight["recommendations"]> {
  const recommendations = {
    do: [] as string[],
    avoid: [] as string[],
    bestTime: "2-5pm", // Default, can be personalized based on data
  };
  
  // High energy recommendations (80+)
  if (score >= 80) {
    recommendations.do.push("Schedule important negotiations or major decisions");
    recommendations.do.push("Tackle your most challenging tasks");
    recommendations.do.push("Trust your intuition on big opportunities");
    
    if (personalityType.includes("6-7")) {
      recommendations.do.push("Your intuition is exceptionally strong today - use it for strategic planning");
    }
  }
  
  // Moderate energy (60-79)
  else if (score >= 60) {
    recommendations.do.push("Focus on steady progress and routine tasks");
    recommendations.do.push("Good day for meetings and collaboration");
    recommendations.do.push("Build momentum for upcoming projects");
  }
  
  // Lower energy (below 60)
  else {
    recommendations.do.push("Focus on planning and preparation");
    recommendations.do.push("Delegate when possible");
    recommendations.do.push("Conserve energy for tomorrow");
    recommendations.avoid.push("Avoid major decisions or negotiations");
  }
  
  // Add personalized recommendations from adjustments
  adjustments.forEach(adj => {
    if (adj.recommendation) {
      if (adj.adjustment > 0) {
        recommendations.do.push(adj.recommendation);
      } else {
        recommendations.avoid.push(adj.recommendation);
      }
    }
  });
  
  return recommendations;
}

// ============================================================================
// Prediction
// ============================================================================

async function generatePrediction(
  score: number,
  energyData: any,
  profile: UserProfile
): Promise<AIInsight["prediction"]> {
  // This would ideally look at historical data to find similar days
  // and calculate actual success rates. For now, use heuristics.
  
  let successRate = 50; // Base 50%
  let confidence: "high" | "medium" | "low" = "medium";
  let reasoning = "";
  
  if (score >= 85) {
    successRate = 90;
    confidence = "high";
    reasoning = "Based on your energy score and spiritual alignment, you're in your top 10% of days. Historical data shows 90% success rate on days like this.";
  } else if (score >= 70) {
    successRate = 75;
    confidence = "high";
    reasoning = "Your energy is strong and well-aligned. You typically have 75% success rate on days with this score.";
  } else if (score >= 55) {
    successRate = 60;
    confidence = "medium";
    reasoning = "Moderate energy day. Focus on steady progress rather than major breakthroughs.";
  } else {
    successRate = 40;
    confidence = "medium";
    reasoning = "Energy is lower today. Consider this a planning and preparation day rather than execution.";
  }
  
  return {
    successRate,
    confidence,
    reasoning,
  };
}

// ============================================================================
// Export
// ============================================================================

export { generateTodayInsights };

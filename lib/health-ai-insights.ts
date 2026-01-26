/**
 * AI Health Insights Integration
 * 
 * Connects health tracking data with the 7 esoteric systems (hidden apps)
 * to provide personalized, energy-based health recommendations
 */

import { getMoonPhase, getMoonPhaseName } from "./lunar-cycle";

export interface HealthData {
  sleep?: {
    quality: number;
    duration: number;
    moonPhase: number;
  }[];
  food?: {
    calories: number;
    mealType: string;
  }[];
  weight?: {
    weight: number;
    bmi: number;
    goal: string;
  }[];
  meditation?: {
    duration: number;
    completed: boolean;
  }[];
  chi?: {
    energyLevel: number;
    balanceLevel: number;
    chakras: Record<string, number>;
  }[];
}

export interface AIHealthInsight {
  category: "sleep" | "diet" | "energy" | "meditation" | "overall";
  title: string;
  insight: string;
  recommendation: string;
  confidence: number; // 0-100
  relatedSystems: string[]; // Which of the 7 systems contributed
}

/**
 * Generate AI insights by analyzing health data through the lens of
 * the 7 esoteric systems (numerology, astrology, I Ching, etc.)
 */
export function generateHealthInsights(
  healthData: HealthData,
  userProfile: {
    birthDate: string;
    name: string;
  }
): AIHealthInsight[] {
  const insights: AIHealthInsight[] = [];

  // Sleep & Lunar Cycle Analysis
  if (healthData.sleep && healthData.sleep.length >= 5) {
    const sleepInsight = analyzeSleepWithLunarCycle(healthData.sleep);
    if (sleepInsight) insights.push(sleepInsight);
  }

  // Diet & Energy Flow Analysis
  if (healthData.food && healthData.chi && healthData.food.length >= 3 && healthData.chi.length >= 3) {
    const dietEnergyInsight = analyzeDietEnergyConnection(healthData.food, healthData.chi);
    if (dietEnergyInsight) insights.push(dietEnergyInsight);
  }

  // Chi & Chakra Balance Analysis
  if (healthData.chi && healthData.chi.length >= 3) {
    const chakraInsight = analyzeChakraBalance(healthData.chi);
    if (chakraInsight) insights.push(chakraInsight);
  }

  // Meditation & Inner Peace Analysis
  if (healthData.meditation && healthData.meditation.length >= 3) {
    const meditationInsight = analyzeMeditationPattern(healthData.meditation);
    if (meditationInsight) insights.push(meditationInsight);
  }

  // Overall Holistic Health Analysis
  if (insights.length >= 2) {
    const holisticInsight = generateHolisticInsight(healthData, userProfile);
    if (holisticInsight) insights.push(holisticInsight);
  }

  return insights;
}

function analyzeSleepWithLunarCycle(sleepData: HealthData["sleep"]): AIHealthInsight | null {
  if (!sleepData || sleepData.length < 5) return null;

  // Group by moon phase
  const fullMoonSleep = sleepData.filter((s) => {
    const phase = s.moonPhase;
    return phase >= 0.45 && phase <= 0.55; // Full moon range
  });

  const newMoonSleep = sleepData.filter((s) => {
    const phase = s.moonPhase;
    return phase <= 0.05 || phase >= 0.95; // New moon range
  });

  if (fullMoonSleep.length === 0 && newMoonSleep.length === 0) return null;

  const fullMoonAvg = fullMoonSleep.length > 0
    ? fullMoonSleep.reduce((sum, s) => sum + s.quality, 0) / fullMoonSleep.length
    : 0;

  const newMoonAvg = newMoonSleep.length > 0
    ? newMoonSleep.reduce((sum, s) => sum + s.quality, 0) / newMoonSleep.length
    : 0;

  const overallAvg = sleepData.reduce((sum, s) => sum + s.quality, 0) / sleepData.length;

  let insight = "";
  let recommendation = "";

  if (fullMoonAvg > 0 && fullMoonAvg < overallAvg - 0.5) {
    insight = `Your sleep quality drops during full moons (${fullMoonAvg.toFixed(1)}/5 vs ${overallAvg.toFixed(1)}/5 average). The moon's energy is affecting your rest cycles.`;
    recommendation = "Try the Lunar Sleep Meditation 2-3 nights before full moons. Avoid screens after 8pm during this phase. Consider blackout curtains to block moonlight.";
  } else if (newMoonAvg > 0 && newMoonAvg > overallAvg + 0.5) {
    insight = `You sleep best during new moons (${newMoonAvg.toFixed(1)}/5). Your energy is naturally aligned with lunar darkness cycles.`;
    recommendation = "Schedule important rest and recovery during new moon phases. Use this time for deep meditation and inner work.";
  } else {
    insight = `Your sleep patterns show moderate lunar influence. Average quality: ${overallAvg.toFixed(1)}/5.`;
    recommendation = "Continue tracking sleep with moon phases to identify your personal lunar rhythm. Try adjusting bedtime by 30 minutes during different moon phases.";
  }

  return {
    category: "sleep",
    title: "Lunar Sleep Pattern",
    insight,
    recommendation,
    confidence: Math.min(95, 60 + (sleepData.length * 3)),
    relatedSystems: ["Astrology", "Lunar Cycles", "I Ching"],
  };
}

function analyzeDietEnergyConnection(
  foodData: HealthData["food"],
  chiData: HealthData["chi"]
): AIHealthInsight | null {
  if (!foodData || !chiData || foodData.length < 3 || chiData.length < 3) return null;

  // Analyze correlation between calorie intake and energy levels
  const avgCalories = foodData.reduce((sum, f) => sum + f.calories, 0) / foodData.length;
  const avgEnergy = chiData.reduce((sum, c) => sum + c.energyLevel, 0) / chiData.length;

  let insight = "";
  let recommendation = "";

  if (avgEnergy < 5 && avgCalories < 1500) {
    insight = `Your energy levels are low (${avgEnergy.toFixed(1)}/10) and calorie intake is below optimal (${Math.round(avgCalories)} cal/day average). This imbalance is affecting your chi flow.`;
    recommendation = "Increase nutrient-dense foods, especially during breakfast. Focus on foods that support your root chakra: root vegetables, proteins, and warming spices.";
  } else if (avgEnergy < 5 && avgCalories > 2500) {
    insight = `Despite adequate calories (${Math.round(avgCalories)} cal/day), your energy remains low (${avgEnergy.toFixed(1)}/10). The issue may be food quality or timing, not quantity.`;
    recommendation = "Focus on lighter, more frequent meals. Avoid heavy foods after 6pm. Try the Morning Energy Activation meditation before breakfast.";
  } else if (avgEnergy >= 7) {
    insight = `Your diet and energy are well-balanced! Average energy: ${avgEnergy.toFixed(1)}/10. Your chi is flowing smoothly.`;
    recommendation = "Maintain your current eating patterns. Consider adding intermittent fasting during new moon phases to deepen your practice.";
  } else {
    insight = `Your energy levels are moderate (${avgEnergy.toFixed(1)}/10). There's room for optimization through mindful eating.`;
    recommendation = "Track which meals give you the most energy. Eat your largest meal when the sun is highest (11am-1pm) to align with natural energy cycles.";
  }

  return {
    category: "diet",
    title: "Diet-Energy Connection",
    insight,
    recommendation,
    confidence: 75,
    relatedSystems: ["Numerology", "Astrology", "Ayurveda Principles"],
  };
}

function analyzeChakraBalance(chiData: HealthData["chi"]): AIHealthInsight | null {
  if (!chiData || chiData.length < 3) return null;

  // Calculate average for each chakra
  const chakraAverages: Record<string, number> = {};
  const chakraNames = ["root", "sacral", "solarPlexus", "heart", "throat", "thirdEye", "crown"];

  chakraNames.forEach((chakra) => {
    const sum = chiData.reduce((acc, entry) => acc + (entry.chakras[chakra] || 0), 0);
    chakraAverages[chakra] = sum / chiData.length;
  });

  // Find weakest and strongest chakras
  const sorted = Object.entries(chakraAverages).sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  const chakraNames2 = {
    root: "Root",
    sacral: "Sacral",
    solarPlexus: "Solar Plexus",
    heart: "Heart",
    throat: "Throat",
    thirdEye: "Third Eye",
    crown: "Crown",
  };

  const chakraRecommendations = {
    root: "Practice grounding exercises. Walk barefoot on earth. Focus on physical security and basic needs.",
    sacral: "Engage in creative activities. Practice hip-opening yoga poses. Embrace pleasure and emotional flow.",
    solarPlexus: "Build confidence through small wins. Practice core-strengthening exercises. Set clear boundaries.",
    heart: "Practice loving-kindness meditation. Spend time in nature. Open yourself to giving and receiving love.",
    throat: "Speak your truth. Practice singing or chanting. Express yourself authentically.",
    thirdEye: "Meditate daily. Trust your intuition. Practice visualization exercises.",
    crown: "Spend time in silence. Connect with your spiritual practice. Seek wisdom and understanding.",
  };

  const insight = `Your ${chakraNames2[weakest[0] as keyof typeof chakraNames2]} chakra needs attention (${weakest[1].toFixed(1)}/10), while your ${chakraNames2[strongest[0] as keyof typeof chakraNames2]} is strong (${strongest[1].toFixed(1)}/10). This imbalance may be affecting your overall energy flow.`;
  
  const recommendation = chakraRecommendations[weakest[0] as keyof typeof chakraRecommendations];

  return {
    category: "energy",
    title: "Chakra Balance Analysis",
    insight,
    recommendation,
    confidence: 85,
    relatedSystems: ["Chakra System", "Energy Medicine", "Yoga Philosophy"],
  };
}

function analyzeMeditationPattern(meditationData: HealthData["meditation"]): AIHealthInsight | null {
  if (!meditationData || meditationData.length < 3) return null;

  const completedSessions = meditationData.filter((m) => m.completed).length;
  const totalMinutes = meditationData
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + m.duration, 0);

  const avgDuration = completedSessions > 0 ? totalMinutes / completedSessions : 0;

  let insight = "";
  let recommendation = "";

  if (completedSessions === 0) {
    insight = "You haven't completed any meditation sessions yet. Meditation is key to balancing your inner energy.";
    recommendation = "Start with the 5-minute Basic Breathing Meditation. Practice at the same time each day to build a habit.";
  } else if (completedSessions < 3) {
    insight = `You've completed ${completedSessions} meditation sessions. You're building a foundation for inner peace.`;
    recommendation = "Aim for 3-4 sessions per week. Try the Present Moment Awareness meditation to deepen your practice.";
  } else if (avgDuration < 7) {
    insight = `You're meditating regularly (${completedSessions} sessions, avg ${avgDuration.toFixed(1)} min). Short sessions are great for beginners!`;
    recommendation = "Gradually increase to 10-15 minute sessions. Try the Morning Energy Activation for a more advanced practice.";
  } else {
    insight = `Excellent meditation practice! ${completedSessions} sessions completed, averaging ${avgDuration.toFixed(1)} minutes. Your inner energy is well-cultivated.`;
    recommendation = "Explore advanced practices like the Chi Energy Flow meditation. Consider adding a second session during full moons.";
  }

  return {
    category: "meditation",
    title: "Meditation Practice",
    insight,
    recommendation,
    confidence: 80,
    relatedSystems: ["Meditation Traditions", "Mindfulness", "Buddhist Philosophy"],
  };
}

function generateHolisticInsight(
  healthData: HealthData,
  userProfile: { birthDate: string; name: string }
): AIHealthInsight | null {
  // Calculate overall health score
  let totalScore = 0;
  let factors = 0;

  if (healthData.sleep && healthData.sleep.length > 0) {
    const avgSleep = healthData.sleep.reduce((sum, s) => sum + s.quality, 0) / healthData.sleep.length;
    totalScore += (avgSleep / 5) * 100;
    factors++;
  }

  if (healthData.chi && healthData.chi.length > 0) {
    const avgChi = healthData.chi.reduce((sum, c) => sum + c.energyLevel, 0) / healthData.chi.length;
    totalScore += (avgChi / 10) * 100;
    factors++;
  }

  if (healthData.meditation && healthData.meditation.length > 0) {
    const completionRate = healthData.meditation.filter((m) => m.completed).length / healthData.meditation.length;
    totalScore += completionRate * 100;
    factors++;
  }

  if (factors === 0) return null;

  const overallScore = totalScore / factors;

  let insight = "";
  let recommendation = "";

  if (overallScore >= 80) {
    insight = `Your holistic health score is excellent (${Math.round(overallScore)}/100)! You're maintaining strong balance across sleep, energy, and mindfulness.`;
    recommendation = "Continue your current practices. Focus on deepening your spiritual connection through advanced meditations and lunar cycle awareness.";
  } else if (overallScore >= 60) {
    insight = `Your holistic health score is good (${Math.round(overallScore)}/100). You're on the right path with room for growth.`;
    recommendation = "Identify which area needs most attention (sleep, diet, or meditation) and focus there for the next 2 weeks. Track daily to see improvements.";
  } else if (overallScore >= 40) {
    insight = `Your holistic health score is moderate (${Math.round(overallScore)}/100). Your body and energy need more attention.`;
    recommendation = "Start with sleep optimization and daily 5-minute meditations. Once these become habits, add chi tracking and dietary awareness.";
  } else {
    insight = `Your holistic health score suggests significant imbalance (${Math.round(overallScore)}/100). This is a wake-up call from your inner energy.`;
    recommendation = "Begin with basics: 7-8 hours sleep, 10 minutes daily meditation, and mindful eating. Consider consulting a holistic health practitioner.";
  }

  return {
    category: "overall",
    title: "Holistic Health Score",
    insight,
    recommendation,
    confidence: 90,
    relatedSystems: ["All 7 Systems", "Holistic Medicine", "Energy Integration"],
  };
}

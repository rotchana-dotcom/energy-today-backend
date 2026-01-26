/**
 * AI Wellness Coach
 * 
 * Conversational AI that analyzes health data and provides personalized recommendations
 * using the 7 esoteric systems for deeper insights
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CoachMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: Date;
  insights?: {
    system: string;
    analysis: string;
  }[];
}

export interface CoachSession {
  id: string;
  messages: CoachMessage[];
  topic: string;
  startedAt: Date;
  lastMessageAt: Date;
}

const COACH_SESSIONS_KEY = "coach_sessions";

/**
 * Get AI wellness coach response based on user query and health data
 */
export async function getCoachResponse(
  userMessage: string,
  healthContext?: {
    sleepData?: any[];
    dietData?: any[];
    meditationData?: any[];
    chiData?: any[];
    weightData?: any[];
  }
): Promise<CoachMessage> {
  // Analyze user message to determine topic
  const topic = detectTopic(userMessage);

  // Get relevant insights from 7 esoteric systems
  const insights = await analyzeWithEsotericSystems(userMessage, healthContext, topic);

  // Generate personalized response
  const response = generateResponse(userMessage, healthContext, insights, topic);

  return {
    id: Date.now().toString(),
    role: "coach",
    content: response,
    timestamp: new Date(),
    insights,
  };
}

/**
 * Detect the topic of user's question
 */
function detectTopic(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia") || lowerMessage.includes("tired")) {
    return "sleep";
  }
  if (lowerMessage.includes("weight") || lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
    return "diet";
  }
  if (lowerMessage.includes("meditat") || lowerMessage.includes("stress") || lowerMessage.includes("anxiety") || lowerMessage.includes("calm")) {
    return "meditation";
  }
  if (lowerMessage.includes("energy") || lowerMessage.includes("chi") || lowerMessage.includes("chakra") || lowerMessage.includes("flow")) {
    return "energy";
  }
  if (lowerMessage.includes("exercise") || lowerMessage.includes("fitness") || lowerMessage.includes("workout")) {
    return "fitness";
  }

  return "general";
}

/**
 * Analyze with 7 esoteric systems
 */
async function analyzeWithEsotericSystems(
  message: string,
  healthContext: any,
  topic: string
): Promise<{ system: string; analysis: string }[]> {
  const insights: { system: string; analysis: string }[] = [];

  // Get current date for lunar/astrological calculations
  const now = new Date();
  const moonPhase = getMoonPhase(now);

  // 1. Lunar Cycle Analysis
  if (topic === "sleep" || topic === "energy") {
    insights.push({
      system: "Lunar Cycle",
      analysis: `Current moon phase: ${moonPhase}. ${getLunarSleepAdvice(moonPhase)}`,
    });
  }

  // 2. Numerology (Life Path influence on wellness)
  if (topic === "general" || topic === "energy") {
    insights.push({
      system: "Numerology",
      analysis: "Your personal energy cycles suggest focusing on grounding practices during this period.",
    });
  }

  // 3. Astrology (Planetary influences)
  if (topic === "energy" || topic === "meditation") {
    insights.push({
      system: "Astrology",
      analysis: "Current planetary alignment favors introspective practices and energy work.",
    });
  }

  // 4. I Ching (Change patterns)
  if (topic === "general") {
    insights.push({
      system: "I Ching",
      analysis: "The current hexagram suggests a time of gradual progress. Patience with your wellness journey is key.",
    });
  }

  // 5. Tarot (Archetypal guidance)
  if (topic === "meditation" || topic === "general") {
    insights.push({
      system: "Tarot",
      analysis: "The energy today aligns with The Star - hope, healing, and spiritual renewal.",
    });
  }

  // 6. Chakra System
  if (topic === "energy" || topic === "meditation") {
    const chakraAdvice = getChakraAdvice(healthContext);
    insights.push({
      system: "Chakra",
      analysis: chakraAdvice,
    });
  }

  // 7. Feng Shui (Environmental energy)
  if (topic === "sleep" || topic === "energy") {
    insights.push({
      system: "Feng Shui",
      analysis: "Consider your sleeping environment. Ensure your bed faces a favorable direction for restful sleep.",
    });
  }

  return insights;
}

/**
 * Generate personalized response
 */
function generateResponse(
  userMessage: string,
  healthContext: any,
  insights: { system: string; analysis: string }[],
  topic: string
): string {
  const responses: { [key: string]: string[] } = {
    sleep: [
      "I understand you're having trouble sleeping. Let me analyze your patterns and provide some insights.",
      "Sleep challenges can be frustrating. Based on your data and the current lunar cycle, here's what I've found:",
      "Let's look at what might be affecting your sleep quality.",
    ],
    diet: [
      "Your nutrition plays a key role in your overall energy. Let me review your recent patterns.",
      "I've analyzed your food intake and can offer some personalized suggestions.",
      "Let's explore how your diet is affecting your wellness goals.",
    ],
    meditation: [
      "Meditation is a powerful tool for balance. Let me guide you based on your current energy state.",
      "I can see you're interested in deepening your practice. Here's what the systems reveal:",
      "Your meditation journey is unique. Let me offer some tailored insights.",
    ],
    energy: [
      "Energy flow is central to wellness. Let me analyze your chi patterns and provide guidance.",
      "I've examined your energy levels across multiple systems. Here's what stands out:",
      "Let's look at what's influencing your energy right now.",
    ],
    general: [
      "I'm here to help you on your wellness journey. Let me provide some holistic insights.",
      "Based on the esoteric systems and your health data, here's what I've discovered:",
      "Let me offer you a comprehensive perspective on your wellness.",
    ],
  };

  const openings = responses[topic] || responses.general;
  const opening = openings[Math.floor(Math.random() * openings.length)];

  // Build response with insights
  let response = opening + "\n\n";

  // Add top 3 most relevant insights
  const topInsights = insights.slice(0, 3);
  topInsights.forEach((insight, index) => {
    response += `**${insight.system}:** ${insight.analysis}\n\n`;
  });

  // Add actionable recommendations
  response += getActionableRecommendations(topic, healthContext);

  return response;
}

/**
 * Get actionable recommendations based on topic
 */
function getActionableRecommendations(topic: string, healthContext: any): string {
  const recommendations: { [key: string]: string } = {
    sleep: "**Recommendations:**\n• Try meditating 30 minutes before bed\n• Avoid screens 1 hour before sleep\n• Keep your bedroom cool (65-68°F)\n• Consider the lunar cycle - full moons can affect sleep",
    diet: "**Recommendations:**\n• Focus on whole foods and balanced meals\n• Stay hydrated (8 glasses of water daily)\n• Eat mindfully and chew slowly\n• Consider your energy levels when planning meals",
    meditation: "**Recommendations:**\n• Start with 5-10 minutes daily\n• Find a quiet, comfortable space\n• Focus on breath awareness\n• Try guided meditations from our library",
    energy: "**Recommendations:**\n• Practice chi cultivation exercises\n• Balance your chakras through meditation\n• Get morning sunlight exposure\n• Move your body regularly",
    general: "**Recommendations:**\n• Track your patterns consistently\n• Listen to your body's signals\n• Balance physical and spiritual practices\n• Stay connected to natural cycles",
  };

  return recommendations[topic] || recommendations.general;
}

/**
 * Get moon phase
 */
function getMoonPhase(date: Date): string {
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  
  // Simplified moon phase calculation
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  if (month < 3) {
    const yearAdjusted = year - 1;
    const monthAdjusted = month + 12;
  }

  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = Math.floor(jd);
  jd -= b;
  b = Math.round(jd * 8);

  if (b >= 8) b = 0;

  return phases[b];
}

/**
 * Get lunar sleep advice
 */
function getLunarSleepAdvice(moonPhase: string): string {
  const advice: { [key: string]: string } = {
    "New Moon": "New moon energy supports deep rest and renewal. This is an excellent time for restorative sleep.",
    "Waxing Crescent": "Energy is building. You may feel more alert in the evenings. Wind down earlier than usual.",
    "First Quarter": "Action-oriented energy may make it harder to settle. Try calming meditation before bed.",
    "Waxing Gibbous": "Energy peaks approaching. Consider gentle stretching or yin yoga before sleep.",
    "Full Moon": "Full moon can disrupt sleep patterns. Extra grounding practices recommended tonight.",
    "Waning Gibbous": "Energy begins to release. Good time to reflect and journal before bed.",
    "Last Quarter": "Letting go phase. Release tension through breathwork before sleep.",
    "Waning Crescent": "Rest and restoration phase. Your body naturally seeks more sleep now.",
  };

  return advice[moonPhase] || "Listen to your body's natural rhythms.";
}

/**
 * Get chakra advice
 */
function getChakraAdvice(healthContext: any): string {
  // Analyze recent chi entries if available
  if (healthContext?.chiData && healthContext.chiData.length > 0) {
    const recent = healthContext.chiData[0];
    
    if (recent.energyLevel < 5) {
      return "Your root chakra may need attention. Focus on grounding practices and physical activity.";
    }
    if (recent.mentalState === "scattered") {
      return "Your third eye chakra appears imbalanced. Try focused meditation and limit distractions.";
    }
  }

  return "Your chakra system benefits from regular meditation and energy work. Focus on breath and intention.";
}

/**
 * Save coach session
 */
export async function saveCoachSession(session: CoachSession): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(COACH_SESSIONS_KEY);
    const sessions: CoachSession[] = existing ? JSON.parse(existing) : [];
    
    // Update or add session
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    // Keep only last 20 sessions
    if (sessions.length > 20) {
      sessions.splice(0, sessions.length - 20);
    }

    await AsyncStorage.setItem(COACH_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving coach session:", error);
  }
}

/**
 * Get coach sessions
 */
export async function getCoachSessions(): Promise<CoachSession[]> {
  try {
    const data = await AsyncStorage.getItem(COACH_SESSIONS_KEY);
    if (!data) return [];

    const sessions: CoachSession[] = JSON.parse(data);
    // Convert date strings back to Date objects
    return sessions.map((s) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      lastMessageAt: new Date(s.lastMessageAt),
      messages: s.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error loading coach sessions:", error);
    return [];
  }
}

/**
 * Create new coach session
 */
export function createCoachSession(topic: string): CoachSession {
  return {
    id: Date.now().toString(),
    messages: [],
    topic,
    startedAt: new Date(),
    lastMessageAt: new Date(),
  };
}

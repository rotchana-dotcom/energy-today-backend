/**
 * Thai Auspicious Days System
 * 
 * Context-dependent ratings for different business activities.
 * Based on traditional Thai astrology - output translated to everyday language.
 */

export type ThaiDayColor = "Red" | "Yellow" | "Pink" | "Green" | "Orange" | "Blue" | "Purple";

export interface ActivityRating {
  score: number; // 0-100
  guidance: string; // Everyday language guidance
}

export interface ThaiDayGuidance {
  dayOfWeek: string;
  color: ThaiDayColor;
  // Traditional meaning (internal only)
  traditional: string;
  // Activity-specific ratings (shown to user in everyday language)
  meetings: ActivityRating;
  decisions: ActivityRating;
  deals: ActivityRating;
  signing: ActivityRating;
  negotiations: ActivityRating;
  planning: ActivityRating;
  presentations: ActivityRating;
  travel: ActivityRating;
  launching: ActivityRating;
  // Overall guidance
  bestFor: string[];
  avoid: string[];
  overallFortune: number; // 0-100
}

/**
 * Thai day data with context-dependent ratings
 */
const THAI_DAYS: ThaiDayGuidance[] = [
  {
    // Sunday
    dayOfWeek: "Sunday",
    color: "Red",
    traditional: "Day of the Sun - spiritual, rest, reflection",
    meetings: {
      score: 65,
      guidance: "Good for informal or spiritual discussions"
    },
    decisions: {
      score: 60,
      guidance: "Better for personal than business decisions"
    },
    deals: {
      score: 55,
      guidance: "Not ideal - save major deals for weekdays"
    },
    signing: {
      score: 50,
      guidance: "Avoid if possible - wait for better timing"
    },
    negotiations: {
      score: 60,
      guidance: "Relaxed atmosphere may help, but not optimal"
    },
    planning: {
      score: 80,
      guidance: "Excellent for strategic reflection and planning"
    },
    presentations: {
      score: 65,
      guidance: "Good for inspirational or vision-focused talks"
    },
    travel: {
      score: 70,
      guidance: "Favorable for travel, especially personal"
    },
    launching: {
      score: 55,
      guidance: "Not ideal - launch on weekdays for better results"
    },
    bestFor: ["Strategic planning", "Reflection", "Personal time", "Vision work"],
    avoid: ["Major business deals", "Signing contracts", "Aggressive action"],
    overallFortune: 65
  },
  {
    // Monday
    dayOfWeek: "Monday",
    color: "Yellow",
    traditional: "Day of the Moon - new beginnings, emotions, intuition",
    meetings: {
      score: 85,
      guidance: "Excellent for starting new initiatives"
    },
    decisions: {
      score: 80,
      guidance: "Good for fresh starts and new directions"
    },
    deals: {
      score: 75,
      guidance: "Favorable for initiating new partnerships"
    },
    signing: {
      score: 80,
      guidance: "Good day to begin new agreements"
    },
    negotiations: {
      score: 75,
      guidance: "Fresh energy helps open negotiations"
    },
    planning: {
      score: 90,
      guidance: "Perfect for weekly planning and goal-setting"
    },
    presentations: {
      score: 80,
      guidance: "Strong day for introducing new ideas"
    },
    travel: {
      score: 75,
      guidance: "Good for starting business trips"
    },
    launching: {
      score: 85,
      guidance: "Excellent for launches and new beginnings"
    },
    bestFor: ["New beginnings", "Fresh starts", "Planning", "Launches"],
    avoid: ["Ending things", "Closures", "Aggressive confrontation"],
    overallFortune: 82
  },
  {
    // Tuesday
    dayOfWeek: "Tuesday",
    color: "Pink",
    traditional: "Day of Mars - action, but also conflict",
    meetings: {
      score: 60,
      guidance: "Be cautious - potential for tension"
    },
    decisions: {
      score: 55,
      guidance: "Avoid rushed or aggressive decisions"
    },
    deals: {
      score: 50,
      guidance: "Not ideal - wait for Wednesday or Thursday"
    },
    signing: {
      score: 45,
      guidance: "Avoid if possible - higher risk of issues"
    },
    negotiations: {
      score: 50,
      guidance: "Potential for conflict - proceed carefully"
    },
    planning: {
      score: 70,
      guidance: "Good for contingency and risk planning"
    },
    presentations: {
      score: 55,
      guidance: "Moderate - audience may be critical"
    },
    travel: {
      score: 60,
      guidance: "Acceptable but expect minor delays"
    },
    launching: {
      score: 45,
      guidance: "Not recommended - choose a more auspicious day"
    },
    bestFor: ["Risk assessment", "Defensive planning", "Problem-solving"],
    avoid: ["Major deals", "Signing contracts", "Confrontations", "Launches"],
    overallFortune: 55
  },
  {
    // Wednesday
    dayOfWeek: "Wednesday",
    color: "Green",
    traditional: "Day of Mercury - communication, commerce, prosperity",
    meetings: {
      score: 95,
      guidance: "Peak day for all types of meetings"
    },
    decisions: {
      score: 92,
      guidance: "Excellent clarity for important decisions"
    },
    deals: {
      score: 95,
      guidance: "Best day of the week for closing deals"
    },
    signing: {
      score: 95,
      guidance: "Most auspicious day for signing contracts"
    },
    negotiations: {
      score: 93,
      guidance: "Optimal for negotiations and agreements"
    },
    planning: {
      score: 88,
      guidance: "Strong for strategic and financial planning"
    },
    presentations: {
      score: 92,
      guidance: "Excellent for persuasive presentations"
    },
    travel: {
      score: 85,
      guidance: "Favorable for business travel"
    },
    launching: {
      score: 93,
      guidance: "Highly auspicious for product/service launches"
    },
    bestFor: ["Closing deals", "Signing contracts", "Major decisions", "Launches"],
    avoid: ["Nothing - this is the best business day"],
    overallFortune: 93
  },
  {
    // Thursday
    dayOfWeek: "Thursday",
    color: "Orange",
    traditional: "Day of Jupiter - expansion, growth, teaching",
    meetings: {
      score: 75,
      guidance: "Good for educational or growth-focused meetings"
    },
    decisions: {
      score: 70,
      guidance: "Moderate - good for expansion decisions"
    },
    deals: {
      score: 72,
      guidance: "Acceptable, especially for growth-oriented deals"
    },
    signing: {
      score: 70,
      guidance: "Okay, but Wednesday is better"
    },
    negotiations: {
      score: 73,
      guidance: "Fair, focus on win-win outcomes"
    },
    planning: {
      score: 85,
      guidance: "Excellent for long-term and growth planning"
    },
    presentations: {
      score: 80,
      guidance: "Good for educational or training presentations"
    },
    travel: {
      score: 78,
      guidance: "Favorable, especially for learning opportunities"
    },
    launching: {
      score: 75,
      guidance: "Good for educational or growth-focused launches"
    },
    bestFor: ["Growth planning", "Learning", "Teaching", "Long-term strategy"],
    avoid: ["Aggressive tactics", "Short-term thinking"],
    overallFortune: 75
  },
  {
    // Friday
    dayOfWeek: "Friday",
    color: "Blue",
    traditional: "Day of Venus - relationships, harmony, beauty",
    meetings: {
      score: 88,
      guidance: "Excellent for relationship-building meetings"
    },
    decisions: {
      score: 75,
      guidance: "Good for collaborative decisions"
    },
    deals: {
      score: 85,
      guidance: "Strong for partnership and relationship-based deals"
    },
    signing: {
      score: 82,
      guidance: "Good, especially for partnership agreements"
    },
    negotiations: {
      score: 90,
      guidance: "Excellent for win-win negotiations"
    },
    planning: {
      score: 78,
      guidance: "Good for collaborative planning"
    },
    presentations: {
      score: 85,
      guidance: "Strong for relationship-focused presentations"
    },
    travel: {
      score: 88,
      guidance: "Very favorable for relationship-building travel"
    },
    launching: {
      score: 80,
      guidance: "Good for relationship or community-focused launches"
    },
    bestFor: ["Relationship building", "Partnerships", "Networking", "Collaboration"],
    avoid: ["Confrontation", "Aggressive tactics", "Solo work"],
    overallFortune: 84
  },
  {
    // Saturday
    dayOfWeek: "Saturday",
    color: "Purple",
    traditional: "Day of Saturn - discipline, structure, but also obstacles",
    meetings: {
      score: 40,
      guidance: "Not recommended - low energy and potential obstacles"
    },
    decisions: {
      score: 35,
      guidance: "Avoid major decisions - judgment may be clouded"
    },
    deals: {
      score: 30,
      guidance: "Not favorable - postpone to next week"
    },
    signing: {
      score: 25,
      guidance: "Avoid - high risk of complications"
    },
    negotiations: {
      score: 35,
      guidance: "Challenging - likely to encounter resistance"
    },
    planning: {
      score: 75,
      guidance: "Good for detailed, structured planning"
    },
    presentations: {
      score: 40,
      guidance: "Not ideal - audience may be unreceptive"
    },
    travel: {
      score: 45,
      guidance: "Acceptable for personal, not ideal for business"
    },
    launching: {
      score: 25,
      guidance: "Not recommended - wait for a better day"
    },
    bestFor: ["Detailed planning", "Reflection", "Review", "Personal time"],
    avoid: ["Major decisions", "Deals", "Signing contracts", "Launches", "Confrontations"],
    overallFortune: 40
  }
];

/**
 * Get Thai day guidance for a specific date
 */
export function getThaiDayGuidance(date: Date): ThaiDayGuidance {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return THAI_DAYS[dayOfWeek];
}

/**
 * Get activity-specific rating
 */
export function getActivityRating(
  date: Date,
  activity: keyof Omit<ThaiDayGuidance, "dayOfWeek" | "color" | "traditional" | "bestFor" | "avoid" | "overallFortune">
): ActivityRating {
  const guidance = getThaiDayGuidance(date);
  return guidance[activity];
}

/**
 * Get best day of week for specific activity
 */
export function getBestDayForActivity(
  activity: keyof Omit<ThaiDayGuidance, "dayOfWeek" | "color" | "traditional" | "bestFor" | "avoid" | "overallFortune">
): { day: string; score: number; guidance: string } {
  let bestDay = THAI_DAYS[0];
  let bestScore = bestDay[activity].score;
  
  for (const day of THAI_DAYS) {
    if (day[activity].score > bestScore) {
      bestScore = day[activity].score;
      bestDay = day;
    }
  }
  
  return {
    day: bestDay.dayOfWeek,
    score: bestScore,
    guidance: bestDay[activity].guidance
  };
}

/**
 * Get next optimal day for activity
 */
export function getNextOptimalDay(
  currentDate: Date,
  activity: keyof Omit<ThaiDayGuidance, "dayOfWeek" | "color" | "traditional" | "bestFor" | "avoid" | "overallFortune">,
  minScore: number = 80
): { date: Date; day: string; score: number; guidance: string } {
  const nextDate = new Date(currentDate);
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    nextDate.setDate(nextDate.getDate() + 1);
    const guidance = getThaiDayGuidance(nextDate);
    const rating = guidance[activity];
    
    if (rating.score >= minScore) {
      return {
        date: new Date(nextDate),
        day: guidance.dayOfWeek,
        score: rating.score,
        guidance: rating.guidance
      };
    }
  }
  
  // If no day meets threshold, return best day in next 7
  const best = getBestDayForActivity(activity);
  const bestDate = new Date(currentDate);
  const targetDay = THAI_DAYS.findIndex(d => d.dayOfWeek === best.day);
  const currentDay = currentDate.getDay();
  const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
  bestDate.setDate(bestDate.getDate() + daysUntil);
  
  return {
    date: bestDate,
    day: best.day,
    score: best.score,
    guidance: best.guidance
  };
}

/**
 * Get everyday language summary (hide Thai astrology terms)
 */
export function getEverydayGuidance(date: Date): {
  overallRating: string;
  bestActivities: string[];
  avoidActivities: string[];
  topRecommendation: string;
} {
  const guidance = getThaiDayGuidance(date);
  
  let overallRating: string;
  if (guidance.overallFortune >= 85) {
    overallRating = "Excellent day for business";
  } else if (guidance.overallFortune >= 70) {
    overallRating = "Good day for most activities";
  } else if (guidance.overallFortune >= 55) {
    overallRating = "Moderate day - be selective";
  } else {
    overallRating = "Challenging day - focus on planning";
  }
  
  return {
    overallRating,
    bestActivities: guidance.bestFor,
    avoidActivities: guidance.avoid,
    topRecommendation: guidance.bestFor[0] || "Focus on preparation"
  };
}

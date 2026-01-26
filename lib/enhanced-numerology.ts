/**
 * Enhanced Numerology Module
 * 
 * Provides detailed numerology calculations including:
 * - Day Born significance
 * - Life Line (Life Path) detailed analysis
 * - Karmic Numbers and Karmic Debt
 */

export interface DayBornAnalysis {
  dayNumber: number;
  rulingPlanet: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  luckyColors: string[];
  luckyNumbers: number[];
}

export interface LifeLineAnalysis {
  lifePathNumber: number;
  description: string;
  purpose: string;
  talents: string[];
  challenges: string[];
  career: string[];
  relationships: string;
}

export interface KarmicAnalysis {
  hasKarmicDebt: boolean;
  karmicNumbers: number[];
  karmicDebtNumbers: number[];
  lessons: string[];
  guidance: string;
}

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
 * Analyze day born significance
 */
export function analyzeDayBorn(dateOfBirth: string): DayBornAnalysis {
  const date = new Date(dateOfBirth);
  const dayNumber = reduceToSingleDigit(date.getDate());
  
  const dayBornData: Record<number, Omit<DayBornAnalysis, 'dayNumber'>> = {
    1: {
      rulingPlanet: "Sun",
      characteristics: ["Leadership", "Independence", "Innovation", "Ambition"],
      strengths: ["Natural leader", "Creative thinker", "Self-motivated", "Pioneering spirit"],
      challenges: ["Can be domineering", "Impatient", "Stubborn"],
      luckyColors: ["Gold", "Orange", "Yellow"],
      luckyNumbers: [1, 10, 19, 28],
    },
    2: {
      rulingPlanet: "Moon",
      characteristics: ["Diplomacy", "Sensitivity", "Cooperation", "Intuition"],
      strengths: ["Excellent mediator", "Empathetic", "Detail-oriented", "Patient"],
      challenges: ["Overly sensitive", "Indecisive", "Dependent on others"],
      luckyColors: ["White", "Silver", "Cream"],
      luckyNumbers: [2, 11, 20, 29],
    },
    3: {
      rulingPlanet: "Jupiter",
      characteristics: ["Creativity", "Expression", "Optimism", "Social"],
      strengths: ["Excellent communicator", "Artistic", "Enthusiastic", "Inspiring"],
      challenges: ["Scattered energy", "Superficial", "Extravagant"],
      luckyColors: ["Purple", "Blue", "Pink"],
      luckyNumbers: [3, 12, 21, 30],
    },
    4: {
      rulingPlanet: "Rahu (North Node)",
      characteristics: ["Stability", "Hard work", "Discipline", "Practicality"],
      strengths: ["Reliable", "Organized", "Strong work ethic", "Detail-focused"],
      challenges: ["Rigid", "Overly serious", "Resistant to change"],
      luckyColors: ["Grey", "Blue", "Black"],
      luckyNumbers: [4, 13, 22, 31],
    },
    5: {
      rulingPlanet: "Mercury",
      characteristics: ["Freedom", "Adventure", "Versatility", "Communication"],
      strengths: ["Adaptable", "Quick thinker", "Curious", "Energetic"],
      challenges: ["Restless", "Impulsive", "Inconsistent"],
      luckyColors: ["Green", "Light colors"],
      luckyNumbers: [5, 14, 23],
    },
    6: {
      rulingPlanet: "Venus",
      characteristics: ["Harmony", "Responsibility", "Love", "Service"],
      strengths: ["Nurturing", "Artistic", "Diplomatic", "Compassionate"],
      challenges: ["Perfectionist", "Worrying", "Self-sacrificing"],
      luckyColors: ["Blue", "Pink", "White"],
      luckyNumbers: [6, 15, 24],
    },
    7: {
      rulingPlanet: "Ketu (South Node)",
      characteristics: ["Spirituality", "Analysis", "Introspection", "Wisdom"],
      strengths: ["Deep thinker", "Intuitive", "Spiritual", "Analytical"],
      challenges: ["Isolated", "Overly critical", "Secretive"],
      luckyColors: ["Purple", "Violet", "Sea green"],
      luckyNumbers: [7, 16, 25],
    },
    8: {
      rulingPlanet: "Saturn",
      characteristics: ["Ambition", "Authority", "Material success", "Karma"],
      strengths: ["Powerful", "Determined", "Business-minded", "Resilient"],
      challenges: ["Workaholic", "Materialistic", "Controlling"],
      luckyColors: ["Black", "Dark blue", "Grey"],
      luckyNumbers: [8, 17, 26],
    },
    9: {
      rulingPlanet: "Mars",
      characteristics: ["Compassion", "Completion", "Humanitarianism", "Courage"],
      strengths: ["Generous", "Idealistic", "Brave", "Inspirational"],
      challenges: ["Impulsive", "Aggressive", "Impatient"],
      luckyColors: ["Red", "Crimson", "Pink"],
      luckyNumbers: [9, 18, 27],
    },
    11: {
      rulingPlanet: "Moon (Master Number)",
      characteristics: ["Intuition", "Inspiration", "Enlightenment", "Idealism"],
      strengths: ["Visionary", "Spiritual teacher", "Highly intuitive", "Inspirational"],
      challenges: ["Overly idealistic", "Nervous energy", "Impractical"],
      luckyColors: ["Silver", "White", "Light blue"],
      luckyNumbers: [11, 29],
    },
    22: {
      rulingPlanet: "Sun (Master Number)",
      characteristics: ["Master builder", "Vision", "Practical idealism", "Leadership"],
      strengths: ["Manifesting dreams", "Powerful", "Visionary", "Practical"],
      challenges: ["Overwhelming responsibility", "High expectations", "Stress"],
      luckyColors: ["Gold", "Coral", "Red"],
      luckyNumbers: [22],
    },
    33: {
      rulingPlanet: "Jupiter (Master Number)",
      characteristics: ["Master teacher", "Compassion", "Healing", "Service"],
      strengths: ["Selfless", "Healing presence", "Wise teacher", "Compassionate"],
      challenges: ["Martyr complex", "Overwhelming empathy", "Burnout"],
      luckyColors: ["Purple", "Gold", "Green"],
      luckyNumbers: [33],
    },
  };
  
  return {
    dayNumber,
    ...dayBornData[dayNumber],
  };
}

/**
 * Calculate Life Path Number and provide detailed analysis
 */
export function analyzeLifeLine(dateOfBirth: string): LifeLineAnalysis {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const sum = day + month + year;
  const lifePathNumber = reduceToSingleDigit(sum);
  
  const lifePathData: Record<number, Omit<LifeLineAnalysis, 'lifePathNumber'>> = {
    1: {
      description: "The Leader - You are here to develop independence, courage, and leadership.",
      purpose: "To pioneer new ideas and inspire others through your originality and determination.",
      talents: ["Leadership", "Innovation", "Independence", "Courage", "Determination"],
      challenges: ["Learning to balance independence with cooperation", "Avoiding arrogance", "Patience with others"],
      career: ["Entrepreneur", "Executive", "Innovator", "Designer", "Director"],
      relationships: "You need a partner who respects your independence and supports your ambitions.",
    },
    2: {
      description: "The Peacemaker - You are here to develop cooperation, diplomacy, and harmony.",
      purpose: "To bring people together and create peace through understanding and sensitivity.",
      talents: ["Diplomacy", "Mediation", "Empathy", "Patience", "Attention to detail"],
      challenges: ["Building self-confidence", "Avoiding over-sensitivity", "Making decisions independently"],
      career: ["Counselor", "Mediator", "Diplomat", "Teacher", "Healthcare"],
      relationships: "You thrive in partnerships and need emotional connection and harmony.",
    },
    3: {
      description: "The Creative Communicator - You are here to express yourself and inspire joy.",
      purpose: "To uplift others through creativity, communication, and optimism.",
      talents: ["Communication", "Creativity", "Optimism", "Social skills", "Artistic expression"],
      challenges: ["Focusing energy", "Avoiding superficiality", "Managing finances"],
      career: ["Writer", "Artist", "Entertainer", "Designer", "Marketing"],
      relationships: "You need a partner who appreciates your creativity and gives you freedom to express.",
    },
    4: {
      description: "The Builder - You are here to create stability and build lasting foundations.",
      purpose: "To establish order, security, and practical systems that benefit others.",
      talents: ["Organization", "Discipline", "Reliability", "Hard work", "Practical thinking"],
      challenges: ["Flexibility", "Avoiding rigidity", "Work-life balance"],
      career: ["Engineer", "Architect", "Accountant", "Manager", "Craftsperson"],
      relationships: "You need a stable, committed partner who shares your values and work ethic.",
    },
    5: {
      description: "The Freedom Seeker - You are here to experience life fully and embrace change.",
      purpose: "To explore the world, embrace freedom, and help others adapt to change.",
      talents: ["Adaptability", "Communication", "Curiosity", "Energy", "Versatility"],
      challenges: ["Commitment", "Focus", "Avoiding excess"],
      career: ["Travel", "Sales", "Marketing", "Journalism", "Consulting"],
      relationships: "You need a partner who values freedom and adventure as much as you do.",
    },
    6: {
      description: "The Nurturer - You are here to serve, heal, and create harmony.",
      purpose: "To care for others and create beauty, balance, and harmony in the world.",
      talents: ["Nurturing", "Responsibility", "Compassion", "Artistic sense", "Healing"],
      challenges: ["Avoiding perfectionism", "Setting boundaries", "Self-care"],
      career: ["Healthcare", "Teaching", "Counseling", "Interior design", "Hospitality"],
      relationships: "You are devoted and need a partner who appreciates your caring nature.",
    },
    7: {
      description: "The Seeker - You are here to search for truth and develop wisdom.",
      purpose: "To analyze, understand, and share spiritual and intellectual insights.",
      talents: ["Analysis", "Intuition", "Spirituality", "Research", "Wisdom"],
      challenges: ["Trusting others", "Avoiding isolation", "Practical application"],
      career: ["Researcher", "Analyst", "Spiritual teacher", "Scientist", "Philosopher"],
      relationships: "You need a partner who respects your need for solitude and intellectual depth.",
    },
    8: {
      description: "The Powerhouse - You are here to achieve material success and empower others.",
      purpose: "To master the material world and use power and resources wisely.",
      talents: ["Business acumen", "Leadership", "Ambition", "Organization", "Resilience"],
      challenges: ["Work-life balance", "Avoiding materialism", "Sharing power"],
      career: ["Business owner", "Executive", "Finance", "Real estate", "Law"],
      relationships: "You need a partner who is equally ambitious and respects your drive for success.",
    },
    9: {
      description: "The Humanitarian - You are here to serve humanity and complete cycles.",
      purpose: "To give back to the world through compassion, wisdom, and selfless service.",
      talents: ["Compassion", "Idealism", "Generosity", "Wisdom", "Artistic talent"],
      challenges: ["Letting go", "Avoiding martyrdom", "Practical boundaries"],
      career: ["Nonprofit", "Healing arts", "Teaching", "Arts", "Social work"],
      relationships: "You need a partner who shares your humanitarian values and ideals.",
    },
    11: {
      description: "The Spiritual Messenger - You are here to inspire and enlighten others.",
      purpose: "To channel spiritual insights and inspire others toward higher consciousness.",
      talents: ["Intuition", "Inspiration", "Spiritual insight", "Idealism", "Charisma"],
      challenges: ["Grounding energy", "Practical application", "Managing sensitivity"],
      career: ["Spiritual teacher", "Healer", "Artist", "Motivational speaker", "Counselor"],
      relationships: "You need a spiritually aware partner who supports your mission.",
    },
    22: {
      description: "The Master Builder - You are here to manifest grand visions into reality.",
      purpose: "To build lasting legacies that benefit humanity on a large scale.",
      talents: ["Visionary thinking", "Practical manifestation", "Leadership", "Organization", "Ambition"],
      challenges: ["Managing stress", "Balancing idealism with practicality", "Patience"],
      career: ["Architect", "Urban planner", "CEO", "Visionary entrepreneur", "Systems designer"],
      relationships: "You need a partner who understands your grand vision and supports your mission.",
    },
    33: {
      description: "The Master Teacher - You are here to uplift humanity through love and service.",
      purpose: "To teach, heal, and serve humanity with unconditional love and compassion.",
      talents: ["Healing", "Teaching", "Compassion", "Wisdom", "Selfless service"],
      challenges: ["Avoiding martyrdom", "Self-care", "Setting boundaries"],
      career: ["Spiritual teacher", "Healer", "Humanitarian leader", "Counselor", "Philanthropist"],
      relationships: "You need a partner who shares your commitment to service and spiritual growth.",
    },
  };
  
  return {
    lifePathNumber,
    ...lifePathData[lifePathNumber],
  };
}

/**
 * Analyze karmic numbers and karmic debt
 */
export function analyzeKarmicNumbers(dateOfBirth: string, name: string): KarmicAnalysis {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Karmic Debt Numbers: 13, 14, 16, 19
  const karmicDebtNumbers: number[] = [];
  const lessons: string[] = [];
  
  // Check day of birth
  if ([13, 14, 16, 19].includes(day)) {
    karmicDebtNumbers.push(day);
  }
  
  // Check Life Path for karmic debt
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  
  if ([13, 14, 16, 19].includes(dayReduced + monthReduced + yearReduced)) {
    const karmicSum = dayReduced + monthReduced + yearReduced;
    if (!karmicDebtNumbers.includes(karmicSum)) {
      karmicDebtNumbers.push(karmicSum);
    }
  }
  
  // Karmic lessons based on karmic debt numbers
  const karmicLessons: Record<number, string> = {
    13: "Learn discipline and hard work. Past life: Laziness or avoiding responsibility. This life: Build through effort and perseverance.",
    14: "Learn moderation and balance. Past life: Excess and addiction. This life: Find balance in all areas, especially freedom and responsibility.",
    16: "Learn humility and spiritual growth. Past life: Ego and misuse of power. This life: Rebuild from ground up with humility and integrity.",
    19: "Learn independence and selflessness. Past life: Abuse of power and selfishness. This life: Balance personal power with service to others.",
  };
  
  karmicDebtNumbers.forEach(num => {
    if (karmicLessons[num]) {
      lessons.push(karmicLessons[num]);
    }
  });
  
  const hasKarmicDebt = karmicDebtNumbers.length > 0;
  
  let guidance = "";
  if (hasKarmicDebt) {
    guidance = "Karmic debt indicates lessons from past lives that need to be resolved. These challenges are opportunities for spiritual growth. Face them with awareness, patience, and commitment to personal development.";
  } else {
    guidance = "No major karmic debt detected. Your soul has learned key lessons in past lives. Focus on fulfilling your life purpose and helping others on their journey.";
  }
  
  return {
    hasKarmicDebt,
    karmicNumbers: [dayReduced, monthReduced, yearReduced],
    karmicDebtNumbers,
    lessons,
    guidance,
  };
}

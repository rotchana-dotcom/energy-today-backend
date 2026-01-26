/**
 * I-Ching (Book of Changes) System
 * 
 * Complete implementation of all 64 hexagrams for timing and decision guidance.
 * Used internally - output translated to everyday business language.
 */

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  trigrams: { upper: string; lower: string };
  // Internal meanings (not shown to user)
  traditional: string;
  timing: "act" | "wait" | "prepare" | "reflect";
  energy: "high" | "moderate" | "low";
  // Business translations (shown to user)
  businessGuidance: string;
  bestFor: string[];
  avoid: string[];
  optimalTiming: string;
}

/**
 * All 64 I-Ching Hexagrams
 * Traditional meanings kept internal, business translations for output
 */
const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    name: "The Creative",
    chineseName: "乾 Qián",
    trigrams: { upper: "Heaven", lower: "Heaven" },
    traditional: "Pure yang energy, creative power, leadership",
    timing: "act",
    energy: "high",
    businessGuidance: "Peak creative power and leadership energy",
    bestFor: ["launching initiatives", "bold decisions", "taking charge", "starting projects"],
    avoid: ["hesitation", "seeking approval", "playing it safe"],
    optimalTiming: "Morning, early week"
  },
  {
    number: 2,
    name: "The Receptive",
    chineseName: "坤 Kūn",
    trigrams: { upper: "Earth", lower: "Earth" },
    traditional: "Pure yin energy, receptivity, support",
    timing: "wait",
    energy: "moderate",
    businessGuidance: "Focus on listening and gathering information",
    bestFor: ["research", "listening to feedback", "team collaboration", "building relationships"],
    avoid: ["forcing decisions", "aggressive action", "solo initiatives"],
    optimalTiming: "Afternoon, mid-week"
  },
  {
    number: 3,
    name: "Difficulty at the Beginning",
    chineseName: "屯 Zhūn",
    trigrams: { upper: "Water", lower: "Thunder" },
    traditional: "Initial challenges, perseverance needed",
    timing: "prepare",
    energy: "moderate",
    businessGuidance: "Expect obstacles but persist with careful planning",
    bestFor: ["detailed planning", "risk assessment", "building foundations", "patience"],
    avoid: ["rushing", "shortcuts", "impatience"],
    optimalTiming: "Early morning preparation"
  },
  {
    number: 4,
    name: "Youthful Folly",
    chineseName: "蒙 Méng",
    trigrams: { upper: "Mountain", lower: "Water" },
    traditional: "Learning, seeking guidance, inexperience",
    timing: "reflect",
    energy: "low",
    businessGuidance: "Seek expert advice before proceeding",
    bestFor: ["learning", "mentorship", "asking questions", "training"],
    avoid: ["overconfidence", "ignoring advice", "solo decisions"],
    optimalTiming: "Afternoon learning sessions"
  },
  {
    number: 5,
    name: "Waiting",
    chineseName: "需 Xū",
    trigrams: { upper: "Water", lower: "Heaven" },
    traditional: "Patience, nourishment, timing",
    timing: "wait",
    energy: "moderate",
    businessGuidance: "Strategic patience - the timing isn't right yet",
    bestFor: ["preparation", "building resources", "strategic planning", "patience"],
    avoid: ["premature action", "forcing outcomes", "impatience"],
    optimalTiming: "Wait 2-3 days for optimal timing"
  },
  {
    number: 6,
    name: "Conflict",
    chineseName: "訟 Sòng",
    trigrams: { upper: "Heaven", lower: "Water" },
    traditional: "Disagreement, need for mediation",
    timing: "wait",
    energy: "low",
    businessGuidance: "Avoid confrontation - seek compromise",
    bestFor: ["mediation", "finding common ground", "diplomatic solutions"],
    avoid: ["arguments", "forcing your view", "confrontation"],
    optimalTiming: "Postpone contentious meetings"
  },
  {
    number: 7,
    name: "The Army",
    chineseName: "師 Shī",
    trigrams: { upper: "Earth", lower: "Water" },
    traditional: "Discipline, organization, leadership",
    timing: "act",
    energy: "high",
    businessGuidance: "Strong leadership and organized action required",
    bestFor: ["team leadership", "organized campaigns", "strategic execution"],
    avoid: ["disorganization", "lack of planning", "weak leadership"],
    optimalTiming: "Monday morning, start of initiatives"
  },
  {
    number: 8,
    name: "Holding Together",
    chineseName: "比 Bǐ",
    trigrams: { upper: "Water", lower: "Earth" },
    traditional: "Union, alliance, cooperation",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Build alliances and strengthen partnerships",
    bestFor: ["partnerships", "team building", "networking", "collaboration"],
    avoid: ["isolation", "solo work", "competition"],
    optimalTiming: "Mid-week collaboration sessions"
  },
  {
    number: 9,
    name: "Small Accumulating",
    chineseName: "小畜 Xiǎo Chù",
    trigrams: { upper: "Wind", lower: "Heaven" },
    traditional: "Gradual progress, small gains",
    timing: "prepare",
    energy: "moderate",
    businessGuidance: "Focus on incremental progress, not big wins",
    bestFor: ["steady progress", "small improvements", "patience", "consistency"],
    avoid: ["big bets", "dramatic changes", "impatience"],
    optimalTiming: "Daily consistent effort"
  },
  {
    number: 10,
    name: "Treading",
    chineseName: "履 Lǚ",
    trigrams: { upper: "Heaven", lower: "Lake" },
    traditional: "Careful conduct, propriety",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Proceed carefully with proper protocol",
    bestFor: ["following procedures", "professional conduct", "careful steps"],
    avoid: ["carelessness", "breaking protocol", "risky moves"],
    optimalTiming: "Formal business hours"
  },
  {
    number: 11,
    name: "Peace",
    chineseName: "泰 Tài",
    trigrams: { upper: "Earth", lower: "Heaven" },
    traditional: "Harmony, prosperity, balance",
    timing: "act",
    energy: "high",
    businessGuidance: "Optimal conditions - move forward confidently",
    bestFor: ["major decisions", "negotiations", "closing deals", "expansion"],
    avoid: ["hesitation", "overthinking", "missing opportunities"],
    optimalTiming: "Peak performance windows"
  },
  {
    number: 12,
    name: "Standstill",
    chineseName: "否 Pǐ",
    trigrams: { upper: "Heaven", lower: "Earth" },
    traditional: "Stagnation, obstruction",
    timing: "wait",
    energy: "low",
    businessGuidance: "Avoid major moves - focus on maintenance",
    bestFor: ["review", "reflection", "maintenance", "patience"],
    avoid: ["new initiatives", "big decisions", "expansion"],
    optimalTiming: "Postpone until conditions improve"
  },
  {
    number: 13,
    name: "Fellowship",
    chineseName: "同人 Tóng Rén",
    trigrams: { upper: "Heaven", lower: "Fire" },
    traditional: "Community, shared goals",
    timing: "act",
    energy: "high",
    businessGuidance: "Leverage community and shared vision",
    bestFor: ["team projects", "community building", "shared goals", "collaboration"],
    avoid: ["isolation", "selfish goals", "competition"],
    optimalTiming: "Team meetings, collaborative work"
  },
  {
    number: 14,
    name: "Great Possession",
    chineseName: "大有 Dà Yǒu",
    trigrams: { upper: "Fire", lower: "Heaven" },
    traditional: "Abundance, success, wealth",
    timing: "act",
    energy: "high",
    businessGuidance: "Peak success energy - capitalize on momentum",
    bestFor: ["closing major deals", "celebrations", "expansion", "investment"],
    avoid: ["complacency", "arrogance", "waste"],
    optimalTiming: "High-stakes meetings, major presentations"
  },
  {
    number: 15,
    name: "Modesty",
    chineseName: "謙 Qiān",
    trigrams: { upper: "Earth", lower: "Mountain" },
    traditional: "Humility, moderation",
    timing: "reflect",
    energy: "moderate",
    businessGuidance: "Listen more than you speak - humility wins",
    bestFor: ["listening", "learning", "modest proposals", "building trust"],
    avoid: ["boasting", "aggressive pitches", "overconfidence"],
    optimalTiming: "Client listening sessions"
  },
  {
    number: 16,
    name: "Enthusiasm",
    chineseName: "豫 Yù",
    trigrams: { upper: "Thunder", lower: "Earth" },
    traditional: "Excitement, motivation, harmony",
    timing: "act",
    energy: "high",
    businessGuidance: "High energy and enthusiasm - inspire others",
    bestFor: ["motivational presentations", "team rallies", "launches"],
    avoid: ["pessimism", "doubt", "low energy activities"],
    optimalTiming: "Morning kickoffs, team events"
  },
  {
    number: 17,
    name: "Following",
    chineseName: "隨 Suí",
    trigrams: { upper: "Lake", lower: "Thunder" },
    traditional: "Adaptation, flexibility",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Adapt to circumstances - go with the flow",
    bestFor: ["flexibility", "adapting plans", "following trends"],
    avoid: ["rigidity", "forcing your way", "resistance"],
    optimalTiming: "Responsive decision-making"
  },
  {
    number: 18,
    name: "Work on the Decayed",
    chineseName: "蠱 Gǔ",
    trigrams: { upper: "Mountain", lower: "Wind" },
    traditional: "Correction, repair, renewal",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Fix what's broken - address underlying issues",
    bestFor: ["problem-solving", "repairs", "addressing issues", "cleanup"],
    avoid: ["ignoring problems", "superficial fixes", "avoidance"],
    optimalTiming: "Problem-solving sessions"
  },
  {
    number: 19,
    name: "Approach",
    chineseName: "臨 Lín",
    trigrams: { upper: "Earth", lower: "Lake" },
    traditional: "Advancement, opportunity",
    timing: "act",
    energy: "high",
    businessGuidance: "Opportunity approaching - prepare to seize it",
    bestFor: ["seizing opportunities", "advancement", "growth"],
    avoid: ["hesitation", "missing opportunities", "unpreparedness"],
    optimalTiming: "When opportunities present themselves"
  },
  {
    number: 20,
    name: "Contemplation",
    chineseName: "觀 Guān",
    trigrams: { upper: "Wind", lower: "Earth" },
    traditional: "Observation, reflection",
    timing: "reflect",
    energy: "low",
    businessGuidance: "Step back and observe before acting",
    bestFor: ["analysis", "observation", "strategic thinking", "review"],
    avoid: ["hasty action", "jumping to conclusions", "impulsiveness"],
    optimalTiming: "Strategic planning sessions"
  },
  {
    number: 21,
    name: "Biting Through",
    chineseName: "噬嗑 Shì Hé",
    trigrams: { upper: "Fire", lower: "Thunder" },
    traditional: "Decisive action, removing obstacles",
    timing: "act",
    energy: "high",
    businessGuidance: "Take decisive action - remove obstacles",
    bestFor: ["tough decisions", "removing blockers", "direct action"],
    avoid: ["avoidance", "indecision", "procrastination"],
    optimalTiming: "Decisive moments, tough conversations"
  },
  {
    number: 22,
    name: "Grace",
    chineseName: "賁 Bì",
    trigrams: { upper: "Mountain", lower: "Fire" },
    traditional: "Beauty, elegance, form",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Focus on presentation and aesthetics",
    bestFor: ["presentations", "branding", "design", "appearances"],
    avoid: ["sloppiness", "poor presentation", "neglecting details"],
    optimalTiming: "Client presentations, pitches"
  },
  {
    number: 23,
    name: "Splitting Apart",
    chineseName: "剝 Bō",
    trigrams: { upper: "Mountain", lower: "Earth" },
    traditional: "Deterioration, yielding",
    timing: "wait",
    energy: "low",
    businessGuidance: "Avoid major moves - conditions are unfavorable",
    bestFor: ["patience", "preservation", "minimal action"],
    avoid: ["new ventures", "expansion", "risk-taking"],
    optimalTiming: "Wait for better conditions"
  },
  {
    number: 24,
    name: "Return",
    chineseName: "復 Fù",
    trigrams: { upper: "Earth", lower: "Thunder" },
    traditional: "Renewal, turning point",
    timing: "prepare",
    energy: "moderate",
    businessGuidance: "New beginning - conditions improving",
    bestFor: ["fresh starts", "renewals", "new approaches"],
    avoid: ["old patterns", "giving up", "pessimism"],
    optimalTiming: "Start of new cycles"
  },
  {
    number: 25,
    name: "Innocence",
    chineseName: "無妄 Wú Wàng",
    trigrams: { upper: "Heaven", lower: "Thunder" },
    traditional: "Spontaneity, naturalness",
    timing: "act",
    energy: "high",
    businessGuidance: "Trust your instincts - act naturally",
    bestFor: ["intuitive decisions", "spontaneous action", "authenticity"],
    avoid: ["overthinking", "artificiality", "manipulation"],
    optimalTiming: "When instincts are strong"
  },
  {
    number: 26,
    name: "Great Accumulating",
    chineseName: "大畜 Dà Chù",
    trigrams: { upper: "Mountain", lower: "Heaven" },
    traditional: "Restraint, building strength",
    timing: "prepare",
    energy: "moderate",
    businessGuidance: "Build resources before major action",
    bestFor: ["resource building", "preparation", "training", "accumulation"],
    avoid: ["premature action", "depletion", "waste"],
    optimalTiming: "Preparation phases"
  },
  {
    number: 27,
    name: "Nourishment",
    chineseName: "頤 Yí",
    trigrams: { upper: "Mountain", lower: "Thunder" },
    traditional: "Sustenance, care",
    timing: "reflect",
    energy: "moderate",
    businessGuidance: "Focus on sustainable practices",
    bestFor: ["sustainability", "self-care", "team wellness", "long-term thinking"],
    avoid: ["burnout", "exploitation", "short-term thinking"],
    optimalTiming: "Wellness initiatives"
  },
  {
    number: 28,
    name: "Great Exceeding",
    chineseName: "大過 Dà Guò",
    trigrams: { upper: "Lake", lower: "Wind" },
    traditional: "Extraordinary measures, excess",
    timing: "act",
    energy: "high",
    businessGuidance: "Bold action required - extraordinary times",
    bestFor: ["bold moves", "extraordinary measures", "crisis management"],
    avoid: ["timidity", "normal approaches", "hesitation"],
    optimalTiming: "Crisis moments, urgent situations"
  },
  {
    number: 29,
    name: "The Abysmal",
    chineseName: "坎 Kǎn",
    trigrams: { upper: "Water", lower: "Water" },
    traditional: "Danger, challenge",
    timing: "wait",
    energy: "low",
    businessGuidance: "Navigate carefully - risks are high",
    bestFor: ["caution", "risk management", "careful planning"],
    avoid: ["recklessness", "big bets", "overconfidence"],
    optimalTiming: "Postpone risky decisions"
  },
  {
    number: 30,
    name: "The Clinging",
    chineseName: "離 Lí",
    trigrams: { upper: "Fire", lower: "Fire" },
    traditional: "Clarity, illumination",
    timing: "act",
    energy: "high",
    businessGuidance: "Maximum clarity - make important decisions",
    bestFor: ["major decisions", "clarity", "vision", "strategy"],
    avoid: ["confusion", "ambiguity", "procrastination"],
    optimalTiming: "Strategic decision windows"
  },
  {
    number: 31,
    name: "Influence",
    chineseName: "咸 Xián",
    trigrams: { upper: "Lake", lower: "Mountain" },
    traditional: "Attraction, influence",
    timing: "act",
    energy: "high",
    businessGuidance: "High influence - persuade and attract",
    bestFor: ["persuasion", "attraction", "influence", "sales"],
    avoid: ["passivity", "missing influence opportunities"],
    optimalTiming: "Sales calls, persuasive presentations"
  },
  {
    number: 32,
    name: "Duration",
    chineseName: "恆 Héng",
    trigrams: { upper: "Thunder", lower: "Wind" },
    traditional: "Perseverance, consistency",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Consistency wins - maintain steady effort",
    bestFor: ["consistency", "long-term projects", "perseverance"],
    avoid: ["giving up", "inconsistency", "impatience"],
    optimalTiming: "Long-term project work"
  },
  {
    number: 33,
    name: "Retreat",
    chineseName: "遯 Dùn",
    trigrams: { upper: "Heaven", lower: "Mountain" },
    traditional: "Strategic withdrawal",
    timing: "wait",
    energy: "low",
    businessGuidance: "Strategic retreat - regroup and reassess",
    bestFor: ["regrouping", "reassessment", "strategic pause"],
    avoid: ["pushing forward", "stubbornness", "forcing"],
    optimalTiming: "When to step back"
  },
  {
    number: 34,
    name: "Great Power",
    chineseName: "大壯 Dà Zhuàng",
    trigrams: { upper: "Thunder", lower: "Heaven" },
    traditional: "Strength, vigor",
    timing: "act",
    energy: "high",
    businessGuidance: "Peak power - take bold action",
    bestFor: ["bold moves", "strength", "assertiveness", "leadership"],
    avoid: ["timidity", "weakness", "hesitation"],
    optimalTiming: "Power moves, assertive action"
  },
  {
    number: 35,
    name: "Progress",
    chineseName: "晉 Jìn",
    trigrams: { upper: "Fire", lower: "Earth" },
    traditional: "Advancement, promotion",
    timing: "act",
    energy: "high",
    businessGuidance: "Rapid progress - advance confidently",
    bestFor: ["advancement", "promotion", "growth", "expansion"],
    avoid: ["stagnation", "holding back", "timidity"],
    optimalTiming: "Growth initiatives"
  },
  {
    number: 36,
    name: "Darkening of the Light",
    chineseName: "明夷 Míng Yí",
    trigrams: { upper: "Earth", lower: "Fire" },
    traditional: "Adversity, concealment",
    timing: "wait",
    energy: "low",
    businessGuidance: "Lay low - not the time for visibility",
    bestFor: ["discretion", "patience", "inner work"],
    avoid: ["high visibility", "bold moves", "exposure"],
    optimalTiming: "Low-profile activities"
  },
  {
    number: 37,
    name: "The Family",
    chineseName: "家人 Jiā Rén",
    trigrams: { upper: "Wind", lower: "Fire" },
    traditional: "Family, community",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Focus on team and internal relationships",
    bestFor: ["team building", "internal focus", "relationships"],
    avoid: ["external focus", "neglecting team", "isolation"],
    optimalTiming: "Team development"
  },
  {
    number: 38,
    name: "Opposition",
    chineseName: "睽 Kuí",
    trigrams: { upper: "Fire", lower: "Lake" },
    traditional: "Contradiction, divergence",
    timing: "wait",
    energy: "low",
    businessGuidance: "Expect differences - find common ground",
    bestFor: ["finding common ground", "diplomacy", "patience"],
    avoid: ["forcing agreement", "confrontation", "rigidity"],
    optimalTiming: "Diplomatic negotiations"
  },
  {
    number: 39,
    name: "Obstruction",
    chineseName: "蹇 Jiǎn",
    trigrams: { upper: "Water", lower: "Mountain" },
    traditional: "Obstacles, difficulty",
    timing: "wait",
    energy: "low",
    businessGuidance: "Obstacles present - proceed carefully",
    bestFor: ["careful planning", "patience", "problem-solving"],
    avoid: ["rushing", "forcing", "impatience"],
    optimalTiming: "Wait for obstacles to clear"
  },
  {
    number: 40,
    name: "Deliverance",
    chineseName: "解 Xiè",
    trigrams: { upper: "Thunder", lower: "Water" },
    traditional: "Release, relief",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Obstacles clearing - move forward",
    bestFor: ["moving forward", "relief", "resolution"],
    avoid: ["dwelling on past", "hesitation", "holding back"],
    optimalTiming: "After resolution"
  },
  {
    number: 41,
    name: "Decrease",
    chineseName: "損 Sǔn",
    trigrams: { upper: "Mountain", lower: "Lake" },
    traditional: "Reduction, simplification",
    timing: "reflect",
    energy: "moderate",
    businessGuidance: "Simplify and focus on essentials",
    bestFor: ["simplification", "focus", "cutting waste"],
    avoid: ["complexity", "expansion", "excess"],
    optimalTiming: "Efficiency reviews"
  },
  {
    number: 42,
    name: "Increase",
    chineseName: "益 Yì",
    trigrams: { upper: "Wind", lower: "Thunder" },
    traditional: "Growth, expansion",
    timing: "act",
    energy: "high",
    businessGuidance: "Growth opportunity - expand confidently",
    bestFor: ["expansion", "growth", "investment", "scaling"],
    avoid: ["contraction", "timidity", "missing opportunities"],
    optimalTiming: "Growth initiatives"
  },
  {
    number: 43,
    name: "Breakthrough",
    chineseName: "夬 Guài",
    trigrams: { upper: "Lake", lower: "Heaven" },
    traditional: "Determination, resolution",
    timing: "act",
    energy: "high",
    businessGuidance: "Decisive breakthrough - take action",
    bestFor: ["breakthroughs", "decisive action", "resolution"],
    avoid: ["hesitation", "indecision", "delay"],
    optimalTiming: "Breakthrough moments"
  },
  {
    number: 44,
    name: "Coming to Meet",
    chineseName: "姤 Gòu",
    trigrams: { upper: "Heaven", lower: "Wind" },
    traditional: "Encounter, temptation",
    timing: "wait",
    energy: "moderate",
    businessGuidance: "Be selective - not all opportunities are good",
    bestFor: ["discernment", "selectivity", "caution"],
    avoid: ["jumping at everything", "lack of discernment"],
    optimalTiming: "Careful evaluation"
  },
  {
    number: 45,
    name: "Gathering Together",
    chineseName: "萃 Cuì",
    trigrams: { upper: "Lake", lower: "Earth" },
    traditional: "Assembly, collection",
    timing: "act",
    energy: "high",
    businessGuidance: "Bring people together - collective action",
    bestFor: ["gatherings", "collective action", "unity"],
    avoid: ["isolation", "division", "solo work"],
    optimalTiming: "Team gatherings, conferences"
  },
  {
    number: 46,
    name: "Pushing Upward",
    chineseName: "升 Shēng",
    trigrams: { upper: "Earth", lower: "Wind" },
    traditional: "Ascent, growth",
    timing: "act",
    energy: "high",
    businessGuidance: "Steady upward progress - keep climbing",
    bestFor: ["advancement", "growth", "promotion", "progress"],
    avoid: ["stagnation", "complacency", "stopping"],
    optimalTiming: "Career advancement moves"
  },
  {
    number: 47,
    name: "Oppression",
    chineseName: "困 Kùn",
    trigrams: { upper: "Lake", lower: "Water" },
    traditional: "Exhaustion, adversity",
    timing: "wait",
    energy: "low",
    businessGuidance: "Conserve energy - difficult period",
    bestFor: ["conservation", "patience", "endurance"],
    avoid: ["big moves", "expansion", "risk-taking"],
    optimalTiming: "Wait for better conditions"
  },
  {
    number: 48,
    name: "The Well",
    chineseName: "井 Jǐng",
    trigrams: { upper: "Water", lower: "Wind" },
    traditional: "Resources, nourishment",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Tap into existing resources",
    bestFor: ["using resources", "drawing on experience", "sustainability"],
    avoid: ["reinventing wheel", "ignoring resources"],
    optimalTiming: "Resource optimization"
  },
  {
    number: 49,
    name: "Revolution",
    chineseName: "革 Gé",
    trigrams: { upper: "Lake", lower: "Fire" },
    traditional: "Change, transformation",
    timing: "act",
    energy: "high",
    businessGuidance: "Major change required - transform boldly",
    bestFor: ["transformation", "revolution", "major change"],
    avoid: ["maintaining status quo", "timidity", "resistance"],
    optimalTiming: "Transformation initiatives"
  },
  {
    number: 50,
    name: "The Cauldron",
    chineseName: "鼎 Dǐng",
    trigrams: { upper: "Fire", lower: "Wind" },
    traditional: "Nourishment, refinement",
    timing: "act",
    energy: "high",
    businessGuidance: "Refine and perfect - quality focus",
    bestFor: ["refinement", "quality", "excellence", "perfection"],
    avoid: ["rushing", "sloppiness", "cutting corners"],
    optimalTiming: "Quality improvement"
  },
  {
    number: 51,
    name: "The Arousing",
    chineseName: "震 Zhèn",
    trigrams: { upper: "Thunder", lower: "Thunder" },
    traditional: "Shock, movement",
    timing: "act",
    energy: "high",
    businessGuidance: "Sudden action - respond quickly",
    bestFor: ["quick response", "agility", "decisive action"],
    avoid: ["slow response", "hesitation", "paralysis"],
    optimalTiming: "Rapid response situations"
  },
  {
    number: 52,
    name: "Keeping Still",
    chineseName: "艮 Gèn",
    trigrams: { upper: "Mountain", lower: "Mountain" },
    traditional: "Stillness, meditation",
    timing: "reflect",
    energy: "low",
    businessGuidance: "Pause and reflect - stillness brings clarity",
    bestFor: ["reflection", "meditation", "strategic pause"],
    avoid: ["hasty action", "restlessness", "impulsiveness"],
    optimalTiming: "Strategic reflection time"
  },
  {
    number: 53,
    name: "Development",
    chineseName: "漸 Jiàn",
    trigrams: { upper: "Wind", lower: "Mountain" },
    traditional: "Gradual progress",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Steady gradual progress - patience pays off",
    bestFor: ["steady progress", "patience", "gradual development"],
    avoid: ["rushing", "impatience", "shortcuts"],
    optimalTiming: "Long-term development"
  },
  {
    number: 54,
    name: "The Marrying Maiden",
    chineseName: "歸妹 Guī Mèi",
    trigrams: { upper: "Thunder", lower: "Lake" },
    traditional: "Relationships, subordination",
    timing: "wait",
    energy: "moderate",
    businessGuidance: "Focus on relationships and partnerships",
    bestFor: ["relationships", "partnerships", "collaboration"],
    avoid: ["solo action", "independence", "isolation"],
    optimalTiming: "Partnership development"
  },
  {
    number: 55,
    name: "Abundance",
    chineseName: "豐 Fēng",
    trigrams: { upper: "Thunder", lower: "Fire" },
    traditional: "Fullness, prosperity",
    timing: "act",
    energy: "high",
    businessGuidance: "Peak abundance - maximize opportunities",
    bestFor: ["maximizing gains", "celebration", "expansion"],
    avoid: ["complacency", "waste", "missing peak"],
    optimalTiming: "Peak performance periods"
  },
  {
    number: 56,
    name: "The Wanderer",
    chineseName: "旅 Lǚ",
    trigrams: { upper: "Fire", lower: "Mountain" },
    traditional: "Travel, transition",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Flexibility and adaptation required",
    bestFor: ["travel", "flexibility", "adaptation", "exploration"],
    avoid: ["rigidity", "attachment", "resistance to change"],
    optimalTiming: "Travel, exploration phases"
  },
  {
    number: 57,
    name: "The Gentle",
    chineseName: "巽 Xùn",
    trigrams: { upper: "Wind", lower: "Wind" },
    traditional: "Penetration, influence",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Gentle persistence - influence subtly",
    bestFor: ["gentle persuasion", "subtle influence", "persistence"],
    avoid: ["force", "aggression", "bluntness"],
    optimalTiming: "Subtle influence work"
  },
  {
    number: 58,
    name: "The Joyous",
    chineseName: "兌 Duì",
    trigrams: { upper: "Lake", lower: "Lake" },
    traditional: "Joy, pleasure",
    timing: "act",
    energy: "high",
    businessGuidance: "Positive energy - enjoy and celebrate",
    bestFor: ["celebration", "positive interactions", "joy"],
    avoid: ["negativity", "seriousness", "pessimism"],
    optimalTiming: "Celebrations, positive events"
  },
  {
    number: 59,
    name: "Dispersion",
    chineseName: "渙 Huàn",
    trigrams: { upper: "Wind", lower: "Water" },
    traditional: "Dissolution, dispersal",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Break down barriers - dissolve obstacles",
    bestFor: ["breaking barriers", "dissolution", "opening up"],
    avoid: ["rigidity", "barriers", "closure"],
    optimalTiming: "Breaking down silos"
  },
  {
    number: 60,
    name: "Limitation",
    chineseName: "節 Jié",
    trigrams: { upper: "Water", lower: "Lake" },
    traditional: "Restraint, moderation",
    timing: "reflect",
    energy: "moderate",
    businessGuidance: "Set boundaries - practice moderation",
    bestFor: ["boundaries", "moderation", "discipline"],
    avoid: ["excess", "lack of boundaries", "overindulgence"],
    optimalTiming: "Setting limits"
  },
  {
    number: 61,
    name: "Inner Truth",
    chineseName: "中孚 Zhōng Fú",
    trigrams: { upper: "Wind", lower: "Lake" },
    traditional: "Sincerity, truth",
    timing: "act",
    energy: "high",
    businessGuidance: "Authenticity wins - be genuine",
    bestFor: ["authenticity", "truth", "sincerity", "trust-building"],
    avoid: ["deception", "inauthenticity", "manipulation"],
    optimalTiming: "Trust-building conversations"
  },
  {
    number: 62,
    name: "Small Exceeding",
    chineseName: "小過 Xiǎo Guò",
    trigrams: { upper: "Thunder", lower: "Mountain" },
    traditional: "Small gains, caution",
    timing: "act",
    energy: "moderate",
    businessGuidance: "Focus on small wins - avoid overreach",
    bestFor: ["small gains", "caution", "modest goals"],
    avoid: ["overreach", "big bets", "excess"],
    optimalTiming: "Incremental progress"
  },
  {
    number: 63,
    name: "After Completion",
    chineseName: "既濟 Jì Jì",
    trigrams: { upper: "Water", lower: "Fire" },
    traditional: "Completion, order",
    timing: "reflect",
    energy: "moderate",
    businessGuidance: "Task complete - maintain and consolidate",
    bestFor: ["maintenance", "consolidation", "vigilance"],
    avoid: ["complacency", "neglect", "assuming it's done"],
    optimalTiming: "Post-completion maintenance"
  },
  {
    number: 64,
    name: "Before Completion",
    chineseName: "未濟 Wèi Jì",
    trigrams: { upper: "Fire", lower: "Water" },
    traditional: "Transition, potential",
    timing: "prepare",
    energy: "moderate",
    businessGuidance: "Almost there - final push needed",
    bestFor: ["final efforts", "completion", "persistence"],
    avoid: ["giving up", "premature celebration", "losing focus"],
    optimalTiming: "Final push to completion"
  }
];

/**
 * Calculate birth hexagram from birth date
 * Used for Personal Profile
 */
export function calculateBirthHexagram(dateOfBirth: string): Hexagram {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Use birth data to deterministically select hexagram
  const sum = day + month + year;
  const hexagramNumber = ((sum % 64) + 1);
  
  return HEXAGRAMS[hexagramNumber - 1];
}

/**
 * Calculate daily hexagram from current date
 * Used for Earth Profile
 */
export function calculateDailyHexagram(date: Date): Hexagram {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const hexagramNumber = ((dayOfYear % 64) + 1);
  return HEXAGRAMS[hexagramNumber - 1];
}

/**
 * Get hexagram by number
 */
export function getHexagram(number: number): Hexagram {
  if (number < 1 || number > 64) {
    throw new Error("Hexagram number must be between 1 and 64");
  }
  return HEXAGRAMS[number - 1];
}

/**
 * Calculate hexagram compatibility between birth and daily
 * Returns alignment score 0-100
 */
export function calculateHexagramAlignment(
  birthHexagram: Hexagram,
  dailyHexagram: Hexagram
): number {
  // Same hexagram = perfect alignment
  if (birthHexagram.number === dailyHexagram.number) {
    return 100;
  }
  
  // Both "act" timing = high alignment
  if (birthHexagram.timing === "act" && dailyHexagram.timing === "act") {
    return 90;
  }
  
  // Both high energy = good alignment
  if (birthHexagram.energy === "high" && dailyHexagram.energy === "high") {
    return 85;
  }
  
  // Complementary timings
  if (
    (birthHexagram.timing === "act" && dailyHexagram.timing === "prepare") ||
    (birthHexagram.timing === "prepare" && dailyHexagram.timing === "act")
  ) {
    return 75;
  }
  
  // Conflicting timings
  if (
    (birthHexagram.timing === "act" && dailyHexagram.timing === "wait") ||
    (birthHexagram.timing === "wait" && dailyHexagram.timing === "act")
  ) {
    return 40;
  }
  
  // Default moderate alignment
  return 60;
}

/**
 * Get business guidance from hexagram (translated to everyday language)
 */
export function getBusinessGuidance(hexagram: Hexagram): {
  guidance: string;
  timing: string;
  bestFor: string[];
  avoid: string[];
} {
  return {
    guidance: hexagram.businessGuidance,
    timing: hexagram.optimalTiming,
    bestFor: hexagram.bestFor,
    avoid: hexagram.avoid
  };
}

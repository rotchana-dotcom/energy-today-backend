/**
 * Onboarding Tutorial System
 * Interactive walkthrough for new users
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "onboarding_tutorial";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  screen: string;
  targetElement?: string; // Element to highlight
  position: "top" | "bottom" | "center";
  action?: "tap" | "swipe" | "input" | "none";
  image?: string;
  videoUrl?: string;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  category: "getting_started" | "features" | "advanced" | "tips";
  estimatedTime: number; // minutes
  completed: boolean;
  currentStep: number;
  lastAccessedAt?: Date;
}

export interface OnboardingProgress {
  completedTutorials: string[];
  currentTutorial?: string;
  skippedTutorials: string[];
  startedAt: Date;
  completedAt?: Date;
  showTooltips: boolean;
  firstTimeUser: boolean;
}

/**
 * Initialize onboarding progress
 */
export async function initializeOnboarding(): Promise<OnboardingProgress> {
  const progress: OnboardingProgress = {
    completedTutorials: [],
    skippedTutorials: [],
    startedAt: new Date(),
    showTooltips: true,
    firstTimeUser: true,
  };
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

/**
 * Get onboarding progress
 */
export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  const progress = JSON.parse(data);
  progress.startedAt = new Date(progress.startedAt);
  if (progress.completedAt) {
    progress.completedAt = new Date(progress.completedAt);
  }
  
  return progress;
}

/**
 * Get all tutorials
 */
export function getAllTutorials(): Tutorial[] {
  return [
    {
      id: "getting_started",
      name: "Getting Started with Energy Today",
      description: "Learn the basics of tracking your energy and understanding your patterns",
      category: "getting_started",
      estimatedTime: 5,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "welcome",
          title: "Welcome to Energy Today!",
          description: "Energy Today helps you track, analyze, and optimize your daily energy levels for peak performance.",
          screen: "onboarding",
          position: "center",
          action: "none",
          image: "/assets/onboarding/welcome.png",
        },
        {
          id: "track_energy",
          title: "Track Your Energy",
          description: "Log your energy levels throughout the day. Tap the energy meter to record how you're feeling.",
          screen: "today",
          targetElement: "energy_meter",
          position: "center",
          action: "tap",
        },
        {
          id: "view_insights",
          title: "Get AI Insights",
          description: "Our AI analyzes your patterns and provides personalized recommendations. Tap 'Insights' to see yours.",
          screen: "today",
          targetElement: "insights_button",
          position: "bottom",
          action: "tap",
        },
        {
          id: "check_calendar",
          title: "Plan Your Week",
          description: "View your energy forecast in the calendar. Green days = high energy, yellow = moderate, red = low.",
          screen: "calendar",
          targetElement: "calendar_view",
          position: "top",
          action: "none",
        },
        {
          id: "complete",
          title: "You're All Set!",
          description: "Start tracking your energy today and discover your unique patterns. Remember: consistency is key!",
          screen: "today",
          position: "center",
          action: "none",
        },
      ],
    },
    {
      id: "sleep_tracking",
      name: "Sleep Tracking & Optimization",
      description: "Learn how to track your sleep and see how it affects your energy",
      category: "features",
      estimatedTime: 3,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "intro",
          title: "Sleep & Energy Connection",
          description: "Quality sleep is crucial for energy. Let's learn how to track and optimize your sleep.",
          screen: "sleep",
          position: "center",
          action: "none",
        },
        {
          id: "log_sleep",
          title: "Log Your Sleep",
          description: "Record when you went to bed and woke up. Rate your sleep quality on a scale of 1-5.",
          screen: "sleep",
          targetElement: "log_sleep_button",
          position: "bottom",
          action: "tap",
        },
        {
          id: "dream_journal",
          title: "Keep a Dream Journal",
          description: "Optionally record your dreams and mood. This helps identify patterns over time.",
          screen: "sleep",
          targetElement: "dream_journal",
          position: "center",
          action: "none",
        },
        {
          id: "sleep_insights",
          title: "View Sleep Insights",
          description: "See how your sleep duration and quality correlate with your next-day energy levels.",
          screen: "sleep",
          targetElement: "insights_section",
          position: "top",
          action: "none",
        },
      ],
    },
    {
      id: "habit_tracking",
      name: "Building Energy-Boosting Habits",
      description: "Create habits that align with your energy patterns",
      category: "features",
      estimatedTime: 4,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "intro",
          title: "Habits Shape Your Energy",
          description: "Build habits that boost your energy. Track them and see which ones work best for you.",
          screen: "habits",
          position: "center",
          action: "none",
        },
        {
          id: "create_habit",
          title: "Create Your First Habit",
          description: "Tap the '+' button to create a habit. Choose from templates or create a custom one.",
          screen: "habits",
          targetElement: "add_habit_button",
          position: "bottom",
          action: "tap",
        },
        {
          id: "energy_requirement",
          title: "Set Energy Requirements",
          description: "Assign an energy level (low/moderate/high) to each habit. This helps you plan when to do it.",
          screen: "habits",
          targetElement: "energy_requirement",
          position: "center",
          action: "none",
        },
        {
          id: "track_completion",
          title: "Track Daily Completion",
          description: "Check off habits as you complete them. Build streaks to stay motivated!",
          screen: "habits",
          targetElement: "habit_list",
          position: "top",
          action: "tap",
        },
        {
          id: "view_impact",
          title: "See Energy Impact",
          description: "View how each habit affects your energy levels. Double down on what works!",
          screen: "habits",
          targetElement: "impact_stats",
          position: "bottom",
          action: "none",
        },
      ],
    },
    {
      id: "ai_insights",
      name: "Understanding AI Insights",
      description: "Learn how to interpret and act on AI-powered recommendations",
      category: "advanced",
      estimatedTime: 3,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "intro",
          title: "AI-Powered Insights",
          description: "Our AI learns YOUR unique patterns and provides personalized recommendations.",
          screen: "insights",
          position: "center",
          action: "none",
        },
        {
          id: "confidence_scores",
          title: "Confidence Scores",
          description: "Each insight has a confidence score (60-95%). Higher scores mean more reliable predictions.",
          screen: "insights",
          targetElement: "confidence_badge",
          position: "top",
          action: "none",
        },
        {
          id: "correlations",
          title: "Energy Correlations",
          description: "See what factors affect your energy most: sleep, habits, weather, nutrition, and more.",
          screen: "insights",
          targetElement: "correlations_section",
          position: "center",
          action: "none",
        },
        {
          id: "recommendations",
          title: "Actionable Recommendations",
          description: "Get specific advice on what to do today based on your predicted energy levels.",
          screen: "insights",
          targetElement: "recommendations",
          position: "bottom",
          action: "none",
        },
      ],
    },
    {
      id: "social_features",
      name: "Connect with Friends",
      description: "Join challenges, share progress, and stay motivated together",
      category: "features",
      estimatedTime: 3,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "intro",
          title: "Social Features",
          description: "Connect with friends, join challenges, and share your energy journey.",
          screen: "social",
          position: "center",
          action: "none",
        },
        {
          id: "energy_circles",
          title: "Create Energy Circles",
          description: "Form private groups with friends or family. Share energy trends and find optimal times to meet.",
          screen: "energy_circles",
          targetElement: "create_circle_button",
          position: "bottom",
          action: "tap",
        },
        {
          id: "challenges",
          title: "Join Challenges",
          description: "Compete in group challenges to build consistency and stay motivated.",
          screen: "challenges",
          targetElement: "active_challenges",
          position: "center",
          action: "none",
        },
        {
          id: "leaderboard",
          title: "Climb the Leaderboard",
          description: "See how you rank against friends and the community. Earn badges and rewards!",
          screen: "challenges",
          targetElement: "leaderboard",
          position: "top",
          action: "none",
        },
      ],
    },
    {
      id: "premium_features",
      name: "Unlock Premium Features",
      description: "Discover what's available with Energy Today Premium",
      category: "tips",
      estimatedTime: 2,
      completed: false,
      currentStep: 0,
      steps: [
        {
          id: "intro",
          title: "Energy Today Premium",
          description: "Unlock advanced features with Premium: AI coaching, unlimited history, and more.",
          screen: "premium",
          position: "center",
          action: "none",
        },
        {
          id: "ai_coaching",
          title: "AI Coaching Chatbot",
          description: "Get personalized coaching and advice from our AI assistant anytime.",
          screen: "premium",
          targetElement: "ai_coaching_feature",
          position: "top",
          action: "none",
        },
        {
          id: "advanced_analytics",
          title: "Advanced Analytics",
          description: "Access detailed reports, correlations, and exportable data for deep insights.",
          screen: "premium",
          targetElement: "analytics_feature",
          position: "center",
          action: "none",
        },
        {
          id: "unlimited_history",
          title: "Unlimited History",
          description: "Free users get 30 days of history. Premium users get unlimited lifetime access.",
          screen: "premium",
          targetElement: "history_feature",
          position: "bottom",
          action: "none",
        },
      ],
    },
  ];
}

/**
 * Get tutorial by ID
 */
export function getTutorialById(id: string): Tutorial | null {
  return getAllTutorials().find(t => t.id === id) || null;
}

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(category: Tutorial["category"]): Tutorial[] {
  return getAllTutorials().filter(t => t.category === category);
}

/**
 * Start tutorial
 */
export async function startTutorial(tutorialId: string): Promise<void> {
  const progress = await getOnboardingProgress();
  if (!progress) throw new Error("Onboarding not initialized");
  
  progress.currentTutorial = tutorialId;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Complete tutorial step
 */
export async function completeTutorialStep(tutorialId: string, stepId: string): Promise<void> {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) throw new Error("Tutorial not found");
  
  const stepIndex = tutorial.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) throw new Error("Step not found");
  
  tutorial.currentStep = stepIndex + 1;
  tutorial.lastAccessedAt = new Date();
  
  // If last step, mark tutorial as completed
  if (tutorial.currentStep >= tutorial.steps.length) {
    await completeTutorial(tutorialId);
  }
}

/**
 * Complete tutorial
 */
export async function completeTutorial(tutorialId: string): Promise<void> {
  const progress = await getOnboardingProgress();
  if (!progress) throw new Error("Onboarding not initialized");
  
  if (!progress.completedTutorials.includes(tutorialId)) {
    progress.completedTutorials.push(tutorialId);
  }
  
  progress.currentTutorial = undefined;
  
  // Check if all getting_started tutorials are completed
  const gettingStartedTutorials = getTutorialsByCategory("getting_started");
  const allCompleted = gettingStartedTutorials.every(t => 
    progress.completedTutorials.includes(t.id)
  );
  
  if (allCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
    progress.firstTimeUser = false;
  }
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Skip tutorial
 */
export async function skipTutorial(tutorialId: string): Promise<void> {
  const progress = await getOnboardingProgress();
  if (!progress) throw new Error("Onboarding not initialized");
  
  if (!progress.skippedTutorials.includes(tutorialId)) {
    progress.skippedTutorials.push(tutorialId);
  }
  
  progress.currentTutorial = undefined;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Reset tutorial progress
 */
export async function resetTutorial(tutorialId: string): Promise<void> {
  const progress = await getOnboardingProgress();
  if (!progress) throw new Error("Onboarding not initialized");
  
  progress.completedTutorials = progress.completedTutorials.filter(id => id !== tutorialId);
  progress.skippedTutorials = progress.skippedTutorials.filter(id => id !== tutorialId);
  
  if (progress.currentTutorial === tutorialId) {
    progress.currentTutorial = undefined;
  }
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Toggle tooltips
 */
export async function toggleTooltips(enabled: boolean): Promise<void> {
  const progress = await getOnboardingProgress();
  if (!progress) throw new Error("Onboarding not initialized");
  
  progress.showTooltips = enabled;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Get onboarding statistics
 */
export async function getOnboardingStats(): Promise<{
  totalTutorials: number;
  completedTutorials: number;
  skippedTutorials: number;
  inProgressTutorials: number;
  completionRate: number;
  timeSpent: number; // estimated minutes
  isOnboardingComplete: boolean;
}> {
  const progress = await getOnboardingProgress();
  if (!progress) {
    return {
      totalTutorials: 0,
      completedTutorials: 0,
      skippedTutorials: 0,
      inProgressTutorials: 0,
      completionRate: 0,
      timeSpent: 0,
      isOnboardingComplete: false,
    };
  }
  
  const allTutorials = getAllTutorials();
  const completedCount = progress.completedTutorials.length;
  const skippedCount = progress.skippedTutorials.length;
  const inProgressCount = progress.currentTutorial ? 1 : 0;
  const completionRate = (completedCount / allTutorials.length) * 100;
  
  // Calculate estimated time spent
  const completedTutorials = allTutorials.filter(t => 
    progress.completedTutorials.includes(t.id)
  );
  const timeSpent = completedTutorials.reduce((sum, t) => sum + t.estimatedTime, 0);
  
  return {
    totalTutorials: allTutorials.length,
    completedTutorials: completedCount,
    skippedTutorials: skippedCount,
    inProgressTutorials: inProgressCount,
    completionRate,
    timeSpent,
    isOnboardingComplete: !!progress.completedAt,
  };
}

/**
 * Get recommended next tutorial
 */
export async function getRecommendedTutorial(): Promise<Tutorial | null> {
  const progress = await getOnboardingProgress();
  if (!progress) return null;
  
  const allTutorials = getAllTutorials();
  
  // First, recommend getting_started tutorials
  const gettingStarted = allTutorials.filter(
    t => t.category === "getting_started" && 
    !progress.completedTutorials.includes(t.id) &&
    !progress.skippedTutorials.includes(t.id)
  );
  
  if (gettingStarted.length > 0) {
    return gettingStarted[0];
  }
  
  // Then, recommend feature tutorials
  const features = allTutorials.filter(
    t => t.category === "features" && 
    !progress.completedTutorials.includes(t.id) &&
    !progress.skippedTutorials.includes(t.id)
  );
  
  if (features.length > 0) {
    return features[0];
  }
  
  // Finally, recommend advanced tutorials
  const advanced = allTutorials.filter(
    t => (t.category === "advanced" || t.category === "tips") && 
    !progress.completedTutorials.includes(t.id) &&
    !progress.skippedTutorials.includes(t.id)
  );
  
  if (advanced.length > 0) {
    return advanced[0];
  }
  
  return null;
}

/**
 * Check if user should see onboarding
 */
export async function shouldShowOnboarding(): Promise<boolean> {
  const progress = await getOnboardingProgress();
  if (!progress) return true;
  
  // Show onboarding if user hasn't completed getting started tutorials
  const gettingStartedTutorials = getTutorialsByCategory("getting_started");
  const hasCompletedGettingStarted = gettingStartedTutorials.every(t => 
    progress.completedTutorials.includes(t.id)
  );
  
  return !hasCompletedGettingStarted;
}

/**
 * Generate interactive tooltip
 */
export interface Tooltip {
  id: string;
  targetElement: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  action?: string;
  dismissible: boolean;
}

export function getTooltipsForScreen(screen: string): Tooltip[] {
  const tooltips: Record<string, Tooltip[]> = {
    today: [
      {
        id: "energy_meter",
        targetElement: "energy_meter",
        title: "Track Your Energy",
        description: "Tap to log your current energy level",
        position: "bottom",
        action: "Tap to log",
        dismissible: true,
      },
      {
        id: "insights_button",
        targetElement: "insights_button",
        title: "View Insights",
        description: "See AI-powered recommendations",
        position: "left",
        dismissible: true,
      },
    ],
    calendar: [
      {
        id: "calendar_legend",
        targetElement: "calendar_legend",
        title: "Energy Forecast",
        description: "Green = high energy, Yellow = moderate, Red = low",
        position: "top",
        dismissible: true,
      },
    ],
    habits: [
      {
        id: "add_habit",
        targetElement: "add_habit_button",
        title: "Create a Habit",
        description: "Start building energy-boosting habits",
        position: "left",
        action: "Tap to create",
        dismissible: true,
      },
    ],
  };
  
  return tooltips[screen] || [];
}

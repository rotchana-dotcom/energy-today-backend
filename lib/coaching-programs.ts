import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRAMS_KEY = "coaching_programs";
const USER_PROGRAMS_KEY = "user_coaching_programs";
const PROGRAM_PROGRESS_KEY = "program_progress";

export interface CoachingProgram {
  id: string;
  title: string;
  description: string;
  duration: 30 | 60 | 90; // days
  focusArea: "energy" | "stress" | "performance" | "sleep" | "mindfulness" | "fitness";
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: ProgramLesson[];
  milestones: ProgramMilestone[];
}

export interface ProgramLesson {
  day: number;
  title: string;
  content: string;
  actionItems: string[];
  estimatedTime: number; // minutes
  completed: boolean;
}

export interface ProgramMilestone {
  day: number;
  title: string;
  description: string;
  achieved: boolean;
}

export interface UserProgram {
  id: string;
  programId: string;
  startDate: string;
  currentDay: number;
  completedLessons: number[];
  achievedMilestones: number[];
  status: "active" | "paused" | "completed" | "abandoned";
  completionPercentage: number;
}

export interface ProgramRecommendation {
  program: CoachingProgram;
  score: number;
  reason: string;
}

/**
 * Get all available coaching programs
 */
export async function getCoachingPrograms(): Promise<CoachingProgram[]> {
  // In a real implementation, these would be fetched from a server
  // For now, return hardcoded programs
  
  return [
    {
      id: "energy_30",
      title: "30-Day Energy Optimization",
      description: "Transform your energy levels in just one month with daily lessons and actionable tips",
      duration: 30,
      focusArea: "energy",
      difficulty: "beginner",
      lessons: generateLessons(30, "energy"),
      milestones: generateMilestones(30),
    },
    {
      id: "stress_60",
      title: "60-Day Stress Reduction",
      description: "Master stress management techniques and build resilience over two months",
      duration: 60,
      focusArea: "stress",
      difficulty: "intermediate",
      lessons: generateLessons(60, "stress"),
      milestones: generateMilestones(60),
    },
    {
      id: "performance_90",
      title: "90-Day Peak Performance",
      description: "Achieve your highest potential with a comprehensive three-month program",
      duration: 90,
      focusArea: "performance",
      difficulty: "advanced",
      lessons: generateLessons(90, "performance"),
      milestones: generateMilestones(90),
    },
    {
      id: "sleep_30",
      title: "30-Day Sleep Mastery",
      description: "Improve your sleep quality and wake up refreshed every day",
      duration: 30,
      focusArea: "sleep",
      difficulty: "beginner",
      lessons: generateLessons(30, "sleep"),
      milestones: generateMilestones(30),
    },
    {
      id: "mindfulness_60",
      title: "60-Day Mindfulness Journey",
      description: "Develop a sustainable mindfulness practice for lasting peace and clarity",
      duration: 60,
      focusArea: "mindfulness",
      difficulty: "intermediate",
      lessons: generateLessons(60, "mindfulness"),
      milestones: generateMilestones(60),
    },
  ];
}

/**
 * Generate lessons for a program (helper function)
 */
function generateLessons(duration: number, focusArea: string): ProgramLesson[] {
  const lessons: ProgramLesson[] = [];
  
  for (let day = 1; day <= duration; day++) {
    lessons.push({
      day,
      title: `Day ${day}: ${getLessonTitle(day, focusArea)}`,
      content: getLessonContent(day, focusArea),
      actionItems: getActionItems(day, focusArea),
      estimatedTime: 10 + Math.floor(day / 10) * 5, // Gradually increase time
      completed: false,
    });
  }
  
  return lessons;
}

/**
 * Generate milestones for a program (helper function)
 */
function generateMilestones(duration: number): ProgramMilestone[] {
  const milestones: ProgramMilestone[] = [];
  const milestonePoints = [7, 14, 21, 30, 45, 60, 75, 90].filter((d) => d <= duration);
  
  milestonePoints.forEach((day) => {
    milestones.push({
      day,
      title: `${day}-Day Milestone`,
      description: `You've completed ${day} days of your program!`,
      achieved: false,
    });
  });
  
  return milestones;
}

/**
 * Get lesson title based on day and focus area
 */
function getLessonTitle(day: number, focusArea: string): string {
  const titles: { [key: string]: string[] } = {
    energy: [
      "Understanding Your Energy Patterns",
      "Morning Routine Optimization",
      "Nutrition for Sustained Energy",
      "The Power of Movement",
      "Strategic Rest and Recovery",
    ],
    stress: [
      "Identifying Your Stress Triggers",
      "Breathing Techniques for Calm",
      "Building Resilience",
      "Time Management Mastery",
      "Creating Healthy Boundaries",
    ],
    performance: [
      "Setting Clear Goals",
      "Peak Performance Mindset",
      "Flow State Activation",
      "Productivity Systems",
      "Continuous Improvement",
    ],
    sleep: [
      "Sleep Hygiene Fundamentals",
      "Creating the Perfect Sleep Environment",
      "Wind-Down Rituals",
      "Managing Sleep Disruptors",
      "Optimizing Your Sleep Schedule",
    ],
    mindfulness: [
      "Introduction to Mindfulness",
      "Present Moment Awareness",
      "Mindful Breathing",
      "Body Scan Meditation",
      "Integrating Mindfulness Daily",
    ],
  };
  
  const focusTitles = titles[focusArea] || titles.energy;
  const index = (day - 1) % focusTitles.length;
  return focusTitles[index];
}

/**
 * Get lesson content based on day and focus area
 */
function getLessonContent(day: number, focusArea: string): string {
  return `Welcome to Day ${day} of your ${focusArea} program!\n\nToday's lesson focuses on practical strategies you can implement immediately. Take your time to read through the content and complete the action items below.\n\nRemember: consistency is key. Small daily improvements lead to remarkable long-term results.`;
}

/**
 * Get action items based on day and focus area
 */
function getActionItems(day: number, focusArea: string): string[] {
  const items: { [key: string]: string[] } = {
    energy: [
      "Track your energy levels at 3 different times today",
      "Drink 8 glasses of water",
      "Take a 15-minute walk",
      "Eat a balanced breakfast within 1 hour of waking",
      "Get 7-8 hours of sleep tonight",
    ],
    stress: [
      "Practice 5 minutes of deep breathing",
      "Identify one stress trigger and plan how to manage it",
      "Take 3 short breaks during work",
      "Write down 3 things you're grateful for",
      "Spend 10 minutes doing something you enjoy",
    ],
    performance: [
      "Set one clear goal for today",
      "Work in focused 25-minute blocks",
      "Review your progress at end of day",
      "Eliminate one distraction from your workspace",
      "Celebrate one small win",
    ],
    sleep: [
      "Set a consistent bedtime",
      "Avoid screens 1 hour before bed",
      "Keep your bedroom cool and dark",
      "Practice a 10-minute wind-down routine",
      "Track your sleep quality",
    ],
    mindfulness: [
      "Practice 5 minutes of meditation",
      "Notice 3 things you can see, hear, and feel",
      "Eat one meal mindfully without distractions",
      "Take 3 mindful breaths when stressed",
      "Reflect on your day in a journal",
    ],
  };
  
  const focusItems = items[focusArea] || items.energy;
  const startIndex = (day - 1) % focusItems.length;
  return [
    focusItems[startIndex],
    focusItems[(startIndex + 1) % focusItems.length],
    focusItems[(startIndex + 2) % focusItems.length],
  ];
}

/**
 * Get user's active programs
 */
export async function getUserPrograms(): Promise<UserProgram[]> {
  try {
    const data = await AsyncStorage.getItem(USER_PROGRAMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get user programs:", error);
    return [];
  }
}

/**
 * Start a new program
 */
export async function startProgram(programId: string): Promise<UserProgram> {
  try {
    const programs = await getUserPrograms();
    
    // Check if already enrolled
    const existing = programs.find((p) => p.programId === programId && p.status === "active");
    if (existing) {
      throw new Error("You are already enrolled in this program");
    }
    
    const newProgram: UserProgram = {
      id: `user_program_${Date.now()}`,
      programId,
      startDate: new Date().toISOString(),
      currentDay: 1,
      completedLessons: [],
      achievedMilestones: [],
      status: "active",
      completionPercentage: 0,
    };
    
    programs.push(newProgram);
    await AsyncStorage.setItem(USER_PROGRAMS_KEY, JSON.stringify(programs));
    
    return newProgram;
  } catch (error) {
    console.error("Failed to start program:", error);
    throw error;
  }
}

/**
 * Complete a lesson
 */
export async function completeLesson(userProgramId: string, day: number): Promise<void> {
  try {
    const programs = await getUserPrograms();
    const program = programs.find((p) => p.id === userProgramId);
    
    if (!program) {
      throw new Error("Program not found");
    }
    
    if (!program.completedLessons.includes(day)) {
      program.completedLessons.push(day);
      program.currentDay = Math.max(program.currentDay, day + 1);
      
      // Update completion percentage
      const allPrograms = await getCoachingPrograms();
      const programDetails = allPrograms.find((p) => p.id === program.programId);
      if (programDetails) {
        program.completionPercentage = Math.round(
          (program.completedLessons.length / programDetails.lessons.length) * 100
        );
        
        // Check if program is completed
        if (program.completionPercentage === 100) {
          program.status = "completed";
        }
      }
      
      await AsyncStorage.setItem(USER_PROGRAMS_KEY, JSON.stringify(programs));
    }
  } catch (error) {
    console.error("Failed to complete lesson:", error);
    throw error;
  }
}

/**
 * Achieve a milestone
 */
export async function achieveMilestone(userProgramId: string, day: number): Promise<void> {
  try {
    const programs = await getUserPrograms();
    const program = programs.find((p) => p.id === userProgramId);
    
    if (!program) {
      throw new Error("Program not found");
    }
    
    if (!program.achievedMilestones.includes(day)) {
      program.achievedMilestones.push(day);
      await AsyncStorage.setItem(USER_PROGRAMS_KEY, JSON.stringify(programs));
    }
  } catch (error) {
    console.error("Failed to achieve milestone:", error);
    throw error;
  }
}

/**
 * Pause a program
 */
export async function pauseProgram(userProgramId: string): Promise<void> {
  try {
    const programs = await getUserPrograms();
    const program = programs.find((p) => p.id === userProgramId);
    
    if (!program) {
      throw new Error("Program not found");
    }
    
    program.status = "paused";
    await AsyncStorage.setItem(USER_PROGRAMS_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error("Failed to pause program:", error);
    throw error;
  }
}

/**
 * Resume a program
 */
export async function resumeProgram(userProgramId: string): Promise<void> {
  try {
    const programs = await getUserPrograms();
    const program = programs.find((p) => p.id === userProgramId);
    
    if (!program) {
      throw new Error("Program not found");
    }
    
    program.status = "active";
    await AsyncStorage.setItem(USER_PROGRAMS_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error("Failed to resume program:", error);
    throw error;
  }
}

/**
 * Get program recommendations based on user data
 */
export async function getProgramRecommendations(): Promise<ProgramRecommendation[]> {
  const allPrograms = await getCoachingPrograms();
  const userPrograms = await getUserPrograms();
  
  // Filter out programs user is already enrolled in
  const enrolledProgramIds = userPrograms
    .filter((p) => p.status === "active" || p.status === "paused")
    .map((p) => p.programId);
  
  const availablePrograms = allPrograms.filter(
    (p) => !enrolledProgramIds.includes(p.id)
  );
  
  // Simple scoring based on focus area (in real app, would use user data)
  const recommendations: ProgramRecommendation[] = availablePrograms.map((program) => {
    let score = 50; // Base score
    let reason = "";
    
    // Prioritize shorter programs for beginners
    if (program.duration === 30) {
      score += 20;
      reason = "Great starting point with manageable daily commitment";
    }
    
    // Boost energy and stress programs (most common needs)
    if (program.focusArea === "energy" || program.focusArea === "stress") {
      score += 15;
      reason = "Addresses common wellness challenges";
    }
    
    return {
      program,
      score,
      reason: reason || "Recommended based on your profile",
    };
  });
  
  // Sort by score
  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get program progress summary
 */
export async function getProgramProgress(userProgramId: string): Promise<{
  currentDay: number;
  totalDays: number;
  completedLessons: number;
  totalLessons: number;
  achievedMilestones: number;
  totalMilestones: number;
  completionPercentage: number;
  streak: number;
  nextLesson: ProgramLesson | null;
  nextMilestone: ProgramMilestone | null;
}> {
  const programs = await getUserPrograms();
  const userProgram = programs.find((p) => p.id === userProgramId);
  
  if (!userProgram) {
    throw new Error("Program not found");
  }
  
  const allPrograms = await getCoachingPrograms();
  const programDetails = allPrograms.find((p) => p.id === userProgram.programId);
  
  if (!programDetails) {
    throw new Error("Program details not found");
  }
  
  // Calculate streak (consecutive days completed)
  let streak = 0;
  const sortedLessons = [...userProgram.completedLessons].sort((a, b) => b - a);
  for (let i = 0; i < sortedLessons.length; i++) {
    if (i === 0 || sortedLessons[i] === sortedLessons[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }
  
  // Find next lesson
  const nextLesson = programDetails.lessons.find(
    (lesson) => !userProgram.completedLessons.includes(lesson.day)
  ) || null;
  
  // Find next milestone
  const nextMilestone = programDetails.milestones.find(
    (milestone) => !userProgram.achievedMilestones.includes(milestone.day)
  ) || null;
  
  return {
    currentDay: userProgram.currentDay,
    totalDays: programDetails.duration,
    completedLessons: userProgram.completedLessons.length,
    totalLessons: programDetails.lessons.length,
    achievedMilestones: userProgram.achievedMilestones.length,
    totalMilestones: programDetails.milestones.length,
    completionPercentage: userProgram.completionPercentage,
    streak,
    nextLesson,
    nextMilestone,
  };
}

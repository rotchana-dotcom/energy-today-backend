/**
 * 30-Day Wellness Plans
 * 
 * Personalized wellness programs combining meditation, diet, sleep, and energy practices
 * Based on user goals and integrated with 7 esoteric systems for optimal timing
 */

import { getMoonPhase, getMoonPhaseName } from "./lunar-cycle";

export type WellnessGoal =
  | "weight_loss"
  | "better_sleep"
  | "stress_reduction"
  | "energy_boost"
  | "spiritual_growth"
  | "fitness_improvement";

export interface WellnessPlan {
  id: string;
  title: string;
  goal: WellnessGoal;
  description: string;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  dailyTasks: DailyTask[];
  progress: number; // 0-100
  completedDays: number;
}

export interface DailyTask {
  day: number; // 1-30
  date: Date;
  tasks: Task[];
  moonPhase: number;
  moonPhaseName: string;
  energyFocus: string; // Which chakra or energy to focus on
  completed: boolean;
}

export interface Task {
  id: string;
  type: "sleep" | "meditation" | "diet" | "exercise" | "reflection";
  title: string;
  description: string;
  duration?: number; // minutes
  target?: number; // e.g., calories, hours
  completed: boolean;
  time?: string; // Suggested time "07:00"
}

/**
 * Generate a personalized 30-day wellness plan
 */
export function generateWellnessPlan(
  goal: WellnessGoal,
  userProfile: {
    name: string;
    birthDate: string;
    currentWeight?: number;
    targetWeight?: number;
    sleepGoal?: number;
  }
): WellnessPlan {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const planTemplates = {
    weight_loss: generateWeightLossPlan(startDate, userProfile),
    better_sleep: generateBetterSleepPlan(startDate, userProfile),
    stress_reduction: generateStressReductionPlan(startDate, userProfile),
    energy_boost: generateEnergyBoostPlan(startDate, userProfile),
    spiritual_growth: generateSpiritualGrowthPlan(startDate, userProfile),
    fitness_improvement: generateFitnessPlan(startDate, userProfile),
  };

  const plan = planTemplates[goal];

  return {
    id: `plan_${Date.now()}`,
    ...plan,
    goal,
    duration: 30,
    startDate,
    endDate,
    progress: 0,
    completedDays: 0,
  };
}

/**
 * Weight Loss Plan (30 days)
 */
function generateWeightLossPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const tasks: Task[] = [
      {
        id: `sleep_${day}`,
        type: "sleep",
        title: "Quality Sleep",
        description: "Get 7-8 hours of sleep to support metabolism",
        target: 7.5,
        completed: false,
        time: "22:00",
      },
      {
        id: `diet_${day}`,
        type: "diet",
        title: "Calorie Target",
        description: "Stay within your daily calorie goal",
        target: 1800,
        completed: false,
      },
      {
        id: `exercise_${day}`,
        type: "exercise",
        title: day <= 10 ? "Light Walk" : day <= 20 ? "Brisk Walk" : "Cardio Session",
        description: day <= 10 ? "20-minute gentle walk" : day <= 20 ? "30-minute brisk walk" : "40-minute cardio workout",
        duration: day <= 10 ? 20 : day <= 20 ? 30 : 40,
        completed: false,
        time: "07:00",
      },
      {
        id: `meditation_${day}`,
        type: "meditation",
        title: "Mindful Eating Meditation",
        description: "Practice mindful eating before your largest meal",
        duration: 5,
        completed: false,
        time: "12:00",
      },
    ];

    // Add lunar-specific tasks
    if (moonPhaseName === "New Moon") {
      tasks.push({
        id: `reflection_${day}`,
        type: "reflection",
        title: "Set Weekly Intentions",
        description: "New moon energy: Set your weight loss intentions for this week",
        duration: 10,
        completed: false,
      });
    } else if (moonPhaseName === "Full Moon") {
      tasks.push({
        id: `reflection_${day}`,
        type: "reflection",
        title: "Release & Celebrate",
        description: "Full moon energy: Release old habits, celebrate progress",
        duration: 10,
        completed: false,
      });
    }

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: day <= 10 ? "Root Chakra (Grounding)" : day <= 20 ? "Solar Plexus (Willpower)" : "Heart Chakra (Self-Love)",
      completed: false,
    });
  }

  return {
    title: "30-Day Weight Loss Journey",
    description: "A holistic approach to healthy weight loss combining mindful eating, exercise, and lunar energy alignment",
    dailyTasks,
  };
}

/**
 * Better Sleep Plan (30 days)
 */
function generateBetterSleepPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const tasks: Task[] = [
      {
        id: `sleep_${day}`,
        type: "sleep",
        title: "Consistent Bedtime",
        description: "Go to bed at the same time every night",
        target: 8,
        completed: false,
        time: moonPhaseName === "Full Moon" ? "21:30" : "22:00", // Earlier on full moons
      },
      {
        id: `meditation_${day}`,
        type: "meditation",
        title: "Bedtime Meditation",
        description: "Lunar Sleep Meditation or Deep Relaxation",
        duration: 10,
        completed: false,
        time: "21:30",
      },
      {
        id: `diet_${day}`,
        type: "diet",
        title: "No Late Eating",
        description: "Finish dinner 3 hours before bed",
        completed: false,
        time: "18:00",
      },
      {
        id: `reflection_${day}`,
        type: "reflection",
        title: "Sleep Journal",
        description: "Record sleep quality and note any patterns",
        duration: 5,
        completed: false,
      },
    ];

    // Add lunar-specific guidance
    if (moonPhaseName === "Full Moon") {
      tasks[0].description += " (Full moon may affect sleep - use blackout curtains)";
    }

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: day <= 10 ? "Third Eye (Intuition)" : day <= 20 ? "Crown Chakra (Peace)" : "All Chakras (Balance)",
      completed: false,
    });
  }

  return {
    title: "30-Day Sleep Optimization",
    description: "Align your sleep with lunar cycles and establish healthy sleep habits for deep, restorative rest",
    dailyTasks,
  };
}

/**
 * Stress Reduction Plan (30 days)
 */
function generateStressReductionPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const meditationProgression = [
      { title: "Basic Breathing", duration: 5 },
      { title: "Present Moment Awareness", duration: 10 },
      { title: "Stress Release Meditation", duration: 15 },
      { title: "Inner Peace Meditation", duration: 20 },
    ];

    const currentMeditation = meditationProgression[Math.min(Math.floor((day - 1) / 7), 3)];

    const tasks: Task[] = [
      {
        id: `meditation_morning_${day}`,
        type: "meditation",
        title: `Morning ${currentMeditation.title}`,
        description: "Start your day centered and calm",
        duration: currentMeditation.duration,
        completed: false,
        time: "07:00",
      },
      {
        id: `meditation_evening_${day}`,
        type: "meditation",
        title: "Evening Relaxation",
        description: "Release the day's stress",
        duration: 10,
        completed: false,
        time: "19:00",
      },
      {
        id: `exercise_${day}`,
        type: "exercise",
        title: "Gentle Movement",
        description: "Yoga, tai chi, or gentle stretching",
        duration: 20,
        completed: false,
        time: "08:00",
      },
      {
        id: `reflection_${day}`,
        type: "reflection",
        title: "Gratitude Practice",
        description: "Write 3 things you're grateful for",
        duration: 5,
        completed: false,
        time: "20:00",
      },
    ];

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: day <= 10 ? "Heart Chakra (Love)" : day <= 20 ? "Throat Chakra (Expression)" : "Crown Chakra (Peace)",
      completed: false,
    });
  }

  return {
    title: "30-Day Stress Relief Program",
    description: "Progressive meditation practice combined with gentle movement and gratitude to melt away stress",
    dailyTasks,
  };
}

/**
 * Energy Boost Plan (30 days)
 */
function generateEnergyBoostPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const tasks: Task[] = [
      {
        id: `meditation_${day}`,
        type: "meditation",
        title: "Morning Energy Activation",
        description: "Activate your chi and set powerful intentions",
        duration: 10,
        completed: false,
        time: "06:00",
      },
      {
        id: `exercise_${day}`,
        type: "exercise",
        title: "Energizing Movement",
        description: "High-energy workout or dynamic yoga",
        duration: 30,
        completed: false,
        time: "07:00",
      },
      {
        id: `diet_${day}`,
        type: "diet",
        title: "Energy-Boosting Foods",
        description: "Focus on whole foods, protein, and complex carbs",
        target: 2200,
        completed: false,
      },
      {
        id: `sleep_${day}`,
        type: "sleep",
        title: "Quality Rest",
        description: "7-8 hours to recharge your energy",
        target: 7.5,
        completed: false,
        time: "22:00",
      },
    ];

    // Waxing moon: building energy
    if (moonPhase >= 0 && moonPhase < 0.5) {
      tasks[0].description += " (Waxing moon: perfect for building energy!)";
    }

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: day <= 10 ? "Root Chakra (Vitality)" : day <= 20 ? "Solar Plexus (Power)" : "All Chakras (Peak Energy)",
      completed: false,
    });
  }

  return {
    title: "30-Day Energy Amplification",
    description: "Harness lunar cycles and chi practices to dramatically boost your daily energy levels",
    dailyTasks,
  };
}

/**
 * Spiritual Growth Plan (30 days)
 */
function generateSpiritualGrowthPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const tasks: Task[] = [
      {
        id: `meditation_${day}`,
        type: "meditation",
        title: day <= 10 ? "Basic Meditation" : day <= 20 ? "Chi Energy Flow" : "Transcendental Practice",
        description: "Deepen your spiritual connection",
        duration: day <= 10 ? 15 : day <= 20 ? 20 : 30,
        completed: false,
        time: "06:00",
      },
      {
        id: `reflection_${day}`,
        type: "reflection",
        title: "Spiritual Journal",
        description: "Record insights, dreams, and spiritual experiences",
        duration: 15,
        completed: false,
        time: "21:00",
      },
      {
        id: `exercise_${day}`,
        type: "exercise",
        title: "Mindful Movement",
        description: "Yoga, qigong, or walking meditation",
        duration: 30,
        completed: false,
        time: "07:00",
      },
    ];

    // Lunar-specific spiritual practices
    if (moonPhaseName === "New Moon") {
      tasks.push({
        id: `ritual_${day}`,
        type: "reflection",
        title: "New Moon Ritual",
        description: "Set intentions, plant spiritual seeds",
        duration: 20,
        completed: false,
        time: "20:00",
      });
    } else if (moonPhaseName === "Full Moon") {
      tasks.push({
        id: `ritual_${day}`,
        type: "reflection",
        title: "Full Moon Ceremony",
        description: "Release, gratitude, and illumination",
        duration: 20,
        completed: false,
        time: "20:00",
      });
    }

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"][Math.floor((day - 1) / 4) % 7] + " Chakra",
      completed: false,
    });
  }

  return {
    title: "30-Day Spiritual Awakening",
    description: "A transformative journey through meditation, lunar rituals, and chakra activation",
    dailyTasks,
  };
}

/**
 * Fitness Improvement Plan (30 days)
 */
function generateFitnessPlan(
  startDate: Date,
  userProfile: any
): Omit<WellnessPlan, "id" | "goal" | "duration" | "startDate" | "endDate" | "progress" | "completedDays"> {
  const dailyTasks: DailyTask[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day - 1));
    const moonPhase = getMoonPhase(date);
    const moonPhaseName = getMoonPhaseName(moonPhase);

    const workoutIntensity = day <= 10 ? "Beginner" : day <= 20 ? "Intermediate" : "Advanced";
    const workoutDuration = day <= 10 ? 20 : day <= 20 ? 30 : 40;

    const tasks: Task[] = [
      {
        id: `exercise_${day}`,
        type: "exercise",
        title: `${workoutIntensity} Workout`,
        description: day % 2 === 0 ? "Strength training" : "Cardio session",
        duration: workoutDuration,
        completed: false,
        time: "07:00",
      },
      {
        id: `diet_${day}`,
        type: "diet",
        title: "Protein & Nutrition",
        description: "High protein, balanced macros for muscle growth",
        target: 2400,
        completed: false,
      },
      {
        id: `sleep_${day}`,
        type: "sleep",
        title: "Recovery Sleep",
        description: "8 hours for muscle recovery and growth",
        target: 8,
        completed: false,
        time: "22:00",
      },
      {
        id: `meditation_${day}`,
        type: "meditation",
        title: "Body Scan Meditation",
        description: "Connect with your body and recovery",
        duration: 10,
        completed: false,
        time: "20:00",
      },
    ];

    // Rest day every 7 days
    if (day % 7 === 0) {
      tasks[0] = {
        id: `rest_${day}`,
        type: "exercise",
        title: "Active Recovery",
        description: "Gentle stretching, yoga, or light walk",
        duration: 20,
        completed: false,
        time: "10:00",
      };
    }

    dailyTasks.push({
      day,
      date,
      tasks,
      moonPhase,
      moonPhaseName,
      energyFocus: day <= 10 ? "Root Chakra (Foundation)" : day <= 20 ? "Solar Plexus (Strength)" : "All Chakras (Peak Performance)",
      completed: false,
    });
  }

  return {
    title: "30-Day Fitness Transformation",
    description: "Progressive workout program with proper nutrition, recovery, and energy alignment",
    dailyTasks,
  };
}

/**
 * Mark a task as completed
 */
export function completeTask(plan: WellnessPlan, day: number, taskId: string): WellnessPlan {
  const updatedPlan = { ...plan };
  const dailyTask = updatedPlan.dailyTasks.find((dt) => dt.day === day);
  
  if (dailyTask) {
    const task = dailyTask.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = true;
    }

    // Check if all tasks for the day are completed
    dailyTask.completed = dailyTask.tasks.every((t) => t.completed);
    
    if (dailyTask.completed) {
      updatedPlan.completedDays++;
    }
  }

  // Update progress
  updatedPlan.progress = Math.round((updatedPlan.completedDays / 30) * 100);

  return updatedPlan;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveExerciseData, type ExerciseData } from "@/app/services/correlation-engine";

export type WorkoutType =
  | "cardio"
  | "strength"
  | "yoga"
  | "pilates"
  | "hiit"
  | "walking"
  | "running"
  | "cycling"
  | "swimming"
  | "sports"
  | "other";

export interface Workout {
  id: string;
  type: WorkoutType;
  duration: number; // minutes
  intensity: "low" | "moderate" | "high";
  timestamp: string;
  notes?: string;
  caloriesBurned?: number;
}

export interface WorkoutInsights {
  totalWorkouts: number;
  totalMinutes: number;
  averageIntensity: number;
  favoriteType: WorkoutType;
  optimalTiming: string;
  energyRecoveryPattern: {
    immediate: number; // energy change 0-2 hours after
    shortTerm: number; // energy change 2-6 hours after
    nextDay: number; // energy change next day
  };
  recommendations: string[];
}

const STORAGE_KEY = "@energy_today:workouts";

export async function saveWorkout(workout: Omit<Workout, "id">): Promise<Workout> {
  const workouts = await getWorkouts();
  const newWorkout: Workout = {
    ...workout,
    id: Date.now().toString(),
  };
  workouts.push(newWorkout);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  
  // Also save to correlation engine
  const workoutDate = new Date(workout.timestamp);
  const dateStr = workoutDate.toISOString().split('T')[0];
  
  // Map workout types to exercise types
  const typeMap: Record<WorkoutType, ExerciseData["type"]> = {
    cardio: "cardio",
    strength: "strength",
    yoga: "yoga",
    pilates: "yoga",
    hiit: "cardio",
    walking: "walking",
    running: "cardio",
    cycling: "cardio",
    swimming: "cardio",
    sports: "sports",
    other: "other",
  };
  
  const intensityMap = { low: "light", moderate: "moderate", high: "intense" } as const;
  
  const correlationData: ExerciseData = {
    date: dateStr,
    type: typeMap[workout.type],
    duration: workout.duration,
    intensity: intensityMap[workout.intensity],
    feeling: workout.notes,
  };
  
  await saveExerciseData(correlationData);
  
  return newWorkout;
}

export async function getWorkouts(): Promise<Workout[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getWorkoutsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Workout[]> {
  const workouts = await getWorkouts();
  return workouts.filter((workout) => {
    const workoutDate = new Date(workout.timestamp);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function calculateWorkoutInsights(
  energyData: Array<{ date: string; score: number }>
): Promise<WorkoutInsights> {
  const workouts = await getWorkouts();
  
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalMinutes: 0,
      averageIntensity: 0,
      favoriteType: "cardio",
      optimalTiming: "morning",
      energyRecoveryPattern: { immediate: 0, shortTerm: 0, nextDay: 0 },
      recommendations: ["Start tracking workouts to see insights!"],
    };
  }

  // Calculate basic stats
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  
  const intensityMap = { low: 1, moderate: 2, high: 3 };
  const avgIntensity =
    workouts.reduce((sum, w) => sum + intensityMap[w.intensity], 0) / totalWorkouts;

  // Find favorite type
  const typeCounts = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {} as Record<WorkoutType, number>);
  const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0] as WorkoutType;

  // Analyze timing
  const hourCounts = workouts.reduce((acc, w) => {
    const hour = new Date(w.timestamp).getHours();
    const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    acc[period] = (acc[period] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const optimalTiming = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0];

  // Calculate energy recovery patterns
  const recoveryPattern = { immediate: 0, shortTerm: 0, nextDay: 0 };
  let recoveryCount = 0;

  workouts.forEach((workout) => {
    const workoutDate = new Date(workout.timestamp);
    
    // Find energy before workout
    const beforeEnergy = energyData.find((e) => {
      const eDate = new Date(e.date);
      return Math.abs(eDate.getTime() - workoutDate.getTime()) < 2 * 60 * 60 * 1000;
    });

    if (beforeEnergy) {
      // Immediate (0-2 hours)
      const immediate = energyData.find((e) => {
        const eDate = new Date(e.date);
        const diff = eDate.getTime() - workoutDate.getTime();
        return diff > 0 && diff < 2 * 60 * 60 * 1000;
      });
      if (immediate) {
        recoveryPattern.immediate += immediate.score - beforeEnergy.score;
      }

      // Short term (2-6 hours)
      const shortTerm = energyData.find((e) => {
        const eDate = new Date(e.date);
        const diff = eDate.getTime() - workoutDate.getTime();
        return diff > 2 * 60 * 60 * 1000 && diff < 6 * 60 * 60 * 1000;
      });
      if (shortTerm) {
        recoveryPattern.shortTerm += shortTerm.score - beforeEnergy.score;
      }

      // Next day
      const nextDay = energyData.find((e) => {
        const eDate = new Date(e.date);
        const diff = eDate.getTime() - workoutDate.getTime();
        return diff > 20 * 60 * 60 * 1000 && diff < 28 * 60 * 60 * 1000;
      });
      if (nextDay) {
        recoveryPattern.nextDay += nextDay.score - beforeEnergy.score;
        recoveryCount++;
      }
    }
  });

  if (recoveryCount > 0) {
    recoveryPattern.immediate /= recoveryCount;
    recoveryPattern.shortTerm /= recoveryCount;
    recoveryPattern.nextDay /= recoveryCount;
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (avgIntensity > 2.5) {
    recommendations.push("Consider adding more low-intensity recovery workouts");
  }
  
  if (recoveryPattern.nextDay < 0) {
    recommendations.push("Your workouts may be too intense - allow more recovery time");
  } else if (recoveryPattern.nextDay > 5) {
    recommendations.push("Great! Your workouts are boosting next-day energy");
  }

  if (totalMinutes / 7 < 150) {
    recommendations.push("Aim for 150+ minutes of exercise per week for optimal health");
  }

  if (optimalTiming === "evening" && recoveryPattern.nextDay < 0) {
    recommendations.push("Try morning workouts - evening exercise may affect your recovery");
  }

  return {
    totalWorkouts,
    totalMinutes,
    averageIntensity: avgIntensity,
    favoriteType,
    optimalTiming,
    energyRecoveryPattern: recoveryPattern,
    recommendations,
  };
}

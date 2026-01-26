/**
 * Collect User Data Helper
 * 
 * Collects all user data from AsyncStorage for AI analytics
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserDataForAnalytics {
  // User Profile
  birthday?: string;
  birthTime?: string;
  birthLocation?: string;
  
  // Activity Logs
  energyLogs: Array<{
    date: string;
    time?: string;
    score: number;
    notes?: string;
  }>;
  meditationSessions: Array<{
    date: string;
    time?: string;
    duration: number;
    type: string;
    energyBefore?: number;
    energyAfter?: number;
  }>;
  dietLogs: Array<{
    date: string;
    time?: string;
    meal: string;
    energyImpact?: string;
  }>;
  sleepData: Array<{
    date: string;
    bedtime?: string;
    wakeTime?: string;
    duration?: number;
    quality?: number;
  }>;
  chiLogs: Array<{
    date: string;
    time?: string;
    energyLevel: number;
    balanceLevel: number;
    notes?: string;
  }>;
  workoutLogs: Array<{
    date: string;
    time?: string;
    type: string;
    duration: number;
    intensity: string;
  }>;
  journalEntries: Array<{
    date: string;
    time?: string;
    mood?: string;
    content?: string;
  }>;
  taskCompletions: Array<{
    date: string;
    time?: string;
    title: string;
    category: string;
    completed: boolean;
    energyRequired?: string;
  }>;
}

/**
 * Collect all user data from AsyncStorage for the past N days
 */
export async function collectUserDataForAnalytics(days: number = 30): Promise<UserDataForAnalytics> {
  const now = new Date();
  const userData: UserDataForAnalytics = {
    energyLogs: [],
    meditationSessions: [],
    dietLogs: [],
    sleepData: [],
    chiLogs: [],
    workoutLogs: [],
    journalEntries: [],
    taskCompletions: []
  };

  // Collect user profile (birthday, birth time, birth location)
  try {
    const profile = await AsyncStorage.getItem('user_profile');
    if (profile) {
      const profileData = JSON.parse(profile);
      userData.birthday = profileData.birthday || profileData.birthDate;
      userData.birthTime = profileData.birthTime;
      userData.birthLocation = profileData.birthLocation || profileData.birthPlace;
    }
  } catch (e) {
    console.error('Error parsing user profile:', e);
  }

  // Collect energy logs
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const scoreStr = await AsyncStorage.getItem(`energy_score_${dateKey}`);
    if (scoreStr) {
      userData.energyLogs.push({
        date: dateKey,
        score: parseInt(scoreStr)
      });
    }
  }

  // Collect meditation sessions
  const meditationStr = await AsyncStorage.getItem('meditation_history');
  if (meditationStr) {
    try {
      const sessions = JSON.parse(meditationStr);
      if (Array.isArray(sessions)) {
        userData.meditationSessions = sessions
          .filter((s: any) => {
            const sessionDate = new Date(s.date || s.timestamp);
            const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((s: any) => ({
            date: s.date || new Date(s.timestamp).toISOString().split('T')[0],
            time: s.time,
            duration: s.duration || 0,
            type: s.type || 'general',
            energyBefore: s.energyBefore,
            energyAfter: s.energyAfter
          }));
      }
    } catch (e) {
      console.error('Error parsing meditation history:', e);
    }
  }

  // Collect diet logs
  const dietStr = await AsyncStorage.getItem('diet_logs');
  if (dietStr) {
    try {
      const logs = JSON.parse(dietStr);
      if (Array.isArray(logs)) {
        userData.dietLogs = logs
          .filter((l: any) => {
            const logDate = new Date(l.date);
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((l: any) => ({
            date: l.date,
            time: l.time,
            meal: l.meal || l.description || 'Unknown',
            energyImpact: l.energyImpact || l.impact
          }));
      }
    } catch (e) {
      console.error('Error parsing diet logs:', e);
    }
  }

  // Collect sleep data
  const sleepStr = await AsyncStorage.getItem('sleep_logs');
  if (sleepStr) {
    try {
      const logs = JSON.parse(sleepStr);
      if (Array.isArray(logs)) {
        userData.sleepData = logs
          .filter((l: any) => {
            const logDate = new Date(l.date);
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((l: any) => ({
            date: l.date,
            bedtime: l.bedtime,
            wakeTime: l.wakeTime || l.wakeup,
            duration: l.duration || l.hours,
            quality: l.quality || l.score
          }));
      }
    } catch (e) {
      console.error('Error parsing sleep logs:', e);
    }
  }

  // Collect task completions
  const tasksStr = await AsyncStorage.getItem('tasks');
  if (tasksStr) {
    try {
      const tasks = JSON.parse(tasksStr);
      if (Array.isArray(tasks)) {
        userData.taskCompletions = tasks
          .filter((t: any) => {
            if (!t.completedAt && !t.createdAt) return false;
            const taskDate = new Date(t.completedAt || t.createdAt);
            const daysDiff = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((t: any) => ({
            date: t.completedAt || t.createdAt,
            time: t.time,
            title: t.title || t.name || 'Untitled',
            category: t.category || 'general',
            completed: t.completed || t.status === 'completed',
            energyRequired: t.energyRequirement || t.energy
          }));
      }
    } catch (e) {
      console.error('Error parsing tasks:', e);
    }
  }

  // Collect chi energy logs
  const chiStr = await AsyncStorage.getItem('chi_entries');
  if (chiStr) {
    try {
      const logs = JSON.parse(chiStr);
      if (Array.isArray(logs)) {
        userData.chiLogs = logs
          .filter((l: any) => {
            const logDate = new Date(l.date || l.timestamp);
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((l: any) => ({
            date: l.date || new Date(l.timestamp).toISOString().split('T')[0],
            time: l.time,
            energyLevel: l.energyLevel || 0,
            balanceLevel: l.balanceLevel || 0,
            notes: l.notes
          }));
      }
    } catch (e) {
      console.error('Error parsing chi logs:', e);
    }
  }

  // Collect workout logs
  const workoutStr = await AsyncStorage.getItem('workouts');
  if (workoutStr) {
    try {
      const logs = JSON.parse(workoutStr);
      if (Array.isArray(logs)) {
        userData.workoutLogs = logs
          .filter((l: any) => {
            const logDate = new Date(l.date || l.timestamp);
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((l: any) => ({
            date: l.date || new Date(l.timestamp).toISOString().split('T')[0],
            time: l.time,
            type: l.type || 'general',
            duration: l.duration || 0,
            intensity: l.intensity || 'moderate'
          }));
      }
    } catch (e) {
      console.error('Error parsing workout logs:', e);
    }
  }

  // Collect journal entries
  const journalStr = await AsyncStorage.getItem('journal_entries');
  if (journalStr) {
    try {
      const entries = JSON.parse(journalStr);
      if (Array.isArray(entries)) {
        userData.journalEntries = entries
          .filter((e: any) => {
            const entryDate = new Date(e.date || e.timestamp);
            const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= days;
          })
          .map((e: any) => ({
            date: e.date || new Date(e.timestamp).toISOString().split('T')[0],
            time: e.time,
            mood: e.mood,
            content: e.content || e.text || e.entry
          }));
      }
    } catch (e) {
      console.error('Error parsing journal entries:', e);
    }
  }

  return userData;
}

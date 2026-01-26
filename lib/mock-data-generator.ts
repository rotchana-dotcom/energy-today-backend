import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Mock Data Generator for Testing
 * Generates realistic test data for all features in Energy Today
 */

export async function loadMockData(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Mock User Profile
    const mockProfile = {
      name: "Sarah Chen",
      dateOfBirth: "1990-06-15",
      birthTime: "14:30",
      birthLocation: "Bangkok, Thailand",
      birthLatitude: 13.7563,
      birthLongitude: 100.5018,
    };

    // 2. Mock Sleep Logs (7 days)
    const today = new Date();
    const mockSleepLogs = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      mockSleepLogs.push({
        date: dateStr,
        bedtime: i % 3 === 0 ? "23:30" : i % 3 === 1 ? "22:45" : "00:15",
        wakeTime: i % 3 === 0 ? "07:00" : i % 3 === 1 ? "06:30" : "08:00",
        quality: i % 3 === 0 ? 8 : i % 3 === 1 ? 9 : 6,
        notes: i % 2 === 0 ? "Felt refreshed" : "A bit tired",
        duration: i % 3 === 0 ? 7.5 : i % 3 === 1 ? 7.75 : 7.75,
      });
    }

    // 3. Mock Meditation Sessions (5 sessions)
    const mockMeditationSessions = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 2);
      
      mockMeditationSessions.push({
        id: `mock-meditation-${i}`,
        date: date.toISOString(),
        duration: i % 3 === 0 ? 10 : i % 3 === 1 ? 20 : 5,
        type: i % 2 === 0 ? "Mindfulness" : "Breathing",
        completed: true,
      });
    }

    // 4. Mock Diet Entries (14 meals - 2 per day for 7 days)
    const mockDietEntries = [];
    const meals = [
      { name: "Oatmeal with berries", calories: 350, type: "breakfast" },
      { name: "Grilled chicken salad", calories: 450, type: "lunch" },
      { name: "Salmon with vegetables", calories: 550, type: "dinner" },
      { name: "Greek yogurt with honey", calories: 200, type: "breakfast" },
      { name: "Turkey sandwich", calories: 400, type: "lunch" },
      { name: "Stir-fry tofu with rice", calories: 500, type: "dinner" },
      { name: "Smoothie bowl", calories: 300, type: "breakfast" },
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      // Breakfast
      const breakfast = meals[i % meals.length];
      mockDietEntries.push({
        id: `mock-diet-${i}-breakfast`,
        date: dateStr,
        time: "08:00",
        meal: breakfast.name,
        calories: breakfast.calories,
        type: breakfast.type,
      });
      
      // Lunch
      const lunch = meals[(i + 1) % meals.length];
      mockDietEntries.push({
        id: `mock-diet-${i}-lunch`,
        date: dateStr,
        time: "12:30",
        meal: lunch.name,
        calories: lunch.calories,
        type: lunch.type,
      });
    }

    // 5. Mock Chi/Energy Logs (7 days)
    const mockChiLogs = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      mockChiLogs.push({
        date: dateStr,
        energyLevel: i % 3 === 0 ? 8 : i % 3 === 1 ? 6 : 7,
        chakras: {
          root: i % 2 === 0 ? 8 : 6,
          sacral: i % 2 === 0 ? 7 : 8,
          solarPlexus: i % 2 === 0 ? 6 : 7,
          heart: i % 2 === 0 ? 9 : 8,
          throat: i % 2 === 0 ? 7 : 6,
          thirdEye: i % 2 === 0 ? 8 : 7,
          crown: i % 2 === 0 ? 7 : 9,
        },
        notes: i % 2 === 0 ? "Feeling balanced" : "Need more grounding",
      });
    }

    // 6. Mock Workout Logs (5 workouts)
    const mockWorkoutLogs = [];
    const workoutTypes = ["Cardio", "Strength Training", "Yoga", "HIIT", "Swimming"];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 2);
      const dateStr = date.toISOString().split("T")[0];
      
      mockWorkoutLogs.push({
        id: `mock-workout-${i}`,
        date: dateStr,
        type: workoutTypes[i],
        duration: i % 2 === 0 ? 45 : 60,
        intensity: i % 3 === 0 ? "High" : i % 3 === 1 ? "Medium" : "Low",
        calories: i % 2 === 0 ? 400 : 500,
        notes: `Great ${workoutTypes[i].toLowerCase()} session`,
      });
    }

    // 7. Mock Tasks (10 tasks)
    const mockTasks = [
      { title: "Team meeting", category: "meeting", duration: 60, completed: true, date: "2026-01-24" },
      { title: "Write proposal", category: "creative", duration: 120, completed: true, date: "2026-01-23" },
      { title: "Review budget", category: "admin", duration: 45, completed: false, date: "2026-01-25" },
      { title: "Client presentation", category: "meeting", duration: 90, completed: true, date: "2026-01-22" },
      { title: "Design mockups", category: "creative", duration: 180, completed: false, date: "2026-01-25" },
      { title: "Email responses", category: "admin", duration: 30, completed: true, date: "2026-01-24" },
      { title: "Strategy session", category: "meeting", duration: 120, completed: false, date: "2026-01-26" },
      { title: "Content writing", category: "creative", duration: 90, completed: true, date: "2026-01-23" },
      { title: "File organization", category: "admin", duration: 60, completed: false, date: "2026-01-25" },
      { title: "Brainstorming", category: "creative", duration: 75, completed: true, date: "2026-01-21" },
    ];

    // 8. Mock Journal Entries (5 entries)
    const mockJournalEntries = [];
    const moods = ["energized", "calm", "focused", "tired", "motivated"];
    const notes = [
      "Great day! Felt very productive and accomplished a lot.",
      "Needed more rest but pushed through. Should prioritize sleep.",
      "Perfect balance today. Meditation really helped center me.",
      "Challenging day with back-to-back meetings. Need better boundaries.",
      "Creative breakthrough! The morning energy was perfect for brainstorming.",
    ];

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 2);
      
      mockJournalEntries.push({
        id: `mock-journal-${i}`,
        date: date.toISOString(),
        mood: moods[i],
        notes: notes[i],
        energyLevel: i % 3 === 0 ? 8 : i % 3 === 1 ? 6 : 7,
      });
    }

    // 9. Mock Weight Data (for Health Overview)
    const mockWeightData = [];
    const baseWeight = 65; // kg
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      mockWeightData.push({
        date: dateStr,
        weight: baseWeight + (Math.random() * 2 - 1), // ±1 kg variation
      });
    }

    // Save all mock data to AsyncStorage
    await AsyncStorage.setItem("userProfile", JSON.stringify(mockProfile));
    await AsyncStorage.setItem("sleepLogs", JSON.stringify(mockSleepLogs));
    await AsyncStorage.setItem("meditationSessions", JSON.stringify(mockMeditationSessions));
    await AsyncStorage.setItem("dietEntries", JSON.stringify(mockDietEntries));
    await AsyncStorage.setItem("chiLogs", JSON.stringify(mockChiLogs));
    await AsyncStorage.setItem("workoutLogs", JSON.stringify(mockWorkoutLogs));
    await AsyncStorage.setItem("tasks", JSON.stringify(mockTasks));
    await AsyncStorage.setItem("journalEntries", JSON.stringify(mockJournalEntries));
    await AsyncStorage.setItem("weightData", JSON.stringify(mockWeightData));

    return {
      success: true,
      message: `Mock data loaded successfully!\n\nProfile: ${mockProfile.name}\nSleep logs: ${mockSleepLogs.length}\nMeditation: ${mockMeditationSessions.length}\nDiet entries: ${mockDietEntries.length}\nChi logs: ${mockChiLogs.length}\nWorkouts: ${mockWorkoutLogs.length}\nTasks: ${mockTasks.length}\nJournal: ${mockJournalEntries.length}`,
    };
  } catch (error) {
    console.error("Failed to load mock data:", error);
    return {
      success: false,
      message: `Failed to load mock data: ${error}`,
    };
  }
}

export async function clearAllData(): Promise<{ success: boolean; message: string }> {
  try {
    await AsyncStorage.multiRemove([
      "userProfile",
      "sleepLogs",
      "meditationSessions",
      "dietEntries",
      "chiLogs",
      "workoutLogs",
      "tasks",
      "journalEntries",
      "weightData",
    ]);

    return {
      success: true,
      message: "All data cleared successfully!",
    };
  } catch (error) {
    console.error("Failed to clear data:", error);
    return {
      success: false,
      message: `Failed to clear data: ${error}`,
    };
  }
}

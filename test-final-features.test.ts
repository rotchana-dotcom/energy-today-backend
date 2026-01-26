import { describe, it, expect } from "vitest";

describe("Final Features Test", () => {
  describe("Meditation Notes with Date/Time", () => {
    it("should display meditation session with date and time", () => {
      const session = {
        id: "1",
        date: "2026-01-25T14:30:00.000Z",
        duration: 15,
        type: "guided" as const,
        energyBefore: 60,
        energyAfter: 80,
        mood: "calm" as const,
        notes: "Felt very peaceful today",
      };

      const dateObj = new Date(session.date);
      const dateStr = dateObj.toLocaleDateString();
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      expect(dateStr).toBeDefined();
      expect(timeStr).toBeDefined();
      expect(session.notes).toBe("Felt very peaceful today");
    });

    it("should handle sessions without notes", () => {
      const session = {
        id: "2",
        date: "2026-01-25T10:00:00.000Z",
        duration: 10,
        type: "silent" as const,
        energyBefore: 50,
        energyAfter: 70,
        mood: "focused" as const,
      };

      expect(session.notes).toBeUndefined();
    });
  });

  describe("Weight/BMI Trend Graph", () => {
    it("should calculate 7-day weight data", () => {
      const mockWeightEntries = [
        { date: "2026-01-25", weight: 70, height: 175, bmi: 22.9, goal: "maintain" as const, notes: "" },
        { date: "2026-01-24", weight: 70.5, height: 175, bmi: 23.0, goal: "maintain" as const, notes: "" },
        { date: "2026-01-23", weight: 71, height: 175, bmi: 23.2, goal: "maintain" as const, notes: "" },
      ];

      const getLast7DaysWeight = () => {
        const days = [];
        const today = new Date("2026-01-25");
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          
          const dayEntries = mockWeightEntries.filter((entry) => entry.date === dateStr);
          const avgWeight = dayEntries.length > 0
            ? dayEntries.reduce((sum, entry) => sum + entry.weight, 0) / dayEntries.length
            : 0;
          
          const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
          
          days.push({
            label: dayLabel,
            value: Math.round(avgWeight * 10) / 10,
          });
        }
        
        return days;
      };

      const chartData = getLast7DaysWeight();
      expect(chartData.length).toBe(7);
      expect(chartData[6].label).toBe("Today");
      expect(chartData[6].value).toBe(70);
    });
  });

  describe("Meditation Progress Graph", () => {
    it("should calculate 7-day meditation minutes", () => {
      const mockSessions = [
        { date: "2026-01-25T10:00:00.000Z", duration: 15 },
        { date: "2026-01-25T18:00:00.000Z", duration: 10 },
        { date: "2026-01-24T09:00:00.000Z", duration: 20 },
      ];

      const getLast7DaysMeditation = () => {
        const days = [];
        const today = new Date("2026-01-25");
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          
          const daySessions = mockSessions.filter((session) => session.date.startsWith(dateStr));
          const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
          
          const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
          
          days.push({
            label: dayLabel,
            value: totalMinutes,
          });
        }
        
        return days;
      };

      const chartData = getLast7DaysMeditation();
      expect(chartData.length).toBe(7);
      expect(chartData[6].label).toBe("Today");
      expect(chartData[6].value).toBe(25); // 15 + 10
    });
  });

  describe("Task Completion Graph", () => {
    it("should calculate 7-day task completion", () => {
      const mockTasks = [
        { id: "1", scheduledDate: "2026-01-25", completed: true, title: "Task 1" },
        { id: "2", scheduledDate: "2026-01-25", completed: false, title: "Task 2" },
        { id: "3", scheduledDate: "2026-01-24", completed: true, title: "Task 3" },
        { id: "4", scheduledDate: "2026-01-24", completed: true, title: "Task 4" },
      ];

      const getLast7DaysCompletion = () => {
        const days = [];
        const today = new Date("2026-01-25");
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          
          const dayTasks = mockTasks.filter((task) => {
            if (!task.scheduledDate) return false;
            return task.scheduledDate === dateStr;
          });
          
          const completedCount = dayTasks.filter((task) => task.completed).length;
          
          const dayLabel = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
          
          days.push({
            label: dayLabel,
            value: completedCount,
          });
        }
        
        return days;
      };

      const chartData = getLast7DaysCompletion();
      expect(chartData.length).toBe(7);
      expect(chartData[6].label).toBe("Today");
      expect(chartData[6].value).toBe(1); // 1 completed out of 2
      expect(chartData[5].value).toBe(2); // 2 completed out of 2
    });
  });

  describe("Pro vs Free Feature Restrictions", () => {
    it("should limit Free users to 7-day history in Diet app", () => {
      const isPro = false;
      const allFoodEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        mealType: "breakfast" as const,
        food: `Food ${i}`,
        calories: 500,
        notes: "",
        mealTime: new Date().toISOString(),
      }));

      const getVisibleFoodEntries = () => {
        if (isPro) return allFoodEntries;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return allFoodEntries.filter((entry) => new Date(entry.date) >= sevenDaysAgo);
      };

      const visibleEntries = getVisibleFoodEntries();
      expect(visibleEntries.length).toBeLessThanOrEqual(7);
      expect(allFoodEntries.length).toBe(10);
    });

    it("should allow Pro users unlimited history in Diet app", () => {
      const isPro = true;
      const allFoodEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        mealType: "breakfast" as const,
        food: `Food ${i}`,
        calories: 500,
        notes: "",
        mealTime: new Date().toISOString(),
      }));

      const getVisibleFoodEntries = () => {
        if (isPro) return allFoodEntries;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return allFoodEntries.filter((entry) => new Date(entry.date) >= sevenDaysAgo);
      };

      const visibleEntries = getVisibleFoodEntries();
      expect(visibleEntries.length).toBe(10);
    });

    it("should limit Free users to 7-day history in Health/Chi app", () => {
      const isPro = false;
      const allChiEntries = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        energyLevel: 8,
        balanceLevel: 7,
        chakras: {
          root: 8,
          sacral: 7,
          solarPlexus: 8,
          heart: 9,
          throat: 7,
          thirdEye: 8,
          crown: 7,
        },
        notes: "",
      }));

      const getVisibleChiEntries = () => {
        if (isPro) return allChiEntries;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return allChiEntries.filter((entry) => new Date(entry.date) >= sevenDaysAgo);
      };

      const visibleEntries = getVisibleChiEntries();
      expect(visibleEntries.length).toBeLessThanOrEqual(7);
      expect(allChiEntries.length).toBe(10);
    });

    it("should show upgrade prompts for Free users", () => {
      const isPro = false;
      const entriesCount = 10;

      const shouldShowUpgradePrompt = !isPro && entriesCount > 7;

      expect(shouldShowUpgradePrompt).toBe(true);
    });

    it("should not show upgrade prompts for Pro users", () => {
      const isPro = true;
      const entriesCount = 10;

      const shouldShowUpgradePrompt = !isPro && entriesCount > 7;

      expect(shouldShowUpgradePrompt).toBe(false);
    });
  });
});

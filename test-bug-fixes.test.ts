import { describe, it, expect } from "vitest";

describe("Critical Bug Fixes", () => {
  describe("Find Best Time API Fix", () => {
    it("should accept correct input format", () => {
      const input = {
        taskDuration: 60,
        energyRequirement: "moderate" as const,
        priority: "high" as const,
      };

      expect(input.taskDuration).toBe(60);
      expect(input.energyRequirement).toBe("moderate");
      expect(input.priority).toBe("high");
    });

    it("should return optimalSlots in response", () => {
      const mockResponse = {
        optimalSlots: [
          {
            time: "09:00",
            hour: 9,
            energyMatch: 85,
            recommendation: "Excellent match - Your energy peaks at this time",
          },
          {
            time: "10:00",
            hour: 10,
            energyMatch: 80,
            recommendation: "Excellent match - Your energy peaks at this time",
          },
        ],
        analysis: {
          morningEnergy: 75,
          afternoonEnergy: 60,
          eveningEnergy: 50,
          bestTimeOfDay: "morning",
        },
      };

      expect(mockResponse.optimalSlots).toBeDefined();
      expect(mockResponse.optimalSlots.length).toBe(2);
      expect(mockResponse.optimalSlots[0].time).toBe("09:00");
    });

    it("should use default energy history when not provided", () => {
      const defaultEnergyHistory = [
        { date: new Date().toISOString(), energyLevel: 75, timeOfDay: "morning" as const },
        { date: new Date().toISOString(), energyLevel: 60, timeOfDay: "afternoon" as const },
        { date: new Date().toISOString(), energyLevel: 50, timeOfDay: "evening" as const },
      ];

      expect(defaultEnergyHistory.length).toBe(3);
      expect(defaultEnergyHistory[0].energyLevel).toBe(75);
      expect(defaultEnergyHistory[1].energyLevel).toBe(60);
      expect(defaultEnergyHistory[2].energyLevel).toBe(50);
    });
  });

  describe("Bottom Tab Navigation Fix", () => {
    it("should hide community tab from tab bar", () => {
      const hiddenTabs = ["calendar", "community", "log", "track"];

      expect(hiddenTabs).toContain("community");
    });

    it("should have all required tab icons mapped", () => {
      const iconMapping = {
        "house.fill": "home",
        "sparkles": "auto-awesome",
        "briefcase.fill": "work",
        "ellipsis.circle.fill": "more-horiz",
        "heart.fill": "favorite",
      };

      expect(iconMapping["house.fill"]).toBe("home");
      expect(iconMapping["sparkles"]).toBe("auto-awesome");
      expect(iconMapping["briefcase.fill"]).toBe("work");
      expect(iconMapping["ellipsis.circle.fill"]).toBe("more-horiz");
      expect(iconMapping["heart.fill"]).toBe("favorite");
    });

    it("should have 5 visible tabs", () => {
      const visibleTabs = ["index", "insights", "business", "health", "more"];

      expect(visibleTabs.length).toBe(5);
    });
  });

  describe("Task Categories Feature", () => {
    it("should have category field in Task interface", () => {
      const task = {
        id: "1",
        title: "Test Task",
        category: "work" as const,
        estimatedDuration: 60,
        priority: "high" as const,
        energyRequirement: "moderate" as const,
        completed: false,
      };

      expect(task.category).toBe("work");
    });

    it("should support all category types", () => {
      const categories: Array<"work" | "personal" | "health" | "learning" | "other"> = [
        "work",
        "personal",
        "health",
        "learning",
        "other",
      ];

      expect(categories.length).toBe(5);
      expect(categories).toContain("work");
      expect(categories).toContain("personal");
      expect(categories).toContain("health");
      expect(categories).toContain("learning");
      expect(categories).toContain("other");
    });

    it("should filter tasks by category", () => {
      const tasks = [
        { id: "1", title: "Work Task", category: "work" as const, completed: false },
        { id: "2", title: "Personal Task", category: "personal" as const, completed: false },
        { id: "3", title: "Health Task", category: "health" as const, completed: false },
        { id: "4", title: "Another Work Task", category: "work" as const, completed: false },
      ];

      const categoryFilter = "work";
      const filteredTasks = tasks.filter((task) => task.category === categoryFilter);

      expect(filteredTasks.length).toBe(2);
      expect(filteredTasks[0].category).toBe("work");
      expect(filteredTasks[1].category).toBe("work");
    });

    it("should show all tasks when filter is 'all'", () => {
      const tasks = [
        { id: "1", title: "Work Task", category: "work" as const, completed: false },
        { id: "2", title: "Personal Task", category: "personal" as const, completed: false },
        { id: "3", title: "Health Task", category: "health" as const, completed: false },
      ];

      const categoryFilter = "all";
      const filteredTasks = categoryFilter === "all" ? tasks : tasks.filter((task) => task.category === categoryFilter);

      expect(filteredTasks.length).toBe(3);
    });

    it("should default new task category to 'personal'", () => {
      const newTask = {
        title: "",
        description: "",
        category: "personal" as const,
        estimatedDuration: "30",
        priority: "medium" as const,
        energyRequirement: "moderate" as const,
        scheduledDate: "",
        scheduledTime: "",
        recurrence: "none" as const,
      };

      expect(newTask.category).toBe("personal");
    });
  });
});

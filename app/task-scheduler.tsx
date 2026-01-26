import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { syncTaskToCalendar } from "@/lib/calendar-sync-helper";
import { scheduleTaskNotification, cancelTaskNotification } from "@/lib/task-notifications";
import { SyncStatusIndicator } from "@/components/sync-status-indicator";
import { logError, ERROR_CODES } from "@/lib/error-reporting";
import { SimpleLineChart } from "@/components/simple-line-chart";
import { AIInsightsCard } from "@/components/ai-insights-card";
import { useAIInsights } from "@/hooks/use-ai-insights";

interface Task {
  id: string;
  title: string;
  description?: string;
  category?: "work" | "personal" | "health" | "learning" | "other";
  estimatedDuration: number;
  priority: "low" | "medium" | "high";
  energyRequirement: "low" | "moderate" | "high";
  deadline?: string;
  completed: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

const STORAGE_KEY = "tasks";

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
function calculateNextOccurrence(
  currentDate: string,
  recurrence: "daily" | "weekly" | "monthly"
): string {
  const date = new Date(currentDate);
  
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
  }
  
  // Return in YYYY-MM-DD format
  return date.toISOString().split("T")[0];
}

export default function TaskSchedulerScreen() {
  const colors = useColors();
  const getOptimalSlotsMutation = trpc.taskScheduler.getOptimalTimeSlots.useMutation();
  const { insights: aiInsights, loading: aiLoading, error: aiError } = useAIInsights('business');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "personal" as "work" | "personal" | "health" | "learning" | "other",
    estimatedDuration: "30",
    priority: "medium" as "low" | "medium" | "high",
    energyRequirement: "moderate" as "low" | "moderate" | "high",
    scheduledDate: "",
    scheduledTime: "",
    recurrence: "none" as "none" | "daily" | "weekly" | "monthly",
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [optimalSlots, setOptimalSlots] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setTasks(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  };

  const addTask = async () => {
    try {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      estimatedDuration: parseInt(newTask.estimatedDuration) || 30,
      priority: newTask.priority,
      energyRequirement: newTask.energyRequirement,
      completed: false,
      scheduledDate: newTask.scheduledDate,
      scheduledTime: newTask.scheduledTime,
      recurrence: newTask.recurrence,
    };

    const updatedTasks = [task, ...tasks];
    saveTasks(updatedTasks);

    // Sync to Google Calendar if date/time are set
    if (task.scheduledDate && task.scheduledTime) {
      const syncResult = await syncTaskToCalendar(
        task.title,
        task.description || "",
        task.scheduledDate,
        task.scheduledTime,
        task.estimatedDuration,
        task.energyRequirement
      );
      
      // Schedule push notification
      const notificationId = await scheduleTaskNotification(
        task.id,
        task.title,
        task.description,
        task.scheduledDate,
        task.scheduledTime
      );
      
      if (syncResult.success && notificationId) {
        Alert.alert("Success", "Task added, synced to calendar, and reminder set!");
      } else if (syncResult.success) {
        Alert.alert("Success", "Task added and synced to calendar!");
      } else if (notificationId) {
        Alert.alert("Success", "Task added and reminder set!");
      }
    }

      setNewTask({
        title: "",
        description: "",
        category: "personal",
        estimatedDuration: "30",
        priority: "medium",
        energyRequirement: "moderate",
        scheduledDate: "",
        scheduledTime: "",
        recurrence: "none",
      });
    setShowAddTask(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await logError(
        ERROR_CODES.TASK_CREATION_FAILED,
        error instanceof Error ? error.message : "Unknown error"
      );
      Alert.alert("Error", "Failed to create task");
    }
  };

  const toggleComplete = async (taskId: string) => {
    try {
    const task = tasks.find((t) => t.id === taskId);
    
    // If task has recurrence and is being completed, create next occurrence
    if (task && !task.completed && task.recurrence && task.recurrence !== "none" && task.scheduledDate) {
      const nextDate = calculateNextOccurrence(task.scheduledDate, task.recurrence);
      
      // Create new task for next occurrence
      const nextTask: Task = {
        ...task,
        id: Date.now().toString(),
        completed: false,
        scheduledDate: nextDate,
      };
      
      // Schedule notification for next occurrence
      if (nextTask.scheduledTime) {
        await scheduleTaskNotification(
          nextTask.id,
          nextTask.title,
          nextTask.description,
          nextTask.scheduledDate!,
          nextTask.scheduledTime
        );
      }
      
      // Add next occurrence to tasks
      const updatedTasks = [
        nextTask,
        ...tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
      ];
      saveTasks(updatedTasks);
    } else {
      // Normal toggle
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      saveTasks(updatedTasks);
    }
    
    } catch (error) {
      await logError(
        ERROR_CODES.RECURRING_TASK_FAILED,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    
    // Cancel notification when task is completed
    if (task && !task.completed) {
      await cancelTaskNotification(taskId);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedTasks = tasks.filter((task) => task.id !== taskId);
          saveTasks(updatedTasks);
          
          // Cancel notification when task is deleted
          await cancelTaskNotification(taskId);
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const getLast7DaysCompletion = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayTasks = tasks.filter((task) => {
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

  const findOptimalTime = async (task: Task) => {
    setSelectedTask(task);
    try {
      const result = await getOptimalSlotsMutation.mutateAsync({
        taskDuration: task.estimatedDuration,
        energyRequirement: task.energyRequirement,
        priority: task.priority,
      });
      setOptimalSlots(result.optimalSlots || []);
    } catch (error) {
      await logError(
        ERROR_CODES.FIND_BEST_TIME_FAILED,
        error instanceof Error ? error.message : "Unknown error"
      );
      Alert.alert("Error", "Failed to find optimal time slots");
    }
  };

  const scheduleTask = (task: Task, time: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, scheduledTime: time } : t
    );
    saveTasks(updatedTasks);
    setSelectedTask(null);
    setOptimalSlots([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      default:
        return "#22C55E";
    }
  };

  const getEnergyColor = (requirement: string) => {
    switch (requirement) {
      case "high":
        return "#EF4444";
      case "moderate":
        return "#F59E0B";
      default:
        return "#22C55E";
    }
  };

  // Group tasks by date
  const getTasksByDate = () => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach((task) => {
      if (task.scheduledDate) {
        if (!grouped[task.scheduledDate]) {
          grouped[task.scheduledDate] = [];
        }
        grouped[task.scheduledDate].push(task);
      }
    });
    return grouped;
  };

  // Calendar View
  if (showCalendar) {
    const tasksByDate = getTasksByDate();
    const dates = Object.keys(tasksByDate).sort();

    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Calendar View
            </Text>
            <TouchableOpacity onPress={() => setShowAddTask(true)}>
              <Text className="text-3xl" style={{ color: colors.primary }}>
                +
              </Text>
            </TouchableOpacity>
          </View>

          {dates.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-6xl mb-4">📅</Text>
              <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
                No scheduled tasks
              </Text>
              <Text className="text-base text-center" style={{ color: colors.muted }}>
                Add tasks with dates to see them in calendar view
              </Text>
            </View>
          ) : (
            dates.map((date) => (
              <View key={date} className="mb-6">
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  {date}
                </Text>
                {tasksByDate[date].map((task) => (
                  <View
                    key={task.id}
                    className="p-4 rounded-xl mb-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold mb-1" style={{ color: colors.foreground }}>
                          {task.title}
                        </Text>
                        {task.scheduledTime && (
                          <Text className="text-sm mb-2" style={{ color: colors.primary }}>
                            ⏰ {task.scheduledTime}
                          </Text>
                        )}
                        <View className="flex-row items-center gap-2">
                          <View
                            className="px-2 py-1 rounded"
                            style={{ backgroundColor: getPriorityColor(task.priority) + "30" }}
                          >
                            <Text
                              className="text-xs font-semibold capitalize"
                              style={{ color: getPriorityColor(task.priority) }}
                            >
                              {task.priority}
                            </Text>
                          </View>
                          <Text className="text-xs" style={{ color: colors.muted }}>
                            {Math.floor(task.estimatedDuration / 60) > 0 
                              ? `${Math.floor(task.estimatedDuration / 60)}h ${task.estimatedDuration % 60}m`
                              : `${task.estimatedDuration}m`}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleComplete(task.id)}
                        className="ml-3"
                      >
                        <Text className="text-2xl">
                          {task.completed ? "✅" : "⭕"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Add Task Form
  if (showAddTask) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowAddTask(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              New Task
            </Text>
            <TouchableOpacity onPress={addTask}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Title *
          </Text>
          <TextInput
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            placeholder="e.g., Review quarterly report"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Description
          </Text>
          <TextInput
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            placeholder="Optional details..."
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Scheduled Date & Time (Optional)
          </Text>
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-1 p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text style={{ color: newTask.scheduledDate ? colors.foreground : colors.muted }}>
                {newTask.scheduledDate || "Select Date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowTimePicker(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-1 p-4 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text style={{ color: newTask.scheduledTime ? colors.foreground : colors.muted }}>
                {newTask.scheduledTime || "Select Time"}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setTempDate(selectedDate);
                  const dateStr = selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  setNewTask({ ...newTask, scheduledDate: dateStr });
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowTimePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setTempDate(selectedDate);
                  const timeStr = selectedDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  setNewTask({ ...newTask, scheduledTime: timeStr });
                }
              }}
            />
          )}

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Estimated Duration
          </Text>
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>Hours</Text>
              <TextInput
                value={Math.floor(parseInt(newTask.estimatedDuration) / 60).toString()}
                onChangeText={(text) => {
                  const hours = parseInt(text) || 0;
                  const minutes = parseInt(newTask.estimatedDuration) % 60;
                  setNewTask({ ...newTask, estimatedDuration: (hours * 60 + minutes).toString() });
                }}
                keyboardType="number-pad"
                placeholder="0"
                className="p-4 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>Minutes</Text>
              <TextInput
                value={(parseInt(newTask.estimatedDuration) % 60).toString()}
                onChangeText={(text) => {
                  const hours = Math.floor(parseInt(newTask.estimatedDuration) / 60);
                  const minutes = parseInt(text) || 0;
                  setNewTask({ ...newTask, estimatedDuration: (hours * 60 + minutes).toString() });
                }}
                keyboardType="number-pad"
                placeholder="30"
                className="p-4 rounded-xl text-base"
                style={{ backgroundColor: colors.surface, color: colors.foreground }}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(["work", "personal", "health", "learning", "other"] as const).map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => {
                  setNewTask({ ...newTask, category });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor:
                    newTask.category === category
                      ? colors.primary + "30"
                      : colors.surface,
                  borderWidth: 1,
                  borderColor: newTask.category === category ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{
                    color:
                      newTask.category === category
                        ? colors.primary
                        : colors.foreground,
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Priority
          </Text>
          <View className="flex-row gap-3 mb-4">
            {(["low", "medium", "high"] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                onPress={() => {
                  setNewTask({ ...newTask, priority });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor:
                    newTask.priority === priority
                      ? getPriorityColor(priority) + "30"
                      : colors.surface,
                }}
              >
                <Text
                  className="text-center text-sm font-semibold capitalize"
                  style={{
                    color:
                      newTask.priority === priority
                        ? getPriorityColor(priority)
                        : colors.muted,
                  }}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Energy Requirement
          </Text>
          <View className="flex-row gap-3 mb-4">
            {(["low", "moderate", "high"] as const).map((energy) => (
              <TouchableOpacity
                key={energy}
                onPress={() => {
                  setNewTask({ ...newTask, energyRequirement: energy });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor:
                    newTask.energyRequirement === energy
                      ? getEnergyColor(energy) + "30"
                      : colors.surface,
                }}
              >
                <Text
                  className="text-center text-sm font-semibold capitalize"
                  style={{
                    color:
                      newTask.energyRequirement === energy
                        ? getEnergyColor(energy)
                        : colors.muted,
                  }}
                >
                  {energy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recurrence */}
          <Text className="text-sm font-medium text-foreground mb-2">
            Recurrence
          </Text>
          <View className="flex-row gap-3 mb-4">
            {(["none", "daily", "weekly", "monthly"] as const).map((recurrence) => (
              <TouchableOpacity
                key={recurrence}
                onPress={() => {
                  setNewTask({ ...newTask, recurrence });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="flex-1 p-3 rounded-xl"
                style={{
                  backgroundColor:
                    newTask.recurrence === recurrence
                      ? colors.primary + "30"
                      : colors.surface,
                }}
              >
                <Text
                  className="text-center text-sm font-semibold capitalize"
                  style={{
                    color:
                      newTask.recurrence === recurrence
                        ? colors.primary
                        : colors.muted,
                  }}
                >
                  {recurrence}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Optimal Time Slots View
  if (selectedTask && optimalSlots.length > 0) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => {
                setSelectedTask(null);
                setOptimalSlots([]);
              }}
            >
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Best Times
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View className="mb-6">
            <Text className="text-xl font-bold mb-1" style={{ color: colors.foreground }}>
              {selectedTask.title}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {selectedTask.estimatedDuration} minutes • {selectedTask.energyRequirement} energy
            </Text>
          </View>

          <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
            Best Time Slots
          </Text>

          {optimalSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scheduleTask(selectedTask, slot.time)}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
                  {slot.time}
                </Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      slot.energyMatch >= 80
                        ? colors.success + "30"
                        : slot.energyMatch >= 60
                          ? colors.warning + "30"
                          : colors.error + "30",
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        slot.energyMatch >= 80
                          ? colors.success
                          : slot.energyMatch >= 60
                            ? colors.warning
                            : colors.error,
                    }}
                  >
                    {typeof slot.energyMatch === 'number' ? slot.energyMatch.toFixed(2) : slot.energyMatch}% match
                  </Text>
                </View>
              </View>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {slot.recommendation}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Main Task List View
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const filteredIncompleteTasks = categoryFilter === "all"
    ? incompleteTasks
    : incompleteTasks.filter((task) => task.category === categoryFilter);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Task Scheduler
          </Text>
          <TouchableOpacity 
            onPress={() => setShowAddTask(true)}
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-lg font-semibold" style={{ color: colors.background }}>
              + New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        <View className="mb-4">
          <SyncStatusIndicator feature="schedule" />
        </View>

        {/* AI-Powered Insights (Pro Feature) */}
        <AIInsightsCard
          feature="Business & Tasks"
          insights={aiInsights}
          loading={aiLoading}
          error={aiError || undefined}
          icon="💼"
        />

        {/* Calendar View Button */}
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          className="p-4 rounded-xl mb-6 flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">📅</Text>
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              Calendar View
            </Text>
          </View>
          <Text className="text-lg" style={{ color: colors.primary }}>
            →
          </Text>
        </TouchableOpacity>

        {/* 7-Day Task Completion */}
        {tasks.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">7-Day Task Completion</Text>
            <SimpleLineChart
              data={getLast7DaysCompletion()}
              height={180}
              yAxisLabel="Completed"
            />
          </View>
        )}

        {/* Category Filter */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {(["all", "work", "personal", "health", "learning", "other"] as const).map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => {
                setCategoryFilter(category);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  categoryFilter === category
                    ? colors.primary + "30"
                    : colors.surface,
                borderWidth: 1,
                borderColor: categoryFilter === category ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-sm font-semibold capitalize"
                style={{
                  color:
                    categoryFilter === category
                      ? colors.primary
                      : colors.foreground,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          To Do ({filteredIncompleteTasks.length})
        </Text>

        {filteredIncompleteTasks.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-4xl mb-2">✅</Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              No tasks yet. Tap + to add one!
            </Text>
          </View>
        ) : (
          filteredIncompleteTasks.map((task) => (
            <View
              key={task.id}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-semibold mb-1" style={{ color: colors.foreground }}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                      {task.description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-2 flex-wrap">
                    {task.category && (
                      <View
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: colors.primary }}
                        >
                          {task.category}
                        </Text>
                      </View>
                    )}
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: getPriorityColor(task.priority) + "30" }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: getEnergyColor(task.energyRequirement) + "30" }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getEnergyColor(task.energyRequirement) }}
                      >
                        {task.energyRequirement} energy
                      </Text>
                    </View>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {task.estimatedDuration} min
                    </Text>
                  </View>
                  {(task.scheduledDate || task.scheduledTime) && (
                    <Text className="text-sm mt-2" style={{ color: colors.primary }}>
                      ⏰ Scheduled: {task.scheduledDate || ""} {task.scheduledTime || ""}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => findOptimalTime(task)}
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    className="text-center text-sm font-semibold"
                    style={{ color: colors.background }}
                  >
                    Find Best Time
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleComplete(task.id)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.success + "30" }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.success }}>
                    ✓ Done
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: colors.error + "30" }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                    🗑️
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {completedTasks.length > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3 mt-6" style={{ color: colors.foreground }}>
              Completed ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <View
                key={task.id}
                className="p-4 rounded-xl mb-3 opacity-60"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold line-through"
                      style={{ color: colors.muted }}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleComplete(task.id)}>
                    <Text className="text-2xl">✅</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

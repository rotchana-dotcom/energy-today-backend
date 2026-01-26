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

interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedDuration: number;
  priority: "low" | "medium" | "high";
  energyRequirement: "low" | "moderate" | "high";
  deadline?: string;
  completed: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

const STORAGE_KEY = "tasks";

export default function TaskSchedulerScreen() {
  const colors = useColors();
  const getOptimalSlotsMutation = trpc.taskScheduler.getOptimalTimeSlots.useMutation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    estimatedDuration: "30",
    priority: "medium" as "low" | "medium" | "high",
    energyRequirement: "moderate" as "low" | "moderate" | "high",
    scheduledDate: "",
    scheduledTime: "",
  });
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

  const addTask = () => {
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
    };

    const updatedTasks = [task, ...tasks];
    saveTasks(updatedTasks);

    setNewTask({
      title: "",
      description: "",
      estimatedDuration: "30",
      priority: "medium",
      energyRequirement: "moderate",
      scheduledDate: "",
      scheduledTime: "",
    });
    setShowAddTask(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updatedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteTask = (taskId: string) => {
    Alert.alert("Delete Task?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedTasks = tasks.filter((t) => t.id !== taskId);
          saveTasks(updatedTasks);
        },
      },
    ]);
  };

  const findOptimalTime = async (task: Task) => {
    setSelectedTask(task);
    
    // Mock energy history (in real app, this would come from user's actual data)
    const energyHistory = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      energyLevel: 50 + Math.random() * 40,
      timeOfDay: (["morning", "afternoon", "evening"] as const)[Math.floor(Math.random() * 3)],
    }));

    try {
      const result = await getOptimalSlotsMutation.mutateAsync({
        task,
        energyHistory,
        availableHours: { start: 9, end: 18 },
      });

      setOptimalSlots(result.optimalSlots);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to get optimal time slots:", error);
      Alert.alert("Error", "Failed to analyze optimal times. Please try again.");
    }
  };

  const scheduleTask = (task: Task, time: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, scheduledTime: time } : t
    );
    saveTasks(updatedTasks);
    setOptimalSlots([]);
    setSelectedTask(null);
    Alert.alert("Scheduled!", `Task scheduled for ${time}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.error;
      case "medium":
        return colors.warning;
      default:
        return colors.muted;
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
            Estimated Duration (minutes)
          </Text>
          <TextInput
            value={newTask.estimatedDuration}
            onChangeText={(text) => setNewTask({ ...newTask, estimatedDuration: text })}
            keyboardType="number-pad"
            placeholder="30"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

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
                    newTask.priority === priority ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-center font-medium capitalize"
                  style={{
                    color: newTask.priority === priority ? colors.background : colors.foreground,
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
          <View className="flex-row gap-3 mb-6">
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
                    newTask.energyRequirement === energy ? colors.primary : colors.surface,
                }}
              >
                <Text
                  className="text-center font-medium capitalize"
                  style={{
                    color:
                      newTask.energyRequirement === energy ? colors.background : colors.foreground,
                  }}
                >
                  {energy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (optimalSlots.length > 0 && selectedTask) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => {
                setOptimalSlots([]);
                setSelectedTask(null);
              }}
            >
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Optimal Times
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View className="p-4 rounded-xl mb-6" style={{ backgroundColor: colors.surface }}>
            <Text className="text-lg font-semibold mb-1" style={{ color: colors.foreground }}>
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

  const incompleteTasks = tasks.filter((t) => !t.completed);
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
          <TouchableOpacity onPress={() => setShowAddTask(true)}>
            <Text className="text-3xl" style={{ color: colors.primary }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {incompleteTasks.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">✅</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              All tasks complete!
            </Text>
            <Text className="text-base text-center" style={{ color: colors.muted }}>
              Add a new task to get AI-powered scheduling recommendations
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              To Do ({incompleteTasks.length})
            </Text>
            {incompleteTasks.map((task) => (
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
                    style={{ backgroundColor: colors.success }}
                  >
                    <Text
                      className="text-center text-sm font-semibold"
                      style={{ color: colors.background }}
                    >
                      ✓
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: colors.error }}
                  >
                    <Text
                      className="text-center text-sm font-semibold"
                      style={{ color: colors.background }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
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
                      className="text-base font-semibold line-through"
                      style={{ color: colors.muted }}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleComplete(task.id)}>
                    <Text className="text-2xl" style={{ color: colors.success }}>
                      ✓
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Related Features Section */}
        <View className="bg-surface rounded-2xl p-6 border border-border mt-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-lg">🔗</Text>
            <Text className="text-base font-bold" style={{ color: colors.foreground }}>Related Features</Text>
          </View>
          <Text className="text-sm mb-4" style={{ color: colors.muted }}>
            Optimize your schedule with these tools
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/energy-forecast" as any);
              }}
              className="bg-background border border-border rounded-lg p-3 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">📅</Text>
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>Energy Forecast</Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/ai-insights-dashboard" as any);
              }}
              className="bg-background border border-border rounded-lg p-3 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">🧠</Text>
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>AI Insights</Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/calendar-sync" as any);
              }}
              className="bg-background border border-border rounded-lg p-3 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">📆</Text>
                <Text className="text-sm font-medium" style={{ color: colors.foreground }}>Calendar Sync</Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

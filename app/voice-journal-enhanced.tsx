import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  getVoiceJournalEntries,
  saveVoiceJournalEntry,
  getVoiceJournalInsights,
  getWeeklySummary,
  updateVoiceJournalEntry,
  deleteVoiceJournalEntry,
  transcribeAudio,
  detectSentiment,
  extractKeywords,
  suggestTags,
  searchVoiceJournalEntries,
  type VoiceJournalEntry,
  type VoiceJournalInsights,
} from "@/lib/voice-journal-enhanced";

export default function VoiceJournalEnhancedScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<VoiceJournalEntry[]>([]);
  const [insights, setInsights] = useState<VoiceJournalInsights | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newEntry, setNewEntry] = useState({
    transcription: "",
    energyLevel: 50,
    mood: "",
    tags: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const journalEntries = await getVoiceJournalEntries();
    setEntries(journalEntries.reverse()); // Most recent first

    const journalInsights = await getVoiceJournalInsights(30);
    setInsights(journalInsights);

    const summary = await getWeeklySummary();
    setWeeklySummary(summary);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate recording duration
    const interval = setInterval(() => {
      setRecordingDuration((prev) => {
        if (prev >= 60) {
          clearInterval(interval);
          handleStopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate transcription
    const transcription = await transcribeAudio("simulated_audio_uri");
    const sentiment = detectSentiment(transcription);
    const keywords = extractKeywords(transcription);
    const suggestedTags = suggestTags(transcription, 50);
    
    setNewEntry({
      transcription,
      energyLevel: 50,
      mood: sentiment,
      tags: suggestedTags,
    });
    
    setShowNewEntry(true);
  };

  const handleSaveEntry = async () => {
    if (!newEntry.transcription.trim()) {
      Alert.alert("Error", "Please add some content to your voice note");
      return;
    }

    const sentiment = detectSentiment(newEntry.transcription);
    const keywords = extractKeywords(newEntry.transcription);

    await saveVoiceJournalEntry({
      timestamp: new Date().toISOString(),
      duration: recordingDuration,
      transcription: newEntry.transcription,
      energyLevel: newEntry.energyLevel,
      mood: newEntry.mood || sentiment,
      tags: newEntry.tags,
      sentiment,
      keywords,
    });

    await loadData();
    setShowNewEntry(false);
    setNewEntry({ transcription: "", energyLevel: 50, mood: "", tags: [] });
    setRecordingDuration(0);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteEntry = async (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this voice note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteVoiceJournalEntry(id);
          await loadData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadData();
      return;
    }

    const results = await searchVoiceJournalEntries(searchQuery);
    setEntries(results.reverse());
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "positive") return colors.success;
    if (sentiment === "negative") return colors.error;
    return colors.muted;
  };

  const getSentimentEmoji = (sentiment?: string) => {
    if (sentiment === "positive") return "😊";
    if (sentiment === "negative") return "😔";
    return "😐";
  };

  if (showNewEntry) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowNewEntry(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              New Voice Note
            </Text>
            <TouchableOpacity onPress={handleSaveEntry}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Transcription
          </Text>
          <TextInput
            value={newEntry.transcription}
            onChangeText={(text) => setNewEntry({ ...newEntry, transcription: text })}
            multiline
            numberOfLines={8}
            placeholder="Edit transcription..."
            className="p-4 rounded-xl mb-4 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              minHeight: 150,
              textAlignVertical: "top",
            }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Energy Level: {newEntry.energyLevel}
          </Text>
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() =>
                setNewEntry({ ...newEntry, energyLevel: Math.max(0, newEntry.energyLevel - 10) })
              }
              className="p-3 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>-</Text>
            </TouchableOpacity>
            <View className="flex-1 mx-4 h-2 rounded-full" style={{ backgroundColor: colors.surface }}>
              <View
                className="h-2 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  width: `${newEntry.energyLevel}%`,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                setNewEntry({ ...newEntry, energyLevel: Math.min(100, newEntry.energyLevel + 10) })
              }
              className="p-3 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>+</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Tags
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {newEntry.tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  const updated = newEntry.tags.filter((_, i) => i !== index);
                  setNewEntry({ ...newEntry, tags: updated });
                }}
                className="px-3 py-2 rounded-full"
                style={{ backgroundColor: colors.primary + "30" }}
              >
                <Text style={{ color: colors.primary }}>{tag} ×</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm" style={{ color: colors.muted }}>
            Duration: {recordingDuration} seconds
          </Text>
        </ScrollView>
      </ScreenContainer>
    );
  }

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
            Voice Journal
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Record Button */}
        <TouchableOpacity
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          className="p-6 rounded-full mb-4 items-center justify-center self-center"
          style={{
            backgroundColor: isRecording ? colors.error : colors.primary,
            width: 120,
            height: 120,
          }}
        >
          <Text className="text-4xl mb-2">{isRecording ? "⏹" : "🎤"}</Text>
          <Text className="text-sm font-semibold" style={{ color: colors.background }}>
            {isRecording ? `${recordingDuration}s` : "Record"}
          </Text>
        </TouchableOpacity>

        {/* Weekly Summary */}
        {weeklySummary && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Weekly Summary
            </Text>
            <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
              <Text className="text-sm" style={{ color: colors.foreground }}>
                {weeklySummary}
              </Text>
            </View>
          </>
        )}

        {/* Insights */}
        {insights && insights.totalEntries > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              30-Day Insights
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {insights.totalEntries}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Voice Notes
                </Text>
              </View>
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(insights.totalDuration)}m
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Total Duration
                </Text>
              </View>
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {Math.round(insights.averageEnergyLevel)}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Avg Energy
                </Text>
              </View>
              <View
                className="flex-1 min-w-[45%] p-4 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                  {insights.weeklyTrend === "improving"
                    ? "📈"
                    : insights.weeklyTrend === "declining"
                    ? "📉"
                    : "➡️"}
                </Text>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  Trend
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Search */}
        <View className="flex-row items-center gap-2 mb-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search voice notes..."
            className="flex-1 p-3 rounded-xl text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="p-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text style={{ color: colors.background }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Entries List */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          Recent Notes
        </Text>
        {entries.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="text-4xl mb-2">🎤</Text>
            <Text className="text-center" style={{ color: colors.muted }}>
              No voice notes yet. Tap the microphone to start recording!
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View
              key={entry.id}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: getSentimentColor(entry.sentiment) }}>
                    {getSentimentEmoji(entry.sentiment)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                    <Text style={{ color: colors.error }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-sm mb-2" style={{ color: colors.foreground }}>
                {entry.transcription}
              </Text>
              {entry.tags.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {entry.tags.map((tag, index) => (
                    <View
                      key={index}
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-xs" style={{ color: colors.primary }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              <Text className="text-xs mt-2" style={{ color: colors.muted }}>
                {entry.duration}s • Energy: {entry.energyLevel || "N/A"}
              </Text>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

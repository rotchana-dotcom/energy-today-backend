import { ScrollView, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { useState, useEffect, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  getCoachResponse,
  saveCoachSession,
  getCoachSessions,
  createCoachSession,
  type CoachMessage,
  type CoachSession,
} from "@/lib/ai-wellness-coach";
import { getSubscriptionStatus } from "@/lib/subscription-status";

/**
 * AI Wellness Coach Screen
 * 
 * Conversational AI that analyzes health data and provides personalized recommendations
 * Pro feature only
 */

export default function CoachScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachSession | null>(null);
  const [isPro, setIsPro] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    checkProAndInitialize();
  }, []);

  async function checkProAndInitialize() {
    const status = await getSubscriptionStatus();
    setIsPro(status.isPro);

    if (!status.isPro) {
      return;
    }

    // Load or create session
    const sessions = await getCoachSessions();
    if (sessions.length > 0) {
      const latest = sessions[sessions.length - 1];
      setCurrentSession(latest);
      setMessages(latest.messages);
    } else {
      const newSession = createCoachSession("general");
      setCurrentSession(newSession);
      
      // Add welcome message
      const welcomeMessage: CoachMessage = {
        id: "welcome",
        role: "coach",
        content: "Hello! I'm your AI Wellness Coach. I'm here to help you optimize your health and energy using insights from ancient wisdom systems and your personal data.\n\nYou can ask me about:\n• Sleep patterns and quality\n• Diet and nutrition\n• Meditation practices\n• Energy levels and chi flow\n• Weight management\n• General wellness guidance\n\nWhat would you like to explore today?",
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      newSession.messages.push(welcomeMessage);
      await saveCoachSession(newSession);
    }
  }

  async function handleSend() {
    if (!inputText.trim() || !currentSession || !isPro) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Get coach response
      const coachResponse = await getCoachResponse(userMessage.content);
      
      setMessages((prev) => [...prev, coachResponse]);
      
      // Update session
      currentSession.messages.push(userMessage, coachResponse);
      currentSession.lastMessageAt = new Date();
      await saveCoachSession(currentSession);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error getting coach response:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewSession() {
    const newSession = createCoachSession("general");
    setCurrentSession(newSession);
    setMessages([]);
    checkProAndInitialize();
  }

  if (!isPro) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🧠</Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 12, textAlign: "center" }}>
            AI Wellness Coach
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center", marginBottom: 24 }}>
            Get personalized health insights powered by 7 ancient wisdom systems
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/upgrade")}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Upgrade to Pro
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  function renderMessage({ item }: { item: CoachMessage }) {
    const isUser = item.role === "user";

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            maxWidth: "80%",
            backgroundColor: isUser ? colors.primary : colors.surface,
            borderRadius: 16,
            padding: 12,
            borderWidth: isUser ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: isUser ? "#fff" : colors.foreground,
              lineHeight: 22,
            }}
          >
            {item.content}
          </Text>
          
          {item.insights && item.insights.length > 0 && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", marginBottom: 8 }}>
                Insights from {item.insights.length} systems
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenContainer>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 24, color: colors.primary }}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground }}>
                AI Wellness Coach
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                Powered by 7 wisdom systems
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleNewSession}>
            <Text style={{ fontSize: 24 }}>✨</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={scrollViewRef as any}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View
              style={{
                maxWidth: "80%",
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.muted }}>
                Analyzing with 7 wisdom systems...
              </Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your wellness..."
            placeholderTextColor={colors.muted}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.foreground,
              marginRight: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={{
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.muted,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

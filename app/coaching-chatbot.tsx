import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function CoachingChatbotScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hi! I'm your energy optimization coach. I can help you understand your patterns, improve your energy levels, and optimize your daily routine. What would you like to know?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.coachingChatbot.chat.useMutation();
  const quickActionsQuery = trpc.coachingChatbot.getQuickActions.useQuery();

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Mock context data - in real app, fetch from storage
      const context = {
        recentEnergy: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          score: 60 + Math.random() * 40,
        })),
        recentWorkouts: [
          {
            type: "cardio",
            duration: 30,
            intensity: "moderate",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        sleepData: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          duration: 7 + Math.random() * 2,
          quality: 60 + Math.random() * 30,
        })),
      };

      const response = await chatMutation.mutateAsync({
        message: messageText,
        context,
      });

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  return (
    <ScreenContainer className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <View className="flex-1 p-4">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground">Energy Coach</Text>
            <Text className="text-sm text-muted">Your AI-powered energy advisor</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-3 ${message.isUser ? "items-end" : "items-start"}`}
              >
                <View
                  style={{
                    backgroundColor: message.isUser ? colors.primary : colors.surface,
                    maxWidth: "80%",
                  }}
                  className="rounded-2xl p-3 border border-border"
                >
                  <Text
                    style={{
                      color: message.isUser ? colors.background : colors.foreground,
                    }}
                    className="text-base leading-relaxed"
                  >
                    {message.text}
                  </Text>
                  <Text
                    style={{
                      color: message.isUser
                        ? colors.background
                        : colors.muted,
                      opacity: 0.7,
                    }}
                    className="text-xs mt-1"
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            ))}
            {isLoading && (
              <View className="items-start mb-3">
                <View
                  style={{ backgroundColor: colors.surface }}
                  className="rounded-2xl p-3 border border-border"
                >
                  <Text className="text-muted">Thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Actions */}
          {messages.length === 1 && quickActionsQuery.data && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-muted mb-2">
                Quick questions:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {quickActionsQuery.data.actions.map((action, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleQuickAction(action);
                      }}
                      style={({ pressed }) => [
                        {
                          backgroundColor: colors.surface,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      className="px-4 py-2 rounded-full border border-border"
                    >
                      <Text className="text-foreground text-sm">{action}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <View className="flex-row gap-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
              style={{
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
              className="flex-1 border border-border rounded-2xl px-4 py-3 max-h-24"
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor:
                    !inputText.trim() || isLoading ? colors.muted : colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Text className="text-background text-xl">↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

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
  createCircle,
  joinCircle,
  getCircles,
  leaveCircle,
  getUserId,
  compareCircleEnergy,
  findOptimalGatheringDays,
  sendMessage,
  getMessages,
  type EnergyCircle,
  type CircleMessage,
} from "@/lib/energy-circles";
import { getUserProfile } from "@/lib/storage";

export default function EnergyCirclesScreen() {
  const colors = useColors();
  const [circles, setCircles] = useState<EnergyCircle[]>([]);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showJoinCircle, setShowJoinCircle] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<EnergyCircle | null>(null);
  const [circleAnalysis, setCircleAnalysis] = useState<any>(null);
  const [optimalDays, setOptimalDays] = useState<any[]>([]);
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [newCircle, setNewCircle] = useState({
    name: "",
    description: "",
  });
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    const allCircles = await getCircles();
    setCircles(allCircles);
  };

  const handleCreateCircle = async () => {
    if (!newCircle.name.trim()) {
      Alert.alert("Error", "Please enter a circle name");
      return;
    }

    try {
      const profile = await getUserProfile();
      const circle = await createCircle(
        newCircle.name,
        newCircle.description,
        profile?.name || "User"
      );

      await loadCircles();
      setNewCircle({ name: "", description: "" });
      setShowCreateCircle(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Circle Created!",
        `Invite code: ${circle.inviteCode}\n\nShare this code with friends to invite them.`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create circle");
    }
  };

  const handleJoinCircle = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    try {
      const profile = await getUserProfile();
      await joinCircle(inviteCode.toUpperCase(), profile?.name || "User");
      await loadCircles();
      setInviteCode("");
      setShowJoinCircle(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "You've joined the circle!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join circle");
    }
  };

  const handleLeaveCircle = (circleId: string, circleName: string) => {
    Alert.alert("Leave Circle?", `Are you sure you want to leave "${circleName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          await leaveCircle(circleId);
          await loadCircles();
          setSelectedCircle(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const viewCircleDetails = async (circle: EnergyCircle) => {
    setSelectedCircle(circle);
    const analysis = await compareCircleEnergy(circle.id);
    setCircleAnalysis(analysis);
    const days = await findOptimalGatheringDays(circle.id);
    setOptimalDays(days.slice(0, 5)); // Top 5 days
    const circleMessages = await getMessages(circle.id);
    setMessages(circleMessages);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedCircle) return;

    try {
      const profile = await getUserProfile();
      await sendMessage(selectedCircle.id, messageInput, profile?.name || "User");
      const updatedMessages = await getMessages(selectedCircle.id);
      setMessages(updatedMessages);
      setMessageInput("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  if (showCreateCircle) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setShowCreateCircle(false)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Create Circle
            </Text>
            <TouchableOpacity onPress={handleCreateCircle}>
              <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Circle Name *
          </Text>
          <TextInput
            value={newCircle.name}
            onChangeText={(text) => setNewCircle({ ...newCircle, name: text })}
            placeholder="e.g., Family Energy Circle"
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
          />

          <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
            Description
          </Text>
          <TextInput
            value={newCircle.description}
            onChangeText={(text) => setNewCircle({ ...newCircle, description: text })}
            placeholder="Share energy insights with family..."
            className="p-4 rounded-xl mb-4 text-base"
            style={{ backgroundColor: colors.surface, color: colors.foreground }}
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />

          <View className="p-4 rounded-xl" style={{ backgroundColor: colors.primary + "20" }}>
            <Text className="text-sm" style={{ color: colors.foreground }}>
              💡 After creating your circle, you'll receive an invite code to share with friends
              and family. They can join by entering the code.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (showJoinCircle) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => setShowJoinCircle(false)}>
            <Text className="text-lg" style={{ color: colors.primary }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            Join Circle
          </Text>
          <TouchableOpacity onPress={handleJoinCircle}>
            <Text className="text-lg font-semibold" style={{ color: colors.primary }}>
              Join
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
          Invite Code *
        </Text>
        <TextInput
          value={inviteCode}
          onChangeText={(text) => setInviteCode(text.toUpperCase())}
          placeholder="ABC123"
          className="p-4 rounded-xl mb-4 text-2xl text-center font-bold"
          style={{ backgroundColor: colors.surface, color: colors.foreground }}
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          maxLength={6}
        />

        <View className="p-4 rounded-xl" style={{ backgroundColor: colors.primary + "20" }}>
          <Text className="text-sm" style={{ color: colors.foreground }}>
            💡 Enter the 6-character invite code shared by a circle member to join their energy
            circle.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (selectedCircle && circleAnalysis) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setSelectedCircle(null)}>
              <Text className="text-lg" style={{ color: colors.primary }}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {selectedCircle.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleLeaveCircle(selectedCircle.id, selectedCircle.name)}
            >
              <Text className="text-sm" style={{ color: colors.error }}>
                Leave
              </Text>
            </TouchableOpacity>
          </View>

          {/* Invite Code */}
          <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-sm mb-2" style={{ color: colors.muted }}>
              Invite Code
            </Text>
            <Text className="text-2xl font-bold text-center" style={{ color: colors.primary }}>
              {selectedCircle.inviteCode}
            </Text>
          </View>

          {/* Circle Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                {selectedCircle.members.length}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Members
              </Text>
            </View>
            <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                {circleAnalysis.averageEnergy}
              </Text>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Avg Energy
              </Text>
            </View>
          </View>

          {/* Member Comparison */}
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
            Member Energy
          </Text>
          {circleAnalysis.memberComparison.map((member: any) => (
            <View
              key={member.memberId}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {member.memberName}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                    {Math.round(member.averageEnergy)}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {member.trend === "increasing"
                      ? "↗"
                      : member.trend === "decreasing"
                        ? "↘"
                        : "→"}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Optimal Gathering Days */}
          <Text className="text-lg font-semibold mb-3 mt-4" style={{ color: colors.foreground }}>
            Best Days for Gathering
          </Text>
          {optimalDays.map((day) => (
            <View
              key={day.date}
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      day.score >= 80
                        ? colors.success + "30"
                        : day.score >= 60
                          ? colors.warning + "30"
                          : colors.error + "30",
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        day.score >= 80
                          ? colors.success
                          : day.score >= 60
                            ? colors.warning
                            : colors.error,
                    }}
                  >
                    {typeof day.score === 'number' ? day.score.toFixed(2) : day.score}% match
                  </Text>
                </View>
              </View>
              <Text className="text-sm" style={{ color: colors.muted }}>
                {day.recommendation}
              </Text>
            </View>
          ))}

          {/* Circle Chat */}
          <Text className="text-lg font-semibold mb-3 mt-4" style={{ color: colors.foreground }}>
            Circle Chat
          </Text>
          <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: colors.surface }}>
            {messages.length === 0 ? (
              <Text className="text-center text-sm" style={{ color: colors.muted }}>
                No messages yet. Start the conversation!
              </Text>
            ) : (
              messages.slice(-5).map((msg) => (
                <View key={msg.id} className="mb-3">
                  <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                    {msg.senderName} •{" "}
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.foreground }}>
                    {msg.text}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View className="flex-row gap-2 mb-6">
            <TextInput
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder="Type a message..."
              className="flex-1 p-3 rounded-xl text-sm"
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="px-4 py-3 rounded-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.background }}>
                Send
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
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
            Energy Circles
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {circles.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">👥</Text>
            <Text className="text-xl font-semibold mb-2" style={{ color: colors.foreground }}>
              No circles yet
            </Text>
            <Text className="text-base text-center mb-6" style={{ color: colors.muted }}>
              Create a circle or join one with an invite code
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              My Circles ({circles.length})
            </Text>
            {circles.map((circle) => (
              <TouchableOpacity
                key={circle.id}
                onPress={() => viewCircleDetails(circle)}
                className="p-4 rounded-xl mb-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-lg font-semibold mb-1" style={{ color: colors.foreground }}>
                  {circle.name}
                </Text>
                {circle.description && (
                  <Text className="text-sm mb-2" style={{ color: colors.muted }}>
                    {circle.description}
                  </Text>
                )}
                <Text className="text-sm" style={{ color: colors.primary }}>
                  {circle.members.length} members
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => setShowCreateCircle(true)}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.background }}
            >
              + Create Circle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowJoinCircle(true)}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.success }}
          >
            <Text
              className="text-center text-base font-semibold"
              style={{ color: colors.background }}
            >
              Join Circle
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

import { ScrollView, Text, View, TouchableOpacity, TextInput, FlatList, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { getSubscriptionStatus } from "@/lib/subscription-status";

/**
 * Community Feed Screen
 * 
 * Social timeline with achievements, progress shares, and challenges
 * Free users can view, Pro users can post and interact
 */

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  type: "achievement" | "milestone" | "challenge_complete" | "plan_complete" | "weight_goal" | "general";
  title: string;
  content: string;
  data: any;
  likes: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: Date;
  visibility: "public" | "partners" | "private";
}

export default function CommunityScreen() {
  const colors = useColors();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<"all" | "partners" | "challenges">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadPosts();
    checkProStatus();
  }, [filter]);

  async function checkProStatus() {
    const status = await getSubscriptionStatus();
    setIsPro(status.isPro);
  }

  async function loadPosts() {
    // TODO: Load from database via tRPC
    // For now, show sample posts
    const samplePosts: CommunityPost[] = [
      {
        id: "1",
        userId: "user1",
        userName: "Sarah M.",
        type: "achievement",
        title: "🎉 Achievement Unlocked!",
        content: "Week of Zen: Meditated 7 days in a row",
        data: { streak: 7 },
        likes: 12,
        commentCount: 3,
        isLiked: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        visibility: "public",
      },
      {
        id: "2",
        userId: "user2",
        userName: "John D.",
        type: "challenge_complete",
        title: "Challenge Complete!",
        content: "Completed 30-Day Meditation Streak with 93% success rate",
        data: { challengeName: "30-Day Meditation Streak", completionRate: 93 },
        likes: 24,
        commentCount: 7,
        isLiked: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        visibility: "public",
      },
      {
        id: "3",
        userId: "user3",
        userName: "Emma L.",
        type: "plan_complete",
        title: "30-Day Journey Complete!",
        content: "Successfully completed all 30 days of the Sleep Optimization plan",
        data: { planName: "Sleep Optimization", totalDays: 30 },
        likes: 18,
        commentCount: 5,
        isLiked: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        visibility: "public",
      },
    ];

    setPosts(samplePosts);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }

  async function handleLike(postId: string) {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // TODO: Update via tRPC
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  }

  function handleComment(postId: string) {
    if (!isPro) {
      router.push("/upgrade");
      return;
    }
    // TODO: Open comment modal
  }

  function handleCreatePost() {
    if (!isPro) {
      router.push("/upgrade");
      return;
    }
    // TODO: Open create post modal
  }

  function getPostIcon(type: CommunityPost["type"]): string {
    switch (type) {
      case "achievement":
        return "🎉";
      case "challenge_complete":
        return "🏆";
      case "plan_complete":
        return "🌟";
      case "weight_goal":
        return "🎯";
      case "milestone":
        return "✨";
      default:
        return "📝";
    }
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  }

  function renderPost({ item }: { item: CommunityPost }) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>{getPostIcon(item.type)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              {item.userName}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20, marginBottom: 12 }}>
          {item.content}
        </Text>

        {/* Actions */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <TouchableOpacity
            onPress={() => handleLike(item.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 24,
              opacity: item.isLiked ? 1 : 0.6,
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 6 }}>{item.isLiked ? "❤️" : "🤍"}</Text>
            <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: item.isLiked ? "600" : "400" }}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleComment(item.id)}
            style={{ flexDirection: "row", alignItems: "center", opacity: 0.6 }}
          >
            <Text style={{ fontSize: 18, marginRight: 6 }}>💬</Text>
            <Text style={{ fontSize: 14, color: colors.foreground }}>
              {item.commentCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
          Community
        </Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 12 }}>
        {(["all", "partners", "challenges"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: filter === f ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: filter === f ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                color: filter === f ? "#fff" : colors.foreground,
                fontWeight: filter === f ? "600" : "400",
                textTransform: "capitalize",
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🌱</Text>
            <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              No posts yet
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Be the first to share your progress!
            </Text>
          </View>
        }
      />

      {/* Pro Upgrade Prompt for Free Users */}
      {!isPro && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 4 }}>
              Upgrade to Pro
            </Text>
            <Text style={{ fontSize: 12, color: "#fff", opacity: 0.9 }}>
              Post, comment, and join challenges
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/upgrade")}
            style={{
              backgroundColor: "#fff",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

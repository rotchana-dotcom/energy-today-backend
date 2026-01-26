import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_PROFILE_KEY = "user_profile";
const FRIENDS_KEY = "user_friends";
const FRIEND_REQUESTS_KEY = "friend_requests";
const ACTIVITY_FEED_KEY = "activity_feed";
const MESSAGES_KEY = "user_messages";

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  stats: UserStats;
  badges: string[];
  privacy: PrivacySettings;
}

export interface UserStats {
  currentLevel: number;
  totalXP: number;
  energyStreak: number;
  habitsCompleted: number;
  achievementsUnlocked: number;
  friendsCount: number;
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showStats: boolean;
  showActivity: boolean;
  allowMessages: "everyone" | "friends" | "none";
}

export interface Friend {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: "active" | "pending" | "blocked";
  addedDate: string;
  mutualFriends?: number;
}

export interface FriendRequest {
  requestId: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatar?: string;
  message?: string;
  sentDate: string;
  status: "pending" | "accepted" | "rejected";
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  type: "energy_log" | "achievement" | "habit" | "challenge" | "level_up";
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export interface DirectMessage {
  messageId: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Create default profile
    const defaultProfile: UserProfile = {
      userId: `user_${Date.now()}`,
      username: "user" + Math.floor(Math.random() * 10000),
      displayName: "Energy User",
      joinDate: new Date().toISOString(),
      stats: {
        currentLevel: 1,
        totalXP: 0,
        energyStreak: 0,
        habitsCompleted: 0,
        achievementsUnlocked: 0,
        friendsCount: 0,
      },
      badges: [],
      privacy: {
        profileVisibility: "public",
        showStats: true,
        showActivity: true,
        allowMessages: "friends",
      },
    };
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const profile = await getUserProfile();
    const updatedProfile = { ...profile, ...updates };
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

/**
 * Update user stats
 */
export async function updateUserStats(
  stats: Partial<UserStats>
): Promise<UserProfile> {
  try {
    const profile = await getUserProfile();
    profile.stats = { ...profile.stats, ...stats };
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (error) {
    console.error("Failed to update user stats:", error);
    throw error;
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  settings: Partial<PrivacySettings>
): Promise<UserProfile> {
  try {
    const profile = await getUserProfile();
    profile.privacy = { ...profile.privacy, ...settings };
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (error) {
    console.error("Failed to update privacy settings:", error);
    throw error;
  }
}

/**
 * Get friends list
 */
export async function getFriends(): Promise<Friend[]> {
  try {
    const data = await AsyncStorage.getItem(FRIENDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get friends:", error);
    return [];
  }
}

/**
 * Add friend
 */
export async function addFriend(friend: Omit<Friend, "addedDate">): Promise<void> {
  try {
    const friends = await getFriends();
    
    // Check if already friends
    if (friends.some((f) => f.userId === friend.userId)) {
      throw new Error("Already friends with this user");
    }
    
    const newFriend: Friend = {
      ...friend,
      addedDate: new Date().toISOString(),
    };
    
    friends.push(newFriend);
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
    
    // Update friend count
    const profile = await getUserProfile();
    await updateUserStats({ friendsCount: friends.length });
  } catch (error) {
    console.error("Failed to add friend:", error);
    throw error;
  }
}

/**
 * Remove friend
 */
export async function removeFriend(userId: string): Promise<void> {
  try {
    const friends = await getFriends();
    const updatedFriends = friends.filter((f) => f.userId !== userId);
    
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
    
    // Update friend count
    await updateUserStats({ friendsCount: updatedFriends.length });
  } catch (error) {
    console.error("Failed to remove friend:", error);
    throw error;
  }
}

/**
 * Search users
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  // In real implementation, would search server
  // For now, return sample results
  
  if (!query || query.length < 2) {
    return [];
  }
  
  const sampleUsers: UserProfile[] = [
    {
      userId: "user1",
      username: "energymaster",
      displayName: "Energy Master",
      avatar: "https://i.pravatar.cc/150?u=user1",
      bio: "Optimizing energy for peak performance",
      joinDate: "2024-01-15T00:00:00.000Z",
      stats: {
        currentLevel: 45,
        totalXP: 202500,
        energyStreak: 120,
        habitsCompleted: 850,
        achievementsUnlocked: 42,
        friendsCount: 156,
      },
      badges: ["early_bird", "week_warrior", "habit_master"],
      privacy: {
        profileVisibility: "public",
        showStats: true,
        showActivity: true,
        allowMessages: "everyone",
      },
    },
    {
      userId: "user2",
      username: "wellnessguru",
      displayName: "Wellness Guru",
      avatar: "https://i.pravatar.cc/150?u=user2",
      bio: "Helping others find balance and energy",
      joinDate: "2024-02-20T00:00:00.000Z",
      stats: {
        currentLevel: 38,
        totalXP: 144400,
        energyStreak: 85,
        habitsCompleted: 620,
        achievementsUnlocked: 35,
        friendsCount: 98,
      },
      badges: ["meditation_master", "sleep_champion"],
      privacy: {
        profileVisibility: "public",
        showStats: true,
        showActivity: true,
        allowMessages: "friends",
      },
    },
  ];
  
  return sampleUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Get friend requests
 */
export async function getFriendRequests(): Promise<FriendRequest[]> {
  try {
    const data = await AsyncStorage.getItem(FRIEND_REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get friend requests:", error);
    return [];
  }
}

/**
 * Send friend request
 */
export async function sendFriendRequest(
  toUserId: string,
  message?: string
): Promise<void> {
  try {
    const profile = await getUserProfile();
    
    const request: FriendRequest = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: profile.userId,
      fromUsername: profile.username,
      fromDisplayName: profile.displayName,
      fromAvatar: profile.avatar,
      message,
      sentDate: new Date().toISOString(),
      status: "pending",
    };
    
    // In real implementation, would send to server
    // For now, just store locally
    const requests = await getFriendRequests();
    requests.push(request);
    await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Failed to send friend request:", error);
    throw error;
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    const requests = await getFriendRequests();
    const request = requests.find((r) => r.requestId === requestId);
    
    if (!request) {
      throw new Error("Friend request not found");
    }
    
    request.status = "accepted";
    await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests));
    
    // Add to friends list
    await addFriend({
      userId: request.fromUserId,
      username: request.fromUsername,
      displayName: request.fromDisplayName,
      avatar: request.fromAvatar,
      status: "active",
    });
  } catch (error) {
    console.error("Failed to accept friend request:", error);
    throw error;
  }
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    const requests = await getFriendRequests();
    const request = requests.find((r) => r.requestId === requestId);
    
    if (request) {
      request.status = "rejected";
      await AsyncStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(requests));
    }
  } catch (error) {
    console.error("Failed to reject friend request:", error);
    throw error;
  }
}

/**
 * Get activity feed
 */
export async function getActivityFeed(
  filter: "all" | "friends" = "all"
): Promise<ActivityFeedItem[]> {
  try {
    // In real implementation, would fetch from server
    // For now, return sample feed
    
    const sampleFeed: ActivityFeedItem[] = [
      {
        id: "activity1",
        userId: "user1",
        username: "energymaster",
        displayName: "Energy Master",
        avatar: "https://i.pravatar.cc/150?u=user1",
        type: "achievement",
        content: "Unlocked 'Week Warrior' achievement!",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 24,
        comments: 5,
      },
      {
        id: "activity2",
        userId: "user2",
        username: "wellnessguru",
        displayName: "Wellness Guru",
        avatar: "https://i.pravatar.cc/150?u=user2",
        type: "level_up",
        content: "Reached Level 38!",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: 18,
        comments: 3,
      },
      {
        id: "activity3",
        userId: "user1",
        username: "energymaster",
        displayName: "Energy Master",
        avatar: "https://i.pravatar.cc/150?u=user1",
        type: "energy_log",
        content: "Logged peak energy of 95!",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: 12,
        comments: 2,
      },
    ];
    
    return sampleFeed;
  } catch (error) {
    console.error("Failed to get activity feed:", error);
    return [];
  }
}

/**
 * Post activity
 */
export async function postActivity(
  type: ActivityFeedItem["type"],
  content: string
): Promise<void> {
  try {
    const profile = await getUserProfile();
    
    const activity: ActivityFeedItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.avatar,
      type,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };
    
    // In real implementation, would post to server
    // For now, just store locally
    const feed = await getActivityFeed();
    feed.unshift(activity);
    await AsyncStorage.setItem(ACTIVITY_FEED_KEY, JSON.stringify(feed));
  } catch (error) {
    console.error("Failed to post activity:", error);
    throw error;
  }
}

/**
 * Get direct messages
 */
export async function getDirectMessages(
  conversationId: string
): Promise<DirectMessage[]> {
  try {
    const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${conversationId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get messages:", error);
    return [];
  }
}

/**
 * Send direct message
 */
export async function sendDirectMessage(
  toUserId: string,
  content: string
): Promise<void> {
  try {
    const profile = await getUserProfile();
    const conversationId = [profile.userId, toUserId].sort().join("_");
    
    const message: DirectMessage = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      fromUserId: profile.userId,
      toUserId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    const messages = await getDirectMessages(conversationId);
    messages.push(message);
    
    await AsyncStorage.setItem(
      `${MESSAGES_KEY}_${conversationId}`,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

/**
 * Get conversations list
 */
export async function getConversations(): Promise<{
  conversationId: string;
  otherUser: Friend;
  lastMessage: DirectMessage;
  unreadCount: number;
}[]> {
  // In real implementation, would fetch from server
  // For now, return empty array
  return [];
}

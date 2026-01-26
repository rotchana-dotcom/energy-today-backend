import AsyncStorage from "@react-native-async-storage/async-storage";

const FORUMS_KEY = "community_forums";
const THREADS_KEY = "forum_threads";
const POSTS_KEY = "forum_posts";
const GROUPS_KEY = "community_groups";
const GROUP_MEMBERS_KEY = "group_members";
const MODERATION_KEY = "moderation_actions";

export type ForumCategory = 
  | "energy"
  | "sleep"
  | "nutrition"
  | "fitness"
  | "stress"
  | "habits"
  | "general";

export interface Forum {
  id: string;
  category: ForumCategory;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  postCount: number;
  lastActivity?: {
    threadId: string;
    threadTitle: string;
    userId: string;
    userName: string;
    timestamp: string;
  };
}

export interface ForumThread {
  id: string;
  forumId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  views: number;
  replyCount: number;
  upvotes: number;
  downvotes: number;
  createdDate: string;
  lastReplyDate?: string;
  lastReplyBy?: string;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdDate: string;
  editedDate?: string;
  parentPostId?: string; // For nested replies
  reported: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: ForumCategory;
  avatar?: string;
  coverImage?: string;
  ownerId: string;
  memberCount: number;
  privacy: "public" | "private" | "secret";
  joinApproval: boolean;
  createdDate: string;
  tags: string[];
}

export interface GroupMember {
  groupId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: "owner" | "moderator" | "member";
  joinedDate: string;
  lastActiveDate: string;
}

export interface ModerationAction {
  id: string;
  type: "report" | "flag" | "ban" | "delete" | "lock";
  targetType: "thread" | "post" | "user";
  targetId: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  moderatorId?: string;
  moderatorNotes?: string;
  createdDate: string;
  resolvedDate?: string;
}

export interface UserVote {
  userId: string;
  targetType: "thread" | "post";
  targetId: string;
  vote: "up" | "down";
}

/**
 * Get all forums
 */
export async function getForums(): Promise<Forum[]> {
  try {
    const data = await AsyncStorage.getItem(FORUMS_KEY);
    return data ? JSON.parse(data) : getDefaultForums();
  } catch (error) {
    console.error("Failed to get forums:", error);
    return [];
  }
}

/**
 * Get forum by ID
 */
export async function getForum(id: string): Promise<Forum | null> {
  const forums = await getForums();
  return forums.find((f) => f.id === id) || null;
}

/**
 * Get forum threads
 */
export async function getForumThreads(
  forumId: string,
  filters?: {
    pinned?: boolean;
    tags?: string[];
    sortBy?: "recent" | "popular" | "views";
  }
): Promise<ForumThread[]> {
  try {
    const data = await AsyncStorage.getItem(`${THREADS_KEY}_${forumId}`);
    let threads: ForumThread[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.pinned !== undefined) {
        threads = threads.filter((t) => t.pinned === filters.pinned);
      }
      if (filters.tags && filters.tags.length > 0) {
        threads = threads.filter((t) =>
          filters.tags!.some((tag) => t.tags.includes(tag))
        );
      }
    }
    
    // Sort
    const sortBy = filters?.sortBy || "recent";
    if (sortBy === "recent") {
      threads.sort((a, b) => {
        const aDate = a.lastReplyDate || a.createdDate;
        const bDate = b.lastReplyDate || b.createdDate;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    } else if (sortBy === "popular") {
      threads.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (sortBy === "views") {
      threads.sort((a, b) => b.views - a.views);
    }
    
    return threads;
  } catch (error) {
    console.error("Failed to get forum threads:", error);
    return [];
  }
}

/**
 * Create forum thread
 */
export async function createForumThread(
  thread: Omit<ForumThread, "id" | "createdDate" | "views" | "replyCount" | "upvotes" | "downvotes">
): Promise<ForumThread> {
  try {
    const threads = await getForumThreads(thread.forumId);
    
    const newThread: ForumThread = {
      ...thread,
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
      views: 0,
      replyCount: 0,
      upvotes: 0,
      downvotes: 0,
    };
    
    threads.push(newThread);
    await AsyncStorage.setItem(
      `${THREADS_KEY}_${thread.forumId}`,
      JSON.stringify(threads)
    );
    
    // Update forum stats
    await updateForumStats(thread.forumId);
    
    return newThread;
  } catch (error) {
    console.error("Failed to create forum thread:", error);
    throw error;
  }
}

/**
 * Get thread posts
 */
export async function getThreadPosts(threadId: string): Promise<ForumPost[]> {
  try {
    const data = await AsyncStorage.getItem(`${POSTS_KEY}_${threadId}`);
    const posts: ForumPost[] = data ? JSON.parse(data) : [];
    
    // Sort by date
    posts.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
    
    return posts;
  } catch (error) {
    console.error("Failed to get thread posts:", error);
    return [];
  }
}

/**
 * Create forum post
 */
export async function createForumPost(
  post: Omit<ForumPost, "id" | "createdDate" | "upvotes" | "downvotes" | "reported">
): Promise<ForumPost> {
  try {
    const posts = await getThreadPosts(post.threadId);
    
    const newPost: ForumPost = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      reported: false,
    };
    
    posts.push(newPost);
    await AsyncStorage.setItem(
      `${POSTS_KEY}_${post.threadId}`,
      JSON.stringify(posts)
    );
    
    // Update thread reply count
    await updateThreadReplyCount(post.threadId);
    
    return newPost;
  } catch (error) {
    console.error("Failed to create forum post:", error);
    throw error;
  }
}

/**
 * Vote on thread or post
 */
export async function vote(
  targetType: "thread" | "post",
  targetId: string,
  userId: string,
  voteType: "up" | "down"
): Promise<void> {
  try {
    // Get existing vote
    const voteKey = `vote_${userId}_${targetType}_${targetId}`;
    const existingVote = await AsyncStorage.getItem(voteKey);
    
    if (existingVote === voteType) {
      // Remove vote
      await AsyncStorage.removeItem(voteKey);
      await updateVoteCount(targetType, targetId, voteType, -1);
    } else {
      // Add or change vote
      if (existingVote) {
        // Remove old vote
        await updateVoteCount(targetType, targetId, existingVote as "up" | "down", -1);
      }
      // Add new vote
      await AsyncStorage.setItem(voteKey, voteType);
      await updateVoteCount(targetType, targetId, voteType, 1);
    }
  } catch (error) {
    console.error("Failed to vote:", error);
    throw error;
  }
}

/**
 * Update vote count
 */
async function updateVoteCount(
  targetType: "thread" | "post",
  targetId: string,
  voteType: "up" | "down",
  delta: number
): Promise<void> {
  if (targetType === "thread") {
    // Find thread across all forums
    const forums = await getForums();
    for (const forum of forums) {
      const threads = await getForumThreads(forum.id);
      const thread = threads.find((t) => t.id === targetId);
      if (thread) {
        if (voteType === "up") {
          thread.upvotes += delta;
        } else {
          thread.downvotes += delta;
        }
        await AsyncStorage.setItem(
          `${THREADS_KEY}_${forum.id}`,
          JSON.stringify(threads)
        );
        break;
      }
    }
  } else {
    // Find post across all threads
    const forums = await getForums();
    for (const forum of forums) {
      const threads = await getForumThreads(forum.id);
      for (const thread of threads) {
        const posts = await getThreadPosts(thread.id);
        const post = posts.find((p) => p.id === targetId);
        if (post) {
          if (voteType === "up") {
            post.upvotes += delta;
          } else {
            post.downvotes += delta;
          }
          await AsyncStorage.setItem(
            `${POSTS_KEY}_${thread.id}`,
            JSON.stringify(posts)
          );
          return;
        }
      }
    }
  }
}

/**
 * Update thread reply count
 */
async function updateThreadReplyCount(threadId: string): Promise<void> {
  const forums = await getForums();
  for (const forum of forums) {
    const threads = await getForumThreads(forum.id);
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      const posts = await getThreadPosts(threadId);
      thread.replyCount = posts.length;
      thread.lastReplyDate = new Date().toISOString();
      await AsyncStorage.setItem(
        `${THREADS_KEY}_${forum.id}`,
        JSON.stringify(threads)
      );
      break;
    }
  }
}

/**
 * Update forum stats
 */
async function updateForumStats(forumId: string): Promise<void> {
  const forums = await getForums();
  const forum = forums.find((f) => f.id === forumId);
  if (forum) {
    const threads = await getForumThreads(forumId);
    forum.threadCount = threads.length;
    
    let totalPosts = 0;
    for (const thread of threads) {
      const posts = await getThreadPosts(thread.id);
      totalPosts += posts.length;
    }
    forum.postCount = totalPosts;
    
    await AsyncStorage.setItem(FORUMS_KEY, JSON.stringify(forums));
  }
}

/**
 * Search threads
 */
export async function searchThreads(query: string): Promise<ForumThread[]> {
  const forums = await getForums();
  const results: ForumThread[] = [];
  const lowerQuery = query.toLowerCase();
  
  for (const forum of forums) {
    const threads = await getForumThreads(forum.id);
    const matches = threads.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.content.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
    results.push(...matches);
  }
  
  return results;
}

/**
 * Get community groups
 */
export async function getCommunityGroups(filters?: {
  category?: ForumCategory;
  privacy?: CommunityGroup["privacy"];
}): Promise<CommunityGroup[]> {
  try {
    const data = await AsyncStorage.getItem(GROUPS_KEY);
    let groups: CommunityGroup[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        groups = groups.filter((g) => g.category === filters.category);
      }
      if (filters.privacy) {
        groups = groups.filter((g) => g.privacy === filters.privacy);
      }
    }
    
    // Sort by member count
    groups.sort((a, b) => b.memberCount - a.memberCount);
    
    return groups;
  } catch (error) {
    console.error("Failed to get community groups:", error);
    return [];
  }
}

/**
 * Create community group
 */
export async function createCommunityGroup(
  group: Omit<CommunityGroup, "id" | "createdDate" | "memberCount">
): Promise<CommunityGroup> {
  try {
    const groups = await getCommunityGroups();
    
    const newGroup: CommunityGroup = {
      ...group,
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdDate: new Date().toISOString(),
      memberCount: 1, // Owner is first member
    };
    
    groups.push(newGroup);
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    
    // Add owner as member
    await addGroupMember(newGroup.id, group.ownerId, "Owner", "owner");
    
    return newGroup;
  } catch (error) {
    console.error("Failed to create community group:", error);
    throw error;
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  try {
    const data = await AsyncStorage.getItem(`${GROUP_MEMBERS_KEY}_${groupId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get group members:", error);
    return [];
  }
}

/**
 * Add group member
 */
export async function addGroupMember(
  groupId: string,
  userId: string,
  userName: string,
  role: GroupMember["role"] = "member"
): Promise<void> {
  try {
    const members = await getGroupMembers(groupId);
    
    // Check if already member
    if (members.some((m) => m.userId === userId)) {
      return;
    }
    
    const newMember: GroupMember = {
      groupId,
      userId,
      userName,
      role,
      joinedDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
    };
    
    members.push(newMember);
    await AsyncStorage.setItem(
      `${GROUP_MEMBERS_KEY}_${groupId}`,
      JSON.stringify(members)
    );
    
    // Update group member count
    const groups = await getCommunityGroups();
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.memberCount = members.length;
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }
  } catch (error) {
    console.error("Failed to add group member:", error);
    throw error;
  }
}

/**
 * Remove group member
 */
export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const members = await getGroupMembers(groupId);
    const filtered = members.filter((m) => m.userId !== userId);
    
    await AsyncStorage.setItem(
      `${GROUP_MEMBERS_KEY}_${groupId}`,
      JSON.stringify(filtered)
    );
    
    // Update group member count
    const groups = await getCommunityGroups();
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.memberCount = filtered.length;
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }
  } catch (error) {
    console.error("Failed to remove group member:", error);
    throw error;
  }
}

/**
 * Report content
 */
export async function reportContent(
  targetType: "thread" | "post" | "user",
  targetId: string,
  reportedBy: string,
  reason: string
): Promise<ModerationAction> {
  try {
    const data = await AsyncStorage.getItem(MODERATION_KEY);
    const actions: ModerationAction[] = data ? JSON.parse(data) : [];
    
    const newAction: ModerationAction = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "report",
      targetType,
      targetId,
      reportedBy,
      reason,
      status: "pending",
      createdDate: new Date().toISOString(),
    };
    
    actions.push(newAction);
    await AsyncStorage.setItem(MODERATION_KEY, JSON.stringify(actions));
    
    return newAction;
  } catch (error) {
    console.error("Failed to report content:", error);
    throw error;
  }
}

/**
 * Get moderation actions
 */
export async function getModerationActions(
  status?: ModerationAction["status"]
): Promise<ModerationAction[]> {
  try {
    const data = await AsyncStorage.getItem(MODERATION_KEY);
    let actions: ModerationAction[] = data ? JSON.parse(data) : [];
    
    if (status) {
      actions = actions.filter((a) => a.status === status);
    }
    
    actions.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    
    return actions;
  } catch (error) {
    console.error("Failed to get moderation actions:", error);
    return [];
  }
}

/**
 * Get default forums
 */
function getDefaultForums(): Forum[] {
  return [
    {
      id: "forum_energy",
      category: "energy",
      name: "Energy Optimization",
      description: "Discuss strategies and tips for maximizing your daily energy levels",
      icon: "⚡",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_sleep",
      category: "sleep",
      name: "Sleep & Recovery",
      description: "Share sleep tips, routines, and recovery strategies",
      icon: "😴",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_nutrition",
      category: "nutrition",
      name: "Nutrition & Diet",
      description: "Discuss meal plans, recipes, and nutrition for energy",
      icon: "🥗",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_fitness",
      category: "fitness",
      name: "Fitness & Exercise",
      description: "Share workout routines and fitness goals",
      icon: "💪",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_stress",
      category: "stress",
      name: "Stress Management",
      description: "Techniques for managing stress and preventing burnout",
      icon: "🧘",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_habits",
      category: "habits",
      name: "Habits & Routines",
      description: "Build better habits and optimize your daily routines",
      icon: "📅",
      threadCount: 0,
      postCount: 0,
    },
    {
      id: "forum_general",
      category: "general",
      name: "General Discussion",
      description: "Everything else related to wellness and productivity",
      icon: "💬",
      threadCount: 0,
      postCount: 0,
    },
  ];
}

/**
 * Customer Support Chat Library
 * Real-time support with AI assistance
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "support_chat";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  suggestedArticles?: Array<{ id: string; title: string }>;
  needsEscalation?: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  category: string;
  status: "open" | "waiting" | "resolved" | "escalated";
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  userContext?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    subscriptionTier?: "free" | "pro" | "family";
    accountAge?: number;
  };
}

export interface SupportTicket {
  id: string;
  conversationId: string;
  subject: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

/**
 * Create new conversation
 */
export async function createConversation(
  subject: string,
  category: string,
  initialMessage: string,
  userContext?: Conversation["userContext"]
): Promise<Conversation> {
  const conversationId = Date.now().toString();
  
  const conversation: Conversation = {
    id: conversationId,
    subject,
    category,
    status: "open",
    messages: [
      {
        id: `${conversationId}_1`,
        conversationId,
        role: "user",
        content: initialMessage,
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    userContext,
  };
  
  await saveConversation(conversation);
  return conversation;
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const data = await AsyncStorage.getItem(`${STORAGE_KEY}_${conversationId}`);
  if (!data) return null;
  
  const conversation = JSON.parse(data);
  
  // Convert date strings back to Date objects
  conversation.createdAt = new Date(conversation.createdAt);
  conversation.updatedAt = new Date(conversation.updatedAt);
  if (conversation.resolvedAt) {
    conversation.resolvedAt = new Date(conversation.resolvedAt);
  }
  
  conversation.messages = conversation.messages.map((msg: any) => ({
    ...msg,
    timestamp: new Date(msg.timestamp),
  }));
  
  return conversation;
}

/**
 * Get all conversations
 */
export async function getAllConversations(): Promise<Conversation[]> {
  const keys = await AsyncStorage.getAllKeys();
  const conversationKeys = keys.filter(key => key.startsWith(`${STORAGE_KEY}_`));
  
  const conversations: Conversation[] = [];
  
  for (const key of conversationKeys) {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const conversation = JSON.parse(data);
      conversation.createdAt = new Date(conversation.createdAt);
      conversation.updatedAt = new Date(conversation.updatedAt);
      if (conversation.resolvedAt) {
        conversation.resolvedAt = new Date(conversation.resolvedAt);
      }
      conversation.messages = conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      conversations.push(conversation);
    }
  }
  
  // Sort by most recent first
  return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Save conversation
 */
async function saveConversation(conversation: Conversation): Promise<void> {
  await AsyncStorage.setItem(
    `${STORAGE_KEY}_${conversation.id}`,
    JSON.stringify(conversation)
  );
}

/**
 * Add message to conversation
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  suggestedArticles?: Array<{ id: string; title: string }>,
  needsEscalation?: boolean
): Promise<ChatMessage> {
  const conversation = await getConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  
  const message: ChatMessage = {
    id: `${conversationId}_${conversation.messages.length + 1}`,
    conversationId,
    role,
    content,
    timestamp: new Date(),
    suggestedArticles,
    needsEscalation,
  };
  
  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  
  // Update status if escalation needed
  if (needsEscalation && conversation.status !== "escalated") {
    conversation.status = "escalated";
  }
  
  await saveConversation(conversation);
  return message;
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: Conversation["status"]
): Promise<void> {
  const conversation = await getConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  
  conversation.status = status;
  conversation.updatedAt = new Date();
  
  if (status === "resolved") {
    conversation.resolvedAt = new Date();
  }
  
  await saveConversation(conversation);
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  await AsyncStorage.removeItem(`${STORAGE_KEY}_${conversationId}`);
}

/**
 * Get conversation statistics
 */
export async function getConversationStats(): Promise<{
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  escalatedConversations: number;
  averageResponseTime: number; // minutes
  averageResolutionTime: number; // hours
  conversationsByCategory: Record<string, number>;
}> {
  const conversations = await getAllConversations();
  
  const stats = {
    totalConversations: conversations.length,
    openConversations: conversations.filter(c => c.status === "open" || c.status === "waiting").length,
    resolvedConversations: conversations.filter(c => c.status === "resolved").length,
    escalatedConversations: conversations.filter(c => c.status === "escalated").length,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    conversationsByCategory: {} as Record<string, number>,
  };
  
  // Calculate average response time (time between user message and AI response)
  let totalResponseTime = 0;
  let responseCount = 0;
  
  conversations.forEach(conversation => {
    for (let i = 0; i < conversation.messages.length - 1; i++) {
      const currentMsg = conversation.messages[i];
      const nextMsg = conversation.messages[i + 1];
      
      if (currentMsg.role === "user" && nextMsg.role === "assistant") {
        const responseTime = nextMsg.timestamp.getTime() - currentMsg.timestamp.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
  });
  
  if (responseCount > 0) {
    stats.averageResponseTime = Math.round(totalResponseTime / responseCount / 1000 / 60); // minutes
  }
  
  // Calculate average resolution time
  const resolvedConversations = conversations.filter(c => c.resolvedAt);
  if (resolvedConversations.length > 0) {
    const totalResolutionTime = resolvedConversations.reduce((sum, c) => {
      return sum + (c.resolvedAt!.getTime() - c.createdAt.getTime());
    }, 0);
    stats.averageResolutionTime = Math.round(totalResolutionTime / resolvedConversations.length / 1000 / 60 / 60); // hours
  }
  
  // Count by category
  conversations.forEach(conversation => {
    stats.conversationsByCategory[conversation.category] = 
      (stats.conversationsByCategory[conversation.category] || 0) + 1;
  });
  
  return stats;
}

/**
 * Get common support categories
 */
export function getSupportCategories(): Array<{ id: string; name: string; icon: string }> {
  return [
    { id: "account", name: "Account & Login", icon: "person" },
    { id: "billing", name: "Billing & Subscription", icon: "credit-card" },
    { id: "technical", name: "Technical Issue", icon: "tool" },
    { id: "features", name: "Features & How-To", icon: "help-circle" },
    { id: "data", name: "Data & Privacy", icon: "shield" },
    { id: "feedback", name: "Feedback & Suggestions", icon: "message-circle" },
    { id: "other", name: "Other", icon: "more-horizontal" },
  ];
}

/**
 * Get quick reply suggestions
 */
export function getQuickReplies(category: string): string[] {
  const quickReplies: Record<string, string[]> = {
    account: [
      "I can't log in",
      "How do I reset my password?",
      "How do I delete my account?",
      "How do I change my email?",
    ],
    billing: [
      "How do I upgrade to Premium?",
      "How do I cancel my subscription?",
      "I was charged incorrectly",
      "How do I get a refund?",
    ],
    technical: [
      "The app is crashing",
      "The app is slow",
      "My data isn't syncing",
      "I'm getting an error message",
    ],
    features: [
      "How do I track my energy?",
      "How does sleep tracking work?",
      "How do I join a challenge?",
      "How do I use AI insights?",
    ],
    data: [
      "Is my data private?",
      "How do I export my data?",
      "How do I delete my data?",
      "What data do you collect?",
    ],
    feedback: [
      "I have a feature request",
      "I found a bug",
      "I love the app!",
      "I have a suggestion",
    ],
    other: [
      "I need help with something else",
      "I have a general question",
    ],
  };
  
  return quickReplies[category] || quickReplies.other;
}

/**
 * Create support ticket from conversation
 */
export async function createTicketFromConversation(
  conversationId: string,
  severity: SupportTicket["severity"]
): Promise<SupportTicket> {
  const conversation = await getConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  
  const ticket: SupportTicket = {
    id: `ticket_${Date.now()}`,
    conversationId,
    subject: conversation.subject,
    description: conversation.messages[0].content,
    category: conversation.category,
    severity,
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Update conversation status
  await updateConversationStatus(conversationId, "escalated");
  
  return ticket;
}

/**
 * Rate conversation
 */
export async function rateConversation(
  conversationId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  feedback?: string
): Promise<void> {
  const key = `${STORAGE_KEY}_rating_${conversationId}`;
  
  const ratingData = {
    conversationId,
    rating,
    feedback,
    timestamp: new Date(),
  };
  
  await AsyncStorage.setItem(key, JSON.stringify(ratingData));
}

/**
 * Get satisfaction ratings
 */
export async function getSatisfactionRatings(): Promise<{
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
}> {
  const keys = await AsyncStorage.getAllKeys();
  const ratingKeys = keys.filter(key => key.startsWith(`${STORAGE_KEY}_rating_`));
  
  let totalRating = 0;
  let totalRatings = 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  for (const key of ratingKeys) {
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const rating = JSON.parse(data);
      totalRating += rating.rating;
      totalRatings++;
      distribution[rating.rating]++;
    }
  }
  
  return {
    averageRating: totalRatings > 0 ? totalRating / totalRatings : 0,
    totalRatings,
    ratingDistribution: distribution,
  };
}

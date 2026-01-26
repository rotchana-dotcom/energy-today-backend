import AsyncStorage from "@react-native-async-storage/async-storage";

export interface EnergyCircle {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  members: CircleMember[];
}

export interface CircleMember {
  id: string;
  name: string;
  joinedAt: string;
  energyData?: {
    date: string;
    energyLevel: number;
  }[];
}

export interface CircleMessage {
  id: string;
  circleId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const CIRCLES_KEY = "energy_circles";
const MESSAGES_KEY = "circle_messages";
const USER_ID_KEY = "user_id";

/**
 * Generate a unique invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get or create user ID
 */
export async function getUserId(): Promise<string> {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = Date.now().toString();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error("Failed to get user ID:", error);
    return Date.now().toString();
  }
}

/**
 * Create a new energy circle
 */
export async function createCircle(
  name: string,
  description: string,
  creatorName: string
): Promise<EnergyCircle> {
  try {
    const userId = await getUserId();
    const circle: EnergyCircle = {
      id: Date.now().toString(),
      name,
      description,
      inviteCode: generateInviteCode(),
      createdBy: userId,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: userId,
          name: creatorName,
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const circles = await getCircles();
    circles.push(circle);
    await AsyncStorage.setItem(CIRCLES_KEY, JSON.stringify(circles));

    return circle;
  } catch (error) {
    console.error("Failed to create circle:", error);
    throw error;
  }
}

/**
 * Join an existing circle using invite code
 */
export async function joinCircle(inviteCode: string, memberName: string): Promise<EnergyCircle> {
  try {
    const circles = await getCircles();
    const circle = circles.find((c) => c.inviteCode === inviteCode.toUpperCase());

    if (!circle) {
      throw new Error("Invalid invite code");
    }

    const userId = await getUserId();

    // Check if already a member
    if (circle.members.some((m) => m.id === userId)) {
      return circle;
    }

    // Add new member
    circle.members.push({
      id: userId,
      name: memberName,
      joinedAt: new Date().toISOString(),
    });

    await AsyncStorage.setItem(CIRCLES_KEY, JSON.stringify(circles));
    return circle;
  } catch (error) {
    console.error("Failed to join circle:", error);
    throw error;
  }
}

/**
 * Get all circles the user is a member of
 */
export async function getCircles(): Promise<EnergyCircle[]> {
  try {
    const data = await AsyncStorage.getItem(CIRCLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get circles:", error);
    return [];
  }
}

/**
 * Get a specific circle by ID
 */
export async function getCircle(circleId: string): Promise<EnergyCircle | null> {
  const circles = await getCircles();
  return circles.find((c) => c.id === circleId) || null;
}

/**
 * Leave a circle
 */
export async function leaveCircle(circleId: string): Promise<void> {
  try {
    const circles = await getCircles();
    const userId = await getUserId();
    const circleIndex = circles.findIndex((c) => c.id === circleId);

    if (circleIndex === -1) return;

    const circle = circles[circleIndex];
    circle.members = circle.members.filter((m) => m.id !== userId);

    // If no members left, delete the circle
    if (circle.members.length === 0) {
      circles.splice(circleIndex, 1);
    }

    await AsyncStorage.setItem(CIRCLES_KEY, JSON.stringify(circles));
  } catch (error) {
    console.error("Failed to leave circle:", error);
    throw error;
  }
}

/**
 * Send a message to a circle
 */
export async function sendMessage(
  circleId: string,
  text: string,
  senderName: string
): Promise<CircleMessage> {
  try {
    const userId = await getUserId();
    const message: CircleMessage = {
      id: Date.now().toString(),
      circleId,
      senderId: userId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };

    const messages = await getMessages(circleId);
    messages.push(message);

    const allMessages = await getAllMessages();
    const otherMessages = allMessages.filter((m) => m.circleId !== circleId);
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify([...otherMessages, ...messages]));

    return message;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

/**
 * Get messages for a specific circle
 */
export async function getMessages(circleId: string): Promise<CircleMessage[]> {
  try {
    const allMessages = await getAllMessages();
    return allMessages.filter((m) => m.circleId === circleId);
  } catch (error) {
    console.error("Failed to get messages:", error);
    return [];
  }
}

/**
 * Get all messages
 */
async function getAllMessages(): Promise<CircleMessage[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get all messages:", error);
    return [];
  }
}

/**
 * Compare energy patterns within a circle
 */
export async function compareCircleEnergy(circleId: string): Promise<{
  averageEnergy: number;
  highEnergyDays: string[];
  lowEnergyDays: string[];
  memberComparison: Array<{
    memberId: string;
    memberName: string;
    averageEnergy: number;
    trend: "increasing" | "decreasing" | "stable";
  }>;
}> {
  const circle = await getCircle(circleId);
  if (!circle) {
    return {
      averageEnergy: 0,
      highEnergyDays: [],
      lowEnergyDays: [],
      memberComparison: [],
    };
  }

  // Mock energy data analysis
  // In real app, this would fetch actual energy data for each member
  const memberComparison = circle.members.map((member) => ({
    memberId: member.id,
    memberName: member.name,
    averageEnergy: 50 + Math.random() * 40,
    trend: (["increasing", "decreasing", "stable"] as const)[Math.floor(Math.random() * 3)],
  }));

  const averageEnergy =
    memberComparison.reduce((sum, m) => sum + m.averageEnergy, 0) / memberComparison.length;

  // Generate high/low energy days
  const today = new Date();
  const highEnergyDays: string[] = [];
  const lowEnergyDays: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    const avgDayEnergy = 50 + Math.random() * 50;
    if (avgDayEnergy > 75) {
      highEnergyDays.push(dateStr);
    } else if (avgDayEnergy < 40) {
      lowEnergyDays.push(dateStr);
    }
  }

  return {
    averageEnergy: Math.round(averageEnergy),
    highEnergyDays,
    lowEnergyDays,
    memberComparison,
  };
}

/**
 * Find optimal days for group gatherings
 */
export async function findOptimalGatheringDays(
  circleId: string,
  daysAhead: number = 14
): Promise<
  Array<{
    date: string;
    score: number;
    membersHighEnergy: number;
    recommendation: string;
  }>
> {
  const circle = await getCircle(circleId);
  if (!circle) return [];

  const today = new Date();
  const days: Array<{
    date: string;
    score: number;
    membersHighEnergy: number;
    recommendation: string;
  }> = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Mock calculation - in real app, analyze actual member energy data
    const membersHighEnergy = Math.floor(Math.random() * circle.members.length);
    const score = (membersHighEnergy / circle.members.length) * 100;

    let recommendation: string;
    if (score >= 80) {
      recommendation = "Excellent day for gathering - most members at peak energy";
    } else if (score >= 60) {
      recommendation = "Good day for gathering - majority in good energy";
    } else if (score >= 40) {
      recommendation = "Fair day - some members may have lower energy";
    } else {
      recommendation = "Consider another day - many members at low energy";
    }

    days.push({
      date: dateStr,
      score: Math.round(score),
      membersHighEnergy,
      recommendation,
    });
  }

  // Sort by score
  days.sort((a, b) => b.score - a.score);

  return days;
}

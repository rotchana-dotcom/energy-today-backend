/**
 * Social Sharing System
 * Generate shareable content that promotes the app virally
 */

import { Share } from "react-native";
import type { EnergyReading, ConnectionReading } from "@/types";

/**
 * Share daily energy reading
 * Creates a compelling message that makes friends curious
 */
export async function shareEnergyReading(
  userEnergy: EnergyReading,
  todayEnergy: EnergyReading,
  connection: ConnectionReading,
  date: string
): Promise<void> {
  const dateStr = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const alignmentEmoji = 
    connection.alignment === "strong" ? "🟢" :
    connection.alignment === "moderate" ? "🟡" : "🔴";

  const message = `${alignmentEmoji} My Energy Today (${dateStr})

🧘 My Energy: ${userEnergy.type}
${userEnergy.description}

🌍 Today's Energy: ${todayEnergy.type}
${todayEnergy.description}

🎯 Connection: ${connection.alignment.toUpperCase()}
${connection.summary}

Want to understand your daily energy and optimize your timing?

Download Energy Today and get 7 days of Pro features FREE!
[App Store Link]`;

  try {
    await Share.share({
      message,
      title: `My Energy Reading - ${dateStr}`,
    });
  } catch (error) {
    console.error("Failed to share energy reading:", error);
  }
}

/**
 * Share a success story
 * User posts about how the app helped them
 */
export async function shareSuccessStory(
  achievement: string,
  energyType: string
): Promise<void> {
  const message = `✨ Success Story

Energy Today helped me ${achievement}!

I checked my energy and saw I was in a ${energyType} phase - perfect timing! 🎯

This app is a game-changer for making better decisions.

Get 7 days FREE: [App Store Link]`;

  try {
    await Share.share({
      message,
      title: "My Energy Today Success Story",
    });
  } catch (error) {
    console.error("Failed to share success story:", error);
  }
}

/**
 * Share calendar view with optimal days
 * Shows friends the value of timing optimization
 */
export async function shareCalendarInsight(
  activity: string,
  bestDates: string[],
  month: string
): Promise<void> {
  const datesStr = bestDates.slice(0, 3).join(", ");
  
  const message = `📅 Perfect Timing for ${activity}

Energy Today analyzed my energy patterns and found the best days in ${month}:

🟢 ${datesStr}

These are my peak energy days for this activity!

Want to optimize your timing too?
Get 7 days of Pro features FREE: [App Store Link]`;

  try {
    await Share.share({
      message,
      title: `Best Days for ${activity}`,
    });
  } catch (error) {
    console.error("Failed to share calendar insight:", error);
  }
}

/**
 * Share pattern insights
 * Shows the power of tracking over time
 */
export async function sharePatternInsight(
  pattern: string,
  insight: string
): Promise<void> {
  const message = `🔍 Energy Pattern Discovered

After tracking my energy for a while, Energy Today found this pattern:

"${pattern}"

${insight}

This kind of insight is gold for planning my week!

Try it yourself - 7 days FREE: [App Store Link]`;

  try {
    await Share.share({
      message,
      title: "My Energy Pattern",
    });
  } catch (error) {
    console.error("Failed to share pattern insight:", error);
  }
}

/**
 * Share goal achievement
 * Celebrates wins and promotes the app
 */
export async function shareGoalAchievement(
  goalTitle: string,
  completionRate: number
): Promise<void> {
  const emoji = completionRate >= 80 ? "🎉" : completionRate >= 60 ? "💪" : "📈";
  
  const message = `${emoji} Goal Update

I'm ${completionRate}% of the way to: "${goalTitle}"

Energy Today helps me track my progress and schedule activities on my best energy days.

It's like having a personal timing coach! 🎯

Get 7 days FREE: [App Store Link]`;

  try {
    await Share.share({
      message,
      title: "Goal Progress Update",
    });
  } catch (error) {
    console.error("Failed to share goal achievement:", error);
  }
}

/**
 * Get pre-filled success story templates
 * Makes it easy for users to share wins
 */
export function getSuccessStoryTemplates(): Array<{
  title: string;
  template: string;
}> {
  return [
    {
      title: "Closed a Deal",
      template: "close an important deal on my peak energy day",
    },
    {
      title: "Productive Meeting",
      template: "have my most productive meeting by scheduling it on a high-energy day",
    },
    {
      title: "Creative Breakthrough",
      template: "have a creative breakthrough during my optimal creative flow period",
    },
    {
      title: "Difficult Conversation",
      template: "navigate a difficult conversation successfully by choosing the right timing",
    },
    {
      title: "Project Launch",
      template: "launch my project on the perfect day based on energy alignment",
    },
    {
      title: "Workout Performance",
      template: "crush my workout by exercising during my peak physical energy window",
    },
    {
      title: "Study Session",
      template: "have my best study session by learning during my high-focus period",
    },
    {
      title: "Decision Making",
      template: "make a major life decision with clarity during my optimal decision-making window",
    },
  ];
}

/**
 * Share challenge invitation
 * Invites friends to join a 7-day energy challenge
 */
export async function shareChallenge(
  challengeName: string,
  startDate: string
): Promise<void> {
  const message = `🏆 Join My 7-Day Energy Challenge!

I'm starting the "${challengeName}" challenge on ${startDate}.

Let's track our energy together and see who can optimize their timing best!

Download Energy Today and join me:
[App Store Link]

We both get 7 days of Pro features FREE! 🎁`;

  try {
    await Share.share({
      message,
      title: `Join My ${challengeName} Challenge`,
    });
  } catch (error) {
    console.error("Failed to share challenge:", error);
  }
}

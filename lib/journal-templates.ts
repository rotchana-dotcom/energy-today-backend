/**
 * Smart Journal Templates
 * 
 * Pre-built reflection templates for different scenarios
 * with guided questions that correlate with energy patterns
 */

export interface JournalTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: TemplateQuestion[];
  energyCorrelation: string;
}

export interface TemplateQuestion {
  id: string;
  question: string;
  placeholder: string;
  type: "text" | "rating" | "multiline";
}

/**
 * Pre-built journal templates
 */
export const journalTemplates: JournalTemplate[] = [
  {
    id: "business_meeting",
    title: "Business Meeting",
    icon: "💼",
    description: "Reflect on important meetings and track which energy days lead to better outcomes",
    questions: [
      {
        id: "meeting_type",
        question: "What type of meeting was this?",
        placeholder: "e.g., Sales pitch, Team sync, Client negotiation",
        type: "text",
      },
      {
        id: "preparation",
        question: "How prepared did you feel going in?",
        placeholder: "Rate 1-10",
        type: "rating",
      },
      {
        id: "outcome",
        question: "What was the outcome?",
        placeholder: "Describe the results and any decisions made",
        type: "multiline",
      },
      {
        id: "energy_match",
        question: "Did your energy level match the meeting demands?",
        placeholder: "Yes/No and why",
        type: "text",
      },
      {
        id: "insights",
        question: "Key insights or action items",
        placeholder: "What did you learn? What's next?",
        type: "multiline",
      },
    ],
    energyCorrelation: "Track meeting success rates on high vs low energy days",
  },
  {
    id: "creative_work",
    title: "Creative Session",
    icon: "🎨",
    description: "Document creative work and discover your peak creativity patterns",
    questions: [
      {
        id: "project",
        question: "What were you working on?",
        placeholder: "Project name or creative task",
        type: "text",
      },
      {
        id: "flow_state",
        question: "Did you achieve flow state?",
        placeholder: "Rate 1-10",
        type: "rating",
      },
      {
        id: "output",
        question: "What did you create or accomplish?",
        placeholder: "Describe your output and progress",
        type: "multiline",
      },
      {
        id: "obstacles",
        question: "What obstacles or distractions came up?",
        placeholder: "Internal or external blocks",
        type: "text",
      },
      {
        id: "quality",
        question: "How satisfied are you with the quality?",
        placeholder: "Rate 1-10 and explain",
        type: "text",
      },
    ],
    energyCorrelation: "Identify which energy patterns support your best creative work",
  },
  {
    id: "difficult_conversation",
    title: "Difficult Conversation",
    icon: "💬",
    description: "Process challenging interactions and learn optimal timing for tough talks",
    questions: [
      {
        id: "context",
        question: "Who was the conversation with and what was it about?",
        placeholder: "Brief context",
        type: "text",
      },
      {
        id: "emotional_state",
        question: "How were you feeling before the conversation?",
        placeholder: "Your emotional state",
        type: "text",
      },
      {
        id: "approach",
        question: "What approach did you take?",
        placeholder: "Direct, diplomatic, assertive, etc.",
        type: "text",
      },
      {
        id: "resolution",
        question: "How did it resolve?",
        placeholder: "Outcome and any agreements reached",
        type: "multiline",
      },
      {
        id: "lessons",
        question: "What would you do differently next time?",
        placeholder: "Lessons learned",
        type: "multiline",
      },
    ],
    energyCorrelation: "Learn which energy days help you navigate difficult conversations better",
  },
  {
    id: "decision_making",
    title: "Important Decision",
    icon: "🤔",
    description: "Document major decisions and track decision quality across energy patterns",
    questions: [
      {
        id: "decision",
        question: "What decision did you make?",
        placeholder: "Brief description",
        type: "text",
      },
      {
        id: "options",
        question: "What options did you consider?",
        placeholder: "List the alternatives you weighed",
        type: "multiline",
      },
      {
        id: "factors",
        question: "What factors influenced your choice?",
        placeholder: "Data, intuition, advice, constraints",
        type: "multiline",
      },
      {
        id: "confidence",
        question: "How confident are you in this decision?",
        placeholder: "Rate 1-10",
        type: "rating",
      },
      {
        id: "reasoning",
        question: "Why did you choose this option?",
        placeholder: "Your reasoning",
        type: "multiline",
      },
    ],
    energyCorrelation: "Discover if your best decisions happen on specific energy days",
  },
  {
    id: "product_launch",
    title: "Product Launch / Event",
    icon: "🚀",
    description: "Track launches and events to optimize future timing",
    questions: [
      {
        id: "what",
        question: "What did you launch or organize?",
        placeholder: "Product, feature, event name",
        type: "text",
      },
      {
        id: "preparation",
        question: "How long did you prepare?",
        placeholder: "Timeline and readiness level",
        type: "text",
      },
      {
        id: "execution",
        question: "How did the launch/event go?",
        placeholder: "Describe what happened",
        type: "multiline",
      },
      {
        id: "response",
        question: "What was the response?",
        placeholder: "Customer/audience reaction, metrics",
        type: "multiline",
      },
      {
        id: "next_time",
        question: "What would you do differently?",
        placeholder: "Improvements for next time",
        type: "multiline",
      },
    ],
    energyCorrelation: "Optimize launch timing based on historical energy patterns",
  },
  {
    id: "learning_session",
    title: "Learning / Study Session",
    icon: "📚",
    description: "Track learning effectiveness across different energy levels",
    questions: [
      {
        id: "topic",
        question: "What were you learning?",
        placeholder: "Subject or skill",
        type: "text",
      },
      {
        id: "duration",
        question: "How long did you study?",
        placeholder: "Time spent",
        type: "text",
      },
      {
        id: "comprehension",
        question: "How well did you understand the material?",
        placeholder: "Rate 1-10",
        type: "rating",
      },
      {
        id: "retention",
        question: "How much do you think you'll retain?",
        placeholder: "Rate 1-10",
        type: "rating",
      },
      {
        id: "application",
        question: "How will you apply what you learned?",
        placeholder: "Practical next steps",
        type: "multiline",
      },
    ],
    energyCorrelation: "Find your optimal learning times based on energy patterns",
  },
  {
    id: "general",
    title: "General Reflection",
    icon: "✍️",
    description: "Open-ended reflection for any situation",
    questions: [
      {
        id: "summary",
        question: "What happened today?",
        placeholder: "Brief summary of your day",
        type: "multiline",
      },
      {
        id: "wins",
        question: "What went well?",
        placeholder: "Wins and positive moments",
        type: "multiline",
      },
      {
        id: "challenges",
        question: "What was challenging?",
        placeholder: "Obstacles or difficulties",
        type: "multiline",
      },
      {
        id: "mood",
        question: "How are you feeling?",
        placeholder: "Your current mood and energy",
        type: "text",
      },
      {
        id: "gratitude",
        question: "What are you grateful for?",
        placeholder: "3 things you're thankful for today",
        type: "multiline",
      },
    ],
    energyCorrelation: "General pattern recognition across all life areas",
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): JournalTemplate | undefined {
  return journalTemplates.find((t) => t.id === id);
}

/**
 * Get all template titles for selection
 */
export function getTemplateOptions(): Array<{ id: string; title: string; icon: string }> {
  return journalTemplates.map((t) => ({ id: t.id, title: t.title, icon: t.icon }));
}

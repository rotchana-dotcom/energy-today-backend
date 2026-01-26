import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  tips?: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

export default function GuideScreen() {
  const router = useRouter();
  const colors = useColors();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const guideSections: GuideSection[] = [
    {
      id: "today",
      title: "Understanding Your Today Page",
      icon: "🌟",
      content: "The Today page shows three key energy readings:\n\n• Your Energy: Your personal energy based on your birth data, current life cycle, and planetary influences\n\n• Today's Energy: Environmental energy from lunar cycles, planetary positions, and universal rhythms\n\n• The Connection: How well your personal energy aligns with today's environmental energy",
      tips: [
        "Green = Strong alignment (ideal for important activities)",
        "Yellow = Moderate alignment (good for routine work)",
        "Red = Challenging alignment (focus on rest and preparation)",
      ],
    },
    {
      id: "calendar",
      title: "Using the Calendar",
      icon: "📅",
      content: "The Calendar helps you plan activities based on energy patterns:\n\n• Color dots show energy alignment for each day\n• Tap any date to see detailed energy breakdown\n• Use it to schedule important meetings, launches, or decisions on high-energy days\n• Plan rest and reflection on low-energy days",
      tips: [
        "Schedule product launches on green days",
        "Plan strategic meetings when alignment is strong",
        "Use yellow days for routine tasks and preparation",
        "Reserve red days for self-care and planning",
      ],
    },
    {
      id: "journal",
      title: "Journaling for Insights",
      icon: "📝",
      content: "Your journal helps you track patterns and validate energy readings:\n\n• Record daily notes about your mood, activities, and outcomes\n• Add voice notes for quick capture\n• Over time, you'll see correlations between energy readings and your actual experiences\n\n Pro users get Pattern Insights that analyze your journal against energy data to reveal hidden patterns.",
      tips: [
        "Journal consistently for best pattern recognition",
        "Note how you felt during important meetings or decisions",
        "Track which activities succeed on different energy days",
        "Use voice notes when you're busy",
      ],
    },
    {
      id: "energy",
      title: "How Energy Readings Work",
      icon: "⚡",
      content: "Energy Today analyzes multiple timing factors to give you practical insights:\n\n• Your personal energy patterns based on your birth date\n• Daily environmental energy from natural cycles\n• How well your energy aligns with today's conditions\n• Optimal timing for different types of activities\n\nThe app combines thousands of years of timing wisdom into simple, actionable recommendations for modern business and life.",
      tips: [
        "You don't need to understand how it works—just use the insights",
        "The app does all the complex calculations for you",
        "Focus on the practical recommendations and test them yourself",
      ],
    },
    {
      id: "profile",
      title: "Personal Energy Profile",
      icon: "🔢",
      content: "Your Personal Energy Profile reveals:\n\n• Birth Day Analysis: Your natural strengths, characteristics, and optimal colors\n• Life Pattern: Your core talents, career paths, and relationship style\n• Important Patterns: Recurring themes and life lessons to focus on\n\nAccess this from Settings → Insights → Personal Energy Profile",
      tips: [
        "Your life pattern doesn't change—it's your core blueprint",
        "Key pattern numbers show areas requiring extra attention",
        "Use your lucky numbers and colors for important events",
      ],
    },
    {
      id: "forecast",
      title: "Energy Forecast",
      icon: "🔮",
      content: "The Energy Forecast shows:\n\n• 7-day or 30-day energy predictions\n• Best days for important activities\n• Challenging days to avoid major decisions\n• Significant dates (new moons, full moons, energy shifts)\n• Overall trend (rising, stable, or declining)\n\nAccess this from Settings → Insights → Energy Forecast",
      tips: [
        "Use 7-day forecast for weekly planning",
        "Use 30-day forecast for strategic planning",
        "Block your calendar based on peak energy days",
        "Plan vacations or rest periods during low energy phases",
      ],
    },
    {
      id: "pro",
      title: "Free vs Pro Features",
      icon: "⭐",
      content: "Free Tier:\n• Daily energy readings (Today page)\n• Calendar with color-coded days\n• Personal journal with voice notes\n• Basic insights\n\nPro Tier ($9.99/month):\n• Deep dive into energy calculations\n• Pattern Insights from your journal\n• Goal tracking with energy correlation\n• Habit tracking and analysis\n• Business metrics dashboard\n• Team energy sync\n• Energy coaching\n• Advanced forecasting\n• PDF exports\n• Priority support",
      tips: [
        "Start with free tier to see if the system works for you",
        "Upgrade to Pro after 2-4 weeks of consistent use",
        "Pro features unlock after you have enough data",
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: "Is this based on astrology or religion?",
      answer: "Energy Today uses timing patterns that have been observed for thousands of years across different cultures. We present everything in practical, business-friendly language with no religious content. Think of it as a timing optimization tool for better decision-making.",
    },
    {
      question: "How accurate are the energy readings?",
      answer: "Energy readings are based on established systems used for thousands of years. Accuracy improves as you use the app and journal consistently—you'll start to see patterns between readings and your actual experiences. Think of it as a timing optimization tool, not fortune-telling.",
    },
    {
      question: "Do I need to believe in anything for this to work?",
      answer: "No. Many successful business people use timing optimization without any spiritual beliefs. Try it for 30 days, journal your experiences, and see if you notice patterns. The proof is in your own results.",
    },
    {
      question: "Why do some days show low energy?",
      answer: "Low energy days aren't 'bad'—they're opportunities for different activities. Use them for planning, reflection, learning, and self-care. Trying to push through low energy days often leads to poor decisions or burnout.",
    },
    {
      question: "Can I change my energy reading?",
      answer: "Your personal energy is based on your birth data and current life cycles, which don't change. However, you can work WITH your energy by choosing appropriate activities for each day. The app helps you optimize timing, not change who you are.",
    },
    {
      question: "How often should I check the app?",
      answer: "Check the Today page each morning to plan your day. Review the Calendar when scheduling important activities. Journal in the evening to track patterns. That's it—no need to obsess over it.",
    },
    {
      question: "Is my data private?",
      answer: "Yes. All your data (profile, journal entries, notes) is stored locally on your device. We don't upload your personal information to any server unless you explicitly enable cloud sync (Pro feature, optional).",
    },
    {
      question: "What if I don't know my exact birth time?",
      answer: "The app primarily uses your birth date and location. Birth time is helpful for deeper astrological insights but not required for the core energy calculations.",
    },
    {
      question: "Can I use this for my team?",
      answer: "Yes! Pro users can use Team Energy Sync to compare calendars with colleagues and find optimal meeting times when everyone's energy is aligned.",
    },
    {
      question: "How do I interpret the lunar phases?",
      answer: "New Moon = Start new projects\nWaxing Moon = Build and grow\nFull Moon = Complete and celebrate\nWaning Moon = Release and reflect\n\nThe app automatically factors lunar phases into your daily readings.",
    },
  ];

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.push('/(tabs)/')} className="active:opacity-70">
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">User Guide</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {/* Welcome */}
        <View className="bg-primary/10 rounded-2xl p-6 mb-6">
          <Text className="text-2xl font-bold text-foreground mb-3">Welcome to Energy Today! 👋</Text>
          <Text className="text-base text-muted leading-relaxed">
            This app helps you optimize timing for business decisions, meetings, launches, and personal activities based on energy alignment. Just practical insights for better results.
          </Text>
        </View>

        {/* Guide Sections */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">How to Use the App</Text>
          {guideSections.map((section) => (
            <View key={section.id} className="bg-surface rounded-2xl mb-3 border border-border overflow-hidden">
              <TouchableOpacity
                onPress={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="flex-row items-center justify-between p-4 active:opacity-70"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Text style={{ fontSize: 24 }}>{section.icon}</Text>
                  <Text className="text-base font-semibold text-foreground flex-1">{section.title}</Text>
                </View>
                <Text className="text-xl text-muted">{expandedSection === section.id ? "−" : "+"}</Text>
              </TouchableOpacity>
              
              {expandedSection === section.id && (
                <View className="px-4 pb-4">
                  <Text className="text-sm text-muted leading-relaxed mb-3">{section.content}</Text>
                  {section.tips && section.tips.length > 0 && (
                    <View className="bg-primary/5 rounded-lg p-3">
                      <Text className="text-sm font-semibold text-foreground mb-2">💡 Tips:</Text>
                      {section.tips.map((tip, idx) => (
                        <Text key={idx} className="text-sm text-muted mb-1">• {tip}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</Text>
          {faqs.map((faq, idx) => (
            <View key={idx} className="bg-surface rounded-2xl mb-3 border border-border overflow-hidden">
              <TouchableOpacity
                onPress={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                className="flex-row items-center justify-between p-4 active:opacity-70"
              >
                <Text className="text-base font-semibold text-foreground flex-1 pr-3">{faq.question}</Text>
                <Text className="text-xl text-muted">{expandedFAQ === idx ? "−" : "+"}</Text>
              </TouchableOpacity>
              
              {expandedFAQ === idx && (
                <View className="px-4 pb-4">
                  <Text className="text-sm text-muted leading-relaxed">{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Getting Started */}
        <View className="bg-success/10 rounded-2xl p-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Getting Started</Text>
          <View className="gap-2">
            <Text className="text-sm text-muted">1. Check your Today page each morning</Text>
            <Text className="text-sm text-muted">2. Use the Calendar to plan important activities</Text>
            <Text className="text-sm text-muted">3. Journal daily to track patterns</Text>
            <Text className="text-sm text-muted">4. After 2-4 weeks, review your Pattern Insights (Pro)</Text>
            <Text className="text-sm text-muted">5. Adjust your scheduling based on what works</Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}

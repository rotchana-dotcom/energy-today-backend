/**
 * Customer Support Chat Router
 * Real-time support with AI assistance
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const sendMessageSchema = z.object({
  conversationId: z.string(),
  message: z.string(),
  userContext: z.object({
    userId: z.string().optional(),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
    subscriptionTier: z.enum(["free", "pro", "family"]).optional(),
    accountAge: z.number().optional(), // days
    issueCategory: z.string().optional(),
  }).optional(),
});

const analyzeIssueSchema = z.object({
  description: z.string(),
  category: z.string().optional(),
});

export const supportChatRouter = router({
  /**
   * Send message and get AI response
   */
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input }) => {
      const { conversationId, message, userContext } = input;
      
      // Build context for AI
      let systemPrompt = `You are a helpful customer support agent for Energy Today, an AI-powered wellness app that helps users track and optimize their daily energy levels.

Your role:
- Provide friendly, professional, and helpful support
- Answer questions about features, troubleshooting, and best practices
- Guide users to relevant help articles when appropriate
- Escalate to human support when needed (technical issues, billing disputes, account problems)

Key features of Energy Today:
- Energy tracking with AI-powered insights
- Sleep tracking and optimization
- Habit tracking with energy correlation
- Nutrition and meal logging
- Social features (Energy Circles, challenges)
- Integration with Apple Health and Google Fit
- Premium tiers: Free, Pro ($9.99/month), Family ($19.99/month)

Guidelines:
- Be concise but thorough
- Use everyday language (not technical jargon)
- Provide step-by-step instructions when needed
- Always be empathetic and understanding
- If you don't know something, admit it and offer to escalate
- Never make promises about features or timelines`;

      if (userContext) {
        systemPrompt += `\n\nUser context:`;
        if (userContext.userName) systemPrompt += `\n- Name: ${userContext.userName}`;
        if (userContext.userEmail) systemPrompt += `\n- Email: ${userContext.userEmail}`;
        if (userContext.subscriptionTier) systemPrompt += `\n- Subscription: ${userContext.subscriptionTier}`;
        if (userContext.accountAge) systemPrompt += `\n- Account age: ${userContext.accountAge} days`;
        if (userContext.issueCategory) systemPrompt += `\n- Issue category: ${userContext.issueCategory}`;
      }
      
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });
      
      const aiMessage = response.choices[0].message.content as string;
      
      // Analyze if escalation is needed
      const needsEscalation = 
        message.toLowerCase().includes("refund") ||
        message.toLowerCase().includes("billing issue") ||
        message.toLowerCase().includes("account locked") ||
        message.toLowerCase().includes("data lost") ||
        message.toLowerCase().includes("speak to human") ||
        message.toLowerCase().includes("talk to person");
      
      // Suggest relevant help articles
      const suggestedArticles = getSuggestedArticles(message);
      
      return {
        conversationId,
        response: aiMessage,
        needsEscalation,
        suggestedArticles,
        timestamp: new Date().toISOString(),
      };
    }),
  
  /**
   * Analyze issue and categorize
   */
  analyzeIssue: publicProcedure
    .input(analyzeIssueSchema)
    .mutation(async ({ input }) => {
      const { description } = input;
      
      const systemPrompt = `You are an AI that categorizes customer support issues for Energy Today.

Analyze the user's issue description and return:
1. Category (one of: account, billing, technical, features, data, other)
2. Severity (low, medium, high, critical)
3. Suggested solution (brief, 1-2 sentences)
4. Needs human support (true/false)

Return your response as JSON with these exact keys: category, severity, suggestedSolution, needsHumanSupport`;
      
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Issue: ${description}` },
        ],
      });
      
      try {
        // Extract JSON from response
        const content = response.choices[0].message.content as string;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            category: analysis.category || "other",
            severity: analysis.severity || "medium",
            suggestedSolution: analysis.suggestedSolution || "",
            needsHumanSupport: analysis.needsHumanSupport || false,
          };
        }
      } catch (error) {
        // Fallback on parse error
      }
      
      // Fallback
      return {
        category: "other",
        severity: "medium",
        suggestedSolution: "Our support team will review your issue and get back to you shortly.",
        needsHumanSupport: true,
      };
    }),
  
  /**
   * Get suggested responses for common questions
   */
  getSuggestedResponses: publicProcedure
    .query(() => {
      return [
        {
          id: "how_to_track",
          question: "How do I track my energy?",
          response: "To track your energy:\n1. Go to the Today screen\n2. Tap the energy meter\n3. Select your current energy level (1-10)\n4. Optionally add notes\n5. Tap 'Save'\n\nLog 3-5 times per day for best results!",
        },
        {
          id: "sleep_tracking",
          question: "How does sleep tracking work?",
          response: "Sleep tracking helps you understand how sleep affects your energy:\n1. Go to the Sleep tab\n2. Tap 'Log Sleep'\n3. Enter bedtime and wake time\n4. Rate sleep quality (1-5 stars)\n5. Optionally add dream notes\n\nAfter 2 weeks, you'll see correlations with next-day energy!",
        },
        {
          id: "premium_features",
          question: "What's included in Premium?",
          response: "Premium includes:\n• AI Coaching Chatbot\n• Unlimited history (vs 30 days free)\n• Advanced analytics and reports\n• Priority support\n• All future features\n\nPro: $9.99/month (1 user)\nFamily: $19.99/month (up to 5 users)\n\n7-day free trial, cancel anytime!",
        },
        {
          id: "data_privacy",
          question: "Is my data private?",
          response: "Yes! Your data is:\n• Encrypted in transit and at rest\n• Never sold to third parties\n• Stored securely on our servers\n• Exportable anytime (Settings > Export Data)\n• Deletable anytime (Settings > Delete Account)\n\nYou control what you share with Energy Circles or challenges.",
        },
        {
          id: "app_slow",
          question: "The app is slow/crashing",
          response: "Try these steps:\n1. Force close and restart the app\n2. Update to the latest version (App Store/Play Store)\n3. Restart your device\n4. Clear app cache (Settings > Storage)\n5. Reinstall the app (data is backed up)\n\nIf issues persist, please share your device model and OS version so we can help!",
        },
      ];
    }),
});

/**
 * Get suggested help articles based on message content
 */
function getSuggestedArticles(message: string): Array<{ id: string; title: string }> {
  const lowerMessage = message.toLowerCase();
  const articles: Array<{ id: string; title: string }> = [];
  
  if (lowerMessage.includes("track") || lowerMessage.includes("log")) {
    articles.push({
      id: "article_1",
      title: "Complete Guide to Energy Tracking",
    });
  }
  
  if (lowerMessage.includes("sleep")) {
    articles.push({
      id: "article_3",
      title: "Sleep Optimization for Better Energy",
    });
  }
  
  if (lowerMessage.includes("pattern") || lowerMessage.includes("insight")) {
    articles.push({
      id: "article_2",
      title: "Understanding Your Energy Patterns",
    });
  }
  
  if (lowerMessage.includes("premium") || lowerMessage.includes("subscription") || lowerMessage.includes("upgrade")) {
    articles.push({
      id: "faq_14",
      title: "How do I upgrade to Premium?",
    });
  }
  
  if (lowerMessage.includes("cancel")) {
    articles.push({
      id: "faq_15",
      title: "Can I cancel my subscription?",
    });
  }
  
  if (lowerMessage.includes("data") || lowerMessage.includes("privacy")) {
    articles.push({
      id: "faq_19",
      title: "Is my data private?",
    });
  }
  
  if (lowerMessage.includes("slow") || lowerMessage.includes("crash") || lowerMessage.includes("bug")) {
    articles.push({
      id: "faq_17",
      title: "The app is slow or crashing. What should I do?",
    });
  }
  
  return articles.slice(0, 3); // Max 3 suggestions
}

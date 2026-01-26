/**
 * Help Center & FAQ System
 * Searchable knowledge base with articles, FAQs, and troubleshooting guides
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "help_center";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  views: number;
  relatedArticles?: string[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  estimatedReadTime: number; // minutes
  relatedArticles?: string[];
}

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  faqCount: number;
}

export interface SearchResult {
  type: "faq" | "article";
  id: string;
  title: string;
  snippet: string;
  relevance: number;
}

export interface HelpCenterStats {
  totalArticles: number;
  totalFAQs: number;
  totalViews: number;
  mostViewedArticles: HelpArticle[];
  mostHelpfulFAQs: FAQItem[];
  recentSearches: string[];
}

/**
 * Get all help categories
 */
export function getHelpCategories(): HelpCategory[] {
  return [
    {
      id: "getting_started",
      name: "Getting Started",
      description: "Learn the basics of Energy Today",
      icon: "rocket",
      articleCount: 8,
      faqCount: 12,
    },
    {
      id: "energy_tracking",
      name: "Energy Tracking",
      description: "How to track and understand your energy",
      icon: "activity",
      articleCount: 6,
      faqCount: 10,
    },
    {
      id: "features",
      name: "Features",
      description: "Explore all Energy Today features",
      icon: "star",
      articleCount: 15,
      faqCount: 20,
    },
    {
      id: "ai_insights",
      name: "AI & Insights",
      description: "Understanding AI recommendations",
      icon: "brain",
      articleCount: 5,
      faqCount: 8,
    },
    {
      id: "account_billing",
      name: "Account & Billing",
      description: "Manage your account and subscription",
      icon: "credit-card",
      articleCount: 7,
      faqCount: 15,
    },
    {
      id: "troubleshooting",
      name: "Troubleshooting",
      description: "Fix common issues",
      icon: "tool",
      articleCount: 10,
      faqCount: 18,
    },
    {
      id: "privacy_security",
      name: "Privacy & Security",
      description: "Your data protection and privacy",
      icon: "shield",
      articleCount: 4,
      faqCount: 6,
    },
  ];
}

/**
 * Get all FAQ items
 */
export function getAllFAQs(): FAQItem[] {
  return [
    // Getting Started
    {
      id: "faq_1",
      question: "What is Energy Today?",
      answer: "Energy Today is an AI-powered wellness app that helps you track, analyze, and optimize your daily energy levels. By combining energy tracking with sleep, habits, nutrition, and activity data, we provide personalized insights for peak performance and well-being.",
      category: "getting_started",
      tags: ["basics", "introduction"],
      helpful: 145,
      notHelpful: 3,
      views: 2340,
    },
    {
      id: "faq_2",
      question: "How do I get started?",
      answer: "1. Complete the onboarding tutorial to learn the basics\n2. Log your first energy reading on the Today screen\n3. Track your sleep, habits, and meals for a few days\n4. Check your Insights tab to see AI-powered recommendations\n5. Explore the Calendar to see your energy forecast",
      category: "getting_started",
      tags: ["onboarding", "tutorial", "first steps"],
      helpful: 128,
      notHelpful: 5,
      views: 1890,
    },
    {
      id: "faq_3",
      question: "Is Energy Today free?",
      answer: "Yes! Energy Today offers a free tier with core features including energy tracking, basic insights, and 30 days of history. Premium plans ($9.99/month or $19.99/month for Family) unlock advanced features like AI coaching, unlimited history, and advanced analytics.",
      category: "getting_started",
      tags: ["pricing", "free", "premium"],
      helpful: 156,
      notHelpful: 8,
      views: 3120,
    },
    
    // Energy Tracking
    {
      id: "faq_4",
      question: "How often should I log my energy?",
      answer: "We recommend logging your energy 3-5 times per day: morning (after waking), midday, afternoon, evening, and before bed. Consistency is more important than frequency - even 2-3 logs per day will give you valuable insights over time.",
      category: "energy_tracking",
      tags: ["frequency", "logging", "best practices"],
      helpful: 98,
      notHelpful: 12,
      views: 1560,
    },
    {
      id: "faq_5",
      question: "What do the energy levels mean?",
      answer: "Energy levels range from 1-10:\n• 1-3: Low energy (tired, drained, need rest)\n• 4-6: Moderate energy (functional but not optimal)\n• 7-8: High energy (productive, focused, energized)\n• 9-10: Peak energy (exceptional performance, flow state)\n\nLog how you actually feel, not how you think you should feel.",
      category: "energy_tracking",
      tags: ["energy levels", "scale", "interpretation"],
      helpful: 187,
      notHelpful: 4,
      views: 2890,
    },
    {
      id: "faq_6",
      question: "Can I edit or delete past energy logs?",
      answer: "Yes! Tap on any energy log in your history to edit or delete it. This is useful if you logged incorrectly or want to add notes. However, try to log accurately the first time for the most reliable insights.",
      category: "energy_tracking",
      tags: ["editing", "deleting", "history"],
      helpful: 76,
      notHelpful: 2,
      views: 890,
    },
    
    // Features
    {
      id: "faq_7",
      question: "How does sleep tracking work?",
      answer: "Log your sleep times (when you went to bed and woke up) and rate your sleep quality (1-5 stars). Optionally add dream journal entries. Energy Today correlates your sleep data with next-day energy to identify your optimal sleep duration and patterns.",
      category: "features",
      tags: ["sleep", "tracking", "how it works"],
      helpful: 112,
      notHelpful: 6,
      views: 1670,
    },
    {
      id: "faq_8",
      question: "What are Energy Circles?",
      answer: "Energy Circles are private groups where you can share energy patterns with friends or family. Create a circle, invite members with a code, and see everyone's energy trends. The app suggests optimal times for group activities when everyone's energy aligns.",
      category: "features",
      tags: ["social", "energy circles", "groups"],
      helpful: 89,
      notHelpful: 7,
      views: 1230,
    },
    {
      id: "faq_9",
      question: "How do challenges work?",
      answer: "Challenges are group competitions to build consistency and stay motivated. Join existing challenges or create your own with custom goals. Compete on the leaderboard, track progress together, and earn badges for completion. Both you and friends get bonus days when someone joins your challenge.",
      category: "features",
      tags: ["challenges", "social", "gamification"],
      helpful: 94,
      notHelpful: 5,
      views: 1450,
    },
    {
      id: "faq_10",
      question: "Can I integrate with Apple Health or Google Fit?",
      answer: "Yes! Energy Today integrates with Apple Health (iOS) and Google Fit (Android) to sync sleep, steps, heart rate, and workout data. Go to Settings > Integrations to connect. This provides richer insights by correlating biometric data with your energy patterns.",
      category: "features",
      tags: ["integrations", "apple health", "google fit"],
      helpful: 134,
      notHelpful: 9,
      views: 2100,
    },
    
    // AI & Insights
    {
      id: "faq_11",
      question: "How does the AI work?",
      answer: "Our AI analyzes YOUR unique patterns across energy, sleep, habits, nutrition, weather, and more. It identifies correlations (e.g., \"You have 30% more energy after 8+ hours of sleep\") and provides personalized recommendations. The AI learns continuously as you log more data.",
      category: "ai_insights",
      tags: ["ai", "how it works", "machine learning"],
      helpful: 167,
      notHelpful: 11,
      views: 2450,
    },
    {
      id: "faq_12",
      question: "What are confidence scores?",
      answer: "Each AI insight has a confidence score (60-95%) indicating prediction reliability. Higher scores mean the AI has more data and stronger patterns to base its recommendation on. Scores improve over time as you log more consistently.",
      category: "ai_insights",
      tags: ["confidence", "accuracy", "reliability"],
      helpful: 92,
      notHelpful: 8,
      views: 1340,
    },
    {
      id: "faq_13",
      question: "Why do I need to log for 7-14 days before getting insights?",
      answer: "The AI needs enough data to identify YOUR unique patterns. Everyone's energy is different, so we can't use generic advice. After 7-14 days of consistent logging, the AI has enough data to provide personalized, accurate recommendations.",
      category: "ai_insights",
      tags: ["data", "timeline", "accuracy"],
      helpful: 78,
      notHelpful: 15,
      views: 1120,
    },
    
    // Account & Billing
    {
      id: "faq_14",
      question: "How do I upgrade to Premium?",
      answer: "Tap the Premium badge anywhere in the app, or go to Settings > Subscription. Choose between Pro ($9.99/month) or Family ($19.99/month). All plans include a 7-day free trial. Cancel anytime.",
      category: "account_billing",
      tags: ["premium", "upgrade", "subscription"],
      helpful: 145,
      notHelpful: 4,
      views: 2890,
    },
    {
      id: "faq_15",
      question: "Can I cancel my subscription?",
      answer: "Yes, cancel anytime. Go to Settings > Subscription > Manage Subscription. You'll retain Premium access until the end of your billing period. Your data is never deleted - you can resubscribe anytime to regain full access.",
      category: "account_billing",
      tags: ["cancel", "subscription", "billing"],
      helpful: 98,
      notHelpful: 6,
      views: 1560,
    },
    {
      id: "faq_16",
      question: "What's the difference between Pro and Family plans?",
      answer: "Pro ($9.99/month): 1 user, all premium features\nFamily ($19.99/month): Up to 5 users, all premium features, family dashboard, shared challenges\n\nBoth include: AI coaching, unlimited history, advanced analytics, priority support, and all future features.",
      category: "account_billing",
      tags: ["pricing", "plans", "comparison"],
      helpful: 123,
      notHelpful: 7,
      views: 2340,
    },
    
    // Troubleshooting
    {
      id: "faq_17",
      question: "The app is slow or crashing. What should I do?",
      answer: "1. Force close and restart the app\n2. Check for app updates in the App Store/Play Store\n3. Restart your device\n4. Clear app cache (Settings > Storage)\n5. Reinstall the app (your data is backed up)\n\nIf issues persist, contact support with your device model and OS version.",
      category: "troubleshooting",
      tags: ["crash", "slow", "performance"],
      helpful: 67,
      notHelpful: 12,
      views: 890,
    },
    {
      id: "faq_18",
      question: "My data isn't syncing. Help!",
      answer: "1. Check your internet connection\n2. Go to Settings > Data & Sync > Sync Now\n3. Ensure you're logged in (Settings > Account)\n4. Check if sync is enabled (Settings > Data & Sync)\n\nData syncs automatically when online. Offline changes are queued and sync when connection is restored.",
      category: "troubleshooting",
      tags: ["sync", "data", "offline"],
      helpful: 54,
      notHelpful: 8,
      views: 670,
    },
    
    // Privacy & Security
    {
      id: "faq_19",
      question: "Is my data private?",
      answer: "Yes! Your data is encrypted in transit and at rest. We never sell your data to third parties. You control what data is shared (if any) with Energy Circles or challenges. You can export or delete all your data anytime from Settings > Privacy.",
      category: "privacy_security",
      tags: ["privacy", "data", "security"],
      helpful: 189,
      notHelpful: 3,
      views: 3450,
    },
    {
      id: "faq_20",
      question: "Can I export my data?",
      answer: "Yes! Go to Settings > Data & Privacy > Export Data. Choose CSV or JSON format and select what to include (energy logs, sleep, habits, etc.). You'll receive a download link via email within 24 hours.",
      category: "privacy_security",
      tags: ["export", "data", "backup"],
      helpful: 76,
      notHelpful: 2,
      views: 1120,
    },
  ];
}

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: string): FAQItem[] {
  return getAllFAQs().filter(faq => faq.category === category);
}

/**
 * Get all help articles
 */
export function getAllArticles(): HelpArticle[] {
  return [
    {
      id: "article_1",
      title: "Complete Guide to Energy Tracking",
      content: `# Complete Guide to Energy Tracking

Energy tracking is the foundation of Energy Today. This guide will teach you everything you need to know to get the most accurate insights.

## Why Track Energy?

Your energy levels fluctuate throughout the day based on sleep, nutrition, stress, activity, and many other factors. By tracking consistently, you'll discover YOUR unique patterns and learn how to optimize your schedule.

## When to Log

We recommend logging 3-5 times per day:
- **Morning** (within 30 min of waking): Baseline energy
- **Midday** (11am-1pm): Pre-lunch energy
- **Afternoon** (2-4pm): Post-lunch dip or sustained energy?
- **Evening** (6-8pm): End of workday energy
- **Night** (before bed): Winding down energy

## How to Rate Your Energy

Use the 1-10 scale honestly:
- **1-3**: Exhausted, can barely function, need rest immediately
- **4-6**: Functional but not optimal, getting through the day
- **7-8**: Productive, focused, feeling good
- **9-10**: Peak performance, in flow, exceptional energy

Don't overthink it - your first instinct is usually correct.

## Adding Context

Always add notes when your energy is unusually high or low:
- "Slept poorly last night"
- "Had 3 coffees"
- "Great workout this morning"
- "Stressful meeting"

These notes help the AI understand what affects your energy.

## Consistency is Key

The AI needs 7-14 days of consistent logging to identify patterns. Even if you miss a day, keep going. The more data you provide, the better your insights become.

## Common Mistakes

❌ Logging how you think you should feel
❌ Only logging when energy is low
❌ Logging at random times each day
❌ Not adding context notes

✅ Log honestly
✅ Log both highs and lows
✅ Log at consistent times
✅ Add notes for unusual readings

Start tracking today and discover your unique energy patterns!`,
      category: "energy_tracking",
      tags: ["guide", "tracking", "best practices"],
      author: "Energy Today Team",
      publishedAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      views: 4560,
      helpful: 234,
      notHelpful: 12,
      estimatedReadTime: 5,
      relatedArticles: ["article_2", "article_3"],
    },
    {
      id: "article_2",
      title: "Understanding Your Energy Patterns",
      content: `# Understanding Your Energy Patterns

After tracking for 2+ weeks, you'll start seeing patterns emerge. This guide helps you interpret them.

## Common Energy Patterns

### The Morning Person
- Peak energy: 6am-11am
- Dip: 2-4pm
- Strategy: Schedule important work in the morning, routine tasks in afternoon

### The Night Owl
- Peak energy: 8pm-12am
- Dip: 6am-10am
- Strategy: Protect your evening hours, don't fight your natural rhythm

### The Steady Eddie
- Consistent energy throughout the day
- Strategy: Leverage your consistency, watch for subtle dips

## Weekly Patterns

Many people have weekly energy cycles:
- **Monday**: Often lower (weekend recovery)
- **Tuesday-Thursday**: Peak productivity days
- **Friday**: Energy drops as week ends
- **Weekend**: Recovery mode

## Monthly Patterns

Women may notice energy correlates with menstrual cycle:
- **Follicular phase**: Rising energy
- **Ovulation**: Peak energy
- **Luteal phase**: Declining energy
- **Menstruation**: Lowest energy

Track your cycle to plan accordingly.

## Seasonal Patterns

Energy often varies by season:
- **Spring/Summer**: Higher energy (more daylight)
- **Fall/Winter**: Lower energy (less daylight)

Consider vitamin D supplementation in winter.

## Using Patterns to Optimize

Once you know your patterns:
1. Schedule important work during peak energy times
2. Protect your high-energy periods (no meetings!)
3. Batch low-energy tasks (email, admin) during dips
4. Plan recovery time after demanding periods
5. Don't fight your natural rhythm

Your patterns are unique - trust your data!`,
      category: "energy_tracking",
      tags: ["patterns", "optimization", "insights"],
      author: "Energy Today Team",
      publishedAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      views: 3890,
      helpful: 198,
      notHelpful: 15,
      estimatedReadTime: 4,
      relatedArticles: ["article_1", "article_3"],
    },
    {
      id: "article_3",
      title: "Sleep Optimization for Better Energy",
      content: `# Sleep Optimization for Better Energy

Sleep is the #1 factor affecting your energy. This guide will help you optimize your sleep for peak performance.

## Track Your Sleep

Log your sleep consistently:
- Bedtime
- Wake time
- Sleep quality (1-5 stars)
- How you feel next day

After 2 weeks, you'll see your optimal sleep duration.

## Find Your Sleep Sweet Spot

Most people need 7-9 hours, but YOUR optimal duration might be different. The AI will identify it based on next-day energy correlation.

Common findings:
- "You have 35% more energy after 8+ hours of sleep"
- "Your energy is highest when you sleep 7.5-8 hours"
- "Sleep quality matters more than duration for you"

## Improve Sleep Quality

**Before bed:**
- No screens 1 hour before bed
- Keep room cool (65-68°F)
- Use blackout curtains
- White noise if needed

**During day:**
- Get morning sunlight (sets circadian rhythm)
- Exercise (but not within 3 hours of bed)
- Limit caffeine after 2pm
- Manage stress

## Consistency Matters

Go to bed and wake up at the same time every day (yes, even weekends). Your body thrives on routine.

## Track Sleep Experiments

Try different approaches and track results:
- Earlier bedtime
- Later wake time
- Meditation before bed
- Magnesium supplement
- Different room temperature

Let the data guide you!`,
      category: "features",
      tags: ["sleep", "optimization", "guide"],
      author: "Energy Today Team",
      publishedAt: new Date("2024-01-25"),
      updatedAt: new Date("2024-01-25"),
      views: 5670,
      helpful: 289,
      notHelpful: 18,
      estimatedReadTime: 4,
      relatedArticles: ["article_1", "article_4"],
    },
  ];
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): HelpArticle[] {
  return getAllArticles().filter(article => article.category === category);
}

/**
 * Search FAQs and articles
 */
export function searchHelpContent(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search FAQs
  getAllFAQs().forEach(faq => {
    const questionMatch = faq.question.toLowerCase().includes(lowerQuery);
    const answerMatch = faq.answer.toLowerCase().includes(lowerQuery);
    const tagMatch = faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    if (questionMatch || answerMatch || tagMatch) {
      const relevance = questionMatch ? 100 : (tagMatch ? 80 : 60);
      results.push({
        type: "faq",
        id: faq.id,
        title: faq.question,
        snippet: faq.answer.substring(0, 150) + "...",
        relevance,
      });
    }
  });
  
  // Search articles
  getAllArticles().forEach(article => {
    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const contentMatch = article.content.toLowerCase().includes(lowerQuery);
    const tagMatch = article.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    if (titleMatch || contentMatch || tagMatch) {
      const relevance = titleMatch ? 100 : (tagMatch ? 80 : 60);
      
      // Extract snippet around query
      let snippet = "";
      if (contentMatch) {
        const index = article.content.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, index - 75);
        const end = Math.min(article.content.length, index + 75);
        snippet = "..." + article.content.substring(start, end) + "...";
      } else {
        snippet = article.content.substring(0, 150) + "...";
      }
      
      results.push({
        type: "article",
        id: article.id,
        title: article.title,
        snippet,
        relevance,
      });
    }
  });
  
  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Mark FAQ as helpful
 */
export async function markFAQHelpful(faqId: string, helpful: boolean): Promise<void> {
  const stats = await getHelpCenterStats();
  const key = `${STORAGE_KEY}_feedback`;
  
  const feedback = {
    faqId,
    helpful,
    timestamp: new Date(),
  };
  
  await AsyncStorage.setItem(key, JSON.stringify(feedback));
}

/**
 * Mark article as helpful
 */
export async function markArticleHelpful(articleId: string, helpful: boolean): Promise<void> {
  const key = `${STORAGE_KEY}_feedback`;
  
  const feedback = {
    articleId,
    helpful,
    timestamp: new Date(),
  };
  
  await AsyncStorage.setItem(key, JSON.stringify(feedback));
}

/**
 * Track article view
 */
export async function trackArticleView(articleId: string): Promise<void> {
  const key = `${STORAGE_KEY}_views`;
  const data = await AsyncStorage.getItem(key);
  const views = data ? JSON.parse(data) : {};
  
  views[articleId] = (views[articleId] || 0) + 1;
  await AsyncStorage.setItem(key, JSON.stringify(views));
}

/**
 * Track search query
 */
export async function trackSearch(query: string): Promise<void> {
  const key = `${STORAGE_KEY}_searches`;
  const data = await AsyncStorage.getItem(key);
  const searches = data ? JSON.parse(data) : [];
  
  searches.unshift({
    query,
    timestamp: new Date(),
  });
  
  // Keep last 50 searches
  if (searches.length > 50) {
    searches.splice(50);
  }
  
  await AsyncStorage.setItem(key, JSON.stringify(searches));
}

/**
 * Get help center statistics
 */
export async function getHelpCenterStats(): Promise<HelpCenterStats> {
  const articles = getAllArticles();
  const faqs = getAllFAQs();
  
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0) +
                     faqs.reduce((sum, f) => sum + f.views, 0);
  
  const mostViewedArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  const mostHelpfulFAQs = [...faqs]
    .sort((a, b) => b.helpful - a.helpful)
    .slice(0, 5);
  
  // Get recent searches
  const key = `${STORAGE_KEY}_searches`;
  const data = await AsyncStorage.getItem(key);
  const searches = data ? JSON.parse(data) : [];
  const recentSearches = searches.slice(0, 10).map((s: any) => s.query);
  
  return {
    totalArticles: articles.length,
    totalFAQs: faqs.length,
    totalViews,
    mostViewedArticles,
    mostHelpfulFAQs,
    recentSearches,
  };
}

/**
 * Get popular searches
 */
export async function getPopularSearches(): Promise<string[]> {
  return [
    "How to track energy",
    "Sleep tracking",
    "AI insights",
    "Premium features",
    "Cancel subscription",
    "Export data",
    "Energy patterns",
    "Habit tracking",
    "Energy circles",
    "Troubleshooting",
  ];
}

/**
 * Get related content
 */
export function getRelatedContent(contentId: string, type: "faq" | "article"): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (type === "article") {
    const article = getAllArticles().find(a => a.id === contentId);
    if (!article) return [];
    
    // Get related articles
    if (article.relatedArticles) {
      article.relatedArticles.forEach(id => {
        const related = getAllArticles().find(a => a.id === id);
        if (related) {
          results.push({
            type: "article",
            id: related.id,
            title: related.title,
            snippet: related.content.substring(0, 150) + "...",
            relevance: 90,
          });
        }
      });
    }
    
    // Get FAQs from same category
    const categoryFAQs = getFAQsByCategory(article.category).slice(0, 3);
    categoryFAQs.forEach(faq => {
      results.push({
        type: "faq",
        id: faq.id,
        title: faq.question,
        snippet: faq.answer.substring(0, 150) + "...",
        relevance: 80,
      });
    });
  } else {
    const faq = getAllFAQs().find(f => f.id === contentId);
    if (!faq) return [];
    
    // Get related FAQs from same category
    const categoryFAQs = getFAQsByCategory(faq.category)
      .filter(f => f.id !== contentId)
      .slice(0, 3);
    
    categoryFAQs.forEach(f => {
      results.push({
        type: "faq",
        id: f.id,
        title: f.question,
        snippet: f.answer.substring(0, 150) + "...",
        relevance: 85,
      });
    });
    
    // Get articles from same category
    const categoryArticles = getArticlesByCategory(faq.category).slice(0, 2);
    categoryArticles.forEach(article => {
      results.push({
        type: "article",
        id: article.id,
        title: article.title,
        snippet: article.content.substring(0, 150) + "...",
        relevance: 80,
      });
    });
  }
  
  return results;
}

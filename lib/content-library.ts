import AsyncStorage from "@react-native-async-storage/async-storage";

const BOOKMARKS_KEY = "content_bookmarks";
const PROGRESS_KEY = "course_progress";
const COMPLETED_KEY = "completed_content";

export interface ContentItem {
  id: string;
  type: "article" | "video" | "course";
  category: ContentCategory;
  title: string;
  description: string;
  author: string;
  publishDate: string;
  duration?: number; // minutes for videos/courses
  readTime?: number; // minutes for articles
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  thumbnail?: string;
  content?: string; // For articles
  videoUrl?: string; // For videos
  lessons?: CourseLesson[]; // For courses
  bookmarked?: boolean;
  completed?: boolean;
  progress?: number; // 0-100
}

export type ContentCategory =
  | "energy_optimization"
  | "sleep_science"
  | "nutrition"
  | "stress_management"
  | "productivity"
  | "mindfulness"
  | "fitness"
  | "habits";

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string;
  content?: string;
  completed: boolean;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLesson?: string;
  progress: number; // 0-100
  lastAccessedDate: string;
}

/**
 * Get all content
 */
export async function getAllContent(
  filters?: {
    type?: ContentItem["type"];
    category?: ContentCategory;
    difficulty?: ContentItem["difficulty"];
    search?: string;
  }
): Promise<ContentItem[]> {
  let content = getDefaultContent();
  
  // Apply filters
  if (filters) {
    if (filters.type) {
      content = content.filter((item) => item.type === filters.type);
    }
    if (filters.category) {
      content = content.filter((item) => item.category === filters.category);
    }
    if (filters.difficulty) {
      content = content.filter((item) => item.difficulty === filters.difficulty);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      content = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }
  }
  
  // Load bookmarks and progress
  const bookmarks = await getBookmarks();
  const completed = await getCompletedContent();
  const progressData = await getAllCourseProgress();
  
  content = content.map((item) => ({
    ...item,
    bookmarked: bookmarks.includes(item.id),
    completed: completed.includes(item.id),
    progress: progressData.find((p) => p.courseId === item.id)?.progress || 0,
  }));
  
  return content;
}

/**
 * Get content by ID
 */
export async function getContentById(id: string): Promise<ContentItem | null> {
  const content = await getAllContent();
  return content.find((item) => item.id === id) || null;
}

/**
 * Get content by category
 */
export async function getContentByCategory(
  category: ContentCategory
): Promise<ContentItem[]> {
  return getAllContent({ category });
}

/**
 * Default content library
 */
function getDefaultContent(): ContentItem[] {
  return [
    // Energy Optimization
    {
      id: "article_energy_101",
      type: "article",
      category: "energy_optimization",
      title: "Understanding Your Energy Patterns",
      description: "Learn how to identify and optimize your natural energy rhythms throughout the day.",
      author: "Dr. Sarah Johnson",
      publishDate: "2024-01-15",
      readTime: 8,
      difficulty: "beginner",
      tags: ["energy", "circadian rhythm", "productivity"],
      content: "Your energy levels fluctuate throughout the day based on various factors...",
    },
    {
      id: "video_energy_tracking",
      type: "video",
      category: "energy_optimization",
      title: "How to Track Your Energy Effectively",
      description: "A comprehensive guide to energy tracking techniques and best practices.",
      author: "Energy Today Team",
      publishDate: "2024-02-01",
      duration: 12,
      difficulty: "beginner",
      tags: ["tracking", "energy", "habits"],
      videoUrl: "https://example.com/video1",
    },
    {
      id: "course_energy_mastery",
      type: "course",
      category: "energy_optimization",
      title: "Energy Mastery: 30-Day Program",
      description: "Transform your energy levels in 30 days with this comprehensive course.",
      author: "Dr. Michael Chen",
      publishDate: "2024-01-01",
      duration: 240,
      difficulty: "intermediate",
      tags: ["course", "energy", "transformation"],
      lessons: [
        {
          id: "lesson1",
          title: "Week 1: Foundation",
          description: "Understanding energy basics",
          duration: 60,
          completed: false,
        },
        {
          id: "lesson2",
          title: "Week 2: Optimization",
          description: "Optimizing your daily routine",
          duration: 60,
          completed: false,
        },
        {
          id: "lesson3",
          title: "Week 3: Advanced Techniques",
          description: "Advanced energy management",
          duration: 60,
          completed: false,
        },
        {
          id: "lesson4",
          title: "Week 4: Mastery",
          description: "Sustaining peak energy",
          duration: 60,
          completed: false,
        },
      ],
    },
    
    // Sleep Science
    {
      id: "article_sleep_quality",
      type: "article",
      category: "sleep_science",
      title: "The Science of Quality Sleep",
      description: "Discover the latest research on sleep optimization and recovery.",
      author: "Dr. Emily Roberts",
      publishDate: "2024-01-20",
      readTime: 10,
      difficulty: "intermediate",
      tags: ["sleep", "recovery", "science"],
      content: "Quality sleep is essential for energy restoration...",
    },
    {
      id: "video_sleep_routine",
      type: "video",
      category: "sleep_science",
      title: "Building the Perfect Sleep Routine",
      description: "Step-by-step guide to creating a sleep routine that works.",
      author: "Sleep Foundation",
      publishDate: "2024-02-05",
      duration: 15,
      difficulty: "beginner",
      tags: ["sleep", "routine", "habits"],
      videoUrl: "https://example.com/video2",
    },
    
    // Nutrition
    {
      id: "article_nutrition_energy",
      type: "article",
      category: "nutrition",
      title: "Nutrition for Sustained Energy",
      description: "Learn which foods boost energy and which ones drain it.",
      author: "Nutritionist Lisa Wong",
      publishDate: "2024-01-25",
      readTime: 12,
      difficulty: "beginner",
      tags: ["nutrition", "energy", "food"],
      content: "The foods you eat have a direct impact on your energy levels...",
    },
    {
      id: "course_nutrition_basics",
      type: "course",
      category: "nutrition",
      title: "Nutrition Basics for Energy",
      description: "Master the fundamentals of energy-boosting nutrition.",
      author: "Dr. James Miller",
      publishDate: "2024-02-01",
      duration: 180,
      difficulty: "beginner",
      tags: ["nutrition", "course", "energy"],
      lessons: [
        {
          id: "n_lesson1",
          title: "Macronutrients and Energy",
          description: "Understanding carbs, proteins, and fats",
          duration: 45,
          completed: false,
        },
        {
          id: "n_lesson2",
          title: "Timing Your Meals",
          description: "When to eat for optimal energy",
          duration: 45,
          completed: false,
        },
        {
          id: "n_lesson3",
          title: "Hydration and Energy",
          description: "The role of water in energy levels",
          duration: 45,
          completed: false,
        },
        {
          id: "n_lesson4",
          title: "Meal Planning",
          description: "Creating your energy-optimized meal plan",
          duration: 45,
          completed: false,
        },
      ],
    },
    
    // Stress Management
    {
      id: "article_stress_energy",
      type: "article",
      category: "stress_management",
      title: "How Stress Drains Your Energy",
      description: "Understanding the stress-energy connection and how to break it.",
      author: "Dr. Amanda Lee",
      publishDate: "2024-02-10",
      readTime: 9,
      difficulty: "beginner",
      tags: ["stress", "energy", "mental health"],
      content: "Chronic stress is one of the biggest energy drainers...",
    },
    {
      id: "video_stress_techniques",
      type: "video",
      category: "stress_management",
      title: "5 Quick Stress Relief Techniques",
      description: "Practical techniques you can use anywhere, anytime.",
      author: "Mindfulness Institute",
      publishDate: "2024-02-15",
      duration: 10,
      difficulty: "beginner",
      tags: ["stress", "techniques", "quick"],
      videoUrl: "https://example.com/video3",
    },
    
    // Productivity
    {
      id: "article_productivity_energy",
      type: "article",
      category: "productivity",
      title: "Energy-Based Productivity",
      description: "Align your tasks with your energy levels for maximum productivity.",
      author: "Productivity Expert Tom Harris",
      publishDate: "2024-02-20",
      readTime: 11,
      difficulty: "intermediate",
      tags: ["productivity", "energy", "time management"],
      content: "Traditional time management ignores energy management...",
    },
    {
      id: "course_productivity_mastery",
      type: "course",
      category: "productivity",
      title: "Energy-Driven Productivity",
      description: "Learn to work with your energy, not against it.",
      author: "Dr. Rachel Green",
      publishDate: "2024-02-01",
      duration: 150,
      difficulty: "advanced",
      tags: ["productivity", "course", "energy"],
      lessons: [
        {
          id: "p_lesson1",
          title: "Energy Mapping",
          description: "Mapping your energy throughout the day",
          duration: 40,
          completed: false,
        },
        {
          id: "p_lesson2",
          title: "Task Alignment",
          description: "Matching tasks to energy levels",
          duration: 40,
          completed: false,
        },
        {
          id: "p_lesson3",
          title: "Energy Breaks",
          description: "Strategic breaks for sustained productivity",
          duration: 35,
          completed: false,
        },
        {
          id: "p_lesson4",
          title: "Advanced Strategies",
          description: "Advanced energy-productivity techniques",
          duration: 35,
          completed: false,
        },
      ],
    },
  ];
}

/**
 * Get bookmarks
 */
export async function getBookmarks(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get bookmarks:", error);
    return [];
  }
}

/**
 * Toggle bookmark
 */
export async function toggleBookmark(contentId: string): Promise<boolean> {
  try {
    const bookmarks = await getBookmarks();
    const index = bookmarks.indexOf(contentId);
    
    if (index > -1) {
      bookmarks.splice(index, 1);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return false;
    } else {
      bookmarks.push(contentId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    throw error;
  }
}

/**
 * Get completed content
 */
export async function getCompletedContent(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(COMPLETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get completed content:", error);
    return [];
  }
}

/**
 * Mark content as completed
 */
export async function markContentCompleted(contentId: string): Promise<void> {
  try {
    const completed = await getCompletedContent();
    if (!completed.includes(contentId)) {
      completed.push(contentId);
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
    }
  } catch (error) {
    console.error("Failed to mark content completed:", error);
    throw error;
  }
}

/**
 * Get course progress
 */
export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress | null> {
  try {
    const data = await AsyncStorage.getItem(`${PROGRESS_KEY}_${courseId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get course progress:", error);
    return null;
  }
}

/**
 * Get all course progress
 */
export async function getAllCourseProgress(): Promise<CourseProgress[]> {
  try {
    const courses = getDefaultContent().filter((item) => item.type === "course");
    const progressList: CourseProgress[] = [];
    
    for (const course of courses) {
      const progress = await getCourseProgress(course.id);
      if (progress) {
        progressList.push(progress);
      }
    }
    
    return progressList;
  } catch (error) {
    console.error("Failed to get all course progress:", error);
    return [];
  }
}

/**
 * Update course progress
 */
export async function updateCourseProgress(
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<CourseProgress> {
  try {
    let progress = await getCourseProgress(courseId);
    
    if (!progress) {
      progress = {
        courseId,
        completedLessons: [],
        progress: 0,
        lastAccessedDate: new Date().toISOString(),
      };
    }
    
    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    } else if (!completed) {
      progress.completedLessons = progress.completedLessons.filter(
        (id) => id !== lessonId
      );
    }
    
    // Calculate progress percentage
    const course = await getContentById(courseId);
    if (course && course.lessons) {
      progress.progress = Math.round(
        (progress.completedLessons.length / course.lessons.length) * 100
      );
    }
    
    progress.currentLesson = lessonId;
    progress.lastAccessedDate = new Date().toISOString();
    
    await AsyncStorage.setItem(
      `${PROGRESS_KEY}_${courseId}`,
      JSON.stringify(progress)
    );
    
    // Mark course as completed if all lessons are done
    if (progress.progress === 100) {
      await markContentCompleted(courseId);
    }
    
    return progress;
  } catch (error) {
    console.error("Failed to update course progress:", error);
    throw error;
  }
}

/**
 * Get learning statistics
 */
export async function getLearningStatistics(): Promise<{
  totalContent: number;
  completedContent: number;
  bookmarkedContent: number;
  coursesInProgress: number;
  totalLearningTime: number; // minutes
  completionRate: number; // percentage
}> {
  const allContent = await getAllContent();
  const completed = await getCompletedContent();
  const bookmarks = await getBookmarks();
  const progress = await getAllCourseProgress();
  
  const coursesInProgress = progress.filter((p) => p.progress > 0 && p.progress < 100).length;
  
  // Calculate total learning time (sum of duration/readTime for completed content)
  const totalLearningTime = allContent
    .filter((item) => completed.includes(item.id))
    .reduce((sum, item) => sum + (item.duration || item.readTime || 0), 0);
  
  const completionRate = allContent.length > 0
    ? Math.round((completed.length / allContent.length) * 100)
    : 0;
  
  return {
    totalContent: allContent.length,
    completedContent: completed.length,
    bookmarkedContent: bookmarks.length,
    coursesInProgress,
    totalLearningTime,
    completionRate,
  };
}

/**
 * Get recommended content
 */
export async function getRecommendedContent(): Promise<ContentItem[]> {
  // In real implementation, would use AI to recommend based on user's interests and progress
  // For now, return popular beginner content
  
  const allContent = await getAllContent({ difficulty: "beginner" });
  return allContent.slice(0, 5);
}

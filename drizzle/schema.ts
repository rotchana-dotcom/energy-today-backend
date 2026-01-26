import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table for Pro tier management
 * Tracks active subscriptions from Stripe and PayPal
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID from users table */
  userId: int("userId").notNull(),
  /** Payment provider: stripe or paypal */
  provider: mysqlEnum("provider", ["stripe", "paypal"]).notNull(),
  /** Subscription plan: monthly or annual */
  plan: mysqlEnum("plan", ["monthly", "annual"]).notNull(),
  /** Subscription status: active, cancelled, expired */
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).notNull(),
  /** Provider's subscription ID */
  subscriptionId: varchar("subscriptionId", { length: 255 }).notNull().unique(),
  /** Provider's customer ID */
  customerId: varchar("customerId", { length: 255 }),
  /** Subscription start date */
  startDate: timestamp("startDate").notNull(),
  /** Subscription end date (for cancelled subscriptions) */
  endDate: timestamp("endDate"),
  /** Next billing date */
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Sleep tracking table
 * Records sleep cycles with time in/out and quality rating
 */
export const sleepEntries = mysqlTable("sleep_entries", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID from users table (null for non-logged-in users using device storage) */
  userId: int("userId"),
  /** Device ID for non-logged-in users */
  deviceId: varchar("deviceId", { length: 255 }),
  /** Time user went to sleep */
  sleepTime: timestamp("sleepTime").notNull(),
  /** Time user woke up */
  wakeTime: timestamp("wakeTime").notNull(),
  /** Sleep quality rating (1-5) */
  quality: int("quality"),
  /** Optional notes about sleep */
  notes: text("notes"),
  /** Moon phase at sleep time (0-1, where 0=new moon, 0.5=full moon) */
  moonPhase: decimal("moonPhase", { precision: 3, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SleepEntry = typeof sleepEntries.$inferSelect;
export type InsertSleepEntry = typeof sleepEntries.$inferInsert;

/**
 * Diet/Food logging table
 * Records meals and food intake
 */
export const foodEntries = mysqlTable("food_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  deviceId: varchar("deviceId", { length: 255 }),
  /** Meal type: breakfast, lunch, dinner, snack */
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  /** Food description */
  food: text("food").notNull(),
  /** Estimated calories (optional) */
  calories: int("calories"),
  /** Time of meal */
  mealTime: timestamp("mealTime").notNull(),
  /** Optional notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = typeof foodEntries.$inferInsert;

/**
 * Weight tracking table
 * Records weight measurements and BMI
 */
export const weightEntries = mysqlTable("weight_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  deviceId: varchar("deviceId", { length: 255 }),
  /** Weight in kg */
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  /** Height in cm (for BMI calculation) */
  height: decimal("height", { precision: 5, scale: 2 }),
  /** Calculated BMI */
  bmi: decimal("bmi", { precision: 4, scale: 2 }),
  /** Weight goal: gain, lose, maintain */
  goal: mysqlEnum("goal", ["gain", "lose", "maintain"]),
  /** Optional notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = typeof weightEntries.$inferInsert;

/**
 * Meditation session tracking table
 * Records meditation sessions with duration and focus levels
 */
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  deviceId: varchar("deviceId", { length: 255 }),
  /** Meditation type: guided, unguided, breathing, etc. */
  type: varchar("type", { length: 50 }),
  /** Duration in minutes */
  duration: int("duration").notNull(),
  /** Focus level rating (1-5) */
  focusLevel: int("focusLevel"),
  /** Guided meditation ID (if using guided meditation) */
  guidedMeditationId: varchar("guidedMeditationId", { length: 100 }),
  /** Optional notes */
  notes: text("notes"),
  /** Session start time */
  sessionTime: timestamp("sessionTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

/**
 * Chi/Energy flow tracking table
 * Records energy levels and chi measurements
 */
export const chiEntries = mysqlTable("chi_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  deviceId: varchar("deviceId", { length: 255 }),
  /** Energy level rating (1-10) */
  energyLevel: int("energyLevel").notNull(),
  /** Chi flow quality (1-5) */
  chiFlow: int("chiFlow"),
  /** Physical feeling: energized, tired, balanced, etc. */
  physicalFeeling: varchar("physicalFeeling", { length: 50 }),
  /** Mental state: focused, scattered, calm, etc. */
  mentalState: varchar("mentalState", { length: 50 }),
  /** Optional notes */
  notes: text("notes"),
  /** Time of measurement */
  measurementTime: timestamp("measurementTime").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChiEntry = typeof chiEntries.$inferSelect;
export type InsertChiEntry = typeof chiEntries.$inferInsert;

/**
 * Community feed posts table
 * Stores user posts, achievements, and progress shares
 */
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Post type: achievement, milestone, challenge_complete, plan_complete, weight_goal, general */
  type: varchar("type", { length: 50 }).notNull(),
  /** Post title */
  title: text("title").notNull(),
  /** Post content/description */
  content: text("content").notNull(),
  /** JSON data specific to post type */
  data: json("data"),
  /** Visibility: public, partners, private */
  visibility: mysqlEnum("visibility", ["public", "partners", "private"]).default("partners").notNull(),
  /** Like count */
  likes: int("likes").default(0).notNull(),
  /** Comment count */
  commentCount: int("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Post likes table
 * Tracks which users liked which posts
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Post comments table
 * Stores comments on community posts
 */
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  /** Comment text */
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "sheikh", "admin"] }).notNull().default("student"),
  avatar: text("avatar"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sheikhProfiles = pgTable("sheikh_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  bio: text("bio"),
  isAcceptingStudents: boolean("is_accepting_students").default(true).notNull(),
  halaqahName: text("halaqah_name").notNull(),
  status: text("status", { enum: ["active", "pending_approval", "rejected"] }).default("pending_approval").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  sheikhId: text("sheikh_id").references(() => users.id),
  streakDays: integer("streak_days").default(0).notNull(),
  level: text("level").default("طالب مبتدئ").notNull(),
  status: text("status", { enum: ["active", "pending_approval", "paused"] }).default("active").notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  date: text("date").notNull(), // Format YYYY-MM-DD
  fajr: text("fajr", { enum: ["congregation", "ontime", "late", "missed"] }).default("missed").notNull(),
  dhuhr: text("dhuhr", { enum: ["congregation", "ontime", "late", "missed"] }).default("missed").notNull(),
  asr: text("asr", { enum: ["congregation", "ontime", "late", "missed"] }).default("missed").notNull(),
  maghrib: text("maghrib", { enum: ["congregation", "ontime", "late", "missed"] }).default("missed").notNull(),
  isha: text("isha", { enum: ["congregation", "ontime", "late", "missed"] }).default("missed").notNull(),
  quranRead: boolean("quran_read").default(false).notNull(),
  quranPages: integer("quran_pages").default(0).notNull(),
  adhkarMorning: boolean("adhkar_morning").default(false).notNull(),
  adhkarEvening: boolean("adhkar_evening").default(false).notNull(),
  fasting: text("fasting", { enum: ["none", "voluntary", "fard"] }).default("none").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackMessages = pgTable("feedback_messages", {
  id: text("id").primaryKey(),
  sheikhId: text("sheikh_id").notNull().references(() => users.id),
  studentId: text("student_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type", { enum: ["praise", "advice", "warning", "general"] }).default("general").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type FeedbackMessage = typeof feedbackMessages.$inferSelect;

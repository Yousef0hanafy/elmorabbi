import { pgTable, text, timestamp, boolean, integer, index, uniqueIndex, type AnyPgColumn } from "drizzle-orm/pg-core";

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
  userId: text("user_id").notNull().unique().references(() => users.id),
  title: text("title").notNull(),
  bio: text("bio"),
  isAcceptingStudents: boolean("is_accepting_students").default(true).notNull(),
  halaqahName: text("halaqah_name").notNull(),
  status: text("status", { enum: ["active", "pending_approval", "rejected"] }).default("pending_approval").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  sheikhId: text("sheikh_id").references(() => users.id),
  level: text("level").default("طالب مبتدئ").notNull(),
  status: text("status", { enum: ["active", "pending_approval", "paused"] }).default("active").notNull(),
}, (t) => [index("student_profiles_sheikh_idx").on(t.sheikhId)]);

export const dailyLogs = pgTable("daily_logs", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => users.id),
  date: text("date").notNull(), // Format YYYY-MM-DD
  fajr: text("fajr", { enum: ["pending", "congregation", "ontime", "late", "missed"] }).default("pending").notNull(),
  dhuhr: text("dhuhr", { enum: ["pending", "congregation", "ontime", "late", "missed"] }).default("pending").notNull(),
  asr: text("asr", { enum: ["pending", "congregation", "ontime", "late", "missed"] }).default("pending").notNull(),
  maghrib: text("maghrib", { enum: ["pending", "congregation", "ontime", "late", "missed"] }).default("pending").notNull(),
  isha: text("isha", { enum: ["pending", "congregation", "ontime", "late", "missed"] }).default("pending").notNull(),
  quranRead: boolean("quran_read").default(false).notNull(),
  quranPages: integer("quran_pages").default(0).notNull(),
  adhkarMorning: boolean("adhkar_morning").default(false).notNull(),
  adhkarEvening: boolean("adhkar_evening").default(false).notNull(),
  fasting: text("fasting", { enum: ["none", "voluntary", "fard"] }).default("none").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("daily_logs_student_date_idx").on(t.studentId, t.date)]);

export const feedbackMessages = pgTable("feedback_messages", {
  id: text("id").primaryKey(),
  sheikhId: text("sheikh_id").notNull().references(() => users.id),
  studentId: text("student_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type", { enum: ["praise", "advice", "warning", "general"] }).default("general").notNull(),
  // guidance: sheikh -> student; question: student -> sheikh
  kind: text("kind", { enum: ["guidance", "question"] }).default("guidance").notNull(),
  category: text("category"),
  // For a sheikh's reply: the student question it answers
  replyToId: text("reply_to_id").references((): AnyPgColumn => feedbackMessages.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("feedback_student_idx").on(t.studentId),
  index("feedback_sheikh_idx").on(t.sheikhId),
  index("feedback_reply_to_idx").on(t.replyToId),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type FeedbackMessage = typeof feedbackMessages.$inferSelect;

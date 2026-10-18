import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, gte, inArray, ne } from "drizzle-orm";
import { addDays, todayDateString } from "../dates";
import { computeStreak } from "../scoring";
import { DuplicateEmailError, type DailyLogRecord } from "./types";

// Streaks look back at most this many days
export const STREAK_LOOKBACK_DAYS = 400;

export const SHEIKH_DEFAULTS = {
  title: "مقرئ ومدرس شرعي",
  halaqahName: "حلقة المربي",
};

type DailyLogRow = typeof schema.dailyLogs.$inferSelect;

export const toLogRecord = (row: DailyLogRow): DailyLogRecord => ({
  id: row.id,
  studentId: row.studentId,
  date: row.date,
  fajr: row.fajr,
  dhuhr: row.dhuhr,
  asr: row.asr,
  maghrib: row.maghrib,
  isha: row.isha,
  quranRead: row.quranRead,
  quranPages: row.quranPages,
  adhkarMorning: row.adhkarMorning,
  adhkarEvening: row.adhkarEvening,
  fasting: row.fasting,
  notes: row.notes ?? undefined,
});

// One query for any number of students: only days where all five prayers were prayed
export async function getStreaks(studentIds: string[]): Promise<Map<string, number>> {
  const streaks = new Map<string, number>(studentIds.map((id) => [id, 0]));
  if (studentIds.length === 0) return streaks;

  const today = todayDateString();
  const rows = await getDb()
    .select({ studentId: schema.dailyLogs.studentId, date: schema.dailyLogs.date })
    .from(schema.dailyLogs)
    .where(
      and(
        inArray(schema.dailyLogs.studentId, studentIds),
        gte(schema.dailyLogs.date, addDays(today, -STREAK_LOOKBACK_DAYS)),
        ne(schema.dailyLogs.fajr, "missed"),
        ne(schema.dailyLogs.dhuhr, "missed"),
        ne(schema.dailyLogs.asr, "missed"),
        ne(schema.dailyLogs.maghrib, "missed"),
        ne(schema.dailyLogs.isha, "missed")
      )
    );

  const datesByStudent = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!datesByStudent.has(row.studentId)) datesByStudent.set(row.studentId, new Set());
    datesByStudent.get(row.studentId)!.add(row.date);
  }
  for (const [studentId, dates] of datesByStudent) {
    streaks.set(studentId, computeStreak(dates, today));
  }
  return streaks;
}

export async function assertEmailAvailable(email: string, exceptUserId?: string): Promise<void> {
  const [existing] = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()));
  if (existing && existing.id !== exceptUserId) {
    throw new DuplicateEmailError();
  }
}

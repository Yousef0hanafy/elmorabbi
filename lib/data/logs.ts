import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, gte } from "drizzle-orm";
import { addDays, todayDateString } from "../dates";
import { emptyDailyLog } from "../scoring";
import type { DailyLogRecord } from "./types";
import { toLogRecord } from "./shared";

export const logQueries = {
  // Daily Logs
  // A day with nothing recorded yet is an empty log, never pre-filled data
  getTodayLog: async (studentId: string): Promise<DailyLogRecord> => {
    const today = todayDateString();
    const [log] = await getDb()
      .select()
      .from(schema.dailyLogs)
      .where(and(eq(schema.dailyLogs.studentId, studentId), eq(schema.dailyLogs.date, today)));
    return log ? toLogRecord(log) : emptyDailyLog(studentId, today);
  },

  updateDailyLog: async (
    log: Partial<DailyLogRecord> & { studentId: string; date: string }
  ): Promise<void> => {
    const { studentId, date, ...changes } = log;
    delete changes.id;
    // Atomic upsert on (student_id, date)
    await getDb()
      .insert(schema.dailyLogs)
      .values({ ...emptyDailyLog(studentId, date), ...changes, notes: changes.notes ?? null })
      .onConflictDoUpdate({
        target: [schema.dailyLogs.studentId, schema.dailyLogs.date],
        set: { ...changes, updatedAt: new Date() },
      });
  },

  // Last `days` calendar days ending today; days without a record are empty logs
  getStudentHistory: async (studentId: string, days: number = 7): Promise<DailyLogRecord[]> => {
    const today = todayDateString();
    const from = addDays(today, -(days - 1));
    const rows = await getDb()
      .select()
      .from(schema.dailyLogs)
      .where(and(eq(schema.dailyLogs.studentId, studentId), gte(schema.dailyLogs.date, from)));
    const byDate = new Map(rows.map((r) => [r.date, toLogRecord(r)]));

    return Array.from({ length: days }, (_, i) => {
      const date = addDays(from, i);
      return byDate.get(date) ?? emptyDailyLog(studentId, date);
    });
  },
};

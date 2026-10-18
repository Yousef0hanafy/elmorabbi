import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, gte, inArray, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { addDays, todayDateString } from "../dates";
import { completionRate, computeAlerts, countCompletedDeeds } from "../scoring";
import type { DailyLogRecord, StudentProfileRecord } from "./types";
import { getStreaks, toLogRecord } from "./shared";

export const studentQueries = {
  // Student Profile & Sheikh Assignment
  getStudentProfile: async (studentId: string): Promise<StudentProfileRecord | undefined> => {
    const [p] = await getDb()
      .select()
      .from(schema.studentProfiles)
      .where(eq(schema.studentProfiles.userId, studentId));
    if (!p) return undefined;

    const streaks = await getStreaks([studentId]);
    return { ...p, streakDays: streaks.get(studentId) ?? 0 };
  },

  // Ownership check used for authorization
  isStudentOfSheikh: async (studentId: string, sheikhId: string): Promise<boolean> => {
    const [p] = await getDb()
      .select({ sheikhId: schema.studentProfiles.sheikhId })
      .from(schema.studentProfiles)
      .where(eq(schema.studentProfiles.userId, studentId));
    return Boolean(p && p.sheikhId === sheikhId);
  },

  assignSheikhToStudent: async (studentId: string, sheikhId: string): Promise<void> => {
    await getDb()
      .insert(schema.studentProfiles)
      .values({
        id: `sp-${studentId}`,
        userId: studentId,
        sheikhId,
        level: "طالب جديد",
        status: "active",
      })
      .onConflictDoUpdate({
        target: schema.studentProfiles.userId,
        set: { sheikhId },
      });
  },

  getStudentsForSheikh: async (sheikhId: string) => {
    const db = getDb();
    const students = await db
      .select({ user: schema.users, profile: schema.studentProfiles })
      .from(schema.studentProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.studentProfiles.userId))
      .where(eq(schema.studentProfiles.sheikhId, sheikhId));

    if (students.length === 0) return [];

    const ids = students.map((s) => s.user.id);
    const today = todayDateString();
    // Today plus the three previous days, used for today's status and pattern alerts
    const [recentRows, streaks] = await Promise.all([
      db
        .select()
        .from(schema.dailyLogs)
        .where(and(inArray(schema.dailyLogs.studentId, ids), gte(schema.dailyLogs.date, addDays(today, -3)))),
      getStreaks(ids),
    ]);
    const logsByStudent = new Map<string, DailyLogRecord[]>();
    for (const row of recentRows) {
      if (!logsByStudent.has(row.studentId)) logsByStudent.set(row.studentId, []);
      logsByStudent.get(row.studentId)!.push(toLogRecord(row));
    }

    return students.map(({ user, profile }) => {
      const recentLogs = logsByStudent.get(user.id) ?? [];
      const todayLog = recentLogs.find((l) => l.date === today);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? undefined,
        phone: user.phone ?? undefined,
        profile: { ...profile, streakDays: streaks.get(user.id) ?? 0 } as StudentProfileRecord,
        todayLog,
        completedDeeds: countCompletedDeeds(todayLog),
        completionRate: completionRate(todayLog),
        alerts: computeAlerts(recentLogs, today, todayLog, todayDateString(user.createdAt)),
      };
    });
  },

  // Reassign student to a sheikh
  reassignStudentSheikh: async (studentId: string, newSheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.studentProfiles)
      .set({ sheikhId: newSheikhId })
      .where(eq(schema.studentProfiles.userId, studentId));
  },

  // Students Directory for Admin
  getAllStudentsWithDetails: async () => {
    const sheikhUsers = alias(schema.users, "sheikh_users");
    const rows = await getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        level: schema.studentProfiles.level,
        status: schema.studentProfiles.status,
        sheikhId: schema.studentProfiles.sheikhId,
        sheikhName: sheikhUsers.name,
      })
      .from(schema.users)
      .innerJoin(schema.studentProfiles, eq(schema.users.id, schema.studentProfiles.userId))
      .leftJoin(sheikhUsers, eq(sheikhUsers.id, schema.studentProfiles.sheikhId))
      .where(eq(schema.users.role, "student"));

    const streaks = await getStreaks(rows.map((r) => r.id));
    return rows.map((r) => ({
      ...r,
      streakDays: streaks.get(r.id) ?? 0,
      sheikhName: r.sheikhId ? r.sheikhName || "غير محدد" : "غير منضم لحلقة",
    }));
  },

  // Operational KPIs for Admin
  getOperationalKPIs: async () => {
    const db = getDb();
    const today = todayDateString();
    const [[sheikhCount], students, todayLogs] = await Promise.all([
      db
        .select({ value: count() })
        .from(schema.sheikhProfiles)
        .where(eq(schema.sheikhProfiles.status, "active")),
      db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "student")),
      db.select().from(schema.dailyLogs).where(eq(schema.dailyLogs.date, today)),
    ]);

    const streaks = await getStreaks(students.map((s) => s.id));
    const totalStreak = [...streaks.values()].reduce((acc, s) => acc + s, 0);

    return {
      activeSheikhs: sheikhCount?.value ?? 0,
      totalStudents: students.length,
      todayLoggedDeeds: todayLogs.reduce((acc, l) => acc + countCompletedDeeds(toLogRecord(l)), 0),
      avgStreak: students.length > 0 ? Math.round(totalStreak / students.length) : 0,
    };
  },
};

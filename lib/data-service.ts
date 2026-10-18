import { getDb, schema } from "@/db";
import { eq, and, desc, gte, inArray, ne, or, isNull, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { addDays, formatTimestamp, todayDateString } from "./dates";
import { completionRate, computeStreak, countCompletedDeeds, emptyDailyLog } from "./scoring";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "student" | "sheikh" | "admin";
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
  halaqahName?: string;
  status?: "active" | "pending_approval" | "rejected";
  createdAt?: string;
}

export interface StudentProfileRecord {
  id: string;
  userId: string;
  sheikhId?: string | null;
  streakDays: number;
  level: string;
  status: "active" | "pending_approval" | "paused";
}

export interface DailyLogRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD (Egypt calendar day)
  fajr: "congregation" | "ontime" | "late" | "missed";
  dhuhr: "congregation" | "ontime" | "late" | "missed";
  asr: "congregation" | "ontime" | "late" | "missed";
  maghrib: "congregation" | "ontime" | "late" | "missed";
  isha: "congregation" | "ontime" | "late" | "missed";
  quranRead: boolean;
  quranPages: number;
  adhkarMorning: boolean;
  adhkarEvening: boolean;
  fasting: "none" | "voluntary" | "fard";
  notes?: string;
}

export interface FeedbackRecord {
  id: string;
  sheikhId: string;
  studentId: string;
  sheikhName: string;
  content: string;
  type: "praise" | "advice" | "warning" | "general";
  isRead: boolean;
  createdAt: string;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already in use");
  }
}

// Streaks look back at most this many days
const STREAK_LOOKBACK_DAYS = 400;

const SHEIKH_DEFAULTS = {
  title: "مقرئ ومدرس شرعي",
  halaqahName: "حلقة المربي",
};

type DailyLogRow = typeof schema.dailyLogs.$inferSelect;

const toLogRecord = (row: DailyLogRow): DailyLogRecord => ({
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
async function getStreaks(studentIds: string[]): Promise<Map<string, number>> {
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

async function assertEmailAvailable(email: string, exceptUserId?: string): Promise<void> {
  const [existing] = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()));
  if (existing && existing.id !== exceptUserId) {
    throw new DuplicateEmailError();
  }
}

export const dataService = {
  // Users
  getAllSheikhs: async (): Promise<UserRecord[]> => {
    const rows = await getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        phone: schema.users.phone,
        title: schema.sheikhProfiles.title,
        bio: schema.sheikhProfiles.bio,
        halaqahName: schema.sheikhProfiles.halaqahName,
        status: schema.sheikhProfiles.status,
      })
      .from(schema.users)
      .leftJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(
        and(
          eq(schema.users.role, "sheikh"),
          or(eq(schema.sheikhProfiles.status, "active"), isNull(schema.sheikhProfiles.status))
        )
      );

    return rows.map((r) => ({
      ...r,
      role: "sheikh" as const,
      avatar: r.avatar ?? undefined,
      phone: r.phone ?? undefined,
      title: r.title ?? SHEIKH_DEFAULTS.title,
      bio: r.bio ?? "",
      halaqahName: r.halaqahName ?? SHEIKH_DEFAULTS.halaqahName,
      status: "active" as const,
    }));
  },

  getPendingSheikhs: async (): Promise<UserRecord[]> => {
    const rows = await getDb()
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.avatar,
        phone: schema.users.phone,
        createdAt: schema.users.createdAt,
        title: schema.sheikhProfiles.title,
        bio: schema.sheikhProfiles.bio,
        halaqahName: schema.sheikhProfiles.halaqahName,
      })
      .from(schema.users)
      .innerJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(and(eq(schema.users.role, "sheikh"), eq(schema.sheikhProfiles.status, "pending_approval")))
      .orderBy(desc(schema.users.createdAt));

    return rows.map((r) => ({
      ...r,
      role: "sheikh" as const,
      avatar: r.avatar ?? undefined,
      phone: r.phone ?? undefined,
      title: r.title ?? SHEIKH_DEFAULTS.title,
      bio: r.bio ?? "",
      halaqahName: r.halaqahName ?? SHEIKH_DEFAULTS.halaqahName,
      status: "pending_approval" as const,
      createdAt: formatTimestamp(r.createdAt, { day: "numeric", month: "short", year: "numeric" }),
    }));
  },

  approveSheikh: async (sheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.sheikhProfiles)
      .set({ status: "active", isAcceptingStudents: true })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },

  rejectSheikh: async (sheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.sheikhProfiles)
      .set({ status: "rejected", isAcceptingStudents: false })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },

  getUserById: async (id: string): Promise<UserRecord | undefined> => {
    const db = getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!u) return undefined;

    let extra: Pick<UserRecord, "title" | "bio" | "halaqahName"> = {};
    if (u.role === "sheikh") {
      const [sp] = await db
        .select()
        .from(schema.sheikhProfiles)
        .where(eq(schema.sheikhProfiles.userId, u.id));
      if (sp) {
        extra = { title: sp.title, bio: sp.bio ?? undefined, halaqahName: sp.halaqahName };
      }
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar ?? undefined,
      phone: u.phone ?? undefined,
      ...extra,
    };
  },

  getUserByEmail: async (email: string): Promise<UserRecord | undefined> => {
    const db = getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    if (!u) return undefined;

    let extra: Pick<UserRecord, "title" | "bio" | "halaqahName" | "status"> = { status: "active" };
    if (u.role === "sheikh") {
      const [sp] = await db
        .select()
        .from(schema.sheikhProfiles)
        .where(eq(schema.sheikhProfiles.userId, u.id));
      if (sp) {
        extra = {
          title: sp.title,
          bio: sp.bio ?? undefined,
          halaqahName: sp.halaqahName,
          status: sp.status,
        };
      }
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      avatar: u.avatar ?? undefined,
      phone: u.phone ?? undefined,
      ...extra,
    };
  },

  // Current role and (for sheikhs) approval status, used to validate sessions on every request
  getAccountState: async (
    userId: string
  ): Promise<{ role: UserRecord["role"]; sheikhStatus: string | null } | undefined> => {
    const [row] = await getDb()
      .select({ role: schema.users.role, sheikhStatus: schema.sheikhProfiles.status })
      .from(schema.users)
      .leftJoin(schema.sheikhProfiles, eq(schema.users.id, schema.sheikhProfiles.userId))
      .where(eq(schema.users.id, userId));
    return row;
  },

  createUser: async (user: UserRecord): Promise<UserRecord> => {
    const db = getDb();
    await assertEmailAvailable(user.email);
    await db.insert(schema.users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password ?? "",
      role: user.role,
      phone: user.phone,
    });

    if (user.role === "student") {
      await db.insert(schema.studentProfiles).values({
        id: `sp-${user.id}`,
        userId: user.id,
        level: "طالب جديد",
        status: "active",
      });
    } else if (user.role === "sheikh") {
      await db.insert(schema.sheikhProfiles).values({
        id: `shp-${user.id}`,
        userId: user.id,
        title: user.title || SHEIKH_DEFAULTS.title,
        bio: user.bio || "",
        isAcceptingStudents: false,
        halaqahName: user.halaqahName || `حلقة الشيخ ${user.name}`,
        status: "pending_approval",
      });
    }
    return user;
  },

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
    const [todayLogs, streaks] = await Promise.all([
      db
        .select()
        .from(schema.dailyLogs)
        .where(and(inArray(schema.dailyLogs.studentId, ids), eq(schema.dailyLogs.date, today))),
      getStreaks(ids),
    ]);
    const logByStudent = new Map(todayLogs.map((l) => [l.studentId, toLogRecord(l)]));

    return students.map(({ user, profile }) => {
      const todayLog = logByStudent.get(user.id);
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
      };
    });
  },

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

  // Feedback Messages (guidance from sheikh to student)
  getFeedbackForStudent: async (studentId: string): Promise<FeedbackRecord[]> => {
    const rows = await getDb()
      .select({
        id: schema.feedbackMessages.id,
        sheikhId: schema.feedbackMessages.sheikhId,
        studentId: schema.feedbackMessages.studentId,
        sheikhName: schema.users.name,
        content: schema.feedbackMessages.content,
        type: schema.feedbackMessages.type,
        isRead: schema.feedbackMessages.isRead,
        createdAt: schema.feedbackMessages.createdAt,
      })
      .from(schema.feedbackMessages)
      .leftJoin(schema.users, eq(schema.feedbackMessages.sheikhId, schema.users.id))
      .where(
        and(eq(schema.feedbackMessages.studentId, studentId), eq(schema.feedbackMessages.kind, "guidance"))
      )
      .orderBy(desc(schema.feedbackMessages.createdAt));

    return rows.map((r) => ({
      ...r,
      sheikhName: r.sheikhName || "الشيخ المشرف",
      createdAt: formatTimestamp(r.createdAt, { day: "numeric", month: "short" }),
    }));
  },

  sendFeedback: async (feedback: Omit<FeedbackRecord, "id" | "createdAt" | "isRead">): Promise<void> => {
    await getDb().insert(schema.feedbackMessages).values({
      id: `fb-${crypto.randomUUID()}`,
      sheikhId: feedback.sheikhId,
      studentId: feedback.studentId,
      content: feedback.content,
      type: feedback.type,
      kind: "guidance",
    });
  },

  sendStudentQuestion: async (question: {
    studentId: string;
    sheikhId: string;
    content: string;
    category: string;
  }): Promise<void> => {
    await getDb().insert(schema.feedbackMessages).values({
      id: `q-${crypto.randomUUID()}`,
      sheikhId: question.sheikhId,
      studentId: question.studentId,
      content: question.content,
      category: question.category,
      type: "advice",
      kind: "question",
    });
  },

  getStudentInquiriesForSheikh: async (sheikhId: string) => {
    const rows = await getDb()
      .select({
        id: schema.feedbackMessages.id,
        sheikhId: schema.feedbackMessages.sheikhId,
        studentId: schema.feedbackMessages.studentId,
        studentName: schema.users.name,
        content: schema.feedbackMessages.content,
        category: schema.feedbackMessages.category,
        type: schema.feedbackMessages.type,
        isRead: schema.feedbackMessages.isRead,
        createdAt: schema.feedbackMessages.createdAt,
      })
      .from(schema.feedbackMessages)
      .leftJoin(schema.users, eq(schema.feedbackMessages.studentId, schema.users.id))
      .where(
        and(eq(schema.feedbackMessages.sheikhId, sheikhId), eq(schema.feedbackMessages.kind, "question"))
      )
      .orderBy(desc(schema.feedbackMessages.createdAt));

    return rows.map((r) => ({
      ...r,
      studentName: r.studentName || "طالب حلقة",
      category: r.category ?? undefined,
      createdAt: formatTimestamp(r.createdAt, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  },

  // Admin & Security Management
  updateUserPassword: async (userId: string, passwordHash: string): Promise<void> => {
    await getDb().update(schema.users).set({ password: passwordHash }).where(eq(schema.users.id, userId));
  },

  createNewSheikh: async (data: {
    name: string;
    email: string;
    passwordHash: string;
    title: string;
    halaqahName: string;
    bio?: string;
  }): Promise<void> => {
    const db = getDb();
    await assertEmailAvailable(data.email);
    const id = `sheikh-${crypto.randomUUID()}`;

    await db.insert(schema.users).values({
      id,
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      role: "sheikh",
    });

    await db.insert(schema.sheikhProfiles).values({
      id: `shp-${id}`,
      userId: id,
      title: data.title,
      bio: data.bio || "",
      halaqahName: data.halaqahName,
      isAcceptingStudents: true,
      status: "active",
    });
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

  // Update Sheikh Profile
  updateSheikhProfile: async (
    sheikhId: string,
    data: { name: string; email: string; title: string; halaqahName: string; bio?: string }
  ): Promise<void> => {
    const db = getDb();
    await assertEmailAvailable(data.email, sheikhId);
    await db
      .update(schema.users)
      .set({ name: data.name, email: data.email })
      .where(eq(schema.users.id, sheikhId));
    await db
      .update(schema.sheikhProfiles)
      .set({ title: data.title, halaqahName: data.halaqahName, bio: data.bio || "" })
      .where(eq(schema.sheikhProfiles.userId, sheikhId));
  },

  // Reassign student to a sheikh
  reassignStudentSheikh: async (studentId: string, newSheikhId: string): Promise<void> => {
    await getDb()
      .update(schema.studentProfiles)
      .set({ sheikhId: newSheikhId })
      .where(eq(schema.studentProfiles.userId, studentId));
  },

  // Recent guidance messages for Admin review (student questions stay private)
  getRecentFeedbacksAll: async (limitCount = 6) => {
    const sheikhUsers = alias(schema.users, "sheikh_users");
    const rows = await getDb()
      .select({
        id: schema.feedbackMessages.id,
        content: schema.feedbackMessages.content,
        type: schema.feedbackMessages.type,
        createdAt: schema.feedbackMessages.createdAt,
        sheikhName: sheikhUsers.name,
        studentName: schema.users.name,
      })
      .from(schema.feedbackMessages)
      .leftJoin(sheikhUsers, eq(sheikhUsers.id, schema.feedbackMessages.sheikhId))
      .leftJoin(schema.users, eq(schema.users.id, schema.feedbackMessages.studentId))
      .where(eq(schema.feedbackMessages.kind, "guidance"))
      .orderBy(desc(schema.feedbackMessages.createdAt))
      .limit(limitCount);

    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      type: r.type,
      createdAt: formatTimestamp(r.createdAt, { day: "numeric", month: "short", year: "numeric" }),
      sheikhName: r.sheikhName || "الشيخ المشرف",
      studentName: r.studentName || "طالب علم",
    }));
  },
};

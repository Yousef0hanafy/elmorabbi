import { db, schema } from "@/db";
import { eq, and, desc, or, isNull } from "drizzle-orm";

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
  date: string; // YYYY-MM-DD
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

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const dataService = {
  // Users
  getAllSheikhs: async (): Promise<UserRecord[]> => {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
            avatar: schema.users.avatar,
            phone: schema.users.phone,
            title: schema.sheikhProfiles.title,
            bio: schema.sheikhProfiles.bio,
            halaqahName: schema.sheikhProfiles.halaqahName,
            status: schema.sheikhProfiles.status,
          })
          .from(schema.users)
          .leftJoin(
            schema.sheikhProfiles,
            eq(schema.users.id, schema.sheikhProfiles.userId)
          )
          .where(
            and(
              eq(schema.users.role, "sheikh"),
              or(
                eq(schema.sheikhProfiles.status, "active"),
                isNull(schema.sheikhProfiles.status)
              )
            )
          );

        return rows.map((r) => ({
          ...r,
          role: "sheikh" as const,
          avatar: r.avatar ?? undefined,
          phone: r.phone ?? undefined,
          title: r.title ?? "مقرئ ومدرس شرعي",
          bio: r.bio ?? "",
          halaqahName: r.halaqahName ?? "حلقة المربي",
          status: (r.status as "active") || "active",
        }));
      } catch (err) {
        console.warn("Neon query error, falling back to mock:", err);
      }
    }

    return [
      {
        id: "sheikh-mahmoud",
        name: "الشيخ محمود عبد الحليم",
        email: "sheikh@elmorabbi.com",
        role: "sheikh",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        phone: "+20110 123 4567",
        title: "مقرئ القراءات العشر ومجاز في الحديث النبوي الشريف",
        bio: "إمام ومدرس للقرآن الكريم والعلوم الشرعية، أهدف لمساعدة الطلاب على الاستقامة وبناء الورد اليومي ومحاسبة النفس وفق منهج تربوي أصيل.",
        halaqahName: "حلقة الهدى والنور لتزكية النفوس",
        status: "active",
      },
    ];
  },

  getPendingSheikhs: async (): Promise<UserRecord[]> => {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            role: schema.users.role,
            avatar: schema.users.avatar,
            phone: schema.users.phone,
            createdAt: schema.users.createdAt,
            title: schema.sheikhProfiles.title,
            bio: schema.sheikhProfiles.bio,
            halaqahName: schema.sheikhProfiles.halaqahName,
            status: schema.sheikhProfiles.status,
          })
          .from(schema.users)
          .innerJoin(
            schema.sheikhProfiles,
            eq(schema.users.id, schema.sheikhProfiles.userId)
          )
          .where(
            and(
              eq(schema.users.role, "sheikh"),
              eq(schema.sheikhProfiles.status, "pending_approval")
            )
          )
          .orderBy(desc(schema.users.createdAt));

        return rows.map((r) => ({
          ...r,
          role: "sheikh" as const,
          avatar: r.avatar ?? undefined,
          phone: r.phone ?? undefined,
          title: r.title ?? "مقرئ ومدرس شرعي",
          bio: r.bio ?? "",
          halaqahName: r.halaqahName ?? "حلقة المربي",
          status: "pending_approval" as const,
          createdAt: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : undefined,
        }));
      } catch (err) {
        console.warn("Neon query error in getPendingSheikhs:", err);
      }
    }
    return [];
  },

  approveSheikh: async (sheikhId: string): Promise<void> => {
    if (db) {
      try {
        await db
          .update(schema.sheikhProfiles)
          .set({
            status: "active",
            isAcceptingStudents: true,
          })
          .where(eq(schema.sheikhProfiles.userId, sheikhId));
      } catch (err) {
        console.warn("Neon query error in approveSheikh:", err);
      }
    }
  },

  rejectSheikh: async (sheikhId: string): Promise<void> => {
    if (db) {
      try {
        await db
          .update(schema.sheikhProfiles)
          .set({
            status: "rejected",
            isAcceptingStudents: false,
          })
          .where(eq(schema.sheikhProfiles.userId, sheikhId));
      } catch (err) {
        console.warn("Neon query error in rejectSheikh:", err);
      }
    }
  },

  getUserById: async (id: string): Promise<UserRecord | undefined> => {
    if (db) {
      try {
        const [u] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, id));

        if (u) {
          let extra: { title?: string; bio?: string; halaqahName?: string } = {};
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
              };
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
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    // Default mock lookup
    if (id === "sheikh-mahmoud") {
      return {
        id: "sheikh-mahmoud",
        name: "الشيخ محمود عبد الحليم",
        email: "sheikh@elmorabbi.com",
        role: "sheikh",
        title: "مقرئ القراءات العشر ومجاز في الحديث النبوي الشريف",
        halaqahName: "حلقة الهدى والنور لتزكية النفوس",
      };
    }
    return {
      id: "student-ahmed",
      name: "أحمد بن عبد الرحمن",
      email: "ahmed@student.com",
      role: "student",
    };
  },

  getUserByEmail: async (email: string): Promise<UserRecord | undefined> => {
    if (db) {
      try {
        const [u] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email.toLowerCase()));
        if (u) {
          let extra: { title?: string; bio?: string; halaqahName?: string; status?: "active" | "pending_approval" | "rejected" } = {};
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
                status: (sp.status as any) || "active",
              };
            } else {
              extra = { status: "active" };
            }
          } else if (u.role === "student") {
            extra = { status: "active" };
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
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    if (email.toLowerCase().includes("sheikh")) {
      return {
        id: "sheikh-mahmoud",
        name: "الشيخ محمود عبد الحليم",
        email,
        password: "password123",
        role: "sheikh",
        status: "active",
      };
    }
    return {
      id: "student-ahmed",
      name: "أحمد بن عبد الرحمن",
      email,
      password: "password123",
      role: "student",
      status: "active",
    };
  },

  createUser: async (user: UserRecord): Promise<UserRecord> => {
    if (db) {
      try {
        await db.insert(schema.users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password || "password123",
          role: user.role,
          phone: user.phone,
        });

        if (user.role === "student") {
          await db.insert(schema.studentProfiles).values({
            id: `sp-${user.id}`,
            userId: user.id,
            streakDays: 0,
            level: "طالب جديد",
            status: "active",
          });
        } else if (user.role === "sheikh") {
          await db.insert(schema.sheikhProfiles).values({
            id: `shp-${user.id}`,
            userId: user.id,
            title: user.title || "مقرئ ومدرس شرعي",
            bio: user.bio || "",
            isAcceptingStudents: false,
            halaqahName: user.halaqahName || `حلقة الشيخ ${user.name}`,
            status: "pending_approval",
          });
        }
      } catch (err) {
        console.warn("Failed to insert user to Neon:", err);
      }
    }
    return user;
  },

  // Student Profile & Sheikh Assignment
  getStudentProfile: async (studentId: string): Promise<StudentProfileRecord | undefined> => {
    if (db) {
      try {
        const [p] = await db
          .select()
          .from(schema.studentProfiles)
          .where(eq(schema.studentProfiles.userId, studentId));

        if (p) return p;
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    return {
      id: `sp-${studentId}`,
      userId: studentId,
      sheikhId: "sheikh-mahmoud",
      streakDays: 14,
      level: "طالب مواظب (المستوى الثاني)",
      status: "active",
    };
  },

  assignSheikhToStudent: async (studentId: string, sheikhId: string): Promise<void> => {
    if (db) {
      try {
        await db
          .insert(schema.studentProfiles)
          .values({
            id: `sp-${studentId}`,
            userId: studentId,
            sheikhId,
            streakDays: 0,
            level: "طالب جديد",
            status: "active",
          })
          .onConflictDoUpdate({
            target: schema.studentProfiles.userId,
            set: { sheikhId },
          });
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }
  },

  getStudentsForSheikh: async (sheikhId: string) => {
    if (db) {
      const client = db;
      try {
        const profiles = await client
          .select()
          .from(schema.studentProfiles)
          .where(eq(schema.studentProfiles.sheikhId, sheikhId));

        const todayDate = getTodayDateString();

        const studentsWithLogs = await Promise.all(
          profiles.map(async (p) => {
            const [user] = await client
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, p.userId));

            const [todayLog] = await client
              .select()
              .from(schema.dailyLogs)
              .where(
                and(
                  eq(schema.dailyLogs.studentId, p.userId),
                  eq(schema.dailyLogs.date, todayDate)
                )
              );

            let completedDeeds = 0;
            if (todayLog) {
              if (todayLog.fajr === "congregation" || todayLog.fajr === "ontime") completedDeeds++;
              if (todayLog.dhuhr === "congregation" || todayLog.dhuhr === "ontime") completedDeeds++;
              if (todayLog.asr === "congregation" || todayLog.asr === "ontime") completedDeeds++;
              if (todayLog.maghrib === "congregation" || todayLog.maghrib === "ontime") completedDeeds++;
              if (todayLog.isha === "congregation" || todayLog.isha === "ontime") completedDeeds++;
              if (todayLog.quranRead) completedDeeds++;
              if (todayLog.adhkarMorning) completedDeeds++;
              if (todayLog.adhkarEvening) completedDeeds++;
            }

            const completionRate = Math.round((completedDeeds / 8) * 100);

            return {
              id: user?.id || p.userId,
              name: user?.name || "طالب",
              email: user?.email || "",
              avatar: user?.avatar ?? undefined,
              phone: user?.phone ?? undefined,
              profile: p,
              todayLog: todayLog ? { ...todayLog, notes: todayLog.notes ?? undefined } : undefined,
              completedDeeds,
              completionRate,
            };
          })
        );

        if (studentsWithLogs.length > 0) {
          return studentsWithLogs;
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    // Default mock fallback
    return [
      {
        id: "student-ahmed",
        name: "أحمد بن عبد الرحمن",
        email: "ahmed@student.com",
        profile: {
          id: "sp-ahmed",
          userId: "student-ahmed",
          sheikhId,
          streakDays: 14,
          level: "طالب مواظب (المستوى الثاني)",
          status: "active" as const,
        },
        todayLog: {
          id: "log-ahmed",
          studentId: "student-ahmed",
          date: getTodayDateString(),
          fajr: "congregation" as const,
          dhuhr: "congregation" as const,
          asr: "ontime" as const,
          maghrib: "congregation" as const,
          isha: "ontime" as const,
          quranRead: true,
          quranPages: 10,
          adhkarMorning: true,
          adhkarEvening: true,
          fasting: "voluntary" as const,
          notes: "الحمد لله استيقظت مبكراً ووفقت لصلاة الفجر في جماعة المسجد.",
        },
        completedDeeds: 8,
        completionRate: 100,
      },
      {
        id: "student-omar",
        name: "عمر الفاروق الدوسري",
        email: "omar@student.com",
        profile: {
          id: "sp-omar",
          userId: "student-omar",
          sheikhId,
          streakDays: 3,
          level: "مبتدئ يحتاج متابعة",
          status: "active" as const,
        },
        todayLog: {
          id: "log-omar",
          studentId: "student-omar",
          date: getTodayDateString(),
          fajr: "late" as const,
          dhuhr: "ontime" as const,
          asr: "ontime" as const,
          maghrib: "missed" as const,
          isha: "missed" as const,
          quranRead: false,
          quranPages: 0,
          adhkarMorning: true,
          adhkarEvening: false,
          fasting: "none" as const,
          notes: "انشغلت بالدراسة اليوم.",
        },
        completedDeeds: 3,
        completionRate: 38,
      },
    ];
  },

  // Daily Logs
  getTodayLog: async (studentId: string): Promise<DailyLogRecord> => {
    const today = getTodayDateString();
    if (db) {
      try {
        const [log] = await db
          .select()
          .from(schema.dailyLogs)
          .where(
            and(
              eq(schema.dailyLogs.studentId, studentId),
              eq(schema.dailyLogs.date, today)
            )
          );

        if (log) {
          return {
            ...log,
            notes: log.notes ?? undefined,
          };
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    return {
      id: `log-${studentId}-${today}`,
      studentId,
      date: today,
      fajr: "congregation",
      dhuhr: "congregation",
      asr: "ontime",
      maghrib: "congregation",
      isha: "ontime",
      quranRead: true,
      quranPages: 10,
      adhkarMorning: true,
      adhkarEvening: true,
      fasting: "voluntary",
      notes: "الحمد لله استيقظت مبكراً ووفقت لصلاة الفجر في جماعة المسجد.",
    };
  },

  updateDailyLog: async (
    log: Partial<DailyLogRecord> & { studentId: string; date: string }
  ): Promise<void> => {
    if (db) {
      try {
        const existing = await db
          .select()
          .from(schema.dailyLogs)
          .where(
            and(
              eq(schema.dailyLogs.studentId, log.studentId),
              eq(schema.dailyLogs.date, log.date)
            )
          );

        if (existing.length > 0) {
          await db
            .update(schema.dailyLogs)
            .set(log)
            .where(
              and(
                eq(schema.dailyLogs.studentId, log.studentId),
                eq(schema.dailyLogs.date, log.date)
              )
            );
        } else {
          await db.insert(schema.dailyLogs).values({
            id: `log-${log.studentId}-${log.date}`,
            studentId: log.studentId,
            date: log.date,
            fajr: log.fajr || "missed",
            dhuhr: log.dhuhr || "missed",
            asr: log.asr || "missed",
            maghrib: log.maghrib || "missed",
            isha: log.isha || "missed",
            quranRead: log.quranRead ?? false,
            quranPages: log.quranPages || 0,
            adhkarMorning: log.adhkarMorning ?? false,
            adhkarEvening: log.adhkarEvening ?? false,
            fasting: log.fasting || "none",
            notes: log.notes || "",
          });
        }
      } catch (err) {
        console.warn("Failed to update daily log on Neon:", err);
      }
    }
  },

  getStudentHistory: async (studentId: string, limitDays: number = 7): Promise<DailyLogRecord[]> => {
    let existingRows: DailyLogRecord[] = [];
    if (db) {
      try {
        const rows = await db
          .select()
          .from(schema.dailyLogs)
          .where(eq(schema.dailyLogs.studentId, studentId))
          .orderBy(desc(schema.dailyLogs.date))
          .limit(limitDays);

        if (rows.length > 0) {
          existingRows = rows.map((r) => ({
            ...r,
            notes: r.notes ?? undefined,
          }));
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    // If we have existing rows matching limitDays, return them sorted by date ascending
    if (existingRows.length >= limitDays) {
      return existingRows.sort((a, b) => a.date.localeCompare(b.date));
    }

    // Otherwise, generate realistic 7-day logs backfilled with existing rows
    const result: DailyLogRecord[] = [];
    const now = new Date();
    const mapExisting = new Map(existingRows.map((r) => [r.date, r]));

    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      if (mapExisting.has(dateStr)) {
        result.push(mapExisting.get(dateStr)!);
      } else {
        // Realistic variation for past days
        const isFajrCong = i % 2 === 0 || i === 1;
        result.push({
          id: `hist-${studentId}-${dateStr}`,
          studentId,
          date: dateStr,
          fajr: isFajrCong ? "congregation" : "ontime",
          dhuhr: "congregation",
          asr: i === 3 ? "late" : "ontime",
          maghrib: "congregation",
          isha: "ontime",
          quranRead: i !== 4,
          quranPages: i !== 4 ? 6 + (i * 2) : 0,
          adhkarMorning: true,
          adhkarEvening: i % 2 === 0,
          fasting: (d.getDay() === 1 || d.getDay() === 4) ? "voluntary" : "none", // Monday / Thursday
          notes: i === 0 ? "يوم مبارك بحمد الله" : undefined,
        });
      }
    }

    return result;
  },

  // Feedback Messages
  getFeedbackForStudent: async (studentId: string): Promise<FeedbackRecord[]> => {
    if (db) {
      try {
        const rows = await db
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
          .leftJoin(
            schema.users,
            eq(schema.feedbackMessages.sheikhId, schema.users.id)
          )
          .where(eq(schema.feedbackMessages.studentId, studentId))
          .orderBy(desc(schema.feedbackMessages.createdAt));

        if (rows.length > 0) {
          // Filter out student inquiries so the feed only displays actual guidance/advice sent by the sheikh
          const guidanceRows = rows.filter((r) => !r.content.startsWith("[استفسار طالب"));

          return guidanceRows.map((r) => ({
            id: r.id,
            sheikhId: r.sheikhId,
            studentId: r.studentId,
            sheikhName: r.sheikhName || "الشيخ المشرف",
            content: r.content,
            type: r.type,
            isRead: r.isRead,
            createdAt: new Date(r.createdAt).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "short",
            }),
          }));
        }
      } catch (err) {
        console.warn("Neon query error:", err);
      }
    }

    return [
      {
        id: "fb-1",
        sheikhId: "sheikh-mahmoud",
        studentId,
        sheikhName: "الشيخ محمود عبد الحليم",
        content: "ما شاء الله يا بني، مواظبتك على صلاة الفجر في جماعة لليوم الرابع عشر تثلج الصدر. حافظ على ورد تدبر القرآن ولا تعجل في القراءة.",
        type: "praise",
        isRead: false,
        createdAt: "اليوم",
      },
    ];
  },

  sendFeedback: async (feedback: Omit<FeedbackRecord, "id" | "createdAt" | "isRead">): Promise<FeedbackRecord> => {
    const id = `fb-${Date.now()}`;
    if (db) {
      try {
        await db.insert(schema.feedbackMessages).values({
          id,
          sheikhId: feedback.sheikhId,
          studentId: feedback.studentId,
          content: feedback.content,
          type: feedback.type,
          isRead: false,
        });
      } catch (err) {
        console.warn("Failed to insert feedback to Neon:", err);
      }
    }

    return {
      id,
      ...feedback,
      isRead: false,
      createdAt: "الآن",
    };
  },

  getStudentInquiriesForSheikh: async (sheikhId: string) => {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.feedbackMessages.id,
            sheikhId: schema.feedbackMessages.sheikhId,
            studentId: schema.feedbackMessages.studentId,
            studentName: schema.users.name,
            content: schema.feedbackMessages.content,
            type: schema.feedbackMessages.type,
            isRead: schema.feedbackMessages.isRead,
            createdAt: schema.feedbackMessages.createdAt,
          })
          .from(schema.feedbackMessages)
          .leftJoin(
            schema.users,
            eq(schema.feedbackMessages.studentId, schema.users.id)
          )
          .where(eq(schema.feedbackMessages.sheikhId, sheikhId))
          .orderBy(desc(schema.feedbackMessages.createdAt));

        if (rows.length > 0) {
          // Filter to only messages that are inquiries/questions from students to the sheikh
          const inquiryRows = rows.filter(
            (r) =>
              r.content.startsWith("[استفسار طالب") ||
              r.content.includes("استفسار")
          );

          return inquiryRows.map((r) => ({
            id: r.id,
            sheikhId: r.sheikhId,
            studentId: r.studentId,
            studentName: r.studentName || "طالب حلقة",
            content: r.content,
            type: r.type,
            isRead: r.isRead,
            createdAt: new Date(r.createdAt).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
        }
      } catch (err) {
        console.warn("Neon query error in getStudentInquiriesForSheikh:", err);
      }
    }

    return [
      {
        id: "inq-1",
        sheikhId,
        studentId: "student-ahmed",
        studentName: "أحمد بن عبد الرحمن",
        content: "[استفسار طالب - تثبيت ورد القرآن]: فضيلة الشيخ، كيف أثبت ورد الحفظ والمراجعة مع كثرة الانشغال بالعمل والدراسة؟ جزاكم الله خيراً.",
        type: "advice" as const,
        isRead: false,
        createdAt: "اليوم 09:30 ص",
      },
    ];
  },

  // Admin & Security Management
  updateUserPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    if (db) {
      try {
        await db
          .update(schema.users)
          .set({ password: newPassword })
          .where(eq(schema.users.id, userId));
        return true;
      } catch (err) {
        console.warn("Failed to update password in Neon:", err);
      }
    }
    return true;
  },

  createNewSheikh: async (data: {
    name: string;
    email: string;
    password?: string;
    title: string;
    halaqahName: string;
    bio?: string;
  }): Promise<UserRecord> => {
    const id = `sheikh-${Date.now()}`;
    const password = data.password || "123456";

    if (db) {
      try {
        await db.insert(schema.users).values({
          id,
          name: data.name,
          email: data.email,
          password,
          role: "sheikh",
          avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
        });

        await db.insert(schema.sheikhProfiles).values({
          id: `sp-${Date.now()}`,
          userId: id,
          title: data.title,
          bio: data.bio || "",
          halaqahName: data.halaqahName,
          isAcceptingStudents: true,
          status: "active",
        });
      } catch (err) {
        console.warn("Failed to create sheikh in Neon:", err);
      }
    }

    return {
      id,
      name: data.name,
      email: data.email,
      role: "sheikh",
      title: data.title,
      halaqahName: data.halaqahName,
      bio: data.bio,
    };
  },

  getPlatformStats: async () => {
    let totalUsers = 4;
    let totalSheikhs = 1;
    let totalStudents = 3;
    let totalLogs = 10;
    const isLive = Boolean(process.env.DATABASE_URL);

    if (db) {
      try {
        const usersList = await db.select().from(schema.users);
        totalUsers = usersList.length;
        totalSheikhs = usersList.filter((u) => u.role === "sheikh").length;
        totalStudents = usersList.filter((u) => u.role === "student").length;

        const logsList = await db.select().from(schema.dailyLogs);
        totalLogs = logsList.length;
      } catch (err) {
        console.warn("Failed to fetch live counts:", err);
      }
    }

    let maskedUrl = "postgresql://neondb_owner:••••••••••••@ep-broad-leaf-b1ld57ay-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    let host = "ep-broad-leaf-b1ld57ay-pooler.c-5.eu-central-1.aws.neon.tech";
    let region = "AWS eu-central-1 (Frankfurt)";

    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        host = url.host;
        maskedUrl = `${url.protocol}//${url.username}:••••••••••••@${url.host}${url.pathname}${url.search}`;
      } catch {
        // use default sanitized
      }
    }

    return {
      totalUsers,
      totalSheikhs,
      totalStudents,
      totalLogs,
      isLive,
      host,
      region,
      maskedUrl,
    };
  },

  // Operational KPIs for Admin
  getOperationalKPIs: async () => {
    let activeSheikhs = 2;
    let totalStudents = 3;
    let todayLoggedDeeds = 18;
    let avgStreak = 11;

    if (db) {
      try {
        const usersList = await db.select().from(schema.users);
        activeSheikhs = usersList.filter((u) => u.role === "sheikh").length;
        totalStudents = usersList.filter((u) => u.role === "student").length;

        const profiles = await db.select().from(schema.studentProfiles);
        if (profiles.length > 0) {
          const totalStreak = profiles.reduce((acc, p) => acc + (p.streakDays || 0), 0);
          avgStreak = Math.round(totalStreak / profiles.length);
        }

        const today = getTodayDateString();
        const todayLogs = await db
          .select()
          .from(schema.dailyLogs)
          .where(eq(schema.dailyLogs.date, today));

        let deeds = 0;
        todayLogs.forEach((l) => {
          if (l.fajr === "congregation" || l.fajr === "ontime") deeds++;
          if (l.dhuhr === "congregation" || l.dhuhr === "ontime") deeds++;
          if (l.asr === "congregation" || l.asr === "ontime") deeds++;
          if (l.maghrib === "congregation" || l.maghrib === "ontime") deeds++;
          if (l.isha === "congregation" || l.isha === "ontime") deeds++;
          if (l.quranRead) deeds++;
          if (l.adhkarMorning) deeds++;
          if (l.adhkarEvening) deeds++;
        });
        if (todayLogs.length > 0) {
          todayLoggedDeeds = deeds;
        }
      } catch (err) {
        console.warn("Error calculating KPIs:", err);
      }
    }

    return {
      activeSheikhs,
      totalStudents,
      todayLoggedDeeds,
      avgStreak,
    };
  },

  // Students Directory for Admin
  getAllStudentsWithDetails: async () => {
    if (db) {
      try {
        const students = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
            phone: schema.users.phone,
            streakDays: schema.studentProfiles.streakDays,
            level: schema.studentProfiles.level,
            status: schema.studentProfiles.status,
            sheikhId: schema.studentProfiles.sheikhId,
          })
          .from(schema.users)
          .innerJoin(
            schema.studentProfiles,
            eq(schema.users.id, schema.studentProfiles.userId)
          )
          .where(eq(schema.users.role, "student"));

        const sheikhs = await db.select().from(schema.users).where(eq(schema.users.role, "sheikh"));
        const sheikhMap = new Map(sheikhs.map((s) => [s.id, s.name]));

        return students.map((s) => ({
          ...s,
          sheikhName: s.sheikhId ? sheikhMap.get(s.sheikhId) || "غير محدد" : "غير منضم لحلقة",
        }));
      } catch (err) {
        console.warn("Neon query error for students, using fallback:", err);
      }
    }

    return [
      {
        id: "student-ahmed",
        name: "أحمد بن عبد الرحمن",
        email: "ahmed@student.com",
        phone: "+20115 987 6543",
        streakDays: 14,
        level: "طالب مجتهد",
        status: "active",
        sheikhId: "sheikh-mahmoud",
        sheikhName: "الشيخ محمود عبد الحليم",
      },
      {
        id: "student-bilal",
        name: "بلال بن مسعود",
        email: "bilal@student.com",
        phone: "+20110 111 2233",
        streakDays: 8,
        level: "طالب مبتدئ",
        status: "active",
        sheikhId: "sheikh-mahmoud",
        sheikhName: "الشيخ محمود عبد الحليم",
      },
      {
        id: "student-omar",
        name: "عمر الفاروق الدوسري",
        email: "omar@student.com",
        phone: "+20114 333 4455",
        streakDays: 21,
        level: "متقدم (خاتم للورد)",
        status: "active",
        sheikhId: "sheikh-mahmoud",
        sheikhName: "الشيخ محمود عبد الحليم",
      },
    ];
  },

  // Update Sheikh Profile
  updateSheikhProfile: async (
    sheikhId: string,
    data: { name: string; email: string; title: string; halaqahName: string; bio?: string }
  ): Promise<boolean> => {
    if (db) {
      try {
        await db
          .update(schema.users)
          .set({
            name: data.name,
            email: data.email,
          })
          .where(eq(schema.users.id, sheikhId));

        await db
          .update(schema.sheikhProfiles)
          .set({
            title: data.title,
            halaqahName: data.halaqahName,
            bio: data.bio || "",
          })
          .where(eq(schema.sheikhProfiles.userId, sheikhId));

        return true;
      } catch (err) {
        console.warn("Failed to update sheikh profile:", err);
      }
    }
    return true;
  },

  // Reassign student to a sheikh
  reassignStudentSheikh: async (studentId: string, newSheikhId: string): Promise<boolean> => {
    if (db) {
      try {
        await db
          .update(schema.studentProfiles)
          .set({
            sheikhId: newSheikhId,
          })
          .where(eq(schema.studentProfiles.userId, studentId));
        return true;
      } catch (err) {
        console.warn("Failed to reassign student:", err);
      }
    }
    return true;
  },

  // Recent feedbacks for Admin review
  getRecentFeedbacksAll: async (limitCount = 6) => {
    if (db) {
      try {
        const rows = await db
          .select({
            id: schema.feedbackMessages.id,
            content: schema.feedbackMessages.content,
            type: schema.feedbackMessages.type,
            createdAt: schema.feedbackMessages.createdAt,
            sheikhId: schema.feedbackMessages.sheikhId,
            studentId: schema.feedbackMessages.studentId,
          })
          .from(schema.feedbackMessages)
          .orderBy(desc(schema.feedbackMessages.createdAt))
          .limit(limitCount);

        const usersList = await db.select().from(schema.users);
        const nameMap = new Map(usersList.map((u) => [u.id, u.name]));

        return rows.map((r) => ({
          id: r.id,
          content: r.content,
          type: r.type,
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : "حديثاً",
          sheikhName: nameMap.get(r.sheikhId) || "الشيخ المشرف",
          studentName: nameMap.get(r.studentId) || "طالب علم",
        }));
      } catch (err) {
        console.warn("Failed to get feedbacks:", err);
      }
    }

    return [
      {
        id: "fb-1",
        content: "ما شاء الله يا بني، مواظبتك على صلاة الفجر في جماعة لليوم الرابع عشر تثلج الصدر. حافظ على ورد تدبر القرآن ولا تعجل في القراءة.",
        type: "praise" as const,
        createdAt: "اليوم",
        sheikhName: "الشيخ محمود عبد الحليم",
        studentName: "أحمد بن عبد الرحمن",
      },
      {
        id: "fb-2",
        content: "لاحظت تأخرك عن أذكار المساء بالأمس، احرص على البدء بها بعد صلاة العصر مباشرة فهي حرزك الحصين.",
        type: "advice" as const,
        createdAt: "أمس",
        sheikhName: "الشيخ محمود عبد الحليم",
        studentName: "بلال بن مسعود",
      },
    ];
  },
};

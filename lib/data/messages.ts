import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, desc, inArray, isNull, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { formatTimestamp } from "../dates";
import type { FeedbackRecord } from "./types";

export const messageQueries = {
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
        and(
          eq(schema.feedbackMessages.studentId, studentId),
          eq(schema.feedbackMessages.kind, "guidance"),
          // Replies are shown under their question instead
          isNull(schema.feedbackMessages.replyToId)
        )
      )
      .orderBy(desc(schema.feedbackMessages.createdAt));

    return rows.map((r) => ({
      ...r,
      sheikhName: r.sheikhName || "الشيخ المشرف",
      createdAt: formatTimestamp(r.createdAt, { day: "numeric", month: "short" }),
    }));
  },

  sendFeedback: async (
    feedback: Omit<FeedbackRecord, "id" | "createdAt" | "isRead">,
    replyToId?: string
  ): Promise<void> => {
    await getDb().insert(schema.feedbackMessages).values({
      id: `fb-${crypto.randomUUID()}`,
      sheikhId: feedback.sheikhId,
      studentId: feedback.studentId,
      content: feedback.content,
      type: feedback.type,
      kind: "guidance",
      replyToId: replyToId ?? null,
    });
  },

  // Used to authorize a reply: the question must exist and belong to this sheikh/student pair
  getQuestion: async (questionId: string) => {
    const [row] = await getDb()
      .select({
        id: schema.feedbackMessages.id,
        sheikhId: schema.feedbackMessages.sheikhId,
        studentId: schema.feedbackMessages.studentId,
        kind: schema.feedbackMessages.kind,
      })
      .from(schema.feedbackMessages)
      .where(eq(schema.feedbackMessages.id, questionId));
    return row?.kind === "question" ? row : undefined;
  },

  // The student's questions with the sheikh's replies, newest first
  getQuestionThreadsForStudent: async (studentId: string) => {
    const db = getDb();
    const questions = await db
      .select()
      .from(schema.feedbackMessages)
      .where(and(eq(schema.feedbackMessages.studentId, studentId), eq(schema.feedbackMessages.kind, "question")))
      .orderBy(desc(schema.feedbackMessages.createdAt));
    if (questions.length === 0) return [];

    const replies = await db
      .select()
      .from(schema.feedbackMessages)
      .where(inArray(schema.feedbackMessages.replyToId, questions.map((q) => q.id)))
      .orderBy(schema.feedbackMessages.createdAt);

    const format = (d: Date) => formatTimestamp(d, { day: "numeric", month: "short" });
    return questions.map((q) => ({
      id: q.id,
      content: q.content,
      category: q.category ?? undefined,
      createdAt: format(q.createdAt),
      replies: replies
        .filter((r) => r.replyToId === q.id)
        .map((r) => ({ id: r.id, content: r.content, isRead: r.isRead, createdAt: format(r.createdAt) })),
    }));
  },

  // Unread guidance and replies from the sheikh
  countUnreadForStudent: async (studentId: string): Promise<number> => {
    const [row] = await getDb()
      .select({ value: count() })
      .from(schema.feedbackMessages)
      .where(
        and(
          eq(schema.feedbackMessages.studentId, studentId),
          eq(schema.feedbackMessages.kind, "guidance"),
          eq(schema.feedbackMessages.isRead, false)
        )
      );
    return row?.value ?? 0;
  },

  // Student questions to this sheikh that have no reply yet
  countUnansweredForSheikh: async (sheikhId: string): Promise<number> => {
    const replies = alias(schema.feedbackMessages, "replies");
    const [row] = await getDb()
      .select({ value: count() })
      .from(schema.feedbackMessages)
      .leftJoin(replies, eq(replies.replyToId, schema.feedbackMessages.id))
      .where(
        and(
          eq(schema.feedbackMessages.sheikhId, sheikhId),
          eq(schema.feedbackMessages.kind, "question"),
          isNull(replies.id)
        )
      );
    return row?.value ?? 0;
  },

  markGuidanceReadForStudent: async (studentId: string): Promise<void> => {
    await getDb()
      .update(schema.feedbackMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.feedbackMessages.studentId, studentId),
          eq(schema.feedbackMessages.kind, "guidance"),
          eq(schema.feedbackMessages.isRead, false)
        )
      );
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

    const answeredIds = new Set<string>();
    if (rows.length > 0) {
      const replies = await getDb()
        .select({ replyToId: schema.feedbackMessages.replyToId })
        .from(schema.feedbackMessages)
        .where(inArray(schema.feedbackMessages.replyToId, rows.map((r) => r.id)));
      replies.forEach((r) => r.replyToId && answeredIds.add(r.replyToId));
    }

    // Unanswered questions first, newest first within each group
    const sorted = [...rows].sort((a, b) => Number(answeredIds.has(a.id)) - Number(answeredIds.has(b.id)));
    return sorted.map((r) => ({
      ...r,
      answered: answeredIds.has(r.id),
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
      // Replies to private student questions stay out of the admin feed
      .where(and(eq(schema.feedbackMessages.kind, "guidance"), isNull(schema.feedbackMessages.replyToId)))
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

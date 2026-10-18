import "server-only";

import { getDb, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
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

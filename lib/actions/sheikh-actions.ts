"use server";

import { revalidatePath } from "next/cache";
import { dataService } from "../data-service";
import { getSession } from "../auth";
import { cleanText, FEEDBACK_TYPES, isOneOf, MAX_MESSAGE_LENGTH, SAVE_ERROR_MESSAGE } from "../validation";

export async function chooseSheikhAction(sheikhId: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  // Students may only join approved sheikhs
  const activeSheikhs = await dataService.getAllSheikhs();
  if (!activeSheikhs.some((s) => s.id === sheikhId)) {
    return { error: "هذا الشيخ غير متاح حالياً" };
  }

  try {
    await dataService.assignSheikhToStudent(session.id, sheikhId);
  } catch (err) {
    console.error("Failed to assign sheikh:", err);
    return { error: SAVE_ERROR_MESSAGE };
  }
  revalidatePath("/student");
  revalidatePath("/sheikh");
  return { success: true };
}

export async function sendFeedbackAction(
  studentId: string,
  content: string,
  type: "praise" | "advice" | "warning" | "general" = "general",
  replyToId?: string
) {
  const session = await getSession();
  if (!session || session.role !== "sheikh") {
    return { error: "غير مصرح، فقط المشرف أو الشيخ يمكنه إرسال التوجيهات" };
  }

  const text = cleanText(content, MAX_MESSAGE_LENGTH);
  if (!text) {
    return { error: "لا يمكن إرسال رسالة فارغة أو طويلة جداً" };
  }

  if (!isOneOf(FEEDBACK_TYPES, type)) {
    return { error: "نوع التوجيه غير صالح" };
  }

  // A sheikh can only message students in their own halaqah
  if (!(await dataService.isStudentOfSheikh(studentId, session.id))) {
    return { error: "هذا الطالب ليس من طلاب حلقتك" };
  }

  // A reply must answer a question this student sent to this sheikh
  if (replyToId) {
    const question = await dataService.getQuestion(replyToId);
    if (!question || question.sheikhId !== session.id || question.studentId !== studentId) {
      return { error: "السؤال غير موجود" };
    }
  }

  const sheikhUser = await dataService.getUserById(session.id);
  const sheikhName = sheikhUser?.name || "الشيخ المشرف";

  try {
    await dataService.sendFeedback(
      {
        sheikhId: session.id,
        studentId,
        sheikhName,
        content: text,
        type,
      },
      replyToId
    );
  } catch (err) {
    console.error("Failed to send feedback:", err);
    return { error: SAVE_ERROR_MESSAGE };
  }

  revalidatePath("/sheikh");
  revalidatePath(`/sheikh/students/${studentId}`);
  revalidatePath("/student");
  return { success: true };
}

export async function broadcastSheikhMessageAction(
  content: string,
  type: "praise" | "advice" | "warning" | "general" = "advice"
) {
  const session = await getSession();
  if (!session || session.role !== "sheikh") {
    return { error: "غير مصرح" };
  }

  const text = cleanText(content, MAX_MESSAGE_LENGTH);
  if (!text) {
    return { error: "لا يمكن إرسال رسالة فارغة أو طويلة جداً" };
  }

  if (!isOneOf(FEEDBACK_TYPES, type)) {
    return { error: "نوع التوجيه غير صالح" };
  }

  const sheikhUser = await dataService.getUserById(session.id);
  const sheikhName = sheikhUser?.name || "الشيخ المربي";
  const students = await dataService.getStudentsForSheikh(session.id);

  if (students.length === 0) {
    return { error: "لا يوجد طلاب منضمون لحلقتك حالياً" };
  }

  try {
    await Promise.all(
      students.map((st) =>
        dataService.sendFeedback({
          sheikhId: session.id,
          studentId: st.id,
          sheikhName,
          content: `[توجيه عام للحلقة]: ${text}`,
          type,
        })
      )
    );
  } catch (err) {
    console.error("Failed to broadcast message:", err);
    return { error: SAVE_ERROR_MESSAGE };
  }

  revalidatePath("/sheikh");
  revalidatePath("/student");
  return { success: true, count: students.length };
}

"use server";

import { revalidatePath } from "next/cache";
import { dataService } from "../data-service";
import { getSession } from "../auth";
import { cleanText, FEEDBACK_TYPES, isOneOf, MAX_MESSAGE_LENGTH } from "../validation";

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

  await dataService.assignSheikhToStudent(session.id, sheikhId);
  revalidatePath("/student");
  revalidatePath("/sheikh");
  return { success: true };
}

export async function sendFeedbackAction(
  studentId: string,
  content: string,
  type: "praise" | "advice" | "warning" | "general" = "general"
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

  const sheikhUser = await dataService.getUserById(session.id);
  const sheikhName = sheikhUser?.name || "الشيخ المشرف";

  await dataService.sendFeedback({
    sheikhId: session.id,
    studentId,
    sheikhName,
    content: text,
    type,
  });

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

  await Promise.all(
    students.map((st) =>
      dataService.sendFeedback({
        sheikhId: session.id,
        studentId: st.id || st.profile.userId,
        sheikhName,
        content: `[توجيه عام للحلقة]: ${text}`,
        type,
      })
    )
  );

  revalidatePath("/sheikh");
  revalidatePath("/student");
  return { success: true, count: students.length };
}

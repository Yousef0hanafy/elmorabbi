"use server";

import { revalidatePath } from "next/cache";
import { dataService } from "../data-service";
import { getSession } from "../auth";

export async function chooseSheikhAction(sheikhId: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
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

  if (!content.trim()) {
    return { error: "لا يمكن إرسال رسالة فارغة" };
  }

  const sheikhUser = await dataService.getUserById(session.id);
  const sheikhName = sheikhUser?.name || "الشيخ المشرف";

  await dataService.sendFeedback({
    sheikhId: session.id,
    studentId,
    sheikhName,
    content,
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

  if (!content.trim()) {
    return { error: "لا يمكن إرسال رسالة فارغة" };
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
        content: `[توجيه عام للحلقة]: ${content.trim()}`,
        type,
      })
    )
  );

  revalidatePath("/sheikh");
  revalidatePath("/student");
  return { success: true, count: students.length };
}

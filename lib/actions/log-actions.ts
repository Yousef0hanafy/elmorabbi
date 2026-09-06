"use server";

import { revalidatePath } from "next/cache";
import { dataService } from "../data-service";
import { getSession } from "../auth";

export async function updatePrayerAction(
  prayerName: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
  status: "congregation" | "ontime" | "late" | "missed"
) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    [prayerName]: status,
  });

  revalidatePath("/student");
  return { success: true };
}

export async function updateQuranAction(read: boolean, pages: number) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    quranRead: read,
    quranPages: pages,
  });

  revalidatePath("/student");
  return { success: true };
}

export async function updateAdhkarAction(type: "morning" | "evening", completed: boolean) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    [type === "morning" ? "adhkarMorning" : "adhkarEvening"]: completed,
  });

  revalidatePath("/student");
  return { success: true };
}

export async function updateNotesAction(notes: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    notes,
  });

  revalidatePath("/student");
  return { success: true };
}

export async function updateFastingAction(status: "none" | "voluntary" | "fard") {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    fasting: status,
  });

  revalidatePath("/student");
  return { success: true };
}

export async function sendStudentQuestionAction(content: string, category: string = "general") {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const profile = await dataService.getStudentProfile(session.id);
  const sheikhId = profile?.sheikhId || "sheikh-mahmoud";

  await dataService.sendFeedback({
    sheikhId,
    studentId: session.id,
    sheikhName: session.name || "الطالب",
    content: `[استفسار طالب - ${category}]: ${content}`,
    type: "advice",
  });

  revalidatePath("/student");
  revalidatePath("/sheikh");
  return { success: true };
}

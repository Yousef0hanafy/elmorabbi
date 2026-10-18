"use server";

import { revalidatePath } from "next/cache";
import { dataService } from "../data-service";
import { getSession } from "../auth";
import {
  cleanText,
  FASTING_STATUSES,
  isOneOf,
  MAX_MESSAGE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_QURAN_PAGES,
  PRAYER_KEYS,
  PRAYER_STATUSES,
} from "../validation";

export async function updatePrayerAction(
  prayerName: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
  status: "congregation" | "ontime" | "late" | "missed"
) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  // prayerName becomes a column key, so it must be strictly whitelisted
  if (!isOneOf(PRAYER_KEYS, prayerName) || !isOneOf(PRAYER_STATUSES, status)) {
    return { error: "قيمة غير صالحة" };
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

  if (typeof read !== "boolean" || !Number.isInteger(pages) || pages < 0 || pages > MAX_QURAN_PAGES) {
    return { error: "قيمة غير صالحة" };
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

  if ((type !== "morning" && type !== "evening") || typeof completed !== "boolean") {
    return { error: "قيمة غير صالحة" };
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

  // Empty notes are allowed (clearing the note)
  if (typeof notes !== "string" || notes.length > MAX_NOTES_LENGTH) {
    return { error: "الملاحظة طويلة جداً" };
  }

  const todayLog = await dataService.getTodayLog(session.id);
  await dataService.updateDailyLog({
    studentId: session.id,
    date: todayLog.date,
    notes: notes.trim(),
  });

  revalidatePath("/student");
  return { success: true };
}

export async function updateFastingAction(status: "none" | "voluntary" | "fard") {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  if (!isOneOf(FASTING_STATUSES, status)) {
    return { error: "قيمة غير صالحة" };
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

  const text = cleanText(content, MAX_MESSAGE_LENGTH);
  const cleanCategory = cleanText(category, 60) ?? "general";
  if (!text) {
    return { error: "لا يمكن إرسال رسالة فارغة أو طويلة جداً" };
  }

  const profile = await dataService.getStudentProfile(session.id);
  const sheikhId = profile?.sheikhId;
  if (!sheikhId) {
    return { error: "يجب اختيار الشيخ المشرف أولاً قبل إرسال سؤالك" };
  }

  await dataService.sendFeedback({
    sheikhId,
    studentId: session.id,
    sheikhName: session.name || "الطالب",
    content: `[استفسار طالب - ${cleanCategory}]: ${text}`,
    type: "advice",
  });

  revalidatePath("/student");
  revalidatePath("/sheikh");
  return { success: true };
}

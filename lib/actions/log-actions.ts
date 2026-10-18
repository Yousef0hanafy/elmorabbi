"use server";

import { revalidatePath } from "next/cache";
import { dataService, DailyLogRecord } from "../data-service";
import { getSession } from "../auth";
import { todayDateString } from "../dates";
import {
  cleanText,
  FASTING_STATUSES,
  isOneOf,
  MAX_MESSAGE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_QURAN_PAGES,
  PRAYER_KEYS,
  PRAYER_STATUSES,
  SAVE_ERROR_MESSAGE,
} from "../validation";

// Writes one field group of today's log; failures are reported to the caller, never swallowed
async function saveToday(studentId: string, changes: Partial<DailyLogRecord>) {
  try {
    await dataService.updateDailyLog({ studentId, date: todayDateString(), ...changes });
  } catch (err) {
    console.error("Failed to update daily log:", err);
    return { error: SAVE_ERROR_MESSAGE };
  }
  revalidatePath("/student");
  return { success: true };
}

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

  return saveToday(session.id, {
    [prayerName]: status,
  });
}

export async function updateQuranAction(read: boolean, pages: number) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  if (typeof read !== "boolean" || !Number.isInteger(pages) || pages < 0 || pages > MAX_QURAN_PAGES) {
    return { error: "قيمة غير صالحة" };
  }

  return saveToday(session.id, {
    quranRead: read,
    quranPages: pages,
  });
}

export async function updateAdhkarAction(type: "morning" | "evening", completed: boolean) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  if ((type !== "morning" && type !== "evening") || typeof completed !== "boolean") {
    return { error: "قيمة غير صالحة" };
  }

  return saveToday(session.id, {
    [type === "morning" ? "adhkarMorning" : "adhkarEvening"]: completed,
  });
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

  return saveToday(session.id, {
    notes: notes.trim(),
  });
}

export async function updateFastingAction(status: "none" | "voluntary" | "fard") {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  if (!isOneOf(FASTING_STATUSES, status)) {
    return { error: "قيمة غير صالحة" };
  }

  return saveToday(session.id, {
    fasting: status,
  });
}

export async function sendStudentQuestionAction(content: string, category: string = "general") {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "غير مصرح" };
  }

  const text = cleanText(content, MAX_MESSAGE_LENGTH);
  const cleanCategory = cleanText(category, 60) ?? "عام";
  if (!text) {
    return { error: "لا يمكن إرسال رسالة فارغة أو طويلة جداً" };
  }

  const profile = await dataService.getStudentProfile(session.id);
  const sheikhId = profile?.sheikhId;
  if (!sheikhId) {
    return { error: "يجب اختيار الشيخ المشرف أولاً قبل إرسال سؤالك" };
  }

  try {
    await dataService.sendStudentQuestion({
      sheikhId,
      studentId: session.id,
      content: text,
      category: cleanCategory,
    });
  } catch (err) {
    console.error("Failed to send student question:", err);
    return { error: SAVE_ERROR_MESSAGE };
  }

  revalidatePath("/student");
  revalidatePath("/sheikh");
  return { success: true };
}

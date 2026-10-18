// Shapes returned by the data layer; safe to import as types from client components

import type { PrayerStatus } from "../validation";

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
  fajr: PrayerStatus;
  dhuhr: PrayerStatus;
  asr: PrayerStatus;
  maghrib: PrayerStatus;
  isha: PrayerStatus;
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

import type { PrayerKey, PrayerStatus, FastingStatus } from "./validation";

// Shared Arabic labels and badge styles, safe for client and server code

export const PRAYERS: { key: PrayerKey; name: string }[] = [
  { key: "fajr", name: "الفجر" },
  { key: "dhuhr", name: "الظهر" },
  { key: "asr", name: "العصر" },
  { key: "maghrib", name: "المغرب" },
  { key: "isha", name: "العشاء" },
];

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  pending: "لم يُسجَّل",
  congregation: "جماعة",
  ontime: "في وقتها",
  late: "قضاء",
  missed: "فائتة",
};

export const PRAYER_STATUS_BADGE: Record<PrayerStatus, string> = {
  pending: "bg-slate-100 text-slate-500",
  congregation: "bg-emerald-100 text-emerald-800",
  ontime: "bg-teal-100 text-teal-800",
  late: "bg-amber-100 text-amber-800",
  missed: "bg-rose-100 text-rose-800",
};

export const FASTING_LABELS: Record<FastingStatus, string> = {
  none: "مُفطر",
  voluntary: "صائم تطوعاً",
  fard: "صائم فرضاً",
};

export const FEEDBACK_TYPE_LABELS: Record<"praise" | "advice" | "warning" | "general", string> = {
  praise: "ثناء وتشجيع",
  advice: "نصيحة وتوجيه",
  warning: "تنبيه أخوي",
  general: "توجيه عام",
};

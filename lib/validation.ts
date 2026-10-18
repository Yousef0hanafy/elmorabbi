// Shared input rules, safe to import from client and server code

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NOTES_LENGTH = 2000;
export const MAX_QURAN_PAGES = 604;

export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export const PRAYER_STATUSES = ["congregation", "ontime", "late", "missed"] as const;
export const FASTING_STATUSES = ["none", "voluntary", "fard"] as const;
export const FEEDBACK_TYPES = ["praise", "advice", "warning", "general"] as const;

export type PrayerKey = (typeof PRAYER_KEYS)[number];
export type PrayerStatus = (typeof PRAYER_STATUSES)[number];
export type FastingStatus = (typeof FASTING_STATUSES)[number];
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

// Returns the trimmed text when it is non-empty and within the limit, otherwise null
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

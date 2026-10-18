// All "days" in the app are calendar days in Egypt, stored as YYYY-MM-DD strings.
// Safe to import from client and server code.

export const APP_TIME_ZONE = "Africa/Cairo";

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayDateString(now: Date = new Date()): string {
  const parts = Object.fromEntries(dayFormatter.formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Date-only strings are handled in UTC so no local offset can shift the day
const toUtcDate = (date: string) => new Date(`${date}T00:00:00Z`);

export function addDays(date: string, days: number): string {
  const d = toUtcDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 0 = Sunday ... 6 = Saturday
export function weekdayOf(date: string): number {
  return toUtcDate(date).getUTCDay();
}

export function formatDay(date: string, options: Intl.DateTimeFormatOptions): string {
  return toUtcDate(date).toLocaleDateString("ar-EG", { ...options, timeZone: "UTC" });
}

export function formatTimestamp(value: Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleString("ar-EG", { ...options, timeZone: APP_TIME_ZONE });
}

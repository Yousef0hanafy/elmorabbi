import type { DailyLogRecord } from "./data/types";
import { addDays } from "./dates";

// Single source of truth for how a day's deeds are counted. Safe for client and server.

export const TOTAL_DAILY_DEEDS = 8;
const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

type PrayerFields = Pick<DailyLogRecord, (typeof PRAYERS)[number]>;
type DeedFields = PrayerFields & Pick<DailyLogRecord, "quranRead" | "adhkarMorning" | "adhkarEvening">;

const isOnTime = (status: DailyLogRecord["fajr"]) => status === "congregation" || status === "ontime";

export function countOnTimePrayers(log: PrayerFields | undefined): number {
  if (!log) return 0;
  return PRAYERS.filter((p) => isOnTime(log[p])).length;
}

export function countCompletedDeeds(log: DeedFields | undefined): number {
  if (!log) return 0;
  return (
    countOnTimePrayers(log) +
    (log.quranRead ? 1 : 0) +
    (log.adhkarMorning ? 1 : 0) +
    (log.adhkarEvening ? 1 : 0)
  );
}

export function completionRate(log: DeedFields | undefined): number {
  return Math.round((countCompletedDeeds(log) / TOTAL_DAILY_DEEDS) * 100);
}

// A day counts toward the streak when all five prayers were prayed (late counts, missed does not)
export function qualifiesForStreak(log: PrayerFields): boolean {
  return PRAYERS.every((p) => log[p] !== "missed");
}

// Consecutive qualifying days ending today; if today is not complete yet, the streak
// still stands as long as yesterday qualified
export function computeStreak(qualifyingDates: Set<string>, today: string): number {
  let day = qualifyingDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (qualifyingDates.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function emptyDailyLog(studentId: string, date: string): DailyLogRecord {
  return {
    id: `log-${studentId}-${date}`,
    studentId,
    date,
    fajr: "missed",
    dhuhr: "missed",
    asr: "missed",
    maghrib: "missed",
    isha: "missed",
    quranRead: false,
    quranPages: 0,
    adhkarMorning: false,
    adhkarEvening: false,
    fasting: "none",
    notes: undefined,
  };
}

// Shown to the sheikh as "needs follow-up": nothing logged today, Fajr missed or late,
// or less than half of today's deeds done
export function needsFollowUp(todayLog: DeedFields | undefined): boolean {
  return (
    !todayLog ||
    todayLog.fajr === "missed" ||
    todayLog.fajr === "late" ||
    completionRate(todayLog) < 50
  );
}

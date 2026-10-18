import { test } from "node:test";
import assert from "node:assert/strict";
import {
  completionRate,
  computeAlerts,
  computeStreak,
  countCompletedDeeds,
  emptyDailyLog,
  hasLoggedAnything,
  needsAttention,
  needsFollowUp,
  qualifiesForStreak,
} from "../../lib/scoring";
import type { DailyLogRecord } from "../../lib/data-service";

const TODAY = "2026-10-18";
const log = (date: string, changes: Partial<DailyLogRecord> = {}): DailyLogRecord => ({
  ...emptyDailyLog("s1", date),
  ...changes,
});
const allPrayed = { fajr: "congregation", dhuhr: "ontime", asr: "late", maghrib: "congregation", isha: "ontime" } as const;

test("a new day is empty and counts nothing", () => {
  const empty = emptyDailyLog("s1", TODAY);
  assert.equal(empty.fajr, "pending");
  assert.equal(countCompletedDeeds(empty), 0);
  assert.equal(hasLoggedAnything(empty), false);
});

test("deeds count on-time prayers, Quran and both adhkar", () => {
  const l = log(TODAY, { ...allPrayed, quranRead: true, adhkarMorning: true });
  // 4 on-time prayers (late/qada does not count as on time) + Quran + morning adhkar
  assert.equal(countCompletedDeeds(l), 6);
  assert.equal(completionRate(l), 75);
});

test("streak days require all five prayers prayed; qada counts, pending and missed do not", () => {
  assert.equal(qualifiesForStreak(log(TODAY, allPrayed)), true);
  assert.equal(qualifiesForStreak(log(TODAY, { ...allPrayed, isha: "pending" })), false);
  assert.equal(qualifiesForStreak(log(TODAY, { ...allPrayed, isha: "missed" })), false);
});

test("streak counts back from today, or from yesterday while today is incomplete", () => {
  const days = new Set(["2026-10-15", "2026-10-16", "2026-10-17"]);
  assert.equal(computeStreak(days, TODAY), 3);
  assert.equal(computeStreak(new Set([...days, TODAY]), TODAY), 4);
  // A gap two days ago breaks the chain
  assert.equal(computeStreak(new Set(["2026-10-15", "2026-10-17"]), TODAY), 1);
  assert.equal(computeStreak(new Set(), TODAY), 0);
});

test("follow-up: missed prayers or Fajr qada, never prayers not logged yet", () => {
  assert.equal(needsFollowUp(undefined), false);
  assert.equal(needsFollowUp(log(TODAY)), false);
  assert.equal(needsFollowUp(log(TODAY, { dhuhr: "missed" })), true);
  assert.equal(needsFollowUp(log(TODAY, { fajr: "late" })), true);
  assert.equal(needsFollowUp(log(TODAY, { asr: "late" })), false);
});

test("alerts: Fajr missed or qada three days running", () => {
  const recent = ["2026-10-15", "2026-10-16", "2026-10-17"].map((d, i) =>
    log(d, { ...allPrayed, fajr: i === 0 ? "late" : "missed" })
  );
  assert.deepEqual(computeAlerts(recent, TODAY, undefined, "2026-01-01"), ["fajr_3_days"]);
  // One good Fajr in the window clears it
  recent[1] = log("2026-10-16", allPrayed);
  assert.deepEqual(computeAlerts(recent, TODAY, undefined, "2026-01-01"), []);
});

test("alerts: inactive for three days, but not for accounts that just joined", () => {
  assert.deepEqual(computeAlerts([], TODAY, undefined, "2026-01-01"), ["inactive_3_days"]);
  assert.deepEqual(computeAlerts([], TODAY, undefined, TODAY), []);
  // Logging anything today means not inactive
  assert.deepEqual(computeAlerts([], TODAY, log(TODAY, { quranRead: true }), "2026-01-01"), []);
});

test("needsAttention combines today's state and alerts", () => {
  assert.equal(needsAttention({ todayLog: undefined, alerts: [] }), false);
  assert.equal(needsAttention({ todayLog: undefined, alerts: ["inactive_3_days"] }), true);
});

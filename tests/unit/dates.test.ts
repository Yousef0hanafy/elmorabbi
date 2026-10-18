import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, todayDateString, weekdayOf } from "../../lib/dates";

test("todayDateString uses the Cairo calendar day, not UTC", () => {
  // 22:30 UTC on Oct 17 is already Oct 18 in Cairo (UTC+3 in summer time, UTC+2 in winter)
  assert.equal(todayDateString(new Date("2026-10-17T22:30:00Z")), "2026-10-18");
  // Midday UTC is the same day in both
  assert.equal(todayDateString(new Date("2026-10-17T12:00:00Z")), "2026-10-17");
});

test("addDays crosses month and year boundaries", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
});

test("weekdayOf is independent of the machine time zone", () => {
  assert.equal(weekdayOf("2026-10-19"), 1); // Monday
  assert.equal(weekdayOf("2026-10-22"), 4); // Thursday
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanText, isOneOf, isValidPassword, PRAYER_KEYS, PRAYER_STATUSES } from "../../lib/validation";

test("only real prayer keys and statuses are accepted", () => {
  assert.equal(isOneOf(PRAYER_KEYS, "fajr"), true);
  // prayerName becomes a column name, so anything else must be rejected
  assert.equal(isOneOf(PRAYER_KEYS, "studentId"), false);
  assert.equal(isOneOf(PRAYER_STATUSES, "pending"), true);
  assert.equal(isOneOf(PRAYER_STATUSES, 3), false);
});

test("passwords need at least 8 characters", () => {
  assert.equal(isValidPassword("1234567"), false);
  assert.equal(isValidPassword("12345678"), true);
  assert.equal(isValidPassword(undefined), false);
});

test("cleanText trims and enforces non-empty and max length", () => {
  assert.equal(cleanText("  hi  ", 10), "hi");
  assert.equal(cleanText("   ", 10), null);
  assert.equal(cleanText("x".repeat(11), 10), null);
  assert.equal(cleanText(42, 10), null);
});

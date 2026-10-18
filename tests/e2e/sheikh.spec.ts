import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test("the sheikh replies to a question and the student sees it under that question", async ({ browser }) => {
  const reply = `رد اختبار ${Date.now()}`;

  const sheikhPage = await (await browser.newContext()).newPage();
  await login(sheikhPage, "sheikh@elmorabbi.com", "sheikh");
  await expect(sheikhPage.getByRole("heading", { name: "أسئلة الطلاب" })).toBeVisible();
  // Answered questions are collapsed behind this button
  const showAnswered = sheikhPage.getByRole("button", { name: /عرض الأسئلة المُجابة/ });
  if (await showAnswered.count()) await showAnswered.click();
  const question = sheikhPage.getByRole("listitem").filter({ hasText: "كيف أثبت ورد الحفظ" }).first();
  // "رد إضافي" when an earlier run already answered it
  await question.getByRole("button", { name: /الرد على السؤال|رد إضافي/ }).click();
  const dialog = sheikhPage.getByRole("dialog", { name: "الرد على سؤال الطالب" });
  await expect(dialog).toContainText("كيف أثبت ورد الحفظ");
  await dialog.locator("textarea").fill(reply);
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).toHaveCount(0, { timeout: 10_000 });

  const studentPage = await (await browser.newContext()).newPage();
  await login(studentPage, "ahmed@student.com");
  // Unread badge in the bottom navigation
  await expect(studentPage.getByRole("navigation", { name: "التنقل الرئيسي" })).toContainText("جديد");
  await studentPage.goto("/student/sheikh");
  const thread = studentPage
    .getByRole("region", { name: /أسئلتي/ })
    .or(studentPage.locator("section", { hasText: "أسئلتي وردود الشيخ" }))
    .getByRole("listitem")
    .filter({ hasText: "كيف أثبت ورد الحفظ" })
    .first();
  await expect(thread).toContainText(reply);
  await expect(thread).toContainText("جديد");
});

test("students needing follow-up are listed first", async ({ page }) => {
  await login(page, "sheikh@elmorabbi.com", "sheikh");
  // Omar missed Maghrib today in the seed data
  const firstRow = page.locator("ul.grid > li").first();
  await expect(firstRow).toContainText("عمر الفاروق الدوسري");
  await expect(firstRow).toContainText("فاتته اليوم");
});

test("a sheikh cannot open a student outside their halaqah", async ({ page }) => {
  await login(page, "sheikh@elmorabbi.com", "sheikh");
  const res = await page.goto("/sheikh/students/not-my-student");
  expect(res?.status()).toBe(404);
});

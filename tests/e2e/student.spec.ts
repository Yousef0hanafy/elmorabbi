import { test, expect } from "@playwright/test";
import { login, registerStudent } from "./helpers";

test("a new student starts with an empty day and their logging is saved", async ({ page }) => {
  await registerStudent(page);
  await page.getByRole("button", { name: /طلب الانضمام/ }).first().click();
  await expect(page).toHaveURL(/\/student$/);

  // Nothing pre-filled: five prayers not logged, streak 0
  await expect(page.getByText("لم يُسجَّل", { exact: true })).toHaveCount(5);
  await expect(page.getByText("0 / 5 مسجّلة")).toBeVisible();
  await expect(page.getByText("0 يوماً").first()).toBeVisible();

  const fajr = page.getByRole("group", { name: "صلاة الفجر" });
  await fajr.getByRole("button", { name: "جماعة" }).click();
  await expect(fajr.getByRole("button", { name: "جماعة" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("1 / 5 مسجّلة")).toBeVisible();

  // Persisted: still selected after a reload
  await page.reload();
  await expect(page.getByRole("group", { name: "صلاة الفجر" }).getByRole("button", { name: "جماعة" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  // Tapping again undoes it
  await page.getByRole("group", { name: "صلاة الفجر" }).getByRole("button", { name: "جماعة" }).click();
  await expect(page.getByText("0 / 5 مسجّلة")).toBeVisible();

  // Quran counter batches quick taps into one save
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "زيادة صفحة" }).click();
  await expect(page.getByText("جارٍ الحفظ...")).toBeHidden({ timeout: 5000 });
  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.locator('[aria-live="polite"]').getByText("3", { exact: true })).toBeVisible();
});

test("progress page shows only the student's own rank", async ({ page }) => {
  await login(page, "ahmed@student.com");
  await page.goto("/student/progress");
  await expect(page.getByRole("heading", { name: "ترتيبك في الحلقة" })).toBeVisible();
  await expect(page.getByText(/من \d+/).first()).toBeVisible();
  // No other students' names
  await expect(page.getByText("عمر الفاروق الدوسري")).toHaveCount(0);
  await expect(page.getByText("يوسف بن خالد السعيد")).toHaveCount(0);
});

test("dialogs are accessible and close with Escape", async ({ page }) => {
  await login(page, "ahmed@student.com");
  await page.goto("/student/sheikh");
  await page.getByRole("button", { name: /اسأل الشيخ/ }).click();
  const dialog = page.getByRole("dialog", { name: "سؤال أو استشارة للشيخ" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("textarea")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

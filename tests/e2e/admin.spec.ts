import { test, expect } from "@playwright/test";
import { loginAdmin } from "./helpers";

test("admin tabs load each section", async ({ page }) => {
  await loginAdmin(page);
  const tabs = page.getByRole("navigation", { name: "أقسام لوحة الإدارة" }).getByRole("link");
  await expect(tabs).toHaveCount(4);
  await tabs.filter({ hasText: "الطلاب" }).click();
  await expect(page).toHaveURL(/tab=students/);
  await expect(tabs.filter({ hasText: "الطلاب" })).toHaveAttribute("aria-current", "page");
});

test("creating a sheikh with an existing email shows an error", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin?tab=sheikhs");
  await page.getByRole("button", { name: /إضافة شيخ/ }).click();
  const dialog = page.getByRole("dialog", { name: "إضافة شيخ جديد" });
  await dialog.locator('input[name="name"]').fill("شيخ مكرر");
  await dialog.locator('input[name="email"]').fill("ahmed@student.com");
  await dialog.locator('input[name="password"]').fill("strong-pass-1");
  await dialog.locator('input[name="halaqahName"]').fill("حلقة اختبار");
  await dialog.locator('input[name="title"]').fill("مقرئ");
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.getByRole("alert")).toContainText("هذا البريد الإلكتروني مستخدم لحساب آخر");
});

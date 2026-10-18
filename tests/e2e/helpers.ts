import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = process.env.SEED_PASSWORD || "password123";

export async function login(page: Page, email: string, role: "student" | "sheikh" = "student") {
  await page.goto(`/login?role=${role}`);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(DEMO_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(role === "sheikh" ? /\/sheikh$/ : /\/student$/);
}

export async function loginAdmin(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("البريد الإلكتروني للإدارة").fill("admin@elmorabbi.com");
  await page.getByLabel("كلمة المرور").fill(DEMO_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole("navigation", { name: "أقسام لوحة الإدارة" })).toBeVisible();
}

export async function registerStudent(page: Page, name = "طالب اختبار") {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  await page.goto("/register");
  await page.getByLabel("الاسم الكامل").fill(name);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("e2e-password-1");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/student\/choose-sheikh$/);
  return email;
}

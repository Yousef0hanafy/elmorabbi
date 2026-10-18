import { test, expect } from "@playwright/test";

test("a hand-crafted session cookie cannot open the admin dashboard", async ({ page, context, baseURL }) => {
  const forged = encodeURIComponent(JSON.stringify({ id: "x", name: "x", email: "x", role: "admin" }));
  await context.addCookies([{ name: "elmorabbi_session", value: forged, url: baseURL! }]);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "بوابة الإدارة المركزية" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "أقسام لوحة الإدارة" })).toHaveCount(0);
});

test("old shared passwords do not log in to arbitrary accounts", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill("someone@example.com");
  await page.getByLabel("كلمة المرور").fill("password123");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/error=invalid_credentials/);
});

test("protected pages redirect anonymous visitors with a real HTTP redirect", async ({ request }) => {
  for (const path of ["/student", "/student/progress", "/sheikh"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(307);
    expect(res.headers()["location"], path).toContain("/login");
  }
});

test("registering with role=admin creates a student account", async ({ page }) => {
  await page.goto("/register");
  await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('form input[name="role"]');
    if (input) input.value = "admin";
  });
  await page.getByLabel("الاسم الكامل").fill("محاولة أدمن");
  await page.getByLabel("البريد الإلكتروني").fill(`fake-admin-${Date.now()}@example.com`);
  await page.getByLabel("كلمة المرور").fill("e2e-password-1");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/student\/choose-sheikh$/);
  await page.goto("/admin");
  await expect(page.getByRole("navigation", { name: "أقسام لوحة الإدارة" })).toHaveCount(0);
});

import { test, expect } from "@playwright/test";

// A dedicated client IP keeps this test from blocking logins in the other specs
test.use({ extraHTTPHeaders: { "x-forwarded-for": "203.0.113.77" } });

test("repeated failed logins are temporarily blocked", async ({ page }) => {
  const email = `brute-${Date.now()}@example.com`;
  for (let i = 0; i < 10; i++) {
    await page.goto("/login");
    await page.getByLabel("البريد الإلكتروني").fill(email);
    await page.getByLabel("كلمة المرور").fill(`wrong-${i}`);
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/error=invalid_credentials/);
  }
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill("another-guess");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/error=too_many_attempts/);
  await expect(page.getByRole("alert").filter({ hasText: "محاولات دخول كثيرة" })).toBeVisible();
});

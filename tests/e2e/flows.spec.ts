import { expect, test, type Page } from "@playwright/test";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "BossBantaeng2025!";

async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

test("Public: beranda → agenda → detail → kontak", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 30_000 });

  await page.goto("/agenda");
  await expect(page).toHaveURL(/\/agenda/, { timeout: 30_000 });
  const firstCard = page.locator('a[href*="/agenda/"]').first();
  if (await firstCard.count()) {
    await firstCard.click();
    await expect(page).toHaveURL(/\/agenda\/.+/, { timeout: 30_000 });
    await expect(page.getByRole("heading").first()).toBeVisible();
  }

  await page.goto("/kontak");
  await expect(page).toHaveURL(/\/kontak/, { timeout: 30_000 });
  await expect(page.getByText(/kontak|hubungi/i).first()).toBeVisible({ timeout: 30_000 });
});

test("Admin: jenis usaha list → buat → edit path", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });

  await page.goto("/dashboard/jenis-usaha");
  await expect(page).toHaveURL(/\/dashboard\/jenis-usaha/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /jenis usaha/i }).first()).toBeVisible({
    timeout: 30_000,
  });

  await page.goto("/dashboard/jenis-usaha/create");
  await expect(page).toHaveURL(/\/dashboard\/jenis-usaha\/create/, { timeout: 30_000 });
  await expect(page.getByLabel(/nama|jenis/i).first()).toBeVisible({ timeout: 30_000 });
});

test("Admin: profil dapat dibuka dari dashboard", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  await page.goto("/dashboard/profile");
  await expect(page).toHaveURL(/\/dashboard\/profile/, { timeout: 30_000 });
  await expect(page.getByText(/profil|password/i).first()).toBeVisible({ timeout: 30_000 });
});

test("Health endpoint merespons ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as { ok?: boolean };
  expect(body.ok).toBe(true);
});

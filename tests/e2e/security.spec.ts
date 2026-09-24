import { expect, test, type Page } from "@playwright/test";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "BossBantaeng2025!";

async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

test("Unauthenticated /dashboard/* → redirect /login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
  await expect(page.getByLabel("Username")).toBeVisible();
});

test("Unauthenticated /dashboard/akun → redirect /login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard/akun");
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
});

test("Login tanpa kredensial tidak memberi sesi", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("");
  await page.getByLabel("Password").fill("");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
});

test("Register username duplikat → error field, tidak crash", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nama Lengkap").fill("Duplikat");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Email (opsional)").fill("");
  await page.getByLabel("Password", { exact: true }).fill("Secret12345");
  await page.getByLabel("Konfirmasi Password").fill("Secret12345");
  await page.getByRole("button", { name: "Daftar" }).click();
  await expect(page.getByText(/sudah digunakan|gagal|field/i).first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(/\/register/, { timeout: 10_000 });
});

test("Role USER tidak melihat menu admin", async ({ page }) => {
  const username = `sec${Date.now().toString(36)}`;
  await page.goto("/register");
  await page.getByLabel("Nama Lengkap").fill("Security Uji");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email (opsional)").fill(`${username}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill("Secret12345");
  await page.getByLabel("Konfirmasi Password").fill("Secret12345");
  await page.getByRole("button", { name: "Daftar" }).click();
  await expect(page.getByText("Registrasi berhasil. Silakan masuk.")).toBeVisible({
    timeout: 60_000,
  });

  await login(page, username, "Secret12345");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });

  await page.goto("/dashboard/akun");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await page.goto("/dashboard/activity");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await page.goto("/dashboard/jenis-usaha");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await page.goto("/dashboard/dokumen");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
});

test("Admin tetap bisa akses /dashboard/akun", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  await page.goto("/dashboard/akun");
  await expect(page).toHaveURL(/\/dashboard\/akun/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /akun/i })).toBeVisible({ timeout: 30_000 });
});

test("Query ?page=-1 tidak menghapus filter dan tidak 500", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  await page.goto("/dashboard/dokumen?search=&page=-1&pageSize=10");
  await expect(page).toHaveURL(/\/dashboard\/dokumen/, { timeout: 30_000 });
  await expect(page.getByText(/judul|dokumen/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Application error")).toHaveCount(0);
});

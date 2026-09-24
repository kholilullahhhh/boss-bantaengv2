import { expect, test, type Page } from "@playwright/test";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "BossBantaeng2025!";

async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

test("Login sebagai admin → dashboard tampil", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  await expect(page.getByRole("heading", { name: /Selamat datang/i })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Total Dokumen")).toBeVisible();
});

test("Unggah dokumen → dokumen muncul di list", async ({ page }) => {
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });

  await page.goto("/dashboard/dokumen/create");
  const uniqueTitle = `Dokumen Uji ${Date.now()}`;
  await page.getByLabel("Judul").fill(uniqueTitle);
  await page.getByLabel("Tanggal Dokumen").fill("2026-09-24");

  // Unggah berkas PDF kecil via input file tersembunyi
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "dokumen-uji.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
      "utf-8"
    ),
  });

  await expect(page.getByText("Berkas berhasil diunggah.")).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: "Simpan Dokumen" }).click();
  await expect(page.getByText("Dokumen berhasil disimpan.")).toBeVisible({ timeout: 60_000 });
  await expect(page).toHaveURL(/\/dashboard\/dokumen$/, { timeout: 30_000 });

  await expect(page.getByText(uniqueTitle).first()).toBeVisible({ timeout: 30_000 });
});

test("Role USER mengakses /dashboard/akun → dialihkan (403/redirect)", async ({ page }) => {
  // Daftar akun baru — otomatis role USER
  const username = `uji${Date.now().toString(36)}`;
  await page.goto("/register");
  await page.getByLabel("Nama Lengkap").fill("Pengguna Uji");
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

  // Middleware memblokir akses modul admin: redirect ke /dashboard
  await page.goto("/dashboard/akun");
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Selamat datang/i })).toBeVisible({
    timeout: 30_000,
  });

  // Menu Akun tidak boleh tampil untuk USER
  await expect(page.getByRole("link", { name: "Akun" })).toHaveCount(0);
});

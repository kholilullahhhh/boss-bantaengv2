import { expect, test, type Page } from "@playwright/test";

const VIEWS = [
  { name: "320px", width: 320, height: 568 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1440px", width: 1440, height: 900 },
] as const;

const PUBLIC_PATHS = ["/", "/agenda", "/kontak", "/login"] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  expect(overflow, "page should not overflow horizontally").toBe(false);
}

for (const view of VIEWS) {
  test.describe(`viewport ${view.name}`, () => {
    test.use({ viewport: { width: view.width, height: view.height } });

    for (const path of PUBLIC_PATHS) {
      test(`public ${path} fits without horizontal scroll`, async ({ page }) => {
        await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await assertNoHorizontalOverflow(page);
      });
    }
  });
}

test("mobile public nav opens drawer", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });

  const toggle = page.getByRole("button", { name: /buka menu navigasi/i });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.getByRole("link", { name: "Agenda", exact: true }).first()).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

test("mobile dashboard sidebar sheet opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByLabel("Username").fill(process.env.E2E_ADMIN_USERNAME ?? "admin");
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD ?? "BossBantaeng2025!");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });

  await page.getByRole("button", { name: /buka menu navigasi/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await assertNoHorizontalOverflow(page);
});

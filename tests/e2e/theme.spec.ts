import { expect, test, type Page } from "@playwright/test";

async function htmlHasDark(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.classList.contains("dark"));
}

test("theme toggle cycles light → dark on login", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });

  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", "id");

  const toggle = page.getByRole("button", { name: "Ganti tema" }).first();
  await expect(toggle).toBeVisible();

  // Force light first (cycle from current)
  await page.evaluate(() => {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  });

  // Click once: light → dark
  await toggle.click();
  await expect
    .poll(async () => htmlHasDark(page), { timeout: 10_000 })
    .toBe(true);

  // Click again: dark → system (may or may not be dark depending on OS)
  await toggle.click();
  await expect(toggle).toBeVisible();
});

test("dark mode persists after reload", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 60_000 });

  await page.evaluate(() => {
    localStorage.setItem("theme", "dark");
  });
  await page.reload({ waitUntil: "domcontentloaded" });

  // next-themes hydrates and applies class
  await expect
    .poll(async () => htmlHasDark(page), { timeout: 15_000 })
    .toBe(true);

  await page.evaluate(() => {
    localStorage.setItem("theme", "light");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect
    .poll(async () => htmlHasDark(page), { timeout: 15_000 })
    .toBe(false);
});

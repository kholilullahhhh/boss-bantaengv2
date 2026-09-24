import { afterEach, describe, expect, it, vi } from "vitest";
import { appBaseUrl, resolveAppUrl } from "@/lib/app-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveAppUrl", () => {
  it("fallback ke localhost saat env kosong", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("AUTH_URL", "");
    expect(resolveAppUrl()).toBe("http://localhost:3000/");
  });

  it("fallback saat env invalid (tanpa protocol)", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "not-a-url");
    vi.stubEnv("AUTH_URL", "");
    expect(resolveAppUrl()).toBe("http://localhost:3000/");
  });

  it("pakai NEXT_PUBLIC_APP_URL yang valid", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://boss.example.com");
    expect(resolveAppUrl()).toBe("https://boss.example.com/");
  });
});

describe("appBaseUrl", () => {
  it("menghapus slash trailing", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://boss.example.com/");
    vi.stubEnv("AUTH_URL", "");
    expect(appBaseUrl()).toBe("https://boss.example.com");
  });

  it("aman dipakai sebagai base new URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("AUTH_URL", "");
    const url = new URL("/login", appBaseUrl());
    expect(url.pathname).toBe("/login");
  });
});

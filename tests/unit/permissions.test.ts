import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  DOCUMENT_ROLES,
  ROLES,
  canAccess,
  canManageDocument,
  canViewAllDocuments,
  hasRole,
  requireRole,
  routePermissionForPath,
} from "@/lib/permissions";

describe("hasRole", () => {
  it("mengembalikan true jika role diizinkan", () => {
    expect(hasRole("ADMIN", ["ADMIN"])).toBe(true);
  });

  it("mengembalikan false jika role tidak ada atau kosong", () => {
    expect(hasRole("USER", ["ADMIN"])).toBe(false);
    expect(hasRole(undefined, ROLES)).toBe(false);
  });
});

describe("requireRole", () => {
  const admin = { id: "1", role: "ADMIN" as const };
  const user = { id: "2", role: "USER" as const };

  it("mengembalikan actor jika role diizinkan", () => {
    expect(requireRole(admin, ["ADMIN"])).toBe(admin);
    expect(requireRole(user, ROLES)).toBe(user);
  });

  it("melempar AuthorizationError jika role ditolak", () => {
    expect(() => requireRole(user, ["ADMIN"])).toThrow(AuthorizationError);
  });

  it("melempar AuthorizationError jika belum login", () => {
    expect(() => requireRole(null, ROLES)).toThrow(AuthorizationError);
  });
});

describe("canAccess (permission matrix)", () => {
  it("/dashboard bisa diakses semua role", () => {
    for (const role of ROLES) {
      expect(canAccess("/dashboard", role)).toBe(true);
    }
  });

  it("/dashboard/akun hanya ADMIN", () => {
    expect(canAccess("/dashboard/akun", "ADMIN")).toBe(true);
    for (const role of ROLES.filter((role) => role !== "ADMIN")) {
      expect(canAccess("/dashboard/akun", role)).toBe(false);
    }
  });

  it("/dashboard/jenis-usaha hanya ADMIN", () => {
    expect(canAccess("/dashboard/jenis-usaha", "ADMIN")).toBe(true);
    expect(canAccess("/dashboard/jenis-usaha", "KEPALA_KANTOR")).toBe(false);
  });

  it("/dashboard/activity hanya ADMIN", () => {
    expect(canAccess("/dashboard/activity", "ADMIN")).toBe(true);
    expect(canAccess("/dashboard/activity", "TU")).toBe(false);
  });

  it("/dashboard/dokumen tidak boleh untuk USER", () => {
    expect(canAccess("/dashboard/dokumen", "USER")).toBe(false);
    for (const role of DOCUMENT_ROLES) {
      expect(canAccess("/dashboard/dokumen", role)).toBe(true);
    }
  });

  it("/dashboard/profile bisa diakses semua role", () => {
    for (const role of ROLES) {
      expect(canAccess("/dashboard/profile", role)).toBe(true);
    }
  });
});

describe("routePermissionForPath", () => {
  it("memetakan path ke izin yang benar", () => {
    expect(routePermissionForPath("/dashboard")).toBe("/dashboard");
    expect(routePermissionForPath("/dashboard/akun/create")).toBe("/dashboard/akun");
    expect(routePermissionForPath("/dashboard/dokumen/abc/edit")).toBe("/dashboard/dokumen");
    expect(routePermissionForPath("/dashboard/activity")).toBe("/dashboard/activity");
  });

  it("mengembalikan null untuk path di luar dashboard", () => {
    expect(routePermissionForPath("/kontak")).toBeNull();
  });
});

describe("canManageDocument", () => {
  const own = { userId: "owner-1" };

  it("ADMIN dan KEPALA boleh mengelola semua dokumen", () => {
    expect(canManageDocument({ id: "x", role: "ADMIN" }, own)).toBe(true);
    expect(canManageDocument({ id: "x", role: "KEPALA_KANTOR" }, own)).toBe(true);
  });

  it("TU/INTELDAKIM/VERDOKJAL hanya dokumen miliknya", () => {
    expect(canManageDocument({ id: "owner-1", role: "TU" }, own)).toBe(true);
    expect(canManageDocument({ id: "other", role: "TU" }, own)).toBe(false);
    expect(canManageDocument({ id: "other", role: "INTELDAKIM" }, own)).toBe(false);
    expect(canManageDocument({ id: "other", role: "VERDOKJAL" }, own)).toBe(false);
  });

  it("USER tidak boleh mengelola dokumen", () => {
    expect(canManageDocument({ id: "owner-1", role: "USER" }, own)).toBe(false);
  });
});

describe("canViewAllDocuments", () => {
  it("hanya ADMIN dan KEPALA_KANTOR", () => {
    expect(canViewAllDocuments("ADMIN")).toBe(true);
    expect(canViewAllDocuments("KEPALA_KANTOR")).toBe(true);
    expect(canViewAllDocuments("TU")).toBe(false);
    expect(canViewAllDocuments("USER")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  authSchema,
  registerSchema,
  folderSchema,
  jenisUsahaSchema,
  profileSchema,
  agendaSchema,
  createDokumenSchema,
  dokumenFilterSchema,
  changePasswordSchema,
} from "@/lib/validations";

describe("authSchema", () => {
  it("menerima kredensial valid", () => {
    expect(authSchema.safeParse({ username: "admin", password: "BossBantaeng2025!" }).success).toBe(true);
  });

  it("menolak username kurang dari 3 karakter", () => {
    const result = authSchema.safeParse({ username: "ad", password: "BossBantaeng2025!" });
    expect(result.success).toBe(false);
  });

  it("menolak username non-alfanumerik", () => {
    const result = authSchema.safeParse({ username: "admin!#", password: "BossBantaeng2025!" });
    expect(result.success).toBe(false);
  });

  it("menolak password kurang dari 8 karakter", () => {
    const result = authSchema.safeParse({ username: "admin", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Pegawai Baru",
    username: "pegawai.baru",
    email: "baru@example.com",
    password: "Secret123",
    confirmPassword: "Secret123",
  };

  it("menerima data valid", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("menolak konfirmasi password tidak sama", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "Lain1234" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "confirmPassword")).toBe(true);
    }
  });

  it("menolak email tidak valid", () => {
    expect(registerSchema.safeParse({ ...valid, email: "bukan-email" }).success).toBe(false);
  });
});

describe("folderSchema", () => {
  it("menerima nama dan warna valid", () => {
    expect(folderSchema.safeParse({ name: "Arsip 2026", color: 3 }).success).toBe(true);
  });

  it("menolak warna di luar 1-8", () => {
    expect(folderSchema.safeParse({ name: "Arsip", color: 9 }).success).toBe(false);
    expect(folderSchema.safeParse({ name: "Arsip", color: 0 }).success).toBe(false);
  });

  it("menolak nama lebih dari 100 karakter", () => {
    expect(folderSchema.safeParse({ name: "x".repeat(101), color: 1 }).success).toBe(false);
  });
});

describe("jenisUsahaSchema", () => {
  it("menerima nama minimal 3 karakter", () => {
    expect(jenisUsahaSchema.safeParse({ namaJenis: "SK", deskripsi: "" }).success).toBe(false);
    expect(jenisUsahaSchema.safeParse({ namaJenis: "SK Kepala", deskripsi: "" }).success).toBe(true);
  });

  it("menolak nama lebih dari 100 karakter", () => {
    expect(
      jenisUsahaSchema.safeParse({ namaJenis: "x".repeat(101), deskripsi: "" }).success
    ).toBe(false);
  });
});

describe("profileSchema", () => {
  const base = {
    name: "Budi",
    jabatan: "",
    email: "budi@example.com",
    phone: "081234567890",
    avatarUrl: "",
    password: "",
  };

  it("jabatan bersifat opsional", () => {
    expect(profileSchema.safeParse(base).success).toBe(true);
  });

  it("password opsional — kosong diterima", () => {
    expect(profileSchema.safeParse({ ...base, password: "" }).success).toBe(true);
  });

  it("password diisi harus minimal 8 karakter", () => {
    expect(profileSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, password: "longenough" }).success).toBe(true);
  });
});

describe("agendaSchema", () => {
  const base = {
    judul: "Rapat Koordinasi",
    tempatKegiatan: "Ruang Rapat",
    tglKegiatan: "2026-03-02",
    jamMulai: "09:00",
    jamSelesai: "",
    deskripsi: "",
    status: "PUBLISH" as const,
  };

  it("jamSelesai opsional diterima", () => {
    expect(agendaSchema.safeParse(base).success).toBe(true);
  });

  it("jamSelesai harus setelah jamMulai jika diisi", () => {
    const result = agendaSchema.safeParse({ ...base, jamSelesai: "08:00" });
    expect(result.success).toBe(false);
  });

  it("menolak status tidak valid", () => {
    expect(
      agendaSchema.safeParse({ ...base, status: "PUBLISHED" as unknown as "PUBLISH" }).success
    ).toBe(false);
  });
});

describe("createDokumenSchema", () => {
  const file = {
    fileUrl: "/api/upload?path=dokumen%2Fu1%2Fa.pdf",
    filePath: "dokumen/u1/2026-09-24-abc.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    originalName: "laporan.pdf",
  };

  it("menerima dokumen lengkap dengan file", () => {
    const result = createDokumenSchema.safeParse({
      judul: "Laporan Kegiatan",
      deskripsi: "",
      folderId: "",
      tanggalDokumen: "2026-09-24",
      file,
    });
    expect(result.success).toBe(true);
  });

  it("menolak tanpa file", () => {
    const result = createDokumenSchema.safeParse({
      judul: "Laporan Kegiatan",
      deskripsi: "",
      folderId: "",
      tanggalDokumen: "2026-09-24",
    });
    expect(result.success).toBe(false);
  });

  it("menolak mime type tidak didukung", () => {
    const result = createDokumenSchema.safeParse({
      judul: "Laporan Kegiatan",
      deskripsi: "",
      folderId: "",
      tanggalDokumen: "2026-09-24",
      file: { ...file, mimeType: "image/png" },
    });
    expect(result.success).toBe(false);
  });

  it("menolak file > 10MB", () => {
    const result = createDokumenSchema.safeParse({
      judul: "Laporan Kegiatan",
      deskripsi: "",
      folderId: "",
      tanggalDokumen: "2026-09-24",
      file: { ...file, fileSize: 11 * 1024 * 1024 },
    });
    expect(result.success).toBe(false);
  });
});

describe("dokumenFilterSchema", () => {
  it("memberi default halaman dan ukuran halaman", () => {
    const result = dokumenFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it("hanya menerima ukuran halaman 10/25/50", () => {
    expect(dokumenFilterSchema.safeParse({ pageSize: "25" }).success).toBe(true);
    expect(dokumenFilterSchema.safeParse({ pageSize: "20" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("password baru dan konfirmasi harus sama", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password",
      confirmPassword: "different-one",
    });
    expect(result.success).toBe(false);
  });

  it("menerima data valid", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-password",
      newPassword: "new-password",
      confirmPassword: "new-password",
    });
    expect(result.success).toBe(true);
  });
});

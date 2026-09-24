import { z } from "zod";

export const FILE_MAX_SIZE = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
} as const;

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
] as const satisfies readonly string[];

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export const ALLOWED_MIME_TYPES: readonly string[] = Object.values(ALLOWED_FILE_TYPES).flat();

export function getExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  if (index < 0 || index === filename.length - 1) return "";
  return filename.slice(index + 1).toLowerCase();
}

export function isAllowedExtension(extension: string): extension is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(extension);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const idSchema = z.string().trim().min(1, "ID tidak valid").max(64, "ID tidak valid");
export { idSchema as idSchemaLike };

export const fileMetadataSchema = z.object({
  fileUrl: z
    .string()
    .trim()
    .min(1, "URL berkas tidak valid")
    .max(500, "URL berkas terlalu panjang")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\/\S+$/i.test(value),
      "URL berkas tidak valid"
    ),
  filePath: z
    .string()
    .trim()
    .min(1, "Path berkas tidak valid")
    .max(300, "Path berkas terlalu panjang")
    .regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/, "Path berkas tidak valid")
    // Tolak traversal path (S1): `..` tidak boleh muncul di path yang disimpan klien.
    .refine((value) => !value.split("/").includes(".."), "Path berkas tidak valid"),
  fileSize: z
    .number()
    .int("Ukuran berkas tidak valid")
    .min(1, "Ukuran berkas tidak valid")
    .max(FILE_MAX_SIZE, "Ukuran berkas melebihi batas 10 MB"),
  mimeType: z
    .string()
    .trim()
    .min(1, "Tipe berkas tidak valid")
    .refine(isAllowedMimeType, "Tipe berkas tidak didukung (PDF, DOC, DOCX, XLS, XLSX)"),
  originalName: z
    .string()
    .trim()
    .min(1, "Nama berkas tidak valid")
    .max(255, "Nama berkas terlalu panjang"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int("Halaman tidak valid").min(1, "Halaman tidak valid").default(1),
  pageSize: z.coerce
    .number()
    .int("Ukuran halaman tidak valid")
    .refine((value) => [10, 25, 50].includes(value), "Ukuran halaman tidak valid")
    .default(10),
});

export const authSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[A-Za-z0-9._-]+$/, "Username hanya boleh berisi huruf alfanumerik"),
  password: z.string().min(8, "Password minimal 8 karakter").max(100, "Password terlalu panjang"),
});

export type AuthInput = z.infer<typeof authSchema>;

export const loginSchema = authSchema;

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(30, "Username maksimal 30 karakter")
      .regex(
        /^[a-z0-9._-]+$/,
        "Username hanya boleh berisi huruf kecil, angka, titik, underscore, dan strip"
      ),
    email: z
      .email("Format email tidak valid")
      .max(150, "Email maksimal 150 karakter")
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const folderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama folder minimal 2 karakter")
    .max(100, "Nama folder maksimal 100 karakter"),
  color: z.coerce
    .number()
    .int("Warna tidak valid")
    .min(1, "Warna harus antara 1 dan 8")
    .max(8, "Warna harus antara 1 dan 8")
    .default(1),
});

export type FolderInput = z.infer<typeof folderSchema>;

const dokumenBaseSchema = z.object({
  judul: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  deskripsi: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .or(z.literal("")),
  folderId: idSchema.or(z.literal("")).optional(),
  tanggalDokumen: z.iso.date("Format tanggal tidak valid (YYYY-MM-DD)"),
});

export type DokumenBaseInput = z.infer<typeof dokumenBaseSchema>;
export { dokumenBaseSchema };

export const createDokumenSchema = dokumenBaseSchema.extend({
  file: fileMetadataSchema,
});

export const updateDokumenSchema = dokumenBaseSchema.extend({
  file: fileMetadataSchema.optional(),
});

export const dokumenSchema = dokumenBaseSchema.extend({
  file: fileMetadataSchema.optional(),
});

export type CreateDokumenInput = z.infer<typeof createDokumenSchema>;
export type UpdateDokumenInput = z.infer<typeof updateDokumenSchema>;
export type DokumenInput = z.infer<typeof dokumenSchema>;

export const dokumenFilterSchema = paginationSchema.extend({
  search: z.string().trim().max(100, "Kata kunci terlalu panjang").default(""),
  folderId: z.string().trim().max(64).or(z.literal("")).default(""),
  dateFrom: z.iso.date("Format tanggal tidak valid").or(z.literal("")).default(""),
  dateTo: z.iso.date("Format tanggal tidak valid").or(z.literal("")).default(""),
  sortBy: z.enum(["judul", "tanggalDokumen", "createdAt", "fileSize"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type DokumenFilterInput = z.infer<typeof dokumenFilterSchema>;

export const jenisUsahaSchema = z.object({
  namaJenis: z
    .string()
    .trim()
    .min(3, "Nama jenis minimal 3 karakter")
    .max(100, "Nama jenis maksimal 100 karakter"),
  deskripsi: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .or(z.literal("")),
});

export type JenisUsahaInput = z.infer<typeof jenisUsahaSchema>;

export const ROLE_VALUES = ["ADMIN", "KEPALA_KANTOR", "TU", "INTELDAKIM", "VERDOKJAL", "USER"] as const;

export const createAkunSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-z0-9._-]+$/,
      "Username hanya boleh berisi huruf kecil, angka, titik, underscore, dan strip"
    ),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"),
  role: z.enum(ROLE_VALUES, "Role tidak valid"),
  jabatan: z.string().trim().max(100, "Jabatan maksimal 100 karakter").or(z.literal("")),
  email: z.email("Format email tidak valid").max(150, "Email maksimal 150 karakter").or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{5,20}$/, "Nomor telepon tidak valid")
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateAkunSchema = createAkunSchema.omit({ password: true }).extend({
  id: idSchema,
});

export const akunSchema = createAkunSchema;

export type CreateAkunInput = z.infer<typeof createAkunSchema>;
export type UpdateAkunInput = z.infer<typeof updateAkunSchema>;
export type AkunInput = z.infer<typeof akunSchema>;

export const akunFilterSchema = paginationSchema.extend({
  search: z.string().trim().max(100, "Kata kunci terlalu panjang").default(""),
  role: z.enum(ROLE_VALUES).or(z.literal("")).default(""),
});

export type AkunFilterInput = z.infer<typeof akunFilterSchema>;

export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    jabatan: z.string().trim().max(100, "Jabatan maksimal 100 karakter").or(z.literal("")),
    email: z.email("Format email tidak valid").max(150, "Email maksimal 150 karakter").or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{5,20}$/, "Nomor telepon tidak valid")
      .or(z.literal("")),
    avatarUrl: z
      .url("URL foto profil tidak valid")
      .max(500, "URL foto profil terlalu panjang")
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(72, "Password maksimal 72 karakter")
      .or(z.literal("")),
  })
  .refine((data) => data.password === "" || data.password.length >= 8, {
    message: "Password minimal 8 karakter",
    path: ["password"],
  });

export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(72, "Password baru maksimal 72 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const agendaSchema = z
  .object({
    judul: z
      .string()
      .trim()
      .min(3, "Judul minimal 3 karakter")
      .max(200, "Judul maksimal 200 karakter"),
    tempatKegiatan: z
      .string()
      .trim()
      .min(3, "Tempat kegiatan minimal 3 karakter")
      .max(200, "Tempat kegiatan maksimal 200 karakter"),
    tglKegiatan: z.iso.date("Format tanggal tidak valid (YYYY-MM-DD)"),
    jamMulai: z
      .string()
      .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid (HH:MM)"),
    jamSelesai: z
      .string()
      .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tidak valid (HH:MM)")
      .or(z.literal(""))
      .optional(),
    deskripsi: z
      .string()
      .trim()
      .max(2000, "Deskripsi maksimal 2000 karakter")
      .or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISH", "CANCELLED"], "Status agenda tidak valid"),
  })
  .refine((data) => !data.jamSelesai || data.jamSelesai > data.jamMulai, {
    message: "Jam selesai harus setelah jam mulai",
    path: ["jamSelesai"],
  });

export type AgendaInput = z.infer<typeof agendaSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_";
    const list = fieldErrors[key] ?? [];
    list.push(issue.message);
    fieldErrors[key] = list;
  }
  return fieldErrors;
}

"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { hash } from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, formatZodErrors } from "@/lib/validations";
import { getRequestContext } from "@/lib/request";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "@/types/action";

const GENERIC_CREDENTIALS_ERROR = "Username atau password salah.";

function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/dashboard";
  if (value.startsWith("/login") || value.startsWith("/register")) return "/dashboard";
  return value;
}

function isRedirectError(error: unknown): boolean {
  if (error && typeof error === "object" && "digest" in error) {
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
  }
  return false;
}

function messageForAuthCode(code: string | null): string {
  switch (code) {
    case "rate_limited":
      return "Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.";
    case "account_inactive":
      return "Akun Anda dinonaktifkan. Hubungi administrator.";
    default:
      return GENERIC_CREDENTIALS_ERROR;
  }
}

export async function loginAction(
  input: unknown,
  callbackUrl?: string
): Promise<ActionResult<{ callbackUrl: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const target = safeCallbackUrl(callbackUrl);

  try {
    const redirectUrl = await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: target,
      redirect: false,
    });

    const url = new URL(redirectUrl, process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
    const error = url.searchParams.get("error");
    if (error) {
      return { success: false, message: messageForAuthCode(url.searchParams.get("code")) };
    }

    const finalPath = `${url.pathname}${url.search}`;
    return {
      success: true,
      message: "Berhasil masuk.",
      data: { callbackUrl: safeCallbackUrl(finalPath) },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof CredentialsSignin) {
      return { success: false, message: messageForAuthCode(error.code ?? null) };
    }
    if (error instanceof AuthError) {
      return { success: false, message: messageForAuthCode(null) };
    }
    console.error("[auth] Login gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Terjadi kesalahan saat masuk. Silakan coba lagi." };
  }
}

export async function registerAction(input: unknown): Promise<ActionResult<{ username: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { name, username, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
      select: { username: true, email: true },
    });
    if (existing) {
      const fieldErrors: Record<string, string[]> = {};
      if (existing.username === username) fieldErrors.username = ["Username sudah digunakan"];
      if (email && existing.email === email) fieldErrors.email = ["Email sudah digunakan"];
      return { success: false, message: "Registrasi gagal.", fieldErrors };
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email: email || null,
        password: passwordHash,
        role: "USER",
        isActive: true,
      },
      select: { id: true, username: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "CREATE",
      "user",
      user.id,
      { userId: user.id, ipAddress, userAgent },
      { username: user.username, role: "USER", via: "register" }
    );

    return { success: true, message: "Registrasi berhasil. Silakan masuk.", data: { username } };
  } catch (error) {
    console.error("[auth] Registrasi gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Registrasi gagal. Silakan coba lagi." };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    await signOut({ redirectTo: "/login" });
    return { success: true, message: "Berhasil keluar." };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { success: false, message: "Gagal keluar. Silakan coba lagi." };
    }
    console.error("[auth] Logout gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal keluar. Silakan coba lagi." };
  }
}

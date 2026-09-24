import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
      jabatan: string | null;
      avatarUrl: string | null;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: Role;
    jabatan: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    name: string;
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
    jabatan?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  }
}

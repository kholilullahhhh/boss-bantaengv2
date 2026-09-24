import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.jabatan = user.jabatan ?? null;
        token.avatarUrl = user.avatarUrl ?? null;
        token.isActive = user.isActive ?? true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
        session.user.jabatan = (token.jabatan as string | null) ?? null;
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
        session.user.isActive = token.isActive !== false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

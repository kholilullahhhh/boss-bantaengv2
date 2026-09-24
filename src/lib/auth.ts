import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { ipFromHeaders, userAgentFromHeaders } from "@/lib/request";
import { logActivity } from "@/lib/activity";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

class InactiveAccountError extends CredentialsSignin {
  code = "account_inactive";
}

const sharedConfig: NextAuthConfig = {
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const ipAddress = ipFromHeaders(request.headers);
        const userAgent = userAgentFromHeaders(request.headers);
        const rateLimitKey = `login:${ipAddress}`;

        const limit = await rateLimit(rateLimitKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!limit.success) {
          throw new RateLimitedError();
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { username },
          select: {
            id: true,
            name: true,
            username: true,
            password: true,
            role: true,
            jabatan: true,
            email: true,
            avatarUrl: true,
            isActive: true,
          },
        });

        if (!user) {
          return null;
        }

        const validPassword = await compare(password, user.password);
        if (!validPassword) {
          return null;
        }

        if (!user.isActive) {
          throw new InactiveAccountError();
        }

        await resetRateLimit(rateLimitKey);
        await logActivity(
          "LOGIN",
          "user",
          user.id,
          { userId: user.id, ipAddress, userAgent },
          { username: user.username }
        );

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          jabatan: user.jabatan,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
        };
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(sharedConfig);

import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { canAccess, routePermissionForPath } from "@/lib/permissions";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = ["/login", "/register"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const user = req.auth?.user;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!user) {
    if (pathname.startsWith("/dashboard")) {
      const url = new URL("/login", req.nextUrl);
      url.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (user.isActive === false) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/dashboard")) {
    const permission = routePermissionForPath(pathname);
    if (permission && !canAccess(permission, user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

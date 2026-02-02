import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/register",
  "/api/documents/public",
  "/invite",
];

function isPublic(pathname: string) {
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  if (pathname.startsWith("/preview/")) return true;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

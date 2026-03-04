import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isStudioRoute = pathname.startsWith("/studio");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if ((isStudioRoute || isAdminRoute) && !req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && req.auth?.user?.role !== "Admin") {
    return Response.redirect(new URL("/studio", req.url));
  }

  if (isAuthRoute && req.auth) {
    return Response.redirect(new URL("/studio", req.url));
  }
});

export const config = {
  matcher: ["/studio/:path*", "/admin/:path*", "/login", "/register"],
};

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isStudioRoute = pathname.startsWith("/studio");
      const isAdminRoute = pathname.startsWith("/admin");

      if ((isStudioRoute || isAdminRoute) && !auth) {
        return false;
      }

      return true;
    },
  },
  providers: [],
};

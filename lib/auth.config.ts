import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      // We'll define the authorize function in the full auth.ts
      // to keep this file lightweight and Edge-compatible.
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isPublicRoute = ["/", "/login", "/register", "/attend"].includes(nextUrl.pathname);
      const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

      if (isApiAuthRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          const redirectUrl = userRole === "LECTURER" ? "/lecturer/home" : "/student/home";
          return Response.redirect(new URL(redirectUrl, nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && !isPublicRoute) {
        return false; // Redirect to login
      }

      if (isLoggedIn) {
        if (nextUrl.pathname.startsWith("/lecturer") && userRole !== "LECTURER") {
          return Response.redirect(new URL("/student/home", nextUrl));
        }
        if (nextUrl.pathname.startsWith("/student") && userRole !== "STUDENT") {
          return Response.redirect(new URL("/lecturer/home", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

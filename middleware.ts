/**
 * Next.js middleware for route protection.
 *
 * Redirects unauthenticated users to /login for protected routes.
 * Uses the NextAuth.js session token cookie to determine auth status.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Paths that do not require authentication
    const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico"];

    // Check if the current path is public
    const isPublic = publicPaths.some((p) => pathname.startsWith(p));

    if (!isPublic && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is already logged in and tries to access /login, redirect to dashboard or root
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

/**
 * NextAuth API route handler.
 * Handles GET (sign-in page redirect, callback) and POST (CSRF, sign-out).
 */
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

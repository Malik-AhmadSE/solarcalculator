/**
 * NextAuth.js configuration — Custom Odoo OAuth2 provider.
 *
 * This sets up the full Authorization Code flow against our
 * pm_oauth_provider Odoo module endpoints.
 */
import NextAuth, { type NextAuthOptions } from "next-auth";

const ODOO_BASE_URL = process.env.ODOO_BASE_URL || "https://staging.promountsolar.com ";

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: "odoo",
            name: "Odoo",
            type: "oauth",
            // Custom provider is OAuth2, not full OIDC (no id_token returned)
            idToken: false,
            // Authorization endpoint — user redirected here to log in via Odoo
            authorization: {
                url: `${ODOO_BASE_URL}/oauth/authorize`,
                params: {
                    response_type: "code",
                    scope: "profile email",
                },
            },
            // Token endpoint — exchanges authorization code for tokens
            token: {
                url: `${ODOO_BASE_URL}/oauth/token`,
                async request({ params, provider }) {
                    const body = new URLSearchParams({
                        grant_type: "authorization_code",
                        code: params.code as string,
                        redirect_uri: provider.callbackUrl,
                        client_id: process.env.ODOO_CLIENT_ID!,
                        client_secret: process.env.ODOO_CLIENT_SECRET!,
                    });
                    const response = await fetch(`${ODOO_BASE_URL}/oauth/token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: body.toString(),
                    });
                    const tokens = await response.json();
                    if (tokens.error) {
                        throw new Error(
                            `OAuth token error: ${tokens.error} — ${tokens.error_description}`
                        );
                    }
                    return { tokens };
                },
            },
            // User info endpoint
            userinfo: {
                url: `${ODOO_BASE_URL}/oauth/userinfo`,
            },
            clientId: process.env.ODOO_CLIENT_ID,
            clientSecret: process.env.ODOO_CLIENT_SECRET,
            // Map the Odoo userinfo response to NextAuth's profile shape
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    login: profile.login,
                    company: profile.company,
                    companyId: profile.company_id,
                };
            },
        },
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // On initial sign-in, persist extra fields from the provider
            if (account && profile) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                token.odooUserId = (profile as Record<string, unknown>).sub;
                token.login = (profile as Record<string, unknown>).login;
                token.company = (profile as Record<string, unknown>).company;
                token.companyId = (profile as Record<string, unknown>).company_id;
            }
            return token;
        },
        async session({ session, token }) {
            // Expose extra fields on the client-side session
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = session as any;
            s.accessToken = token.accessToken;
            if (session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const u = session.user as any;
                u.id = token.odooUserId;
                u.login = token.login;
                u.company = token.company;
                u.companyId = token.companyId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 3 * 60, // 3 minutes
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

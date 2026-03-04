"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="spinner" />
                    <p style={{ color: "var(--muted)" }}>Checking session…</p>
                </div>

                <style jsx>{`
          .login-container {
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          }
          .login-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Logo / branding */}
                <div className="logo-area">
                    <div className="logo-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    </div>
                    <h1 className="app-title">SolarCalculator</h1>
                    <p className="app-subtitle">Sign in to access your dashboard</p>
                </div>

                {/* Sign-in button */}
                <button
                    className="odoo-btn"
                    onClick={() => signIn("odoo", { callbackUrl: "/dashboard" })}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign in with Odoo
                </button>

                <p className="footer-text">
                    Authenticate using your Odoo enterprise account
                </p>
            </div>

            <style jsx>{`
        .login-container {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .logo-area {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-icon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
        }
        .app-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .app-subtitle {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0;
        }
        .odoo-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
        }
        .odoo-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
        }
        .odoo-btn:active {
          transform: translateY(0);
        }
        .footer-text {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
          text-align: center;
        }
      `}</style>
        </div>
    );
}

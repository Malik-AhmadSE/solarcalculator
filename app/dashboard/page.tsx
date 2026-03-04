"use client";

import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading your profile…</p>
                </div>
                <style jsx>{`
          .dashboard-container {
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: #94a3b8;
          }
          .loading-state {
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
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
            </div>
        );
    }

    const user = session?.user as
        | (Record<string, unknown> & { name?: string; email?: string })
        | undefined;

    return (
        <div className="dashboard-container">
            {/* Nav bar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                    SolarCalculator
                </div>
                <div className="nav-user">
                    <span className="user-greeting">
                        {user?.name || "User"}
                    </span>
                    <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main className="main">
                <h1 className="heading">Dashboard</h1>
                <p className="subheading">
                    You are signed in via Odoo SSO. Here&apos;s your profile:
                </p>

                <div className="cards-grid">
                    {/* User profile card */}
                    <div className="card profile-card">
                        <div className="avatar">
                            {(user?.name as string)?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <h2 className="card-name">{user?.name || "—"}</h2>
                        <p className="card-email">{user?.email || "—"}</p>
                    </div>

                    {/* Details card */}
                    <div className="card details-card">
                        <h3 className="card-title">Account Details</h3>
                        <dl className="detail-list">
                            <div className="detail-row">
                                <dt>Odoo User ID</dt>
                                <dd>{(user?.id as string) || "—"}</dd>
                            </div>
                            <div className="detail-row">
                                <dt>Login</dt>
                                <dd>{(user?.login as string) || "—"}</dd>
                            </div>
                            <div className="detail-row">
                                <dt>Company</dt>
                                <dd>{(user?.company as string) || "—"}</dd>
                            </div>
                            <div className="detail-row">
                                <dt>Auth Provider</dt>
                                <dd>Odoo OAuth2</dd>
                            </div>
                        </dl>
                    </div>
                    <button onClick={() => window.location.href = "/"} className="cursor-pointer self-center bg-black tetx-white rounded-[8px] px-4 py-2">Calculator</button>
                </div>
                
            </main>

            <style jsx>{`
        .dashboard-container {
          min-height: 100dvh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: #e2e8f0;
        }

        /* --- Navbar --- */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(15, 23, 42, 0.7);
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-weight: 700;
          font-size: 1.1rem;
          color: #f1f5f9;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-greeting {
          font-size: 0.875rem;
          color: #94a3b8;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 0.5rem;
          color: #fca5a5;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        /* --- Main --- */
        .main {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .heading {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }
        .subheading {
          color: #94a3b8;
          margin: 0 0 2rem;
          font-size: 0.95rem;
        }

        /* --- Cards --- */
        .cards-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 700px) {
          .cards-grid { grid-template-columns: 1fr; }
        }
        .card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.25rem;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }

        /* --- Profile card --- */
        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-size: 2rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
        }
        .card-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
          color: #f1f5f9;
        }
        .card-email {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
        }

        /* --- Details card --- */
        .card-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1.25rem;
          color: #f1f5f9;
        }
        .detail-list {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .detail-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .detail-row dt {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 500;
        }
        .detail-row dd {
          margin: 0;
          font-size: 0.9rem;
          color: #e2e8f0;
          font-family: var(--font-geist-mono), monospace;
        }
      `}</style>
        </div>
    );
}

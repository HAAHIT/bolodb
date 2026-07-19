"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import { appState } from "@/lib/app-state";
import { Spinner } from "@/components/shared/spinner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appState.isLoaded) {
      appState.init(false);
    }
    apiCall("/api/auth/me")
      .then((data: any) => setUser(data?.content || null))
      .catch((e: any) => {
        setError(e.message || "Could not load your profile");
        if (e.status === 401) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  const initials =
    user?.email ? user.email.slice(0, 2).toUpperCase() : "";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)" }}>
        Profile
      </h1>
      <p style={{ margin: "0 0 28px", color: "var(--muted)", fontSize: 14.5 }}>
        Manage your BoloDB account.
      </p>

      {loading && (
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13.5 }}
          data-testid="profile-loading"
        >
          <Spinner /> Loading your profile…
        </div>
      )}

      {error && (
        <div role="alert" className="auth-error" data-testid="profile-error">
          {error}
        </div>
      )}

      {user && (
        <>
          <div style={{ padding: 24, marginBottom: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }} data-testid="profile-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Signed in as
                </div>
                <div
                  style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", wordBreak: "break-all" }}
                  data-testid="profile-page-email"
                >
                  {user.email}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Role
                </div>
                <div style={{ fontSize: 14, fontWeight: 650, color: "var(--ink)" }} data-testid="profile-role">
                  {user.role || "user"}
                </div>
              </div>
              {user.created_at && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "var(--faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Member since
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 650, color: "var(--ink)" }}
                    data-testid="profile-created"
                  >
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  Verified answers
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 650, color: "var(--ink)" }}
                  data-testid="profile-verified-count"
                >
                  {appState.verifiedCount}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 20, marginBottom: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--ink)" }}>
              Account actions
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                className="btn btn-ghost"
                onClick={() => router.push("/connect")}
                data-testid="profile-action-databases"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-2)",
                  color: "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 99,
                  cursor: "pointer",
                }}
              >
                Manage databases
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => router.push("/chat")}
                data-testid="profile-action-chat"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-2)",
                  color: "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 99,
                  cursor: "pointer",
                }}
              >
                Back to chat
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => appState.logout(router)}
                data-testid="profile-action-logout"
                style={{
                  background: "transparent",
                  border: "1px solid #EBC6BD",
                  color: "var(--c-low-ink)",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 99,
                  cursor: "pointer",
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

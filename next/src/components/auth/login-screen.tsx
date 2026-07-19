"use client";

import { useState } from "react";
import Link from "next/link";
import { apiCall, isExpectedClientError } from "@/lib/api";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiCall("/api/auth/login", { email, password });
      const encoder = new TextEncoder();
      const hash = await crypto.subtle.digest("SHA-256", encoder.encode(email));
      const anonymousId = Array.from(new Uint8Array(hash).slice(0, 8))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const posthog = await import("posthog-js").then((m) => m.default);
      posthog.identify(anonymousId);
      posthog.capture("user_logged_in", { method: "email" });
      onLogin();
    } catch (err: any) {
      setError(err.message || "Login failed");
      if (!isExpectedClientError(err)) {
        const posthog = await import("posthog-js").then((m) => m.default);
        posthog.captureException(err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card rise auth-card" data-testid="login-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your BoloDB account</p>
        </div>

        <form onSubmit={login} className="auth-form" data-testid="login-form">
          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              id="email"
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              data-testid="login-email-input"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="auth-label">Password</label>
            <div className="auth-field-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: 42 }}
                data-testid="login-password-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-forgot-link">
            <Link href="/forgot-password" data-testid="login-forgot-link">Forgot password?</Link>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="auth-error" data-testid="login-error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={"btn btn-primary btn-block" + (loading ? " disabled" : "")}
            disabled={loading}
            style={{ marginTop: 4 }}
            data-testid="login-submit-button"
          >
            {loading && <span className="spin" style={{width:16,height:16,borderRadius:99,border:"2.2px solid var(--border-2)",borderTopColor:"var(--brand)",display:"inline-block",verticalAlign:"middle",marginRight:6}}></span>}
            {loading ? "Signing in\u2026" : "Sign in"}
          </button>
        </form>

        <GoogleSignIn onSuccess={onLogin} />

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup" data-testid="login-signup-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

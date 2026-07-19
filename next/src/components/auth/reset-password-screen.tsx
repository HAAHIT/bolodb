"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
] as const;

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordChecks = useMemo(
    () => passwordRules.map((r) => ({ label: r.label, met: r.test(password) })),
    [password],
  );
  const passwordValid = passwordChecks.every((c) => c.met);
  const canSubmit = !!token && passwordValid && !loading;

  useEffect(() => {
    if (done) {
      const id = setTimeout(() => router.push("/login"), 2500);
      return () => clearTimeout(id);
    }
  }, [done, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await apiCall("/api/auth/reset-password", { token, new_password: password });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card rise auth-card" data-testid="reset-password-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          <h1 className="auth-title">Set a new password</h1>
          <p className="auth-subtitle">Choose a strong password to secure your account.</p>
        </div>

        {!token ? (
          <>
            <div className="auth-error" role="alert" data-testid="reset-no-token">
              This link is invalid or missing a reset token. Please request a new reset link.
            </div>
            <div className="auth-footer">
              <Link href="/forgot-password">Request a new link &rarr;</Link>
            </div>
          </>
        ) : done ? (
          <div role="status" aria-live="polite" className="auth-success" data-testid="reset-success">
            Password reset successfully.<br />
            Redirecting you to sign in&hellip;
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" data-testid="reset-password-form">
            <div>
              <label htmlFor="password" className="auth-label">New password</label>
              <div className="auth-field-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  style={{ paddingRight: 42 }}
                  data-testid="reset-password-input"
                  autoComplete="new-password"
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

            <ul className="auth-checks" aria-live="polite">
              {passwordChecks.map((check, i) => (
                <li key={i} className={"auth-check" + (check.met ? " met" : "")}>
                  <span className="auth-check-dot">
                    {check.met && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </span>
                  {check.label}
                </li>
              ))}
            </ul>

            {error && (
              <div role="alert" aria-live="polite" className="auth-error" data-testid="reset-error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={"btn btn-primary btn-block" + (!canSubmit ? " disabled" : "")}
              disabled={!canSubmit}
              data-testid="reset-submit-button"
            >
              {loading && <span className="spinner" />}
              {loading ? "Resetting\u2026" : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/api";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      await apiCall("/api/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card rise auth-card" data-testid="forgot-password-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send reset instructions if you have an account.</p>
        </div>

        {sent ? (
          <>
            <div role="status" aria-live="polite" className="auth-success" data-testid="forgot-password-sent">
              Check your email for reset instructions.<br />
              If you don&apos;t see the message, please check spam.
            </div>
            <div className="auth-footer">
              <Link href="/login" data-testid="forgot-back-to-login">&larr; Back to sign in</Link>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form" data-testid="forgot-password-form">
              <div>
                <label htmlFor="email" className="auth-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  data-testid="forgot-email-input"
                  autoComplete="email"
                  required
                />
              </div>

              {error && (
                <div role="alert" aria-live="polite" className="auth-error" data-testid="forgot-error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={"btn btn-primary btn-block" + (!email.trim() || loading ? " disabled" : "")}
                disabled={!email.trim() || loading}
                data-testid="forgot-submit-button"
              >
                {loading && <span className="spinner" />}
                {loading ? "Sending\u2026" : "Send reset link"}
              </button>
            </form>

            <div className="auth-footer">
              Remembered your password?{" "}
              <Link href="/login" data-testid="forgot-signin-link">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

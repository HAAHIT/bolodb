"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall, isExpectedClientError } from "@/lib/api";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
] as const;

export function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordChecks = useMemo(
    () => passwordRules.map((r) => ({ label: r.label, met: r.test(password) })),
    [password],
  );
  const passwordValid = passwordChecks.every((c) => c.met);
  const canSubmit = email.trim().length > 0 && passwordValid && !loading;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await apiCall("/api/auth/signup", { email, password });
      const posthog = await import("posthog-js").then((m) => m.default);
      posthog.identify(email, { email });
      posthog.capture("user_signed_up", { method: "email" });
      setSuccess(true);
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1500);
    } catch (err: any) {
      setError(err.message || "Signup failed");
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
      <div className="card rise auth-card" data-testid="signup-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          <h1 className="auth-title">Create an account</h1>
          <p className="auth-subtitle">Join BoloDB today &mdash; no credit card required</p>
        </div>

        {success ? (
          <div role="status" aria-live="polite" className="auth-success" data-testid="signup-success-message">
            Account created! Check your email for the verification code.
          </div>
        ) : (
          <>
            <form onSubmit={handleSignup} className="auth-form" data-testid="signup-form">
              <div>
                <label htmlFor="email" className="auth-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  data-testid="signup-email-input"
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
                    data-testid="signup-password-input"
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
                  <li key={i} className={`auth-check ${check.met ? "met" : ""}`}>
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
                <div role="alert" aria-live="polite" className="auth-error" data-testid="signup-error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={"btn btn-primary btn-block" + (!canSubmit ? " disabled" : "")}
                disabled={!canSubmit}
                style={{ marginTop: 4 }}
                data-testid="signup-submit-button"
              >
                {loading ? "Creating account\u2026" : "Sign up"}
              </button>
            </form>

            <GoogleSignIn onSuccess={() => router.push("/onboard")} mode="signup" />

            <div className="auth-footer">
              Already have an account?{" "}
              <Link href="/login" data-testid="signup-signin-link">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

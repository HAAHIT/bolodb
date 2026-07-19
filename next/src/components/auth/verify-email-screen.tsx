"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";

export function VerifyEmailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);

  useEffect(() => {
    if (cooldown === null) return;
    const id = setInterval(() => {
      setCooldown((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || loading || !email) return;
    setLoading(true);
    setError("");
    try {
      await apiCall("/api/auth/verify-email", { email, code: code.trim() });
      const posthog = await import("posthog-js").then((m) => m.default);
      posthog.capture("email_verified", { method: "otp" });
      router.push("/onboard");
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendLoading || cooldown !== null || !email) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    try {
      await apiCall("/api/auth/resend-verification", { email });
      setResendSuccess(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card rise auth-card" data-testid="verify-email-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to<br />
            <strong>{email || "your email"}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="auth-form" data-testid="verify-email-form">
          <div>
            <label htmlFor="code" className="auth-label">Verification code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="field otp-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              autoComplete="one-time-code"
              data-testid="verify-email-code-input"
              required
            />
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="auth-error" data-testid="verify-email-error">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div role="status" aria-live="polite" className="auth-success" data-testid="verify-email-resent">
              New code sent. Check your inbox.
            </div>
          )}

          <button
            type="submit"
            className={"btn btn-primary btn-block" + (!code.trim() || code.trim().length < 6 || loading ? " disabled" : "")}
            disabled={!code.trim() || code.trim().length < 6 || loading}
            style={{ marginTop: 4 }}
            data-testid="verify-email-submit-button"
          >
            {loading ? "Verifying\u2026" : "Verify & sign in"}
          </button>
        </form>

        <div className="auth-footer">
          {cooldown !== null ? (
            <span className="verify-cooldown">Resend code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              className="verify-resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
              data-testid="verify-email-resend-button"
            >
              {resendLoading ? "Sending\u2026" : "Resend code"}
            </button>
          )}
        </div>

        <div className="auth-footer">
          <Link href="/login" data-testid="verify-email-back-link">&larr; Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}

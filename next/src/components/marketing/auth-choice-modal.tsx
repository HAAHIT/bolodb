"use client";

import { useEffect, useState, useCallback } from "react";

interface AuthChoiceModalProps {
  open: boolean;
  mode: "signup" | "login";
  onClose: () => void;
}

export function AuthChoiceModal({ open, mode, onClose }: AuthChoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = mode === "signup" ? "Get started with BoloDB" : "Welcome back to BoloDB";
  const emailAltLabel = mode === "signup" ? "Use email instead" : "Sign in with email instead";
  const emailAltPath = mode === "signup" ? "/signup" : "/login";

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/config/public");
      const config = await res.json();
      const supabaseUrl = config.supabase_url;
      if (!supabaseUrl) {
        setError("Google sign-in isn't configured yet. Please use email instead.");
        setLoading(false);
        return;
      }
      const { default: posthog } = await import("posthog-js");
      posthog.capture(mode === "signup" ? "auth_google_started" : "auth_google_login_started");
      const redirectTo = window.location.origin + "/auth/callback";
      window.location.href = supabaseUrl + "/auth/v1/authorize?provider=google&redirect_to=" + encodeURIComponent(redirectTo);
    } catch (e: any) {
      setError(e.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleEmailAlt = async () => {
    const { default: posthog } = await import("posthog-js");
    posthog.capture(mode === "signup" ? "auth_email_selected" : "auth_email_login_selected");
    onClose();
    window.location.href = emailAltPath;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabIndex={-1} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal" style={{ position: "relative" }}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 id="auth-modal-title" style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>{title}</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "13.5px", lineHeight: 1.5 }}>Continue with Google in one click — or use email if you prefer.</p>
        </div>
        {error && (
          <div role="alert" aria-live="polite" className="auth-error" style={{ marginBottom: 14 }}>{error}</div>
        )}
        <button className="auth-modal-google" onClick={handleGoogle} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
        <button className="auth-modal-alt" onClick={handleEmailAlt}>{emailAltLabel}</button>
      </div>
    </div>
  );
}

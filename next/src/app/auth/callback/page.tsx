"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseGoogleLogin } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));

        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");
        const accessToken = params.get("access_token");

        if (!accessToken) {
          setError(
            errorDescription || errorParam || "No access token received from Supabase",
          );
          setProcessing(false);
          return;
        }

        await supabaseGoogleLogin(accessToken);
        window.location.hash = "";
        router.push("/chat");
      } catch (err: any) {
        setError(err.message || "Authentication failed");
        setProcessing(false);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="auth-page">
      <div className="card rise auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <Link href="/" className="text-2xl font-bold">BoloDB</Link>
          </div>
          {error ? (
            <>
              <h1 className="auth-title">Authentication failed</h1>
              <p className="auth-subtitle">Something went wrong during sign-in.</p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Signing you in</h1>
              <p className="auth-subtitle">Please wait while we complete your authentication.</p>
            </>
          )}
        </div>

        {error ? (
          <>
            <div role="alert" aria-live="polite" className="auth-error" data-testid="callback-error">
              {error}
            </div>
            <div className="auth-footer">
              <Link href="/login">&larr; Back to sign in</Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <span className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

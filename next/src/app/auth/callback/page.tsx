"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { supabaseGoogleLogin } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push("/login");
        return;
      }

      const { session } = data;

      if (session.user.app_metadata.provider === "google") {
        try {
          await supabaseGoogleLogin(session.provider_token ?? session.access_token);
        } catch {
          // Continue anyway
        }
      }

      router.push("/chat");
      router.refresh();
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}

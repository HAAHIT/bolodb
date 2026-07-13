<script lang="ts">
  import { apiCall } from "$lib/api";
  import LL from "$lib/i18n/i18n-svelte";
  import posthog from "posthog-js";

  let { onSuccess }: { onSuccess: () => void } = $props();

  let googleReady = $state(false);
  let error = $state("");

  $effect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      googleReady = true;
      return;
    }
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        googleReady = true;
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  });

  async function handleGoogleLogin(response: any) {
    try {
      const data = await googleLogin(response.credential);
      posthog.capture("user_logged_in", { method: "google" });
      onSuccess();
    } catch (err: any) {
      error = err.message || $LL.auth.loginFailed();
    }
  }

  async function googleLogin(idToken: string): Promise<any> {
    return apiCall("/api/auth/google", {
      id_token: idToken,
      client_id: window.__GOOGLE_CLIENT_ID__ || "",
    });
  }

  function initGSI() {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: window.__GOOGLE_CLIENT_ID__!,
      callback: handleGoogleLogin,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("gsi-button")!,
      { theme: "outline", size: "large", width: 316 }
    );
  }

  $effect(() => {
    if (googleReady) initGSI();
  });
</script>

<div style="width:100%;display:flex;flex-direction:column;align-items:center">
  {#if error}
    <div
      style="margin-bottom:10px;padding:8px 12px;background:#FFF8ED;border:1px solid #F5D78A;border-radius:var(--radius-sm);color:#7A5C0A;font-size:13px;font-weight:550"
    >
      {error}
    </div>
  {/if}
  <div id="gsi-button" style="min-height:40px"></div>
</div>

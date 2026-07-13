<script lang="ts">
  import { apiCall } from "$lib/api";
  import Logo from "$lib/components/ui/Logo.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Spinner from "$lib/components/ui/Spinner.svelte";
  import { goto } from "$app/navigation";
  import LL from "$lib/i18n/i18n-svelte";
  import posthog from "posthog-js";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);

  const passwordRules = [
    { label: $LL.auth.passwordMinLength, test: (p: string) => p.length >= 8 },
    { label: $LL.auth.passwordUpperLower, test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
    { label: $LL.auth.passwordNumber, test: (p: string) => /[0-9]/.test(p) },
  ];

  const passwordChecks = $derived(passwordRules.map((r) => ({ label: r.label, met: r.test(password) })));
  const passwordValid = $derived(passwordChecks.every((c) => c.met));
  const canSubmit = $derived(email.trim().length > 0 && passwordValid && !loading);

  async function signup(e: Event) {
    e.preventDefault();
    if (!canSubmit) return;
    loading = true;
    error = "";
    try {
      await apiCall("/api/auth/signup", { email, password });
      posthog.identify(email, { email });
      posthog.capture("user_signed_up", { method: "email" });
      success = true;
      setTimeout(() => goto("/login"), 2000);
    } catch (err: any) {
      error = err.message || $LL.auth.signupFailed();
      posthog.captureException(err);
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="page"
  style="display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg)"
>
  <div
    class="card rise"
    style="width:100%;max-width:400px;padding:40px;box-sizing:border-box"
  >
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:flex;justify-content:center;margin-bottom:16px">
        <Logo size={40} />
      </div>
      <h1 style="margin:0;font-size:24px;font-weight:700">{$LL.auth.createAccount()}</h1>
      <p style="margin:8px 0 0;color:var(--muted);font-size:14.5px">
        {$LL.auth.joinBoloDB()}
      </p>
    </div>

    {#if success}
      <div
        style="padding:16px;background:var(--brand-tint);border:1px solid var(--brand-tint-2);border-radius:var(--radius);color:var(--brand-ink);text-align:center;font-weight:550;line-height:1.5"
      >
        {$LL.auth.signUpSuccess()}<br />
        Redirecting you to login…
      </div>
    {:else}
      <form
        onsubmit={signup}
        style="display:flex;flex-direction:column;gap:16px"
      >
        <div>
          <label
            for="email"
            style="display:block;font-size:12px;font-weight:700;color:var(--faint);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em"
            >{$LL.common.email()}</label
          >
          <input
            id="email"
            type="email"
            class="field"
            bind:value={email}
            placeholder={$LL.auth.emailPlaceholder()}
            style="width:100%;box-sizing:border-box"
            required
          />
        </div>
        <div>
          <label
            for="password"
            style="display:block;font-size:12px;font-weight:700;color:var(--faint);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em"
            >{$LL.common.password()}</label
          >
          <input
            id="password"
            type="password"
            class="field"
            bind:value={password}
            placeholder={$LL.auth.passwordPlaceholder()}
            style="width:100%;box-sizing:border-box"
            required
          />
        </div>

        <ul aria-live="polite" style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:5px">
          {#each passwordChecks as check}
            <li style="display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:{check.met ? 'var(--brand-ink)' : 'var(--faint)'};transition:color .15s var(--ease)">
              <span style="width:15px;height:15px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:{check.met ? 'var(--brand)' : 'transparent'};border:1.5px solid {check.met ? 'var(--brand)' : 'var(--border-2)'};transition:all .15s var(--ease)">
                {#if check.met}
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.2L19 7" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {/if}
              </span>
              {check.label}
            </li>
          {/each}
        </ul>

        {#if error}
          <div
            style="padding:10px 14px;background:#FFF8ED;border:1px solid #F5D78A;border-radius:var(--radius-sm);color:#7A5C0A;font-size:13px;font-weight:550"
          >
            {error}
          </div>
        {/if}

        <Button
          kind="primary"
          class="btn-block"
          disabled={!canSubmit}
          style="margin-top:8px"
        >
          {#snippet icon()}
            {#if loading}<Spinner />{/if}
          {/snippet}
          {loading ? $LL.auth.signingUp() : $LL.auth.signUp()}
        </Button>
      </form>

      <div
        style="text-align:center;margin-top:24px;font-size:13.5px;color:var(--muted)"
      >
        {$LL.auth.alreadyHaveAccount()} <a
          href="/login"
          style="color:var(--brand-ink);font-weight:650;text-decoration:none"
          >{$LL.auth.signIn()}</a
        >
      </div>
    {/if}
  </div>
</div>

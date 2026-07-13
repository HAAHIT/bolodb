import posthog from "posthog-js";
import { env } from "$env/dynamic/public";
import type { HandleClientError } from "@sveltejs/kit";
import { detectLocale } from "$lib/i18n/i18n-util";
import { loadLocaleAsync } from "$lib/i18n/i18n-util.async";
import { setLocale } from "$lib/i18n/i18n-svelte";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function init() {
  const token = env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return;
  const apiHost = env.PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  posthog.init(token, {
    api_host: apiHost,
    ui_host: apiHost.replace("i.posthog.com", "posthog.com"),
    defaults: "2026-01-30",
    capture_exceptions: true,
  });

  const detected = detectLocale(
    () => {
      const c = getCookie("locale");
      return c ? [c] : [];
    },
    () => (typeof navigator !== "undefined" ? [...navigator.languages] : []),
  );
  await loadLocaleAsync(detected);
  setLocale(detected);
}

export const handleError: HandleClientError = async ({ error, message }) => {
  if (env.PUBLIC_POSTHOG_PROJECT_TOKEN) {
    posthog.captureException(error);
  }
  return { message };
};

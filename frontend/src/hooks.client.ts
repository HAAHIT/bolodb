import posthog from "posthog-js";
import { env } from "$env/dynamic/public";
import type { HandleClientError } from "@sveltejs/kit";

export async function init() {
  const token = env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  // Analytics is optional — skip init entirely when no token is configured
  // (local dev, self-hosters) instead of initialising with an empty key.
  if (!token) return;
  posthog.init(token, {
    api_host: env.PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
  });
}

export const handleError: HandleClientError = async ({ error, message }) => {
  if (env.PUBLIC_POSTHOG_PROJECT_TOKEN) {
    posthog.captureException(error);
  }
  return { message };
};

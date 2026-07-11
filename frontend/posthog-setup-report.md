<wizard-report>
# PostHog post-wizard report

The wizard has completed a full client-side PostHog integration for BoloDB, a SvelteKit SPA using `adapter-static`. PostHog is initialised in `src/hooks.client.ts` (the SvelteKit client hook that runs once on app start in the browser). Because the project builds to a static site with no server-side rendering, only `posthog-js` is used — no `posthog-node`. Session replay is enabled and configured correctly via `paths.relative: false` in the newly created `svelte.config.js`. Client-side error tracking is wired up in both `hooks.client.ts` (global `handleError`) and inline at every API call boundary. Users are identified with `posthog.identify()` on email login and email signup; `posthog.reset()` is called on logout to unlink future events.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a user successfully creates an account with email and password. | `src/lib/components/SignupScreen.svelte` |
| `user_logged_in` | Fired when a user successfully signs in with email and password. | `src/lib/components/LoginScreen.svelte` |
| `user_logged_out` | Fired on logout before PostHog identity is reset. | `src/lib/appState.svelte.ts` |
| `google_auth_completed` | Fired when a user completes Google OAuth sign-in or sign-up. | `src/lib/components/GoogleSignIn.svelte` |
| `api_key_configured` | Fired when the user successfully saves their Gemini API key. | `src/lib/components/ConnectScreen.svelte` |
| `database_connected` | Fired when a user successfully connects to a database (custom or sample). | `src/lib/components/ConnectScreen.svelte` |
| `database_reconnected` | Fired when a user reconnects to a previously used database from the recent list. | `src/lib/components/ConnectScreen.svelte` |
| `query_submitted` | Fired when a user submits a natural language question to the AI. | `src/lib/components/AskScreen.svelte` |
| `query_verified` | Fired when a user submits a verdict (correct or wrong) on an AI-generated query. | `src/lib/components/AskScreen.svelte` |
| `onboarding_completed` | Fired when a user finishes the onboarding seeding step and proceeds to the chat. | `src/lib/appState.svelte.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/472722/dashboard/1833596)
- [User Signups & Logins](https://us.posthog.com/project/472722/insights/NRWNk0b2)
- [Signup to DB Connection Funnel](https://us.posthog.com/project/472722/insights/bGZcqnlh)
- [Queries Submitted Over Time](https://us.posthog.com/project/472722/insights/9xsypIg6)
- [Query Verifications by Verdict](https://us.posthog.com/project/472722/insights/CtpCilU8)
- [Database Connection Types](https://us.posthog.com/project/472722/insights/YBZhAbkj)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `PUBLIC_POSTHOG_PROJECT_TOKEN` and `PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs. Consider storing the email in `sessionStorage` on login and calling `posthog.identify()` inside `appState.init()` when the user is found to be connected, or expose the email from the `/api/state` endpoint.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

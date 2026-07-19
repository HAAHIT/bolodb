# Next.js Frontend Migration Design

**Date:** 2026-07-19
**Status:** Draft
**Context:** Migrate the existing SvelteKit 5 frontend to Next.js 15 App Router. New frontend lives in `/next/` alongside existing `/frontend/`. Big-bang switchover when complete — `MIGRATE=True` env var controls which frontend is used in docker-compose and Dockerfile.render.

## Goals

- Full feature parity with the current SvelteKit frontend
- Modern, responsive auth pages built from scratch with Google OAuth
- Better responsive design across all screen sizes
- Same GSAP/Lenis animations on marketing landing page
- Tailwind CSS v4 + Shadcn UI component mix
- next-intl for i18n (5 languages: en, de, es, fr, ja)
- TanStack Query for server state
- nginx stays as reverse proxy: nginx → Next.js (:3000) for pages, nginx → Python (:4321) for /api/
- `next-themes` for theme, `sonner` for toasts, URL search params for shareable state

## Non-Goals

- Do NOT change the Python backend or its API
- Do NOT modify the existing `/frontend/` directory until switchover
- Do NOT add features not present in the current app (scope discipline)
- Do NOT deploy the Next.js frontend to production until fully complete

## Project Layout

```
/next/                     # New Next.js app
├── src/
│   ├── app/               # App Router pages
│   │   ├── layout.tsx           # Root: next-themes, next-intl, PostHog, fonts
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx       # Lenis + GSAP, MarketingNav, Footer
│   │   │   └── page.tsx         # Landing page (Hero, LiveDemo, Pipeline, etc.)
│   │   ├── (app)/
│   │   │   ├── layout.tsx       # Navbar, Sidebar, TanStack Query provider
│   │   │   ├── chat/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── connect/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── auth/callback/page.tsx
│   │   ├── onboard/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── components/
│   │   ├── ui/            # Shadcn primitives
│   │   ├── chat/          # AskScreen, Sidebar, AnswerCard, Thinking
│   │   ├── marketing/     # Hero, Pipeline, Flywheel, etc.
│   │   ├── auth/          # LoginScreen, SignupScreen, GoogleSignIn
│   │   └── onboard/       # Stepper, ProfileStep, GlossaryStep
│   ├── lib/
│   │   ├── api.ts         # API client (TanStack Query fetchers)
│   │   ├── types.ts       # TypeScript types
│   │   └── utils.ts       # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # next-intl config + translations
│   └── styles/            # Tailwind v4 base CSS
├── public/
│   ├── fonts/
│   └── favicon.svg
├── messages/              # next-intl JSON locale files
├── next.config.ts
├── package.json
├── tsconfig.json
├── DOCKERFILE             # Production build
├── DOCKERFILE.dev         # Dev server
└── .dockerignore
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn UI (v4-compatible) + custom |
| i18n | next-intl |
| Server state | TanStack Query |
| Theme | next-themes |
| Toasts | sonner |
| Animation | GSAP + Lenis |
| Charts | Recharts (replaces layerchart) |
| Analytics | PostHog (posthog-js) |
| Auth | Supabase SSR client |

## Data Flow

```
Browser → nginx (:80)
  ├── /api/* → Python Backend (:4321)
  │              ├── POST /api/query (SSE streaming)
  │              ├── GET/POST /api/catalog
  │              ├── GET/POST /api/conversations
  │              └── ...
  └── /* → Next.js (:3000)
              ├── Server Components (static/seo pages)
              └── Client Components (TanStack Query for dynamic data)
```

## Page Routing

| Route | Component | Layout |
|---|---|---|
| / | (marketing)/page.tsx | marketing layout → root |
| /login | login/page.tsx | root only |
| /signup | signup/page.tsx | root only |
| /forgot-password | forgot-password/page.tsx | root only |
| /reset-password | reset-password/page.tsx | root only |
| /verify-email | verify-email/page.tsx | root only |
| /auth/callback | auth/callback/page.tsx | root only |
| /onboard | onboard/page.tsx | root only |
| /chat | (app)/chat/page.tsx | app layout → root |
| /connect | (app)/connect/page.tsx | app layout → root |
| /dashboard | (app)/dashboard/page.tsx | app layout → root |
| /profile | (app)/profile/page.tsx | app layout → root |
| /privacy | privacy/page.tsx | root only |
| /terms | terms/page.tsx | root only |

## Infrastructure: docker-compose.yml

Next.js service added with Docker Compose profiles. `MIGRATE=True` activates the `migrate` profile (Next.js), absence or False activates `legacy` (SvelteKit).

### Next.js dev service

```yaml
nextjs:
  profiles: ["migrate"]
  build:
    context: ./next
    dockerfile: DOCKERFILE.dev
  container_name: bolodb-nextjs
  volumes:
    - ./next:/app
    - /app/node_modules
    - /app/.next
  ports:
    - "3000:3000"
  environment:
    - BACKEND_URL=http://backend:4321
    - PUBLIC_POSTHOG_PROJECT_TOKEN=${PUBLIC_POSTHOG_PROJECT_TOKEN}
    - PUBLIC_POSTHOG_HOST=${PUBLIC_POSTHOG_HOST:-https://us.i.posthog.com}
    - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
  depends_on:
    backend:
      condition: service_healthy
  networks:
    - bolodb-net
```

### nginx config switching

Two nginx configs:
- `nginx/nginx.conf` — current, proxies to `frontend:5173`
- `nginx/nginx.conf.next` — new, proxies to `nextjs:3000`

The nginx Dockerfile copies the appropriate config based on `MIGRATE` build arg, or a wrapper script selects at runtime.

## Infrastructure: DOCKERFILE.render

```dockerfile
FROM node:26-alpine AS next-builder
WORKDIR /app
COPY next/package.json next/package-lock.json* ./
RUN npm ci
COPY next/ .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_POSTHOG_PROJECT_TOKEN
ARG PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    PUBLIC_POSTHOG_PROJECT_TOKEN=$PUBLIC_POSTHOG_PROJECT_TOKEN \
    PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/default

WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY backend/ /app/backend/

# Next.js standalone output
COPY --from=next-builder /app/.next/standalone /app/next
COPY --from=next-builder /app/public /app/next/public
COPY --from=next-builder /app/.next/static /app/next/.next/static

COPY nginx.conf.render /etc/nginx/conf.d/default.conf

RUN addgroup --system bolodb && adduser --system --home /home/bolodb --ingroup bolodb bolodb \
    && mkdir -p /home/bolodb/.bolodb && chown -R bolodb:bolodb /home/bolodb/.bolodb /app

EXPOSE 80
CMD sh -c "nginx -g 'daemon off;' & node /app/next/server.js & exec python -m uvicorn backend.app.server:create_app --factory --host 0.0.0.0 --port 4321 --log-level info"
```

## Implementation Order

| Phase | Deliverables |
|---|---|
| 1. Scaffold | Init Next.js project, Tailwind v4, Shadcn, next-intl, TanStack Query, nginx configs, Docker profiles |
| 2. Auth pages | `/login`, `/signup` (from scratch, modern, Google OAuth), `/forgot-password`, `/reset-password`, `/verify-email` |
| 3. Layouts | Root layout, app layout, Navbar, Sidebar |
| 4. Connect | `/connect` — DB connection form |
| 5. Onboard | `/onboard` — 3-step wizard |
| 6. Chat | `/chat` — AskScreen, Sidebar, AnswerCard, SSE streaming |
| 7. Dashboard | `/dashboard` — stats, charts |
| 8. Profile | `/profile` — settings, API keys |
| 9. Marketing | `/` — GSAP landing page |
| 10. Static | `/privacy`, `/terms` |
| 11. Switchover | Update docker-compose default, DOCKERFILE.render, delete `/frontend` |

## Key Implementation Details

### SSE Streaming (Chat)
- TanStack Query with `queryFn` using `fetch` + `ReadableStream` reader
- Parse `data: ` SSE lines into typed event objects (same `StreamEvent` union type)
- AbortController for cancellation
- Same streaming state machine as current: thinking artifacts → SQL → result → confidence

### Marketing Page Animations
- `(marketing)/layout.tsx` is a client component that initializes Lenis + GSAP
- Individual sections (Hero, Pipeline, etc.) are client components using `useGSAP()` hook
- Motion preference detection via `prefers-reduced-motion` media query

### i18n
- `next-intl` with cookie-based locale detection (mirror current approach)
- Fallback to `Accept-Language` header
- Locale files migrated from current TypeScript to next-intl JSON format
- `next-intl` middleware handles routing + locale detection

### Auth
- Supabase SSR client (`@supabase/ssr`)
- Google OAuth redirect handled on `/auth/callback`
- Session stored in cookies (Supabase SSR pattern)
- TanStack Query invalidates on login/logout

### Theme
- `next-themes` wrapping `<ThemeProvider>`
- Reads localStorage with `attribute="data-theme"` (same as current)
- Toggle in Navbar and Settings

### Charts
- Recharts replaces layerchart (more React/Next.js compatible)
- Same chart types: bar, pie, line, donut, gauge, timeline

## Files to Create (summary)

- `/next/` — Complete Next.js project (~80+ files)
- `nginx/nginx.conf.next` — Nginx config pointing to Next.js
- `docker-compose.yml` — Add Next.js service + profile support
- `DOCKERFILE.render` — Add conditional/when-ready Next.js build stage

## GitHub Epic Issue

Create a GitHub Epic issue tracking all 11 phases with checkboxes for each. Sub-items for individual pages/components within phases. Title: "Migrate frontend from SvelteKit to Next.js"

## Testing

- Each phase verified via `npm run dev` against local backend
- Lint: `next lint`
- TypeScript: `tsc --noEmit`
- Build: `npm run build`

## Files Referenced (for implementation reference)

- `frontend/src/lib/api.ts` — API client patterns
- `frontend/src/lib/types.ts` — TypeScript types
- `frontend/src/lib/appState.svelte.ts` — State management patterns
- `frontend/src/lib/components/*` — All existing component implementations
- `frontend/src/lib/i18n/*` — Translation files
- `frontend/src/routes/*` — Current page implementations
- `frontend/src/app.html` — HTML shell
- `docker-compose.yml` — Current Docker setup
- `DOCKERFILE.render` — Current Render deployment
- `nginx.conf.render` — Current nginx config
- `nginx/nginx.conf` — Current dev nginx config

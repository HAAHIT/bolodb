# Next.js Frontend Migration — Implementation Plan (Part 1/2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a feature-complete Next.js 15 App Router frontend at `/next/` to replace the existing SvelteKit frontend at `/frontend/`, with big-bang switchover controlled by `MIGRATE` env var.

**Architecture:** Next.js App Router with nginx as reverse proxy (nginx → Next.js :3000 for pages, nginx → Python :4321 for /api/). `output: 'standalone'` for single-container Render deployment. TanStack Query for server state, next-intl for i18n, next-themes+sonner for theme/toasts. Tailwind v4 + Shadcn UI for components.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Shadcn UI, next-intl, TanStack Query v5, next-themes, sonner, GSAP, Lenis, Recharts, Supabase SSR, PostHog

## Global Constraints

- All API calls go through `/api/*` proxy to Python backend (no Next.js API routes)
- `output: 'standalone'` in next.config.ts for Render deployment
- nginx stays as reverse proxy (not removed)
- Marketing page keeps GSAP + Lenis animations, improved responsive
- Auth pages built from scratch with modern design + Google OAuth buttons
- Tailwind CSS v4 (not v3)
- i18n with next-intl, 5 languages (en, de, es, fr, ja)
- URL search params for shareable state (conversationId, view mode)
- Existing `/frontend/` directory untouched until final switchover
- `MIGRATE=True` activates Next.js in docker configs
- `npm run build` must pass before any phase is considered complete
- `npm run lint` must pass with zero errors

---

## File Structure Reference

```
/next/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── error.tsx                     # Error boundary
│   │   ├── globals.css                   # Tailwind base + shadcn CSS variables
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx               # Lenis + GSAP (Phase 9)
│   │   │   └── page.tsx                 # Landing page (Phase 9)
│   │   ├── (app)/
│   │   │   ├── layout.tsx               # Navbar wrapper
│   │   │   ├── chat/page.tsx            # Chat (Phase 6)
│   │   │   ├── dashboard/page.tsx       # Dashboard (Phase 7)
│   │   │   ├── connect/page.tsx         # Connect (Phase 4)
│   │   │   └── profile/page.tsx         # Profile (Phase 8)
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
│   │   ├── ui/                          # Shadcn-generated primitives
│   │   ├── chat/                        # AskScreen, Sidebar, AnswerCard, Thinking
│   │   ├── marketing/                   # Hero, Flywheel, Pipeline, etc.
│   │   ├── auth/                        # LoginScreen, SignupScreen, GoogleSignIn
│   │   ├── onboard/                     # Stepper, OnboardScreen
│   │   ├── dashboard/                   # DashboardTab, ChartCard, charts/
│   │   ├── connect/                     # ConnectScreen
│   │   ├── settings/                    # Settings, SettingsTab, DataCatalog
│   │   └── shared/                      # Navbar, Logo, Spinner, etc.
│   ├── lib/
│   │   ├── api.ts                       # API client (fetch wrappers + SSE)
│   │   ├── types.ts                     # All TypeScript types
│   │   ├── data.ts                      # Static data + utilities
│   │   ├── utils.ts                     # cn(), formatTime(), humanError()
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── server.ts               # Server Supabase client
│   │       └── middleware.ts           # Auth middleware
│   ├── hooks/
│   │   ├── use-stream-query.ts          # SSE streaming hook
│   │   ├── use-conversations.ts         # Conversation queries/mutations
│   │   └── use-posthog.ts              # PostHog analytics hook
│   ├── i18n/
│   │   └── request.ts                  # next-intl request config
│   ├── providers/
│   │   ├── query-provider.tsx          # TanStack Query provider
│   │   └── posthog-provider.tsx        # PostHog provider
│   └── middleware.ts                    # next-intl + Supabase auth middleware
├── messages/                            # JSON locale files (5 languages)
├── public/
│   ├── fonts/
│   │   ├── HankenGrotesk.woff2
│   │   └── JetBrainsMono.woff2
│   └── favicon.svg
├── next.config.ts
├── package.json
├── tsconfig.json
├── components.json                      # Shadcn config
├── i18n.config.ts
├── DOCKERFILE
├── DOCKERFILE.dev
└── .dockerignore
```

---

## Phase 1: Scaffold

### Task 1.1: Initialize Next.js project

**Files:**
- Create: `/next/package.json`
- Create: `/next/tsconfig.json`
- Create: `/next/next.config.ts`
- Create: `/next/.gitignore`

**Interfaces:** Produces basic Next.js project structure with App Router

- [ ] **Step 1: Create `/next/` directory and init project**

```bash
mkdir -p /next
cd /next
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --no-turbopack
```

- [ ] **Step 2: Update `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 3: Update `package.json` scripts**

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd /next && npm run build
```
Expected: Build succeeds, `.next/` directory created.

### Task 1.2: Install dependencies

**Files:** Modify: `/next/package.json`

- [ ] **Step 1: Init Shadcn and install components**

```bash
cd /next
npx shadcn@latest init -d
npx shadcn@latest add button input card dialog select tabs badge separator sheet \
  dropdown-menu avatar tooltip popover command scroll-area
```

- [ ] **Step 2: Install core libraries**

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install next-intl
npm install next-themes sonner
npm install posthog-js
npm install @supabase/ssr @supabase/supabase-js
npm install recharts
npm install gsap lenis
npm install clsx tailwind-merge lucide-react
```

Expected: All dependencies in `package.json`. Build passes.

### Task 1.3: Configure Tailwind v4 + Shadcn globals

**Files:**
- Create: `/next/src/app/globals.css`
- Create: `/next/components.json`
- Create: `/next/src/lib/utils.ts`

- [ ] **Step 1: Write `src/app/globals.css`**

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0.042 265.755);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.965 0.001 286.375);
  --secondary-foreground: oklch(0.205 0.042 265.755);
  --muted: oklch(0.965 0.001 286.375);
  --muted-foreground: oklch(0.556 0.008 286.375);
  --accent: oklch(0.965 0.001 286.375);
  --accent-foreground: oklch(0.205 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0.004 286.375);
  --input: oklch(0.922 0.004 286.375);
  --ring: oklch(0.205 0.042 265.755);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0.042 265.755);
  --secondary: oklch(0.269 0.015 286.375);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0.015 286.375);
  --muted-foreground: oklch(0.708 0.01 286.375);
  --accent: oklch(0.269 0.015 286.375);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.269 0.015 286.375);
  --input: oklch(0.269 0.015 286.375);
  --ring: oklch(0.439 0.023 286.375);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

* { border-color: var(--border); }
body { background: var(--background); color: var(--foreground); }
```

- [ ] **Step 2: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/app/globals.css", "baseColor": "zinc", "cssVariables": true },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "hooks": "@/hooks", "lib": "@/lib", "ui": "@/components/ui" }
}
```

- [ ] **Step 3: Create `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

export function humanError(error: string): string {
  if (error.includes("relation") && error.includes("does not exist")) return "Table not found"
  if (error.includes("column") && error.includes("does not exist")) return "Column not found"
  if (error.includes("syntax error")) return "Invalid SQL syntax"
  if (error.includes("permission denied")) return "Permission denied"
  return error
}
```

### Task 1.4: Setup providers

**Files:**
- Create: `/next/src/providers/query-provider.tsx`
- Create: `/next/src/providers/posthog-provider.tsx`
- Create: `/next/src/app/layout.tsx` (root layout)

- [ ] **Step 1: Create QueryProvider**

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Create PostHogProvider**

```typescript
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!token) return;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    posthog.init(token, {
      api_host: apiHost,
      ui_host: apiHost.replace("i.posthog.com", "posthog.com"),
      capture_exceptions: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") ph.opt_out_capturing();
      },
    });
  }, []);
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

- [ ] **Step 3: Create root layout**

```typescript
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoloDB — Ask your data in plain English",
  description: "Ask your data in plain English. Trust the answer you get back.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem("bolodb_theme");
                var theme = stored === "dark" ? "dark" : stored ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", theme);
              } catch(e) {}
            })();
          `,
        }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="data-theme" defaultTheme="dark" storageKey="bolodb_theme" enableSystem>
            <QueryProvider>
              <PostHogProvider>
                {children}
                <Toaster richColors position="top-right" />
              </PostHogProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
cd /next && npm run build
```
Expected: Build succeeds.

### Task 1.5: Configure next-intl

**Files:**
- Create: `/next/i18n.config.ts`
- Create: `/next/src/middleware.ts`
- Create: `/next/src/i18n/request.ts`
- Create: `/next/messages/en.json`
- Create: `/next/messages/de.json`
- Create: `/next/messages/es.json`
- Create: `/next/messages/fr.json`
- Create: `/next/messages/ja.json`
- Modify: `/next/next.config.ts`

**Reference:** `frontend/src/lib/i18n/*/index.ts` — copy key-value pairs into JSON.

- [ ] **Step 1: Create i18n config**

File: `i18n.config.ts`
```typescript
export const routing = {
  locales: ["en", "de", "es", "fr", "ja"],
  defaultLocale: "en",
  localeDetection: true,
} as const;

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Create middleware**

File: `src/middleware.ts`
```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "../i18n.config";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_ververcel|.*\\..*).*)"],
};
```

- [ ] **Step 3: Create i18n request**

File: `src/i18n/request.ts`
```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "../../i18n.config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Update next.config.ts**

```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Create `messages/en.json`** with all keys (extracted from `frontend/src/lib/i18n/en/index.ts`)

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "search": "Search",
    "confirm": "Confirm"
  },
  "auth": {
    "signIn": "Sign in",
    "signUp": "Sign up",
    "signOut": "Sign out",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "resetPassword": "Reset password",
    "verifyEmail": "Verify email",
    "googleSignIn": "Continue with Google",
    "or": "or",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  },
  "nav": {
    "chat": "Chat",
    "dashboard": "Dashboard",
    "connect": "Connect",
    "profile": "Profile",
    "settings": "Settings"
  },
  "chat": {
    "placeholder": "Ask a question about your data...",
    "thinking": "Thinking...",
    "runQuery": "Run query",
    "viewTable": "Table",
    "viewChart": "Chart",
    "viewSql": "SQL",
    "correct": "Correct",
    "wrong": "Wrong",
    "regenerate": "Regenerate",
    "copySql": "Copy SQL",
    "newConversation": "New conversation",
    "conversations": "Conversations",
    "noConversations": "No conversations yet"
  },
  "connect": {
    "title": "Connect your database",
    "dialect": "Database type",
    "connectionString": "Connection string",
    "test": "Test connection",
    "connect": "Connect",
    "sampleData": "Try with sample data"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalQueries": "Total queries",
    "verifiedQueries": "Verified queries"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System",
    "disconnect": "Disconnect database"
  },
  "onboard": {
    "step1": "Read your database schema",
    "step2": "Define business terms",
    "step3": "Verify starter queries",
    "skip": "Skip onboarding",
    "finish": "Finish"
  },
  "errors": {
    "general": "Something went wrong",
    "network": "Network error",
    "unauthorized": "Please sign in"
  }
}
```

- [ ] **Step 6:** Create `messages/de.json`, `messages/es.json`, `messages/fr.json`, `messages/ja.json` with translations extracted from corresponding files in `frontend/src/lib/i18n/`.

- [ ] **Step 7: Verify build**

```bash
cd /next && npm run build
```
Expected: Build succeeds with no i18n errors.

### Task 1.6: Setup Docker infrastructure

**Files:**
- Create: `/next/DOCKERFILE`
- Create: `/next/DOCKERFILE.dev`
- Create: `/next/.dockerignore`
- Create: `/nginx/nginx.conf.next`
- Modify: `/docker-compose.yml`

- [ ] **Step 1: Create DOCKERFILE.dev**

```dockerfile
FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- [ ] **Step 2: Create DOCKERFILE**

```dockerfile
FROM node:26-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: Create nginx config for Next.js**

File: `nginx/nginx.conf.next` — same as `nginx/nginx.conf` but `proxy_pass http://nextjs:3000;` instead of `http://frontend:5173;`.

- [ ] **Step 4: Update docker-compose.yml** — add Next.js service with `profiles: ["migrate"]` and update nginx service to use build arg for config switching.

- [ ] **Step 5: Create `.dockerignore`**

```
node_modules
.next
.git
*.md
.env
.env.local
```

- [ ] **Step 6: Verify build and commit Phase 1**

```bash
git add next/ docker-compose.yml nginx/nginx.conf.next
git commit -m "feat: scaffold Next.js project with Shadcn, i18n, providers, Docker setup"
```

---

## Phase 2: Auth Pages

### Task 2.1: Create Supabase SSR client

**Files:**
- Create: `/next/src/lib/supabase/client.ts`
- Create: `/next/src/lib/supabase/server.ts`
- Create: `/next/src/lib/supabase/middleware.ts`

- [ ] **Step 1: Create browser client**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } } }
  );
}
```

- [ ] **Step 3: Create middleware client** (for auth session refresh in middleware)

### Task 2.2: Create Login page (modern redesign)

**Files:**
- Create: `/next/src/app/login/page.tsx`
- Create: `/next/src/components/auth/google-sign-in.tsx`
- Create: `/next/src/components/auth/login-screen.tsx`

**Reference:** `frontend/src/routes/login/+page.svelte` + `LoginScreen.svelte` for behavior. Build from scratch visually — clean card layout, Google OAuth button, email/password form, "forgot password" link.

- [ ] **Step 1: Create GoogleSignIn** — button component that calls `supabase.auth.signInWithOAuth({ provider: "google" })`
- [ ] **Step 2: Create LoginScreen** — card with GoogleSignIn, divider, email/password form, error toasts via sonner
- [ ] **Step 3: Create login page** — render `<LoginScreen />`

### Task 2.3: Create Signup page (modern redesign)

**Files:**
- Create: `/next/src/app/signup/page.tsx`
- Create: `/next/src/components/auth/signup-screen.tsx`

- [ ] **Step 1: Create SignupScreen** — same card layout as login but with signup fields + email verification redirect
- [ ] **Step 2: Create signup page** — render `<SignupScreen />`

### Task 2.4: Create remaining auth pages

**Files:**
- Create: `/next/src/app/forgot-password/page.tsx`
- Create: `/next/src/app/reset-password/page.tsx`
- Create: `/next/src/app/verify-email/page.tsx`
- Create: `/next/src/app/auth/callback/page.tsx`
- Create: `/next/src/components/shared/spinner.tsx`

- [ ] **Step 1-4:** Create each auth page with Supabase integration:
  - ForgotPassword: email input → `supabase.auth.resetPasswordForEmail()`
  - ResetPassword: new password input → `supabase.auth.updateUser()`
  - VerifyEmail: static info page
  - AuthCallback: handles OAuth redirect, calls `/api/auth/supabase-google`, redirects to `/chat`

- [ ] **Step 5: Verify Phase 2 build**

```bash
cd /next && npm run build
```
Expected: All auth pages build successfully.

---

## Phase 3: Layouts

### Task 3.1: Create shared components

**Files:**
- Create: `/next/src/components/shared/logo.tsx`
- Create: `/next/src/components/shared/navbar.tsx`
- Create: `/next/src/components/shared/empty.tsx`

**Reference:** `frontend/src/lib/components/ui/Logo.svelte`, `Navbar.svelte`, `Empty.svelte`

- [ ] **Step 1: Create Logo** — SVG logo with size/text/tagline props
- [ ] **Step 2: Create Navbar** — sticky nav with theme toggle, user avatar dropdown with logout, nav links (Chat/Dashboard/Connect)

### Task 3.2: Create app layout + marketing placeholder

**Files:**
- Create: `/next/src/app/(app)/layout.tsx`
- Create: `/next/src/app/(marketing)/layout.tsx` (placeholder)
- Create: `/next/src/app/(marketing)/page.tsx` (placeholder)

- [ ] **Step 1: Create app layout**

```typescript
import { Navbar } from "@/components/shared/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create marketing placeholder files** (will be fully implemented in Phase 9)

- [ ] **Step 3: Verify build**

```bash
cd /next && npm run build
```
Expected: Build succeeds.

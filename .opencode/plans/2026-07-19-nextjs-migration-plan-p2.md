# Next.js Frontend Migration — Implementation Plan (Part 2/2)

> **This is Part 2** — continues from Part 1 (Phases 1-3). See Part 1 for architecture, file structure, and phases 1-3.

---

## Phase 4: Connect Page

### Task 4.1: Create API client + types

**Files:**
- Create: `/next/src/lib/types.ts`
- Create: `/next/src/lib/api.ts`
- Create: `/next/src/hooks/use-conversations.ts`

**Reference:** `frontend/src/lib/types.ts`, `frontend/src/lib/api.ts`

- [ ] **Step 1: Create types** — port all types from frontend/src/lib/types.ts (TrustLevel, SchemaTable, GlossaryItem, DbInfo, StreamEvent, Turn, Conversation, HistoryStats, etc.)
- [ ] **Step 2: Create API client** — port `apiCall()`, `streamApiCall()`, `isExpectedClientError()`, and all endpoint wrappers (getHistory, getConversations, etc.)
- [ ] **Step 3: Create conversations hook** — TanStack Query hooks: `useConversations()`, `useConversation(id)`, `useCreateConversation()`, `useDeleteConversation()`, `useRenameConversation()`

### Task 4.2: Create Connect page

**Files:**
- Create: `/next/src/components/connect/connect-screen.tsx`
- Create: `/next/src/app/(app)/connect/page.tsx`

**Reference:** `frontend/src/lib/components/ConnectScreen.svelte`

- [ ] **Step 1: Create ConnectScreen** — dialect selector (postgresql/mysql/sqlite/mssql/duckdb), connection URL input, test connection button, recent connections list, "Try with sample data" button
- [ ] **Step 2: Create connect page** — render `<ConnectScreen />` under (app) layout

---

## Phase 5: Onboard Page

### Task 5.1: Create onboarding components

**Files:**
- Create: `/next/src/components/onboard/stepper.tsx`
- Create: `/next/src/components/onboard/onboard-screen.tsx`
- Create: `/next/src/components/onboard/profile-step.tsx`
- Create: `/next/src/components/onboard/glossary-step.tsx`
- Create: `/next/src/components/onboard/starters-step.tsx`
- Create: `/next/src/components/onboard/starter-card.tsx`
- Create: `/next/src/app/onboard/page.tsx`

**Reference:** `frontend/src/lib/components/OnboardScreen.svelte`, `Stepper.svelte`, `ProfileStep.svelte`, `GlossaryStep.svelte`, `StartersStep.svelte`, `StarterCard.svelte`

- [ ] **Step 1: Create Stepper** — 3-step progress bar (Read Schema / Define Terms / Verify Queries)
- [ ] **Step 2: Create StarterCard** — card showing a starter question with SQL preview
- [ ] **Step 3: Create OnboardScreen** — 3-step wizard container that manages step state, calls API to fetch glossary/starters
- [ ] **Step 4: Create onboard page** — render `<OnboardScreen />`

---

## Phase 6: Chat Page (Core Feature)

### Task 6.1: Create SSE streaming hook

**Files:**
- Create: `/next/src/hooks/use-stream-query.ts`

**Reference:** `frontend/src/lib/api.ts`'s `streamApiCall`

- [ ] **Step 1: Create useStreamQuery hook**

```typescript
"use client";

import { useState, useCallback, useRef } from "react";
import type { StreamEvent, ThinkingArtifact, Turn } from "@/lib/types";

interface StreamState {
  thinking: ThinkingArtifact[];
  sql: string;
  columns: { name: string; type: string }[] | null;
  rows: Record<string, string>[] | null;
  error: string | null;
  isStreaming: boolean;
}

export function useStreamQuery() {
  const [state, setState] = useState<StreamState>({
    thinking: [], sql: "", columns: null, rows: null, error: null, isStreaming: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (question: string, conversationId?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ thinking: [], sql: "", columns: null, rows: null, error: null, isStreaming: true });

    // SSE handling — parse data: lines, update state per event type
    // Same as streamApiCall in api.ts

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, conversation_id: conversationId }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as StreamEvent;
          // Update state based on event.type
          if (event.type === "thinking") {
            setState(prev => ({ ...prev, thinking: [...prev.thinking, event.data] }));
          } else if (event.type === "sql") {
            setState(prev => ({ ...prev, sql: event.data }));
          } else if (event.type === "result") {
            setState(prev => ({ ...prev, columns: event.data.columns, rows: event.data.rows }));
          } else if (event.type === "error") {
            setState(prev => ({ ...prev, error: event.data }));
          } else if (event.type === "done") {
            setState(prev => ({ ...prev, isStreaming: false }));
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState(prev => ({ ...prev, error: err.message, isStreaming: false }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, startStream, cancel };
}
```

### Task 6.2: Create chat components

**Files:**
- Create: `/next/src/components/chat/answer-card.tsx`
- Create: `/next/src/components/chat/thinking.tsx`
- Create: `/next/src/components/chat/trust-toast.tsx`
- Create: `/next/src/components/chat/slash-command-menu.tsx`
- Create: `/next/src/components/chat/sidebar.tsx`
- Create: `/next/src/components/chat/ask-screen.tsx`
- Create: `/next/src/app/(app)/chat/page.tsx`

**Reference:** All files in `frontend/src/lib/components/`

- [ ] **Step 1: Create AnswerCard** — displays a single Q&A turn: question, restatement, SQL block, result table/chart, confidence badge, verify/correct/wrong buttons
- [ ] **Step 2: Create Thinking** — collapsible "thought process" panel showing streaming reasoning artifacts
- [ ] **Step 3: Create Sidebar** — left sidebar with conversation list (CRUD), schema viewer, tabs (Ask/Dashboard/Settings)
- [ ] **Step 4: Create AskScreen** — main chat orchestrator combining Sidebar + answer streaming + question input
- [ ] **Step 5: Create chat page** — render `<AskScreen />` with URL search params for `?conversation=uuid`

---

## Phase 7: Dashboard Page

### Task 7.1: Create dashboard components

**Files:**
- Create: `/next/src/components/dashboard/chart-card.tsx`
- Create: `/next/src/components/dashboard/dashboard-tab.tsx`
- Create: `/next/src/components/dashboard/charts/*.tsx` (port from frontend)
- Create: `/next/src/app/(app)/dashboard/page.tsx`

**Reference:** `frontend/src/lib/components/DashboardTab.svelte`, `ChartCard.svelte`, `charts/`

- [ ] **Step 1: Create ChartCard** — wrapper card for dashboard chart widgets
- [ ] **Step 2: Create charts** — ConfidenceDonut, TrustGauge, QueryTimeline, TableUsageBar, SchemaOverview (port from Svelte to Recharts)
- [ ] **Step 3: Create DashboardTab** — stats overview, confidence breakdown, top tables, activity timeline
- [ ] **Step 4: Create dashboard page** — render dashboard under (app) layout

---

## Phase 8: Profile Page

### Task 8.1: Create settings/profile components

**Files:**
- Create: `/next/src/components/settings/settings.tsx`
- Create: `/next/src/components/settings/settings-tab.tsx`
- Create: `/next/src/components/settings/data-catalog.tsx`
- Create: `/next/src/app/(app)/profile/page.tsx`

**Reference:** `frontend/src/lib/components/Settings.svelte`, `SettingsTab.svelte`, `DataCatalog.svelte`

- [ ] **Step 1: Create Settings** — profile page with language selector, theme toggle, API key info, disconnect database button
- [ ] **Step 2: Create DataCatalog** — catalog editor with 5 sections (Synonyms, Value meanings, Metrics, Join paths, Column notes), AI suggest, save
- [ ] **Step 3: Create profile page** — render settings under (app) layout

---

## Phase 9: Marketing Landing Page

### Task 9.1: Create marketing layout with Lenis + GSAP

**Files:**
- Create: `/next/src/app/(marketing)/layout.tsx` (full implementation)
- Create: `/next/src/hooks/use-gsap.ts`
- Create: `/next/src/lib/motion/lenis.ts`
- Create: `/next/src/lib/motion/gsap.ts`
- Create: `/next/src/lib/motion/motion-prefs.ts`

**Reference:** `frontend/src/lib/motion/`, `frontend/src/lib/actions/`

- [ ] **Step 1: Create motion utilities** — port Lenis init, GSAP lazy-loader, reduced-motion detection
- [ ] **Step 2: Create marketing layout** — client component that initializes Lenis + GSAP, renders MarketingNav and Footer

### Task 9.2: Create marketing page sections

**Files** (all under `/next/src/components/marketing/`):
- `marketing-nav.tsx`
- `footer.tsx`
- `hero.tsx` — animated headline, CTA, canvas backdrop
- `live-demo.tsx` — interactive typewriter demo
- `pipeline.tsx` — 3-step "How it works" section
- `trust-engine.tsx` — trust transparency section
- `flywheel.tsx` — flywheel diagram
- `integrations.tsx` — DB connector cards
- `final-cta.tsx` — bottom CTA
- `backdrop.tsx` — animated canvas particles
- `exit-intent-modal.tsx`
- `auth-choice-modal.tsx`

**Reference:** `frontend/src/lib/components/marketing/` — all .svelte files

- [ ] **Step 1-12:** Port each marketing section component to React with GSAP animations, making them responsive across all screen sizes
- [ ] **Step 13: Create landing page** — compose all sections in `(marketing)/page.tsx`

---

## Phase 10: Static Pages

### Task 10.1: Create privacy + terms pages

**Files:**
- Create: `/next/src/app/privacy/page.tsx`
- Create: `/next/src/app/terms/page.tsx`

- [ ] **Step 1:** Create privacy policy page with static content
- [ ] **Step 2:** Create terms of service page with static content

---

## Phase 11: Switchover

### Task 11.1: Update Docker infrastructure for production

**Files:**
- Modify: `/docker-compose.yml` — swap default profile from `legacy` to `migrate`
- Modify: `/DOCKERFILE.render` — replace SvelteKit build stage with Next.js build stage
- Delete: `/frontend/` — remove old SvelteKit frontend

- [ ] **Step 1:** Update docker-compose.yml — make `migrate` the default profile, `legacy` opt-in
- [ ] **Step 2:** Update DOCKERFILE.render — replace SvelteKit builder with Next.js builder
- [ ] **Step 3:** Delete `/frontend/` directory
- [ ] **Step 4:** Remove old nginx configs targeting SvelteKit
- [ ] **Step 5:** Final verification — `docker compose up --build` works with new Next.js frontend

---

## GitHub Epic Issue

Create a GitHub Issue with:
- Title: "Migrate frontend from SvelteKit to Next.js"
- Labels: `epic`, `migration`
- Body: Checklist of all 11 phases with sub-items per task

---

## Spec Coverage Check

| Spec Section | Plan Tasks |
|---|---|
| Scaffold (Next.js init, Tailwind, Shadcn, i18n, Docker) | Phase 1 |
| Auth pages (login, signup, forgot/reset/verify password, OAuth callback) | Phase 2 |
| Layouts (root, app, marketing) | Phase 3 |
| Connect page | Phase 4 |
| Onboard page | Phase 5 |
| Chat page (SSE streaming, AnswerCard, Sidebar, AskScreen) | Phase 6 |
| Dashboard page | Phase 7 |
| Profile/settings page | Phase 8 |
| Marketing landing page (GSAP, Lenis, sections) | Phase 9 |
| Static pages (privacy, terms) | Phase 10 |
| Docker switchover, delete old frontend | Phase 11 |

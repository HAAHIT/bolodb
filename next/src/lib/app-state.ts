"use client";

import { useState, useEffect } from "react";
import { apiCall } from "@/lib/api";
import type { DbInfo, SchemaTable, Toast } from "@/lib/types";

type Listener = () => void;

function trustFor(count: number) {
  if (count < 1) return { key: "cold", idx: 0 };
  if (count < 3) return { key: "warming", idx: 1 };
  if (count < 10) return { key: "assisted", idx: 2 };
  return { key: "trusted", idx: 3 };
}

function schemaObjToDisplay(obj: Record<string, any>): SchemaTable[] {
  return Object.entries(obj || {}).map(([name, info]: [string, any]) => ({
    name,
    rows:
      info.row_count != null ? Number(info.row_count).toLocaleString() : "?",
    cols: (info.columns || []).map((c: any) => {
      const fk = (info.foreign_keys || []).find(
        (f: any) => f.column === c.name,
      );
      return (
        c.name +
        (c.primary_key ? " PK" : "") +
        (fk ? "\u2192" + (fk.references || "") : "")
      );
    }),
    compact: `${name}(${(info.columns || []).map((c: any) => c.name).join(", ")})`,
  }));
}

class AppState {
  verifiedCount = 0;
  toast: Toast | null = null;
  realSchema: SchemaTable[] | null = null;
  dbInfo: DbInfo | null = null;
  starters: string[] = [];
  isLoaded = false;
  theme = "dark";
  openrouterReady = false;
  activeConversationId: string | null = null;
  tourCompleted = false;
  onboardingActive = false;

  private listeners: Set<Listener> = new Set();
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bolodb_theme");
      this.theme = stored === "dark" ? "dark" : stored ? "light" : "dark";
      this.onboardingActive =
        sessionStorage.getItem("bolodb_onboarding_active") === "1";
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setOnboardingActive(active: boolean) {
    this.onboardingActive = active;
    if (typeof window !== "undefined") {
      if (active) sessionStorage.setItem("bolodb_onboarding_active", "1");
      else sessionStorage.removeItem("bolodb_onboarding_active");
    }
    this.notify();
  }

  applyTheme(theme: string) {
    const next = theme === "dark" ? "dark" : "light";
    this.theme = next;
    if (typeof window !== "undefined") {
      localStorage.setItem("bolodb_theme", next);
      document.documentElement.setAttribute("data-theme", next);
    }
    this.notify();
  }

  toggleTheme() {
    this.applyTheme(this.theme === "dark" ? "light" : "dark");
  }

  get prevLevel() {
    return trustFor(this.verifiedCount).key;
  }

  private goto(path: string, router?: { push: (path: string) => void }) {
    if (router) {
      router.push(path);
    } else if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }

  async init(redirect = true, router?: { push: (path: string) => void }) {
    try {
      const s: Record<string, any> = await apiCall("/api/state");
      this.openrouterReady = s.openrouter_ready ?? false;
      this.tourCompleted = s.tour_completed ?? false;
      if (s.connected) {
        this.verifiedCount = s.trust?.verified || 0;
        this.dbInfo = s.database || null;
        this.starters = s.starters || [];
        try {
          const schema = await apiCall("/api/schema");
          this.realSchema = schemaObjToDisplay(schema);
        } catch (e) {
          console.error("Failed to load schema:", e);
        }
        this.isLoaded = true;
        if (redirect) {
          if (this.dbInfo?.has_knowledge) {
            this.goto("/chat", router);
          } else {
            this.goto("/onboard", router);
          }
        }
      } else {
        this.isLoaded = true;
        if (redirect) this.goto("/connect", router);
      }
    } catch (e: any) {
      this.isLoaded = true;
      const msg = e.message || "";
      if (
        msg.includes("Access Denied") ||
        msg.includes("Session Expired") ||
        msg.includes("Invalid Token") ||
        msg.includes("401")
      ) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup") &&
          window.location.pathname !== "/"
        ) {
          this.goto("/login", router);
        }
      } else if (redirect) {
        this.goto("/connect", router);
      }
    }
    this.notify();
  }

  async logout(router?: { push: (path: string) => void }) {
    try {
      await apiCall("/api/auth/logout", {});
    } catch (e) {
      console.error("Failed to logout:", e);
    }
    try {
      const { default: posthog } = await import("posthog-js");
      posthog.capture("user_logged_out");
      posthog.reset();
    } catch {}
    this.dbInfo = null;
    this.realSchema = null;
    this.verifiedCount = 0;
    this.starters = [];
    this.tourCompleted = false;
    this.activeConversationId = null;
    this.setOnboardingActive(false);
    this.notify();
    this.goto("/login", router);
  }

  async setConnect(
    isSample: boolean,
    res: DbInfo,
    router?: { push: (path: string) => void },
  ) {
    if (res) {
      this.dbInfo = res;
      this.verifiedCount = res.trust?.verified || 0;
      if (res.starters) this.starters = res.starters;
      try {
        const schema = await apiCall("/api/schema");
        this.realSchema = schemaObjToDisplay(schema);
      } catch (e) {
        console.error("Failed to load schema:", e);
      }
      if (!isSample && res.has_knowledge) {
        this.notify();
        this.goto("/chat", router);
        return;
      }
    }
    this.setOnboardingActive(true);
    this.notify();
    this.goto("/onboard", router);
  }

  async setOnboardDone(
    seedCount: number,
    router?: { push: (path: string) => void },
  ) {
    try {
      const s: Record<string, any> = await apiCall("/api/state");
      const n = s.trust?.verified || seedCount;
      this.verifiedCount = n;
      if (s.database) this.dbInfo = s.database;
      if (s.starters) this.starters = s.starters;
    } catch {
      this.verifiedCount = seedCount;
    }
    try {
      const { default: posthog } = await import("posthog-js");
      posthog.capture("onboarding_completed", {
        seed_count: seedCount,
        dialect: this.dbInfo?.dialect,
      });
    } catch {}
    this.setOnboardingActive(false);
    this.notify();
    this.goto("/chat", router);
  }

  verify(apiCount?: number) {
    const oldLevel = this.prevLevel;
    if (apiCount !== undefined) {
      this.verifiedCount = apiCount;
    } else {
      this.verifiedCount++;
    }
    const newLevel = this.prevLevel;
    if (
      newLevel !== oldLevel &&
      (newLevel === "assisted" || newLevel === "trusted")
    ) {
      const msg: Toast =
        newLevel === "assisted"
          ? {
              title: "Accuracy milestone reached",
              body: "Confident answers now show immediately \u2014 new questions still get a second look.",
            }
          : {
              title: "Fully calibrated",
              body: "All answers appear directly now. Reasoning is always one tap away.",
            };
      this.showToast(msg);
    }
    this.notify();
  }

  showToast(toast: Toast, duration = 4200) {
    this.toast = toast;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.notify();
    }, duration);
    this.notify();
  }

  showError(body: string, title = "Something went wrong") {
    this.showToast({ title, body, kind: "error" }, 5200);
  }

  async disconnect(router?: { push: (path: string) => void }) {
    try {
      await apiCall("/api/disconnect", {});
    } catch (e) {
      console.error("Failed to disconnect:", e);
    }
    this.dbInfo = null;
    this.realSchema = null;
    this.verifiedCount = 0;
    this.starters = [];
    this.activeConversationId = null;
    this.setOnboardingActive(false);
    this.notify();
    this.goto("/connect", router);
  }
}

export const appState = new AppState();

export function useAppState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = appState.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  return appState;
}

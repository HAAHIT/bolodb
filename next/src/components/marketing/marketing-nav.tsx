"use client";

import { useEffect, useState } from "react";
import { appState, useAppState } from "@/lib/app-state";
import { scrollTo, getLenis } from "@/lib/motion/lenis";
import { trackCtaClick, trackThemeToggle } from "@/lib/marketing/analytics";

const navLinks = [
  { label: "Demo", href: "#demo" },
  { label: "How it works", href: "#pipeline" },
  { label: "Trust", href: "#trust" },
];

export function MarketingNav() {
  const state = useAppState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function checkScroll() {
      const lenis = getLenis();
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      setVisible(scrollY > 200);
    }

    checkScroll();

    const lenis = getLenis();
    if (lenis) {
      const unsub = lenis.on("scroll", checkScroll);
      return () => unsub();
    } else {
      window.addEventListener("scroll", checkScroll, { passive: true });
      return () => window.removeEventListener("scroll", checkScroll);
    }
  }, []);

  function handleThemeToggle() {
    appState.toggleTheme();
    trackThemeToggle(state.theme);
  }

  function navScrollTo(href: string) {
    scrollTo(href.slice(1));
  }

  return (
    <nav className={"pill-nav" + (visible ? " visible" : "")} aria-label="Main navigation">
      <div className="pill">
        <button className="pill-logo" onClick={() => scrollTo("hero")} aria-label="BoloDB — Scroll to top">
          <svg width="18" height="18" viewBox="0 0 256 256" fill="none">
            <path d="M 52 44 Q 52 30 66 30 L 190 30 Q 204 30 204 44 L 204 138 Q 204 152 190 152 L 116 152 L 88 176 L 92 152 L 66 152 Q 52 152 52 138 Z" stroke="currentColor" strokeWidth="6" fill="none" />
            <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none">
              <ellipse cx="128" cy="66" rx="34" ry="11" />
              <path d="M 94 66 L 94 108 Q 94 119 128 119 Q 162 119 162 108 L 162 66" />
              <path d="M 94 87 Q 94 98 128 98 Q 162 98 162 87" />
            </g>
            <circle cx="182" cy="46" r="3.5" fill="currentColor" />
          </svg>
        </button>

        <div className="pill-divider"></div>

        <div className="pill-links">
          {navLinks.map((link) => (
            <button key={link.href} className="pill-link" onClick={() => navScrollTo(link.href)}>
              {link.label}
            </button>
          ))}
        </div>

        <div className="pill-divider"></div>

        <div className="pill-actions">
          <button className="theme-toggle" data-testid="nav-theme-toggle" onClick={handleThemeToggle} aria-label="Toggle Theme">
            {state.theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button className="btn btn-ghost btn-sm" data-testid="nav-login-button" onClick={() => { trackCtaClick("nav", "Log in", "/login"); window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "login" } })); }}>Log in</button>
          <button className="btn btn-primary btn-sm" data-testid="nav-signup-button" onClick={() => { trackCtaClick("nav", "Start free", "/signup"); window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "signup" } })); }}>Start free</button>
        </div>
      </div>
    </nav>
  );
}

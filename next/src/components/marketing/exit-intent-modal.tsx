"use client";

import { useEffect, useState, useRef } from "react";
import { trackCtaClick } from "@/lib/marketing/analytics";

function alreadyShownThisSession(): boolean {
  return sessionStorage.getItem("bolodb_exit_intent_shown") === "1";
}

function markShown(): void {
  sessionStorage.setItem("bolodb_exit_intent_shown", "1");
}

export function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const armed = useRef(false);
  const shownThisMount = useRef(false);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const delayed = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = async () => {
    if (!armed.current || show || shownThisMount.current || alreadyShownThisSession()) return;
    setShow(true);
    shownThisMount.current = true;
    markShown();
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    const { default: posthog } = await import("posthog-js");
    posthog.capture("exit_intent_shown");
  };

  const close = async () => {
    setShow(false);
    const { default: posthog } = await import("posthog-js");
    posthog.capture("exit_intent_dismissed");
    previouslyFocusedElement.current?.focus();
  };

  const claim = async () => {
    trackCtaClick("exit_intent", "Start for free", "/signup");
    const { default: posthog } = await import("posthog-js");
    posthog.capture("exit_intent_converted");
    setShow(false);
    window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "signup" } }));
  };

  useEffect(() => {
    delayed.current = setTimeout(() => {
      armed.current = true;
    }, 12000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && e.relatedTarget === null) {
        trigger();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && show && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (delayed.current) clearTimeout(delayed.current);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="exit-backdrop" role="dialog" aria-modal="true" aria-labelledby="exit-intent-title" tabIndex={-1} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="exit-modal" ref={modalRef}>
        <button className="exit-close" onClick={close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="exit-icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3z" fill="currentColor"/>
          </svg>
        </div>
        <h2 id="exit-intent-title" className="exit-title">Wait — try it with our sample database.</h2>
        <p className="exit-desc">No credit card, no database of your own needed. We spin up a realistic TechStore e-commerce dataset so you can see BoloDB answer real questions in under 30 seconds.</p>
        <div className="exit-actions">
          <button className="btn btn-primary btn-lg" onClick={claim}>Start free with sample data</button>
          <button className="exit-dismiss" onClick={close}>No thanks, I&apos;ll leave</button>
        </div>
      </div>
    </div>
  );
}

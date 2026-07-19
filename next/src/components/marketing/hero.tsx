"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/motion/gsap";
import { scrollTo } from "@/lib/motion/lenis";
import { trackCtaClick } from "@/lib/marketing/analytics";
import { motionPrefs } from "@/lib/motion/motion-prefs";

export function Hero() {
  const heroEl = useRef<HTMLElement>(null);
  const eyebrowEl = useRef<HTMLSpanElement>(null);
  const h1Line1 = useRef<HTMLSpanElement>(null);
  const h1Line2 = useRef<HTMLSpanElement>(null);
  const subEl = useRef<HTMLParagraphElement>(null);
  const ctaRow = useRef<HTMLDivElement>(null);
  const trustEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [eyebrowEl, h1Line1, h1Line2, subEl, ctaRow, trustEl];

    if (motionPrefs.reduced) {
      els.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.clipPath = "none";
        }
      });
      return;
    }

    const safetyTimer = setTimeout(() => {
      els.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.clipPath = "none";
        }
      });
    }, 1500);

    let tl: gsap.core.Timeline | null = null;

    const init = async () => {
      const { gsap } = await loadGsap();
      tl = gsap.timeline();

      if (eyebrowEl.current) {
        tl!.fromTo(
          eyebrowEl.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4 }
        );
      }

      if (h1Line1.current) {
        tl!.fromTo(
          h1Line1.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.7 }
        );
      }

      if (h1Line2.current) {
        tl!.fromTo(
          h1Line2.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.7 },
          "-=0.4"
        );
      }

      if (subEl.current) {
        tl!.fromTo(
          subEl.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.25"
        );
      }

      if (ctaRow.current) {
        tl!.fromTo(
          ctaRow.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.2"
        );
      }

      if (trustEl.current) {
        tl!.fromTo(
          trustEl.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.15"
        );
      }
    };

    init();

    return () => {
      clearTimeout(safetyTimer);
      if (tl) tl.kill();
    };
  }, []);

  return (
    <section className="hero" ref={heroEl}>
      <div className="hero-grid">
        <div className="hero-text">
          <span className="hero-eyebrow" ref={eyebrowEl}>BoloDB — Text-to-SQL you can trust</span>
          <h1 className="hero-h1">
            <span className="h1-mask"><span className="h1-line" ref={h1Line1}>Talk to your database</span></span>
            <span className="h1-mask"><span className="h1-line h1-accent" ref={h1Line2}>like a human.</span></span>
          </h1>
          <p className="hero-sub" ref={subEl}>No SQL required. Ask questions in plain English, get instant answers, and trust the logic with our verifiable AI engine.</p>
          <div className="hero-ctas" ref={ctaRow}>
            <button className="btn btn-primary btn-lg" data-testid="hero-start-free-button" onClick={() => { trackCtaClick("hero", "Start for free", "/signup"); window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "signup" } })); }}>
              Start for free
            </button>
            <button className="btn btn-ghost btn-lg" data-testid="hero-demo-button" onClick={() => { trackCtaClick("hero", "Watch it work", "#demo"); scrollTo("demo"); }}>
              Watch it work
            </button>
          </div>
        </div>
        <div className="hero-side" ref={trustEl}>
          <div className="trust-card">
            <span className="trust-label">Works with</span>
            <div className="db-logos">
              <span className="db-logo">PostgreSQL</span>
              <span className="db-logo">MySQL</span>
              <span className="db-logo">SQL Server</span>
              <span className="db-logo">SQLite</span>
            </div>
            <span className="trust-line">read-only · your data stays yours</span>
          </div>
        </div>
      </div>
    </section>
  );
}

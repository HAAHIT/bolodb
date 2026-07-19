"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/lib/motion/gsap";
import { motionPrefs } from "@/lib/motion/motion-prefs";

const SVG_QUERY = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function TrustEngine() {
  const [flipped, setFlipped] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [spotlights, setSpotlights] = useState<Array<{ mx: number; my: number }>>([
    { mx: 0, my: 0 },
    { mx: 0, my: 0 },
    { mx: 0, my: 0 },
  ]);

  useEffect(() => {
    if (motionPrefs.reduced) {
      const cards = sectionRef.current?.querySelectorAll(".trust-card");
      if (cards) {
        cards.forEach((card) => {
          (card as HTMLElement).style.opacity = "1";
          (card as HTMLElement).style.transform = "none";
        });
      }
      return;
    }

    const init = async () => {
      const { gsap } = await loadGsap();
      const cards = sectionRef.current?.querySelectorAll(".trust-card");
      if (!cards) return;

      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 24 });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      cards.forEach((card) => observer.observe(card));
    };

    init();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlights((prev) => {
      const next = [...prev];
      next[idx] = { mx: e.clientX - rect.left, my: e.clientY - rect.top };
      return next;
    });
  };

  const handleMouseLeave = (idx: number) => {
    setSpotlights((prev) => {
      const next = [...prev];
      next[idx] = { mx: 0, my: 0 };
      return next;
    });
  };

  return (
    <section id="trust" className="trust-section" ref={sectionRef}>
      <h2 className="section-title">Total transparency into every answer</h2>
      <div className="trust-grid">
        <div
          className="trust-card"
          style={{ cursor: "pointer", "--mx": spotlights[0].mx + "px", "--my": spotlights[0].my + "px" } as React.CSSProperties}
          onClick={() => setFlipped(flipped === 1 ? 0 : 1)}
          onMouseMove={(e) => handleMouseMove(e, 0)}
          onMouseLeave={() => handleMouseLeave(0)}
        >
          <div className="flip-container" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(flipped === 1 ? 0 : 1); }}} aria-label="Toggle between answer and SQL" aria-pressed={flipped === 1}>
            <div className="flip-inner" style={flipped === 1 ? { transform: "rotateY(180deg)" } : {}}>
              <div className="flip-front">
                <div className="card-icon">
                  <svg {...SVG_QUERY}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <h4 className="card-title">See every query</h4>
                <p className="card-desc">Toggle between the answer and the exact SQL that produced it. Full transparency, every time.</p>
                <span className="flip-hint">Tap to flip →</span>
              </div>
              <div className="flip-back">
                <div className="back-header">Generated SQL</div>
                <pre className="back-sql">{"SELECT c.name, SUM(o.amount) AS total\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nWHERE o.created_at >= date('now','start of month')\nGROUP BY c.id\nORDER BY total DESC\nLIMIT 3;"}</pre>
                <span className="flip-hint">← Tap for answer</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="trust-card"
          style={{ "--mx": spotlights[1].mx + "px", "--my": spotlights[1].my + "px" } as React.CSSProperties}
          onMouseMove={(e) => handleMouseMove(e, 1)}
          onMouseLeave={() => handleMouseLeave(1)}
        >
          <div className="card-icon">
            <svg {...SVG_QUERY}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h4 className="card-title">Your data stays yours</h4>
          <p className="card-desc">Only your database structure and question leave — never your row data. Every query runs read-only.</p>
          <div className="diagram" aria-label="Data flow diagram">
            <div className="diagram-row">
              <span className="diagram-label">Schema + Question</span>
              <span className="diagram-arrow">→</span>
              <span className="diagram-label diag-green">AI</span>
            </div>
            <div className="diagram-row diag-muted">
              <span className="diagram-label diag-red">Your row data</span>
              <span className="diagram-arrow diag-x">✕</span>
              <span className="diagram-label">Stays home</span>
            </div>
          </div>
        </div>

        <div
          className="trust-card"
          style={{ "--mx": spotlights[2].mx + "px", "--my": spotlights[2].my + "px" } as React.CSSProperties}
          onMouseMove={(e) => handleMouseMove(e, 2)}
          onMouseLeave={() => handleMouseLeave(2)}
        >
          <div className="card-icon">
            <svg {...SVG_QUERY}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h4 className="card-title">Confidence you can read</h4>
          <p className="card-desc">Every answer shows High, Medium, or Low confidence based on verification history and query quality signals.</p>
          <div className="conf-examples">
            <span className="conf conf-high"><span className="dot"></span>High confidence</span>
            <span className="conf conf-med"><span className="dot"></span>Medium confidence</span>
            <span className="conf conf-low"><span className="dot"></span>Low confidence</span>
          </div>
        </div>
      </div>
    </section>
  );
}

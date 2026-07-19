"use client";

import { trackCtaClick } from "@/lib/marketing/analytics";

export function FinalCta() {
  return (
    <section className="cta-section">
      <div className="cta-panel">
        <h2 className="cta-title">Ask your first question in a minute.</h2>
        <p className="cta-desc">Get a free Gemini API key, connect your database, and start asking questions. No credit card required.</p>
        <div className="cta-buttons">
          <button className="btn btn-primary btn-lg" data-testid="final-cta-start-button" onClick={() => { trackCtaClick("final", "Start for free", "/signup"); window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "signup" } })); }}>
            Start for free
          </button>
          <button className="btn btn-ghost btn-lg" data-testid="final-cta-sample-button" onClick={() => { trackCtaClick("final", "Try with sample data", "/signup"); window.dispatchEvent(new CustomEvent("bolodb:open-auth", { detail: { mode: "signup" } })); }}>
            Try with sample data
          </button>
        </div>
      </div>
    </section>
  );
}

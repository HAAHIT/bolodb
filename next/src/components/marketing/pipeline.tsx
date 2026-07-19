"use client";

const steps = [
  { icon: "plug", title: "Connect", desc: "Connect your database with a connection string — or try sample data in seconds." },
  { icon: "message", title: "Ask", desc: "Type questions in plain English. No SQL needed." },
  { icon: "shield", title: "Trust", desc: "See the exact SQL, inspect results, and confirm every answer. BoloDB gets smarter with each verification." },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="pipeline-section">
      <h2 className="section-title">From question to trusted answer in three steps</h2>

      <div className="pipeline-desktop">
        <svg className="pipeline-spine" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 10 6 L 290 6" stroke="var(--border-2)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 10 6 L 290 6" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="6" r="4" fill="var(--surface-2)" stroke="var(--border-2)" strokeWidth="1.5" />
          <circle cx="150" cy="6" r="4" fill="var(--surface-2)" stroke="var(--border-2)" strokeWidth="1.5" />
          <circle cx="250" cy="6" r="4" fill="var(--surface-2)" stroke="var(--border-2)" strokeWidth="1.5" />
        </svg>
        <div className="pipeline-grid">
          {steps.map((step, i) => (
            <div className="pipeline-step" key={i}>
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {step.icon === "plug" && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
                  {step.icon === "message" && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>}
                  {step.icon === "shield" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                </svg>
              </div>
              <h4 className="step-title">{step.title}</h4>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pipeline-mobile">
        {steps.map((step, i) => (
          <div className="mobile-step" key={i}>
            <div className="mobile-step-left">
              <div className="step-dot"></div>
              {i < steps.length - 1 && <div className="step-line"></div>}
            </div>
            <div className="mobile-step-content">
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {step.icon === "plug" && <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}
                  {step.icon === "message" && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>}
                  {step.icon === "shield" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                </svg>
              </div>
              <h4 className="step-title">{step.title}</h4>
              <p className="step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

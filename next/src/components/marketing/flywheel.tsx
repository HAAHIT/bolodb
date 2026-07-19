"use client";

export function Flywheel() {
  return (
    <section id="flywheel" className="flywheel-section">
      <h2 className="section-title">It learns your database</h2>
      <div className="flywheel-content">
        <div className="flywheel-diagram">
          <div className="flywheel-ring">
            <div className="ring-segment" style={{ transform: "rotate(0deg)" }}><span>Verified</span></div>
            <div className="ring-segment" style={{ transform: "rotate(120deg)" }}><span>Confidence ↑</span></div>
            <div className="ring-segment" style={{ transform: "rotate(240deg)" }}><span>Trust ↑</span></div>
          </div>
          <div className="flywheel-center">↻</div>
        </div>
        <div className="flywheel-stats">
          <div className="stat">
            <span className="stat-placeholder">—</span>
            <span className="stat-label">verified answers</span>
          </div>
          <div className="stat">
            <span className="stat-level">Supervised → Assisted → Trusted</span>
            <span className="stat-label">trust level grows with every verification</span>
          </div>
        </div>
      </div>
    </section>
  );
}

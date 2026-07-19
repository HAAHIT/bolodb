"use client";

import { trustFor } from "@/lib/chart-utils";

interface TrustGaugeProps {
  verifiedCount: number;
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function TrustGauge({ verifiedCount }: TrustGaugeProps) {
  const level = trustFor(verifiedCount);
  const progress = Math.min(verifiedCount / 7, 1);
  const nextMilestone = level.next;
  const barColor =
    level.key === "trusted"
      ? "var(--c-high)"
      : level.key === "assisted"
        ? "var(--c-med)"
        : "var(--brand)";

  const cx = 90;
  const cy = 90;
  const r = 72;
  const trackR = 72;
  const startAngle = 0;
  const endAngle = 360 * progress;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 0",
      }}
    >
      <div style={{ width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <path
            d={describeArc(cx, cy, trackR, 0, 360)}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {progress > 0 && (
            <path
              d={describeArc(cx, cy, r, startAngle, endAngle)}
              fill="none"
              stroke={barColor}
              strokeWidth={14}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.6s var(--ease)",
              }}
            />
          )}
        </svg>
      </div>

      <div style={{ textAlign: "center", marginTop: 0 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            background:
              level.key === "trusted"
                ? "var(--c-high-tint)"
                : level.key === "assisted"
                  ? "var(--c-med-tint)"
                  : "var(--brand-tint)",
            color:
              level.key === "trusted"
                ? "var(--c-high-ink)"
                : level.key === "assisted"
                  ? "var(--c-med-ink)"
                  : "var(--brand-ink)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: barColor,
              display: "inline-block",
            }}
          />
          {level.label}
        </div>
        {nextMilestone !== null ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {nextMilestone - verifiedCount} more verification
            {nextMilestone - verifiedCount === 1 ? "" : "s"} to reach{" "}
            {level.key === "supervised" ? "Assisted" : "Trusted"}
          </div>
        ) : (
          <div
            style={{
              fontSize: 12,
              color: "var(--c-high-ink)",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            Maximum trust level reached
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  empty?: boolean;
  emptyText?: string;
  className?: string;
  children?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  empty = false,
  emptyText = "No data yet",
  className = "",
  children,
}: ChartCardProps) {
  return (
    <div className={"card p-5 rise " + className} style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--faint)",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                margin: "3px 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {empty ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 180,
            border: "1px dashed var(--border-2)",
            borderRadius: "var(--radius)",
            background: "var(--surface-2)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--faint)", marginBottom: 8 }}
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: "var(--faint)" }}
          >
            {emptyText}
          </span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

"use client";

import type { SchemaTable } from "@/lib/types";
import { CHART_COLORS } from "@/lib/chart-utils";

interface SchemaOverviewProps {
  schema: SchemaTable[];
}

export function SchemaOverview({ schema }: SchemaOverviewProps) {
  const tableData = schema
    .map((t) => ({
      name: t.name,
      rowCount: parseInt(t.rows.replace(/,/g, ""), 10) || 0,
      colCount: t.cols.length,
    }))
    .sort((a, b) => b.rowCount - a.rowCount)
    .slice(0, 10);

  const maxRows = Math.max(...tableData.map((t) => t.rowCount), 1);

  if (tableData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 180,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--faint)" }}>
          No schema data
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tableData.map((table, i) => {
        const pct = Math.round((table.rowCount / maxRows) * 100);
        return (
          <div key={table.name}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 650,
                  color: "var(--ink)",
                }}
              >
                {table.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {table.rowCount.toLocaleString()} rows &middot; {table.colCount}{" "}
                cols
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--surface-3)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                  transition: "width 0.6s var(--ease)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CONFIDENCE_COLORS } from "@/lib/chart-utils";

interface ConfidenceDonutProps {
  data: Record<string, number>;
}

export function ConfidenceDonut({ data }: ConfidenceDonutProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, label: key, value }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 220,
          border: "1px dashed var(--border-2)",
          borderRadius: "var(--radius)",
          background: "var(--surface-2)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--faint)" }}>
          No queries yet
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ flex: "0 0 180px", height: 180, overflow: "hidden" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              cornerRadius={4}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={CONFIDENCE_COLORS[entry.key] ?? "var(--faint)"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {chartData.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  flexShrink: 0,
                  background:
                    CONFIDENCE_COLORS[item.key] ?? "var(--faint)",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--ink)",
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ink-2)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--faint)",
                  width: 32,
                  textAlign: "right",
                }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--muted)",
            fontWeight: 600,
          }}
        >
          Total: {total} queries
        </div>
      </div>
    </div>
  );
}

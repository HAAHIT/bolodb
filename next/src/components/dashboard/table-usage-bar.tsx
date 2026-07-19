"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-utils";

interface TableUsageBarProps {
  data: { table: string; count: number }[];
}

export function TableUsageBar({ data }: TableUsageBarProps) {
  const chartData = data
    .slice(0, 8)
    .map((d) => ({ ...d, label: d.table }));

  if (chartData.length === 0) {
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
          No table usage data
        </span>
      </div>
    );
  }

  return (
    <div style={{ height: Math.max(120, chartData.length * 36) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 60, right: 16, top: 4, bottom: 4 }}
        >
          <CartesianGrid
            stroke="var(--border-2)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--border-2)" />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--ink)" }}
            stroke="var(--border-2)"
            tickFormatter={(v: string) =>
              v.length > 16 ? v.slice(0, 16) + "…" : v
            }
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            barSize={20}
          >
            {chartData.map((_, i) => (
              <rect
                key={i}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

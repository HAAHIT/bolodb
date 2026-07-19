"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { detectChartData, CHART_COLORS } from "@/lib/chart-utils";

interface ResultChartProps {
  columns: string[];
  rows: string[][];
}

export function ResultChart({ columns, rows }: ResultChartProps) {
  const detection = detectChartData(columns, rows);

  if (!detection || !detection.type) {
    return (
      <div
        style={{
          padding: 18,
          textAlign: "center",
          color: "var(--muted)",
          background: "var(--surface-2)",
          border: "1px dashed var(--border-2)",
          borderRadius: "var(--radius)",
          fontSize: 13,
        }}
      >
        This data doesn&apos;t have a chartable format.
      </div>
    );
  }

  if (detection.type === "bar") {
    return (
      <div
        style={{
          height: `${Math.max(150, Math.min(detection.data.length * 40, 300))}px`,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          padding: 12,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={detection.data}
            layout="vertical"
            margin={{ left: 60, right: 16, top: 4, bottom: 4 }}
          >
            <CartesianGrid
              stroke="var(--border-2)"
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              stroke="var(--border-2)"
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--ink)" }}
              stroke="var(--border-2)"
              tickFormatter={(v: string) =>
                v.length > 18 ? v.slice(0, 18) + "…" : v
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
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {detection.data.map((_, i) => (
                <Cell
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

  if (detection.type === "pie") {
    const total = detection.data.reduce(
      (s: number, d: { value: number }) => s + d.value,
      0,
    );
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          padding: 16,
        }}
      >
        <div style={{ flex: "0 0 160px", height: 160, overflow: "hidden" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={detection.data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                cornerRadius={4}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
              >
                {detection.data.map((item: { label: string }, i: number) => (
                  <Cell
                    key={item.label}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {detection.data.map(
            (item: { label: string; value: number }, i: number) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      flexShrink: 0,
                      background:
                        CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--ink)",
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink-2)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.value.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--faint)",
                      width: 30,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  }

  if (detection.type === "line") {
    return (
      <div
        style={{
          height: 220,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          padding: 12,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={detection.data}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              stroke="var(--border-2)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              stroke="var(--border-2)"
              tickFormatter={(v: string) =>
                v.length > 12 ? v.slice(0, 12) + "…" : v
              }
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              stroke="var(--border-2)"
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--brand)"
              strokeWidth={2}
              dot={{ fill: "var(--brand)", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface QueryTimelineProps {
  data: { date: string; count: number }[];
}

export function QueryTimeline({ data }: QueryTimelineProps) {
  if (data.length === 0) {
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
          No activity yet
        </span>
      </div>
    );
  }

  return (
    <div style={{ height: 200, overflow: "hidden" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 36, right: 12, top: 8, bottom: 24 }}>
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-2)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            stroke="var(--border-2)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--border-2)"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#timelineGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

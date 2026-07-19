"use client";

import { useHistoryStats } from "@/hooks/use-conversations";
import { ChartCard } from "./chart-card";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Spinner } from "@/components/shared/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export function DashboardTab() {
  const { data: stats, isLoading, error } = useHistoryStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        Failed to load dashboard data
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No data yet. Start asking questions to see your dashboard.
      </div>
    );
  }

  const confidenceData = stats.confidence_breakdown
    ? [
        { name: "High", value: stats.confidence_breakdown.high || 0 },
        { name: "Medium", value: stats.confidence_breakdown.medium || 0 },
        { name: "Low", value: stats.confidence_breakdown.low || 0 },
      ]
    : [];

  const activityData = stats.daily_activity || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_queries || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.verified_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConfidenceBadge
              confidence={
                stats.verified_count && stats.total_queries
                  ? stats.verified_count / stats.total_queries > 0.7
                    ? "High"
                    : stats.verified_count / stats.total_queries > 0.3
                      ? "Medium"
                      : "Low"
                  : "N/A"
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Confidence Breakdown">
          {confidenceData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {confidenceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No confidence data yet
            </p>
          )}
        </ChartCard>

        <ChartCard title="Activity">
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity data yet
            </p>
          )}
        </ChartCard>
      </div>

      {stats.top_tables && stats.top_tables.length > 0 && (
        <ChartCard title="Top Tables">
          <div className="space-y-2">
            {stats.top_tables.map((t: { table: string; count: number }) => (
              <div
                key={t.table}
                className="flex items-center justify-between text-sm"
              >
                <span>{t.table}</span>
                <span className="text-muted-foreground">{t.count} queries</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

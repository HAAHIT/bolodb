"use client";

import { useState, useEffect } from "react";
import { apiCall, isExpectedClientError } from "@/lib/api";
import { humanError } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import type { DbInfo } from "@/lib/types";

const DIALECT_LABELS: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
  mssql: "SQL Server",
  duckdb: "DuckDB",
};

interface ConnectScreenProps {
  onConnect: (isSample: boolean, res: DbInfo) => void;
}

export function ConnectScreen({ onConnect }: ConnectScreenProps) {
  const state = useAppState();
  const [choice, setChoice] = useState<"own" | "sample">("own");
  const [dbUrl, setDbUrl] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [recentConnections, setRecentConnections] = useState<any[]>([]);
  const [reconnecting, setReconnecting] = useState<string | null>(null);

  useEffect(() => {
    apiCall("/api/connections")
      .then((data) => setRecentConnections(data.connections || []))
      .catch((e) => console.error("Failed to load recent connections:", e));
  }, []);

  const startLabel =
    choice === "sample" ? "Explore the sample store →" : "Connect read-only →";

  async function start() {
    if (choice === "sample") return go("sample");
    return go("url");
  }

  async function go(kind: string) {
    if (kind === "url" && !dbUrl.trim()) {
      setError("Paste a read-only connection string to continue.");
      return;
    }
    setConnecting(kind);
    setError("");
    try {
      let res: DbInfo;
      if (kind === "sample") {
        res = await apiCall("/api/connect-sample", {});
        try {
          const { default: posthog } = await import("posthog-js");
          posthog.capture("database_connected", {
            is_sample: true,
            dialect: res.dialect,
            table_count: res.tables,
          });
        } catch {}
      } else {
        res = await apiCall("/api/connect", { db_url: dbUrl.trim() });
        try {
          const { default: posthog } = await import("posthog-js");
          posthog.capture("database_connected", {
            is_sample: false,
            dialect: res.dialect,
            table_count: res.tables,
          });
        } catch {}
      }
      onConnect(kind === "sample", res);
    } catch (e: any) {
      setError(
        humanError(e.message) ||
          "Connection failed — check your details and try again.",
      );
      if (!isExpectedClientError(e)) {
        try {
          const { default: posthog } = await import("posthog-js");
          posthog.captureException(e);
        } catch {}
      }
      setConnecting(null);
    }
  }

  async function reconnect(conn: any) {
    setReconnecting(conn.db_id);
    setError("");
    try {
      const res: DbInfo = await apiCall("/api/reconnect", {
        db_id: conn.db_id,
      });
      try {
        const { default: posthog } = await import("posthog-js");
        posthog.capture("database_reconnected", {
          dialect: conn.dialect,
          table_count: conn.table_count,
        });
      } catch {}
      onConnect(false, res);
    } catch (e: any) {
      setError(
        humanError(e.message) ||
          "Reconnection failed — the database may no longer be available.",
      );
      if (!isExpectedClientError(e)) {
        try {
          const { default: posthog } = await import("posthog-js");
          posthog.captureException(e);
        } catch {}
      }
      setReconnecting(null);
    }
  }

  async function removeRecent(conn: any) {
    try {
      await apiCall(`/api/connections/${conn._id}`, undefined, "DELETE");
      setRecentConnections(
        recentConnections.filter((c) => c._id !== conn._id),
      );
    } catch (e) {
      console.error("Failed to remove recent connection:", e);
    }
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="ob">
      <div className="ob-logo">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="none">
          <path
            d="M 52 44 Q 52 30 66 30 L 190 30 Q 204 30 204 44 L 204 138 Q 204 152 190 152 L 116 152 L 88 176 L 92 152 L 66 152 Q 52 152 52 138 Z"
            stroke="var(--brand)"
            strokeWidth="6"
            fill="none"
          />
          <g
            stroke="var(--brand)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          >
            <ellipse cx="128" cy="66" rx="34" ry="11" />
            <path d="M 94 66 L 94 108 Q 94 119 128 119 Q 162 119 162 108 L 162 66" />
            <path d="M 94 87 Q 94 98 128 98 Q 162 98 162 87" />
          </g>
          <circle cx="182" cy="46" r="3.5" fill="var(--brand)" />
        </svg>
        <span className="ob-name">
          Bolo<span style={{ color: "var(--brand)" }}>DB</span>
        </span>
      </div>

      <div className="step">
        <h1 className="title">Let's meet your data.</h1>
        <p className="sub">
          One click to explore, or connect your own database. Everything runs
          read-only — nothing can be changed.
        </p>

        <div className="cards">
          <button
            className={"choice" + (choice === "own" ? " on" : "")}
            onClick={() => setChoice("own")}
            data-testid="connect-own-card"
          >
            <span className="c-title">Connect my database</span>
            <span className="c-desc">
              PostgreSQL, MySQL or SQL Server. One connection string, read-only.
            </span>
            <span className="c-tag accent">RECOMMENDED · ~1 MINUTE</span>
          </button>
          <button
            className={"choice" + (choice === "sample" ? " on" : "")}
            onClick={() => setChoice("sample")}
            data-testid="connect-sample-card"
          >
            <span className="c-title">Try the sample store</span>
            <span className="c-desc">
              No database handy? Explore a realistic demo shop — zero setup.
            </span>
            <span className="c-tag faint">INSTANT · NO SIGNUP DATA</span>
          </button>
        </div>

        {choice === "own" && (
          <input
            className="conn-input mono"
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") start();
            }}
            placeholder="postgresql://readonly_user:pass@host:5432/dbname"
            data-testid="connect-url-input"
            aria-label="Database connection string"
          />
        )}

        {error && (
          <div
            className="err"
            role="alert"
            aria-live="polite"
            data-testid="connect-error-message"
          >
            <b>Couldn't connect —</b> {error}
          </div>
        )}

        {choice === "own" && !state.openrouterReady && (
          <div className="ai-note">
            AI not yet ready — set <b>OPENROUTER_API_KEY</b> in the server
            environment.
          </div>
        )}

        <button
          className="cta"
          onClick={start}
          disabled={!!connecting || (choice === "own" && !dbUrl.trim())}
          data-testid="connect-start-button"
        >
          {connecting
            ? choice === "sample"
              ? "Building sample data…"
              : "Connecting…"
            : startLabel}
        </button>

        {recentConnections.length > 0 && (
          <div className="recent">
            <div className="recent-head">
              Recent databases · reconnect in one click
            </div>
            <div className="recent-list">
              {recentConnections.map((conn) => (
                <div className="recent-row" key={conn._id}>
                  <span className="rr-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <ellipse
                        cx="12"
                        cy="6"
                        rx="7"
                        ry="3"
                        stroke="currentColor"
                        strokeWidth="1.9"
                      />
                      <path
                        d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"
                        stroke="currentColor"
                        strokeWidth="1.9"
                      />
                    </svg>
                  </span>
                  <div className="rr-info">
                    <span className="rr-name">
                      {conn.display_url?.split("/").pop() ||
                        conn.dialect ||
                        "Database"}
                    </span>
                    <span className="rr-meta">
                      {DIALECT_LABELS[conn.dialect] || conn.dialect} ·{" "}
                      {conn.table_count || 0} table
                      {conn.table_count === 1 ? "" : "s"}
                      {conn.connected_at
                        ? ` · ${timeAgo(conn.connected_at)}`
                        : ""}
                    </span>
                  </div>
                  <button
                    className="rr-connect"
                    onClick={() => reconnect(conn)}
                    disabled={!!reconnecting || !!connecting}
                  >
                    {reconnecting === conn.db_id ? "Connecting…" : "Connect"}
                  </button>
                  <button
                    className="rr-remove"
                    aria-label="Remove from recent"
                    title="Remove"
                    onClick={() => removeRecent(conn)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ob-footer">
        READ-ONLY · NO TELEMETRY · YOUR ROWS NEVER LEAVE
      </div>
    </div>
  );
}

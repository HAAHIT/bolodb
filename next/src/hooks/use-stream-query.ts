"use client";

import { useState, useCallback, useRef } from "react";
import { streamApiCall } from "@/lib/api";
import type { StreamEvent, ThinkingArtifact } from "@/lib/types";

interface StreamState {
  thinkingArtifacts: ThinkingArtifact[];
  sql: string;
  rows: number | null;
  error: string | null;
  confidence: string | null;
  isStreaming: boolean;
}

export function useStreamQuery() {
  const [state, setState] = useState<StreamState>({
    thinkingArtifacts: [],
    sql: "",
    rows: null,
    error: null,
    confidence: null,
    isStreaming: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (question: string, conversationId?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        thinkingArtifacts: [],
        sql: "",
        rows: null,
        error: null,
        confidence: null,
        isStreaming: true,
      });

      const accumulated = {
        thinkingArtifacts: [] as ThinkingArtifact[],
        sql: "",
        rows: null as number | null,
        error: null as string | null,
        confidence: null as string | null,
      };

      const onEvent = (event: StreamEvent) => {
        // Convert each event kind to a ThinkingArtifact and update state
        switch (event.kind) {
          case "schema_linked":
            {
              const artifact = {
                kind: "schema" as const,
                data: {
                  tables: event.tables,
                  linked: event.linked,
                } as unknown as Record<string, unknown>,
              };
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "hint":
            {
              const artifact = {
                kind: "hint" as const,
                data: { message: event.message } as unknown as Record<
                  string,
                  unknown
                >,
              };
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "sql":
            {
              const artifact = {
                kind: "sql" as const,
                data: {
                  attempt: event.attempt,
                } as unknown as Record<string, unknown>,
              };
              accumulated.sql = event.sql;
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                sql: event.sql,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "validation":
            {
              const artifact = {
                kind: "validation" as const,
                data: {
                  passed: event.passed,
                  checks: event.checks,
                } as unknown as Record<string, unknown>,
              };
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "repair":
            {
              const artifact = {
                kind: "repair" as const,
                data: {
                  attempt: event.attempt,
                  total: event.total,
                  suggestion: event.suggestion,
                } as unknown as Record<string, unknown>,
              };
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "execution":
            {
              const artifact = {
                kind: "execution" as const,
                data: {
                  rows: event.rows,
                  elapsed: event.elapsed,
                  truncated: event.truncated,
                } as unknown as Record<string, unknown>,
              };
              accumulated.rows = event.rows;
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                rows: event.rows,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "confidence":
            {
              const artifact = {
                kind: "confidence" as const,
                data: {
                  level: event.level,
                  reason: event.reason,
                  based_on_verified: event.based_on_verified,
                } as unknown as Record<string, unknown>,
              };
              accumulated.confidence = event.level;
              accumulated.thinkingArtifacts.push(artifact);
              setState((prev) => ({
                ...prev,
                confidence: event.level,
                thinkingArtifacts: [...prev.thinkingArtifacts, artifact],
              }));
            }
            break;
          case "result":
            // result data is a flat record — store it
            setState((prev) => ({
              ...prev,
              isStreaming: false,
            }));
            break;
          case "error":
            accumulated.error = event.message;
            setState((prev) => ({
              ...prev,
              error: event.message,
              isStreaming: false,
            }));
            break;
        }
      };

      const onDone = () => {
        setState((prev) => ({ ...prev, isStreaming: false }));
      };

      const onError = (err: Error) => {
        accumulated.error = err.message;
        setState((prev) => ({
          ...prev,
          error: err.message,
          isStreaming: false,
        }));
      };

      await streamApiCall(
        "/api/query",
        { question, conversation_id: conversationId },
        onEvent,
        onDone,
        onError,
        controller.signal,
      );

      return accumulated;
    },
    [],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, startStream, cancel };
}

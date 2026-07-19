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

      const onEvent = (event: StreamEvent) => {
        // Convert each event kind to a ThinkingArtifact and update state
        switch (event.kind) {
          case "schema_linked":
            setState((prev) => ({
              ...prev,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "schema",
                  data: {
                    tables: event.tables,
                    linked: event.linked,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "hint":
            setState((prev) => ({
              ...prev,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "hint",
                  data: { message: event.message } as unknown as Record<
                    string,
                    unknown
                  >,
                },
              ],
            }));
            break;
          case "sql":
            setState((prev) => ({
              ...prev,
              sql: event.sql,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "sql",
                  data: {
                    attempt: event.attempt,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "validation":
            setState((prev) => ({
              ...prev,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "validation",
                  data: {
                    passed: event.passed,
                    checks: event.checks,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "repair":
            setState((prev) => ({
              ...prev,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "repair",
                  data: {
                    attempt: event.attempt,
                    total: event.total,
                    suggestion: event.suggestion,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "execution":
            setState((prev) => ({
              ...prev,
              rows: event.rows,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "execution",
                  data: {
                    rows: event.rows,
                    elapsed: event.elapsed,
                    truncated: event.truncated,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "confidence":
            setState((prev) => ({
              ...prev,
              confidence: event.level,
              thinkingArtifacts: [
                ...prev.thinkingArtifacts,
                {
                  kind: "confidence",
                  data: {
                    level: event.level,
                    reason: event.reason,
                    based_on_verified: event.based_on_verified,
                  } as unknown as Record<string, unknown>,
                },
              ],
            }));
            break;
          case "result":
            // result data is a flat record — store it
            setState((prev) => ({
              ...prev,
              isStreaming: false,
            }));
            break;
          case "error":
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
    },
    [],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, startStream, cancel };
}

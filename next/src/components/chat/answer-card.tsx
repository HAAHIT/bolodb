"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SqlBlock } from "@/components/shared/sql-block";
import { ResultTable } from "@/components/shared/result-table";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Thinking } from "./thinking";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import type { Turn } from "@/lib/types";

interface AnswerCardProps {
  turn: Turn;
  onVerdict?: (verdict: "correct" | "wrong") => void;
  onRegenerate?: () => void;
  className?: string;
}

export function AnswerCard({
  turn,
  onVerdict,
  onRegenerate,
  className,
}: AnswerCardProps) {
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);

  const handleVerdict = (v: "correct" | "wrong") => {
    setVerdict(v);
    onVerdict?.(v);
  };

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow p-4 space-y-3", className)}>
      <div>
        <p className="font-medium">{turn.question}</p>
        {turn.restatement && (
          <p className="text-sm text-muted-foreground mt-1">
            {turn.restatement}
          </p>
        )}
      </div>

      {turn.thinkingArtifacts && turn.thinkingArtifacts.length > 0 && (
        <Thinking artifacts={turn.thinkingArtifacts} />
      )}

      {turn.sql && <SqlBlock sql={turn.sql} />}

      {turn.executionError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {turn.executionError}
        </div>
      )}

      {turn.columns && turn.rows && turn.columns.length > 0 && (
        <ResultTable
          columns={turn.columns.map((name) => ({ name, type: "text" }))}
          rows={turn.rows.map((row) => {
            const obj: Record<string, string> = {};
            turn.columns?.forEach((col, i) => {
              obj[col] = row[i] || "";
            });
            return obj;
          })}
        />
      )}

      {turn.confidence && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Confidence:</span>
          <ConfidenceBadge confidence={turn.confidence} />
        </div>
      )}

      {(onVerdict || onRegenerate) && (
        <div className="flex items-center gap-2 pt-2 border-t">
          {onVerdict && (
            <>
              <button
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 rounded-md px-3 text-xs",
                  verdict === "correct"
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleVerdict("correct")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Correct
              </button>
              <button
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 rounded-md px-3 text-xs",
                  verdict === "wrong"
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleVerdict("wrong")}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Wrong
              </button>
            </>
          )}
          {onRegenerate && (
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
              onClick={onRegenerate}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

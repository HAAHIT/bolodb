"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className={cn("p-4 space-y-3", className)}>
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
              <Button
                variant={verdict === "correct" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVerdict("correct")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Correct
              </Button>
              <Button
                variant={verdict === "wrong" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVerdict("wrong")}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Wrong
              </Button>
            </>
          )}
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

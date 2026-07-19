"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";
import type { ThinkingArtifact } from "@/lib/types";

interface ThinkingProps {
  artifacts: ThinkingArtifact[];
  className?: string;
}

const KINDS: Record<string, { label: string; color: string }> = {
  schema: { label: "Schema Analysis", color: "text-blue-500" },
  hint: { label: "Hints", color: "text-purple-500" },
  sql: { label: "SQL Generation", color: "text-green-500" },
  validation: { label: "Validation", color: "text-yellow-500" },
  repair: { label: "Repair", color: "text-orange-500" },
  execution: { label: "Execution", color: "text-cyan-500" },
  confidence: { label: "Confidence", color: "text-indigo-500" },
};

export function Thinking({ artifacts, className }: ThinkingProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedKinds, setExpandedKinds] = useState<Set<string>>(new Set());

  if (artifacts.length === 0) return null;

  const grouped = artifacts.reduce(
    (acc, a) => {
      (acc[a.kind] = acc[a.kind] || []).push(a);
      return acc;
    },
    {} as Record<string, ThinkingArtifact[]>
  );

  const toggleKind = (kind: string) => {
    setExpandedKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Thought Process
          <span className="text-xs text-muted-foreground">
            ({artifacts.length} steps)
          </span>
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expanded && (
        <div className="border-t divide-y">
          {Object.entries(grouped).map(([kind, items]) => {
            const meta = KINDS[kind] || {
              label: kind,
              color: "text-muted-foreground",
            };
            const isOpen = expandedKinds.has(kind);

            return (
              <div key={kind}>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-muted/30"
                  onClick={() => toggleKind(kind)}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span className={cn("font-medium", meta.color)}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                </button>
                  {isOpen && (
                  <div className="px-6 pb-2 space-y-1">
                    {items.map((item, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground"
                      >
                        {Object.entries(item.data).map(([key, val]) => (
                          <span key={key}>
                            <span className="font-medium text-foreground">
                              {key}:
                            </span>{" "}
                            {typeof val === "string"
                              ? val
                              : JSON.stringify(val)}
                            {" "}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

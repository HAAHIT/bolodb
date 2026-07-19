"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface SqlBlockProps {
  sql: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function SqlBlock({
  sql,
  defaultExpanded = false,
  className,
}: SqlBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    toast.success("SQL copied to clipboard");
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <span>SQL</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expanded && (
        <div className="border-t">
          <div className="flex items-center justify-end px-3 py-1">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
          <pre className="px-3 pb-3 text-sm overflow-x-auto">
            <code>{sql}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

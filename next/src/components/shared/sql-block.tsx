"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </button>
          </div>
          <pre className="px-3 pb-3 text-sm overflow-x-auto">
            <code>{sql}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface ResultTableProps {
  columns: { name: string; type: string }[];
  rows: Record<string, string>[];
  maxRows?: number;
  className?: string;
}

export function ResultTable({
  columns,
  rows,
  maxRows = 100,
  className,
}: ResultTableProps) {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? rows : rows.slice(0, maxRows);
  const hasMore = rows.length > maxRows;

  const handleCopyCell = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleExportCSV = () => {
    const header = columns.map((c) => c.name).join(",");
    const csvRows = rows.map((r) =>
      columns.map((c) => `"${(r[c.name] || "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="sm" onClick={handleExportCSV}>
          <Download className="h-3 w-3 mr-1" />
          CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {col.name}
                  <span className="ml-1 text-xs text-muted-foreground/60">
                    {col.type}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr
                key={i}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={col.name}
                    className="px-3 py-2 max-w-[300px] truncate cursor-pointer hover:bg-accent/50"
                    onClick={() => handleCopyCell(row[col.name] || "")}
                    title={row[col.name]}
                  >
                    {row[col.name] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show less"
            : `Show all ${rows.length} rows (${rows.length - maxRows} more)`}
        </Button>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: string;
  compact?: boolean;
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  compact,
  className,
}: ConfidenceBadgeProps) {
  const level = confidence?.toLowerCase() || "unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        level === "high" && "border-transparent bg-green-600 text-white shadow",
        level === "medium" && "border-transparent bg-yellow-500 text-white",
        level === "low" && "border-red-300 text-red-600",
        level === "unknown" && "border-transparent bg-secondary text-secondary-foreground",
        compact && "text-[10px] px-1.5 py-0",
        className
      )}
    >
      {confidence || "Unknown"}
    </span>
  );
}

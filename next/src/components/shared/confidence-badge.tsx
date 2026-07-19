import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const variant =
    level === "high"
      ? "default"
      : level === "medium"
        ? "secondary"
        : "outline";

  return (
    <Badge
      variant={variant}
      className={cn(
        level === "high" && "bg-green-600 text-white",
        level === "medium" && "bg-yellow-500 text-white",
        level === "low" && "border-red-300 text-red-600",
        compact && "text-[10px] px-1.5 py-0",
        className
      )}
    >
      {confidence || "Unknown"}
    </Badge>
  );
}

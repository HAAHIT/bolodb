import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export function humanError(error: string): string {
  if (error.includes("relation") && error.includes("does not exist"))
    return "Table not found";
  if (error.includes("column") && error.includes("does not exist"))
    return "Column not found";
  if (error.includes("syntax error")) return "Invalid SQL syntax";
  if (error.includes("permission denied")) return "Permission denied";
  return error;
}

export function trustFor(verifiedCount: number): {
  key: string;
  label: string;
  range: [number, number];
  description: string;
} {
  if (verifiedCount >= 20)
    return {
      key: "trusted",
      label: "Trusted",
      range: [20, Infinity],
      description: "Highly reliable answers",
    };
  if (verifiedCount >= 5)
    return {
      key: "assisted",
      label: "Assisted",
      range: [5, 19],
      description: "Moderately reliable",
    };
  return {
    key: "supervised",
    label: "Supervised",
    range: [0, 4],
    description: "Verify answers manually",
  };
}

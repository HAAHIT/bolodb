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

export function humanError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (
    m.includes("connection refused") ||
    m.includes("could not connect to server") ||
    m.includes("can't connect")
  )
    return "The database server isn't running or can't be reached — check the host and port.";
  if (
    m.includes("password authentication failed") ||
    m.includes("access denied") ||
    m.includes("login failed")
  )
    return "Wrong username or password — double-check your credentials.";
  if (m.includes("no such file") || m.includes("unable to open database file"))
    return "File not found — check the path and make sure the file exists.";
  if (
    m.includes("database") &&
    (m.includes("does not exist") || m.includes("unknown database"))
  )
    return "That database name wasn't found — check the spelling.";
  if (m.includes("timeout") || m.includes("timed out"))
    return "Connection timed out — the server may be unreachable or behind a firewall.";
  if (m.includes("ssl") || m.includes("certificate"))
    return "SSL error — if connecting via URL mode, try adding ?sslmode=disable at the end.";
  if (m.includes("no module named"))
    return "The driver for that database type isn't installed on this server.";
  return msg;
}

export const wrongReasons = [
  { id: "numbers", label: "Wrong numbers" },
  { id: "filter", label: "Wrong filter / dates" },
  { id: "intent", label: "Not what I meant" },
  { id: "missing", label: "Missing data" },
  { id: "other", label: "Something else" },
];

export const suggestions = [
  "Top customers by spend this month",
  "Which products are low on stock?",
  "Revenue by category",
  "How many orders are pending right now?",
  "What is the average order value?",
  "How many new customers signed up this week?",
];

export function trustFor(n: number) {
  if (n >= 7)
    return {
      key: "trusted" as const,
      label: "Trusted",
      range: [7, Infinity] as [number, number],
      idx: 2,
      behaviour: "Answers are shown directly. Reasoning is one tap away.",
      next: null,
    };
  if (n >= 3)
    return {
      key: "assisted" as const,
      label: "Assisted",
      range: [3, 6] as [number, number],
      idx: 1,
      behaviour: "Confident answers are shown; novel ones get a second look.",
      next: 7,
    };
  return {
    key: "supervised" as const,
    label: "Supervised",
    range: [0, 2] as [number, number],
    idx: 0,
    behaviour: "Every answer is reviewed before you trust it.",
    next: 3,
  };
}

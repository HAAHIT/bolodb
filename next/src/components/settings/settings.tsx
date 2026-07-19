"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Database } from "lucide-react";
import { apiCall } from "@/lib/api";
import { DataCatalog } from "./data-catalog";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export function Settings() {
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    document.cookie =
      `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await apiCall("/api/disconnect", {}, "POST");
      toast.success("Database disconnected");
      router.push("/connect");
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const btnBase = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="font-semibold leading-none tracking-tight">Settings</div>
          <div className="text-sm text-muted-foreground">
            Manage your preferences and database connection.
          </div>
        </div>
        <div className="p-6 pt-0 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              <button
                className={cn(
                  btnBase + " h-8 rounded-md px-3 text-xs",
                  theme === "light"
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </button>
              <button
                className={cn(
                  btnBase + " h-8 rounded-md px-3 text-xs",
                  theme === "dark"
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </button>
              <button
                className={cn(
                  btnBase + " h-8 rounded-md px-3 text-xs",
                  !theme || theme === "system"
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setTheme("system")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Database</label>
            <button
              className={cn(
                btnBase,
                "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-8 rounded-md px-3 text-xs"
              )}
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              <Database className="mr-2 h-4 w-4" />
              Disconnect database
            </button>
          </div>
        </div>
      </div>

      <DataCatalog />
    </div>
  );
}

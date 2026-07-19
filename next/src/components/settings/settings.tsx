"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your preferences and database connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={locale} onValueChange={handleLocaleChange}>
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={
                  !theme || theme === "system" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setTheme("system")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Database</label>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              <Database className="mr-2 h-4 w-4" />
              Disconnect database
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataCatalog />
    </div>
  );
}

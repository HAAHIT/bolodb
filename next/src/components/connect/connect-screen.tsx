"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { apiCall } from "@/lib/api";

const DIALECTS = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mssql", label: "SQL Server" },
  { value: "duckdb", label: "DuckDB" },
];

export function ConnectScreen() {
  const router = useRouter();
  const [dialect, setDialect] = useState("postgresql");
  const [url, setUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [sampling, setSampling] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await apiCall("/api/connect", { dialect, url });
      toast.success("Connected to database");
      router.push("/onboard");
    } catch (err: any) {
      toast.error(err.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleSample = async () => {
    setSampling(true);
    try {
      await apiCall("/api/connect/sample");
      toast.success("Sample data loaded");
      router.push("/onboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to load sample data");
    } finally {
      setSampling(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Database</CardTitle>
          <CardDescription>
            Connect your database to start asking questions in plain English.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dialect</label>
            <Select value={dialect} onValueChange={setDialect}>
              {DIALECTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Connection URL</label>
            <Input
              placeholder="postgresql://user:pass@host:5432/db"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleConnect}
            disabled={connecting || !url}
          >
            {connecting && <Spinner className="mr-2" />}
            Connect
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSample}
            disabled={sampling}
          >
            {sampling && <Spinner className="mr-2" />}
            Try with sample data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

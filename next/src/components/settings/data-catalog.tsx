"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { apiCall, getCatalog, saveCatalog } from "@/lib/api";
import { toast } from "sonner";
import { Lightbulb, Save } from "lucide-react";

const SECTIONS = [
  { key: "synonyms", label: "Synonyms" },
  { key: "value_meanings", label: "Value meanings" },
  { key: "metrics", label: "Metrics" },
  { key: "join_paths", label: "Join paths" },
  { key: "column_notes", label: "Column notes" },
] as const;

export function DataCatalog() {
  const [catalog, setCatalog] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getCatalog()
      .then((data) => {
        const normalized: Record<string, string> = {};
        for (const section of SECTIONS) {
          const val = data?.[section.key];
          normalized[section.key] = Array.isArray(val)
            ? val.join(", ")
            : typeof val === "string"
              ? val
              : "";
        }
        setCatalog(normalized);
      })
      .catch(() => setCatalog({}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveCatalog(catalog);
      toast.success("Catalog saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save catalog");
    } finally {
      setSaving(false);
    }
  };

  const handleSuggest = async (section: string) => {
    setSuggesting((prev) => ({ ...prev, [section]: true }));
    try {
      const data = await apiCall<{ content?: string }>("/api/catalog/suggest", {
        section,
      });
      setCatalog((prev) => ({ ...prev, [section]: data.content || "" }));
      toast.success("Suggestion generated");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate suggestion");
    } finally {
      setSuggesting((prev) => ({ ...prev, [section]: false }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Catalog</CardTitle>
        <CardDescription>
          Define synonyms, metrics, and annotations for your data schema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.key} className="space-y-2">
            <label className="text-sm font-medium">{section.label}</label>
            <div className="flex gap-2">
              <Input
                value={catalog[section.key] || ""}
                onChange={(e) =>
                  setCatalog((prev) => ({
                    ...prev,
                    [section.key]: e.target.value,
                  }))
                }
                placeholder={`Enter ${section.label.toLowerCase()}...`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggest(section.key)}
                disabled={suggesting[section.key]}
              >
                {suggesting[section.key] ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Spinner className="mr-2" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Catalog
        </Button>
      </CardContent>
    </Card>
  );
}

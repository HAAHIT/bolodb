"use client";

import { useState, useEffect } from "react";
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
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="font-semibold leading-none tracking-tight">Data Catalog</div>
        </div>
        <div className="p-6 pt-0">
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="font-semibold leading-none tracking-tight">Data Catalog</div>
        <div className="text-sm text-muted-foreground">
          Define synonyms, metrics, and annotations for your data schema.
        </div>
      </div>
      <div className="p-6 pt-0 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.key} className="space-y-2">
            <label className="text-sm font-medium">{section.label}</label>
            <div className="flex gap-2">
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={catalog[section.key] || ""}
                onChange={(e) =>
                  setCatalog((prev) => ({
                    ...prev,
                    [section.key]: e.target.value,
                  }))
                }
                placeholder={`Enter ${section.label.toLowerCase()}...`}
              />
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
                onClick={() => handleSuggest(section.key)}
                disabled={suggesting[section.key]}
              >
                {suggesting[section.key] ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Lightbulb className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Spinner className="mr-2" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Catalog
        </button>
      </div>
    </div>
  );
}

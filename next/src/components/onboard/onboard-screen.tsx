"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { Stepper } from "./stepper";
import { apiCall } from "@/lib/api";
import { toast } from "sonner";
import type { SchemaTable, GlossaryItem, StarterItem } from "@/lib/types";

const STEPS = ["Read Schema", "Define Terms", "Verify Queries"];

export function OnboardScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);
  const [starters, setStarters] = useState<StarterItem[]>([]);

  const fetchSchema = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ tables: SchemaTable[] }>("/api/schema");
      setTables(data.tables || []);
    } catch {
      toast.error("Failed to load schema");
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGlossary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ glossary: GlossaryItem[] }>(
        "/api/glossary",
      );
      setGlossary(data.glossary || []);
    } catch {
      toast.error("Failed to load glossary");
      setGlossary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStarters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ starters: StarterItem[] }>("/api/starters");
      setStarters(data.starters || []);
    } catch {
      toast.error("Failed to load starters");
      setStarters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchSchema(), 0);
    return () => clearTimeout(id);
  }, [fetchSchema]);

  const goToStep = (newStep: number) => {
    setStep(newStep);
    if (newStep === 0) fetchSchema();
    else if (newStep === 1) fetchGlossary();
    else if (newStep === 2) fetchStarters();
  };

  const updateGlossaryItem = (
    index: number,
    field: "def" | "maps_to",
    value: string,
  ) => {
    setGlossary((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFinish = useCallback(async () => {
    if (glossary.length > 0) {
      try {
        await apiCall("/api/glossary", { glossary });
      } catch {
        /* non-fatal */
      }
    }
    router.push("/chat");
  }, [glossary, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <Stepper currentStep={step} steps={STEPS} />

      <div className="flex justify-center">
        {step === 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Schema</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : tables.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tables found
                </p>
              ) : (
                <div className="space-y-3">
                  {tables.map((table) => (
                    <div key={table.name} className="rounded-lg border p-3">
                      <div className="font-medium">{table.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {table.cols?.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {table.rows} rows
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Glossary Terms</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : glossary.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No glossary terms found
                </p>
              ) : (
                <div className="space-y-4">
                  {glossary.map((item, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="font-medium text-sm">{item.term}</div>
                      <Input
                        placeholder="Definition"
                        value={item.def || ""}
                        onChange={(e) =>
                          updateGlossaryItem(i, "def", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Maps to"
                        value={item.maps_to || ""}
                        onChange={(e) =>
                          updateGlossaryItem(i, "maps_to", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Starter Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : starters.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No starter queries found
                </p>
              ) : (
                <div className="space-y-3">
                  {starters.map((item, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="font-medium text-sm">
                        {item.question || item.q}
                      </div>
                      <code className="block text-xs bg-muted p-2 rounded mt-2">
                        {item.sql}
                      </code>
                      {item.error && (
                        <p className="text-xs text-destructive mt-1">
                          {item.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => goToStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <div className="flex gap-2">
          {step < 2 && (
            <Button variant="ghost" onClick={() => goToStep(step + 1)}>
              Skip
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => goToStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Finish</Button>
          )}
        </div>
      </div>
    </div>
  );
}

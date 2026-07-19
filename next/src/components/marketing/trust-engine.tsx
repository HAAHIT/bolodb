"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, Brain } from "lucide-react";

const LEVELS = [
  {
    name: "Supervised",
    description: "Initially, all answers require human verification",
    color: "bg-yellow-500",
    icon: Eye,
  },
  {
    name: "Assisted",
    description: "As patterns emerge, the system suggests verified answers",
    color: "bg-blue-500",
    icon: Brain,
  },
  {
    name: "Trusted",
    description: "Highly reliable answers with minimal supervision needed",
    color: "bg-green-500",
    icon: ShieldCheck,
  },
];

export function TrustEngine() {
  return (
    <section id="trust" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Built-in trust engine
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Every answer shows its work. See the SQL, verify the results, and
          build confidence over time.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {LEVELS.map((level) => (
            <Card key={level.name} className="p-6 text-center">
              <div
                className={`h-12 w-12 rounded-full ${level.color}/20 flex items-center justify-center mx-auto mb-4`}
              >
                <level.icon className={`h-6 w-6 ${level.color.replace("bg-", "text-")}`} />
              </div>
              <Badge
                variant="outline"
                className={`mb-3 ${level.color.replace("bg-", "bg-")}/10`}
              >
                {level.name}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {level.description}
              </p>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium mb-1">Transparent by design</p>
              <p className="text-sm text-muted-foreground">
                Every AI-generated answer includes the exact SQL query used,
                execution time, and confidence level. You can verify, correct,
                or regenerate any answer — building a trust bank that makes
                future answers even more reliable.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

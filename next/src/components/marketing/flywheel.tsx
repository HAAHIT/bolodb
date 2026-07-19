"use client";

import { Card } from "@/components/ui/card";
import { RotateCcw, TrendingUp, ShieldCheck, Zap } from "lucide-react";

const PHASES = [
  {
    icon: Zap,
    title: "Ask questions",
    description: "Users ask business questions in plain English",
    color: "text-blue-500",
  },
  {
    icon: RotateCcw,
    title: "Get answers with SQL",
    description: "AI generates and shows the SQL behind every answer",
    color: "text-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Verify & correct",
    description: "Mark answers correct/wrong to train the system",
    color: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Confidence grows",
    description: "Verified answers increase trust levels over time",
    color: "text-orange-500",
  },
];

export function Flywheel() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Gets smarter with every question
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          The more you use BoloDB, the better it understands your data
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHASES.map((phase, i) => (
            <Card key={i} className="p-4 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
                <phase.icon className={`h-5 w-5 ${phase.color}`} />
              </div>
              <h3 className="font-medium text-sm mb-1">{phase.title}</h3>
              <p className="text-xs text-muted-foreground">
                {phase.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

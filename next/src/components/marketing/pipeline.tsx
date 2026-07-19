"use client";

import { Card } from "@/components/ui/card";
import { Database, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Database,
    title: "Connect",
    description: "Connect your PostgreSQL, MySQL, SQLite, or any SQL database in seconds.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageSquare,
    title: "Ask",
    description: "Type questions in plain English. BoloDB understands your schema and business terms.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Trust",
    description: "Review the generated SQL, see the results, and verify correctness. Build trust over time.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How it works
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Three simple steps to turn your data into answers
        </p>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, i) => (
            <div key={i} className="relative">
              <Card className="p-6 h-full">
                <div
                  className={`h-12 w-12 rounded-lg ${step.bg} flex items-center justify-center mb-4`}
                >
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

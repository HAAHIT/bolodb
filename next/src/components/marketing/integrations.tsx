"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const DATABASES = [
  { name: "PostgreSQL", color: "text-blue-500", example: "postgresql://user:pass@host:5432/db" },
  { name: "MySQL", color: "text-orange-500", example: "mysql://user:pass@host:3306/db" },
  { name: "SQL Server", color: "text-red-500", example: "mssql://user:pass@host:1433/db" },
  { name: "SQLite", color: "text-green-500", example: "sqlite:///path/to/database.db" },
];

export function Integrations() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Works with your database
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
          Connect any SQL database with a simple connection string
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DATABASES.map((db, i) => (
            <button
              key={db.name}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {db.name}
            </button>
          ))}
        </div>

        <Card className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{DATABASES[active].name}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(DATABASES[active].example);
                toast.success("Copied to clipboard");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <code className="text-sm bg-muted block p-3 rounded-md text-left">
            {DATABASES[active].example}
          </code>
        </Card>
      </div>
    </section>
  );
}

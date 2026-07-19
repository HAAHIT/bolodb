"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare, Database as DatabaseIcon } from "lucide-react";

const QUESTIONS = [
  "What were our top 5 products by revenue last month?",
  "Show me customer churn rate by quarter",
  "Which marketing channel has the highest conversion?",
  "What's our average order value by region?",
  "List employees who joined in the last 90 days",
];

const SAMPLE_RESULT = {
  columns: ["product", "revenue", "units_sold"],
  rows: [
    ["Wireless Headphones", "$124,500", "1,245"],
    ["Smart Watch Pro", "$98,200", "492"],
    ["Laptop Stand", "$67,800", "2,260"],
    ["USB-C Hub", "$45,300", "1,510"],
    ["Mechanical Keyboard", "$38,900", "389"],
  ],
};

function QuestionDisplay({ question, onDone }: { question: string; onDone: () => void }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < question.length) {
        setDisplayText(question.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onDone();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [question, onDone]);

  return (
    <span className="text-sm text-muted-foreground">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export function LiveDemo() {
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleTypingDone = () => {
    setTimeout(() => setShowResult(true), 500);
  };

  useEffect(() => {
    if (!showResult) return;
    const timer = setTimeout(() => {
      setShowResult(false);
      setCurrentQ((prev) => (prev + 1) % QUESTIONS.length);
    }, 4500);
    return () => clearTimeout(timer);
  }, [showResult]);

  return (
    <section id="demo" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          See it in action
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Watch how BoloDB transforms natural language into precise SQL queries
        </p>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-muted flex items-center px-3">
                <QuestionDisplay
                  key={currentQ}
                  question={QUESTIONS[currentQ]}
                  onDone={handleTypingDone}
                />
              </div>
            </div>
          </div>

          {showResult && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <DatabaseIcon className="h-4 w-4" />
                <span>Query returned 5 rows in 0.8s</span>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {SAMPLE_RESULT.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-medium"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_RESULT.rows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">SQL</p>
                <code className="text-sm">
                  SELECT p.name, SUM(oi.quantity * oi.unit_price) as revenue,
                  SUM(oi.quantity) as units_sold FROM products p JOIN
                  order_items oi ON p.id = oi.product_id ...
                </code>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

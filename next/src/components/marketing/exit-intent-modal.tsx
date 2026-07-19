"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";

export function ExitIntentModal() {
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissedRef.current) {
        setVisible(true);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 12000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleDismiss = () => {
    dismissedRef.current = true;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg p-8 max-w-md mx-4 relative shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-2xl font-bold mb-2">Wait!</h3>
        <p className="text-muted-foreground mb-6">
          Before you go — try asking your data a question. BoloDB turns plain
          English into SQL instantly.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/signup" onClick={handleDismiss}>
            <Button className="w-full">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/connect" onClick={handleDismiss}>
            <Button variant="outline" className="w-full">
              Try with sample data
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

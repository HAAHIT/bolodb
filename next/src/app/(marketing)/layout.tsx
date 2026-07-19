"use client";

import { useEffect } from "react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Footer } from "@/components/marketing/footer";
import { initLenis, destroyLenis } from "@/lib/motion/lenis";
import { prefersReducedMotion } from "@/lib/motion/motion-prefs";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    initLenis();

    return () => {
      destroyLenis();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

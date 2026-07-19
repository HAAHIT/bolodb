"use client";

import { useEffect } from "react";
import { trackSectionView } from "@/lib/marketing/analytics";
import { Backdrop } from "@/components/marketing/backdrop";
import { Hero } from "@/components/marketing/hero";
import { LiveDemo } from "@/components/marketing/live-demo";
import { Pipeline } from "@/components/marketing/pipeline";
import { TrustEngine } from "@/components/marketing/trust-engine";
import { Flywheel } from "@/components/marketing/flywheel";
import { Integrations } from "@/components/marketing/integrations";
import { FinalCta } from "@/components/marketing/final-cta";

const SECTIONS = [
  { id: "hero", section: "hero", Component: Hero },
  { id: "demo", section: "demo", Component: LiveDemo },
  { id: "pipeline", section: "pipeline", Component: Pipeline },
  { id: "trust", section: "trust", Component: TrustEngine },
  { id: "flywheel", section: "flywheel", Component: Flywheel },
  { id: "integrations", section: "integrations", Component: Integrations },
  { id: "cta", section: "cta", Component: FinalCta },
];

export default function MarketingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section");
            if (section) trackSectionView(section as any);
          }
        });
      },
      { threshold: 0.3 },
    );

    const elements = document.querySelectorAll("[data-section]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Backdrop />
      {SECTIONS.map(({ id, section, Component }) => (
        <div key={id} id={id} data-section={section}>
          <Component />
        </div>
      ))}
    </>
  );
}

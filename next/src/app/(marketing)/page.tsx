import { Hero } from "@/components/marketing/hero";
import { LiveDemo } from "@/components/marketing/live-demo";
import { Pipeline } from "@/components/marketing/pipeline";
import { TrustEngine } from "@/components/marketing/trust-engine";
import { Flywheel } from "@/components/marketing/flywheel";
import { Integrations } from "@/components/marketing/integrations";
import { FinalCta } from "@/components/marketing/final-cta";
import { ExitIntentModal } from "@/components/marketing/exit-intent-modal";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <LiveDemo />
      <Pipeline />
      <TrustEngine />
      <Flywheel />
      <Integrations />
      <FinalCta />
      <ExitIntentModal />
    </>
  );
}

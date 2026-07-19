import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to ask your data?
        </h2>
        <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
          Start for free. No credit card required. Connect your database in
          under a minute.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/connect">
            <Button variant="outline" size="lg" className="text-base px-8">
              <Database className="mr-2 h-4 w-4" />
              Try with sample data
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size={24} showText tagline="Ask your data in plain English" />
          </div>
          <div>
            <h4 className="font-medium mb-3">Product</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/#demo" className="block hover:text-foreground">
                Demo
              </Link>
              <Link href="/#pipeline" className="block hover:text-foreground">
                How it works
              </Link>
              <Link href="/#trust" className="block hover:text-foreground">
                Trust
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="block hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="block hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BoloDB. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

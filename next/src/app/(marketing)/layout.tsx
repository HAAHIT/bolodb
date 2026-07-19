"use client";

import { useEffect, useState, useRef } from "react";
import { initLenis, destroyLenis, scrollTo, getLenis } from "@/lib/motion/lenis";
import { loadGsap } from "@/lib/motion/gsap";
import { motionPrefs } from "@/lib/motion/motion-prefs";
import { trackLpView, trackScrollDepth } from "@/lib/marketing/analytics";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Footer } from "@/components/marketing/footer";
import { AuthChoiceModal } from "@/components/marketing/auth-choice-modal";
import { ExitIntentModal } from "@/components/marketing/exit-intent-modal";

const keywords = [
  "database query tool",
  "AI database",
  "natural language database",
  "SQL generator",
  "database chatbot",
  "PostgreSQL AI",
  "MySQL AI",
  "query builder",
  "database assistant",
  "AI SQL",
  "text to SQL",
  "database analytics",
  "data query tool",
  "free database tool",
  "open source database",
].join(", ");

const ldJson = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://bolodb.dev/#organization",
      name: "BoloDB",
      url: "https://bolodb.dev/",
      logo: "https://bolodb.dev/favicon.svg",
      description:
        "Talk to your database in plain English. Get instant verified answers powered by AI.",
      sameAs: ["https://github.com/HAAHIT/bolodb"],
    },
    {
      "@type": "WebApplication",
      "@id": "https://bolodb.dev/#webapplication",
      name: "BoloDB",
      url: "https://bolodb.dev/",
      applicationCategory: "Database Application",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      description:
        "Ask your database questions in plain English and get verified SQL-backed answers.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": "https://bolodb.dev/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://bolodb.dev/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need to know SQL to use BoloDB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. BoloDB translates plain English questions into SQL automatically. You can always inspect the generated SQL to verify the logic.",
          },
        },
        {
          "@type": "Question",
          name: "Does BoloDB send my data to the cloud?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Only your database structure (schema) and question are sent to the AI — never your actual row data. Every query runs read-only.",
          },
        },
        {
          "@type": "Question",
          name: "How accurate is BoloDB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BoloDB shows a confidence score (High, Medium, or Low) for every answer based on verification history and query quality signals. You can verify each answer and help it improve over time.",
          },
        },
        {
          "@type": "Question",
          name: "What databases does BoloDB support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BoloDB works with PostgreSQL, MySQL, SQL Server, SQLite, and any SQL database via a connection string.",
          },
        },
        {
          "@type": "Question",
          name: "Is BoloDB free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "BoloDB itself is free and open source. You only need a free Google Gemini API key to power the AI features.",
          },
        },
      ],
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const gsapCleanup = useRef<{ gsap: any; ticker: (t: number) => void }>(undefined);

  useEffect(() => {
    document.title =
      "BoloDB — Talk to your database in plain English";

    const setMeta = (
      name: string,
      content: string,
      property = false,
    ) => {
      const key = property ? `property="${name}"` : `name="${name}"`;
      let el = document.querySelector(`meta[${key}]`);
      if (!el) {
        el = document.createElement("meta");
        if (property) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (
      rel: string,
      href: string,
      extra?: Record<string, string>,
    ) => {
      let selector = `link[rel="${rel}"]`;
      if (extra?.hreflang) selector += `[hreflang="${extra.hreflang}"]`;
      let el: Element | null = document.querySelector(selector);
      if (!el) {
        el = document.createElement("link");
        (el as HTMLLinkElement).setAttribute("rel", rel);
        if (extra) {
          Object.entries(extra).forEach(([k, v]) =>
            el!.setAttribute(k, v),
          );
        }
        document.head.appendChild(el);
      }
      (el as HTMLLinkElement).setAttribute("href", href);
    };

    setMeta("robots", "index, follow");
    setMeta("keywords", keywords);
    setMeta("author", "BoloDB");
    setMeta("theme-color", "#0a0a0b");

    setMeta("og:title", "BoloDB — Talk to your database in plain English", true);
    setMeta("og:description", "Ask your data in plain English. Trust the answer you get back.", true);
    setMeta("og:url", "https://bolodb.dev/", true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "BoloDB", true);
    setMeta("og:locale", "en_US", true);
    setMeta("og:image", "https://bolodb.dev/og.png", true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", "BoloDB — Ask your data in plain English", true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "BoloDB — Talk to your database in plain English");
    setMeta("twitter:description", "Ask your data in plain English. Trust the answer you get back.");
    setMeta("twitter:image", "https://bolodb.dev/og.png");
    setMeta("twitter:image:alt", "BoloDB — Ask your data in plain English");

    setLink("canonical", "https://bolodb.dev/");
    setLink("alternate", "https://bolodb.dev/", { hreflang: "x-default" });
    setLink("alternate", "https://bolodb.dev/", { hreflang: "en" });
    setLink("alternate", "https://bolodb.dev/llms.txt", {
      type: "text/plain",
      title: "LLMs",
    });

    const handleAuth = (e: CustomEvent) => {
      setAuthMode(e.detail?.mode || "signup");
      setAuthOpen(true);
    };
    window.addEventListener(
      "bolodb:open-auth",
      handleAuth as EventListener,
    );

    if (!motionPrefs.reduced) {
      (async () => {
        const lenis = await initLenis();
        const { gsap, ScrollTrigger } = await loadGsap();
        const ticker = (t: number) => lenis.raf(t * 1000);
        gsap.ticker.add(ticker);
        lenis.on("scroll", ScrollTrigger.update);
        gsapCleanup.current = { gsap, ticker };
      })();
    }

    const handleAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a?.getAttribute("href")?.startsWith("#")) {
        e.preventDefault();
        scrollTo(a.getAttribute("href")!.slice(1));
      }
    };
    document.addEventListener("click", handleAnchor);

    const depths = new Set<number>();
    const handleScroll = () => {
      const st = window.scrollY;
      const dh =
        document.documentElement.scrollHeight - window.innerHeight;
      if (dh <= 0) return;
      const pct = Math.round((st / dh) * 100);
      [25, 50, 75, 100].forEach((d) => {
        if (pct >= d && !depths.has(d)) {
          depths.add(d);
          trackScrollDepth(d);
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    trackLpView();

    return () => {
      window.removeEventListener(
        "bolodb:open-auth",
        handleAuth as EventListener,
      );
      document.removeEventListener("click", handleAnchor);
      window.removeEventListener("scroll", handleScroll);
      if (gsapCleanup.current) {
        gsapCleanup.current.gsap.ticker.remove(
          gsapCleanup.current.ticker,
        );
      }
      destroyLenis();
    };
  }, []);

  return (
    <div className="marketing-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <MarketingNav />
      <main id="main-content" className="marketing-main">
        {children}
      </main>
      <Footer />
      <AuthChoiceModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
      />
      <ExitIntentModal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </div>
  );
}

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: January 2025
      </p>
      <div className="space-y-4 text-muted-foreground">
        <p>
          BoloDB (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to
          protecting your privacy. This Privacy Policy explains how we collect,
          use, and share your personal information when you use our service.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Information We Collect
        </h2>
        <p>
          We collect information you provide directly, such as your email
          address when you create an account. We also collect usage data to help
          us improve our service.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          How We Use Your Information
        </h2>
        <p>
          We use your information to provide, maintain, and improve our service,
          to communicate with you, and to comply with legal obligations.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Data Security
        </h2>
        <p>
          We implement appropriate security measures to protect your personal
          information. However, no method of transmission over the Internet is
          100% secure.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at
          privacy@bolodb.com.
        </p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-primary hover:underline text-sm">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}

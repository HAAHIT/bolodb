import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: January 2025
      </p>
      <div className="space-y-4 text-muted-foreground">
        <p>
          By using BoloDB (&ldquo;the Service&rdquo;), you agree to these terms. Please read
          them carefully.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Acceptance of Terms
        </h2>
        <p>
          By accessing or using the Service, you agree to be bound by these
          terms. If you do not agree, do not use the Service.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Use of Service
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials. You agree not to use the Service for any unlawful
          purpose.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Limitation of Liability
        </h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We are
          not liable for any damages arising from your use of the Service.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Changes</h2>
        <p>
          We reserve the right to modify these terms at any time. We will notify
          users of material changes via email or through the Service.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p>
          For questions about these terms, contact us at legal@bolodb.com.
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

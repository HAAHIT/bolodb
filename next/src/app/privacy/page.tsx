export default function PrivacyPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-20 pb-[120px]">
      <h1 className="text-4xl font-extrabold mb-1 leading-tight">Privacy Policy</h1>
      <p className="text-[13px] text-muted-foreground mb-12">Last updated: July 16, 2026</p>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">What we collect</h2>
        <ul className="pl-5 space-y-2">
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Account info</strong> &mdash; email address and hashed password for authentication.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Database connections</strong> &mdash; connection strings are encrypted at rest and used only to run your queries.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Queries and results</strong> &mdash; your questions, generated SQL, and result sets are stored to power the trust flywheel and history.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Analytics</strong> &mdash; anonymous product analytics via PostHog. Respects <code className="font-mono text-[13px] bg-muted px-1.5 py-0.5 rounded">Do Not Track</code>. No personal data is sent.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">What we send externally</h2>
        <ul className="pl-5 space-y-2">
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Schema + your question</strong> &mdash; sent to Google Gemini to generate SQL. Your row data never leaves your machine.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground"><strong>Email</strong> &mdash; verification and password-reset emails are sent through MyEmailVerifier and Resend.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">What we never do</h2>
        <ul className="pl-5 space-y-2">
          <li className="text-[15px] leading-relaxed text-muted-foreground">We never sell or share your data with third parties for advertising.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground">We never read or transmit your actual database rows.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground">We never track you across sites.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Data storage</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          User accounts and query history are stored in PostgreSQL (Supabase).
          The local knowledge base is stored in SQLite on your machine.
          Database connection strings are encrypted using Fernet symmetric encryption.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Changes</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top
          will always reflect the most recent revision.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Contact</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Questions? Open an issue on{" "}
          <a href="https://github.com/HAAHIT/bolodb" className="text-primary no-underline hover:underline">GitHub</a>.
        </p>
      </section>
    </main>
  );
}

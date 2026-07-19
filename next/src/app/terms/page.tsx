export default function TermsPage() {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-20 pb-[120px]">
      <h1 className="text-4xl font-extrabold mb-1 leading-tight">Terms of Service</h1>
      <p className="text-[13px] text-muted-foreground mb-12">Last updated: July 16, 2026</p>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Acceptance</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          By using BoloDB you agree to these terms. If you do not agree, do not use the service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">What BoloDB does</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          BoloDB converts plain-English questions into SQL, runs them against your
          database in read-only mode, and returns results with a confidence score.
          It is an open-source tool &mdash; you host it yourself.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Your data</h2>
        <ul className="pl-5 space-y-2">
          <li className="text-[15px] leading-relaxed text-muted-foreground">You retain full ownership of all data in your database.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground">BoloDB never writes to your database &mdash; all queries are read-only.</li>
          <li className="text-[15px] leading-relaxed text-muted-foreground">Only your schema structure and question are sent to Google Gemini for SQL generation. Row data stays on your machine.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">API costs</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          SQL generation uses the Google Gemini API. You are responsible for your own
          Gemini API key and any associated costs. BoloDB does not mark up or resell API access.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Limitation of liability</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          BoloDB is provided &ldquo;as is&rdquo; without warranty. We are not responsible for any
          damage arising from use of the service, including but not limited to incorrect
          SQL generation or data loss (though read-only mode prevents the latter).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Changes</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the top
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

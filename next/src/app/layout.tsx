import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { PostHogProvider } from "@/providers/posthog-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "BoloDB — Ask your data in plain English",
  description:
    "Ask your data in plain English. Trust the answer you get back.",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("bolodb_theme");
                  var theme = stored === "dark" ? "dark" : stored ? "light" : "dark";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <PostHogProvider>
              {children}
              <Toaster richColors position="top-right" />
            </PostHogProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

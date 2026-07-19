export const routing = {
  locales: ["en", "de", "es", "fr", "ja"],
  defaultLocale: "en",
  localeDetection: true,
} as const;

export type Locale = (typeof routing.locales)[number];

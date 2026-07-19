// next-intl middleware disabled — locale detection
// is handled server-side via i18n/request.ts.
// Flat routes (/, /login, /chat) don't use locale prefix,
// so middleware would only cause unnecessary redirects.
export default function middleware() {}

export const config = {
  matcher: [],
};

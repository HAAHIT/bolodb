import type { Handle } from "@sveltejs/kit";

const SUPPORTED = ["en", "de", "ja", "es", "fr"];

export const handle: Handle = async ({ event, resolve }) => {
  const accept = event.request.headers.get("accept-language") || "";
  const cookie = event.cookies.get("locale") || "";

  let locale = "en";
  if (SUPPORTED.includes(cookie)) {
    locale = cookie;
  } else if (SUPPORTED.includes(accept.slice(0, 2))) {
    locale = accept.slice(0, 2);
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", locale),
  });

  if (!cookie && locale !== "en") {
    response.headers.set(
      "Set-Cookie",
      `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`,
    );
  }

  return response;
};

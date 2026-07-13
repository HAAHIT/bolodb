from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from backend.app.i18n.context import current_locale
from backend.app.i18n.translator import SUPPORTED_LOCALES, DEFAULT_LOCALE

LOCALE_COOKIE = "locale"
LOCALE_HEADER = "X-Locale"


class LocaleMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        locale = (
            request.headers.get(LOCALE_HEADER)
            or request.cookies.get(LOCALE_COOKIE)
            or DEFAULT_LOCALE
        )
        if locale not in SUPPORTED_LOCALES:
            locale = DEFAULT_LOCALE

        token = current_locale.set(locale)
        request.state.locale = locale

        try:
            response: Response = await call_next(request)
            return response
        finally:
            current_locale.reset(token)

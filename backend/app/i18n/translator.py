import gettext
from pathlib import Path

from backend.app.i18n.context import current_locale

LOCALE_DIR = Path(__file__).parent / "locales"

DEFAULT_LOCALE = "en"

SUPPORTED_LOCALES = frozenset({"en", "de", "ja", "es", "fr"})

_domains: dict[str, gettext.NullTranslations] = {}


def get_domain(locale: str, domain: str) -> gettext.NullTranslations:
    key = f"{locale}:{domain}"
    if key not in _domains:
        try:
            t = gettext.translation(
                domain,
                localedir=str(LOCALE_DIR),
                languages=[locale],
                fallback=True,
            )
        except FileNotFoundError:
            t = gettext.NullTranslations()
        _domains[key] = t
    return _domains[key]


def _(message: str, domain: str = "base") -> str:
    locale = current_locale.get()
    if locale not in SUPPORTED_LOCALES:
        locale = DEFAULT_LOCALE
    return get_domain(locale, domain).gettext(message)


def ngettext(singular: str, plural: str, n: int, domain: str = "base") -> str:
    locale = current_locale.get()
    if locale not in SUPPORTED_LOCALES:
        locale = DEFAULT_LOCALE
    return get_domain(locale, domain).ngettext(singular, plural, n)

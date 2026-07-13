import contextvars

current_locale = contextvars.ContextVar("locale", default="en")

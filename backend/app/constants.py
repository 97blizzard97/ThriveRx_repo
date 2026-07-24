from uuid import UUID

# Until magic-link auth: single dev patient for local/stub API calls.
STUB_USER_ID = UUID("00000000-0000-0000-0000-000000000000")
STUB_USER_EMAIL = "dev-stub@thriverx.local"

SUPPORTED_LOCALES: frozenset[str] = frozenset({"en", "zh", "vi"})


def normalize_locale(locale: str) -> str:
    return locale if locale in SUPPORTED_LOCALES else "en"

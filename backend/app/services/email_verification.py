"""MyEmailVerifier integration — real-time email verification at signup.

Uses MyEmailVerifier's single-address REST API to validate email deliverability
before creating a user account. Blocks Invalid, Unknown, or Disposable
addresses; allows Valid and Catch-All.

Docs: https://client.myemailverifier.com/verifier/validate_single/{email}/{api_key}
"""

import logging
import os
from typing import Optional

import httpx

log = logging.getLogger(__name__)

BASE_URL = "https://client.myemailverifier.com/verifier/validate_single"
TIMEOUT_SECONDS = 8.0


def _get_api_key() -> Optional[str]:
    return os.environ.get("MYEMAILVERIFIER_API_KEY")


class EmailVerificationOutcome:
    """Structured verification outcome."""

    def __init__(
        self,
        allowed: bool,
        status: str,
        reason: str,
        disposable: bool = False,
        catch_all: bool = False,
        skipped: bool = False,
    ):
        self.allowed = allowed
        self.status = status
        self.reason = reason
        self.disposable = disposable
        self.catch_all = catch_all
        self.skipped = skipped


async def verify_email(email: str) -> EmailVerificationOutcome:
    """Call MyEmailVerifier for real-time email verification.

    Business rules:
      - Block: Status in {Invalid, Unknown} OR Disposable_Domain=True
      - Allow: Status=Valid OR catch_all=True
      - On network/service error: allow (fail-open) so signup isn't blocked
        by a transient issue — logged for observability.
    """
    api_key = _get_api_key()
    if not api_key:
        log.warning("MYEMAILVERIFIER_API_KEY not set — skipping verification")
        return EmailVerificationOutcome(
            allowed=True,
            status="skipped",
            reason="Verification service not configured",
            skipped=True,
        )

    url = f"{BASE_URL}/{email}/{api_key}"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
    except (httpx.HTTPError, ValueError) as e:
        log.warning("MyEmailVerifier call failed for %s: %s", email, e)
        return EmailVerificationOutcome(
            allowed=True,
            status="error",
            reason="Verification service unavailable",
            skipped=True,
        )

    status = str(data.get("Status", "")).strip().lower()
    disposable = _to_bool(data.get("Disposable_Domain"))
    catch_all = _to_bool(data.get("catch_all"))
    diagnosis = data.get("Diagnosis", "")

    if disposable:
        return EmailVerificationOutcome(
            allowed=False,
            status=status or "disposable",
            reason="Please use a permanent email address (disposable domains are not allowed).",
            disposable=True,
            catch_all=catch_all,
        )

    if status in {"invalid"}:
        return EmailVerificationOutcome(
            allowed=False,
            status=status,
            reason=diagnosis or "This email address doesn't appear to exist.",
            disposable=False,
            catch_all=catch_all,
        )

    if status in {"unknown"}:
        return EmailVerificationOutcome(
            allowed=False,
            status=status,
            reason="We couldn't verify this email address. Please try a different one.",
            disposable=False,
            catch_all=catch_all,
        )

    # Valid or catch-all → allow
    return EmailVerificationOutcome(
        allowed=True,
        status=status or "valid",
        reason="",
        disposable=False,
        catch_all=catch_all,
    )


def _to_bool(v) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, str):
        return v.strip().lower() in {"true", "1", "yes"}
    return bool(v)

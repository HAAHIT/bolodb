"""OTP code CRUD operations for email verification."""

import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update as sqlalchemy_update

from backend.app.pgdatabase.engine import get_engine
from backend.app.pgdatabase.models import OtpCode

logger = logging.getLogger(__name__)

OTP_TTL_MINUTES = 10
OTP_LENGTH = 6


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def generate_otp() -> str:
    """Generate a numeric OTP code (e.g. '048291')."""
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


async def create_otp(user_id: str, purpose: str = "signup") -> str:
    """Create an OTP code for a user and return the plain-text code.

    Any existing unused OTP for the same (user_id, purpose) is marked as used
    before creating a new one.
    """
    code = generate_otp()
    code_hash = _hash_code(code)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)

    engine = get_engine()
    async with engine.begin() as conn:
        await conn.execute(
            sqlalchemy_update(OtpCode)
            .where(
                OtpCode.user_id == user_id,
                OtpCode.purpose == purpose,
                OtpCode.used.is_(False),
            )
            .values(used=True)
        )
        await conn.execute(
            OtpCode.__table__.insert().values(
                user_id=user_id,
                code_hash=code_hash,
                purpose=purpose,
                expires_at=expires_at,
                used=False,
            )
        )

    return code


async def verify_otp(user_id: str, code: str, purpose: str = "signup") -> bool:
    """Verify an OTP code. Returns True if valid and marks it as used."""
    code_hash = _hash_code(code)

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            select(OtpCode)
            .where(
                OtpCode.user_id == user_id,
                OtpCode.purpose == purpose,
                OtpCode.code_hash == code_hash,
                OtpCode.used.is_(False),
            )
            .with_for_update()
        )
        record = result.scalar_one_or_none()

        if not record:
            return False

        if datetime.now(timezone.utc) > record.expires_at:
            return False

        await conn.execute(
            sqlalchemy_update(OtpCode)
            .where(
                OtpCode.id == record.id,
                OtpCode.used.is_(False),
            )
            .values(used=True)
        )

    return True

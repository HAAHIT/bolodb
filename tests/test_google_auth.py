"""Tests for google_login (backend/app/controllers/auth.py).

Security regression guard: a Google ID token whose email is not verified must
never be trusted for find-or-link, otherwise an unverified email matching an
existing password account would allow account takeover.
"""

import jwt
import pytest
from fastapi import HTTPException

import backend.app.controllers.auth as auth


class _FakeSigningKey:
    key = "fake-key"


class _FakeJWKClient:
    def __init__(self, *a, **k):
        pass

    def get_signing_key_from_jwt(self, token):
        return _FakeSigningKey()


def _patch_verification(monkeypatch, payload):
    monkeypatch.setattr(jwt, "PyJWKClient", _FakeJWKClient)
    monkeypatch.setattr(auth.jwt, "decode", lambda *a, **k: payload)


def test_google_login_rejects_unverified_email(monkeypatch):
    _patch_verification(
        monkeypatch,
        {"sub": "g-1", "email": "victim@example.com", "email_verified": False},
    )
    # would take over an existing account if this were allowed
    monkeypatch.setattr(auth, "get_user_by_google_id", lambda gid: None)
    monkeypatch.setattr(
        auth, "get_user_by_email", lambda e: {"_id": "existing", "role": "user"}
    )

    with pytest.raises(HTTPException) as exc:
        auth.google_login("token", "client-id")
    assert exc.value.status_code == 401


def test_google_login_creates_user_for_verified_email(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    _patch_verification(
        monkeypatch,
        {"sub": "g-2", "email": "new@example.com", "email_verified": True},
    )
    monkeypatch.setattr(auth, "get_user_by_google_id", lambda gid: None)
    monkeypatch.setattr(auth, "get_user_by_email", lambda e: None)

    class _Res:
        inserted_id = "uid-123"

    monkeypatch.setattr(auth, "create_user", lambda u: _Res())

    tokens = auth.google_login("token", "client-id")
    assert "access_token" in tokens
    assert "refresh_token" in tokens


def test_google_login_rejects_empty_email(monkeypatch):
    """A Google token without an email must be rejected outright."""
    _patch_verification(
        monkeypatch,
        {"sub": "g-3", "email": "", "email_verified": True},
    )
    monkeypatch.setattr(auth, "get_user_by_google_id", lambda gid: None)
    monkeypatch.setattr(auth, "get_user_by_email", lambda e: None)

    with pytest.raises(HTTPException) as exc:
        auth.google_login("token", "client-id")
    assert exc.value.status_code == 400


def test_google_login_handles_jwk_failure_gracefully(monkeypatch):
    """A failed JWKS key fetch must surface as a generic 401, not a 500."""

    def _fail(*a, **k):
        raise RuntimeError("JWKS unavailable")

    monkeypatch.setattr(jwt, "PyJWKClient", _fail)

    with pytest.raises(HTTPException) as exc:
        auth.google_login("bad-token", "client-id")
    assert exc.value.status_code == 401


def test_google_login_links_existing_email(monkeypatch):
    """If a Google user logs in with an email that matches an existing password
    account, the google_id should be linked and JWT returned."""
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    _patch_verification(
        monkeypatch,
        {"sub": "g-4", "email": "existing@example.com", "email_verified": True},
    )
    monkeypatch.setattr(auth, "get_user_by_google_id", lambda gid: None)
    monkeypatch.setattr(
        auth,
        "get_user_by_email",
        lambda e: {"_id": "existing-id", "role": "user"},
    )
    monkeypatch.setattr(auth, "update_user", lambda f, u: None)

    tokens = auth.google_login("token", "client-id")
    assert "access_token" in tokens


def test_google_login_rejects_malformed_token(monkeypatch):
    """A token that fails verification must produce a generic 401, not a 500."""

    def _decode_fail(*a, **k):
        raise ValueError("malformed token")

    monkeypatch.setattr(jwt, "PyJWKClient", _FakeJWKClient)
    monkeypatch.setattr(auth.jwt, "decode", _decode_fail)

    with pytest.raises(HTTPException) as exc:
        auth.google_login("garbage-token", "client-id")
    assert exc.value.status_code == 401

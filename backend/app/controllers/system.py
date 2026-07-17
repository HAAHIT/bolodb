import os
import logging

from backend.app import config as cfgmod
from backend.app.secrets import (
    get_jwt_secret,
    get_supabase_url,
    get_supabase_anon_key,
)
import backend.app.pgdatabase as mdb

log = logging.getLogger(__name__)


async def get_state(user_id, db, cfg, kb):
    config = cfgmod.public_config(cfg)
    config.pop("last_db_url", None)
    user = await mdb.get_user_by_id(user_id)
    s = {
        "connected": db.connected(user_id),
        "config": config,
        "openrouter_ready": bool(os.environ.get("OPENROUTER_API_KEY")),
        "tour_completed": user.get("tour_completed", False) if user else False,
    }
    if db.connected(user_id):
        dbid = db.get_db_id(user_id)
        s["database"] = {
            "url": db.get_info(user_id)["url"],
            "dialect": db.get_dialect(user_id),
            "db_id": db.get_info(user_id)["db_id"],
            "tables": db.get_info(user_id)["tables"],
            "has_knowledge": (await kb.count_verified(user_id, dbid)) > 0,
        }
        s["trust"] = await kb.trust_level(user_id, dbid)
        s["glossary"] = await kb.get_glossary(user_id, dbid)
        s["starters"] = [
            v["question"] for v in (await kb.get_verified(user_id, dbid))[:6]
        ]
    return s


async def get_health(pg_status="unknown"):
    env_checks = {
        "JWT_SECRET": bool(get_jwt_secret()) if os.getenv("JWT_SECRET") else False,
        "SUPABASE_URL": bool(get_supabase_url()),
        "SUPABASE_ANON_KEY": bool(get_supabase_anon_key()),
        "SUPABASE_JWT_SECRET": bool(os.getenv("SUPABASE_JWT_SECRET")),
        "DATABASE_URL": bool(os.getenv("DATABASE_URL")),
        "COOKIE_SECURE": os.getenv("COOKIE_SECURE", "false"),
        "CORS_ORIGINS": os.getenv("CORS_ORIGINS", "(not set, using defaults)"),
    }

    jwks_status = "unchecked"
    supabase_url = get_supabase_url()
    if supabase_url:
        try:
            import httpx

            jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
            resp = await httpx.AsyncClient(timeout=5).get(jwks_url)
            if resp.status_code == 200:
                jwks_status = "reachable"
            else:
                jwks_status = f"unexpected_status:{resp.status_code}"
        except Exception as e:
            jwks_status = f"unreachable:{e.__class__.__name__}"

    return {
        "status": "ok" if pg_status == "connected" else "degraded",
        "postgres": pg_status,
        "env": env_checks,
        "supabase_jwks": jwks_status,
    }


async def set_tour_completed(user_id):
    await mdb.update_user(user_id, tour_completed=True)
    return {"ok": True, "tour_completed": True}


async def update_config(user_id, cfg, providers, req_data):
    """Update AI settings. The only settable field is last_db_url."""
    if req_data.last_db_url is not None:
        cfg["last_db_url"] = req_data.last_db_url
    cfgmod.save_config(cfg)
    return {"config": cfgmod.public_config(cfg)}

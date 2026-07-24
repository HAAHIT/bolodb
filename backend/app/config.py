"""Runtime configuration, held in memory only.

BoloDB keeps no local state on disk. Secrets come from the environment, and
everything a user creates lives in Postgres. The only file the app writes is the
sample database, and that is a regenerable cache under the repo's ``data/``
directory (see ``backend/sample_data.py``), not configuration.

``cfg`` is a small per-process dict: the OpenRouter key (always read fresh from
the environment) and the last connected database URL (a convenience value that
lives only for the process lifetime). Nothing here is persisted.
"""

import logging
import os

log = logging.getLogger(__name__)

ACTIVITY_LOG_RETENTION_DAYS = int(os.environ.get("ACTIVITY_LOG_RETENTION_DAYS", "30"))
# Periodic pruning of activity rows past the retention window. Safe to run
# in-process because BoloDB is deployed single-process; set the flag to "false"
# if that ever stops being true and the job moves to a dedicated worker.
ACTIVITY_CLEANUP_ENABLED = os.environ.get(
    "ACTIVITY_CLEANUP_ENABLED", "true"
).lower() not in ("false", "0", "no")
ACTIVITY_CLEANUP_INTERVAL_HOURS = float(
    os.environ.get("ACTIVITY_CLEANUP_INTERVAL_HOURS", "24")
)

DEFAULTS = {
    "openrouter_key": "",
    "last_db_url": "",
}


def default_config():
    return dict(DEFAULTS)


def load_config():
    """Build the in-memory config from the environment. Reads no files."""
    cfg = default_config()
    # The API key is always read fresh from the environment, never stored.
    cfg["openrouter_key"] = os.environ.get("OPENROUTER_API_KEY", "")
    return cfg


def save_config(cfg):
    """No-op: config is in-memory only.

    Kept so callers that update `last_db_url` don't have to special-case
    persistence — mutating the shared `cfg` dict is the whole effect, and it
    lasts exactly as long as the process, which is all that value needs.
    """
    return None


def public_config(cfg):
    """Config as exposed to the frontend — never includes the API key."""
    return {
        "last_db_url": cfg.get("last_db_url", ""),
    }

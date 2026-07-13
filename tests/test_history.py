import os
import pytest


def test_pgdatabase_imports():
    """Verify all pgdatabase functions can be imported.

    Skips if DATABASE_URL is not set — the module raises at import time
    in that case (fail-fast per design).
    """
    if not os.getenv("DATABASE_URL"):
        pytest.skip("DATABASE_URL not set — skipping pgdatabase import test")

    from backend.app.pgdatabase import (
        get_user_by_email, create_user, get_user_by_id,
        save_query, get_query_history, delete_history_entry, clear_history,
        create_conversation, get_conversations, delete_conversation,
        save_recent_connection, get_recent_connections,
        conversation_owned_by, get_conversation,
        rename_conversation, touch_conversation, clear_conversations,
        get_query_stats, delete_recent_connection, get_recent_connection_by_db_id,
        update_user, serialize_doc, dispose_db,
    )

    for fn in (
        get_user_by_email, create_user, get_user_by_id,
        save_query, get_query_history, delete_history_entry, clear_history,
        create_conversation, get_conversations, delete_conversation,
        save_recent_connection, get_recent_connections,
        conversation_owned_by, get_conversation,
        rename_conversation, touch_conversation, clear_conversations,
        get_query_stats, delete_recent_connection, get_recent_connection_by_db_id,
        update_user,
    ):
        assert callable(fn), f"{fn.__name__} is not callable"

    assert callable(serialize_doc)
    assert callable(dispose_db)

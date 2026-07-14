"""Create initial schema (users, conversations, query_history, recent_connections)

Revision ID: 0001
Revises:
Create Date: 2026-07-13
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    # Primary keys carry no server_default: the application is the sole writer
    # and generates UUIDv7 ids in Python (pgdatabase._uuid7). A gen_random_uuid()
    # default would emit UUIDv4 on any direct insert/backfill, producing a mix of
    # UUID versions and losing the time-ordering UUIDv7 provides.
    op.create_table(
        "users",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_pass", sa.String(), nullable=False, server_default=""),
        sa.Column("role", sa.String(), nullable=False, server_default="user"),
        sa.Column("google_id", sa.String(), nullable=True, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "conversations",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(), nullable=False, server_default=""),
        sa.Column("database_id", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "query_history",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("sql", sa.Text(), nullable=False, server_default=""),
        sa.Column("result", JSONB(), nullable=True),
        sa.Column("confidence", sa.String(), nullable=False, server_default="low"),
        sa.Column("restatement", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "conversation_id",
            UUID(as_uuid=True),
            sa.ForeignKey("conversations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "recent_connections",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("db_url", sa.Text(), nullable=False),
        sa.Column("display_url", sa.String(), nullable=False),
        sa.Column("dialect", sa.String(), nullable=False),
        sa.Column("db_id", sa.String(), nullable=False),
        sa.Column("table_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "connected_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", "db_id"),
    )

    op.create_index("idx_query_history_user_id", "query_history", ["user_id"])
    op.create_index(
        "idx_query_history_conversation_id", "query_history", ["conversation_id"]
    )
    op.create_index(
        "idx_query_history_timestamp",
        "query_history",
        ["user_id", sa.text("timestamp DESC")],
    )
    op.create_index(
        "idx_conversations_user_id",
        "conversations",
        ["user_id", sa.text("updated_at DESC")],
    )
    op.create_index("idx_recent_connections_user_id", "recent_connections", ["user_id"])


def downgrade() -> None:
    op.drop_table("recent_connections")
    op.drop_table("query_history")
    op.drop_table("conversations")
    op.drop_table("users")

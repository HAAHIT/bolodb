import asyncio
from backend.app.pgdatabase.connections import save_recent_connection


async def test():
    # We need a valid workspace_id
    from backend.app.pgdatabase.engine import async_session
    from backend.app.models.workspace import Workspace
    from sqlalchemy import select

    async with async_session() as session:
        result = await session.execute(select(Workspace).limit(1))
        ws = result.scalar_one_or_none()

    if not ws:
        print("No workspace found")
        return

    print(f"Testing with workspace {ws.id}")
    try:
        await save_recent_connection(
            workspace_id=str(ws.id),
            db_url="postgresql://test:test@localhost:5432/test",
            display_url="postgresql://test:***@localhost:5432/test",
            dialect="postgresql",
            db_id="test_db_id",
            table_count=10,
            alias_name="test_alias",
        )
        print("Save successful")
    except Exception as e:
        print(f"Save failed: {e}")


if __name__ == "__main__":
    asyncio.run(test())

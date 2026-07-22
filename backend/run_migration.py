import asyncio
from sqlalchemy.ext.asyncio import create_async_engine


async def main():
    db_url = "postgresql+asyncpg://bolodb:bolopass@localhost:5432/bolodb"
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        from sqlalchemy import text

        await conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;"
            )
        )
    await engine.dispose()
    print("Migration done")


asyncio.run(main())

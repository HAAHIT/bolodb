import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("postgresql://"):
    db_url = "postgresql+asyncpg://" + db_url[len("postgresql://") :]


async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(
            text("SELECT id, user_id, role FROM workspace_members;")
        )
        for row in res.fetchall():
            print(row)


asyncio.run(main())

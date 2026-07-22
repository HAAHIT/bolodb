import asyncio
from backend.app.pgdatabase.core import async_session
from backend.app.models.workspace import Workspace


async def test_get():
    async with async_session() as session:
        result = await session.execute("SELECT id FROM workspaces LIMIT 1")
        row = result.fetchone()
        if not row:
            print("No workspaces")
            return
        wid = row[0]

        ws = await session.get(Workspace, wid)
        if ws:
            print("Found ws", ws.name)
        else:
            print("ws is None")


asyncio.run(test_get())

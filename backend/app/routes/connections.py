from fastapi import APIRouter, Depends
from backend.app.dependencies import get_current_user
import backend.app.pgdatabase as mdb

router = APIRouter()


@router.get("/api/connections")
async def get_connections(user_token=Depends(get_current_user)):
    connections = await mdb.get_recent_connections(user_token["user_id"])
    for c in connections:
        c.pop("db_url", None)
    return {"connections": connections}


@router.delete("/api/connections/{connection_id}")
async def delete_connection(connection_id: str, user_token=Depends(get_current_user)):
    deleted = await mdb.delete_recent_connection(
        user_token["user_id"], connection_id
    )
    return {"ok": deleted}

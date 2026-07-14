from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from backend.app.dependencies import get_current_user
import backend.app.pgdatabase as db

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def get_history(
    limit: int = Query(default=100, ge=1, le=500),
    user_token=Depends(get_current_user),
):
    user_id = user_token["user_id"]
    history = await db.get_query_history(user_id, limit)
    return JSONResponse({"history": history})


@router.get("/stats")
async def get_stats(user_token=Depends(get_current_user)):
    user_id = user_token["user_id"]
    stats = await db.get_query_stats(user_id)
    return JSONResponse(stats)


@router.delete("/{entry_id}")
async def delete_entry(entry_id: str, user_token=Depends(get_current_user)):
    user_id = user_token["user_id"]
    success = await db.delete_history_entry(user_id, entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found or unauthorized")
    return JSONResponse({"message": "Deleted successfully"})


@router.delete("")
async def clear_history(user_token=Depends(get_current_user)):
    user_id = user_token["user_id"]
    await db.clear_history(user_id)
    return JSONResponse({"message": "Cleared successfully"})

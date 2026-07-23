import logging
import asyncio
from backend.app.pgdatabase import dashboards as mdb_dash
from backend.app.pgdatabase import saved_queries as mdb_sq

log = logging.getLogger(__name__)

# --- Saved Queries ---


async def create_saved_query(workspace_id: str, created_by: str, data: dict):
    return await mdb_sq.create_saved_query(workspace_id, created_by, **data)


async def list_saved_queries(workspace_id: str, limit: int = 50, offset: int = 0):
    return await mdb_sq.list_saved_queries(workspace_id, limit, offset)


async def get_saved_query(workspace_id: str, query_id: str):
    return await mdb_sq.get_saved_query(workspace_id, query_id)


async def update_saved_query(workspace_id: str, query_id: str, data: dict):
    return await mdb_sq.update_saved_query(workspace_id, query_id, **data)


async def delete_saved_query(workspace_id: str, query_id: str):
    return await mdb_sq.delete_saved_query(workspace_id, query_id)


# --- Dashboards ---


async def create_dashboard(
    workspace_id: str, created_by: str, name: str, description: str = None
):
    return await mdb_dash.create_dashboard(workspace_id, created_by, name, description)


async def list_dashboards(workspace_id: str):
    return await mdb_dash.list_dashboards(workspace_id)


async def get_dashboard(workspace_id: str, dashboard_id: str):
    return await mdb_dash.get_dashboard(workspace_id, dashboard_id)


async def update_dashboard(workspace_id: str, dashboard_id: str, data: dict):
    return await mdb_dash.update_dashboard(workspace_id, dashboard_id, **data)


async def delete_dashboard(workspace_id: str, dashboard_id: str):
    return await mdb_dash.delete_dashboard(workspace_id, dashboard_id)


# --- Panels ---


async def add_panel(dashboard_id: str, data: dict):
    return await mdb_dash.add_panel(dashboard_id, **data)


async def update_panel(dashboard_id: str, panel_id: str, data: dict):
    return await mdb_dash.update_panel(dashboard_id, panel_id, **data)


async def delete_panel(dashboard_id: str, panel_id: str):
    return await mdb_dash.delete_panel(dashboard_id, panel_id)


async def update_panels_batch(dashboard_id: str, updates: list):
    return await mdb_dash.update_panels_batch(dashboard_id, updates)


# --- Execution ---


async def execute_dashboard_queries(workspace_id: str, dashboard_id: str, db_manager):
    dash = await mdb_dash.get_dashboard(workspace_id, dashboard_id)
    if not dash:
        return None

    panel_sq_ids = []
    for p in dash["panels"]:
        if p.get("saved_query_id"):
            panel_sq_ids.append(p["saved_query_id"])

    results = {}

    async def run_sq(sq_id):
        sq = await mdb_sq.get_saved_query(workspace_id, str(sq_id))
        if not sq:
            return None
        sq_key = str(sq.get("id") or sq.get("_id") or sq_id)
        try:
            # We call the target database
            sql = sq.get("sql")
            target_db_id = sq.get("database_id")
            if sql:
                data = await asyncio.to_thread(
                    db_manager.execute, workspace_id, sql, target_db_id
                )

                # data comes back as dict: {"columns": [], "rows": [{}], "error": ""}
                if data.get("error"):
                    return {"id": sq_key, "error": data["error"]}

                # Charts assume array of objects keyed by column name
                res = {
                    "id": sq_key,
                    "rows": data.get("rows", [])[:500],
                    "columns": [
                        {"name": c, "type_name": "string"}
                        for c in data.get("columns", [])
                    ],
                }
                # Overwrite type_name with original if it exists
                if sq.get("columns"):
                    res["columns"] = sq["columns"]
                return res
        except Exception as e:
            log.warning(f"Dashboard panel query failed sq_id={sq_id}: {e}")
            return {"id": sq_key, "error": str(e)}
        return None

    tasks = [run_sq(sq_id) for sq_id in set(panel_sq_ids)]
    fetched = await asyncio.gather(*tasks)

    for res in fetched:
        if res:
            results[res["id"]] = res

    return results

"""Async PostgreSQL knowledge service — per-(user, database) storage for
verified Q&As, glossary, and semantic catalog."""

import time
from difflib import SequenceMatcher

from sqlalchemy import select, delete, func

from backend.app.pgdatabase.models import (
    VerifiedQA,
    Glossary,
    CatalogColumn,
    CatalogMetric,
    CatalogJoin,
    CatalogSynonym,
    CatalogValueMapping,
)
from backend.app.utils import _tokens

DUPLICATE_THRESHOLD = 0.92


def _similarity(a, b, tb=None, b_lower=None):
    ta = _tokens(a)
    if tb is None:
        tb = _tokens(b)
    jacc = len(ta & tb) / len(ta | tb) if ta or tb else 0.0
    if b_lower is None:
        b_lower = b.lower()
    seq = SequenceMatcher(None, a.lower(), b_lower).ratio()
    return 0.6 * jacc + 0.4 * seq


class KnowledgeService:
    def __init__(self, session_factory):
        self._session_factory = session_factory

    async def add_verified(self, user_id, db_id, question, sql, restatement=""):
        async with self._session_factory() as session:
            existing = await self.get_verified(user_id, db_id)
            tb = _tokens(question)
            b_lower = question.lower()
            for e in existing:
                if (
                    _similarity(e["question"], question, tb, b_lower)
                    > DUPLICATE_THRESHOLD
                ):
                    return
            session.add(
                VerifiedQA(
                    user_id=user_id,
                    db_id=db_id,
                    question=question,
                    sql=sql,
                    restatement=restatement,
                )
            )
            await session.commit()

    async def get_verified(self, user_id, db_id):
        async with self._session_factory() as session:
            result = await session.execute(
                select(VerifiedQA)
                .where(VerifiedQA.user_id == user_id, VerifiedQA.db_id == db_id)
                .order_by(VerifiedQA.created_at.desc())
            )
            return [
                {"question": r.question, "sql": r.sql, "restatement": r.restatement}
                for r in result.scalars().all()
            ]

    async def count_verified(self, user_id, db_id):
        async with self._session_factory() as session:
            result = await session.execute(
                select(func.count()).where(
                    VerifiedQA.user_id == user_id, VerifiedQA.db_id == db_id
                )
            )
            return result.scalar() or 0

    async def retrieve_similar(self, user_id, db_id, question, k=3, threshold=0.25):
        scored = []
        tb = _tokens(question)
        b_lower = question.lower()
        for c in await self.get_verified(user_id, db_id):
            s = _similarity(c["question"], question, tb, b_lower)
            if s >= threshold:
                scored.append({**c, "similarity": round(s, 3)})
        scored.sort(key=lambda x: -x["similarity"])
        return scored[:k]

    async def set_glossary(self, user_id, db_id, terms):
        async with self._session_factory() as session:
            await session.execute(
                delete(Glossary).where(
                    Glossary.user_id == user_id, Glossary.db_id == db_id
                )
            )
            for t in terms:
                session.add(
                    Glossary(
                        user_id=user_id,
                        db_id=db_id,
                        term=t.get("term", ""),
                        maps_to=t.get("maps_to", ""),
                        sql_hint=t.get("sql_hint", ""),
                    )
                )
            await session.commit()

    async def get_glossary(self, user_id, db_id):
        async with self._session_factory() as session:
            result = await session.execute(
                select(Glossary).where(
                    Glossary.user_id == user_id, Glossary.db_id == db_id
                )
            )
            return [
                {"term": r.term, "maps_to": r.maps_to, "sql_hint": r.sql_hint}
                for r in result.scalars().all()
            ]

    _CATALOG_CLASSES = {
        "column_descriptions": (
            CatalogColumn,
            ("table_name", "column_name", "description"),
            ("table", "column", "description"),
        ),
        "metrics": (
            CatalogMetric,
            ("name", "description", "sql_expression"),
            ("name", "description", "sql_expression"),
        ),
        "joins": (
            CatalogJoin,
            ("tables", "join_condition", "description"),
            ("tables", "join_condition", "description"),
        ),
        "synonyms": (
            CatalogSynonym,
            ("term", "entity_type", "entity_name"),
            ("term", "entity_type", "entity_name"),
        ),
        "value_maps": (
            CatalogValueMapping,
            ("table_name", "column_name", "db_value", "business_label"),
            ("table", "column", "db_value", "business_label"),
        ),
    }

    async def set_catalog(self, user_id, db_id, catalog):
        async with self._session_factory() as session:
            for key, (model_class, cols, in_keys) in self._CATALOG_CLASSES.items():
                if key not in catalog:
                    continue
                await session.execute(
                    delete(model_class).where(
                        model_class.user_id == user_id, model_class.db_id == db_id
                    )
                )
                for entry in catalog[key] or []:
                    kwargs = {"user_id": user_id, "db_id": db_id}
                    for c, ok in zip(cols, in_keys):
                        kwargs[c] = str(entry.get(ok, "") or "")
                    session.add(model_class(**kwargs))
            await session.commit()

    async def get_catalog(self, user_id, db_id):
        async with self._session_factory() as session:
            out = {}
            for key, (model_class, cols, out_keys) in self._CATALOG_CLASSES.items():
                result = await session.execute(
                    select(model_class).where(
                        model_class.user_id == user_id, model_class.db_id == db_id
                    )
                )
                rows = []
                for r in result.scalars().all():
                    row = {}
                    for c, ok in zip(cols, out_keys):
                        row[ok] = getattr(r, c)
                    rows.append(row)
                out[key] = rows
            return out

    async def catalog_is_empty(self, user_id, db_id):
        catalog = await self.get_catalog(user_id, db_id)
        return not any(catalog.values())

    async def trust_level(self, user_id, db_id):
        n = await self.count_verified(user_id, db_id)
        if n >= 7:
            return {
                "level": "Trusted",
                "verified": n,
                "pct": 100,
                "note": "Answers shown directly; reasoning on tap.",
            }
        if n >= 3:
            return {
                "level": "Assisted",
                "verified": n,
                "pct": 55,
                "note": "Confident answers shown; novel ones get a second look.",
            }
        return {
            "level": "Supervised",
            "verified": n,
            "pct": max(8, n * 7),
            "note": "Every answer waits for your confirmation while it learns.",
        }

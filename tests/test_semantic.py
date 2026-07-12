"""Tests for the semantic catalog (issue #90): KB CRUD, deterministic
suggestions, prompt rendering, and schema-linking boosts."""

import os
import tempfile

from backend.app.knowledge import KnowledgeBase
from backend.app.llm import _semantic_block
from backend.app.schema_link import link_relevant_tables
from backend.app.semantic import (
    filter_catalog,
    merge_catalog_suggestions,
    suggest_from_schema,
)

SCHEMA = {
    "orders": {
        "columns": [
            {"name": "id", "primary_key": True},
            {"name": "customer_id"},
            {"name": "status"},
            {"name": "total_amount"},
        ],
        "foreign_keys": [{"column": "customer_id", "references": "customers.id"}],
        "distinct_values": {"status": ["completed", "pending"]},
        "row_count": 100,
    },
    "customers": {
        "columns": [{"name": "id", "primary_key": True}, {"name": "segment"}],
        "foreign_keys": [],
        "distinct_values": {"segment": ["vip", "regular"]},
        "row_count": 50,
    },
    "products": {
        "columns": [{"name": "id", "primary_key": True}, {"name": "name"}],
        "foreign_keys": [],
        "distinct_values": {},
        "row_count": 30,
    },
    "suppliers": {
        "columns": [{"name": "id", "primary_key": True}],
        "foreign_keys": [],
        "distinct_values": {},
        "row_count": 5,
    },
    "warehouses": {
        "columns": [{"name": "id", "primary_key": True}],
        "foreign_keys": [],
        "distinct_values": {},
        "row_count": 3,
    },
}

LLM_ENRICHMENT = {
    "column_descriptions": [
        {"table": "orders", "column": "total_amount", "description": "gross total"}
    ],
    "metrics": [
        {
            "name": "revenue",
            "description": "completed sales",
            "sql_expression": "SUM(orders.total_amount) WHERE orders.status='completed'",
        }
    ],
    "synonyms": [{"term": "clients", "entity_type": "table", "entity_name": "customers"}],
    "value_maps": [
        {
            "table": "customers",
            "column": "segment",
            "db_value": "vip",
            "business_label": "VIP customer",
        }
    ],
}


def _kb():
    return KnowledgeBase(os.path.join(tempfile.mkdtemp(), "kb.sqlite"))


def test_catalog_round_trip_and_partial_save():
    kb = _kb()
    assert kb.catalog_is_empty("db1")
    kb.set_catalog(
        "db1",
        {
            "metrics": [{"name": "revenue", "sql_expression": "SUM(x)"}],
            "synonyms": [
                {"term": "clients", "entity_type": "table", "entity_name": "customers"}
            ],
        },
    )
    got = kb.get_catalog("db1")
    assert got["metrics"][0]["name"] == "revenue"
    assert got["synonyms"][0]["entity_name"] == "customers"
    assert not kb.catalog_is_empty("db1")
    # a partial save replaces only the provided categories
    kb.set_catalog("db1", {"synonyms": []})
    got2 = kb.get_catalog("db1")
    assert got2["synonyms"] == []
    assert got2["metrics"][0]["name"] == "revenue"


def test_suggest_from_schema_joins_and_value_maps():
    sug = suggest_from_schema(SCHEMA)
    conds = {j["join_condition"] for j in sug["joins"]}
    assert "orders.customer_id = customers.id" in conds
    labels = {(v["column"], v["db_value"]): v["business_label"] for v in sug["value_maps"]}
    assert labels[("status", "completed")] == "Completed"
    assert labels[("segment", "vip")] == "Vip"  # humanized first guess


def test_merge_prefers_llm_labels():
    merged = merge_catalog_suggestions(suggest_from_schema(SCHEMA), LLM_ENRICHMENT)
    assert merged["metrics"][0]["name"] == "revenue"
    assert merged["synonyms"][0]["term"] == "clients"
    vip = next(
        v for v in merged["value_maps"] if v["db_value"] == "vip"
    )
    assert vip["business_label"] == "VIP customer"  # LLM label wins
    # a value the LLM didn't touch keeps its humanized guess
    pending = next(v for v in merged["value_maps"] if v["db_value"] == "pending")
    assert pending["business_label"] == "Pending"


def test_semantic_block_renders_sections():
    cat = merge_catalog_suggestions(suggest_from_schema(SCHEMA), LLM_ENRICHMENT)
    block = _semantic_block(filter_catalog(cat, ["orders", "customers"]))
    assert "Metric definitions" in block
    assert "revenue = SUM(orders.total_amount)" in block
    assert "Value meanings" in block
    assert '"VIP customer" = ' in block
    assert "clients" in block
    assert _semantic_block(None) == ""
    assert _semantic_block({}) == ""


def test_filter_catalog_scopes_to_tables():
    cat = merge_catalog_suggestions(suggest_from_schema(SCHEMA), LLM_ENRICHMENT)
    filt = filter_catalog(cat, ["orders"])
    # customers value maps dropped when customers isn't linked
    assert all(v["table"] == "orders" for v in filt["value_maps"])
    # a join needs both endpoints linked
    assert filt["joins"] == []
    # metrics/synonyms are global
    assert filt["metrics"] and filt["synonyms"]


def test_linking_boost_from_value_map_and_synonym():
    cat = merge_catalog_suggestions(suggest_from_schema(SCHEMA), LLM_ENRICHMENT)
    picked = link_relevant_tables(
        "who are our VIP clients?", SCHEMA, [], [], 2, set(), cat
    )
    assert "customers" in picked


def test_linking_boost_from_metric():
    cat = merge_catalog_suggestions(suggest_from_schema(SCHEMA), LLM_ENRICHMENT)
    picked = link_relevant_tables("what is our revenue?", SCHEMA, [], [], 1, set(), cat)
    assert "orders" in picked


def test_linking_without_catalog_is_unchanged():
    # small schema (<= max_tables) still returns everything; catalog is optional
    picked = link_relevant_tables("orders", SCHEMA, [], [], 10, set(), None)
    assert set(picked) == set(SCHEMA.keys())

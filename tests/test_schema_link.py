"""Tests for model budgeting and signal-based confidence scoring."""
import pytest
from app.schema_link import model_budget, compute_confidence, link_relevant_tables

@pytest.fixture
def dummy_schema():
    return {
        "users": {"columns": [{"name": "id"}, {"name": "name"}], "row_count": 100},
        "orders": {
            "columns": [{"name": "id"}, {"name": "user_id"}],
            "foreign_keys": [{"references": "users.id"}],
            "row_count": 50
        },
        "products": {"columns": [{"name": "id"}, {"name": "title"}, {"name": "price"}], "row_count": 200},
        "reviews": {"columns": [{"name": "id"}, {"name": "product_id"}, {"name": "rating"}], "row_count": 10},
        "categories": {"columns": [{"name": "id"}, {"name": "name"}], "row_count": 5}
    }


def test_link_relevant_tables_returns_all_if_under_max(dummy_schema):
    # 5 tables in schema, max_tables=10
    result = link_relevant_tables("test question", dummy_schema, [], [], max_tables=10)
    assert set(result) == {"users", "orders", "products", "reviews", "categories"}


def test_link_relevant_tables_prioritizes_token_matches(dummy_schema):
    # Question mentions "products" and "rating" (from reviews)
    result = link_relevant_tables("which products have the highest rating?", dummy_schema, [], [], max_tables=2)
    assert set(result) == {"products", "reviews"}


def test_link_relevant_tables_uses_glossary(dummy_schema):
    # "clients" isn't a table, but mapped to "users"
    glossary = [{"term": "clients", "maps_to": "users"}]
    result = link_relevant_tables("how many clients do we have?", dummy_schema, glossary, [], max_tables=1)
    assert "users" in result


def test_link_relevant_tables_uses_retrieved_sql(dummy_schema):
    # A generic question, no direct matches, but the retrieved SQL explicitly queries "categories"
    retrieved = [{"sql": "SELECT * FROM categories"}]
    result = link_relevant_tables("list them", dummy_schema, [], retrieved, max_tables=1)
    assert "categories" in result


def test_link_relevant_tables_fallback_to_row_count(dummy_schema):
    # Unrelated question, no glossary, no retrieved
    # Should fall back to largest tables: products (200), users (100)
    result = link_relevant_tables("what is the meaning of life?", dummy_schema, [], [], max_tables=2)
    assert result[:2] == ["products", "users"]


def test_link_relevant_tables_expands_foreign_keys(dummy_schema):
    # Matches "orders" table, but "orders" references "users", so users should be included too
    result = link_relevant_tables("how many orders?", dummy_schema, [], [], max_tables=1)
    # Expected orders (from token) + users (from FK)
    assert "orders" in result
    assert "users" in result
    assert len(result) == 2


@pytest.mark.parametrize("provider,model,expected_tier", [
    ("claude", "claude-sonnet", "large"),
    ("openai", "gpt-4o", "large"),
    ("groq", "llama-3.3-70b-versatile", "large"),
    ("ollama", "qwen2.5:0.5b", "tiny"),
    ("ollama", "llama3.2:1b", "tiny"),
    ("ollama", "phi3-mini", "tiny"),
    ("ollama", "llama3.2", "small"),
    ("ollama", "mistral", "small"),
    ("ollama", "", "small"),
])
def test_model_budget_tiering(provider, model, expected_tier):
    budget = model_budget(provider, model)
    assert budget["tier"] == expected_tier


def test_api_providers_get_a_larger_budget_than_small_local_models():
    api_budget = model_budget("claude", "claude-sonnet")
    local_budget = model_budget("ollama", "llama3.2")
    assert api_budget["max_tables"] > local_budget["max_tables"]
    assert api_budget["max_examples"] > local_budget["max_examples"]


def test_confidence_low_when_query_failed():
    confidence, reason, based = compute_confidence(
        retrieved=[{"similarity": 0.95}],
        exec_result={"error": "no such table: ghosts"})
    assert confidence == "low"
    assert based is False


def test_confidence_high_when_closely_matches_verified_answer():
    confidence, reason, based = compute_confidence(
        retrieved=[{"similarity": 0.9}],
        exec_result={"rows": [{"n": 1}]})
    assert confidence == "high"
    assert based is True


def test_confidence_medium_when_loosely_matches_verified_answer():
    confidence, reason, based = compute_confidence(
        retrieved=[{"similarity": 0.6}],
        exec_result={"rows": [{"n": 1}]})
    assert confidence == "medium"
    assert based is True


def test_confidence_low_when_novel_question_returns_no_rows():
    confidence, reason, based = compute_confidence(retrieved=[], exec_result={"rows": []})
    assert confidence == "low"
    assert based is False


def test_confidence_medium_when_novel_question_returns_rows():
    confidence, reason, based = compute_confidence(retrieved=[], exec_result={"rows": [{"n": 1}]})
    assert confidence == "medium"
    assert based is False


def test_confidence_uses_the_strongest_retrieved_match():
    confidence, reason, based = compute_confidence(
        retrieved=[{"similarity": 0.2}, {"similarity": 0.8}, {"similarity": 0.4}],
        exec_result={"rows": [{"n": 1}]})
    assert confidence == "high"
    assert based is True

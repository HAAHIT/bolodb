"""Tests for model budgeting and signal-based confidence scoring."""
import pytest
from app.schema_link import model_budget, compute_confidence


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

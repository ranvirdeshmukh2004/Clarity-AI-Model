"""
Contradiction detection pipeline step.

Uses Gemini embeddings for similarity search + Gemini LLM for NLI classification.
"""
import json
import re
import logging
import numpy as np
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_arr = np.array(a)
    b_arr = np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr) + 1e-8))


async def _generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using Gemini Embedding API."""
    genai.configure(api_key=settings.GEMINI_API_KEY)

    embeddings = []
    # Process in batches of 100 (API limit)
    batch_size = 100
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=batch,
        )
        embeddings.extend(result["embedding"])

    return embeddings


async def detect_contradictions(meeting_id: str, segments: list[dict]) -> list[dict]:
    """
    Detect contradictions between transcript segments.

    Step 1: Generate embeddings for all segments.
    Step 2: Find similar segment pairs (cosine similarity > 0.6).
    Step 3: Send candidate pairs to Gemini to check for contradiction.

    Returns list of flag dicts ready for DB insertion.
    """
    if len(segments) < 2:
        return []

    texts = [s["text"] for s in segments]

    # Step 1: Generate embeddings
    try:
        embeddings = await _generate_embeddings(texts)
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return []

    # Step 2: Find similar pairs (potential contradictions are often semantically similar)
    candidate_pairs = []
    for i in range(len(segments)):
        for j in range(i + 1, len(segments)):
            sim = _cosine_similarity(embeddings[i], embeddings[j])
            if 0.4 < sim < 0.95:  # Similar but not identical
                candidate_pairs.append((i, j, sim))

    # Sort by similarity and take top 20 pairs to stay within API limits
    candidate_pairs.sort(key=lambda x: x[2], reverse=True)
    candidate_pairs = candidate_pairs[:20]

    if not candidate_pairs:
        return []

    # Step 3: Gemini NLI classification
    pairs_for_analysis = [
        {
            "pair_index": idx,
            "statement_a": {
                "speaker": segments[i]["speaker_label"],
                "text": segments[i]["text"],
                "segment_index": i,
            },
            "statement_b": {
                "speaker": segments[j]["speaker_label"],
                "text": segments[j]["text"],
                "segment_index": j,
            },
        }
        for idx, (i, j, _) in enumerate(candidate_pairs)
    ]

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Analyze these pairs of meeting statements for contradictions.

Statement pairs:
{json.dumps(pairs_for_analysis, indent=2)}

For each pair that contains a genuine contradiction, output a JSON object with:
- "pair_index": the pair index from the input
- "severity": "low", "medium", or "high"
- "explanation": explain the contradiction clearly (1-2 sentences)

Rules:
- A contradiction is when two statements make conflicting claims about the same topic
- "high" = direct factual contradiction (e.g., different dates, opposite decisions)
- "medium" = conflicting implications or intentions
- "low" = minor inconsistency
- Do NOT flag mere differences of opinion as contradictions
- Do NOT flag statements on different topics
- Return ONLY a JSON array. Return [] if no contradictions found."""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = re.sub(r"```json?\n?", "", response_text)
            response_text = response_text.rstrip("`").strip()

        contradiction_results = json.loads(response_text)
    except Exception as e:
        logger.error(f"Gemini contradiction detection failed: {e}")
        return []

    # Build flag objects
    flags = []
    for result in contradiction_results:
        pair_idx = result["pair_index"]
        if pair_idx < len(candidate_pairs):
            i, j, _ = candidate_pairs[pair_idx]
            flags.append({
                "meeting_id": meeting_id,
                "flag_type": "contradiction",
                "severity": result.get("severity", "medium"),
                "explanation": result.get("explanation", "Contradictory statements detected."),
                "evidence": {
                    "statement_a": {
                        "segment_index": i,
                        "speaker": segments[i]["speaker_label"],
                        "text": segments[i]["text"],
                    },
                    "statement_b": {
                        "segment_index": j,
                        "speaker": segments[j]["speaker_label"],
                        "text": segments[j]["text"],
                    },
                },
            })

    return flags

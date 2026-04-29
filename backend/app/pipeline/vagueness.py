"""
Vagueness detection pipeline step.

Uses a rule-based lexicon pre-filter + Gemini for contextual classification.
"""
import json
import re
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Curated lexicon of hedging/vague phrases
VAGUE_PHRASES = [
    "we'll see", "maybe", "probably", "possibly", "perhaps",
    "let's revisit", "let's circle back", "let's table that",
    "kind of", "sort of", "more or less", "in a way",
    "I think so", "I guess", "I suppose", "I believe so",
    "at some point", "sometime soon", "when we get to it",
    "we should probably", "it might be", "it could be",
    "not sure", "hard to say", "it depends", "we'll figure it out",
    "TBD", "to be determined", "to be decided",
    "someone should", "someone needs to", "we need to look into",
    "let me get back to you", "I'll think about it",
    "that's interesting", "good point", "fair enough",
    "basically", "essentially", "arguably",
    "in theory", "ideally", "hopefully",
    "as soon as possible", "ASAP", "whenever possible",
    "going forward", "moving forward", "down the line",
]


def _lexicon_prefilter(segments: list[dict]) -> list[int]:
    """
    Fast pre-filter: find segment indices that contain vague phrases.
    Returns indices of segments worth sending to Gemini for deeper analysis.
    """
    flagged_indices = []
    for i, segment in enumerate(segments):
        text_lower = segment["text"].lower()
        for phrase in VAGUE_PHRASES:
            if phrase.lower() in text_lower:
                flagged_indices.append(i)
                break
    return flagged_indices


async def detect_vagueness(meeting_id: str, segments: list[dict]) -> list[dict]:
    """
    Detect vague/hedged language in transcript segments.

    Step 1: Lexicon pre-filter to identify candidate segments.
    Step 2: Send candidates to Gemini for contextual classification.

    Returns list of flag dicts ready for DB insertion.
    """
    if not segments:
        return []

    # Step 1: Pre-filter
    candidate_indices = _lexicon_prefilter(segments)

    # Also send a random sample of non-flagged segments for broader coverage
    all_indices = set(range(len(segments)))
    non_flagged = list(all_indices - set(candidate_indices))
    # Take up to 20 extra segments for broader analysis
    import random
    sample_size = min(20, len(non_flagged))
    extra_indices = random.sample(non_flagged, sample_size) if non_flagged else []

    analyze_indices = sorted(set(candidate_indices + extra_indices))
    if not analyze_indices:
        return []

    # Step 2: Gemini classification
    segments_for_analysis = [
        {"index": i, "speaker": segments[i]["speaker_label"], "text": segments[i]["text"]}
        for i in analyze_indices
    ]

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Analyze these meeting transcript segments for vague, hedged, or non-committal language.

Segments to analyze:
{json.dumps(segments_for_analysis, indent=2)}

For each segment that contains vague or non-committal language, output a JSON object with:
- "segment_index": the index from the input
- "severity": "low", "medium", or "high"
- "explanation": a clear, concise explanation of why this is vague (1-2 sentences)

Rules:
- Only flag segments that are genuinely vague, hedged, or non-committal
- "high" severity = completely avoids commitment (e.g., "we'll see", "maybe later")
- "medium" severity = partial commitment with hedging (e.g., "I think we can probably...")
- "low" severity = minor hedging that's still somewhat clear
- Do NOT flag normal conversational phrases or questions
- Return ONLY a JSON array of flagged segments. Return empty array [] if none found."""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean markdown code fences
        if response_text.startswith("```"):
            response_text = re.sub(r"```json?\n?", "", response_text)
            response_text = response_text.rstrip("`").strip()

        vague_results = json.loads(response_text)
    except Exception as e:
        logger.error(f"Gemini vagueness detection failed: {e}")
        # Fallback: use lexicon results only
        vague_results = [
            {"segment_index": i, "severity": "medium", "explanation": "Contains hedging language."}
            for i in candidate_indices
        ]

    # Build flag objects for DB
    flags = []
    for result in vague_results:
        idx = result["segment_index"]
        if idx < len(segments):
            flags.append({
                "meeting_id": meeting_id,
                "flag_type": "vague",
                "severity": result.get("severity", "medium"),
                "explanation": result.get("explanation", "Vague or non-committal language detected."),
                "evidence": {
                    "segment_index": idx,
                    "speaker": segments[idx]["speaker_label"],
                    "text": segments[idx]["text"],
                },
            })

    return flags

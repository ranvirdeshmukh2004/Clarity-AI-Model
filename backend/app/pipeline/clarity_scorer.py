"""
Clarity score computation — pure local math, no API calls.
"""


def compute_clarity_score(
    segments: list[dict],
    vague_flags: list[dict],
    contradiction_flags: list[dict],
    action_items: list[dict],
) -> dict:
    """
    Compute the meeting clarity score (0-100) using weighted signals.

    Weights: specificity=0.20, ownership=0.20, vagueness=0.15,
             contradictions=0.15, decisions=0.20, filler=0.10
    """
    total_segments = max(len(segments), 1)

    # Ownership score: % of action items with assigned owners
    items_with_owners = sum(1 for a in action_items if a.get("owner") and a["owner"] != "Unassigned")
    ownership_score = items_with_owners / max(len(action_items), 1)

    # Vague ratio: proportion of flagged segments
    vague_ratio = len(vague_flags) / total_segments

    # Contradiction penalty: scaled by count
    contradiction_penalty = min(len(contradiction_flags) * 0.1, 1.0)

    # Specificity: action items with deadlines
    items_with_deadlines = sum(1 for a in action_items if a.get("deadline"))
    specificity_score = items_with_deadlines / max(len(action_items), 1)

    # Decision completion: heuristic — if action items exist, some decisions were made
    decision_completion = min(len(action_items) * 0.15, 1.0)

    # Filler density: approximate using vague flags as proxy
    filler_density = min(len(vague_flags) * 0.05, 1.0)

    # Weighted score
    clarity_score = (
        0.20 * specificity_score
        + 0.20 * ownership_score
        + 0.15 * (1 - vague_ratio)
        + 0.15 * (1 - contradiction_penalty)
        + 0.20 * decision_completion
        + 0.10 * (1 - filler_density)
    ) * 100

    clarity_score = max(0, min(100, round(clarity_score)))

    # Commitment score
    commitment_score = round(((ownership_score + specificity_score) / 2) * 100)

    # Unresolved count
    unresolved_count = sum(1 for a in action_items if a.get("owner") == "Unassigned" or not a.get("deadline"))

    return {
        "clarity_score": clarity_score,
        "commitment_score": commitment_score,
        "unresolved_count": unresolved_count,
    }

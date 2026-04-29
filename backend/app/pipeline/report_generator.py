"""
Report generation pipeline step.
Uses Gemini to generate a structured meeting intelligence report.
"""
import json
import re
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


async def generate_report(
    meeting: dict,
    segments: list[dict],
    vague_flags: list[dict],
    contradiction_flags: list[dict],
    action_items: list[dict],
    scores: dict,
) -> dict:
    """
    Generate a structured meeting report using Gemini.
    Returns dict with: summary, decisions, suggested_followups.
    """
    transcript_text = "\n".join(f"{s['speaker_label']}: {s['text']}" for s in segments[:100])

    context = {
        "title": meeting.get("title", "Untitled"),
        "clarity_score": scores["clarity_score"],
        "commitment_score": scores["commitment_score"],
        "vague_count": len(vague_flags),
        "contradiction_count": len(contradiction_flags),
        "action_items_count": len(action_items),
        "unresolved_count": scores["unresolved_count"],
    }

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Generate a structured meeting intelligence report.

Meeting: {context['title']}
Clarity Score: {context['clarity_score']}/100
Commitment Score: {context['commitment_score']}/100
Vague Statements: {context['vague_count']}
Contradictions: {context['contradiction_count']}
Action Items: {context['action_items_count']}
Unresolved Items: {context['unresolved_count']}

Transcript (first 100 segments):
{transcript_text}

Vague flags: {json.dumps(vague_flags[:10], default=str)}
Contradictions: {json.dumps(contradiction_flags[:10], default=str)}
Action items: {json.dumps(action_items[:20], default=str)}

Generate a JSON report with these keys:
- "summary": {{"overview": "2-3 sentence summary", "key_themes": ["theme1", "theme2"]}}
- "decisions": ["decision 1", "decision 2", ...]
- "suggested_followups": ["followup 1", "followup 2", ...]
- "follow_up_email": "A professional follow-up email summarizing the meeting"

Return ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = re.sub(r"```json?\n?", "", text).rstrip("`").strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        return {
            "summary": {"overview": "Report generation failed.", "key_themes": []},
            "decisions": [],
            "suggested_followups": [],
            "follow_up_email": "",
        }

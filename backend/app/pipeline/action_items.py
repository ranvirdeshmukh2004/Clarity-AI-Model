"""
Action item extraction pipeline step.
Uses Gemini to extract structured action items from transcript segments.
"""
import json
import re
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)


async def extract_action_items(meeting_id: str, segments: list[dict]) -> list[dict]:
    """
    Extract action items from transcript segments using Gemini.
    Returns list of action item dicts ready for DB insertion.
    """
    if not segments:
        return []

    transcript_text = "\n".join(f"{s['speaker_label']}: {s['text']}" for s in segments)

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""Extract all action items from this meeting transcript.

Transcript:
{transcript_text}

For each action item, output JSON with: "description", "owner" (or "Unassigned"), 
"deadline" (YYYY-MM-DD or null), "priority" ("low"/"medium"/"high"), "dependency" (or null).
Return ONLY a JSON array. Return [] if none found."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = re.sub(r"```json?\n?", "", text).rstrip("`").strip()
        items = json.loads(text)
    except Exception as e:
        logger.error(f"Action item extraction failed: {e}")
        return []

    return [
        {
            "meeting_id": meeting_id,
            "description": item.get("description", ""),
            "owner": item.get("owner", "Unassigned"),
            "deadline": item.get("deadline"),
            "priority": item.get("priority", "medium"),
            "status": "identified",
            "dependency": item.get("dependency"),
        }
        for item in items
    ]

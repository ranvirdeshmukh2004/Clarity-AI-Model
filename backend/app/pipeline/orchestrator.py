"""
Pipeline orchestrator — runs the full meeting analysis pipeline.

Called by the QStash webhook handler. Executes all NLP steps sequentially
using Gemini API calls (no local ML models).
"""
import logging
from app.core.database import get_supabase_client
from app.core.config import settings
from app.pipeline.transcription import transcribe_meeting
from app.pipeline.vagueness import detect_vagueness
from app.pipeline.contradiction import detect_contradictions
from app.pipeline.action_items import extract_action_items
from app.pipeline.clarity_scorer import compute_clarity_score
from app.pipeline.report_generator import generate_report

logger = logging.getLogger(__name__)


async def run_analysis_pipeline(meeting_id: str) -> None:
    """
    Run the full analysis pipeline for a meeting.

    Steps:
    1. Parse/transcribe the uploaded file into segments
    2. Detect vague language in segments
    3. Generate embeddings and detect contradictions
    4. Extract action items
    5. Compute clarity score
    6. Generate structured report via LLM

    All results are saved directly to Supabase PostgreSQL.
    """
    db = get_supabase_client()

    # Fetch meeting details
    meeting = (
        db.table("meetings")
        .select("*")
        .eq("id", meeting_id)
        .single()
        .execute()
    ).data

    if not meeting:
        raise ValueError(f"Meeting {meeting_id} not found")

    logger.info(f"[1/6] Transcribing meeting: {meeting_id}")
    segments = await transcribe_meeting(meeting)

    # Save transcript segments
    for i, segment in enumerate(segments):
        segment["meeting_id"] = meeting_id
        segment["segment_index"] = i
    if segments:
        db.table("transcript_segments").insert(segments).execute()

    logger.info(f"[2/6] Detecting vagueness: {meeting_id}")
    vague_flags = await detect_vagueness(meeting_id, segments)

    # Save vague flags
    if vague_flags:
        db.table("flags").insert(vague_flags).execute()

    logger.info(f"[3/6] Detecting contradictions: {meeting_id}")
    contradiction_flags = await detect_contradictions(meeting_id, segments)

    # Save contradiction flags
    if contradiction_flags:
        db.table("flags").insert(contradiction_flags).execute()

    logger.info(f"[4/6] Extracting action items: {meeting_id}")
    action_items = await extract_action_items(meeting_id, segments)

    # Save action items
    if action_items:
        db.table("action_items").insert(action_items).execute()

    logger.info(f"[5/6] Computing clarity score: {meeting_id}")
    scores = compute_clarity_score(segments, vague_flags, contradiction_flags, action_items)

    logger.info(f"[6/6] Generating report: {meeting_id}")
    report = await generate_report(meeting, segments, vague_flags, contradiction_flags, action_items, scores)

    # Save analysis results
    analysis_data = {
        "meeting_id": meeting_id,
        "clarity_score": scores["clarity_score"],
        "commitment_score": scores["commitment_score"],
        "contradiction_count": len(contradiction_flags),
        "vague_statement_count": len(vague_flags),
        "unresolved_count": scores["unresolved_count"],
        "summary": report.get("summary", {}),
        "decisions": report.get("decisions", []),
        "suggested_followups": report.get("suggested_followups", []),
    }
    db.table("analysis_results").insert(analysis_data).execute()

    logger.info(f"Pipeline complete for meeting: {meeting_id}")

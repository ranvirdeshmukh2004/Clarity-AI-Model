"""
QStash webhook endpoint — receives async processing callbacks.
"""
import hashlib
import hmac
import logging
from fastapi import APIRouter, Request, HTTPException, status

from app.core.config import settings
from app.core.database import get_supabase_client
from app.pipeline.orchestrator import run_analysis_pipeline

logger = logging.getLogger(__name__)

router = APIRouter()


def verify_qstash_signature(request_body: bytes, signature: str) -> bool:
    """
    Verify that the webhook request actually came from QStash.
    Uses HMAC-SHA256 with the QStash signing key.
    """
    if not settings.QSTASH_CURRENT_SIGNING_KEY:
        # Skip verification in development
        return True

    expected = hmac.new(
        settings.QSTASH_CURRENT_SIGNING_KEY.encode(),
        request_body,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


@router.post("/process-meeting")
async def process_meeting_webhook(request: Request):
    """
    Webhook endpoint called by QStash to process a meeting.

    This triggers the full NLP pipeline:
    1. Parse/transcribe the uploaded file
    2. Run vagueness detection
    3. Generate embeddings + contradiction detection
    4. Extract action items
    5. Compute clarity score
    6. Generate report

    All results are saved to Supabase PostgreSQL.
    """
    body = await request.body()

    # Verify QStash signature (skip in dev if key not set)
    signature = request.headers.get("upstash-signature", "")
    if settings.QSTASH_CURRENT_SIGNING_KEY and not verify_qstash_signature(body, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid QStash signature",
        )

    # Parse body
    data = await request.json()
    meeting_id = data.get("meeting_id")
    if not meeting_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing meeting_id in request body",
        )

    logger.info(f"Processing meeting: {meeting_id}")

    db = get_supabase_client()

    # Update status to processing
    db.table("meetings").update({"status": "processing"}).eq("id", meeting_id).execute()

    try:
        await run_analysis_pipeline(meeting_id)

        # Mark completed
        db.table("meetings").update({"status": "completed"}).eq("id", meeting_id).execute()
        logger.info(f"Meeting {meeting_id} processed successfully")

    except Exception as e:
        logger.error(f"Pipeline failed for meeting {meeting_id}: {str(e)}")
        db.table("meetings").update(
            {"status": "failed"}
        ).eq("id", meeting_id).execute()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {str(e)}",
        )

    return {"status": "completed", "meeting_id": meeting_id}

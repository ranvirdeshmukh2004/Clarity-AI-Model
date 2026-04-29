"""
Upstash QStash client for enqueueing async processing tasks.
"""
import httpx
from app.core.config import settings


async def enqueue_meeting_processing(meeting_id: str) -> dict:
    """
    Enqueue a meeting for async processing via QStash webhook.

    QStash will POST to our webhook endpoint with the meeting_id,
    triggering the full NLP analysis pipeline.

    Args:
        meeting_id: UUID of the meeting to process.

    Returns:
        QStash response with message ID.
    """
    webhook_url = f"{settings.BACKEND_URL}/api/v1/webhooks/process-meeting"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://qstash.upstash.io/v2/publish",
            headers={
                "Authorization": f"Bearer {settings.UPSTASH_QSTASH_TOKEN}",
                "Content-Type": "application/json",
                "Upstash-Retries": "3",
                "Upstash-Timeout": "300",  # 5 minute timeout
            },
            json={
                "url": webhook_url,
                "body": {"meeting_id": meeting_id},
            },
        )
        response.raise_for_status()
        return response.json()

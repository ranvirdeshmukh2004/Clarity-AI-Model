"""
Meetings API routes — upload, list, get, delete meetings.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from typing import Optional
from supabase import Client

from app.api.deps import get_db, get_current_user_id
from app.core.queue import enqueue_meeting_processing
from app.core.config import settings
from app.schemas.meeting import MeetingResponse, MeetingListResponse

router = APIRouter()


@router.post("/upload", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def upload_meeting(
    file: UploadFile = File(...),
    title: str = Form(...),
    meeting_date: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """
    Upload a meeting transcript (text or audio) for analysis.

    Supported formats: .txt, .srt, .vtt, .mp3, .wav, .m4a

    Flow:
    1. Validate file type
    2. Upload to Supabase Storage
    3. Create meeting record in DB (status=pending)
    4. Enqueue async processing via QStash
    5. Return meeting_id for status polling
    """
    # Validate file extension
    allowed_extensions = {".txt", ".srt", ".vtt", ".mp3", ".wav", ".m4a"}
    file_ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_ext}. Allowed: {', '.join(allowed_extensions)}",
        )

    # Determine source type
    audio_extensions = {".mp3", ".wav", ".m4a"}
    source_type = "upload_audio" if file_ext in audio_extensions else "upload_text"

    # Read file content
    file_content = await file.read()

    # Upload to Supabase Storage
    storage_path = f"{user_id}/{file.filename}"
    try:
        db.storage.from_(settings.STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )

    # Create meeting record
    meeting_data = {
        "user_id": user_id,
        "title": title,
        "source_type": source_type,
        "status": "pending",
        "file_path": storage_path,
        "meeting_date": meeting_date,
    }

    result = db.table("meetings").insert(meeting_data).execute()
    meeting = result.data[0]

    # Enqueue async processing
    try:
        await enqueue_meeting_processing(meeting["id"])
    except Exception as e:
        # Update status to failed if enqueue fails
        db.table("meetings").update({"status": "failed"}).eq("id", meeting["id"]).execute()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enqueue processing: {str(e)}",
        )

    return meeting


@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """List all meetings for the authenticated user, ordered by most recent."""
    result = (
        db.table("meetings")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"meetings": result.data, "total": len(result.data)}


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get details and processing status for a specific meeting."""
    result = (
        db.table("meetings")
        .select("*")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return result.data


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Delete a meeting and all associated data."""
    # Verify ownership
    meeting = (
        db.table("meetings")
        .select("id, file_path")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    # Delete from storage
    try:
        db.storage.from_(settings.STORAGE_BUCKET).remove([meeting.data["file_path"]])
    except Exception:
        pass  # File may already be deleted

    # Delete meeting (cascade deletes related records via DB constraints)
    db.table("meetings").delete().eq("id", meeting_id).execute()

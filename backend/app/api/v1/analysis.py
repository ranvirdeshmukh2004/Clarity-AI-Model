"""
Analysis API routes — get analysis results, flags, action items, transcript.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.api.deps import get_db, get_current_user_id

router = APIRouter()


@router.get("/meetings/{meeting_id}/analysis")
async def get_analysis(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get full analysis results for a meeting."""
    # Verify ownership
    meeting = (
        db.table("meetings")
        .select("id")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    result = (
        db.table("analysis_results")
        .select("*")
        .eq("meeting_id", meeting_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not yet available. Meeting may still be processing.",
        )
    return result.data


@router.get("/meetings/{meeting_id}/flags")
async def get_flags(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get all flagged moments for a meeting."""
    # Verify ownership
    meeting = (
        db.table("meetings")
        .select("id")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    result = (
        db.table("flags")
        .select("*, transcript_segments(text, speaker_label, start_time, end_time)")
        .eq("meeting_id", meeting_id)
        .order("created_at")
        .execute()
    )
    return {"flags": result.data, "total": len(result.data)}


@router.patch("/flags/{flag_id}/verdict")
async def update_flag_verdict(
    flag_id: str,
    verdict: dict,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """
    Accept or reject a flag (user feedback).
    Body: {"user_verdict": "accepted" | "rejected"}
    """
    valid_verdicts = {"accepted", "rejected"}
    user_verdict = verdict.get("user_verdict")
    if user_verdict not in valid_verdicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verdict. Must be one of: {', '.join(valid_verdicts)}",
        )

    result = (
        db.table("flags")
        .update({"user_verdict": user_verdict})
        .eq("id", flag_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flag not found")
    return result.data[0]


@router.get("/meetings/{meeting_id}/action-items")
async def get_action_items(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get extracted action items for a meeting."""
    meeting = (
        db.table("meetings")
        .select("id")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    result = (
        db.table("action_items")
        .select("*")
        .eq("meeting_id", meeting_id)
        .order("created_at")
        .execute()
    )
    return {"action_items": result.data, "total": len(result.data)}


@router.get("/meetings/{meeting_id}/transcript")
async def get_transcript(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get full transcript with speaker-labeled segments."""
    meeting = (
        db.table("meetings")
        .select("id")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    result = (
        db.table("transcript_segments")
        .select("*")
        .eq("meeting_id", meeting_id)
        .order("segment_index")
        .execute()
    )
    return {"segments": result.data, "total": len(result.data)}

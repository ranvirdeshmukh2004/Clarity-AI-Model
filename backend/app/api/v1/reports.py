"""
Reports API routes — get and export meeting reports.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from supabase import Client

from app.api.deps import get_db, get_current_user_id

router = APIRouter()


@router.get("/meetings/{meeting_id}/report")
async def get_report(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Get the structured meeting intelligence report as JSON."""
    meeting = (
        db.table("meetings")
        .select("id, title")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    analysis = (
        db.table("analysis_results")
        .select("*")
        .eq("meeting_id", meeting_id)
        .single()
        .execute()
    )
    if not analysis.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not yet available.",
        )

    flags = db.table("flags").select("*").eq("meeting_id", meeting_id).execute()
    action_items = db.table("action_items").select("*").eq("meeting_id", meeting_id).execute()

    return {
        "meeting": meeting.data,
        "analysis": analysis.data,
        "flags": flags.data,
        "action_items": action_items.data,
    }


@router.get("/meetings/{meeting_id}/report/export")
async def export_report_markdown(
    meeting_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """Export the meeting report as a downloadable Markdown file."""
    meeting = (
        db.table("meetings")
        .select("id, title, meeting_date")
        .eq("id", meeting_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not meeting.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    analysis = (
        db.table("analysis_results")
        .select("*")
        .eq("meeting_id", meeting_id)
        .single()
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not available.")

    flags = db.table("flags").select("*").eq("meeting_id", meeting_id).execute()
    action_items = db.table("action_items").select("*").eq("meeting_id", meeting_id).execute()

    # Build Markdown
    md = _build_markdown_report(meeting.data, analysis.data, flags.data, action_items.data)

    return PlainTextResponse(
        content=md,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{meeting.data["title"]}_report.md"'
        },
    )


def _build_markdown_report(meeting: dict, analysis: dict, flags: list, action_items: list) -> str:
    """Generate a formatted Markdown report from analysis data."""
    title = meeting.get("title", "Untitled Meeting")
    date = meeting.get("meeting_date", "N/A")
    score = analysis.get("clarity_score", "N/A")
    summary = analysis.get("summary", {})

    lines = [
        f"# Meeting Report: {title}",
        f"**Date**: {date}",
        f"**Clarity Score**: {score}/100",
        "",
        "---",
        "",
        "## Summary",
        summary.get("overview", "_No summary available._"),
        "",
        "## Key Decisions",
    ]

    decisions = analysis.get("decisions", [])
    if decisions:
        for d in decisions:
            lines.append(f"- {d}")
    else:
        lines.append("_No decisions recorded._")

    lines.extend(["", "## Action Items", ""])
    if action_items:
        lines.append("| Description | Owner | Deadline | Priority |")
        lines.append("|-------------|-------|----------|----------|")
        for item in action_items:
            lines.append(
                f"| {item.get('description', '')} | {item.get('owner', 'Unassigned')} "
                f"| {item.get('deadline', 'None')} | {item.get('priority', 'N/A')} |"
            )
    else:
        lines.append("_No action items extracted._")

    # Flags by type
    vague_flags = [f for f in flags if f.get("flag_type") == "vague"]
    contradiction_flags = [f for f in flags if f.get("flag_type") == "contradiction"]

    lines.extend(["", "## Vague Statements", ""])
    if vague_flags:
        for f in vague_flags:
            lines.append(f"- ⚠️ {f.get('explanation', '')}")
    else:
        lines.append("_No vague statements detected._")

    lines.extend(["", "## Contradictions", ""])
    if contradiction_flags:
        for f in contradiction_flags:
            lines.append(f"- 🔴 {f.get('explanation', '')}")
    else:
        lines.append("_No contradictions detected._")

    followups = analysis.get("suggested_followups", [])
    lines.extend(["", "## Suggested Follow-ups", ""])
    if followups:
        for f in followups:
            lines.append(f"- {f}")
    else:
        lines.append("_No follow-ups suggested._")

    return "\n".join(lines)

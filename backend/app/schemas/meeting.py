"""
Pydantic schemas for Meeting API requests and responses.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MeetingResponse(BaseModel):
    """Response schema for a single meeting."""
    id: str
    user_id: str
    title: str
    source_type: str
    status: str
    file_path: Optional[str] = None
    meeting_date: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    """Response schema for listing meetings."""
    meetings: List[MeetingResponse]
    total: int

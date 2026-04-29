"""
Pydantic schemas for Analysis API responses.
"""
from pydantic import BaseModel
from typing import Optional, List, Any


class FlagResponse(BaseModel):
    id: str
    meeting_id: str
    segment_id: Optional[str] = None
    flag_type: str
    severity: str
    explanation: str
    evidence: Optional[Any] = None
    user_verdict: Optional[str] = None
    created_at: Optional[str] = None


class ActionItemResponse(BaseModel):
    id: str
    meeting_id: str
    segment_id: Optional[str] = None
    description: str
    owner: Optional[str] = None
    deadline: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    dependency: Optional[str] = None
    created_at: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: str
    meeting_id: str
    clarity_score: int
    commitment_score: Optional[int] = None
    contradiction_count: int
    vague_statement_count: int
    unresolved_count: int
    summary: Optional[Any] = None
    decisions: Optional[Any] = None
    suggested_followups: Optional[Any] = None
    created_at: Optional[str] = None

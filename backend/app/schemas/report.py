"""
Pydantic schemas for Report API responses.
"""
from pydantic import BaseModel
from typing import Optional, Any, List


class ReportResponse(BaseModel):
    meeting: Any
    analysis: Any
    flags: List[Any]
    action_items: List[Any]

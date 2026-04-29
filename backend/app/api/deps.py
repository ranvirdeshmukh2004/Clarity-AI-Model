"""
FastAPI dependency injection for auth and database access.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.core.security import verify_supabase_token, get_user_id_from_token
from app.core.database import get_supabase_client

# Bearer token scheme
security = HTTPBearer()


async def get_db() -> Client:
    """Get Supabase client for database operations."""
    return get_supabase_client()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate the Bearer token and return the decoded user payload.
    Use as a dependency on protected routes.
    """
    payload = verify_supabase_token(credentials.credentials)
    return payload


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """Extract and return just the user ID from the auth token."""
    return get_user_id_from_token(current_user)

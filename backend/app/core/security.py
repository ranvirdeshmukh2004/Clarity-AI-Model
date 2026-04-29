"""
Supabase Auth helpers for verifying JWT tokens and extracting user info.
"""
import jwt
from fastapi import HTTPException, status
from app.core.config import settings


def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase JWT token and return the decoded payload.

    Args:
        token: The JWT access token from the Authorization header.

    Returns:
        Decoded JWT payload containing user info (sub, email, etc.)

    Raises:
        HTTPException: If token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


def get_user_id_from_token(payload: dict) -> str:
    """Extract the user ID (sub) from a decoded JWT payload."""
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
        )
    return user_id

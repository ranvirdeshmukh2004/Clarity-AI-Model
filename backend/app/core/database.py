"""
Supabase database client for async operations.
"""
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Get or create a Supabase client instance (singleton).
    Uses the service role key for full database access on the backend.
    """
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY,
        )
    return _supabase_client

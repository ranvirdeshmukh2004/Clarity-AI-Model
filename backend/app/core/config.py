"""
Application configuration loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # Upstash
    UPSTASH_REDIS_URL: str = ""
    UPSTASH_QSTASH_TOKEN: str = ""
    QSTASH_SIGNING_KEY: str = ""
    QSTASH_CURRENT_SIGNING_KEY: str = ""
    QSTASH_NEXT_SIGNING_KEY: str = ""

    # Application
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]
    DEBUG: bool = False

    # Storage
    STORAGE_BUCKET: str = "meeting-files"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

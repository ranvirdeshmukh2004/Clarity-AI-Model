"""
Meeting Clarity AI - FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import meetings, analysis, reports, webhooks, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print("🚀 Meeting Clarity AI API starting up...")
    yield
    # Shutdown
    print("👋 Meeting Clarity AI API shutting down...")


app = FastAPI(
    title="Meeting Clarity AI",
    description="Transcript Intelligence for Clarity, Commitment, and Accountability",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(meetings.router, prefix="/api/v1/meetings", tags=["Meetings"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])

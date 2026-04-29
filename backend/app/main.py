"""
Meeting Clarity AI - FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

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
    docs_url="/docs",
    redoc_url="/redoc",
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


# ─── Backend Dashboard (Root Route) ──────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def root_dashboard():
    """Beautiful backend dashboard UI at the root URL."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meeting Clarity AI — API Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
        *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: "Inter", system-ui, sans-serif;
            background: #060B18;
            color: #E8ECF4;
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }}
        body::before {{
            content: "";
            position: fixed;
            inset: 0;
            background:
                radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59,130,246,0.04) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 20%, rgba(139,92,246,0.035) 0%, transparent 55%);
            pointer-events: none;
        }}
        body::after {{
            content: "";
            position: fixed;
            inset: 0;
            background-image:
                linear-gradient(rgba(99,117,163,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,117,163,0.03) 1px, transparent 1px);
            background-size: 64px 64px;
            pointer-events: none;
        }}
        .container {{ max-width: 900px; margin: 0 auto; padding: 48px 24px; position: relative; z-index: 1; }}
        .header {{ text-align: center; margin-bottom: 48px; animation: fadeInUp 0.6s ease forwards; }}
        .logo {{ display: inline-flex; align-items: center; gap: 14px; margin-bottom: 24px; }}
        .logo-icon {{
            width: 48px; height: 48px; border-radius: 14px;
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%);
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 22px; color: white;
            box-shadow: 0 0 30px rgba(59,130,246,0.2);
        }}
        .logo-text {{ font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }}
        .subtitle {{ color: #8B97B5; font-size: 16px; font-weight: 300; }}
        .status-bar {{
            display: flex; align-items: center; justify-content: center; gap: 10px;
            margin-top: 20px; font-size: 14px; color: #34D399; font-weight: 500;
        }}
        .status-dot {{
            width: 10px; height: 10px; border-radius: 50%; background: #34D399;
            box-shadow: 0 0 12px rgba(52,211,153,0.4);
            animation: pulse 2s ease-in-out infinite;
        }}
        .cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 32px; }}
        .card {{
            background: rgba(10,16,32,0.65);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(99,117,163,0.1);
            border-radius: 16px;
            padding: 28px;
            transition: all 0.25s ease;
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }}
        .card:nth-child(1) {{ animation-delay: 0.1s; }}
        .card:nth-child(2) {{ animation-delay: 0.15s; }}
        .card:nth-child(3) {{ animation-delay: 0.2s; }}
        .card:nth-child(4) {{ animation-delay: 0.25s; }}
        .card:hover {{ border-color: rgba(99,117,163,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }}
        .card-title {{ font-size: 13px; color: #5A6580; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }}
        .card-value {{ font-size: 36px; font-weight: 800; letter-spacing: -0.03em; }}
        .card-desc {{ font-size: 13px; color: #8B97B5; margin-top: 6px; }}
        .section-title {{ font-size: 13px; color: #5A6580; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding-left: 4px; }}
        .endpoints {{
            background: rgba(10,16,32,0.65);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(99,117,163,0.1);
            border-radius: 16px;
            overflow: hidden;
            animation: fadeInUp 0.6s ease 0.3s forwards;
            opacity: 0;
        }}
        .endpoint {{
            display: flex; align-items: center; gap: 14px;
            padding: 16px 24px;
            border-bottom: 1px solid rgba(99,117,163,0.06);
            transition: background 0.15s ease;
        }}
        .endpoint:last-child {{ border-bottom: none; }}
        .endpoint:hover {{ background: rgba(99,117,163,0.04); }}
        .method {{
            font-size: 11px; font-weight: 700; padding: 4px 10px;
            border-radius: 6px; font-family: "JetBrains Mono", monospace;
            letter-spacing: 0.05em; min-width: 52px; text-align: center;
        }}
        .method-get {{ background: rgba(52,211,153,0.12); color: #34D399; }}
        .method-post {{ background: rgba(59,130,246,0.12); color: #60A5FA; }}
        .method-patch {{ background: rgba(251,191,36,0.12); color: #FBBF24; }}
        .method-delete {{ background: rgba(244,63,94,0.12); color: #FB7185; }}
        .path {{ font-size: 14px; font-family: "JetBrains Mono", monospace; color: #E8ECF4; font-weight: 500; }}
        .path-desc {{ font-size: 12px; color: #5A6580; margin-left: auto; }}
        .links {{
            display: flex; gap: 12px; justify-content: center; margin-top: 32px;
            animation: fadeInUp 0.6s ease 0.4s forwards; opacity: 0;
        }}
        .link-btn {{
            padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600;
            text-decoration: none; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }}
        .link-primary {{
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            color: white;
        }}
        .link-primary:hover {{ box-shadow: 0 0 30px rgba(59,130,246,0.2); transform: translateY(-2px); }}
        .link-secondary {{
            background: rgba(99,117,163,0.08);
            color: #8B97B5;
            border: 1px solid rgba(99,117,163,0.15);
        }}
        .link-secondary:hover {{ background: rgba(99,117,163,0.14); color: #E8ECF4; }}
        .footer {{ text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(99,117,163,0.08); }}
        .footer-text {{ font-size: 13px; color: #5A6580; }}
        @keyframes fadeInUp {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        @keyframes pulse {{
            0%, 100% {{ opacity: 1; transform: scale(1); }}
            50% {{ opacity: 0.6; transform: scale(1.2); }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">C</div>
                <div class="logo-text">Clarity AI</div>
            </div>
            <p class="subtitle">Meeting Intelligence API · v1.0.0</p>
            <div class="status-bar">
                <div class="status-dot"></div>
                API Online · All Systems Operational
            </div>
        </div>

        <div class="cards">
            <div class="card">
                <div class="card-title">Version</div>
                <div class="card-value" style="color: #60A5FA;">1.0.0</div>
                <div class="card-desc">Latest stable release</div>
            </div>
            <div class="card">
                <div class="card-title">API Endpoints</div>
                <div class="card-value" style="color: #A78BFA;">15</div>
                <div class="card-desc">REST API routes available</div>
            </div>
            <div class="card">
                <div class="card-title">NLP Pipeline</div>
                <div class="card-value" style="color: #34D399;">7</div>
                <div class="card-desc">Analysis modules active</div>
            </div>
            <div class="card">
                <div class="card-title">AI Engine</div>
                <div class="card-value" style="font-size: 24px; color: #FBBF24;">Gemini</div>
                <div class="card-desc">2.5 Flash · Free tier</div>
            </div>
        </div>

        <div class="section-title">API Routes</div>
        <div class="endpoints">
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/health</span>
                <span class="path-desc">Health check</span>
            </div>
            <div class="endpoint">
                <span class="method method-post">POST</span>
                <span class="path">/api/v1/meetings/upload</span>
                <span class="path-desc">Upload transcript</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings</span>
                <span class="path-desc">List meetings</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}</span>
                <span class="path-desc">Get meeting</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/analysis</span>
                <span class="path-desc">Analysis results</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/flags</span>
                <span class="path-desc">Flagged moments</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/action-items</span>
                <span class="path-desc">Action items</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/transcript</span>
                <span class="path-desc">Transcript segments</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/report</span>
                <span class="path-desc">Full report</span>
            </div>
            <div class="endpoint">
                <span class="method method-get">GET</span>
                <span class="path">/api/v1/meetings/{{id}}/report/export</span>
                <span class="path-desc">Markdown export</span>
            </div>
            <div class="endpoint">
                <span class="method method-patch">PATCH</span>
                <span class="path">/api/v1/flags/{{id}}/verdict</span>
                <span class="path-desc">Accept/reject flag</span>
            </div>
            <div class="endpoint">
                <span class="method method-delete">DEL</span>
                <span class="path">/api/v1/meetings/{{id}}</span>
                <span class="path-desc">Delete meeting</span>
            </div>
            <div class="endpoint">
                <span class="method method-post">POST</span>
                <span class="path">/api/v1/webhooks/process-meeting</span>
                <span class="path-desc">QStash webhook</span>
            </div>
        </div>

        <div class="links">
            <a href="/docs" class="link-btn link-primary">📖 Swagger Docs</a>
            <a href="/redoc" class="link-btn link-secondary">📚 ReDoc</a>
            <a href="/api/v1/health" class="link-btn link-secondary">💚 Health Check</a>
        </div>

        <div class="footer">
            <p class="footer-text">Meeting Clarity AI · FastAPI + Gemini + Supabase · Zero-cost deployment</p>
        </div>
    </div>
</body>
</html>"""

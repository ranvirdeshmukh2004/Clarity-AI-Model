# Meeting Clarity AI

> **Transcript Intelligence for Clarity, Commitment, and Accountability**

Meeting Clarity AI is an AI-powered platform that analyzes meeting transcripts to detect vague language, contradictions, missing ownership, and unresolved decisions. It produces a **Clarity Score (0–100)** and structured intelligence reports so teams can understand whether a meeting produced real alignment or just discussion.

---

## Features

- 🔍 **Vagueness Detection** — Flags hedging language like "maybe", "we'll see", "at some point"
- ⚡ **Contradiction Detection** — Spots conflicting statements within the same meeting
- ✅ **Action Item Extraction** — Extracts tasks with owners, deadlines, and priorities
- 📊 **Clarity Score** — 0–100 score measuring how clear and actionable the meeting was
- 📋 **Intelligence Reports** — Structured reports with decisions, risks, and follow-up suggestions
- 👥 **Speaker Analysis** — Per-speaker participation breakdown
- 📥 **Export** — Download reports as Markdown

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Recharts | Vercel (free) |
| Backend | Python, FastAPI | Render (free) |
| Database | PostgreSQL + pgvector | Supabase (free) |
| Auth | Supabase Auth | Supabase (free) |
| File Storage | Supabase Storage | Supabase (free) |
| Task Queue | Upstash QStash (webhooks) | Upstash (free) |
| AI/NLP | Google Gemini 2.5 Flash | Free tier |
| Embeddings | Gemini text-embedding-004 | Free tier |

**Total cost: $0/month**

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/v1/              # REST API routes
│   │   ├── core/                # Config, auth, database, queue
│   │   ├── pipeline/            # NLP analysis pipeline (7 modules)
│   │   ├── schemas/             # Pydantic models
│   │   └── models/              # Data models
│   ├── tests/                   # Tests + sample data
│   ├── supabase_migration.sql   # Database schema
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client, Supabase client
│   │   └── types/               # TypeScript interfaces
│   └── package.json
├── PRD.md                       # Product Requirements Document
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- Accounts on: Supabase, Upstash, Google AI Studio, Render, Vercel

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/Clarity-AI.git
cd Clarity-AI
```

### 2. Setup Supabase
1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → paste and run `backend/supabase_migration.sql`
3. Go to **Settings → API** → copy: Project URL, anon key, service role key, JWT secret

### 3. Setup Upstash
1. Go to [upstash.com](https://upstash.com) → Create a Redis database
2. Go to **QStash** → copy: QStash Token, Current Signing Key, Next Signing Key

### 4. Get Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Get an API key (free, no credit card needed)

### 5. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env with real values
uvicorn app.main:app --reload
```

### 6. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your .env.local with real values
npm run dev
```

### 7. Test It
Upload the sample transcript at `backend/tests/fixtures/sample_meeting.txt` through the UI.

## Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect your repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add all env vars from `.env.example` with real values
7. Set `BACKEND_URL` to your Render URL (e.g., `https://your-app.onrender.com`)
8. Update `CORS_ORIGINS` to include your Vercel frontend URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set **Root Directory** to `frontend`
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Keep Render Alive
Use [UptimeRobot](https://uptimerobot.com) (free) to ping `https://your-app.onrender.com/api/v1/health` every 14 minutes.

## License

MIT

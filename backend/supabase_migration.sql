-- Meeting Clarity AI - Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('upload_text', 'upload_audio', 'zoom', 'gmeet')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path TEXT,
    meeting_date TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSCRIPT SEGMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transcript_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    speaker_label TEXT NOT NULL DEFAULT 'Unknown',
    text TEXT NOT NULL,
    start_time FLOAT,
    end_time FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYSIS RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
    clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 100),
    commitment_score INTEGER CHECK (commitment_score >= 0 AND commitment_score <= 100),
    contradiction_count INTEGER NOT NULL DEFAULT 0,
    vague_statement_count INTEGER NOT NULL DEFAULT 0,
    unresolved_count INTEGER NOT NULL DEFAULT 0,
    summary JSONB DEFAULT '{}',
    decisions JSONB DEFAULT '[]',
    suggested_followups JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FLAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES transcript_segments(id) ON DELETE SET NULL,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('vague', 'contradiction', 'missing_owner', 'missing_deadline')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    explanation TEXT NOT NULL,
    evidence JSONB DEFAULT '{}',
    user_verdict TEXT CHECK (user_verdict IN ('accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES transcript_segments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    owner TEXT DEFAULT 'Unassigned',
    deadline DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'confirmed', 'completed')),
    dependency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMBEDDINGS TABLE (pgvector)
-- ============================================
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES transcript_segments(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    embedding vector(768)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
CREATE INDEX IF NOT EXISTS idx_flags_meeting_id ON flags(meeting_id);
CREATE INDEX IF NOT EXISTS idx_flags_flag_type ON flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_meeting_id ON embeddings(meeting_id);

-- HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings
    USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Meetings: users can only see their own
CREATE POLICY "Users can view own meetings" ON meetings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON meetings
    FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass for backend operations
CREATE POLICY "Service role full access meetings" ON meetings
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access segments" ON transcript_segments
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access analysis" ON analysis_results
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access flags" ON flags
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access items" ON action_items
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access embeddings" ON embeddings
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-files', 'meeting-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can upload to their own folder
CREATE POLICY "Users can upload meeting files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'meeting-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read own meeting files" ON storage.objects
    FOR SELECT USING (bucket_id = 'meeting-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Service role storage access" ON storage.objects
    FOR ALL USING (auth.role() = 'service_role');

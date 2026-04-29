export interface AnalysisResult {
  id: string;
  meeting_id: string;
  clarity_score: number;
  commitment_score: number;
  contradiction_count: number;
  vague_statement_count: number;
  unresolved_count: number;
  summary: {
    overview?: string;
    key_themes?: string[];
  };
  decisions: string[];
  suggested_followups: string[];
  created_at?: string;
}

export interface Flag {
  id: string;
  meeting_id: string;
  segment_id?: string;
  flag_type: "vague" | "contradiction" | "missing_owner" | "missing_deadline";
  severity: "low" | "medium" | "high";
  explanation: string;
  evidence: Record<string, unknown>;
  user_verdict?: "accepted" | "rejected" | null;
  created_at?: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  segment_id?: string;
  description: string;
  owner: string;
  deadline?: string;
  priority: "low" | "medium" | "high";
  status: "identified" | "confirmed" | "completed";
  dependency?: string;
  created_at?: string;
}

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  segment_index: number;
  speaker_label: string;
  text: string;
  start_time?: number;
  end_time?: number;
}

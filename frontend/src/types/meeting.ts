export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  source_type: "upload_text" | "upload_audio" | "zoom" | "gmeet";
  status: "pending" | "processing" | "completed" | "failed";
  file_path?: string;
  meeting_date?: string;
  duration_seconds?: number;
  created_at?: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
}

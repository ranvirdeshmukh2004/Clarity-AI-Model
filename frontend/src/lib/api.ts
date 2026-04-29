const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Authenticated API client for the Meeting Clarity AI backend.
 * Automatically attaches the Supabase access token to requests.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Import supabase client lazily to avoid SSR issues
    const { supabase } = await import("./supabase");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T = unknown>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API request failed");
    }
    return res.json();
  }

  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    isFormData = false
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: isFormData
        ? headers
        : { ...headers, "Content-Type": "application/json" },
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API request failed");
    }
    return res.json();
  }

  async patch<T = unknown>(endpoint: string, body: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API request failed");
    }
    return res.json();
  }

  async delete(endpoint: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API request failed");
    }
  }

  // ============ Meeting Endpoints ============
  async uploadMeeting(formData: FormData) {
    return this.post("/api/v1/meetings/upload", formData, true);
  }

  async listMeetings() {
    return this.get("/api/v1/meetings");
  }

  async getMeeting(id: string) {
    return this.get(`/api/v1/meetings/${id}`);
  }

  async deleteMeeting(id: string) {
    return this.delete(`/api/v1/meetings/${id}`);
  }

  // ============ Analysis Endpoints ============
  async getAnalysis(meetingId: string) {
    return this.get(`/api/v1/meetings/${meetingId}/analysis`);
  }

  async getFlags(meetingId: string) {
    return this.get(`/api/v1/meetings/${meetingId}/flags`);
  }

  async updateFlagVerdict(flagId: string, verdict: string) {
    return this.patch(`/api/v1/flags/${flagId}/verdict`, {
      user_verdict: verdict,
    });
  }

  async getActionItems(meetingId: string) {
    return this.get(`/api/v1/meetings/${meetingId}/action-items`);
  }

  async getTranscript(meetingId: string) {
    return this.get(`/api/v1/meetings/${meetingId}/transcript`);
  }

  // ============ Report Endpoints ============
  async getReport(meetingId: string) {
    return this.get(`/api/v1/meetings/${meetingId}/report`);
  }

  async exportReport(meetingId: string): Promise<string> {
    const headers = await this.getAuthHeaders();
    const res = await fetch(
      `${this.baseUrl}/api/v1/meetings/${meetingId}/report/export`,
      { headers }
    );
    if (!res.ok) throw new Error("Export failed");
    return res.text();
  }
}

export const api = new ApiClient(API_URL);

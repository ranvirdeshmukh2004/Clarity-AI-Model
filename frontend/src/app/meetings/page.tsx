"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Meeting } from "@/types/meeting";
import { formatDate } from "@/lib/utils";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      try {
        const data = (await api.listMeetings()) as { meetings: Meeting[] };
        setMeetings(data.meetings);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this meeting and all its data?")) return;
    await api.deleteMeeting(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const statusStyles: Record<string, string> = {
    completed: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    processing: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    pending: "text-blue-400 bg-blue-500/15 border-blue-500/30",
    failed: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  };

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)]">Clarity AI</span>
        </Link>
        <Link href="/meetings/upload" className="btn-primary">+ Upload Meeting</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">All Meetings</h1>
            <p className="text-[var(--text-secondary)] mt-1">{meetings.length} meetings analyzed</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
        ) : meetings.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No meetings yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Upload your first transcript to get started.</p>
            <Link href="/meetings/upload" className="btn-primary">Upload Meeting</Link>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {meetings.map((m) => (
              <div key={m.id} className="glass-card p-5 flex items-center justify-between">
                <Link href={`/meetings/${m.id}`} className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 text-lg">
                    {m.source_type === "upload_audio" ? "🎤" : "📄"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{m.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {formatDate(m.created_at)} · {m.source_type.replace("_", " ")}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[m.status] || statusStyles.pending}`}>
                    {m.status}
                  </span>
                  {m.status === "completed" && (
                    <Link href={`/reports/${m.id}`} className="text-xs text-[var(--accent-blue)] hover:underline">
                      Report
                    </Link>
                  )}
                  <button onClick={() => handleDelete(m.id)} className="text-xs text-[var(--text-muted)] hover:text-rose-400 transition-colors">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

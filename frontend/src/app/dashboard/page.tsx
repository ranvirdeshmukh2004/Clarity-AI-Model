"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Meeting } from "@/types/meeting";
import { formatDate, getScoreColor } from "@/lib/utils";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      loadMeetings();
    };
    checkAuth();
  }, [router]);

  const loadMeetings = async () => {
    try {
      const data = (await api.listMeetings()) as { meetings: Meeting[] };
      setMeetings(data.meetings);
    } catch (err) {
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
      processing: "text-amber-400 bg-amber-500/15 border-amber-500/30",
      pending: "text-blue-400 bg-blue-500/15 border-blue-500/30",
      failed: "text-rose-400 bg-rose-500/15 border-rose-500/30",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)]">Clarity AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/meetings/upload" className="btn-primary">
            + Upload Meeting
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="btn-secondary text-sm"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mb-10">Your meeting intelligence overview</p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-4xl mb-4">📋</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              No meetings yet
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Upload your first meeting transcript to get started.
            </p>
            <Link href="/meetings/upload" className="btn-primary">
              Upload Your First Meeting
            </Link>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="glass-card p-5 flex items-center justify-between cursor-pointer block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 text-lg">
                    📄
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {formatDate(meeting.created_at)} · {meeting.source_type.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {statusBadge(meeting.status)}
                  <span className="text-[var(--text-muted)]">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

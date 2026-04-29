"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Meeting } from "@/types/meeting";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserEmail(session.user.email || "");
      try {
        const data = (await api.listMeetings()) as { meetings: Meeting[] };
        setMeetings(data.meetings);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const completedMeetings = meetings.filter((m) => m.status === "completed");
  const processingMeetings = meetings.filter((m) => m.status === "processing" || m.status === "pending");

  const statusStyles: Record<string, string> = {
    completed: "badge-completed",
    processing: "badge-processing",
    pending: "badge-pending",
    failed: "badge-failed",
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="nav-bar">
        <Link href="/dashboard" className="nav-logo">
          <div className="nav-logo-icon">C</div>
          <span className="nav-logo-text">Clarity AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/meetings" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            All Meetings
          </Link>
          <Link href="/meetings/upload" className="btn-primary text-sm">
            + Upload
          </Link>
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)] hidden sm:block">{userEmail}</span>
            <button onClick={handleLogout} className="text-xs text-[var(--text-muted)] hover:text-rose-400 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[var(--text-bright)] tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">Your meeting intelligence overview</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger-children">
          {[
            { label: "Total Meetings", value: meetings.length, icon: "📋", color: "text-blue-400" },
            { label: "Analyzed", value: completedMeetings.length, icon: "✅", color: "text-emerald-400" },
            { label: "In Progress", value: processingMeetings.length, icon: "⏳", color: "text-amber-400" },
            { label: "This Month", value: meetings.filter((m) => new Date(m.created_at).getMonth() === new Date().getMonth()).length, icon: "📅", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl opacity-60">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Processing Meetings */}
        {processingMeetings.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">Currently Processing</h2>
            <div className="space-y-3">
              {processingMeetings.map((m) => (
                <Link key={m.id} href={`/meetings/${m.id}`} className="glass-card p-5 flex items-center gap-4 block border-l-2 border-amber-500/40">
                  <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">{m.title}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(m.created_at)}</p>
                  </div>
                  <span className={`badge ${statusStyles[m.status]}`}>{m.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Meetings */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest">Recent Meetings</h2>
            {meetings.length > 0 && (
              <Link href="/meetings" className="text-xs text-[var(--accent-blue)] hover:underline">View all →</Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full" />)}
            </div>
          ) : meetings.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4 opacity-40">📋</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No meetings yet</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                Upload your first meeting transcript to get AI-powered clarity analysis.
              </p>
              <Link href="/meetings/upload" className="btn-primary">Upload Meeting</Link>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {meetings.slice(0, 8).map((m) => (
                <Link key={m.id} href={`/meetings/${m.id}`} className="glass-card p-5 flex items-center gap-4 block">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/10 flex items-center justify-center text-lg flex-shrink-0">
                    {m.source_type === "upload_audio" ? "🎤" : "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">{m.title}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(m.created_at)} · {m.source_type.replace("_", " ")}
                    </p>
                  </div>
                  <span className={`badge ${statusStyles[m.status]}`}>{m.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

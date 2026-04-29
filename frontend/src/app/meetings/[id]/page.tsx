"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Meeting } from "@/types/meeting";
import type { AnalysisResult, Flag, ActionItem, TranscriptSegment } from "@/types/analysis";
import { formatDate, getScoreColor, getSeverityColor } from "@/lib/utils";
import SpeakerBreakdown from "@/components/dashboard/SpeakerBreakdown";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (meeting?.status === "processing" || meeting?.status === "pending") {
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting?.status]);

  const loadData = async () => {
    try {
      const m = (await api.getMeeting(id)) as Meeting;
      setMeeting(m);

      if (m.status === "completed") {
        const [a, f, ai, t] = await Promise.all([
          api.getAnalysis(id) as Promise<AnalysisResult>,
          api.getFlags(id) as Promise<{ flags: Flag[] }>,
          api.getActionItems(id) as Promise<{ action_items: ActionItem[] }>,
          api.getTranscript(id) as Promise<{ segments: TranscriptSegment[] }>,
        ]);
        setAnalysis(a);
        setFlags(f.flags);
        setActionItems(ai.action_items);
        setSegments(t.segments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerdict = async (flagId: string, verdict: string) => {
    await api.updateFlagVerdict(flagId, verdict);
    setFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, user_verdict: verdict as "accepted" | "rejected" } : f))
    );
  };

  const handleExport = async () => {
    const md = await api.exportReport(id);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting?.title || "report"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) return <div className="p-8 text-center text-[var(--text-muted)]">Meeting not found.</div>;

  // Processing/pending state
  if (meeting.status !== "completed") {
    return (
      <div className="min-h-screen">
        <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold">Clarity AI</span>
          </Link>
        </nav>
        <div className="max-w-2xl mx-auto px-8 py-24 text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{meeting.title}</h2>
          <p className="text-[var(--text-secondary)] mb-2">
            {meeting.status === "failed" ? "Analysis failed." : "Analyzing your meeting..."}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {meeting.status === "processing"
              ? "Running vagueness detection, contradiction analysis, and action item extraction..."
              : meeting.status === "pending"
              ? "Waiting in queue..."
              : "Please try uploading again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-bold">Clarity AI</span>
        </Link>
        <button onClick={handleExport} className="btn-primary text-sm">
          📥 Export Report
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{meeting.title}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {formatDate(meeting.meeting_date || meeting.created_at)} · {meeting.source_type.replace("_", " ")}
          </p>
        </div>

        {analysis && (
          <>
            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 stagger-children">
              {[
                { label: "Clarity Score", value: analysis.clarity_score, suffix: "/100", color: getScoreColor(analysis.clarity_score) },
                { label: "Commitment", value: analysis.commitment_score, suffix: "/100", color: getScoreColor(analysis.commitment_score) },
                { label: "Contradictions", value: analysis.contradiction_count, suffix: "", color: analysis.contradiction_count > 0 ? "text-rose-400" : "text-emerald-400" },
                { label: "Vague Statements", value: analysis.vague_statement_count, suffix: "", color: analysis.vague_statement_count > 3 ? "text-amber-400" : "text-emerald-400" },
                { label: "Unresolved", value: analysis.unresolved_count, suffix: "", color: analysis.unresolved_count > 0 ? "text-amber-400" : "text-emerald-400" },
              ].map((card) => (
                <div key={card.label} className="glass-card p-5 text-center">
                  <div className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                    <span className="text-sm font-normal text-[var(--text-muted)]">{card.suffix}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {analysis.summary?.overview && (
              <div className="glass-card p-6 mb-8 animate-fade-in-up">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">📝 Summary</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed">{analysis.summary.overview}</p>
              </div>
            )}

            {/* Main Grid: Transcript + Flags */}
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              {/* Transcript */}
              <div className="md:col-span-3 glass-card p-6 max-h-[600px] overflow-y-auto">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">💬 Transcript</h2>
                <div className="space-y-3">
                  {segments.map((seg) => {
                    const segFlags = flags.filter(
                      (f) => f.evidence && (f.evidence as Record<string, number>).segment_index === seg.segment_index
                    );
                    const hasFlag = segFlags.length > 0;
                    return (
                      <div
                        key={seg.id}
                        className={`p-3 rounded-lg transition-all cursor-pointer ${
                          hasFlag
                            ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15"
                            : "hover:bg-[var(--bg-secondary)]"
                        }`}
                        onClick={() => hasFlag && setSelectedFlag(segFlags[0])}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[var(--accent-blue)]">{seg.speaker_label}</span>
                          {seg.start_time != null && (
                            <span className="text-xs text-[var(--text-muted)]">
                              {Math.floor(seg.start_time / 60)}:{String(Math.floor(seg.start_time % 60)).padStart(2, "0")}
                            </span>
                          )}
                          {hasFlag && <span className="text-xs">⚠️</span>}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{seg.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flag Detail Panel */}
              <div className="md:col-span-2 glass-card p-6 max-h-[600px] overflow-y-auto">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  🚩 Flags ({flags.length})
                </h2>
                {selectedFlag ? (
                  <div className="animate-fade-in">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getSeverityColor(selectedFlag.severity)}`}>
                      {selectedFlag.flag_type} · {selectedFlag.severity}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{selectedFlag.explanation}</p>
                    {!selectedFlag.user_verdict && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVerdict(selectedFlag.id, "accepted")} className="btn-primary text-xs px-4 py-2">
                          ✓ Accept
                        </button>
                        <button onClick={() => handleVerdict(selectedFlag.id, "rejected")} className="btn-secondary text-xs px-4 py-2">
                          ✕ Reject
                        </button>
                      </div>
                    )}
                    {selectedFlag.user_verdict && (
                      <span className={`text-xs ${selectedFlag.user_verdict === "accepted" ? "text-emerald-400" : "text-rose-400"}`}>
                        {selectedFlag.user_verdict === "accepted" ? "✓ Accepted" : "✕ Rejected"}
                      </span>
                    )}
                    <button onClick={() => setSelectedFlag(null)} className="block mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                      ← Back to all flags
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {flags.map((flag) => (
                      <button
                        key={flag.id}
                        onClick={() => setSelectedFlag(flag)}
                        className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(flag.severity)}`}>
                            {flag.flag_type}
                          </span>
                          {flag.user_verdict && (
                            <span className="text-xs text-[var(--text-muted)]">
                              {flag.user_verdict === "accepted" ? "✓" : "✕"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">{flag.explanation}</p>
                      </button>
                    ))}
                    {flags.length === 0 && (
                      <p className="text-sm text-[var(--text-muted)] text-center py-8">No flags detected 🎉</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="glass-card p-6 mb-8 animate-fade-in-up">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                ✅ Action Items ({actionItems.length})
              </h2>
              {actionItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                        <th className="pb-3 pr-4">Description</th>
                        <th className="pb-3 pr-4">Owner</th>
                        <th className="pb-3 pr-4">Deadline</th>
                        <th className="pb-3">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionItems.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--border-subtle)] last:border-0">
                          <td className="py-3 pr-4 text-[var(--text-secondary)]">{item.description}</td>
                          <td className="py-3 pr-4">
                            <span className={item.owner === "Unassigned" ? "text-amber-400" : "text-[var(--text-primary)]"}>
                              {item.owner}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-[var(--text-muted)]">{item.deadline || "Not set"}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No action items extracted.</p>
              )}
            </div>

            {/* Decisions & Follow-ups */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {analysis.decisions && analysis.decisions.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">🎯 Decisions Made</h2>
                  <ul className="space-y-2">
                    {analysis.decisions.map((d, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.suggested_followups && analysis.suggested_followups.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">📧 Suggested Follow-ups</h2>
                  <ul className="space-y-2">
                    {analysis.suggested_followups.map((f, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Speaker Breakdown Chart */}
            {segments.length > 0 && <SpeakerBreakdown segments={segments} />}
          </>
        )}
      </div>
    </div>
  );
}

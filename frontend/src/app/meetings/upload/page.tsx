"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const ACCEPTED_TYPES = [".txt", ".srt", ".vtt", ".mp3", ".wav", ".m4a", ".webm"];

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`Unsupported format. Accepted: ${ACCEPTED_TYPES.join(", ")}`);
      return;
    }
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    if (!title.trim()) { setError("Please enter a title"); return; }
    setUploading(true);
    setError("");
    try {
      const result = (await api.uploadMeeting(title, file)) as { id: string };
      router.push(`/meetings/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen">
      <nav className="nav-bar">
        <Link href="/dashboard" className="nav-logo">
          <div className="nav-logo-icon">C</div>
          <span className="nav-logo-text">Clarity AI</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16 animate-fade-in-up">
        <div className="mb-10">
          <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-bright)] tracking-tight">Upload Meeting</h1>
          <p className="text-[var(--text-secondary)] mt-1">Upload a transcript or audio file for AI analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Meeting Title</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q2 Planning Standup" required
              className="input-field"
            />
          </div>

          {/* Drop zone */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Transcript File</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`glass-card cursor-pointer transition-all text-center ${
                dragOver
                  ? "border-[var(--accent-blue)] bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                  : file
                  ? "border-emerald-500/30 bg-emerald-500/3"
                  : ""
              } ${file ? "p-6" : "p-12"}`}
            >
              <input
                ref={fileRef} type="file" className="hidden"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/12 flex items-center justify-center text-emerald-400 text-xl flex-shrink-0">
                    {file.name.endsWith(".mp3") || file.name.endsWith(".wav") ? "🎤" : "📄"}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-sm text-[var(--text-muted)] hover:text-rose-400 transition-colors px-2"
                  >✕</button>
                </div>
              ) : (
                <>
                  <div className="text-4xl mb-4 opacity-30">📁</div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1 font-medium">
                    Drop your file here or{" "}
                    <span className="text-[var(--accent-blue-bright)]">browse</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Supports: TXT, SRT, VTT, MP3, WAV, M4A, WEBM
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-rose-400 bg-rose-500/8 border border-rose-500/15 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={uploading || !file} className="btn-primary w-full justify-center py-3.5 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading & Analyzing...
              </span>
            ) : (
              "Upload & Analyze →"
            )}
          </button>
        </form>

        {/* Help text */}
        <div className="glass-card p-5 mt-8">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">💡 Tips for Best Results</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Use transcripts with speaker labels (e.g., <code className="text-[var(--accent-blue-bright)] bg-blue-500/8 px-1.5 py-0.5 rounded font-mono text-[11px]">Alice: Hello everyone</code>)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              SRT/VTT formats preserve timestamps for better analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              Audio files are transcribed using Gemini AI (may take 1–2 minutes)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

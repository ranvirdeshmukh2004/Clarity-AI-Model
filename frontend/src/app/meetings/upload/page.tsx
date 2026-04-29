"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const allowedExtensions = [".txt", ".srt", ".vtt", ".mp3", ".wav", ".m4a"];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const validateAndSetFile = (f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported format. Allowed: ${allowedExtensions.join(", ")}`);
      return;
    }
    setFile(f);
    setError("");
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const result = (await api.uploadMeeting(formData)) as { id: string };
      router.push(`/meetings/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
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
        <Link href="/dashboard" className="btn-secondary text-sm">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Upload Meeting</h1>
        <p className="text-[var(--text-secondary)] mb-10">
          Upload a transcript or audio file for AI analysis
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
              placeholder="Q2 Planning Meeting"
            />
          </div>

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`glass-card p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
              dragActive
                ? "border-[var(--accent-blue)] bg-blue-500/5"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-[var(--border-subtle)]"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept={allowedExtensions.join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) validateAndSetFile(f);
              }}
            />
            {file ? (
              <>
                <p className="text-3xl mb-3">✅</p>
                <p className="font-semibold text-[var(--text-primary)]">{file.name}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-4">📁</p>
                <p className="font-semibold text-[var(--text-primary)] mb-1">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Supports: .txt, .srt, .vtt, .mp3, .wav, .m4a
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !title || uploading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading & Processing...
              </>
            ) : (
              "Upload & Analyze"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

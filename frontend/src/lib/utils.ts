export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 75) return "bg-emerald-500/20";
  if (score >= 50) return "bg-amber-500/20";
  return "bg-rose-500/20";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "high":
      return "text-rose-400 bg-rose-500/20 border-rose-500/30";
    case "medium":
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    case "low":
      return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    default:
      return "text-slate-400 bg-slate-500/20 border-slate-500/30";
  }
}

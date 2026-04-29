import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-logo">
          <div className="nav-logo-icon">C</div>
          <span className="nav-logo-text">Clarity AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link href="/login" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-20">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-cyan-500/4 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

        <div className="text-center max-w-4xl mx-auto relative animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[var(--border-medium)] bg-[var(--bg-secondary)] mb-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              AI-Powered Meeting Intelligence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-8 tracking-tight">
            <span className="text-[var(--text-bright)]">Turn meetings</span>
            <br />
            <span className="text-[var(--text-bright)]">into </span>
            <span className="bg-clip-text text-transparent animate-gradient" style={{ backgroundImage: "var(--gradient-brand-text)", backgroundSize: "200% 200%" }}>
              clarity
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Detect vague commitments, surface contradictions, and extract action
            items with AI. Know if your meeting produced{" "}
            <span className="text-[var(--text-primary)] font-medium">real decisions</span>{" "}
            or just discussion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/login" className="btn-primary text-base px-10 py-3.5">
              Start Analyzing →
            </Link>
            <a href="#features" className="btn-secondary text-base px-10 py-3.5">
              See How It Works
            </a>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            No credit card required · Free forever
          </p>
        </div>

        {/* Stats preview card */}
        <div className="mt-20 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="glass-card p-1 relative overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="rounded-[12px] bg-[var(--bg-primary)]/50 p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Clarity Score", value: "78", unit: "/100", color: "text-blue-400", icon: "📊" },
                  { label: "Contradictions", value: "3", unit: " found", color: "text-rose-400", icon: "⚡" },
                  { label: "Vague Statements", value: "7", unit: " flagged", color: "text-amber-400", icon: "🔍" },
                  { label: "Action Items", value: "12", unit: " extracted", color: "text-emerald-400", icon: "✅" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center group">
                    <div className="text-2xl mb-3 opacity-60 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                    <div className={`text-4xl font-bold ${stat.color} mb-1 tracking-tight`}>
                      {stat.value}
                      <span className="text-base font-normal text-[var(--text-muted)]">{stat.unit}</span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-medium)] to-transparent" />
      </div>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-[var(--accent-blue)] tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-bright)] mb-4 tracking-tight">
            What Clarity AI Reveals
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg font-light">
            Go beyond transcription. Understand whether your meeting produced
            real alignment — or just conversation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 stagger-children">
          {[
            {
              icon: "🔍", color: "from-blue-500/20 to-blue-500/5", border: "hover:border-blue-500/30",
              title: "Vagueness Detection",
              desc: "Flag hedging language like 'maybe', 'we'll see', and 'at some point'. Know exactly when commitments are weak.",
            },
            {
              icon: "⚡", color: "from-purple-500/20 to-purple-500/5", border: "hover:border-purple-500/30",
              title: "Contradiction Detection",
              desc: "Spot when speakers contradict themselves or each other using semantic embeddings and NLI classification.",
            },
            {
              icon: "✅", color: "from-emerald-500/20 to-emerald-500/5", border: "hover:border-emerald-500/30",
              title: "Action Item Extraction",
              desc: "Automatically extract tasks with owners, deadlines, and priorities. Flag anything with missing assignments.",
            },
            {
              icon: "📊", color: "from-cyan-500/20 to-cyan-500/5", border: "hover:border-cyan-500/30",
              title: "Clarity Score",
              desc: "Get a weighted 0–100 score based on specificity, ownership, vagueness, contradictions, and decisions.",
            },
            {
              icon: "📋", color: "from-amber-500/20 to-amber-500/5", border: "hover:border-amber-500/30",
              title: "Intelligence Reports",
              desc: "AI-generated reports with decisions, risks, follow-ups, and a ready-to-send follow-up email draft.",
            },
            {
              icon: "👥", color: "from-rose-500/20 to-rose-500/5", border: "hover:border-rose-500/30",
              title: "Speaker Analysis",
              desc: "See who committed, who hedged, and who needs follow-up. Participation breakdown by speaker.",
            },
          ].map((feature) => (
            <div key={feature.title} className={`glass-card p-7 ${feature.border} group`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[var(--accent-purple)] tracking-widest uppercase mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-bright)] tracking-tight">
            Three Steps to Clarity
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {[
            { step: "01", title: "Upload", desc: "Drop your meeting transcript (.txt, .srt, .vtt) or audio file (.mp3, .wav).", color: "text-blue-400" },
            { step: "02", title: "Analyze", desc: "Gemini AI detects vagueness, contradictions, and extracts action items in seconds.", color: "text-purple-400" },
            { step: "03", title: "Act", desc: "Review your clarity score, accept/reject flags, and export the intelligence report.", color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className={`text-5xl font-black ${s.color} opacity-20 mb-4`}>{s.step}</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 py-16">
        <div className="glass-card p-8">
          <p className="text-center text-xs font-semibold text-[var(--text-muted)] tracking-widest uppercase mb-6">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-[var(--text-secondary)]">
            {["Next.js 15", "FastAPI", "Google Gemini", "Supabase", "pgvector", "Upstash QStash", "Recharts", "TypeScript"].map((t) => (
              <span key={t} className="flex items-center gap-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 py-24">
        <div className="glass-card p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/5 to-cyan-500/8" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--text-bright)] tracking-tight">
              Ready to bring clarity?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto text-lg font-light">
              Upload your first transcript and see what your meetings have been missing.
            </p>
            <Link href="/login" className="btn-primary text-base px-10 py-3.5">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-8 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">C</span>
            </div>
            <span>Meeting Clarity AI</span>
          </div>
          <span>Built with Gemini AI · Zero-cost deployment</span>
        </div>
      </footer>
    </div>
  );
}

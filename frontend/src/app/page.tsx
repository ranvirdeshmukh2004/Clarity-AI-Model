import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">
            Clarity AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/login" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-[var(--text-secondary)]">
              AI-Powered Meeting Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-[var(--text-primary)]">Turn meetings into </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              clarity
            </span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
            Analyze meeting transcripts to detect vague commitments,
            contradictions, and missing ownership. Get a clarity score and
            actionable insights your team can use immediately.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="btn-primary text-base px-8 py-3">
              Start Analyzing →
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3">
              See How It Works
            </a>
          </div>
        </div>

        {/* Floating Score Preview */}
        <div className="mt-20 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Clarity Score", value: "78", color: "text-blue-400", suffix: "/100" },
                { label: "Contradictions", value: "3", color: "text-rose-400", suffix: " found" },
                { label: "Vague Statements", value: "7", color: "text-amber-400", suffix: " flagged" },
                { label: "Action Items", value: "12", color: "text-emerald-400", suffix: " extracted" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                    <span className="text-sm font-normal text-[var(--text-muted)]">
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl font-bold text-center mb-4 text-[var(--text-primary)]">
          What Clarity AI Reveals
        </h2>
        <p className="text-center text-[var(--text-secondary)] mb-16 max-w-2xl mx-auto">
          Go beyond transcription. Understand whether your meeting produced
          real decisions or just discussion.
        </p>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {[
            {
              icon: "🔍",
              title: "Vagueness Detection",
              desc: "Flag hedging language like 'maybe', 'we'll see', and 'at some point'. Know when commitments are weak.",
            },
            {
              icon: "⚡",
              title: "Contradiction Detection",
              desc: "Spot when speakers contradict themselves or each other — within the same meeting or across meetings.",
            },
            {
              icon: "✅",
              title: "Action Item Extraction",
              desc: "Automatically extract tasks with owners, deadlines, and priorities. Flag missing assignments.",
            },
            {
              icon: "📊",
              title: "Clarity Score",
              desc: "Get a 0-100 score measuring how clear, committed, and actionable your meeting was.",
            },
            {
              icon: "📋",
              title: "Intelligence Reports",
              desc: "Structured reports with decisions, risks, follow-ups, and a draft follow-up email ready to send.",
            },
            {
              icon: "👥",
              title: "Speaker Analysis",
              desc: "See who committed, who hedged, and who needs follow-up. Per-speaker participation breakdown.",
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-card p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
              Ready to bring clarity to your meetings?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Upload your first transcript and see what Clarity AI reveals in
              minutes. No credit card required.
            </p>
            <Link href="/login" className="btn-primary text-base px-8 py-3">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-8 px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>© 2026 Meeting Clarity AI</span>
          <span>Built with AI for better meetings</span>
        </div>
      </footer>
    </div>
  );
}

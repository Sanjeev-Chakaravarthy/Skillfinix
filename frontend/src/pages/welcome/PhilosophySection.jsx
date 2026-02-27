// Icon using only primary / secondary / success brand colors

const BELIEFS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="18" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M13 20c0-3.86 3.13-7 7-7s7 3.14 7 7-3.13 7-7 7" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="20" r="3" fill="hsl(var(--primary))" />
      </svg>
    ),
    stat: "1 in 1",
    truth: "Every person is skilled at something the world needs.",
    sub: "Not someday. Right now. Your skill has value to someone out there.",
    accentColor: "hsl(var(--primary))",
    accentBg: "hsl(var(--primary) / 0.07)",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M8 32 C12 20 20 16 28 10" stroke="hsl(var(--success))" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M28 10 L24 10 M28 10 L28 14" stroke="hsl(var(--success))" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="32" r="3" fill="hsl(var(--success))" />
        <circle cx="28" cy="10" r="3" fill="hsl(var(--success))" />
      </svg>
    ),
    stat: "Zero → Flow",
    truth: "Growth happens fastest when you learn from someone who just learned it.",
    sub: "Fresh learners make the best teachers — their memory of confusion is still intact.",
    accentColor: "hsl(var(--success))",
    accentBg: "hsl(var(--success) / 0.07)",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 8 L14 22 L26 22 Z" stroke="hsl(var(--secondary))" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 28 h12" stroke="hsl(var(--secondary))" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 32 h6" stroke="hsl(var(--secondary))" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    stat: "No $ required",
    truth: "The best exchanges aren't transactional. They're reciprocal.",
    sub: "You give what you know. You get what you want. No credit card needed.",
    accentColor: "hsl(var(--secondary))",
    accentBg: "hsl(var(--secondary) / 0.07)",
  },
];

export default function PhilosophySection() {
  return (
    <section
      id="how-it-works"
      className="py-28 px-6"
      style={{ background: "hsl(var(--muted))" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-5 sf-fade-up"
          data-reveal
          style={{ color: "hsl(var(--primary))" }}
        >
          The philosophy
        </p>

        {/* Core belief statement */}
        <div className="max-w-3xl mb-20">
          <h2
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight sf-fade-up sf-delay-100"
            data-reveal
            style={{ color: "hsl(var(--foreground))" }}
          >
            Everyone is good at{" "}
            <em className="not-italic gradient-text">something.</em>
            <br />
            Everyone wants to learn{" "}
            <em className="not-italic" style={{ color: "hsl(var(--success))" }}>something.</em>
          </h2>
          <p
            className="mt-6 text-lg leading-relaxed sf-fade-up sf-delay-200"
            data-reveal
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Skillfinix is built on this truth. Not on subscriptions, not on algorithms —
            on the oldest form of human growth: teaching each other.
          </p>
        </div>

        {/* Belief cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BELIEFS.map((b, i) => (
            <BeliefCard key={i} {...b} delay={`${i * 150}ms`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BeliefCard({ icon, stat, truth, sub, delay, accentBg }) {
  return (
    <div
      className="group sf-scale-in p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 cursor-default"
      data-reveal
      style={{
        animationDelay: delay,
        borderColor: "hsl(var(--border))",
        background: "hsl(var(--card))",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
        e.currentTarget.style.borderColor = "hsl(var(--border))";
      }}
    >
      <div className="mb-5 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: accentBg }}>
        {icon}
      </div>
      <div
        className="font-heading text-2xl font-bold mb-3"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {stat}
      </div>
      <p
        className="text-base font-medium mb-2 leading-snug"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {truth}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
        {sub}
      </p>
    </div>
  );
}

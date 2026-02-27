// Journey card accent colors mapped to brand tokens
const JOURNEYS = [
  {
    name: "Priya S.",
    from: { skill: "Noticed problems in photos", level: 20, tag: "Hobbyist" },
    to: { skill: "Shooting client portraits", level: 82, tag: "Freelancing" },
    swap: "Taught Priya photography → learned French conversation",
    swapPartner: "Lucas (Paris)",
    duration: "8 weeks",
    accentColor: "hsl(var(--primary))",
    accentBg: "hsl(var(--primary) / 0.08)",
    progressFill: "hsl(var(--primary))",
  },
  {
    name: "Arjun M.",
    from: { skill: "Could barely play C chord", level: 10, tag: "Total beginner" },
    to: { skill: "Performing at open mics", level: 75, tag: "Confident player" },
    swap: "Taught Arjun guitar → learned Figma & UI design",
    swapPartner: "Meera (Bangalore)",
    duration: "12 weeks",
    accentColor: "hsl(var(--success))",
    accentBg: "hsl(var(--success) / 0.08)",
    progressFill: "hsl(var(--success))",
  },
  {
    name: "Chioma A.",
    from: { skill: "Knew Python basics", level: 30, tag: "Junior dev" },
    to: { skill: "Building ML pipelines", level: 78, tag: "ML Engineer" },
    swap: "Taught Chioma Python → learned Arabic calligraphy",
    swapPartner: "Khalid (Dubai)",
    duration: "10 weeks",
    accentColor: "hsl(var(--secondary))",
    accentBg: "hsl(var(--secondary) / 0.08)",
    progressFill: "hsl(var(--secondary))",
  },
];

export default function SkillJourneySection() {
  return (
    <section
      id="journeys"
      className="py-28 px-6"
      style={{ background: "hsl(var(--muted))" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-16">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-4 sf-fade-up"
            data-reveal
            style={{ color: "hsl(var(--primary))" }}
          >
            Skill journeys
          </p>
          <h2
            className="font-heading text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight sf-fade-up sf-delay-100"
            data-reveal
            style={{ color: "hsl(var(--foreground))" }}
          >
            Not testimonials.
            <br />
            Real proof of growth.
          </h2>
          <p
            className="mt-4 text-lg leading-relaxed sf-fade-up sf-delay-200"
            data-reveal
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Before-and-after stories from people who showed up, swapped skills,
            and changed their trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {JOURNEYS.map((j, i) => (
            <JourneyCard key={i} journey={j} delay={`${i * 140}ms`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ journey, delay }) {
  const { name, from, to, swap, swapPartner, duration, accentColor, accentBg, progressFill } = journey;

  return (
    <div
      className="group sf-fade-up rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-default"
      data-reveal
      style={{
        animationDelay: delay,
        borderColor: "hsl(var(--border))",
        background: "hsl(var(--card))",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      {/* Card header */}
      <div
        className="px-6 pt-6 pb-5 flex items-center justify-between border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 gradient-primary"
          >
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{duration} journey</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: accentBg, color: accentColor }}
        >
          ✓ Verified swap
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Before */}
        <ProgressRow
          label="Before"
          tag={from.tag}
          skill={from.skill}
          value={from.level}
          trackColor="hsl(var(--muted))"
          fillColor="hsl(var(--foreground) / 0.18)"
        />

        {/* Swap info */}
        <div
          className="flex items-start gap-3 py-3 px-4 rounded-2xl"
          style={{ background: accentBg }}
        >
          <div
            className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold mt-0.5 gradient-primary"
          >
            ⇄
          </div>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: accentColor }}>
              The exchange
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.65)" }}>
              {swap}
            </p>
            <p className="text-xs mt-1 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              with {swapPartner}
            </p>
          </div>
        </div>

        {/* After */}
        <ProgressRow
          label="After"
          tag={to.tag}
          skill={to.skill}
          value={to.level}
          trackColor={accentBg}
          fillColor={progressFill}
          animated
        />
      </div>
    </div>
  );
}

function ProgressRow({ label, tag, skill, value, trackColor, fillColor, animated }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider mr-2"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {label}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: trackColor, color: "hsl(var(--muted-foreground))" }}
          >
            {tag}
          </span>
        </div>
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
          {value}%
        </span>
      </div>
      <p className="text-xs mb-2 leading-snug" style={{ color: "hsl(var(--foreground) / 0.60)" }}>
        {skill}
      </p>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
        <div
          className="h-full rounded-full"
          style={{
            ["--progress-to"]: `${value}%`,
            width: `${value}%`,
            background: fillColor,
            animation: animated ? "sf-progress-fill 1.2s cubic-bezier(0.22,1,0.36,1) 0.3s both" : "none",
          }}
        />
      </div>
    </div>
  );
}

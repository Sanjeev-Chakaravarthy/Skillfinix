import { useState, useEffect } from "react";

const EXCHANGE = {
  from: {
    name: "Maya",
    avatar: "M",
    skill: "Photography",
    level: "3 years",
    colorClass: "gradient-primary",
    tagBg: "hsl(var(--primary) / 0.09)",
    tagColor: "hsl(var(--primary))",
  },
  to: {
    name: "Ravi",
    avatar: "R",
    skill: "Guitar",
    level: "5 years",
    colorClass: "",
    avatarBg: "hsl(var(--success))",
    tagBg: "hsl(var(--success) / 0.09)",
    tagColor: "hsl(var(--success))",
  },
};

const THREAD_SKILLS = ["Patience", "Eye for detail", "Creative listening", "Rhythm sense"];

export default function SkillFlowSection() {
  const [animated, setAnimated] = useState(false);
  const [activeTag, setActiveTag] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => {
      setActiveTag((prev) => (prev + 1) % THREAD_SKILLS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [animated]);

  return (
    <section
      id="skill-flow"
      className="py-28 px-6 overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-5 sf-slide-left"
              data-reveal
              style={{ color: "hsl(var(--primary))" }}
            >
              The exchange
            </p>
            <h2
              className="font-heading text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-6 sf-slide-left sf-delay-100"
              data-reveal
              style={{ color: "hsl(var(--foreground))" }}
            >
              Skills flow both
              <br />
              ways. Always.
            </h2>
            <p
              className="text-lg leading-relaxed mb-8 sf-slide-left sf-delay-200"
              data-reveal
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              There's no teacher and no student here — only two people who both
              have something the other wants. The thread binds both of them.
            </p>

            <div className="space-y-5">
              {[
                { n: "01", label: "List what you know", desc: "Add any skill you can comfortably share — doesn't need to be expert level." },
                { n: "02", label: "Find your match", desc: "Browse people who have what you want and want what you have." },
                { n: "03", label: "Make the swap", desc: "Connect, agree on a format (chat, video, async), and start learning." },
              ].map((step, i) => (
                <Step key={step.n} {...step} delay={`${i * 120}ms`} />
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div
            className="relative sf-scale-in sf-delay-200"
            data-reveal
            onAnimationEnd={() => setAnimated(true)}
          >
            <SkillThreadVisual exchange={EXCHANGE} activeTag={activeTag} animated={animated} />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sf-fade-up" data-reveal>
          {[
            { value: "4,800+", label: "Skills listed" },
            { value: "2,100+", label: "Active exchangers" },
            { value: "98%", label: "Match satisfaction" },
            { value: "40+", label: "Skill categories" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center py-6 px-4 rounded-2xl border"
              style={{
                borderColor: "hsl(var(--border))",
                background: "hsl(var(--card))",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="font-heading text-3xl font-bold mb-1 gradient-text">{stat.value}</div>
              <div className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, desc, delay }) {
  return (
    <div className="flex gap-5 group sf-fade-up" data-reveal style={{ animationDelay: delay }}>
      <div
        className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover:scale-110"
        style={{ background: "hsl(var(--primary) / 0.09)", color: "hsl(var(--primary))" }}
      >
        {n}
      </div>
      <div>
        <p className="font-semibold text-base mb-0.5" style={{ color: "hsl(var(--foreground))" }}>{label}</p>
        <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
      </div>
    </div>
  );
}

function SkillThreadVisual({ exchange, activeTag, animated }) {
  return (
    <div
      className="relative rounded-3xl p-8 border"
      style={{
        background: "hsl(var(--card))",
        borderColor: "hsl(var(--border))",
        boxShadow: "var(--shadow-xl)",
        minHeight: "380px",
      }}
    >
      <PersonCard person={exchange.from} side="left" />

      {/* Thread SVG */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-4">
        <svg viewBox="0 0 300 80" fill="none" className="w-full" style={{ overflow: "visible" }}>
          <path
            d="M 30 40 C 100 10, 200 70, 270 40"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="600"
            style={{
              strokeDashoffset: animated ? 0 : 600,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)",
              opacity: 0.5,
            }}
          />
          <path
            d="M 30 40 C 100 70, 200 10, 270 40"
            stroke="hsl(var(--secondary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="600"
            style={{
              strokeDashoffset: animated ? 0 : 600,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s",
              opacity: 0.5,
            }}
          />

          {/* Floating skill label on thread */}
          <foreignObject x="90" y="18" width="120" height="44">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="gradient-primary"
              style={{
                color: "#fff",
                borderRadius: "999px",
                padding: "4px 14px",
                fontSize: "11px",
                fontWeight: 600,
                textAlign: "center",
                opacity: animated ? 1 : 0,
                transition: "opacity 0.4s ease",
                whiteSpace: "nowrap",
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              {THREAD_SKILLS[activeTag]}
            </div>
          </foreignObject>
        </svg>
      </div>

      <PersonCard person={exchange.to} side="right" />

      {/* Swap badge */}
      <div
        className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={{ background: "hsl(var(--primary) / 0.09)", color: "hsl(var(--primary))" }}
      >
        ⇄ Active swap
      </div>
    </div>
  );
}

function PersonCard({ person, side }) {
  const isRight = side === "right";
  return (
    <div
      className={`absolute ${isRight ? "bottom-8 right-8" : "top-8 left-8"} flex flex-col items-${isRight ? "end" : "start"} gap-2`}
    >
      <div className="flex items-center gap-3" style={{ flexDirection: isRight ? "row-reverse" : "row" }}>
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 ${person.colorClass || ""}`}
          style={!person.colorClass ? { background: person.avatarBg } : {}}
        >
          {person.avatar}
        </div>
        <div className={`text-${isRight ? "right" : "left"}`}>
          <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>{person.name}</p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{person.level} of {person.skill}</p>
        </div>
      </div>
      <div
        className="text-xs px-3 py-1.5 rounded-xl font-medium max-w-[180px]"
        style={{ background: person.tagBg, color: person.tagColor }}
      >
        Teaches: {person.skill}
      </div>
    </div>
  );
}

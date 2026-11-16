import { useState, useEffect } from "react";

const EXCHANGE = {
  from: {
    name: "Maya",
    avatar: "M",
    skill: "Photography",
    level: "3 years",
    tagBg: "hsl(var(--teach) / 0.12)",
    tagColor: "hsl(var(--teach))",
    avatarBg: "hsl(var(--teach))",
  },
  to: {
    name: "Ravi",
    avatar: "R",
    skill: "Guitar",
    level: "5 years",
    avatarBg: "hsl(var(--learn))",
    tagBg: "hsl(var(--learn) / 0.12)",
    tagColor: "hsl(var(--learn))",
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
      className="py-28 px-6 overflow-hidden bg-background"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div>
            <h2
              className="font-heading text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-6 sf-slide-left text-foreground"
              data-reveal
            >
              Skills flow both
              <br />
              ways. Always.
            </h2>
            <p
              className="text-lg leading-relaxed mb-8 sf-slide-left sf-delay-100 text-muted-foreground"
              data-reveal
            >
              There’s no teacher and no student here: only two people who both
              have something the other wants. The thread binds both of them.
            </p>

            <div className="space-y-5">
              {[
                { n: "01", label: "List what you know", desc: "Add any skill you can comfortably share; it doesn’t need to be expert level." },
                { n: "02", label: "Find your match", desc: "Browse people who have what you want and want what you have." },
                { n: "03", label: "Make the swap", desc: "Connect, agree on a format (chat, video, async), and start learning." },
              ].map((step, i) => (
                <Step key={step.n} {...step} delay={`${i * 120}ms`} />
              ))}
            </div>
          </div>

          {/* Right visual */}
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
              className="text-center py-6 px-4 rounded-xl border border-border bg-card shadow-xs"
            >
              <div className="font-heading text-3xl font-bold mb-1 text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
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
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors bg-primary/10 text-primary"
      >
        {n}
      </div>
      <div>
        <p className="font-semibold text-base mb-0.5 text-foreground">{label}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function SkillThreadVisual({ exchange, activeTag, animated }) {
  return (
    <div
      className="relative rounded-2xl p-8 border border-border bg-card shadow-md"
      style={{
        minHeight: "380px",
      }}
    >
      <PersonCard person={exchange.from} side="left" />

      {/* Thread SVG */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-4">
        <svg aria-hidden="true" viewBox="0 0 300 80" fill="none" className="w-full" style={{ overflow: "visible" }}>
          <path
            d="M 30 40 C 100 10, 200 70, 270 40"
            stroke="hsl(var(--teach))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="600"
            style={{
              strokeDashoffset: animated ? 0 : 600,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)",
              opacity: 0.7,
            }}
          />
          <path
            d="M 30 40 C 100 70, 200 10, 270 40"
            stroke="hsl(var(--learn))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="600"
            style={{
              strokeDashoffset: animated ? 0 : 600,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s",
              opacity: 0.7,
            }}
          />

          {/* Floating skill label on thread */}
          <foreignObject x="90" y="18" width="120" height="44">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold text-center shadow-xs"
              style={{
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
        className="absolute top-4 right-4 px-3 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
      >
        Active swap
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
          className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0"
          style={{ background: person.avatarBg }}
        >
          {person.avatar}
        </div>
        <div className={`text-${isRight ? "right" : "left"}`}>
          <p className="text-sm font-semibold text-foreground">{person.name}</p>
          <p className="text-xs text-muted-foreground">{person.level} of {person.skill}</p>
        </div>
      </div>
      <div
        className="text-xs px-2.5 py-1 rounded-md font-medium max-w-[180px]"
        style={{ background: person.tagBg, color: person.tagColor }}
      >
        Teaches: {person.skill}
      </div>
    </div>
  );
}

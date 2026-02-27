import { Link } from "react-router-dom";

const SKILLS = [
  "Guitar", "Python", "Pottery", "UI Design", "Spanish", "Photography",
  "Chess", "Yoga", "Video Editing", "Arabic Cooking", "Illustration",
  "3D Modelling", "Public Speaking", "Investing",
];

const LEFT_SKILLS  = SKILLS.slice(0, 5);
const RIGHT_SKILLS = SKILLS.slice(5, 10);

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden px-6"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient primary glow — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 100% at 50% 0%, hsl(var(--primary) / 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center pt-28 pb-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full border"
          style={{
            borderColor: "hsl(var(--primary) / 0.25)",
            background: "hsl(var(--primary) / 0.07)",
            animation: "sf-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "hsl(var(--primary))" }}
          />
          <span className="text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>
            A new kind of learning is here
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.18] tracking-tight mb-6 antialiased"
          style={{
            color: "hsl(var(--foreground))",
            animation: "sf-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) 0.2s both",
            paddingBottom: "0.06em", /* prevents descender clip on the last line */
          }}
        >
          Every person
          <br />
          is a{" "}
          <span style={{ position: "relative", display: "inline", whiteSpace: "nowrap" }}>
            <span className="gradient-text sf-shimmer-text" style={{ display: "inline" }}>library.</span>
            {/* Animated squiggle underline */}
            <svg
              viewBox="0 0 220 14"
              fill="none"
              style={{
                position: "absolute",
                bottom: "-6px",
                left: 0,
                width: "100%",
                height: "14px",
                opacity: 0.5,
              }}
            >
              <path
                d="M3 9c30-8 50 4 80-3s50 4 80-3s40 4 54-2"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="600"
                style={{ animation: "sf-thread-draw 1.6s cubic-bezier(0.22,1,0.36,1) 0.7s both" }}
              />
            </svg>
          </span>
          <br />
          Find yours.
        </h1>

        {/* Sub-copy */}
        <p
          className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
          style={{
            color: "hsl(var(--muted-foreground))",
            animation: "sf-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) 0.4s both",
          }}
        >
          Real people swapping what they know for what they want to learn —
          no classrooms, no subscriptions, no algorithms.
          Just humans teaching humans.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: "sf-fade-up 0.75s cubic-bezier(0.22,1,0.36,1) 0.55s both" }}
        >
          <Link
            to="/signup"
            className="group gradient-primary flex items-center gap-2 text-base font-semibold px-7 py-4 rounded-2xl text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            style={{ boxShadow: "0 8px 30px hsl(var(--primary) / 0.35)" }}
          >
            Start swapping skills
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 text-base font-medium px-7 py-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02]"
            style={{
              color: "hsl(var(--foreground))",
              borderColor: "hsl(var(--border))",
              background: "transparent",
            }}
          >
            See how it works
          </button>
        </div>
      </div>

      {/* Floating skill tags — left */}
      <div
        className="hidden lg:flex flex-col gap-3 absolute left-8 xl:left-16 top-1/2 -translate-y-1/2"
        style={{ animation: "sf-tag-float-left 1s cubic-bezier(0.22,1,0.36,1) 0.9s both" }}
      >
        {LEFT_SKILLS.map((skill, i) => (
          <SkillPill key={skill} label={skill} rotate={i % 2 === 0 ? "-2deg" : "1.5deg"} delay={`${0.9 + i * 0.08}s`} />
        ))}
      </div>

      {/* Floating skill tags — right */}
      <div
        className="hidden lg:flex flex-col gap-3 absolute right-8 xl:right-16 top-1/2 -translate-y-1/2"
        style={{ animation: "sf-tag-float-right 1s cubic-bezier(0.22,1,0.36,1) 0.9s both" }}
      >
        {RIGHT_SKILLS.map((skill, i) => (
          <SkillPill key={skill} label={skill} rotate={i % 2 === 0 ? "2deg" : "-1.5deg"} delay={`${0.9 + i * 0.08}s`} />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ animation: "sf-fade-in 1s ease 1.5s both" }}
      >
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
          Scroll
        </span>
        <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, hsl(var(--border)), transparent)" }} />
      </div>
    </section>
  );
}

function SkillPill({ label, rotate, delay }) {
  return (
    <div
      className="sf-skill-tag sf-animate-float"
      style={{
        transform: `rotate(${rotate})`,
        animationDelay: delay,
        animationDuration: `${5 + Math.random() * 3}s`,
      }}
    >
      {label}
    </div>
  );
}

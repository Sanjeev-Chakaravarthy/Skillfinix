import { Link } from "react-router-dom";

const MINI_SKILLS = [
  "Watercolour", "Mandarin", "Backend dev", "Tailoring",
  "Excel mastery", "Bouldering", "Documentary filmmaking",
  "Sourdough baking", "Digital marketing", "Jazz piano",
];

export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative py-32 px-6 overflow-hidden"
      style={{ background: "hsl(240 10% 10%)" }}
    >
      {/* Ambient glow — uses existing gradient-primary colors */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 100%, hsl(var(--primary) / 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 20%, hsl(var(--secondary) / 0.12) 0%, transparent 60%)
          `,
        }}
      />

      {/* Floating micro skill words (decorative) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {MINI_SKILLS.map((skill, i) => (
          <div
            key={skill}
            className="absolute text-xs font-medium whitespace-nowrap select-none"
            style={{
              color: "rgba(255,255,255,0.07)",
              left: `${(i * 9.5 + 3) % 95}%`,
              top: `${(i * 7.3 + 8) % 85}%`,
              transform: `rotate(${-15 + (i * 7) % 30}deg)`,
              animation: `sf-float-slow ${7 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          >
            {skill}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border sf-scale-in"
          data-reveal
          style={{
            borderColor: "hsl(var(--primary) / 0.35)",
            background: "hsl(var(--primary) / 0.10)",
          }}
        >
          <span style={{ color: "hsl(var(--primary))" }} className="text-sm font-medium">
            You already have what someone else is searching for
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6 sf-fade-up sf-delay-100"
          data-reveal
          style={{ color: "#fff" }}
        >
          Ready to exchange
          <br />
          <span className="sf-shimmer-text">what you know?</span>
        </h2>

        <p
          className="text-lg leading-relaxed mb-12 sf-fade-up sf-delay-200"
          data-reveal
          style={{ color: "rgba(255,255,255,0.52)" }}
        >
          No courses to buy. No deadlines to miss. Just find someone who has
          what you want, offer what you know, and begin.
        </p>

        {/* CTA group */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sf-fade-up sf-delay-300"
          data-reveal
        >
          <Link
            to="/signup"
            className="group gradient-primary flex items-center gap-2.5 text-base font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-300 hover:scale-[1.04] hover:shadow-xl sf-animate-glow"
            style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.40)" }}
          >
            Join the exchange
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            to="/login"
            className="text-base font-medium px-8 py-4 rounded-2xl border transition-all duration-300 hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.60)", borderColor: "rgba(255,255,255,0.14)" }}
          >
            Already a member? Log in
          </Link>
        </div>

        <p
          className="mt-10 text-sm sf-fade-up sf-delay-400"
          data-reveal
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          No credit card. No algorithm. Just people helping people.
        </p>
      </div>
    </section>
  );
}

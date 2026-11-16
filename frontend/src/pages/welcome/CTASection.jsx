import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative py-28 px-6 overflow-hidden bg-secondary text-secondary-foreground border-t border-border"
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Headline */}
        <h2
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6 sf-fade-up text-secondary-foreground"
          data-reveal
        >
          Ready to exchange
          <br />
          what you know?
        </h2>

        <p
          className="text-lg leading-relaxed mb-10 sf-fade-up sf-delay-100 text-secondary-foreground/75 max-w-xl mx-auto"
          data-reveal
        >
          No courses to buy. No deadlines to miss. Just find someone who has
          what you want, offer what you know, and begin.
        </p>

        {/* CTA group */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sf-fade-up sf-delay-200"
          data-reveal
        >
          <Link
            to="/signup"
            className="group flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-dark transition-colors shadow-xs active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            Join the exchange
            <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <Link
            to="/login"
            className="text-base font-medium px-8 py-3.5 rounded-lg border border-secondary-foreground/20 text-secondary-foreground/80 hover:bg-secondary-foreground/10 transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
          >
            Already a member? Log in
          </Link>
        </div>

        <p
          className="mt-8 text-xs sf-fade-up sf-delay-300 text-secondary-foreground/50"
          data-reveal
        >
          No credit card. No algorithm. Direct peer to peer.
        </p>
      </div>
    </section>
  );
}

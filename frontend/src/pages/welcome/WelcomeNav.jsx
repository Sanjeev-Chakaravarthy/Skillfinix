import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function WelcomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled ? "bg-card/95 backdrop-blur-md border-b border-border py-3 shadow-xs" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/welcome" className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-primary">
          <div
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base transition-colors group-hover:bg-primary-dark shadow-xs"
          >
            S
          </div>
          <span className="text-lg font-bold font-heading tracking-tight text-foreground transition-colors">
            Skillfinix
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", id: "how-it-works" },
            { label: "Skill exchange", id: "skill-flow" },
            { label: "Stories", id: "journeys" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors active:translate-y-px disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-xs active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
          >
            Join free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors active:translate-y-px disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M4 7h14M4 11h14M4 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-opacity duration-200 overflow-hidden ${
          menuOpen ? "max-h-72 opacity-100 bg-background border-b border-border shadow-md" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {[
            { label: "How it works", id: "how-it-works" },
            { label: "Skill exchange", id: "skill-flow" },
            { label: "Stories", id: "journeys" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors active:translate-y-px disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {item.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Link
              to="/login"
              className="flex-1 text-center text-sm font-medium text-foreground py-2 rounded-lg border border-border hover:bg-muted transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center text-sm font-semibold text-primary-foreground py-2 rounded-lg bg-primary hover:bg-primary-dark transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
            >
              Join free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

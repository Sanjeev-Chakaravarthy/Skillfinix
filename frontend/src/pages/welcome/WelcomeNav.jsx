import { useEffect, useRef, useState } from "react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "sf-nav-solid py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/welcome" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-base transition-transform duration-300 group-hover:scale-110 gradient-primary"
          >
            S
          </div>
          <span
            className="text-lg font-bold font-heading tracking-tight transition-colors duration-300"
            style={{ color: scrolled ? "#fff" : "hsl(var(--foreground))" }}
          >
            Skillfinix
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", id: "how-it-works" },
            { label: "Skill Exchange", id: "skill-flow" },
            { label: "Stories", id: "journeys" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium transition-all duration-200 hover:opacity-60"
              style={{ color: scrolled ? "rgba(255,255,255,0.80)" : "hsl(var(--foreground))" }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 hover:opacity-60"
            style={{ color: scrolled ? "rgba(255,255,255,0.80)" : "hsl(var(--foreground))" }}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="gradient-primary text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all duration-300 hover:scale-105"
            style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.30)" }}
          >
            Join Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: scrolled ? "#fff" : "hsl(var(--foreground))" }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 7h14M4 11h14M4 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ background: "hsl(240 10% 10%)" }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {[
            { label: "How it works", id: "how-it-works" },
            { label: "Skill Exchange", id: "skill-flow" },
            { label: "Stories", id: "journeys" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left text-sm font-medium text-white/75 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="flex gap-3 pt-2 border-t border-white/10">
            <Link
              to="/login"
              className="flex-1 text-center text-sm font-medium text-white/70 py-2.5 rounded-full border border-white/20 hover:border-white/40 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-full gradient-primary transition-all hover:opacity-90"
            >
              Join Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

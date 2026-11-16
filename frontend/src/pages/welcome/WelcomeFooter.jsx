import { Link } from "react-router-dom";

const NAV_COLS = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Skill exchange", href: "#skill-flow" },
      { label: "Live sessions", href: "/live-sessions" },
      { label: "Communities", href: "/communities" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Browse skills", href: "/skill-hunt" },
      { label: "Active swaps", href: "/barters" },
      { label: "Trending", href: "/trending" },
      { label: "Skill chat", href: "/skill-chat" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Support", href: "/support" },
      { label: "Privacy", href: "#" },
    ],
  },
];

const SOCIALS = [
  {
    label: "X",
    href: "#",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M15.751 2h2.836L12.33 8.553 19.5 18h-5.893l-4.506-5.895L3.75 18H.912l6.595-7.024L.5 2h6.047l4.083 5.338L15.751 2Zm-.994 14.4H16.5L5.286 3.6H3.536L14.757 16.4Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <rect x="2" y="2" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="14.5" cy="5.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M4.5 6.5h-3v10h3v-10ZM3 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7.5 16.5h3v-5.25c0-1.38 1.12-2.25 2.25-2.25s2.25.87 2.25 2.25v5.25h3V11.5c0-2.76-2.24-4.5-5-4.5-1.31 0-2.5.48-3.5 1.25V6.5h-2.25v10h-.25Z" />
      </svg>
    ),
  },
];

export default function WelcomeFooter() {
  const scrollTo = (id) => {
    if (id.startsWith("#")) {
      document.getElementById(id.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-base bg-primary">
              S
            </div>
            <span className="text-lg font-bold font-heading tracking-tight text-secondary-foreground">Skillfinix</span>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-secondary-foreground/70">
            A human-centered skill exchange ecosystem. Teach what you know.
            Learn what you don’t.
          </p>
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-secondary-foreground/70 border border-secondary-foreground/20 hover:text-secondary-foreground hover:bg-secondary-foreground/10 active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold text-secondary-foreground/80 mb-4">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("#") ? (
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm transition-colors text-secondary-foreground/60 hover:text-secondary-foreground text-left focus-visible:outline-2 focus-visible:outline-primary active:translate-y-px disabled:opacity-50"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm transition-colors text-secondary-foreground/60 hover:text-secondary-foreground focus-visible:outline-2 focus-visible:outline-primary active:translate-y-px"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-secondary-foreground/10 text-xs text-secondary-foreground/50">
        <p>© {new Date().getFullYear()} Skillfinix</p>
        <p>Built for people, by people.</p>
      </div>
    </footer>
  );
}

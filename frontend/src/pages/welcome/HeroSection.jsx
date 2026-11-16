import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Users,
  ShieldCheck,
  Code2,
  Palette,
  Laptop,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SWAP_PROFILES = [
  {
    from: {
      name: "Elena Vance",
      role: "Staff Product Designer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face",
      teach: "Design Systems & Figma",
      learn: "Full-Stack React & Node",
      badge: "Verified Mentor",
    },
    to: {
      name: "Liam Chen",
      role: "Senior AI Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face",
      teach: "Full-Stack React & Node",
      learn: "Design Systems & Figma",
      badge: "Top Contributor",
    },
    matchRate: "99%",
    topic: "Design ⇄ Development Sync",
  },
  {
    from: {
      name: "Sophia Martinez",
      role: "Growth & Brand Strategist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=face",
      teach: "SEO & Product Copy",
      learn: "Python for Data Science",
      badge: "12 Swaps Completed",
    },
    to: {
      name: "Marcus Aurel",
      role: "Data Scientist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face",
      teach: "Python for Data Science",
      learn: "SEO & Product Copy",
      badge: "Master Mentor",
    },
    matchRate: "98%",
    topic: "Marketing ⇄ Data Science",
  },
];

export default function HeroSection() {
  const [activeSwapIndex, setActiveSwapIndex] = useState(0);
  const currentSwap = SWAP_PROFILES[activeSwapIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSwapIndex((prev) => (prev + 1) % SWAP_PROFILES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[92dvh] flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 pt-28 pb-20 bg-background"
    >
      {/* ── Background Daylight Radial ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* ── Pill Tag ─────────────────────────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card shadow-xs mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-teach opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teach"></span>
          </span>
          <span className="text-xs font-semibold text-foreground/90 tracking-wide font-sans">
            Skillfinix 2.0 • The Peer-to-Peer Learning Economy
          </span>
          <span className="text-muted-foreground/60">|</span>
          <span className="text-xs font-medium text-primary flex items-center gap-0.5">
            Zero Tuition <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* ── Display Headline (Floor: <= 7 words, <= 50 chars) ─────────── */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] tracking-tight text-foreground leading-[1.08] max-w-4xl mb-6">
          Every person is a{" "}
          <span className="text-primary relative inline-block">
            library.
            <svg
              aria-hidden="true"
              className="absolute -bottom-2 left-0 w-full h-3 text-primary/40 -z-10"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9C50 2 150 2 198 9"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* ── Subtitle ─────────────────────────────────────────────────── */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl font-sans font-normal leading-relaxed mb-8">
          Exchange skills directly with verified peers. Learn by doing, zero tuition.
        </p>

        {/* ── Dual CTA Row ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-14">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-primary-foreground bg-primary hover:bg-primary-dark transition-colors shadow-xs active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
          >
            Start swapping free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById("bento-features");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-foreground border border-border bg-card hover:bg-muted transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-primary"
          >
            Explore how it works
          </button>
        </div>

        {/* ── High-Craft Interactive Skill Swap Preview Card ────────────── */}
        <div className="w-full max-w-3xl">
          <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden text-left relative">
            {/* Top Card Bar */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teach" />
                <span className="text-xs font-medium text-muted-foreground font-sans">
                  Live exchange
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {currentSwap.matchRate} Compatibility
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • 4,820 Active Swappers
                </span>
              </div>
            </div>

            {/* Swap Exchange Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSwapIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                  {/* Left Member */}
                  <div className="md:col-span-5 rounded-xl p-4 bg-background border border-border shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={currentSwap.from.avatar}
                        alt={currentSwap.from.name}
                        className="w-11 h-11 rounded-lg object-cover border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-foreground truncate font-heading">
                            {currentSwap.from.name}
                          </h4>
                          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentSwap.from.role}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-teach flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teach" />
                          Teaches:
                        </span>
                        <span className="font-medium text-foreground bg-teach/10 px-2 py-0.5 rounded-md border border-teach/20">
                          {currentSwap.from.teach}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-learn flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-learn" />
                          Learns:
                        </span>
                        <span className="font-medium text-foreground bg-learn/10 px-2 py-0.5 rounded-md border border-learn/20">
                          {currentSwap.from.learn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center Transfer Arrow */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                      <ArrowLeftRight className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground mt-1 hidden md:block">
                      1:1
                    </span>
                  </div>

                  {/* Right Member */}
                  <div className="md:col-span-5 rounded-xl p-4 bg-background border border-border shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={currentSwap.to.avatar}
                        alt={currentSwap.to.name}
                        className="w-11 h-11 rounded-lg object-cover border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-foreground truncate font-heading">
                            {currentSwap.to.name}
                          </h4>
                          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentSwap.to.role}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-border text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-teach flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teach" />
                          Teaches:
                        </span>
                        <span className="font-medium text-foreground bg-teach/10 px-2 py-0.5 rounded-md border border-teach/20">
                          {currentSwap.to.teach}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-learn flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-learn" />
                          Learns:
                        </span>
                        <span className="font-medium text-foreground bg-learn/10 px-2 py-0.5 rounded-md border border-learn/20">
                          {currentSwap.to.learn}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Synchronous 45-min Pair Session Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSwapIndex((p) => (p + 1) % SWAP_PROFILES.length)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Cycle next profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

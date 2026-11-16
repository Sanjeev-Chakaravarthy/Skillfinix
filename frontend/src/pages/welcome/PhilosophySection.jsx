import React from "react";
import {
  ArrowLeftRight,
  ShieldCheck,
  Radio,
  Coins,
  Sparkles,
} from "lucide-react";

export default function PhilosophySection() {
  return (
    <section
      id="bento-features"
      className="py-24 px-4 sm:px-6 bg-muted/30 border-y border-border"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-foreground tracking-tight leading-tight">
            Designed for reciprocal growth, not passive watching.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Skillfinix connects you with real builders for bidirectional skill transfers where both parties actively level up.
          </p>
        </div>

        {/* ── Asymmetric Bento Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5">
          {/* Bento Card 1: 2 Columns Large Feature */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-primary">
                Feature 01
              </span>
            </div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-3">
              True bi-directional exchange
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-8">
              Forget one-way lectures. Every barter is an equal partnership: teach a craft you’ve honed, and in turn receive dedicated hands-on coaching in a skill you need.
            </p>

            {/* Interactive Visual Element */}
            <div className="p-4 sm:p-5 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teach/10 border border-teach/20 flex items-center justify-center text-teach font-bold text-sm">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">You teach UI Architecture</div>
                  <div className="text-xs text-teach font-medium">1 Session (45 min)</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-primary">
                <span className="text-xs font-semibold hidden sm:inline">Reciprocal</span>
                <ArrowLeftRight className="w-4 h-4" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-learn/10 border border-learn/20 flex items-center justify-center text-learn font-bold text-sm">
                  B
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">They teach Backend APIs</div>
                  <div className="text-xs text-learn font-medium">1 Session (45 min)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: 1 Column - Zero Fees */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teach/10 border border-teach/20 flex items-center justify-center text-teach mb-5">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-teach">
                Feature 02
              </span>
              <h3 className="font-heading font-bold text-2xl text-foreground mt-2 mb-3">
                Zero cash currency
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                No credit cards, hourly rates, or paywalls. Your knowledge is the only currency required to trade on Skillfinix.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-teach/5 border border-teach/20 text-center">
              <span className="text-3xl font-extrabold font-display text-teach">
                100% Free
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Value-for-value peer agreements
              </p>
            </div>
          </div>

          {/* Bento Card 3: 1 Column - Live Collaborative Streams */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-5">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-destructive">
                Feature 03
              </span>
              <h3 className="font-heading font-bold text-2xl text-foreground mt-2 mb-3">
                Live interactive sessions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Coordinate pair-programming, design critiques, or language drills directly via built-in audio and video studio tools.
              </p>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border text-xs font-medium">
              <span className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2 h-2 rounded-full bg-destructive animate-ping motion-reduce:animate-none" />
                Live room
              </span>
              <span className="text-muted-foreground font-mono">00:45:12</span>
            </div>
          </div>

          {/* Bento Card 4: 2 Columns - Verified Reputation & Trust */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-primary">
                Feature 04
              </span>
            </div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-foreground mb-3">
              Verified reputation and skill proof
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mb-6">
              Build a real, tangible track record. Every completed barter leaves verified feedback on your public profile, certifying your reliability and domain skill.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="text-xl font-bold font-display text-foreground">4.9 / 5.0</div>
                <div className="text-xs text-muted-foreground">Community Quality Rating</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="text-xl font-bold font-display text-foreground">98.4%</div>
                <div className="text-xs text-muted-foreground">Swap Completion Rate</div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border col-span-2 sm:col-span-1">
                <div className="text-xl font-bold font-display text-foreground">100%</div>
                <div className="text-xs text-muted-foreground">Direct Peer to Peer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect } from "react";
import { useScrollReveal } from "./welcome/useScrollReveal";
import WelcomeNav from "./welcome/WelcomeNav";
import HeroSection from "./welcome/HeroSection";
import PhilosophySection from "./welcome/PhilosophySection";
import SkillFlowSection from "./welcome/SkillFlowSection";
import SkillJourneySection from "./welcome/SkillJourneySection";
import CTASection from "./welcome/CTASection";
import WelcomeFooter from "./welcome/WelcomeFooter";

export default function Welcome() {
  // Activate scroll-reveal on all [data-reveal] elements
  useScrollReveal("[data-reveal]", 0.12);

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
    // Prevent the main app's body styles from leaking
    document.body.style.overscrollBehavior = "auto";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  return (
    <div
      className="w-full overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sticky nav */}
      <WelcomeNav />

      {/* Sections */}
      <HeroSection />
      <PhilosophySection />
      <SkillFlowSection />
      <SkillJourneySection />
      <CTASection />
      <WelcomeFooter />
    </div>
  );
}

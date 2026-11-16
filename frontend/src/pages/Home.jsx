import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  ArrowLeftRight,
  Play,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import ProgressCard from "@/components/ProgressCard";
import SkillBarterCard from "@/components/SkillBarterCard";
import { motion } from "framer-motion";
import api from "@/api/axios";

/* ─── Stagger animation helper ──────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topBarterUsers, setTopBarterUsers] = useState([]);
  const [coursesInProgress, setCoursesInProgress] = useState([]);
  const [statsData, setStatsData] = useState({ courses: 0, learners: 0, barters: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const { data: stats } = await api.get("/courses/stats");
        setStatsData(stats);
        const { data: recommended } = await api.get("/courses/recommended");
        setRecommendedCourses(recommended || []);
        const { data: cats } = await api.get("/courses/categories");
        setCategories(cats || []);
        const { data: barters } = await api.get("/users/barters");
        setTopBarterUsers((barters || []).slice(0, 3));
        try {
          const { data: enrolled } = await api.get("/enrollments/recent?limit=3");
          setCoursesInProgress(enrolled || []);
        } catch {
          setCoursesInProgress([]);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const stats = [
    {
      icon: BookOpen,
      label: "Courses",
      value: statsData.courses > 1000 ? `${(statsData.courses / 1000).toFixed(1)}K+` : statsData.courses,
    },
    {
      icon: Users,
      label: "Learners",
      value: statsData.learners > 1000 ? `${(statsData.learners / 1000).toFixed(1)}K+` : statsData.learners,
    },
    {
      icon: ArrowLeftRight,
      label: "Swaps",
      value: statsData.barters > 1000 ? `${(statsData.barters / 1000).toFixed(1)}K+` : statsData.barters,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin motion-reduce:animate-none text-primary" />
          <p className="text-xs font-medium text-muted-foreground">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  const allCategoryTabs = ["All", ...categories];

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* ── Greeting ───────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="pt-6 mb-6">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Explore courses, exchange skills, and connect with peer mentors.
        </p>
      </motion.div>

      {/* ── Compact Two-Column Hero Banner ──────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="mb-6">
        <div
          className="relative overflow-hidden rounded-3xl py-6 px-6 sm:px-8 text-white shadow-xl"
          style={{
            background: "var(--gradient-hero)",
            boxShadow: "0 16px 40px hsl(238 84% 60% / 0.20)",
          }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Column: Title, 1-line subtitle, CTAs */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white mb-2.5 border border-white/20">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>Peer-Powered Learning Ecosystem</span>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight mb-2">
                Trade expertise. Accelerate your craft.
              </h2>

              <p className="text-xs sm:text-sm text-white/85 mb-4 line-clamp-1 max-w-lg leading-relaxed">
                Skip overpriced bootcamps. Trade high-demand skills 1-on-1 with verified engineers and creators worldwide.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to="/barters"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-primary bg-white hover:bg-white/95 transition-colors shadow-sm active:scale-[0.98]"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Find Skill Swap Partner
                </Link>
                <Link
                  to="/skill-hunt"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white border border-white/25 hover:bg-white/15 backdrop-blur-sm transition-colors active:scale-[0.98]"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Browse Catalog
                </Link>
              </div>
            </div>

            {/* Right Column: Compact Glass Stats & Quick Match Widget */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px] lg:max-w-xs shrink-0">
              {/* Glass Stats Row */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid grid-cols-3 gap-2 text-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <div className="text-lg sm:text-xl font-bold font-display text-white">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-white/75 mt-0.5">
                      <stat.icon className="h-3 w-3" />
                      <span>{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Barter Prompt Card */}
              <Link
                to="/barters"
                className="group flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">Active Swaps</p>
                    <p className="text-[10px] text-white/70 truncate">Connect with top creators</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-transform duration-150 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Ambient glow orbs */}
          <div
            className="absolute -right-16 -top-16 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)",
            }}
          />
        </div>
      </motion.div>

      {/* ── Sleek Pill Filter Bar ───────────────────────────────────── */}
      {categories.length > 0 && (
        <motion.div {...fadeUp(0.1)} className="mb-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Filter by discipline
            </span>
            <Link
              to="/skill-hunt"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              All Categories <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {allCategoryTabs.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    if (category !== "All") {
                      navigate(`/skill-hunt?category=${encodeURIComponent(category)}`);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Continue Learning ───────────────────────────────────────── */}
      {coursesInProgress.length > 0 && (
        <motion.section {...fadeUp(0.12)} className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-foreground">Continue Learning</h2>
            <Link to="/my-courses" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              All Courses <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {coursesInProgress.map((course) => (
              <div key={course._id} className="min-w-[280px] sm:min-w-[320px]">
                <ProgressCard course={course} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Top Skill Barters Feed ──────────────────────────────────── */}
      {topBarterUsers.length > 0 && (
        <motion.section {...fadeUp(0.16)} className="mb-14">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                Featured Skill Swappers
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active peers looking for bilateral skill exchanges right now
              </p>
            </div>
            <Link to="/barters" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              View All Swaps <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topBarterUsers.map((barterUser, index) => (
              <motion.div
                key={barterUser._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + index * 0.06 }}
              >
                <SkillBarterCard
                  user={barterUser}
                  onConnect={() => navigate("/barters")}
                  onMessage={() =>
                    navigate("/skill-chat", {
                      state: { selectedUserId: barterUser._id, selectedUserData: barterUser },
                    })
                  }
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Recommended Courses ─────────────────────────────────────── */}
      <motion.section {...fadeUp(0.2)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
              Recommended Courses
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top curated masterclasses from the community
            </p>
          </div>
          <Link to="/skill-hunt" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
            Explore All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + index * 0.05 }}
            >
              <CourseCard course={course} variant="featured" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Home;

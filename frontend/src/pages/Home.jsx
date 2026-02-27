import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Sparkles, TrendingUp, Users, BookOpen,
  ChevronRight, Loader2, ArrowLeftRight, Play,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import ProgressCard from "@/components/ProgressCard";
import SkillBarterCard from "@/components/SkillBarterCard";
import { motion } from "framer-motion";
import api from "@/api/axios";

/* ─── Stagger animation helper ──────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Greeting line by time ──────────────────────────────────────── */
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
    { icon: BookOpen,       label: "Courses",  value: statsData.courses  > 1000 ? `${(statsData.courses  / 1000).toFixed(1)}K+` : statsData.courses  },
    { icon: Users,          label: "Learners", value: statsData.learners > 1000 ? `${(statsData.learners / 1000).toFixed(1)}K+` : statsData.learners },
    { icon: ArrowLeftRight, label: "Swaps",    value: statsData.barters  > 1000 ? `${(statsData.barters  / 1000).toFixed(1)}K+` : statsData.barters  },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Getting things ready…</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen pb-16 px-4 lg:px-6">

      {/* ── Greeting ───────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="pt-6 mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {getGreeting()}, {firstName} 👋
        </p>
        <h1
          className="heading-display text-2xl md:text-3xl text-foreground"
        >
          What will you learn today?
        </h1>
      </motion.div>

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.06)} className="mb-8">
        <div
          className="relative overflow-hidden rounded-3xl p-7 md:p-10"
          style={{
            background: "var(--gradient-hero)",
            boxShadow: "0 20px 60px hsl(238 84% 60% / 0.28), 0 4px 16px hsl(238 84% 60% / 0.15)",
          }}
        >
          {/* Inner structure */}
          <div className="relative z-10 max-w-2xl">
            {/* Badge */}
            <div className="hero-glass-badge w-fit mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your learning journey</span>
            </div>

            {/* Headline */}
            <h2
              className="heading-display text-3xl md:text-[2.6rem] text-white mb-3 leading-[1.15]"
            >
              Every expert was once
              <br />
              a beginner.{" "}
              <span style={{ opacity: 0.75 }}>Start today.</span>
            </h2>

            <p className="text-base text-white/70 mb-7 max-w-md leading-relaxed">
              Find skills that match your goals, swap what you know,
              and grow alongside a community of real people.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/skill-hunt"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary bg-white hover:bg-white/90 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Play className="h-3.5 w-3.5" />
                Browse Skills
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/barters"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/25 hover:bg-white/12 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Start Bartering
              </Link>
            </div>

            {/* Stats strip */}
            <div
              className="flex gap-8 mt-8 pt-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="stat-pill">
                  <div className="flex items-baseline gap-1.5">
                    <span className="stat-pill-value text-white">{stat.value}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <stat.icon className="h-3.5 w-3.5 text-white/55 flex-shrink-0" />
                    <span className="text-xs font-medium text-white/60">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient glow orbs — subtle, non-blob */}
          <div
            className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)" }}
          />
          <div
            className="absolute right-16 -bottom-24 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
          />
        </div>
      </motion.div>

      {/* ── Continue Learning ───────────────────────────────────────── */}
      {coursesInProgress.length > 0 && (
        <motion.section {...fadeUp(0.12)} className="mb-10">
          <div className="section-header">
            <h2 className="section-title">Continue learning</h2>
            <Link to="/my-courses" className="section-link">
              All courses <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {coursesInProgress.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProgressCard course={course} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Browse Categories ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <motion.section {...fadeUp(0.18)} className="mb-10">
          <div className="section-header">
            <h2 className="section-title">Browse by category</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category}
                to={`/skill-hunt?category=${encodeURIComponent(category)}`}
                className="category-pill"
              >
                {category}
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Recommended for You ─────────────────────────────────────── */}
      <motion.section {...fadeUp(0.22)} className="mb-10">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recommended for you</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Based on your interests</p>
          </div>
          <Link to="/skill-hunt" className="section-link">
            Explore all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendedCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <CourseCard course={course} variant="featured" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Top Skill Barters ───────────────────────────────────────── */}
      {topBarterUsers.length > 0 && (
        <motion.section {...fadeUp(0.28)}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Top skill swappers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                People ready to exchange skills with you
              </p>
            </div>
            <Link to="/barters" className="section-link">
              Find more <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topBarterUsers.map((barterUser, index) => (
              <motion.div
                key={barterUser._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
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
    </div>
  );
};

export default Home;

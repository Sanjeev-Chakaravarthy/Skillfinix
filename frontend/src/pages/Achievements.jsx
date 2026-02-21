import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Star, Zap, Target, BookOpen, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

// Achievement definitions — computed from real data
const ACHIEVEMENT_DEFS = [
  {
    id: "first_course",
    title: "First Step",
    description: "Enroll in your first course",
    icon: "🎯",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    check: (stats) => stats.totalEnrolled >= 1,
    progress: (stats) => Math.min(100, stats.totalEnrolled * 100),
    target: 1,
    category: "Learning",
  },
  {
    id: "course_complete",
    title: "Course Conqueror",
    description: "Complete your first course",
    icon: "🏆",
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    check: (stats) => stats.completedCourses >= 1,
    progress: (stats) => Math.min(100, stats.completedCourses * 100),
    target: 1,
    category: "Learning",
  },
  {
    id: "five_courses",
    title: "Knowledge Seeker",
    description: "Enroll in 5 courses",
    icon: "📚",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    check: (stats) => stats.totalEnrolled >= 5,
    progress: (stats) => Math.round((stats.totalEnrolled / 5) * 100),
    target: 5,
    category: "Learning",
  },
  {
    id: "first_swap",
    title: "Skill Trader",
    description: "Complete your first skill swap",
    icon: "🔄",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    check: (stats) => stats.completedSwaps >= 1,
    progress: (stats) => Math.min(100, stats.completedSwaps * 100),
    target: 1,
    category: "Barter",
  },
  {
    id: "five_swaps",
    title: "Master Barterer",
    description: "Complete 5 skill swaps",
    icon: "🤝",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    check: (stats) => stats.completedSwaps >= 5,
    progress: (stats) => Math.round((stats.completedSwaps / 5) * 100),
    target: 5,
    category: "Barter",
  },
  {
    id: "profile_complete",
    title: "Identity Defined",
    description: "Add skills to your profile",
    icon: "✨",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800",
    check: (stats) => stats.hasSkills,
    progress: (stats) => (stats.hasSkills ? 100 : 0),
    target: 1,
    category: "Profile",
  },
  {
    id: "ten_courses",
    title: "Learning Legend",
    description: "Enroll in 10 courses",
    icon: "🌟",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    check: (stats) => stats.totalEnrolled >= 10,
    progress: (stats) => Math.round((stats.totalEnrolled / 10) * 100),
    target: 10,
    category: "Learning",
  },
  {
    id: "liked_5",
    title: "Curator",
    description: "Like 5 courses",
    icon: "❤️",
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    check: (stats) => stats.likedCount >= 5,
    progress: (stats) => Math.round((stats.likedCount / 5) * 100),
    target: 5,
    category: "Social",
  },
];

const Achievements = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [filter, setFilter] = useState("all"); // all | earned | locked

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [enrollRes, swapRes] = await Promise.all([
          api.get("/enrollments"),
          api.get("/swaps/stats").catch(() => ({ data: { completed: 0 } })),
        ]);

        const enrollments = enrollRes.data || [];
        const swapStats = swapRes.data || {};

        setStats({
          totalEnrolled: enrollments.length,
          completedCourses: enrollments.filter((e) => (e.progress || 0) >= 100).length,
          completedSwaps: swapStats.completed || 0,
          hasSkills: (user?.skills?.length || 0) > 0 || (user?.interests?.length || 0) > 0,
          likedCount: 0, // will be fetched from interactions
        });

        // Fetch liked interactions count
        try {
          const likedRes = await api.get("/interactions/like");
          setStats((prev) => ({ ...prev, likedCount: likedRes.data?.courses?.length || 0 }));
        } catch {
          // ignore
        }
      } catch {
        setStats({ totalEnrolled: 0, completedCourses: 0, completedSwaps: 0, hasSkills: false, likedCount: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const achievementsWithStatus = ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    earned: def.check(stats),
    progressVal: Math.min(100, def.progress(stats)),
  }));

  const earned = achievementsWithStatus.filter((a) => a.earned);
  const locked = achievementsWithStatus.filter((a) => !a.earned);

  const displayed = filter === "earned" ? earned : filter === "locked" ? locked : achievementsWithStatus;
  const level = earned.length <= 1 ? "Beginner" : earned.length <= 3 ? "Intermediate" : earned.length <= 6 ? "Advanced" : "Master";
  const levelIcon = { Beginner: "🌱", Intermediate: "🚀", Advanced: "⚡", Master: "👑" }[level];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Achievements</h1>
        </div>
        <p className="text-muted-foreground">Track your learning milestones and skill progress.</p>
      </div>

      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-3xl gradient-hero relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Your Level</p>
              <h2 className="text-3xl font-bold text-primary-foreground flex items-center gap-2">
                {levelIcon} {level}
              </h2>
            </div>
            <div className="text-right text-primary-foreground">
              <div className="text-4xl font-bold">{earned.length}</div>
              <div className="text-sm opacity-80">/ {achievementsWithStatus.length} earned</div>
            </div>
          </div>

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
              <span>Progress to next level</span>
              <span>{Math.round((earned.length / achievementsWithStatus.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(earned.length / achievementsWithStatus.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary-foreground rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      </motion.div>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["Learning", "Barter", "Profile"].map((cat) => {
          const catTotal = achievementsWithStatus.filter((a) => a.category === cat).length;
          const catEarned = earned.filter((a) => a.category === cat).length;
          return (
            <div key={cat} className="bg-card rounded-2xl p-4 border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{catEarned}/{catTotal}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{cat}</div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
        {[
          { key: "all", label: `All (${achievementsWithStatus.length})` },
          { key: "earned", label: `Earned (${earned.length})` },
          { key: "locked", label: `Locked (${locked.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayed.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06 }}
            className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ${
              achievement.earned
                ? `${achievement.bgColor} ${achievement.borderColor} shadow-sm`
                : "bg-muted/30 border-border opacity-70"
            }`}
          >
            {/* Earned glow */}
            {achievement.earned && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-5 pointer-events-none" />
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  achievement.earned
                    ? `bg-gradient-to-br ${achievement.color} shadow-md`
                    : "bg-muted"
                }`}
              >
                {achievement.earned ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-semibold text-sm ${achievement.earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {achievement.title}
                  </h3>
                  {achievement.earned && (
                    <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      ✓ Earned
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                <span className="text-xs text-muted-foreground/70 mt-0.5 block">{achievement.category}</span>
              </div>
            </div>

            {/* Progress bar (for locked achievements) */}
            {!achievement.earned && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{achievement.progressVal}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all duration-700"
                    style={{ width: `${achievement.progressVal}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Go earn more CTA */}
      {earned.length < achievementsWithStatus.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            {achievementsWithStatus.length - earned.length} more achievements to unlock
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/skill-hunt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </Link>
            <Link
              to="/my-swaps"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Start a Swap
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Achievements;

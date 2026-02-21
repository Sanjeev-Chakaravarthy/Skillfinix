import React, { useState, useEffect } from "react";
import {
  Search, Grid, List, SlidersHorizontal, Loader2,
  TrendingUp, Flame, Star, ArrowRight, Zap, Award
} from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { useSearchParams, Link } from "react-router-dom";

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Newest", "Oldest", "Most Popular", "Highest Rated"];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const PopularityBadge = ({ views, enrolledCount }) => {
  const score = (views || 0) + (enrolledCount || 0) * 5;
  if (score > 100) return (
    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
      <Flame className="w-3 h-3" /> Popular
    </span>
  );
  if (score > 30) return (
    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      <TrendingUp className="w-3 h-3" /> Trending
    </span>
  );
  if (enrolledCount > 0) return (
    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
      <Star className="w-3 h-3" /> In Demand
    </span>
  );
  return null;
};

const SkillHunt = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState({ courses: [], trendingSkills: [], categoryStats: [] });
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "All Levels");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "Newest");

  // UI
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const params = {};
    if (searchQuery) params.keyword = searchQuery;
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (selectedLevel !== "All Levels") params.level = selectedLevel;
    if (sortBy !== "Newest") params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  // 1. Fetch Categories from DB
  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data.filter(Boolean)))
      .catch(() => {
        // Fallback: try legacy courses/categories
        api.get('/courses/categories').then(r => setCategories(
          r.data.filter(Boolean).map(name => ({ name }))
        )).catch(() => {});
      });
  }, []);

  // 2. Fetch Trending Data
  useEffect(() => {
    setTrendingLoading(true);
    api.get('/trending')
      .then(r => setTrending(r.data || {}))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  // 3. Fetch Courses (debounced)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("keyword", searchQuery);
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (selectedLevel !== "All Levels") params.append("level", selectedLevel);
        params.append("sort", sortBy);
        const { data } = await api.get(`/courses?${params.toString()}`);
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchCourses, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  const trendingCourses = trending.courses?.slice(0, 4) || [];
  const trendingSkills = trending.trendingSkills?.slice(0, 12) || [];

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold md:text-3xl font-heading text-foreground"
        >
          Skill Hunt 🎯
        </motion.h1>
        <p className="mt-1 text-muted-foreground">
          Discover skills, find exchange partners, and level up your abilities
        </p>
      </div>

      {/* 🔥 TRENDING SECTION */}
      {!trendingLoading && (trendingCourses.length > 0 || trendingSkills.length > 0) && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Trending Courses */}
          {trendingCourses.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-heading font-bold text-foreground">🔥 Most Popular Skills</h2>
                </div>
                <Link
                  to="/trending"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingCourses.map((course, i) => (
                  <motion.div
                    key={course._id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                  >
                    <Link to={`/course/${course._id}`} className="block group">
                      <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-28 gradient-primary flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-white/40" />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-xs text-foreground line-clamp-2 flex-1">{course.title}</h3>
                            <PopularityBadge views={course.views} enrolledCount={course.enrolledCount} />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {course.views || 0} views · {course.enrolledCount || 0} enrolled
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Swap Skills */}
          {trendingSkills.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-heading font-bold text-foreground">High Demand Swap Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSkills.map((s, i) => (
                  <motion.button
                    key={s.skill}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    onClick={() => setSearchQuery(s.skill)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-medium text-foreground shadow-card transition-all"
                  >
                    {i < 3 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                    {s.skill}
                    <span className="text-xs text-muted-foreground">×{s.swapCount}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 mb-6 border bg-card rounded-2xl border-border"
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <form className="flex-1" onSubmit={e => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, courses, instructors..."
                className="w-full h-12 pl-12 pr-4 transition-all border outline-none bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>

          {/* Filters toggle + View */}
          <div className="flex items-center gap-3">
            <CustomButton
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters
            </CustomButton>
            <div className="flex items-center p-1 rounded-lg bg-muted">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-md transition-colors", viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50")}
              >
                <Grid className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-md transition-colors", viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50")}
              >
                <List className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 space-y-4 border-t border-border">
                {/* Dynamic Categories from DB */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        selectedCategory === "All"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      All
                    </button>
                    {categories.map((cat) => {
                      const name = cat.name || cat;
                      return (
                        <button
                          key={name}
                          onClick={() => setSelectedCategory(name)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            selectedCategory === name
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Level</label>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          selectedLevel === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 px-3 text-sm border rounded-lg bg-muted border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {sortOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{courses.length}</span> skills
          {selectedCategory !== "All" && (
            <span> in <span className="font-medium text-primary">{selectedCategory}</span></span>
          )}
        </p>
        {selectedCategory !== "All" && (
          <button
            onClick={() => setSelectedCategory("All")}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-muted">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No skills found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={cn("gap-5", viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4"
        )}>
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <CourseCard
                course={course}
                variant={viewMode === "grid" ? "featured" : "compact"}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillHunt;
import React, { useState, useEffect } from "react";
import { Search, Grid, List, SlidersHorizontal, Loader2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { useSearchParams } from "react-router-dom";

// Static options for Level and Sort
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Newest", "Oldest", "Most Popular", "Highest Rated"];

const SkillHunt = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for Data
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize State from URL or Defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get("keyword") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level") || "All Levels");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "Newest");

  // UI State
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL with State (Optional but good for UX)
  useEffect(() => {
    const params = {};
    if (searchQuery) params.keyword = searchQuery;
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (selectedLevel !== "All Levels") params.level = selectedLevel;
    if (sortBy !== "Newest") params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  // 1. Fetch Dynamic Categories on Load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/courses/categories');
        setCategories(data.filter(Boolean));
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Courses (Debounced)
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

    const timer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Fetch is triggered by useEffect on searchQuery change
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold md:text-3xl font-heading text-foreground"
        >
          Skill Hunt 🎯
        </motion.h1>
        <p className="mt-1 text-muted-foreground">
          Discover courses to level up your skills
        </p>
      </div>

      {/* Search and Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 mb-6 border bg-card rounded-2xl border-border"
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, skills, instructors..."
                className="w-full h-12 pl-12 pr-4 transition-all border outline-none bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>

          {/* Filter Toggle & View Mode */}
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
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-card shadow-sm"
                    : "hover:bg-card/50"
                )}
              >
                <Grid className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-card shadow-sm"
                    : "hover:bg-card/50"
                )}
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
                {/* DYNAMIC CATEGORIES */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Category
                  </label>
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
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Level
                  </label>
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
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 px-3 text-sm border rounded-lg bg-muted border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
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
          Showing{" "}
          <span className="font-medium text-foreground">
            {courses.length}
          </span>{" "}
          courses
        </p>
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
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No courses found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "gap-5",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
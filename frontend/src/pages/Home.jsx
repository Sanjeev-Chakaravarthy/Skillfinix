import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Play,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import ProgressCard from "@/components/ProgressCard";
import SkillBarterCard from "@/components/SkillBarterCard";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import api from "@/api/axios";

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
        // Fetch stats
        const { data: stats } = await api.get('/courses/stats');
        setStatsData(stats);

        // Fetch recommended courses
        const { data: recommended } = await api.get('/courses/recommended');
        setRecommendedCourses(recommended || []);

        // Fetch categories
        const { data: cats } = await api.get('/courses/categories');
        setCategories(cats || []);

        // Fetch top barter users (limit to 3)
        const { data: barters } = await api.get('/users/barters');
        setTopBarterUsers((barters || []).slice(0, 3));

        // Fetch REAL in-progress courses from enrollment data
        try {
          const { data: enrolled } = await api.get('/enrollments/recent?limit=3');
          setCoursesInProgress(enrolled || []);
        } catch (enrollErr) {
          console.log("No enrollment data yet:", enrollErr.message);
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
    { icon: BookOpen, label: "Courses", value: statsData.courses > 1000 ? `${(statsData.courses / 1000).toFixed(1)}K+` : statsData.courses },
    { icon: Users, label: "Learners", value: statsData.learners > 1000 ? `${(statsData.learners / 1000).toFixed(1)}K+` : statsData.learners },
    { icon: TrendingUp, label: "Barters", value: statsData.barters > 1000 ? `${(statsData.barters / 1000).toFixed(1)}K+` : statsData.barters },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 mt-2 md:mt-2"
      >
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          Hi, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Ready to learn something new?
        </p>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 mb-8"
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/20 backdrop-blur-sm text-primary-foreground text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Continue Your Journey</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-heading font-bold text-primary-foreground mb-3 leading-tight">
            Transform Your Skills Into Superpowers
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md">
            Learn from experts, exchange skills with peers, and unlock
            your full potential with our interactive platform.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/skill-hunt">
              <CustomButton
                variant="secondary"
                size="lg"
                rightIcon={<Play className="h-4 w-4" />}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                Resume Learning
              </CustomButton>
            </Link>
            <Link to="/barters">
              <CustomButton
                variant="ghost"
                size="lg"
                className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                Start Bartering
              </CustomButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-8 pt-6 border-t border-primary-foreground/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-primary-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="h-4 w-4 opacity-80" />
                  <span className="text-2xl font-bold">
                    {stat.value}
                  </span>
                </div>
                <span className="text-sm opacity-80">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary/30 blur-3xl opacity-50" />
        <div className="absolute -right-10 -bottom-20 w-60 h-60 rounded-full bg-primary-light/20 blur-3xl opacity-30" />
      </motion.div>

      {/* Continue Learning — REAL PROGRESS from enrollment DB */}
      {coursesInProgress.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Continue Learning
            </h2>
            <Link
              to="/my-courses"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {coursesInProgress.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProgressCard course={course} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-5">
            Browse Categories
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category}
                to={`/skill-hunt?category=${encodeURIComponent(category)}`}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all text-sm font-medium text-foreground hover:shadow-sm"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Recommended for You
          </h2>
          <Link
            to="/skill-hunt"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Explore more <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recommendedCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CourseCard course={course} variant="featured" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Skill Barters */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Top Skill Barters
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect and exchange skills with talented people
            </p>
          </div>
          <Link
            to="/barters"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Find more <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topBarterUsers.map((barterUser, index) => (
            <motion.div
              key={barterUser._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SkillBarterCard 
                user={barterUser} 
                onConnect={() => navigate('/barters')}
                onMessage={() => navigate('/skill-chat', { state: { selectedUserId: barterUser._id, selectedUserData: barterUser } })}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Play, Clock, Trophy, Zap, TrendingUp,
  Star, ArrowRight, CheckCircle, BarChart2, Flame
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

const SkeletonCard = () => (
  <div className="rounded-2xl bg-muted animate-pulse h-40" />
);

const ProgressBar = ({ value, className = '' }) => (
  <div className={`w-full h-2 rounded-full bg-muted overflow-hidden ${className}`}>
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(value, 100)}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' } }),
};

export default function StartLearning() {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [enrollRes, trendRes] = await Promise.all([
          api.get('/enrollments'),
          api.get('/trending'),
        ]);
        setEnrolled(enrollRes.data || []);
        setTrending((trendRes.data || []).slice(0, 6));
      } catch (e) {
        console.error('StartLearning fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const inProgress = enrolled.filter((c) => c.progress > 0 && !c.completed);
  const notStarted = enrolled.filter((c) => c.progress === 0);
  const completed = enrolled.filter((c) => c.completed);

  // Recently accessed = sorted by lastWatchedAt
  const recentlyAccessed = [...enrolled]
    .sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt))
    .slice(0, 4);

  // Stats
  const totalProgress =
    enrolled.length > 0
      ? Math.round(enrolled.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolled.length)
      : 0;

  // Recommended: trending courses the user is NOT enrolled in
  const enrolledIds = new Set(enrolled.map((c) => c._id?.toString()));
  const recommended = trending.filter((c) => !enrolledIds.has(c._id?.toString())).slice(0, 6);

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden rounded-3xl p-8 md:p-10 gradient-hero text-white shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-yellow-300" /> Your Learning Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-white/80 max-w-lg mb-5 text-sm md:text-base">
            You've enrolled in <strong>{enrolled.length}</strong> course{enrolled.length !== 1 ? 's' : ''}.
            {completed.length > 0 && ` You've completed ${completed.length}. Keep it up!`}
            {inProgress.length > 0 && !completed.length && ` ${inProgress.length} in progress — keep the streak alive!`}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{enrolled.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Enrolled</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-white/70 mt-0.5">Completed</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-3 text-center">
              <p className="text-2xl font-bold">{totalProgress}%</p>
              <p className="text-xs text-white/70 mt-0.5">Avg Progress</p>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
      </motion.div>

      {/* Overall Progress */}
      {enrolled.length > 0 && (
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="mb-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Overall Progress</h2>
            </div>
            <span className="text-sm font-bold text-primary">{totalProgress}%</span>
          </div>
          <ProgressBar value={totalProgress} />
          <p className="text-xs text-muted-foreground mt-2">
            Across all {enrolled.length} enrolled courses
          </p>
        </motion.div>
      )}

      {/* Continue Learning */}
      {(loading || inProgress.length > 0) && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-bold text-foreground">Continue Learning</h2>
            </div>
            <Link to="/my-courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : inProgress.slice(0, 3).map((course, i) => (
                <motion.div
                  key={course._id}
                  variants={fadeUp} initial="hidden" animate="visible" custom={i}
                >
                  <Link to={`/course/${course._id}`} className="block group">
                    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-36 gradient-primary flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-white/50" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-foreground truncate mb-1">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {course.instructor || 'Instructor'}
                        </p>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-bold text-primary">{course.progress}%</span>
                        </div>
                        <ProgressBar value={course.progress} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </section>
      )}

      {/* Recently Accessed Skills */}
      {(loading || recentlyAccessed.length > 0) && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-bold text-foreground">Recently Accessed Skills</h2>
          </div>
          <div className="flex flex-col gap-3">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse h-16" />
              ))
              : recentlyAccessed.map((course, i) => (
                <motion.div key={course._id} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
                  <Link
                    to={`/course/${course._id}`}
                    className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 group"
                  >
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{getTimeAgo(course.lastWatchedAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{course.progress}%</span>
                      <div className="w-24">
                        <ProgressBar value={course.progress} />
                      </div>
                    </div>
                    {course.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </Link>
                </motion.div>
              ))}
          </div>
        </section>
      )}

      {/* Not Started */}
      {notStarted.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-heading font-bold text-foreground">Ready to Start</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notStarted.slice(0, 3).map((course, i) => (
              <motion.div key={course._id} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
                <Link to={`/course/${course._id}`} className="block group">
                  <div className="rounded-2xl border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-12 h-12 object-cover rounded-xl" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.instructor || 'Instructor'}</p>
                      </div>
                    </div>
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                      Not started
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Skills */}
      {recommended.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-bold text-foreground">Recommended for You</h2>
            </div>
            <Link to="/skill-hunt" className="text-sm text-primary hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((course, i) => (
              <motion.div key={course._id} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
                <Link to={`/course/${course._id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-32 gradient-primary flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-primary font-semibold mb-1">{course.category || 'Skill'}</p>
                      <h3 className="font-semibold text-sm text-foreground truncate mb-1">{course.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{course.enrolledCount || 0} learners</span>
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {course.rating ? course.rating.toFixed(1) : '4.5'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && enrolled.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No courses yet!</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start your learning journey by enrolling in a course on Skill Hunt.
          </p>
          <Link
            to="/skill-hunt"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" /> Browse Courses
          </Link>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListVideo, Play, Clock, BookOpen, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";

const Playlists = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/enrollments");
        setEnrollments(data || []);
      } catch {
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Group by category to create "playlists"
  const categoryGroups = enrollments.reduce((acc, item) => {
    const course = item.course || item;
    const cat = course.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = { name: cat, items: [], totalProgress: 0 };
    acc[cat].items.push({ ...item, course });
    acc[cat].totalProgress += item.progress || 0;
    return acc;
  }, {});

  const playlists = Object.values(categoryGroups).map((g) => ({
    ...g,
    avgProgress: g.items.length > 0 ? Math.round(g.totalProgress / g.items.length) : 0,
    completedCount: g.items.filter((i) => (i.progress || 0) >= 100).length,
  }));

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => (e.progress || 0) >= 100).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ListVideo className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-foreground">Playlists</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Courses grouped by category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {totalCourses > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Courses", value: totalCourses, icon: BookOpen, color: "text-blue-500" },
            { label: "Completed", value: completedCourses, icon: Play, color: "text-green-500" },
            { label: "Categories", value: playlists.length, icon: ListVideo, color: "text-purple-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-4 border border-border">
              <div className={`flex items-center gap-2 mb-1 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ListVideo className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No playlists yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Enroll in courses to build your playlist library.
          </p>
          <Link
            to="/skill-hunt"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Find Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {playlists.map((playlist, idx) => (
            <motion.div
              key={playlist.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              {/* Playlist Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-4">
                  {/* Thumbnail Grid Preview */}
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {playlist.items[0]?.course?.thumbnail ? (
                      <img
                        src={playlist.items[0].course.thumbnail}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListVideo className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                      <span className="text-card text-xs font-bold">{playlist.items.length}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {playlist.items.length} course{playlist.items.length !== 1 ? "s" : ""} •{" "}
                      {playlist.completedCount} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Overall progress */}
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-foreground">{playlist.avgProgress}%</div>
                    <div className="text-xs text-muted-foreground">avg progress</div>
                  </div>

                  <Link
                    to={`/skill-hunt?category=${encodeURIComponent(playlist.name)}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-3.5 h-3.5 fill-primary-foreground" />
                    Resume
                  </Link>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5 py-2 bg-muted/30">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-700"
                    style={{ width: `${playlist.avgProgress}%` }}
                  />
                </div>
              </div>

              {/* Course list (first 3) */}
              <div className="divide-y divide-border">
                {playlist.items.slice(0, 3).map((item) => {
                  const course = item.course || item;
                  return (
                    <Link key={course._id} to={`/course/${course._id}`}>
                      <div className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors group">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{course.instructor}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {course.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {course.duration}
                            </span>
                          )}
                          <span className="text-xs font-medium text-primary">{item.progress || 0}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {playlist.items.length > 3 && (
                  <div className="px-5 py-3 text-sm text-muted-foreground text-center">
                    +{playlist.items.length - 3} more courses
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Eye, Clock, Video as VideoIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | in_progress | completed
  const { user } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Fetch all enrolled courses (these are the user's videos)
        const { data } = await api.get("/enrollments");
        setVideos(data || []);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filtered = videos.filter((v) => {
    if (filter === "in_progress") return v.progress < 100;
    if (filter === "completed") return v.progress >= 100;
    return true;
  });

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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <VideoIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">My Videos</h1>
        </div>
        <p className="text-muted-foreground ml-13">
          All courses and videos in your library.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
        {[
          { key: "all", label: `All (${videos.length})` },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
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

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No videos yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Start watching courses to see them here.
          </p>
          <Link
            to="/skill-hunt"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, idx) => {
            const course = item.course || item;
            const progress = item.progress || 0;

            return (
              <motion.div
                key={item._id || course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/course/${course._id}`}>
                  <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <VideoIcon className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Progress overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-primary fill-primary ml-0.5" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      {course.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-foreground/80 backdrop-blur-sm">
                          <span className="text-xs font-medium text-card flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </div>
                      )}

                      {/* Completed badge */}
                      {progress >= 100 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-green-500/90 backdrop-blur-sm">
                          <span className="text-xs font-medium text-white">✓ Done</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {course.views != null && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {course.views} views
                          </span>
                        )}
                        {course.level && (
                          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {course.level}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-primary">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Videos;

import React from "react";
import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ProgressCard = ({ course, className }) => {
  const progress = course.progress || 0;

  // Use real duration from DB — no fake calculation
  const durationLabel = course.duration || null;

  return (
    <Link to={`/course/${course._id || course.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative min-w-[280px] max-w-[320px] bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

          {/* Play button */}
          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="h-4 w-4 text-primary fill-primary ml-0.5" />
          </div>

          {/* Duration badge — only shown if real duration exists in DB */}
          {durationLabel && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-foreground/80 backdrop-blur-sm rounded-lg flex items-center gap-1">
              <Clock className="h-3 w-3 text-card/80" />
              <span className="text-xs font-medium text-card">
                {durationLabel}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h4>

          <div className="flex items-center gap-2 mt-2">
            <img
              src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'I')}&background=6366f1&color=fff&size=32`}
              alt={course.instructor}
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=I&background=6366f1&color=fff&size=32`; }}
            />
            <span className="text-sm text-muted-foreground">
              {course.instructor}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default React.memo(ProgressCard);

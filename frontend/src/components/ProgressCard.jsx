import React from "react";
import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ProgressCard = ({ course, className }) => {
  const progress = course.progress || 0;
  const timeLeft = `${Math.round((100 - progress) * 0.4)}m left`;

  const handleResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Resume learning:", course.id);
  };

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
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

          {/* Play button */}
          <button
            onClick={handleResume}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-card/95 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-card transition-colors group-hover:scale-110"
          >
            <Play className="h-4 w-4 text-primary fill-primary ml-0.5" />
          </button>

          {/* Time left badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-card/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h4>

          <div className="flex items-center gap-2 mt-2">
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="w-5 h-5 rounded-full object-cover"
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

export default ProgressCard;

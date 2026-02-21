import React from "react";
import { Link } from "react-router-dom";
import { Clock, Users, BookOpen, Play } from "lucide-react";
import RatingStars from "./RatingStars";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'I')}&background=6366f1&color=fff&size=32`;

const formatCount = (n) => {
  if (!n || n === 0) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const CourseCard = ({ course, variant = "default", className }) => {
  const tags = Array.isArray(course.tags) ? course.tags : [];
  const enrolledLabel = formatCount(course.enrolledCount ?? course.enrolled);

  if (variant === "compact") {
    return (
      <Link to={`/course/${course._id || course.id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex gap-4 p-3 bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer",
            className
          )}
        >
          <div className="relative flex-shrink-0 w-24 h-16 overflow-hidden rounded-lg bg-muted">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="object-cover w-full h-full"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground line-clamp-1">
              {course.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {course.instructor}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={course.rating} size="sm" showValue={false} />
              {course.rating > 0 && (
                <span className="text-xs text-muted-foreground">{Number(course.rating).toFixed(1)}</span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link to={`/course/${course._id || course.id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          className={cn(
            "group relative bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden",
            className
          )}
        >
          {/* Thumbnail */}
          <div className="relative overflow-hidden aspect-video bg-muted">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-10 h-10 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-foreground/60 to-transparent group-hover:opacity-100" />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
              <div className="flex items-center justify-center rounded-full shadow-lg w-14 h-14 bg-card/90 backdrop-blur-sm">
                <Play className="w-6 h-6 ml-1 text-primary fill-primary" />
              </div>
            </div>

            {/* Duration badge — only if real duration exists */}
            {course.duration && (
              <div className="absolute px-2 py-1 rounded-md bottom-3 right-3 bg-foreground/80 backdrop-blur-sm">
                <span className="text-xs font-medium text-card">{course.duration}</span>
              </div>
            )}

            {/* Level badge */}
            {course.level && (
              <div className="absolute px-2 py-1 rounded-md top-3 left-3 bg-primary/90 backdrop-blur-sm">
                <span className="text-xs font-medium text-primary-foreground">{course.level}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h3 className="text-lg font-semibold transition-colors font-heading text-foreground line-clamp-2 group-hover:text-primary">
              {course.title}
            </h3>

            {course.instructor && (
              <div className="flex items-center gap-2 mt-3">
                <img
                  src={course.instructorAvatar || avatarFallback(course.instructor)}
                  alt={course.instructor}
                  className="object-cover w-6 h-6 rounded-full"
                  onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback(course.instructor); }}
                />
                <span className="text-sm text-muted-foreground">{course.instructor}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="sm" />
              {enrolledLabel && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">{enrolledLabel}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/course/${course._id || course.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video bg-muted">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          {/* Duration badge — only if real duration stored in DB */}
          {course.duration && (
            <div className="absolute px-2 py-1 rounded-md bottom-2 right-2 bg-foreground/80 backdrop-blur-sm">
              <span className="text-xs font-medium text-card">{course.duration}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium transition-colors text-foreground line-clamp-2 group-hover:text-primary">
            {course.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{course.instructor}</p>
          <div className="mt-2">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="sm" />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.duration}
              </div>
            )}
            {course.level && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.level}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default React.memo(CourseCard);

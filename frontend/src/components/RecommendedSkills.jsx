import React from "react";
import CourseCard from "./CourseCard";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const RecommendedSkills = ({ courses = [], currentId, loading }) => {

  const displayCourses = courses.filter(c => c._id !== currentId).slice(0, 10);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <h3 className="font-bold font-heading text-lg mb-4 opacity-50">Suggested Skills</h3>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex gap-3 animate-pulse">
            <div className="w-40 h-24 bg-muted/40 rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-muted/40 rounded w-full" />
              <div className="h-4 bg-muted/40 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayCourses.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold font-heading text-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Suggested Skills
        </h3>
      </div>
      
      <div className="space-y-4">
        {displayCourses.map((course, idx) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
          >
            <Link to={`/course/${course._id}`} className="flex gap-3 items-start group-hover:bg-muted/30 p-2 -m-2 rounded-xl transition-colors">
              <div className="relative w-40 min-w-[160px] aspect-video rounded-xl overflow-hidden bg-muted">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
                {course.duration && (
                  <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm">
                    {course.duration}
                  </span>
                )}
              </div>
              <div className="flex flex-col py-0.5">
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {course.instructor}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground/80">
                  <span>{course.views || 0} views • {new Date(course.createdAt).getFullYear()}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RecommendedSkills);

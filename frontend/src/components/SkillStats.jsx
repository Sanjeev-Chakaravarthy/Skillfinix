import React from "react";
import { Users, Eye, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const formatDate = (dateString) => {
  if (!dateString) return;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const SkillStats = ({ course, className }) => {
  if (!course) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50 font-medium">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-foreground">{course.views?.toLocaleString() || 0}</span> Views
      </div>
      
      <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50 font-medium">
        <Users className="w-4 h-4 text-sky-500" />
        <span className="text-foreground">{course.enrolledCount?.toLocaleString() || 0}</span> Swaps Active
      </div>

      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4 opacity-70" />
        <span>Posted {formatDate(course.createdAt)}</span>
      </div>
    </div>
  );
};

export default React.memo(SkillStats);

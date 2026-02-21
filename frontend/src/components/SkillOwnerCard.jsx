import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, MessageCircle, Star } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { useAuth } from "@/context/AuthContext";

const SkillOwnerCard = ({ course, onMessageClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!course) return null;

  // Prevent users from following themselves or messaging themselves
  const isOwner = user?.id === course.user || user?._id === course.user;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-4">
        <Link to={`/profile/${course.user}`} className="relative group block rounded-full overflow-hidden shrink-0 shadow-sm border border-border/60">
          <img
            src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor || 'I')}&background=6366f1&color=fff&size=56`}
            alt={course.instructor}
            className="w-14 h-14 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=I&background=6366f1&color=fff&size=56`; }}
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        
        <div>
          <Link to={`/profile/${course.user}`} className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
            {course.instructor}
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 
            Skill Owner
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      {!isOwner && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <CustomButton
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm flex-1 sm:flex-none"
            onClick={onMessageClick}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </CustomButton>
          
          <CustomButton
            variant="default"
            size="sm"
            className="rounded-full px-6 flex-1 sm:flex-none shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
            onClick={() => {}} // Usually a toggle follow hook
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Follow
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillOwnerCard);

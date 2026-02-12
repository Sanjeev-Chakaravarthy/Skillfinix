import React from "react";
import { MessageCircle, MapPin, Briefcase } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const SkillBarterCard = ({ user, className, onConnect, onMessage }) => {
  const skills = user.skills || [];
  const interests = user.interests || [];

  // Helper to fix image URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "https://github.com/shadcn.png";
    if (avatarPath.startsWith("http")) return avatarPath;
    return `http://localhost:5005${avatarPath}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 border border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={getAvatarUrl(user.avatar)}
            alt={user.name}
            className="object-cover border w-14 h-14 rounded-xl border-border bg-muted"
          />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-base font-semibold truncate font-heading text-foreground">
            {user.name}
          </h4>
          
          {/* Metadata Section */}
          <div className="flex flex-col gap-1 mt-1">
            {/* Role */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3 shrink-0 opacity-70" />
              <span className="truncate">{user.role || "Student"}</span>
            </div>

            {/* Location */}
            {user.location && user.location !== "Earth" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0 opacity-70" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
        {user.bio || "No bio available."}
      </p>

      {/* Skills Section */}
      <div className="mt-4 space-y-3">
        {/* Can Teach */}
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Can teach
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.length > 0 ? (
              skills.slice(0, 3).map((skill, i) => (
                <span 
                  key={i} 
                  className="px-2 py-1 text-xs font-medium border rounded-md bg-primary/5 text-primary border-primary/10"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs italic text-muted-foreground">
                No skills listed
              </span>
            )}
            {skills.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Wants to Learn */}
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Wants to learn
          </div>
          <div className="flex flex-wrap gap-1.5">
            {interests.length > 0 ? (
              interests.slice(0, 3).map((skill, i) => (
                <span 
                  key={i} 
                  className="px-2 py-1 text-xs font-medium border rounded-md bg-secondary/5 text-secondary border-secondary/10"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs italic text-muted-foreground">
                No interests listed
              </span>
            )}
            {interests.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground">
                +{interests.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
        <button 
          onClick={onMessage}
          className="p-2 transition-colors border rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/50 group/btn"
          title="Send Message"
        >
          <MessageCircle className="w-4 h-4 transition-colors group-hover/btn:text-primary" />
        </button>
        <CustomButton 
          variant="gradient" 
          size="sm" 
          className="flex-1 h-9" 
          onClick={() => onConnect(user._id)}
        >
          Connect
        </CustomButton>
      </div>
    </motion.div>
  );
};

export default SkillBarterCard;
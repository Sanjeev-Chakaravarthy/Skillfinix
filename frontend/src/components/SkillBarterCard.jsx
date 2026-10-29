import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, MapPin, Briefcase, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CustomButton } from "./CustomButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";
import { resolveMediaUrl } from "@/config/api";

const SkillBarterCard = ({ user, className }) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  const skills = user?.skills || [];
  const interests = user?.interests || [];

  // Resolve the MongoDB _id safely — handles both string IDs and ObjectId objects
  const userId = user?._id?.toString?.() || user?._id || user?.id || null;
  const isOwner =
    currentUser?.id === userId ||
    currentUser?._id === userId ||
    currentUser?._id?.toString() === userId;

  const fetchFollowStatus = useCallback(async () => {
    if (!userId || isOwner || !currentUser) return;
    try {
      const { data } = await api.get(`/users/${userId}/follow-status`);
      setIsFollowing(data.isFollowing ?? false);
    } catch (err) {
      console.warn("[SkillBarterCard] Could not load follow status:", err?.message);
    } finally {
      setStatusLoaded(true);
    }
  }, [userId, isOwner, currentUser]);

  useEffect(() => {
    setStatusLoaded(false);
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  const handleFollow = async (e) => {
    e.preventDefault();
    console.log("[handleFollow] Click fired");
    console.log("[handleFollow] Target userId:", userId);

    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to follow this user.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!userId) {
      console.error("[handleFollow] Error: userId is undefined or null");
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    const prevFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    setFollowLoading(true);

    try {
      console.log(`[handleFollow] Sending POST request to /api/users/${userId}/follow`);
      const { data } = await api.post(`/users/${userId}/follow`);
      console.log("[handleFollow] Success response:", data);
      setIsFollowing(data.isFollowing);
      
      toast({
        title: data.isFollowing ? "Following! 🎉" : "Unfollowed",
        description: data.isFollowing
          ? `You are now following ${user.name || "this user"}.`
          : `You unfollowed ${user.name || "this user"}.`,
      });
    } catch (err) {
      console.error("[handleFollow] Request failed:", err);
      console.error("[handleFollow] Error response:", err.response?.data);
      setIsFollowing(prevFollowing);
      const msg = err?.response?.data?.message || "Failed to update follow status.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to send a message.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!userId) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    setMessageLoading(true);
    try {
      // Create or ensure conversation exists properly
      const { data: conversation } = await api.post(`/conversations`, { receiverId: userId });
      
      navigate(`/chat/${conversation._id}`, {
        state: {
          selectedUserId: userId,
          selectedUserData: user,
          conversationId: conversation?._id
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to open chat.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setMessageLoading(false);
    }
  };

  if (!user) return null;

  // Helper to fix image URL
  const getAvatarUrl = (avatarPath) => {
    return resolveMediaUrl(avatarPath, "https://github.com/shadcn.png");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 border border-border h-full flex flex-col",
        className
      )}
    >
      {/* Header — avatar + name are clickable links to the user's profile */}
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {userId ? (
            <Link to={`/profile/${userId}`} className="block rounded-xl overflow-hidden ring-0 hover:ring-2 hover:ring-primary/40 transition-all">
              <img
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="object-cover border w-14 h-14 rounded-xl border-border bg-muted group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          ) : (
            <img
              src={getAvatarUrl(user.avatar)}
              alt={user.name}
              className="object-cover border w-14 h-14 rounded-xl border-border bg-muted"
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {userId ? (
            <Link
              to={`/profile/${userId}`}
              className="text-base font-semibold truncate font-heading text-foreground hover:text-primary transition-colors block"
            >
              {user.name}
            </Link>
          ) : (
            <h4 className="text-base font-semibold truncate font-heading text-foreground">
              {user.name}
            </h4>
          )}
          
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
      <div className="my-4 space-y-3">
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
      {!isOwner && (
        <div className="flex items-center gap-3 pt-4 mt-auto border-t border-border">
          <button 
            onClick={handleMessage}
            disabled={messageLoading}
            className="p-2 transition-colors border rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/50 group/btn"
            title="Send Message"
          >
            {messageLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <MessageCircle className="w-4 h-4 transition-colors group-hover/btn:text-primary" />
            )}
          </button>
          <CustomButton 
            variant={isFollowing ? "outline" : "gradient"}
            size="sm" 
            className="flex-1 h-9 font-semibold" 
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isFollowing ? (
              <UserCheck className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </CustomButton>
        </div>
      )}
    </motion.div>
  );
};

export default SkillBarterCard;
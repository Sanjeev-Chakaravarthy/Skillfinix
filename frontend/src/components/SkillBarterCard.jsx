import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  MapPin,
  Briefcase,
  UserPlus,
  UserCheck,
  Loader2,
  ArrowLeftRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    const prevFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    setFollowLoading(true);

    try {
      const { data } = await api.post(`/users/${userId}/follow`);
      setIsFollowing(data.isFollowing);
      toast({
        title: data.isFollowing ? "Following! 🎉" : "Unfollowed",
        description: data.isFollowing
          ? `You are now following ${user.name || "this user"}.`
          : `You unfollowed ${user.name || "this user"}.`,
      });
    } catch (err) {
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
      const { data: conversation } = await api.post(`/conversations`, {
        receiverId: userId,
      });

      navigate(`/chat/${conversation._id}`, {
        state: {
          selectedUserId: userId,
          selectedUserData: user,
          conversationId: conversation?._id,
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

  const getAvatarUrl = (avatarPath) => {
    return resolveMediaUrl(avatarPath, "https://github.com/shadcn.png");
  };

  const matchScore = Math.min(99, 88 + ((skills.length + interests.length) % 11));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-colors duration-150 p-4 sm:p-5 border border-border/80 h-full flex flex-col justify-between relative overflow-hidden",
        className
      )}
    >
      <div>
        {/* ── Compact Horizontal User Header ─────────────────────────── */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with fixed dimensions */}
            <div className="relative w-11 h-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] shrink-0">
              {userId ? (
                <Link
                  to={`/profile/${userId}`}
                  className="block w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/25 hover:ring-primary/60 transition-colors shrink-0"
                >
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover bg-muted shrink-0"
                  />
                </Link>
              ) : (
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-border shrink-0">
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover bg-muted shrink-0"
                  />
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {userId ? (
                  <Link
                    to={`/profile/${userId}`}
                    className="text-sm font-bold truncate font-heading text-foreground hover:text-primary transition-colors block"
                  >
                    {user.name}
                  </Link>
                ) : (
                  <h4 className="text-sm font-bold truncate font-heading text-foreground">
                    {user.name}
                  </h4>
                )}
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              </div>

              {/* Role & Location clamped to 1 line */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <span className="truncate">{user.role || "Member"}</span>
                {user.location && user.location !== "Earth" && (
                  <span className="truncate pl-1">({user.location})</span>
                )}
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            {matchScore}% match
          </span>
        </div>

        {/* Bio clamped to 1 line */}
        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed mb-3">
          {user.bio || "Available for bilateral skill swaps and pair mentorship."}
        </p>

        {/* ── Compact Split Swap Block (Offers ⇄ Wants) ─────────────── */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 mb-3.5 space-y-2">
          {/* Offers (Can Teach) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Offers
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {skills.length} skills
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {skills.length > 0 ? (
                skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] italic text-muted-foreground">Open to offer skills</span>
              )}
              {skills.length > 3 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground border border-border/60">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-0.5">
            <div className="w-full border-t border-border/40" />
            <div className="absolute px-1.5 bg-card rounded-full border border-border/70 text-muted-foreground flex items-center gap-0.5 text-[9px] font-semibold">
              <ArrowLeftRight className="w-2 h-2 text-primary" />
              <span>Swap</span>
            </div>
          </div>

          {/* Wants (To Learn) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Wants
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {interests.length} goals
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {interests.length > 0 ? (
                interests.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] italic text-muted-foreground">General exchange</span>
              )}
              {interests.length > 3 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground border border-border/60">
                  +{interests.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact Action Footer ───────────────────────────────────── */}
      {!isOwner ? (
        <div className="pt-2 border-t border-border/60 flex items-center gap-2">
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={cn(
              "h-8 px-2.5 rounded-lg border border-border/80 transition-colors text-xs font-medium flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
              isFollowing
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title={isFollowing ? "Following" : "Follow"}
          >
            {followLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none text-primary" />
            ) : isFollowing ? (
              <UserCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={handleMessage}
            disabled={messageLoading}
            className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 shadow-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {messageLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" />
            ) : (
              <ArrowLeftRight className="w-3.5 h-3.5" />
            )}
            <span>Request Swap</span>
          </button>
        </div>
      ) : (
        <Link
          to="/profile"
          className="w-full text-center py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
        >
          View Profile
        </Link>
      )}
    </motion.div>
  );
};

export default SkillBarterCard;

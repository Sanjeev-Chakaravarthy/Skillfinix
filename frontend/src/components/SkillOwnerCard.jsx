import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, UserCheck, MessageCircle, Star, Loader2, Users } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";

const SkillOwnerCard = ({ course, onMessageClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── State ────────────────────────────────────────────────────────────────────
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  // ── Derived values ───────────────────────────────────────────────────────────
  if (!course) return null;

  // Safely extract the string ID — course.user may be a plain string or a populated ObjectId object
  const instructorId =
    course.user?._id?.toString?.() || course.user?._id || course.user || null;

  // Prevent self-actions
  const isOwner =
    user?.id === instructorId ||
    user?._id === instructorId ||
    user?._id?.toString() === instructorId;

  // ── Fetch initial follow status ──────────────────────────────────────────────
  const fetchFollowStatus = useCallback(async () => {
    if (!instructorId || isOwner || !user) return;

    try {
      const { data } = await api.get(`/users/${instructorId}/follow-status`);
      setIsFollowing(data.isFollowing ?? false);
      setFollowerCount(data.followerCount ?? 0);
    } catch (err) {
      // Silently fail — don't block the UI
      console.warn("[SkillOwnerCard] Could not load follow status:", err?.message);
    } finally {
      setStatusLoaded(true);
    }
  }, [instructorId, isOwner, user]);

  useEffect(() => {
    setStatusLoaded(false);
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  // ── Follow Handler ───────────────────────────────────────────────────────────
  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow this creator.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!instructorId) {
      toast({ title: "Error", description: "Creator not found.", variant: "destructive" });
      return;
    }

    // Optimistic update
    const prevFollowing = isFollowing;
    const prevCount = followerCount;
    setIsFollowing(!isFollowing);
    setFollowerCount((c) => (isFollowing ? Math.max(0, c - 1) : c + 1));
    setFollowLoading(true);

    try {
      const { data } = await api.post(`/users/${instructorId}/follow`);

      // Sync with server response
      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount ?? (isFollowing ? Math.max(0, prevCount - 1) : prevCount + 1));

      toast({
        title: data.isFollowing ? "Following! 🎉" : "Unfollowed",
        description: data.isFollowing
          ? `You are now following ${course.instructor || "this creator"}.`
          : `You unfollowed ${course.instructor || "this creator"}.`,
      });
    } catch (err) {
      // Rollback on error
      setIsFollowing(prevFollowing);
      setFollowerCount(prevCount);
      const msg = err?.response?.data?.message || "Failed to update follow status.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Message Handler ──────────────────────────────────────────────────────────
  const handleMessage = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to send a message.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!instructorId) {
      toast({ title: "Error", description: "Creator not found.", variant: "destructive" });
      return;
    }

    // If parent passed an override handler, use it
    if (onMessageClick) {
      onMessageClick();
      return;
    }

    setMessageLoading(true);
    try {
      // Get or create the conversation
      const { data } = await api.post(`/users/${instructorId}/conversation`);
      const otherUser = data.otherUser;

      // Navigate to SkillChat with the pre-loaded user data
      navigate("/skill-chat", {
        state: {
          selectedUserId: instructorId,
          selectedUserData: otherUser,
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to open chat.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setMessageLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-4">
        <Link
          to={instructorId ? `/profile/${instructorId}` : "#"}
          className="relative group block rounded-full overflow-hidden shrink-0 shadow-sm border border-border/60"
        >
          <img
            src={
              course.instructorAvatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                course.instructor || "I"
              )}&background=6366f1&color=fff&size=56`
            }
            alt={course.instructor}
            className="w-14 h-14 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=I&background=6366f1&color=fff&size=56`;
            }}
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <div>
          <Link
            to={instructorId ? `/profile/${instructorId}` : "#"}
            className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
          >
            {course.instructor}
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Skill Owner
          </p>
          {/* Follower count — only show after status is loaded and not self */}
          {statusLoaded && !isOwner && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              <span>
                {followerCount.toLocaleString()}{" "}
                {followerCount === 1 ? "follower" : "followers"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions — hidden if viewing your own content */}
      {!isOwner && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

          {/* Message Button */}
          <CustomButton
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm flex-1 sm:flex-none"
            onClick={handleMessage}
            disabled={messageLoading}
            aria-label="Send message to creator"
          >
            {messageLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="mr-2 h-4 w-4" />
            )}
            {messageLoading ? "Opening…" : "Message"}
          </CustomButton>

          {/* Follow / Following Button */}
          <CustomButton
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={[
              "rounded-full px-6 flex-1 sm:flex-none transition-all font-semibold",
              isFollowing
                ? "border-primary text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                : "shadow-md shadow-primary/20 hover:shadow-primary/40",
            ].join(" ")}
            onClick={handleFollow}
            disabled={followLoading}
            aria-label={isFollowing ? "Unfollow this creator" : "Follow this creator"}
          >
            {followLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <UserCheck className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillOwnerCard);

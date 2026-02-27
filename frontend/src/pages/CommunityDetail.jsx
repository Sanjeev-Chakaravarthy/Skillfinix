import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, MessageSquare, Heart, Send, Loader2,
  AlertCircle, Globe2, Plus, Calendar, MoreVertical, Edit2, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmModal, CommunityModal } from "./Communities";

/* ─── Avatar helper ─────────────────────────────────────────────── */
const avatarUrl = (u) =>
  u?.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "U")}&background=6366f1&color=fff&size=80&bold=true`;

/* ─── Date formatter ────────────────────────────────────────────── */
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtRelative = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmt(d);
};

/* ─── Image helper ───────────────────────────────────────────────── */
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("/uploads")) {
    return `http://localhost:5005${url}`;
  }
  return url;
}; // Added helper for backend images

/* ─── Skeleton ───────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

/* ─── Post Card ──────────────────────────────────────────────────── */
function PostCard({ post, communityId, currentUserId, onLikeToggle }) {
  const isLiked = post.likes?.some(
    (l) => (l._id || l)?.toString() === currentUserId?.toString()
  );
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    setLiking(true);
    try {
      const { data } = await api.put(
        `/communities/${communityId}/posts/${post._id}/like`
      );
      onLikeToggle(post._id, data);
    } catch {
      // silent
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-3"
    >
      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl(post.user)}
          alt={post.user?.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">
            {post.user?.name || "Community Member"}
          </p>
          <p className="text-xs text-muted-foreground">{fmtRelative(post.createdAt)}</p>
        </div>
      </div>

      {/* Post text */}
      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
        {post.text}
      </p>

      {/* Like */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleLike}
          disabled={liking || !currentUserId}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg ${
            isLiked
              ? "text-red-500 bg-red-50"
              : "text-muted-foreground hover:text-red-500 hover:bg-red-50/50"
          } disabled:opacity-50`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          {post.likes?.length || 0}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── COMMUNITY DETAIL PAGE ─────────────────────────────────────── */
const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [community, setCommunity]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [postText, setPostText]     = useState("");
  const [posting, setPosting]       = useState(false);
  const [joining, setJoining]       = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState(null); // holds {id, name}
  const [isDeleting, setIsDeleting] = useState(false);
  const textRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    fetchCommunity();
  }, [id]);

  const fetchCommunity = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/communities/${id}`);
      setCommunity(data);
    } catch (err) {
      if (err?.response?.status === 404) {
        setError("This community doesn't exist or has been removed.");
      } else {
        setError("Could not load community. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isMember = community?.members?.some(
    (m) => (m._id || m)?.toString() === currentUserId?.toString()
  );

  const isCreator = community?.createdBy?._id?.toString() === currentUserId?.toString();

  const handleJoin = async () => {
    if (!user) {
      toast({ title: "Sign in to join communities" });
      return;
    }
    setJoining(true);
    try {
      const { data } = await api.put(`/communities/${id}/join`);
      toast({ title: data.message });
      setCommunity((prev) => {
        const members = data.isMember
          ? [...prev.members, { _id: currentUserId, name: user.name, avatar: user.avatar }]
          : prev.members.filter((m) => (m._id || m)?.toString() !== currentUserId?.toString());
        return { ...prev, members };
      });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  const handleSaved = (updatedCommunity) => {
    setCommunity(updatedCommunity);
    toast({ title: `"${updatedCommunity.name}" updated!` });
  };

  const confirmDelete = async () => {
    if (!communityToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/communities/${communityToDelete.id}`);
      toast({ title: `"${communityToDelete.name}" deleted.` });
      setCommunityToDelete(null);
      navigate("/communities", { replace: true });
    } catch (err) {
      toast({ title: "Failed to delete community.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    if (!isMember) {
      toast({ title: "Join this hub first to post" });
      return;
    }
    setPosting(true);
    try {
      const { data: newPost } = await api.post(`/communities/${id}/posts`, {
        text: postText.trim(),
      });
      setCommunity((prev) => ({
        ...prev,
        posts: [newPost, ...(prev.posts || [])],
      }));
      setPostText("");
      textRef.current?.focus();
    } catch (err) {
      toast({
        title: err?.response?.data?.message || "Failed to post",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLikeToggle = (postId, likeData) => {
    setCommunity((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p._id === postId ? { ...p, likes: likeData.likes } : p
      ),
    }));
  };

  /* ── Loading ────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <button
          onClick={() => navigate("/communities")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Communities
        </button>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(var(--destructive) / 0.10)" }}
          >
            <AlertCircle className="w-7 h-7" style={{ color: "hsl(var(--destructive))" }} />
          </div>
          <h2 className="font-heading font-semibold text-xl text-foreground">{error}</h2>
          <div className="flex gap-3">
            <button
              onClick={fetchCommunity}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all"
            >
              Try again
            </button>
            <Link
              to="/communities"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary transition-all hover:-translate-y-0.5"
            >
              Browse communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 pb-20">
      <AnimatePresence>
        {communityToDelete && (
          <ConfirmModal
            isOpen={!!communityToDelete}
            onClose={() => setCommunityToDelete(null)}
            onConfirm={confirmDelete}
            title="Delete Hub?"
            message={`Are you sure you want to permanently delete "${communityToDelete.name}"? This action cannot be undone and all posts will be lost.`}
            isDeleting={isDeleting}
          />
        )}
        {editingCommunity && (
          <CommunityModal
            initialData={community}
            onClose={() => setEditingCommunity(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Back */}
      <Link
        to="/communities"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Communities
      </Link>

      {/* Cover hero or Gradient Fallback */}
      <div className="relative w-full h-48 md:h-60 rounded-3xl overflow-hidden mb-8 flex items-center justify-center bg-muted">
        {community.coverImage ? (
          <>
            <img
              src={resolveImageUrl(community.coverImage)}
              alt={community.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/80 to-purple-600/80 flex items-center justify-center overflow-hidden">
            <span className="text-7xl md:text-9xl font-heading font-bold text-white/90 uppercase drop-shadow-md opacity-30 right-10 absolute pointer-events-none -translate-y-4">
              {community.name.charAt(0)}
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
        )}

        {/* Category + Title overlay */}
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
          <div>
            <span className="inline-block mb-2 px-2.5 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[11px] font-semibold text-white/90 border border-white/10 uppercase tracking-wider">
              {community.category}
            </span>
            <h1 className="heading-display text-2xl md:text-3xl text-white leading-tight">
              {community.name}
            </h1>
          </div>
          
          {/* Creator edit dropdown overlay */}
          {isCreator && (
            <div className="relative z-20">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-2 md:p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 transition-colors border border-white/10"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); }} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute bottom-full right-0 mb-2 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                    >
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setEditingCommunity(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Hub
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setCommunityToDelete({ id: community._id, name: community.name }); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Posts feed ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Post composer */}
          {user && (
            <form
              onSubmit={handlePost}
              className="bg-card border border-border rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={avatarUrl(user)}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <textarea
                  ref={textRef}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={
                    isMember
                      ? "Share something with this community…"
                      : "Join this hub to post"
                  }
                  disabled={!isMember || posting}
                  rows={2}
                  maxLength={1000}
                  className="flex-1 resize-none text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>
              {isMember && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {postText.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={posting || !postText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-primary transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                    style={{ boxShadow: "0 3px 10px hsl(var(--primary) / 0.25)" }}
                  >
                    {posting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Post
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Posts list */}
          {!community.posts || community.posts.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <MessageSquare
                className="w-8 h-8 opacity-20"
                style={{ color: "hsl(var(--foreground))" }}
              />
              <p className="text-sm text-muted-foreground">
                No posts yet.{" "}
                {isMember ? "Be the first to share something!" : "Join to start the conversation."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {community.posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  communityId={id}
                  currentUserId={currentUserId}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ─────────────────────────────────── */}
        <div className="space-y-5">

          {/* About */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <h3 className="text-sm font-heading font-semibold text-foreground">About</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {community.description}
            </p>
            <div className="space-y-2.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <strong className="text-foreground">{community.members?.length || 0}</strong> members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>
                  <strong className="text-foreground">{community.posts?.length || 0}</strong> posts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {fmt(community.createdAt)}</span>
              </div>
            </div>

            {/* Creator */}
            {community.createdBy && (
              <div className="flex items-center gap-2.5 pt-1 border-t border-border/50">
                <img
                  src={avatarUrl(community.createdBy)}
                  alt={community.createdBy.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="text-xs">
                  <p className="text-muted-foreground">Created by</p>
                  <p className="font-semibold text-foreground">{community.createdBy.name}</p>
                </div>
              </div>
            )}

            {/* Join / Leave */}
            <button
              onClick={handleJoin}
              disabled={joining}
              className={`w-full h-10 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isMember
                  ? "border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
                  : "gradient-primary text-white hover:-translate-y-0.5"
              } disabled:opacity-60 disabled:translate-y-0`}
              style={!isMember ? { boxShadow: "0 3px 12px hsl(var(--primary) / 0.25)" } : {}}
            >
              {joining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isMember ? (
                "Leave Hub"
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Join Hub
                </>
              )}
            </button>
          </div>

          {/* Members */}
          {community.members && community.members.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-heading font-semibold text-foreground mb-4">
                Members
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({community.members.length})
                </span>
              </h3>
              <div className="space-y-3">
                {community.members.slice(0, 8).map((member) => (
                  <div key={member._id} className="flex items-center gap-2.5">
                    <img
                      src={avatarUrl(member)}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {member.name}
                    </span>
                    {(member._id || member)?.toString() === community.createdBy?._id?.toString() && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "hsl(var(--primary) / 0.10)",
                          color: "hsl(var(--primary))",
                        }}
                      >
                        Creator
                      </span>
                    )}
                  </div>
                ))}
                {community.members.length > 8 && (
                  <p className="text-xs text-muted-foreground">
                    +{community.members.length - 8} more members
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;

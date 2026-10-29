import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Modular Components
import SkillVideoPlayer from "@/components/player/SkillVideoPlayer";
import SkillStats from "@/components/SkillStats";
import SkillActions from "@/components/SkillActions";
import SkillOwnerCard from "@/components/SkillOwnerCard";
import DiscussionSection from "@/components/DiscussionSection";
import RecommendedSkills from "@/components/RecommendedSkills";
import DeleteConfirmModal from "@/components/studio/DeleteConfirmModal";

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // ── Theater mode lives HERE so it can affect the outer layout ──────────────
  const [isTheater, setIsTheater] = useState(false);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── ESC key exits theater mode ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isTheater) {
        setIsTheater(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTheater]);

  // ── Lock / unlock body scroll in theater mode ──────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isTheater ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isTheater]);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: courseData } = await api.get(`/courses/${id}`);
        setCourse(courseData);

        const { data: recData } = await api.get('/courses/recommended');
        setRecommended(recData || []);

        // Auto-enroll in DB when arriving on page quietly (needed for progress tracking)
        // We leave enrollment intact so students can track progress, but this no longer triggers views.
        try { await api.post('/enrollments', { courseId: id }); } catch (e) {}

        // Check toggles quietly based on real schema arrays if user exists
        if (user && courseData) {
          const userId = user.id || user._id;
          const isLiked = courseData.likes?.includes(userId);
          const isDisliked = courseData.dislikes?.includes(userId);
          
          setLiked(!!isLiked);
          setDisliked(!!isDisliked);
          setLikesCount(courseData.likes?.length || 0);
        }

      } catch (err) {
        console.error("Error fetching skill session:", err);
        setError("Failed to load skill session. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, user]);

  const handleToggleLike = async () => {
    if (!user) return toast({ title: "Please login to like", variant: "destructive" });
    try {
      const { data } = await api.post(`/courses/${id}/like`);
      setLiked(data.isLiked);
      setDisliked(data.isDisliked);
      setLikesCount(data.likes);
    } catch (err) {
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  const handleToggleDislike = async () => {
    if (!user) return toast({ title: "Please login to dislike", variant: "destructive" });
    try {
      const { data } = await api.post(`/courses/${id}/dislike`);
      setLiked(data.isLiked);
      setDisliked(data.isDisliked);
      setLikesCount(data.likes);
    } catch (err) {
      toast({ title: "Failed to update dislike", variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    try {
      const { data } = await api.get(`/courses/${id}/download`);
      if (data.downloadUrl) {
          toast({ title: "Download starting..." });
          window.location.href = data.downloadUrl;
      }
    } catch (err) {
      toast({ title: "Error downloading video", description: err.response?.data?.message || "", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/courses/${id}`);
      toast({ title: "Video deleted successfully" });
      setDeleteModalOpen(false);
      navigate("/studio/content"); 
    } catch (err) {
      toast({
        title: "Error deleting video",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const instructorId = course?.user?._id?.toString?.() || course?.user?._id || course?.user || null;
  const isOwner = user?.id === instructorId || user?._id === instructorId || user?._id?.toString() === instructorId;

  return (
    <>
      {/* ── Theater Mode Overlay (backdrop) ────────────────────────────────── */}
      <AnimatePresence>
        {isTheater && (
          <motion.div
            key="theater-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={() => setIsTheater(false)} // click outside video to exit
          />
        )}
      </AnimatePresence>

      {/* ── Main Page Layout ────────────────────────────────────────────────── */}
      <div
        className={
          isTheater
            ? "fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            : "max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-8 lg:gap-10 min-h-screen"
        }
      >
        {/* Left Column (Main Content) */}
        <motion.div
          layout
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={
            isTheater
              ? "w-full max-w-[95vw] pointer-events-auto"
              : "w-full xl:w-[72%] max-w-[1100px] mx-auto xl:mx-0 flex flex-col gap-5"
          }
        >
          {/* The YouTube-like Skill Player */}
          <SkillVideoPlayer
            course={course}
            loading={loading}
            error={error}
            isTheater={isTheater}
            onToggleTheater={() => setIsTheater((v) => !v)}
          />

          {/* Content below player — hidden in theater mode */}
          {!isTheater && !loading && course && (
            <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading text-foreground leading-tight">
                {course.title}
              </h1>

              {/* Stats & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <SkillStats course={course} />
                <SkillActions
                  isOwner={isOwner}
                  courseId={course._id}
                  liked={liked}
                  disliked={disliked}
                  likesCount={likesCount}
                  onToggleLike={handleToggleLike}
                  onToggleDislike={handleToggleDislike}
                  onDownload={handleDownload}
                  onOpenDeleteModal={() => setDeleteModalOpen(true)}
                />
              </div>

              {/* Profile Bar */}
              <SkillOwnerCard course={course} />

              {/* Expandable Description */}
              {course.description && (
                <div className="bg-muted/40 hover:bg-muted/60 transition-colors rounded-2xl p-4 sm:p-5 border border-border/40 text-sm mt-2 shadow-sm relative">
                  <div className={`text-foreground/90 whitespace-pre-wrap leading-relaxed ${!showFullDesc ? "line-clamp-2" : ""}`}>
                    {course.description}
                  </div>
                  {course.description.length > 150 && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="mt-2 font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      {showFullDesc ? "Show Less" : "Show More"}
                      {showFullDesc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )}

              {/* Discussions / Comments */}
              <DiscussionSection courseId={id} />
            </div>
          )}
        </motion.div>

        {/* Right Column (Sidebar) — hidden in theater mode */}
        {!isTheater && (
          <motion.div
            layout
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full xl:w-[28%] xl:min-w-[350px]"
          >
            <div className="xl:sticky xl:top-24 space-y-6">
              <RecommendedSkills courses={recommended} currentId={id} loading={loading} />
            </div>
          </motion.div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemTitle={course?.title}
      />
    </>
  );
};

export default WatchVideo;

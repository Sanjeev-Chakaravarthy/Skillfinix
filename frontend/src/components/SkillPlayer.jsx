import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";

const SkillPlayer = ({ course, loading, error, className }) => {
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const { toast } = useToast();

  // Track video progress and update enrollment
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !course) return;

    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      if (duration > 0) {
        const progress = Math.min(Math.round((currentTime / duration) * 100), 100);
        
        // Debounce: only update every 30 seconds
        if (!progressIntervalRef.current) {
          progressIntervalRef.current = setInterval(async () => {
            try {
              const vid = videoRef.current;
              if (!vid) return;
              const p = Math.min(Math.round((vid.currentTime / vid.duration) * 100), 100);
              await api.put(`/enrollments/${course._id}/progress`, { 
                progress: p,
                watchedDuration: 30 // 30 seconds of watch time
              });
            } catch (err) {
              // Silently handle progress update errors
            }
          }, 30000); // Every 30 seconds
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    // Update progress on video end
    const handleEnded = async () => {
      try {
        await api.put(`/enrollments/${course._id}/progress`, { progress: 100 });
        toast({ title: "Skill Session Completed! 🎉", description: "Great job finishing this session!" });
      } catch (err) {
        console.log("Final progress update error:", err);
      }
    };
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [course, toast]);

  if (loading) {
    return (
      <div className={`w-full aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border border-border/50 animate-pulse ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">Loading specific session...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`w-full aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border border-dashed border-border/50 ${className}`}>
        <p className="font-semibold text-foreground">Something went wrong</p>
        <p className="text-sm text-muted-foreground">{error || "Course not found"}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-border/40 ${className}`}
    >
      <video
        ref={videoRef}
        src={course.videoUrl}
        poster={course.thumbnail}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain bg-black"
        style={{ borderRadius: "inherit" }}
      >
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
};

export default React.memo(SkillPlayer);

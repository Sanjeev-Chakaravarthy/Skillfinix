import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Forward, Rewind } from "lucide-react";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import PlayerControls from "./PlayerControls";

const SkillVideoPlayer = ({ course, loading, error, className }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const { toast } = useToast();

  // Non-destructive UI states
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [skipAction, setSkipAction] = useState(null); // 'forward' | 'backward'
  const [aspectRatio, setAspectRatio] = useState("auto");

  // =========================================================================
  // Control Visibility Handlers
  // =========================================================================
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    
    // Only auto-hide if video is playing
    if (videoRef.current && !videoRef.current.paused) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, []);

  // =========================================================================
  // Keyboard & DOM Setup
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in a comment box
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
      
      const v = videoRef.current;
      if (!v) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          v.muted = !v.muted;
          break;
      }
      resetHideControlsTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetHideControlsTimer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // =========================================================================
  // DB Synchronized Progress Saving (THROTTLED every 5 seconds)
  // =========================================================================
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !course) return;

    // Load initial playback state ONLY ONCE precisely (skip to previous watch time)
    if (course.progress && course.progress > 0 && course.progress < 100) {
      const initSeek = () => {
        v.currentTime = (course.progress / 100) * v.duration;
        v.removeEventListener('loadedmetadata', initSeek);
      };
      if (v.readyState >= 1) initSeek();
      else v.addEventListener('loadedmetadata', initSeek);
    }

    // Buffer and Layout Handlers
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => setIsBuffering(false);
    const handleMeta = () => {
      if (v.videoWidth && v.videoHeight) {
        setAspectRatio(`${v.videoWidth}/${v.videoHeight}`);
      }
    };

    if (v.readyState >= 3) setIsBuffering(false);
    if (v.readyState >= 1) handleMeta();

    // 5-Second Throttled Sync - prevents spamming React State / Server
    const startSync = () => {
      handlePlaying();
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.duration === 0) return;
        
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        try {
          // If ~90% watched, mark complete silently to unlock achievements earlier
          await api.put(`/enrollments/${course._id}/progress`, { 
            progress: p > 90 ? 100 : p,
            watchedDuration: 5 
          });
        } catch (err) { /* silent fail */ }
      }, 5000); // 5 seconds strictly
    };

    const handleEnded = async () => {
      try {
        await api.put(`/enrollments/${course._id}/progress`, { progress: 100 });
        toast({ title: "Skill Session Completed! 🎉", description: "You mastered this skill!" });
      } catch (err) {}
      setShowControls(true);
      setIsBuffering(false);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    v.addEventListener('waiting', handleWaiting);
    v.addEventListener('playing', startSync);
    v.addEventListener('canplay', handleCanPlay);
    v.addEventListener('error', handleError);
    v.addEventListener('loadedmetadata', handleMeta);
    v.addEventListener('pause', () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); setShowControls(true); setIsBuffering(false); });
    v.addEventListener('ended', handleEnded);

    return () => {
      v.removeEventListener('waiting', handleWaiting);
      v.removeEventListener('playing', startSync);
      v.removeEventListener('canplay', handleCanPlay);
      v.removeEventListener('error', handleError);
      v.removeEventListener('loadedmetadata', handleMeta);
      v.removeEventListener('ended', handleEnded);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [course, toast]);


  // =========================================================================
  // Player Actions
  // =========================================================================
  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
    resetHideControlsTimer();
  };

  const handleSkip = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || 0));
    setSkipAction(seconds > 0 ? "forward" : "backward");
    setTimeout(() => setSkipAction(null), 500); // Trigger animation teardown
    resetHideControlsTimer();
  };

  const toggleFullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleTheaterMode = () => setIsTheaterMode(!isTheaterMode);

  const toggleMiniPlayer = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch (err) {
      toast({ title: "Focus Mode blocked by browser policy.", variant: "destructive" });
    }
  };

  // =========================================================================
  // Rendering Flow
  // =========================================================================
  if (loading) {
    return (
      <div className={cn("w-full aspect-video bg-muted/20 rounded-2xl flex items-center justify-center animate-pulse", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error || !course) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => { if (videoRef.current && !videoRef.current.paused) setShowControls(false); }}
      className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black group flex flex-col font-sans",
        isTheaterMode ? "fixed inset-0 z-50 rounded-none w-screen h-screen align-center justify-center p-0 m-0" : "",
        isFullscreen && "rounded-none border-none",
        className
      )}
      style={!isTheaterMode && !isFullscreen ? { aspectRatio, margin: 0, padding: 0 } : {}}
    >
      {/* 
        MAIN VIDEO TRACK 
        Stays strictly `contain`
      */}
      <video
        ref={videoRef}
        src={course.videoUrl}
        poster={course.thumbnail}
        preload="metadata"
        onClick={togglePlayPause}
        className="relative w-full h-full object-contain cursor-pointer z-0 opacity-100"
        playsInline
        style={{ width: "100%", height: "100%" }}
      />

      {/* DOUBLE TAP ACTION UI (10s Skips) */}
      <AnimatePresence>
        {skipAction && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: skipAction === 'forward' ? 50 : -50 }}
            animate={{ opacity: 1, scale: 1.2, x: skipAction === 'forward' ? 100 : -100 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className={cn(
               "absolute top-1/2 -translate-y-1/2 z-10 p-5 bg-black/50 backdrop-blur-md rounded-full pointer-events-none shadow-lg",
               skipAction === 'forward' ? 'right-1/4' : 'left-1/4'
            )}
          >
            {skipAction === 'forward' ? <Forward className="w-12 h-12 text-white" /> : <Rewind className="w-12 h-12 text-white" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVISIBLE DOUBLE TAP INTERCEPTORS */}
      <div 
        className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" 
        onDoubleClick={(e) => { e.preventDefault(); handleSkip(-10); }} 
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" 
        onDoubleClick={(e) => { e.preventDefault(); handleSkip(10); }} 
      />

      {/* HUGE BUFFERING SPINNER (Center) */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
           <div className="w-[70px] h-[70px] rounded-full bg-black/50 flex flex-col items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
             <div className="w-[30px] h-[30px] border-[3px] border-white/80 border-t-transparent rounded-full animate-spin" />
           </div>
        </div>
      )}

      {/* LAYER 3: RUTHLESSLY MODULAR PLAYER CONTROLS */}
      <PlayerControls 
        videoRef={videoRef}
        title={course.title}
        showControls={showControls}
        isFullscreen={isFullscreen}
        isTheaterMode={isTheaterMode}
        togglePlayPause={togglePlayPause}
        toggleFullscreen={toggleFullscreen}
        toggleTheaterMode={toggleTheaterMode}
        toggleMiniPlayer={toggleMiniPlayer}
      />
    </div>
  );
};

export default React.memo(SkillVideoPlayer);

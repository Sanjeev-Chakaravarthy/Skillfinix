import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Forward, Rewind } from "lucide-react";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Custom Sub-components for Video Player
import ProgressBar from "./skill-player/ProgressBar";
import VolumeControl from "./skill-player/VolumeControl";
import PlaybackSettings from "./skill-player/PlaybackSettings";

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const h = Math.floor(timeInSeconds / 3600);
  const m = Math.floor((timeInSeconds % 3600) / 60);
  const s = Math.floor(timeInSeconds % 60);
  if (h > 0) return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  return `${m}:${s < 10 ? "0" + s : s}`;
};

const SkillPlayer = ({ course, loading, error, className }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const { toast } = useToast();

  // Core Video State
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(true);

  // UI State
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeepLearnMode, setIsDeepLearnMode] = useState(false);
  
  // Double tap UI
  const [skipAction, setSkipAction] = useState(null); // 'forward' | 'backward' | null

  // --------------------------------------------------------------------------
  // Keyboard & Mouse Listeners
  // --------------------------------------------------------------------------
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
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
          toggleMute();
          break;
      }
      resetHideControlsTimer();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // --------------------------------------------------------------------------
  // Video API Actions
  // --------------------------------------------------------------------------
  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const handleSkip = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || 0));
    triggerSkipAnimation(seconds > 0 ? "forward" : "backward");
  };

  const triggerSkipAnimation = (dir) => {
    setSkipAction(dir);
    setTimeout(() => setSkipAction(null), 500);
  };

  const handlePointerSeek = (time) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (newVol) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && v.muted) {
      v.muted = false;
      setMuted(false);
    }
  };

  const changePlaybackRate = (rate) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
    }
  };

  const toggleFocusMode = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
      toast({ title: "Focus Mode not supported on this browser.", variant: "destructive" });
    }
  };

  // --------------------------------------------------------------------------
  // DB Progress Tracking Sync
  // --------------------------------------------------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !course) return;

    // Load initial playback state
    if (course.progress > 0 && course.progress < 100 && v.duration) {
      v.currentTime = (course.progress / 100) * v.duration;
    }

    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.duration > 0) {
        // DB Debounce Sync every 30s
        if (!progressIntervalRef.current) {
          progressIntervalRef.current = setInterval(async () => {
            try {
              if (!videoRef.current) return;
              const p = Math.min(Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100), 100);
              await api.put(`/enrollments/${course._id}/progress`, { 
                progress: p,
                watchedDuration: 30 
              });
            } catch (err) {}
          }, 30000);
        }
      }
    };

    const handleEnded = async () => {
      try {
        await api.put(`/enrollments/${course._id}/progress`, { progress: 100 });
        toast({ title: "Skill Session Completed! 🎉" });
      } catch (err) {}
      setShowControls(true);
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('ended', handleEnded);
    v.addEventListener('play', () => { setPlaying(true); setIsBuffering(false); resetHideControlsTimer(); });
    v.addEventListener('pause', () => { setPlaying(false); setShowControls(true); });
    v.addEventListener('loadedmetadata', () => setDuration(v.duration));
    v.addEventListener('waiting', () => setIsBuffering(true));
    v.addEventListener('canplay', () => setIsBuffering(false));
    v.addEventListener('volumechange', () => { setVolume(v.volume); setMuted(v.muted); });

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('ended', handleEnded);
      v.removeEventListener('play', () => setPlaying(true));
      v.removeEventListener('pause', () => setPlaying(false));
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [course, toast]);

  // Loading / Error states
  if (loading) {
    return (
      <div className={`w-full aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border border-border/50 animate-pulse ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50 mb-2" />
      </div>
    );
  }

  if (error || !course) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-border/40 group flex flex-col",
        isDeepLearnMode ? "fixed inset-0 z-50 rounded-none w-full h-screen align-center justify-center bg-black" : "aspect-video",
        isFullscreen && "rounded-none border-none",
        className
      )}
    >
      {/* 
        1. Base Layer: Blurred Video (Removes Black Bars globally) 
        This strictly uses object-cover but is heavily blurred so vertical videos fill frame handsomely!
      */}
      <video
        src={course.videoUrl}
        className="absolute inset-0 w-full h-full object-cover scale-105 opacity-40 blur-2xl pointer-events-none"
        aria-hidden="true"
        ref={(el) => {
          // Sync playback of background fake video silently
          if (el && videoRef.current) {
            el.currentTime = videoRef.current.currentTime;
            el.playbackRate = videoRef.current.playbackRate;
            playing ? el.play() : el.pause();
          }
        }}
        muted
        playsInline
      />

      {/* 2. Main Video Layer: Contain (Crisp Original Resolution centered perfectly) */}
      <video
        ref={videoRef}
        src={course.videoUrl}
        poster={course.thumbnail}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
        className="relative w-full h-full object-contain cursor-pointer z-0"
        playsInline
      />

      {/* 3. Double Tap Skip Animations */}
      <AnimatePresence>
        {skipAction && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: skipAction === 'forward' ? 50 : -50 }}
            animate={{ opacity: 1, scale: 1.2, x: skipAction === 'forward' ? 100 : -100 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className={`absolute top-1/2 -translate-y-1/2 z-10 p-4 bg-black/40 backdrop-blur-sm rounded-full pointer-events-none ${
              skipAction === 'forward' ? 'right-1/4' : 'left-1/4'
            }`}
          >
            {skipAction === 'forward' ? <Forward className="w-10 h-10 text-white" /> : <Rewind className="w-10 h-10 text-white" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
         4. Transparent Side Interceptors for Double Tap Skip UX globally. 
         (YouTube style transparent left/right blocks)
      */}
      <div 
        className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer" 
        onDoubleClick={() => handleSkip(-10)} 
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer" 
        onDoubleClick={() => handleSkip(10)} 
      />

      {/* 5. Custom Controls Layer */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-3 sm:p-5 transition-opacity duration-300 z-20 pointer-events-none",
          showControls || !playing ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        
        {/* Top Bar Area */}
        <div className="relative pt-2 px-2 shrink-0 pointer-events-auto flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg drop-shadow-md line-clamp-1 w-3/4">{course.title}</h2>
          
          <button 
            type="button"
            className="text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors border border-white/10"
            onClick={toggleFocusMode}
          >
            Focus Mode
          </button>
        </div>

        {/* Big Loading Spinner */}
        <div className="flex-1 flex items-center justify-center relative">
          {isBuffering && (
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

        {/* Bottom Controls Wrapper */}
        <div className="relative shrink-0 flex flex-col gap-3 pb-2 px-2 pointer-events-auto">
          <ProgressBar 
            currentTime={currentTime} 
            duration={duration} 
            onSeek={handlePointerSeek} 
          />

          {/* Buttons Row */}
          <div className="flex items-center justify-between mt-1">
            {/* Left Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={togglePlayPause}
                className="text-white hover:text-primary transition-transform hover:scale-110 focus:outline-none"
              >
                {playing ? (
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              <VolumeControl 
                volume={volume} 
                muted={muted} 
                onVolumeChange={changeVolume}
                onToggleMute={toggleMute}
              />

              <div className="text-white/90 text-[13px] font-medium tracking-wide hidden sm:block">
                {formatTime(currentTime)} <span className="text-white/50 mx-1">/</span> {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              <PlaybackSettings 
                playbackRate={playbackRate} 
                onPlaybackRateChange={changePlaybackRate}
              />

              <button 
                onClick={() => setIsDeepLearnMode(!isDeepLearnMode)}
                className="text-white hover:text-primary transition-transform hover:scale-110 focus:outline-none hidden sm:block"
                title="Deep Learn Mode (Theater)"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" ry="2"/></svg>
              </button>

              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-transform hover:scale-110 focus:outline-none"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SkillPlayer);

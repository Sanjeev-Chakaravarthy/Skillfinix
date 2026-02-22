import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
};

const ProgressBar = ({ videoRef }) => {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const pointerRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use requestAnimationFrame for super smooth, non-React-state-bound width updates
    let animationFrameId;
    const updateProgressUI = () => {
       if (video && progressRef.current && pointerRef.current && !isDragging && video.duration > 0) {
         const percent = (video.currentTime / video.duration) * 100;
         progressRef.current.style.width = `${percent}%`;
         pointerRef.current.style.left = `${percent}%`;
       }
       animationFrameId = requestAnimationFrame(updateProgressUI);
    };
    
    // Start animation loop
    updateProgressUI();

    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef, isDragging]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateProgress(e, true);
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current || !videoRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (pos / rect.width) * (videoRef.current.duration || 0);
    
    setHoverPosition(pos);
    setHoverTime(newTime);

    if (isDragging) {
      updateProgress(e, false);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const updateProgress = (e, immediateSeek = false) => {
    if (!containerRef.current || !videoRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (pos / rect.width) * 100;
    const newTime = (pos / rect.width) * (videoRef.current.duration || 0);

    // Update UI instantly
    if (progressRef.current) progressRef.current.style.width = `${percent}%`;
    if (pointerRef.current) pointerRef.current.style.left = `${percent}%`;

    // Seek the video
    if (immediateSeek || isDragging) {
      videoRef.current.currentTime = newTime;
    }
  };

  return (
    <div 
      className="relative w-full h-5 flex items-center group cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { setHoverPosition(null); setHoverTime(null); }}
      ref={containerRef}
    >
      {/* Background Track */}
      <div className="absolute w-full h-1 bg-white/20 rounded-full group-hover:h-[6px] transition-all duration-200" />

      {/* Hover Track */}
      {hoverPosition !== null && (
        <div 
          className="absolute h-1 bg-white/40 rounded-full group-hover:h-[6px] transition-all duration-200" 
          style={{ width: hoverPosition }}
        />
      )}

      {/* Actual Progress Track (updated via ref to avoid state re-renders) */}
      <div 
        ref={progressRef}
        className="absolute h-1 bg-primary rounded-full group-hover:h-[6px] transition-all duration-200 shadow-[0_0_12px_rgba(var(--primary),0.6)]" 
        style={{ width: "0%" }}
      />

      {/* Thumb / Handle (updated via ref) */}
      <div 
        ref={pointerRef}
        className={cn(
          "absolute h-3.5 w-3.5 bg-white rounded-full transition-transform duration-200 -ml-[7px] shadow-sm",
          isDragging || hoverPosition !== null ? "scale-100" : "scale-0"
        )}
        style={{ left: "0%" }}
      />

      {/* Hover Tooltip Preview */}
      {hoverPosition !== null && hoverTime !== null && (
        <div 
          className="absolute bottom-6 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-lg pointer-events-none transition-transform"
          style={{ left: hoverPosition }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressBar);

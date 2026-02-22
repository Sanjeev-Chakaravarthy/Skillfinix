import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
};

const ProgressBar = ({ currentTime, duration, onSeek }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPosition(pos);
    setHoverTime((pos / rect.width) * duration);

    if (isDragging) {
      updateProgress(e);
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

  const updateProgress = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (pos / rect.width) * duration;
    onSeek(newTime);
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
      <div className="absolute w-full h-1 bg-white/20 rounded-full group-hover:h-1.5 transition-all" />

      {/* Hover Track */}
      {hoverPosition !== null && (
        <div 
          className="absolute h-1 bg-white/40 rounded-full group-hover:h-1.5 transition-all" 
          style={{ width: hoverPosition }}
        />
      )}

      {/* Progress Track */}
      <div 
        className="absolute h-1 bg-primary rounded-full group-hover:h-1.5 transition-all shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
        style={{ width: `${progressPercent}%` }}
      />

      {/* Thumb / Handle */}
      <div 
        className={cn(
          "absolute h-3 w-3 bg-white rounded-full transition-transform -ml-1.5",
          isDragging || hoverPosition !== null ? "scale-100" : "scale-0"
        )}
        style={{ left: `${progressPercent}%` }}
      />

      {/* Hover Tooltip */}
      {hoverPosition !== null && hoverTime !== null && (
        <div 
          className="absolute bottom-8 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{ left: hoverPosition }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressBar);
